import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isAcceptedCoachFor, requireOwnProfile } from "@/lib/auth-helpers.server";

/** Categories that can be verified — game moments don't carry official proof. */
export const VERIFIABLE_CATEGORIES = ["award", "certificate", "medal"] as const;

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export const submitHighlightProof = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      highlightId: z.string().uuid(),
      proofPath: z.string().trim().min(1).max(500),
      proofMediaType: z.enum(["photo", "video", "document"]),
      note: z.string().trim().max(500).optional(),
    }),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabase, userId } = context;
    const own = await requireOwnProfile(supabase, userId);

    const { data: highlight } = await supabase
      .from("highlights")
      .select("id, category")
      .eq("id", data.highlightId)
      .eq("profile_id", own.id)
      .maybeSingle();

    if (!highlight) throw new Error("Highlight not found");
    if (!VERIFIABLE_CATEGORIES.includes(highlight.category as (typeof VERIFIABLE_CATEGORIES)[number])) {
      throw new Error("Only awards, certificates, and medals can be verified");
    }

    const { error } = await supabase
      .from("highlights")
      .update({
        proof_url: data.proofPath,
        proof_media_type: data.proofMediaType,
        verification_status: "pending",
        verification_note: data.note?.trim() || null,
        submitted_for_review_at: new Date().toISOString(),
        reviewed_at: null,
        reviewer_name: null,
      })
      .eq("id", data.highlightId)
      .eq("profile_id", own.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Only a coach the athlete invited and who accepted can approve or reject proof. */
export const reviewHighlightProof = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      highlightId: z.string().uuid(),
      decision: z.enum(["verified", "rejected"]),
      reviewerName: z.string().trim().min(1).max(120),
      note: z.string().trim().max(500).optional(),
    }),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabase, userId } = context;

    const { data: highlight } = await supabase
      .from("highlights")
      .select("id, profile_id, verification_status")
      .eq("id", data.highlightId)
      .maybeSingle();

    if (!highlight) throw new Error("Highlight not found");

    const allowed = await isAcceptedCoachFor(supabase, userId, highlight.profile_id);
    if (!allowed) throw new Error("Only an invited coach can review this proof");

    if (highlight.verification_status !== "pending") {
      throw new Error("This highlight has no proof awaiting review");
    }

    const { error } = await supabase
      .from("highlights")
      .update({
        verification_status: data.decision,
        reviewer_name: data.reviewerName.trim(),
        verification_note: data.note?.trim() || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.highlightId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
