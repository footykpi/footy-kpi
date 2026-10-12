import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2 } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { GameLog } from "@/components/GameLog";
import { HighlightsReel } from "@/components/HighlightsReel";
import { ProgressCharts } from "@/components/ProgressCharts";
import { SeasonStatsBreakdown } from "@/components/SeasonStatsBreakdown";
import { getMyAccount } from "@/lib/account.functions";
import { getPublicProfile } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/recruiter/$slug")({
  head: () => ({
    meta: [
      { title: "Player review | Footy KPI" },
      { name: "description", content: "Review a player's profile, season stats, and highlights." },
      { property: "og:title", content: "Player review | Footy KPI" },
      { property: "og:description", content: "Review a player's profile, season stats, and highlights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RecruiterAthletePage,
});

function RecruiterAthletePage() {
  const { slug } = Route.useParams();
  const fetchAccount = useServerFn(getMyAccount);
  const fetchProfile = useServerFn(getPublicProfile);

  const { data: account } = useQuery({ queryKey: ["my-account"], queryFn: () => fetchAccount({}) });
  const { data, isLoading, error } = useQuery({
    queryKey: ["recruiter-athlete", slug],
    queryFn: () => fetchProfile({ data: { slug } }),
  });

  const games = (data?.games ?? []).filter((g) => g.sport === "soccer");
  const season = (data?.stats ?? []).find((s) => s.sport === "soccer");
  const p = data?.profile;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader email={account?.email ?? null} />
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <Link
          to="/recruiter"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to search
        </Link>

        {isLoading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading player…
          </p>
        )}

        {error && <p className="text-sm text-destructive">This player couldn't be found.</p>}

        {data && p && data.isPrivate && (
          <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            {p.first_name} {p.last_name}'s portfolio is private.
          </p>
        )}

        {data && p && !data.isPrivate && (
          <>
            <section className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 sm:flex-row">
              {p.photo_url ? (
                <img
                  src={p.photo_url}
                  alt={`${p.first_name} ${p.last_name}`}
                  className="h-32 w-32 shrink-0 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl bg-surface font-display text-4xl text-muted-foreground">
                  {p.first_name?.[0]}
                  {p.last_name?.[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-4xl text-foreground">
                  {p.first_name} {p.last_name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[p.team, p.position, p.jersey_number && `#${p.jersey_number}`]
                    .filter(Boolean)
                    .join(" · ") || "No details yet"}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  {[
                    ["Class of", p.graduation_year],
                    ["Height", p.height],
                    ["Weight", p.weight],
                    ["Dominant foot", p.dominant_hand],
                    ["GPA", p.gpa],
                  ]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div key={String(label)} className="rounded-xl bg-surface px-3 py-2">
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="font-semibold text-foreground">{value}</dd>
                      </div>
                    ))}
                </dl>
                {p.bio && <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">{p.bio}</p>}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-2xl text-foreground">
                {season ? `Season ${season.season}` : "Season stats"}
              </h2>
              {season ? (
                <SeasonStatsBreakdown season={season} position={p.position} />
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No season stats entered yet.</p>
              )}
            </section>

            <HighlightsReel highlights={data.highlights} mode="public" />

            <ProgressCharts games={games} />

            <GameLog games={games} />
          </>
        )}
      </main>
    </div>
  );
}
