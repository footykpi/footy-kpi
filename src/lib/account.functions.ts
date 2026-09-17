import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AccountRole = "athlete" | "coach" | "recruiter";

export interface MyAccount {
  userId: string;
  email: string | null;
  role: AccountRole | null;
  /** Slug of the athlete's own profile, when they have one. */
  profileSlug: string | null;
  profileId: string | null;
}

const roleSchema = z.enum(["athlete", "coach", "recruiter"]);

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

/** Role + profile for the signed-in user, used to route them to the right dashboard. */
export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyAccount> => {
    const { supabase, userId, claims } = context;

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, slug")
      .eq("user_id", userId)
      .maybeSingle();

    return {
      userId,
      email: (claims as { email?: string }).email ?? null,
      role: (roleRow?.role as AccountRole | undefined) ?? null,
      profileSlug: profile?.slug ?? null,
      profileId: profile?.id ?? null,
    };
  });

/**
 * Stores the role the user picked at sign-up. Only runs once — an existing role
 * is never overwritten from the client.
 */
export const claimRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ role: roleSchema, fullName: z.string().trim().max(120).optional() }))
  .handler(async ({ data, context }): Promise<{ role: AccountRole }> => {
    const { userId, claims } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) return { role: existing.role as AccountRole };

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: data.role });
    if (error) throw new Error(error.message);

    // Coaches accept invites addressed to their email — attach them now.
    const email = (claims as { email?: string }).email ?? null;
    if (data.role === "coach" && email) {
      await supabaseAdmin
        .from("coach_links")
        .update({ coach_user_id: userId })
        .is("coach_user_id", null)
        .ilike("coach_email", email);
    }

    if (data.role === "athlete") {
      const name = (data.fullName ?? email?.split("@")[0] ?? "athlete").trim();
      const [first, ...rest] = name.split(/\s+/);
      const base = slugify(name) || "athlete";
      let slug = base;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const { data: taken } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (!taken) break;
        slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
      }

      await supabaseAdmin.from("profiles").insert({
        user_id: userId,
        slug,
        first_name: first || "Athlete",
        last_name: rest.join(" ") || "",
        team: "",
        sport: "soccer",
        visibility: "private",
      });
    }

    return { role: data.role };
  });

const profileSchema = z.object({
  first_name: z.string().trim().min(1).max(60),
  last_name: z.string().trim().max(60),
  team: z.string().trim().max(120),
  jersey_number: z.string().trim().max(10).nullable(),
  position: z.string().trim().max(60).nullable(),
  graduation_year: z.string().trim().max(10).nullable(),
  height: z.string().trim().max(20).nullable(),
  weight: z.string().trim().max(20).nullable(),
  dominant_hand: z.string().trim().max(20).nullable(),
  gpa: z.string().trim().max(10).nullable(),
  bio: z.string().trim().max(2000).nullable(),
  // photo_url is set only by the photo upload flow, never from this form.
  visibility: z.enum(["public", "private"]),
});

/** Athlete saves their own profile details. RLS keeps this to their own row. */
export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(profileSchema)
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("profiles").update(data).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Permanently deletes the signed-in user: their profile and every row that hangs
 * off it, their uploaded media, their coach links, their role, and the auth user.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ ok: true }> => {
    const { userId, claims } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, slug")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile) {
      // Uploaded photos and videos live under the athlete's slug prefix.
      const paths: string[] = [];
      const walk = async (prefix: string): Promise<void> => {
        const { data: entries } = await supabaseAdmin.storage
          .from("highlights")
          .list(prefix, { limit: 1000 });
        for (const entry of entries ?? []) {
          const full = prefix ? `${prefix}/${entry.name}` : entry.name;
          if (entry.id) paths.push(full);
          else await walk(full);
        }
      };
      await walk(profile.slug);
      if (paths.length > 0) {
        await supabaseAdmin.storage.from("highlights").remove(paths);
      }

      const { data: games } = await supabaseAdmin
        .from("games")
        .select("id")
        .eq("profile_id", profile.id);
      const gameIds = (games ?? []).map((game) => game.id);
      if (gameIds.length > 0) {
        await supabaseAdmin.from("game_media").delete().in("game_id", gameIds);
      }

      await supabaseAdmin.from("games").delete().eq("profile_id", profile.id);
      await supabaseAdmin.from("highlights").delete().eq("profile_id", profile.id);
      await supabaseAdmin.from("achievements").delete().eq("profile_id", profile.id);
      await supabaseAdmin.from("season_stats").delete().eq("profile_id", profile.id);
      await supabaseAdmin.from("profile_private_details").delete().eq("profile_id", profile.id);
      await supabaseAdmin.from("profile_unlock_links").delete().eq("profile_id", profile.id);
      await supabaseAdmin.from("coach_links").delete().eq("athlete_profile_id", profile.id);
      await supabaseAdmin.from("profiles").delete().eq("id", profile.id);
    }

    // Invites that named this user as the coach.
    await supabaseAdmin.from("coach_links").delete().eq("coach_user_id", userId);
    const email = (claims as { email?: string }).email;
    if (email) {
      await supabaseAdmin.from("coach_links").delete().ilike("coach_email", email);
    }

    await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);

    return { ok: true };
  });
