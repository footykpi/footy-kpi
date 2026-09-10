import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2 } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { GameLog } from "@/components/GameLog";
import { HighlightsReel } from "@/components/HighlightsReel";
import { ProgressCharts } from "@/components/ProgressCharts";
import { SeasonJournal } from "@/components/SeasonJournal";
import { getMyAccount } from "@/lib/account.functions";
import { getCoachAthlete } from "@/lib/coach.functions";

export const Route = createFileRoute("/_authenticated/coach/$slug")({
  head: () => ({
    meta: [
      { title: "Athlete review | Footy KPI" },
      { name: "description", content: "Review an athlete's season and verify their achievements." },
      { property: "og:title", content: "Athlete review | Footy KPI" },
      { property: "og:description", content: "Review an athlete's season and verify their achievements." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoachAthletePage,
});

function CoachAthletePage() {
  const { slug } = Route.useParams();
  const fetchAccount = useServerFn(getMyAccount);
  const fetchAthlete = useServerFn(getCoachAthlete);

  const { data: account } = useQuery({ queryKey: ["my-account"], queryFn: () => fetchAccount({}) });
  const { data, isLoading, error } = useQuery({
    queryKey: ["coach-athlete", slug],
    queryFn: () => fetchAthlete({ data: { slug } }),
  });

  const games = (data?.games ?? []).filter((g) => g.sport === "soccer");
  const season = (data?.stats ?? []).find((s) => s.sport === "soccer");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader email={account?.email ?? null} />
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <Link
          to="/coach"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All athletes
        </Link>

        {isLoading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading athlete…
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "You don't have access to this athlete."}
          </p>
        )}

        {data && (
          <>
            <div>
              <h1 className="font-display text-4xl text-foreground">
                {data.profile.first_name} {data.profile.last_name}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {[data.profile.team, data.profile.position, data.profile.graduation_year]
                  .filter(Boolean)
                  .join(" · ") || "No details yet"}
              </p>
            </div>

            {season && (
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-2xl text-foreground">Season {season.season}</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Goals", season.goals],
                    ["Assists", season.assists],
                    ["Minutes", season.minutes_played],
                    ["Shots", season.shots],
                    ["Tackles", season.tackles],
                    ["Games", season.games_played],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="rounded-xl bg-surface p-4">
                      <div className="font-display text-3xl text-foreground">
                        {value === null || value === undefined ? "—" : String(value)}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">{String(label)}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <HighlightsReel highlights={data.highlights} mode="coach" />

            <ProgressCharts games={games} />

            <GameLog games={games} />

            <SeasonJournal games={games} />
          </>
        )}
      </main>
    </div>
  );
}
