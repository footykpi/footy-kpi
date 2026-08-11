import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const entrySchema = z.object({
  gameId: z.string().uuid(),
  wentWell: z.string().trim().max(2000),
  improve: z.string().trim().max(2000),
  nextGoal: z.string().trim().max(2000),
  mood: z.string().trim().max(40).optional(),
});

/** Saves (or clears) the post-game journal answers for one game. */
export const saveGameJournal = createServerFn({ method: "POST" })
  .validator(entrySchema)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("games")
      .update({
        journal_went_well: data.wentWell || null,
        journal_improve: data.improve || null,
        journal_next_goal: data.nextGoal || null,
        journal_updated_at: new Date().toISOString(),
        ...(data.mood ? { mood: data.mood } : {}),
      })
      .eq("id", data.gameId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
