/** Media lives in a private bucket, so stored paths are handed out as signed URLs. */
export async function signStoragePath(
  path: string | null,
  expiresInSeconds = 60 * 60 * 24,
): Promise<string | null> {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage
    .from("highlights")
    .createSignedUrl(path, expiresInSeconds);
  return data?.signedUrl ?? path;
}
