import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOwnProfile } from "@/lib/auth-helpers.server";

export interface UnlockLink {
  id: string;
  profile_id: string;
  role: "recruiter" | "coach";
  token: string;
  label: string | null;
  unlock_contact: boolean;
  unlock_game_log: boolean;
  unlock_highlights: boolean;
  expires_at: string | null;
  revoked_at: string | null;
  view_count: number;
  last_viewed_at: string | null;
  created_at: string;
}

function randomToken(role: string): string {
  const raw = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return `${role === "coach" ? "coach" : "rec"}-${raw}`;
}

export const listUnlockLinks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<UnlockLink[]> => {
    const { supabase, userId } = context;
    const own = await requireOwnProfile(supabase, userId);

    const { data: links } = await supabase
      .from("profile_unlock_links")
      .select("*")
      .eq("profile_id", own.id)
      .order("created_at", { ascending: false });

    return (links ?? []) as UnlockLink[];
  });

export const createUnlockLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      role: z.enum(["recruiter", "coach"]),
      label: z.string().trim().max(120).optional(),
      unlock_contact: z.boolean(),
      unlock_game_log: z.boolean(),
      unlock_highlights: z.boolean(),
      expires_at: z.string().trim().min(1).optional(),
    }),
  )
  .handler(async ({ data, context }): Promise<UnlockLink> => {
    const { supabase, userId } = context;
    const own = await requireOwnProfile(supabase, userId);

    const { data: link, error } = await supabase
      .from("profile_unlock_links")
      .insert({
        profile_id: own.id,
        role: data.role,
        token: randomToken(data.role),
        label: data.label?.trim() || null,
        unlock_contact: data.unlock_contact,
        unlock_game_log: data.unlock_game_log,
        unlock_highlights: data.unlock_highlights,
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
      })
      .select("*")
      .single();

    if (error || !link) throw new Error(error?.message ?? "Could not create unlock link");
    return link as UnlockLink;
  });

export const revokeUnlockLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabase, userId } = context;
    const own = await requireOwnProfile(supabase, userId);

    const { error } = await supabase
      .from("profile_unlock_links")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("profile_id", own.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
