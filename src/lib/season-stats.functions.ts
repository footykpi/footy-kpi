import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const countField = z.number().int().min(0).max(100000).nullable();

export const SOCCER_STAT_FIELDS = [
  "games_played",
  "goals",
  "assists",
  "shots",
  "shots_on_goal",
  "minutes_played",
  "yellow_cards",
  "red_cards",
  "penalty_kicks",
  "pk_saves",
  "saves",
  "clean_sheets",
  "fouls",
  "tackles",
  "interceptions",
  "headers_won",
  "mvp_awards",
] as const;

export type SoccerStatField = (typeof SOCCER_STAT_FIELDS)[number];

const statsSchema = z.object({
  profileId: z.string().uuid(),
  season: z.string().trim().min(2).max(20),
  games_played: countField,
  goals: countField,
  assists: countField,
  shots: countField,
  shots_on_goal: countField,
  minutes_played: countField,
  yellow_cards: countField,
  red_cards: countField,
  penalty_kicks: countField,
  pk_saves: countField,
  saves: countField,
  clean_sheets: countField,
  fouls: countField,
  tackles: countField,
  interceptions: countField,
  headers_won: countField,
  mvp_awards: countField,
  pass_completion: z.number().min(0).max(100).nullable(),
});

export const saveSeasonStats = createServerFn({ method: "POST" })
  .validator(statsSchema)
  .handler(async ({ data }): Promise<{ ok: true; id: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { profileId, season, ...values } = data;

    const row = { ...values, profile_id: profileId, season, sport: "soccer" };

    const { data: existing } = await supabaseAdmin
      .from("season_stats")
      .select("id")
      .eq("profile_id", profileId)
      .eq("sport", "soccer")
      .eq("season", season)
      .maybeSingle();

    if (existing) {
      const { error } = await supabaseAdmin
        .from("season_stats")
        .update(row)
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: existing.id };
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("season_stats")
      .insert(row)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: inserted.id };
  });
