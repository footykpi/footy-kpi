import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash, timingSafeEqual } from "node:crypto";

const ACCEPT = "image/*,video/*";

const categorySchema = z.enum(["moment", "award", "certificate", "medal"]);

const uploadHighlightSchema = z.object({
  profileId: z.string().uuid(),
  slug: z.string().trim().min(1).max(120),
  file: z.instanceof(File),
  category: categorySchema,
  title: z.string().trim().max(200).optional(),
  editKey: z.string().min(1),
});

const deleteHighlightSchema = z.object({
  highlightId: z.string().uuid(),
  editKey: z.string().min(1),
});

const uploadProofSchema = z.object({
  highlightId: z.string().uuid(),
  slug: z.string().trim().min(1).max(120),
  file: z.instanceof(File),
  editKey: z.string().min(1),
});

function verifyEditKey(input: string): boolean {
  const expected = process.env['HIGHLIGHT_EDIT_KEY'];
  if (!expected) return false;
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return a.length === b.length && timingSafeEqual(a, b);
}

function requireEditKey(editKey: string): void {
  if (!verifyEditKey(editKey)) {
    throw new Error("Invalid edit key");
  }
}

async function uploadFileToStorage(
  supabase: { storage: { from: (bucket: string) => { upload: (path: string, file: File, options: Record<string, unknown>) => Promise<{ error: Error | null }> } } },
  path: string,
  file: File,
): Promise<void> {
  const { error } = await supabase.storage.from("highlights").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
}

async function removeStorageObject(
  supabase: { storage: { from: (bucket: string) => { remove: (paths: string[]) => Promise<{ error: Error | null }> } } },
  path: string,
): Promise<void> {
  const { error } = await supabase.storage.from("highlights").remove([path]);
  if (error) throw error;
}

export const uploadHighlight = createServerFn({ method: "POST" })
  .validator(uploadHighlightSchema)
  .handler(async ({ data }) => {
    requireEditKey(data.editKey);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const isVideo = data.file.type.startsWith("video/");
    const ext = data.file.name.split(".").pop() ?? "bin";
    const path = `${data.slug}/${crypto.randomUUID()}.${ext}`;

    await uploadFileToStorage(supabaseAdmin, path, data.file);

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("highlights")
      .insert({
        profile_id: data.profileId,
        media_type: isVideo ? "video" : "photo",
        category: data.category,
        title: data.title?.trim() || null,
        url: path,
        sort_order: 0,
      })
      .select("id")
      .single();

    if (insertError) {
      // Try to clean up the orphaned file, but don't throw if that fails.
      await removeStorageObject(supabaseAdmin, path).catch(() => {});
      throw new Error(insertError.message);
    }

    return { id: inserted!.id };
  });

export const deleteHighlight = createServerFn({ method: "POST" })
  .validator(deleteHighlightSchema)
  .handler(async ({ data }) => {
    requireEditKey(data.editKey);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: highlight, error: fetchError } = await supabaseAdmin
      .from("highlights")
      .select("url, thumbnail_url, proof_url")
      .eq("id", data.highlightId)
      .single();

    if (fetchError || !highlight) {
      throw new Error("Highlight not found");
    }

    const paths = [highlight.url, highlight.thumbnail_url, highlight.proof_url].filter(
      (p): p is string => typeof p === "string" && p.length > 0,
    );

    if (paths.length > 0) {
      await supabaseAdmin.storage.from("highlights").remove(paths);
    }

    const { error: deleteError } = await supabaseAdmin.from("highlights").delete().eq("id", data.highlightId);
    if (deleteError) throw new Error(deleteError.message);

    return { ok: true };
  });

export const uploadHighlightProof = createServerFn({ method: "POST" })
  .validator(uploadProofSchema)
  .handler(async ({ data }) => {
    requireEditKey(data.editKey);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: highlight } = await supabaseAdmin
      .from("highlights")
      .select("id, category")
      .eq("id", data.highlightId)
      .maybeSingle();

    if (!highlight) throw new Error("Highlight not found");
    if (!["award", "certificate", "medal"].includes(highlight.category)) {
      throw new Error("Only awards, certificates, and medals can be verified");
    }

    const ext = data.file.name.split(".").pop() ?? "bin";
    const path = `${data.slug}/proof/${crypto.randomUUID()}.${ext}`;
    const proofMediaType = data.file.type.startsWith("video/")
      ? "video"
      : data.file.type.startsWith("image/")
        ? "photo"
        : "document";

    await uploadFileToStorage(supabaseAdmin, path, data.file);

    const { error: updateError } = await supabaseAdmin
      .from("highlights")
      .update({
        proof_url: path,
        proof_media_type: proofMediaType,
        verification_status: "pending",
        submitted_for_review_at: new Date().toISOString(),
        reviewed_at: null,
        reviewer_name: null,
      })
      .eq("id", data.highlightId);

    if (updateError) {
      await removeStorageObject(supabaseAdmin, path).catch(() => {});
      throw new Error(updateError.message);
    }

    return { ok: true };
  });
