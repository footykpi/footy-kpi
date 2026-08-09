import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Categories that can be verified — game moments don't carry official proof. */
export const VERIFIABLE_CATEGORIES = ["award", "certificate", "medal"] as const;

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export const submitHighlightProof = createServerFn({ method: "POST" })
  .validator(
    z.object({
      highlightId: z.string().uuid(),
      proofPath: z.string().trim().min(1).max(500),
      proofMediaType: z.enum(["photo", "video", "document"]),
      note: z.string().trim().max(500).optional(),
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: highlight } = await supabaseAdmin
      .from("highlights")
      .select("id, category")
      .eq("id", data.highlightId)
      .maybeSingle();

    if (!highlight) throw new Error("Highlight not found");
    if (!VERIFIABLE_CATEGORIES.includes(highlight.category as (typeof VERIFIABLE_CATEGORIES)[number])) {
      throw new Error("Only awards, certificates, and medals can be verified");
    }

    const { error } = await supabaseAdmin
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
      .eq("id", data.highlightId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reviewHighlightProof = createServerFn({ method: "POST" })
  .validator(
    z.object({
      highlightId: z.string().uuid(),
      decision: z.enum(["verified", "rejected"]),
      reviewerName: z.string().trim().min(1).max(120),
      note: z.string().trim().max(500).optional(),
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: highlight } = await supabaseAdmin
      .from("highlights")
      .select("id, verification_status")
      .eq("id", data.highlightId)
      .maybeSingle();

    if (!highlight) throw new Error("Highlight not found");
    if (highlight.verification_status !== "pending") {
      throw new Error("This highlight has no proof awaiting review");
    }

    const { error } = await supabaseAdmin
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
