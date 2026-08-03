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
  hits: number;
  rbi: number;
  batting_average: number | null;
  home_runs: number;
  strikeouts: number;
  era: number | null;
  wins: number;
  saves: number;
  stolen_bases: number;
  games_played: number;
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
  .inputValidator((data) => profileInputSchema.parse(data))
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
