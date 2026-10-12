import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2 } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { GameLog } from "@/components/GameLog";
import { HighlightsReel } from "@/components/HighlightsReel";
import { ProgressCharts } from "@/components/ProgressCharts";
import { SeasonJournal } from "@/components/SeasonJournal";
import { SeasonStatsBreakdown } from "@/components/SeasonStatsBreakdown";
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
            <section className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 sm:flex-row">
              {data.profile.photo_url ? (
                <img
                  src={data.profile.photo_url}
                  alt={`${data.profile.first_name} ${data.profile.last_name}`}
                  className="h-32 w-32 shrink-0 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl bg-surface font-display text-4xl text-muted-foreground">
                  {data.profile.first_name?.[0]}
                  {data.profile.last_name?.[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-4xl text-foreground">
                  {data.profile.first_name} {data.profile.last_name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[data.profile.team, data.profile.position, data.profile.jersey_number && `#${data.profile.jersey_number}`]
                    .filter(Boolean)
                    .join(" · ") || "No details yet"}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  {[
                    ["Class of", data.profile.graduation_year],
                    ["Height", data.profile.height],
                    ["Weight", data.profile.weight],
                    ["Dominant foot", data.profile.dominant_hand],
                    ["GPA", data.profile.gpa],
                  ]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div key={String(label)} className="rounded-xl bg-surface px-3 py-2">
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="font-semibold text-foreground">{value}</dd>
                      </div>
                    ))}
                </dl>
                {data.profile.bio && (
                  <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">{data.profile.bio}</p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-2xl text-foreground">
                {season ? `Season ${season.season}` : "Season stats"}
              </h2>
              {season ? (
                <SeasonStatsBreakdown season={season} position={data.profile.position} />
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No season stats entered yet.</p>
              )}
            </section>

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
