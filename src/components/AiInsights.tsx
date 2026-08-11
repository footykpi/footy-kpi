import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDownRight, ArrowUpRight, Minus, RefreshCw, Sparkles } from "lucide-react";

import { getAiInsights, type InsightsResult } from "@/lib/insights.functions";

const toneStyles = {
  up: { icon: ArrowUpRight, className: "text-indigo-light" },
  down: { icon: ArrowDownRight, className: "text-destructive" },
  neutral: { icon: Minus, className: "text-muted-foreground" },
} as const;

export function AiInsights({ profileId }: { profileId: string }) {
  const runInsights = useServerFn(getAiInsights);
  const { mutate, data, isPending, isError } = useMutation<InsightsResult>({
    mutationFn: () => runInsights({ data: { profileId, sport: "soccer" } }),
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
          <Sparkles className="h-5 w-5 text-indigo-light" />
          AI Insights
        </h2>
        <button
          type="button"
          onClick={() => mutate()}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          {data ? "Regenerate" : isPending ? "Analyzing…" : "Generate insights"}
        </button>
      </div>

      {!data && !isPending && (
        <p className="mt-3 text-muted-foreground">
          Turn your game log into plain-language takeaways — shooting volume, improvement over the
          season, toughest matchups, passing trends, and your last five games.
        </p>
      )}

      {isPending && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      )}

      {isError && (
        <p className="mt-4 text-sm text-destructive">
          Couldn’t generate insights right now. Try again in a moment.
        </p>
      )}

      {data && data.insights.length === 0 && (
        <p className="mt-4 text-muted-foreground">
          Log a few games and insights will appear here automatically.
        </p>
      )}

      {data && data.insights.length > 0 && (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {data.insights.map((insight) => {
              const tone = toneStyles[insight.tone];
              const Icon = tone.icon;
              return (
                <div key={insight.headline} className="rounded-xl bg-surface p-4">
                  <div className="flex items-start gap-2">
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone.className}`} />
                    <div>
                      <p className="font-display text-xl leading-tight tracking-wide text-foreground">
                        {insight.headline}
                      </p>
                      <p className="mt-1.5 text-sm text-muted-foreground">{insight.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Based on {data.metrics.gamesAnalyzed} logged games
            {data.generated === "fallback" ? " · computed from your stats" : " · AI generated"}
          </p>
        </>
      )}
    </div>
  );
}
