import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOwnProfile } from "@/lib/auth-helpers.server";
import { signStoragePath } from "@/lib/storage.server";

const MAX_BYTES = 8 * 1024 * 1024;

const uploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.type.startsWith("image/"), "Please choose an image file.")
    .refine((file) => file.size <= MAX_BYTES, "Images must be 8MB or smaller."),
});

/** Athlete uploads their own profile photo from their device. */
export const uploadProfilePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(uploadSchema)
  .handler(async ({ data, context }): Promise<{ path: string; url: string }> => {
    const { supabase, userId } = context;
    const own = await requireOwnProfile(supabase, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ext = (data.file.name.split(".").pop() ?? "jpg").toLowerCase().slice(0, 5);
    const path = `${own.slug}/avatar/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("highlights")
      .upload(path, data.file, { contentType: data.file.type, upsert: false });
    if (uploadError) throw new Error(uploadError.message);

    const { data: existing } = await supabase
      .from("profiles")
      .select("photo_url")
      .eq("id", own.id)
      .maybeSingle();

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ photo_url: path })
      .eq("id", own.id);

    if (updateError) {
      await supabaseAdmin.storage.from("highlights").remove([path]);
      throw new Error(updateError.message);
    }

    const previous = existing?.photo_url;
    if (previous && !/^https?:\/\//.test(previous) && previous !== path) {
      await supabaseAdmin.storage.from("highlights").remove([previous]);
    }

    return { path, url: (await signStoragePath(path)) ?? path };
  });

/** Removes the athlete's photo and its stored file. */
export const removeProfilePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ ok: true }> => {
    const { supabase, userId } = context;
    const own = await requireOwnProfile(supabase, userId);

    const { data: existing } = await supabase
      .from("profiles")
      .select("photo_url")
      .eq("id", own.id)
      .maybeSingle();

    const { error } = await supabase.from("profiles").update({ photo_url: null }).eq("id", own.id);
    if (error) throw new Error(error.message);

    const previous = existing?.photo_url;
    if (previous && !/^https?:\/\//.test(previous)) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.storage.from("highlights").remove([previous]);
    }

    return { ok: true };
  });
