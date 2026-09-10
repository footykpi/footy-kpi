import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const profileInputSchema = z.object({ slug: z.string() });

export interface Profile {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  team: string;
  jersey_number: string | null;
  position: string | null;
  graduation_year: number | null;
  height: string | null;
  weight: string | null;
  dominant_hand: string | null;
  gpa: number | null;
  bio: string | null;
  sport: string;
  visibility: "public" | "private";
  created_at: string;
  updated_at: string;
}

export interface SeasonStats {
  id: string;
  profile_id: string;
  season: string;
  sport: string;
  hits: number | null;
  rbi: number | null;
  batting_average: number | null;
  home_runs: number | null;
  strikeouts: number | null;
  era: number | null;
  wins: number | null;
  saves: number | null;
  stolen_bases: number | null;
  games_played: number | null;
  goals: number | null;
  assists: number | null;
  shots: number | null;
  shots_on_goal: number | null;
  minutes_played: number | null;
  yellow_cards: number | null;
  red_cards: number | null;
  penalty_kicks: number | null;
  pk_saves: number | null;
  clean_sheets: number | null;
  fouls: number | null;
  tackles: number | null;
  interceptions: number | null;
  headers_won: number | null;
  pass_completion: number | null;
  mvp_awards: number | null;
}


export interface Achievement {
  id: string;
  profile_id: string;
  title: string;
  date: string | null;
  description: string | null;
}

export interface GameMedia {
  id: string;
  game_id: string;
  media_type: string;
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  sort_order: number;
}

export interface Game {
  id: string;
  profile_id: string;
  sport: string;
  season: string | null;
  game_date: string;
  opponent: string;
  location: string | null;
  team_score: number | null;
  opponent_score: number | null;
  result: string | null;
  stats: Record<string, number | null>;
  coach_notes: string | null;
  player_reflection: string | null;
  mood: string | null;
  performance_rating: number | null;
  journal_went_well: string | null;
  journal_improve: string | null;
  journal_next_goal: string | null;
  journal_updated_at: string | null;
  media: GameMedia[];

}

export interface Highlight {
  id: string;
  profile_id: string;
  media_type: "photo" | "video";
  category: "moment" | "award" | "certificate" | "medal";
  title: string | null;
  caption: string | null;
  url: string;
  thumbnail_url: string | null;
  highlight_date: string | null;
  sort_order: number;
  is_public: boolean;
  verification_status: "unverified" | "pending" | "verified" | "rejected";
  proof_url: string | null;
  proof_media_type: string | null;
  verification_note: string | null;
  reviewer_name: string | null;
  submitted_for_review_at: string | null;
  reviewed_at: string | null;
}


export type ViewerRole = "public" | "recruiter" | "coach" | "owner";

/** What the current visitor is allowed to see, derived from their unlock link. */
export interface ViewerAccess {
  role: ViewerRole;
  /** Label the athlete gave the unlock link, e.g. "College coaches — fall ID camp". */
  linkLabel: string | null;
  /** Invalid, expired, or revoked key was supplied. */
  invalidKey: boolean;
  contact: boolean;
  gameLog: boolean;
  highlights: boolean;
}

export interface PrivateDetails {
  contact_email: string | null;
  contact_phone: string | null;
  guardian_name: string | null;
  academic_notes: string | null;
}

/** Games shown to everyone without an unlock link. */
const PUBLIC_GAME_LIMIT = 5;

export interface PublicProfile {
  profile: Profile;
  /** True when the athlete keeps the portfolio private: detailed data is withheld. */
  isPrivate: boolean;
  access: ViewerAccess;
  privateDetails: PrivateDetails | null;
  stats: SeasonStats[];
  achievements: Achievement[];
  games: Game[];
  /** Games withheld because the visitor has no game-log unlock. */
  gamesLocked: number;
  highlights: Highlight[];
  /** Highlights withheld because the visitor has no highlight-library unlock. */
  highlightsLocked: number;
}


function createPublishableClient() {
  return createClient(
    process.env['SUPABASE_URL']!,
    process.env['SUPABASE_PUBLISHABLE_KEY']!,
    {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

type PublishableClient = ReturnType<typeof createPublishableClient>;

async function signHighlightUrl(path: string): Promise<string> {
  if (/^https?:\/\//.test(path)) return path;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage
    .from("highlights")
    .createSignedUrl(path, 60 * 60 * 24);
  return data?.signedUrl ?? path;
}


const PUBLIC_ACCESS: ViewerAccess = {
  role: "public",
  linkLabel: null,
  invalidKey: false,
  contact: false,
  gameLog: false,
  highlights: false,
};

/**
 * The signed-in athlete's own portfolio — nothing is hidden from the owner, even
 * while their profile is private. The public view stays gated in getPublicProfile.
 */
export const getMyPortfolio = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PublicProfile> => {
    const { supabase, userId } = context;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!profile) throw new Response("Profile not found", { status: 404 });

    const [{ data: stats }, { data: achievements }, { data: allGames }, { data: allHighlights }] =
      await Promise.all([
        supabase
          .from("season_stats")
          .select("*")
          .eq("profile_id", profile.id)
          .order("season", { ascending: false }),
        supabase
          .from("achievements")
          .select("*")
          .eq("profile_id", profile.id)
          .order("date", { ascending: false }),
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

    const highlights: Highlight[] = await Promise.all(
      ((allHighlights ?? []) as Highlight[]).map(async (row) => ({
        ...row,
        url: await signHighlightUrl(row.url),
        thumbnail_url: row.thumbnail_url ? await signHighlightUrl(row.thumbnail_url) : null,
        proof_url: row.proof_url ? await signHighlightUrl(row.proof_url) : null,
      })),
    );

    const games: Game[] = ((allGames ?? []) as Record<string, unknown>[]).map((row) => {
      const { game_media, ...game } = row as Record<string, unknown> & {
        game_media?: GameMedia[];
      };
      return {
        ...(game as unknown as Omit<Game, "media">),
        media: [...(game_media ?? [])].sort((a, b) => a.sort_order - b.sort_order),
      };
    });

    return {
      profile: {
        ...(profile as unknown as Profile),
        photo_url: profile.photo_url ? await signHighlightUrl(profile.photo_url) : null,
      } as Profile,
      isPrivate: (profile as { visibility?: string }).visibility === "private",
      access: { role: "owner", linkLabel: null, invalidKey: false, contact: true, gameLog: true, highlights: true },
      privateDetails: null,
      stats: (stats ?? []) as SeasonStats[],
      achievements: (achievements ?? []) as Achievement[],
      games,
      gamesLocked: 0,
      highlights,
      highlightsLocked: 0,
    };
  });

export const getPublicProfile = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string(), key: z.string().trim().max(120).optional() }))
  .handler(async ({ data }): Promise<PublicProfile> => {
    // Game notes, private details, and unlock tokens are server-role only.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");


    // Private profiles are not readable by anon (RLS), so the lookup runs server-side;
    // the teaser branch below is what limits what actually leaves the server.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("slug", data.slug)
      .single();

    if (profileError || !profile) {
      throw new Response("Profile not found", { status: 404 });
    }

    // Uploaded photos live in the private bucket: hand out a signed URL.
    const signedProfile = {
      ...(profile as unknown as Profile),
      photo_url: profile.photo_url ? await signHighlightUrl(profile.photo_url) : null,
    } as Profile;


    // Resolve the visitor's role from their unlock link.
    let access: ViewerAccess = PUBLIC_ACCESS;
    if (data.key) {
      const { data: link } = await supabaseAdmin
        .from("profile_unlock_links")
        .select("*")
        .eq("token", data.key)
        .eq("profile_id", profile.id)
        .maybeSingle();

      const usable =
        link &&
        !link.revoked_at &&
        (!link.expires_at || new Date(link.expires_at).getTime() > Date.now());

      if (usable && link) {
        access = {
          role: link.role as ViewerRole,
          linkLabel: link.label,
          invalidKey: false,
          contact: link.unlock_contact,
          gameLog: link.unlock_game_log,
          highlights: link.unlock_highlights,
        };
        await supabaseAdmin
          .from("profile_unlock_links")
          .update({ view_count: link.view_count + 1, last_viewed_at: new Date().toISOString() })
          .eq("id", link.id);
      } else {
        access = { ...PUBLIC_ACCESS, invalidKey: true };
      }
    }

    const isPrivate = (profile as { visibility?: string }).visibility === "private";
    const unlocked = access.role !== "public";

    if (isPrivate && !unlocked) {
      // Teaser only — no stats, games, media, or achievements leave the server.
      return {
        profile: signedProfile,
        isPrivate: true,
        access,
        privateDetails: null,
        stats: [],
        achievements: [],
        games: [],
        gamesLocked: 0,
        highlights: [],
        highlightsLocked: 0,
      };
    }

    const [{ data: stats }, { data: achievements }, { data: allGames }, { data: allHighlights }] =
      await Promise.all([
        supabaseAdmin
          .from("season_stats")
          .select("*")
          .eq("profile_id", profile.id)
          .order("season", { ascending: false }),
        supabaseAdmin
          .from("achievements")
          .select("*")
          .eq("profile_id", profile.id)
          .order("date", { ascending: false }),
        supabaseAdmin
          .from("games")
          .select("*, game_media(*)")
          .eq("profile_id", profile.id)
          .order("game_date", { ascending: false }),
        supabaseAdmin
          .from("highlights")
          .select("*")
          .eq("profile_id", profile.id)
          .order("sort_order", { ascending: true }),
      ]);

    let privateDetails: PrivateDetails | null = null;
    if (access.contact) {
      const { data: details } = await supabaseAdmin
        .from("profile_private_details")
        .select("contact_email, contact_phone, guardian_name, academic_notes")
        .eq("profile_id", profile.id)
        .maybeSingle();
      privateDetails = (details as PrivateDetails | null) ?? null;
    }

    // Highlight library: only the athlete's public picks unless unlocked.
    const highlightRows = ((allHighlights ?? []) as Highlight[]).filter(
      (row) => access.highlights || row.is_public,
    );
    const highlightsLocked = (allHighlights ?? []).length - highlightRows.length;

    // Highlight media lives in a private bucket: hand out short-lived signed URLs.
    const highlights: Highlight[] = await Promise.all(
      highlightRows.map(async (row) => ({
        ...row,
        url: await signHighlightUrl(row.url),
        thumbnail_url: row.thumbnail_url
          ? await signHighlightUrl(row.thumbnail_url)
          : null,
        proof_url: row.proof_url ? await signHighlightUrl(row.proof_url) : null,
      })),
    );



    const gameRows = (allGames ?? []) as Record<string, unknown>[];
    const visibleGames = access.gameLog ? gameRows : gameRows.slice(0, PUBLIC_GAME_LIMIT);
    const gameList: Game[] = visibleGames.map((row) => {
      const { game_media, ...game } = row as Record<string, unknown> & {
        game_media?: GameMedia[];
      };
      const base = {
        ...(game as unknown as Omit<Game, "media">),
        media: [...(game_media ?? [])].sort((a, b) => a.sort_order - b.sort_order),
      };
      // Coach notes, reflections, mood, and ratings are unlock-only.
      return access.gameLog
        ? base
        : { ...base, coach_notes: null, player_reflection: null, mood: null, performance_rating: null };
    });

    return {
      profile: signedProfile,
      isPrivate,
      access,
      privateDetails,
      stats: (stats ?? []) as SeasonStats[],
      achievements: (achievements ?? []) as Achievement[],
      games: gameList,
      gamesLocked: gameRows.length - visibleGames.length,
      highlights,
      highlightsLocked,
    };
  });

