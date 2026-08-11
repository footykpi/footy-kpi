import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { InsightsResult } from "./insights.server";

export type { InsightCard, InsightsResult } from "./insights.server";

export const getAiInsights = createServerFn({ method: "POST" })
  .validator(z.object({ profileId: z.string().uuid(), sport: z.string().default("soccer") }))
  .handler(async ({ data }): Promise<InsightsResult> => {
    const { loadGames, computeMetrics, fallbackInsights, generateAiInsights } = await import(
      "./insights.server"
    );

    const games = await loadGames(data.profileId, data.sport);
    const metrics = computeMetrics(games);

    if (games.length === 0) {
      return { metrics, insights: [], generated: "fallback" };
    }

    const ai = await generateAiInsights(metrics);
    return {
      metrics,
      insights: ai ?? fallbackInsights(metrics),
      generated: ai ? "ai" : "fallback",
    };
  });
