import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOwnProfile } from "@/lib/auth-helpers.server";

const entrySchema = z.object({
  gameId: z.string().uuid(),
  wentWell: z.string().trim().max(2000),
  improve: z.string().trim().max(2000),
  nextGoal: z.string().trim().max(2000),
  mood: z.string().trim().max(40).optional(),
});

/** Saves (or clears) the post-game journal answers for one of the athlete's own games. */
export const saveGameJournal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(entrySchema)
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabase, userId } = context;
    const own = await requireOwnProfile(supabase, userId);

    const { error } = await supabase
      .from("games")
      .update({
        journal_went_well: data.wentWell || null,
        journal_improve: data.improve || null,
        journal_next_goal: data.nextGoal || null,
        journal_updated_at: new Date().toISOString(),
        ...(data.mood ? { mood: data.mood } : {}),
      })
      .eq("id", data.gameId)
      .eq("profile_id", own.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
