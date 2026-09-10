import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOwnProfile } from "@/lib/auth-helpers.server";

const optionalInt = (max: number) =>
  z.number().int().min(0).max(max).nullable().optional();

const gameSchema = z.object({
  gameDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a game date"),
  opponent: z.string().trim().min(1, "Who did you play?").max(120),
  location: z.string().trim().max(160).optional(),
  season: z.string().trim().max(20).optional(),
  teamScore: optionalInt(99),
  opponentScore: optionalInt(99),
  performanceRating: z.number().int().min(1).max(5).nullable().optional(),
  mood: z.string().trim().max(40).optional(),
  coachNotes: z.string().trim().max(2000).optional(),
  playerReflection: z.string().trim().max(2000).optional(),
  stats: z.record(z.string(), z.number().nullable()).optional(),
});

function resultFor(team: number | null | undefined, opponent: number | null | undefined) {
  if (team === null || team === undefined || opponent === null || opponent === undefined) return null;
  if (team > opponent) return "W";
  if (team < opponent) return "L";
  return "D";
}

/** Adds a game to the signed-in athlete's own game log. */
export const addGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(gameSchema)
  .handler(async ({ data, context }): Promise<{ ok: true; id: string }> => {
    const { supabase, userId } = context;
    const own = await requireOwnProfile(supabase, userId);

    const stats = Object.fromEntries(
      Object.entries(data.stats ?? {}).filter(
        ([, value]) => value !== null && value !== undefined && !Number.isNaN(value),
      ),
    );

    const { data: row, error } = await supabase
      .from("games")
      .insert({
        profile_id: own.id,
        sport: "soccer",
        game_date: data.gameDate,
        opponent: data.opponent,
        location: data.location || null,
        season: data.season || null,
        team_score: data.teamScore ?? null,
        opponent_score: data.opponentScore ?? null,
        result: resultFor(data.teamScore, data.opponentScore),
        performance_rating: data.performanceRating ?? null,
        mood: data.mood || null,
        coach_notes: data.coachNotes || null,
        player_reflection: data.playerReflection || null,
        stats,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

/** Removes one of the athlete's own games. */
export const deleteGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabase, userId } = context;
    const own = await requireOwnProfile(supabase, userId);

    const { error } = await supabase
      .from("games")
      .delete()
      .eq("id", data.id)
      .eq("profile_id", own.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
