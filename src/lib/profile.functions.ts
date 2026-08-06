import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

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
}

export interface PublicProfile {
  profile: Profile;
  /** True when the athlete keeps the portfolio private: detailed data is withheld. */
  isPrivate: boolean;
  stats: SeasonStats[];
  achievements: Achievement[];
  games: Game[];
  highlights: Highlight[];
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

async function signHighlightUrl(client: PublishableClient, path: string): Promise<string> {
  if (/^https?:\/\//.test(path)) return path;
  const { data } = await client.storage
    .from("highlights")
    .createSignedUrl(path, 60 * 60 * 24);
  return data?.signedUrl ?? path;
}

export const getPublicProfile = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }): Promise<PublicProfile> => {
    const supabase = createPublishableClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("slug", data.slug)
      .single();

    if (profileError || !profile) {
      throw new Response("Profile not found", { status: 404 });
    }

    const isPrivate = (profile as { visibility?: string }).visibility === "private";

    if (isPrivate) {
      // Teaser only — no stats, games, media, or achievements leave the server.
      return {
        profile: profile as Profile,
        isPrivate: true,
        stats: [],
        achievements: [],
        games: [],
        highlights: [],
      };
    }

    const [{ data: stats }, { data: achievements }, { data: games }, { data: highlightRows }] = await Promise.all([
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

    // Highlight media lives in a private bucket: hand out short-lived signed URLs.
    const highlights: Highlight[] = await Promise.all(
      ((highlightRows ?? []) as Highlight[]).map(async (row) => ({
        ...row,
        url: await signHighlightUrl(supabase, row.url),
        thumbnail_url: row.thumbnail_url
          ? await signHighlightUrl(supabase, row.thumbnail_url)
          : null,
      })),
    );

    const gameList: Game[] = (games ?? []).map((row: Record<string, unknown>) => {
      const { game_media, ...game } = row as Record<string, unknown> & {
        game_media?: GameMedia[];
      };
      return {
        ...(game as unknown as Omit<Game, "media">),
        media: [...(game_media ?? [])].sort((a, b) => a.sort_order - b.sort_order),
      };
    });

    return {
      profile: profile as Profile,
      isPrivate: false,
      stats: (stats ?? []) as SeasonStats[],
      achievements: (achievements ?? []) as Achievement[],
      games: gameList,
      highlights,
    };
  });
