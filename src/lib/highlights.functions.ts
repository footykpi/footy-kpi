import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOwnProfile } from "@/lib/auth-helpers.server";

const categorySchema = z.enum(["moment", "award", "certificate", "medal"]);

const deleteHighlightSchema = z.object({ highlightId: z.string().uuid() });

/** Files must travel as FormData: File objects can't cross the RPC serializer. */
function parseUploadForm(data: unknown) {
  if (!(data instanceof FormData)) throw new Error("Expected form data");
  const file = data.get("file");
  if (!(file instanceof File)) throw new Error("Please choose a file to upload.");
  const title = data.get("title");
  return {
    file,
    category: categorySchema.parse(data.get("category")),
    title: typeof title === "string" && title.trim() ? title.trim().slice(0, 200) : undefined,
  };
}

function parseProofForm(data: unknown) {
  if (!(data instanceof FormData)) throw new Error("Expected form data");
  const file = data.get("file");
  if (!(file instanceof File)) throw new Error("Please choose a file to upload.");
  return {
    file,
    highlightId: z.string().uuid().parse(data.get("highlightId")),
  };
}

type StorageClient = {
  storage: {
    from: (bucket: string) => {
      upload: (path: string, file: File, options: Record<string, unknown>) => Promise<{ error: Error | null }>;
      remove: (paths: string[]) => Promise<{ error: Error | null }>;
    };
  };
};

async function uploadFileToStorage(supabase: StorageClient, path: string, file: File): Promise<void> {
  const { error } = await supabase.storage.from("highlights").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
}

async function removeStorageObject(supabase: StorageClient, path: string): Promise<void> {
  const { error } = await supabase.storage.from("highlights").remove([path]);
  if (error) throw error;
}

export const uploadHighlight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(parseUploadForm)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const own = await requireOwnProfile(supabase, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const isVideo = data.file.type.startsWith("video/");
    const ext = data.file.name.split(".").pop() ?? "bin";
    const path = `${own.slug}/${crypto.randomUUID()}.${ext}`;

    await uploadFileToStorage(supabaseAdmin as unknown as StorageClient, path, data.file);

    const { data: maxSortRow } = await supabase
      .from("highlights")
      .select("sort_order")
      .eq("profile_id", own.id)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextSortOrder = (maxSortRow?.sort_order ?? 0) + 1;

    const { data: inserted, error: insertError } = await supabase
      .from("highlights")
      .insert({
        profile_id: own.id,
        media_type: isVideo ? "video" : "photo",
        category: data.category,
        title: data.title?.trim() || null,
        url: path,
        sort_order: nextSortOrder,
      })
      .select("id")
      .single();

    if (insertError) {
      await removeStorageObject(supabaseAdmin as unknown as StorageClient, path).catch(() => {});
      throw new Error(insertError.message);
    }

    return { id: inserted!.id };
  });

export const deleteHighlight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(deleteHighlightSchema)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const own = await requireOwnProfile(supabase, userId);

    const { data: highlight, error: fetchError } = await supabase
      .from("highlights")
      .select("url, thumbnail_url, proof_url")
      .eq("id", data.highlightId)
      .eq("profile_id", own.id)
      .single();

    if (fetchError || !highlight) throw new Error("Highlight not found");

    const paths = [highlight.url, highlight.thumbnail_url, highlight.proof_url].filter(
      (p): p is string => typeof p === "string" && p.length > 0 && !/^https?:\/\//.test(p),
    );

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (paths.length > 0) {
      await supabaseAdmin.storage.from("highlights").remove(paths);
    }

    const { error: deleteError } = await supabase
      .from("highlights")
      .delete()
      .eq("id", data.highlightId)
      .eq("profile_id", own.id);
    if (deleteError) throw new Error(deleteError.message);

    return { ok: true };
  });

export const uploadHighlightProof = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(parseProofForm)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const own = await requireOwnProfile(supabase, userId);

    const { data: highlight } = await supabase
      .from("highlights")
      .select("id, category")
      .eq("id", data.highlightId)
      .eq("profile_id", own.id)
      .maybeSingle();

    if (!highlight) throw new Error("Highlight not found");
    if (!["award", "certificate", "medal"].includes(highlight.category)) {
      throw new Error("Only awards, certificates, and medals can be verified");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ext = data.file.name.split(".").pop() ?? "bin";
    const path = `${own.slug}/proof/${crypto.randomUUID()}.${ext}`;
    const proofMediaType = data.file.type.startsWith("video/")
      ? "video"
      : data.file.type.startsWith("image/")
        ? "photo"
        : "document";

    await uploadFileToStorage(supabaseAdmin as unknown as StorageClient, path, data.file);

    const { error: updateError } = await supabase
      .from("highlights")
      .update({
        proof_url: path,
        proof_media_type: proofMediaType,
        verification_status: "pending",
        submitted_for_review_at: new Date().toISOString(),
        reviewed_at: null,
        reviewer_name: null,
      })
      .eq("id", data.highlightId)
      .eq("profile_id", own.id);

    if (updateError) {
      await removeStorageObject(supabaseAdmin as unknown as StorageClient, path).catch(() => {});
      throw new Error(updateError.message);
    }

    return { ok: true };
  });
