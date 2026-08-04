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

export interface PublicProfile {
  profile: Profile;
  stats: SeasonStats[];
  achievements: Achievement[];
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

    const [{ data: stats }, { data: achievements }] = await Promise.all([
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
    ]);

    return {
      profile: profile as Profile,
      stats: (stats ?? []) as SeasonStats[],
      achievements: (achievements ?? []) as Achievement[],
    };
  });
