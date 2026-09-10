import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOwnProfile, isAcceptedCoachFor } from "@/lib/auth-helpers.server";
import type { Game, Highlight, Profile, SeasonStats } from "@/lib/profile.functions";

export type LinkStatus = "pending" | "accepted" | "declined";

export interface CoachLink {
  id: string;
  athlete_profile_id: string;
  coach_user_id: string | null;
  coach_email: string;
  status: LinkStatus;
  created_at: string;
  responded_at: string | null;
}

export interface CoachAthleteSummary {
  linkId: string;
  status: LinkStatus;
  profileId: string;
  slug: string;
  firstName: string;
  lastName: string;
  team: string | null;
  position: string | null;
  graduationYear: string | null;
  photoUrl: string | null;
  pendingProofs: number;
}

export interface CoachAthleteDetail {
  profile: Profile;
  stats: SeasonStats[];
  games: Game[];
  highlights: Highlight[];
}

/* ------------------------------- athlete side ------------------------------ */

export const listMyCoaches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CoachLink[]> => {
    const { supabase, userId } = context;
    const profile = await requireOwnProfile(supabase, userId);

    const { data } = await supabase
      .from("coach_links")
      .select("*")
      .eq("athlete_profile_id", profile.id)
      .order("created_at", { ascending: false });

    return (data ?? []) as CoachLink[];
  });

export const inviteCoach = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ email: z.string().trim().email().max(200) }))
  .handler(async ({ data, context }): Promise<CoachLink> => {
    const { supabase, userId } = context;
    const profile = await requireOwnProfile(supabase, userId);
    const email = data.email.toLowerCase();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Attach the coach's account immediately when they already have one.
    const { data: coachRole } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "coach");
    let coachUserId: string | null = null;
    if ((coachRole ?? []).length > 0) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
      const match = users?.users.find((u) => (u.email ?? "").toLowerCase() === email);
      if (match && (coachRole ?? []).some((r) => r.user_id === match.id)) coachUserId = match.id;
    }

    const { data: link, error } = await supabase
      .from("coach_links")
      .upsert(
        {
          athlete_profile_id: profile.id,
          coach_email: email,
          coach_user_id: coachUserId,
          status: "pending",
          responded_at: null,
        },
        { onConflict: "athlete_profile_id,coach_email" },
      )
      .select("*")
      .single();

    if (error || !link) throw new Error(error?.message ?? "Could not send the invite.");
    return link as CoachLink;
  });

export const removeCoachLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabase, userId } = context;
    const profile = await requireOwnProfile(supabase, userId);
    const { error } = await supabase
      .from("coach_links")
      .delete()
      .eq("id", data.id)
      .eq("athlete_profile_id", profile.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* -------------------------------- coach side ------------------------------- */

/** Every athlete who invited the signed-in coach, pending invites included. */
export const listCoachAthletes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CoachAthleteSummary[]> => {
    const { supabase, userId, claims } = context;
    const email = ((claims as { email?: string }).email ?? "").toLowerCase();

    // Claim any invite that was addressed to this coach's email before they signed up.
    if (email) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("coach_links")
        .update({ coach_user_id: userId })
        .is("coach_user_id", null)
        .ilike("coach_email", email);
    }

    const { data: links } = await supabase
      .from("coach_links")
      .select("*")
      .order("created_at", { ascending: false });

    const rows = (links ?? []) as CoachLink[];
    if (rows.length === 0) return [];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, slug, first_name, last_name, team, position, graduation_year, photo_url")
      .in(
        "id",
        rows.map((r) => r.athlete_profile_id),
      );

    const { data: pending } = await supabase
      .from("highlights")
      .select("profile_id")
      .eq("verification_status", "pending");

    return rows.flatMap((link) => {
      const profile = (profiles ?? []).find((p) => p.id === link.athlete_profile_id);
      if (!profile) return [];
      return [
        {
          linkId: link.id,
          status: link.status,
          profileId: profile.id,
          slug: profile.slug,
          firstName: profile.first_name,
          lastName: profile.last_name,
          team: profile.team,
          position: profile.position,
          graduationYear: profile.graduation_year,
          photoUrl: profile.photo_url,
          pendingProofs: (pending ?? []).filter((h) => h.profile_id === profile.id).length,
        },
      ];
    });
  });

export const respondToInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid(), decision: z.enum(["accepted", "declined"]) }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("coach_links")
      .update({
        status: data.decision,
        coach_user_id: userId,
        responded_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Full athlete record for a coach who has accepted that athlete's invite. */
export const getCoachAthlete = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ slug: z.string().trim().min(1).max(120) }))
  .handler(async ({ data, context }): Promise<CoachAthleteDetail> => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();

    if (!profile) throw new Error("Athlete not found.");

    const allowed = await isAcceptedCoachFor(supabase, userId, profile.id);
    if (!allowed) throw new Error("You don't have access to this athlete yet.");

    const [{ data: stats }, { data: games }, { data: highlights }] = await Promise.all([
      supabase.from("season_stats").select("*").eq("profile_id", profile.id),
      supabase
        .from("games")
        .select("*, game_media(*)")
        .eq("profile_id", profile.id)
        .order("game_date", { ascending: false }),
      supabase
        .from("highlights")
        .select("*")
        .eq("profile_id", profile.id)
        .order("sort_order", { ascending: true }),
    ]);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    async function sign(path: string | null): Promise<string | null> {
      if (!path) return null;
      if (/^https?:\/\//.test(path)) return path;
      const { data: signed } = await supabaseAdmin.storage
        .from("highlights")
        .createSignedUrl(path, 60 * 60 * 6);
      return signed?.signedUrl ?? path;
    }

    const signedHighlights = await Promise.all(
      ((highlights ?? []) as Highlight[]).map(async (row) => ({
        ...row,
        url: (await sign(row.url)) ?? row.url,
        thumbnail_url: await sign(row.thumbnail_url),
        proof_url: await sign(row.proof_url),
      })),
    );

    const gameList = ((games ?? []) as Record<string, unknown>[]).map((row) => {
      const { game_media, ...game } = row as Record<string, unknown> & { game_media?: Game["media"] };
      return {
        ...(game as unknown as Omit<Game, "media">),
        media: [...(game_media ?? [])].sort((a, b) => a.sort_order - b.sort_order),
      };
    });

    return {
      profile: profile as unknown as Profile,
      stats: (stats ?? []) as unknown as SeasonStats[],
      games: gameList,
      highlights: signedHighlights,
    };
  });
