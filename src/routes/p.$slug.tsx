import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

import {
  GraduationCap,
  Ruler,
  Weight,
  Footprints,
  TrendingUp,
  Lock,
} from "lucide-react";

import { getPublicProfile, type PublicProfile } from "@/lib/profile.functions";
import {
  goalsAgainstAverage,
  isGoalkeeper,
  savePercentage,
} from "@/lib/season-stats-validation";
import { GameLog } from "@/components/GameLog";
import { HighlightsReel } from "@/components/HighlightsReel";
import playerPhoto from "@/assets/player-photo.jpg";
import footyKpiLogo from "@/assets/footy-kpi-logo.png.asset.json";

export const Route = createFileRoute("/p/$slug")({
  validateSearch: z.object({ key: z.string().trim().max(120).optional() }),
  loaderDeps: ({ search }) => ({ key: search.key }),
  loader: async ({ context, params, deps }) => {
    await context.queryClient.ensureQueryData(
      profileQueryOptions({ slug: params.slug, key: deps.key }),
    );
  },
  head: ({ params }) => {
    const name = params.slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    const description = `Season stats, highlights, and game log for ${name} on Footy KPI.`;
    return {
      meta: [
        { title: `${name} | Footy KPI` },
        { name: "description", content: description },
        { property: "og:title", content: `${name} | Footy KPI` },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: PublicProfilePage,
  errorComponent: () => <ProfileMissing />,
  notFoundComponent: () => <ProfileMissing />,
});

function ProfileMissing() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <p className="text-sm text-muted-foreground">This portfolio isn't available right now.</p>
    </div>
  );
}

const profileQueryOptions = (params: { slug: string; key?: string | undefined }) =>
  queryOptions({
    queryKey: ["profile", params.slug, params.key ?? null],
    queryFn: () =>
      getPublicProfile({
        data: { slug: params.slug, ...(params.key ? { key: params.key } : {}) },
      }),
  });

function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

const SPORT = "soccer";

function PublicProfilePage() {
  const search = Route.useSearch();
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(profileQueryOptions({ slug, key: search.key }));
  const {
    profile,
    stats = [],
    games = [],
    highlights = [],
    isPrivate = false,
    access = { role: "public", linkLabel: null, invalidKey: false, contact: false, gameLog: false, highlights: false },
  } = (data ?? {}) as Partial<PublicProfile>;
  const season = stats.find((s) => s.sport === SPORT);
  const showKeeper =
    isGoalkeeper(profile?.position) ||
    [
      season?.goals_conceded,
      season?.shots_faced,
      season?.saves,
      season?.clean_sheets,
      season?.pk_faced,
      season?.pk_saves,
      season?.high_claims,
      season?.punches,
      season?.catches,
    ].some((value) => value !== null && value !== undefined);
  const unlocked = access.role !== "public";
  const locked = isPrivate && !unlocked;

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <p className="text-sm text-muted-foreground">This portfolio isn't available right now.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-surface pt-safe">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3">
            <img src={footyKpiLogo.url} alt="Footy KPI shield" className="h-10 w-10 rounded-lg object-cover" />
            <span className="font-display text-2xl tracking-wide text-foreground">FOOTY KPI</span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="sticky top-[calc(theme(spacing.6)+env(safe-area-inset-top))] overflow-hidden rounded-2xl border border-border bg-card glow-indigo">
              <div className="aspect-square">
                <img
                  src={profile.photo_url ?? playerPhoto}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="h-full w-full object-cover"
                  width={1024}
                  height={1024}
                />
              </div>
              <div className="p-6">
                <div className="flex items-baseline gap-3">
                  <h1 className="font-display text-4xl text-foreground">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  {profile.jersey_number && (
                    <span className="rounded-md bg-primary px-2 py-1 font-display text-lg text-primary-foreground">
                      #{profile.jersey_number}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-lg font-medium text-indigo-light">
                  {profile.position} • {profile.team}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-surface p-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      Class
                    </div>
                    <div className="mt-1 font-display text-xl text-foreground">
                      {profile.graduation_year ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-surface p-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Ruler className="h-4 w-4" />
                      Height
                    </div>
                    <div className="mt-1 font-display text-xl text-foreground">
                      {profile.height ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-surface p-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Weight className="h-4 w-4" />
                      Weight
                    </div>
                    <div className="mt-1 font-display text-xl text-foreground">
                      {profile.weight ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-surface p-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Footprints className="h-4 w-4" />
                      Dominant Foot
                    </div>
                    <div className="mt-1 font-display text-xl text-foreground">
                      {profile.dominant_hand ?? "—"}
                    </div>
                  </div>
                </div>

                {profile.gpa && (
                  <div className="mt-3 rounded-xl bg-surface p-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      GPA
                    </div>
                    <div className="mt-1 font-display text-xl text-foreground">{profile.gpa}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8 lg:col-span-8">
            {locked ? (
              <PrivateTeaser firstName={profile.first_name} />
            ) : (
              <>
                {profile.bio && (
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="font-display text-2xl text-foreground">About</h2>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{profile.bio}</p>
                  </div>
                )}

                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-display text-2xl text-foreground">Season Stats</h2>
                    {season && (
                      <span className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-muted-foreground">
                        {season.season}
                      </span>
                    )}
                  </div>

                  {!season ? (
                    <p className="mt-6 text-muted-foreground">No soccer season recorded yet for this athlete.</p>
                  ) : (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <StatCard label="Goals" value={formatNumber(season.goals)} />
                      <StatCard label="Assists" value={formatNumber(season.assists)} />
                      <StatCard label="Shots" value={formatNumber(season.shots)} />
                      <StatCard label="Shots on Goal" value={formatNumber(season.shots_on_goal)} />
                      <StatCard label="Minutes Played" value={formatNumber(season.minutes_played)} />
                      <StatCard label="Pass Completion" value={season.pass_completion === null || season.pass_completion === undefined ? "—" : `${formatNumber(season.pass_completion, 1)}%`} />
                      <StatCard label="Tackles" value={formatNumber(season.tackles)} />
                      <StatCard label="Interceptions" value={formatNumber(season.interceptions)} />
                      <StatCard label="Headers Won" value={formatNumber(season.headers_won)} />
                      <StatCard label="Penalty Kicks" value={formatNumber(season.penalty_kicks)} />
                      <StatCard label="Fouls" value={formatNumber(season.fouls)} />
                      <StatCard label="Yellow Cards" value={formatNumber(season.yellow_cards)} />
                      <StatCard label="Red Cards" value={formatNumber(season.red_cards)} />
                      <StatCard label="MVP Awards" value={formatNumber(season.mvp_awards)} />
                      <StatCard label="Games Played" value={formatNumber(season.games_played)} />
                    </div>
                  )}

                  {season && showKeeper && (
                    <div className="mt-8 border-t border-border/60 pt-6">
                      <h3 className="font-display text-xl text-foreground">Goalkeeping</h3>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard label="Goals Against" value={formatNumber(season.goals_conceded)} />
                        <StatCard
                          label="Goals Against Avg"
                          value={
                            goalsAgainstAverage(season.goals_conceded, season.games_played) === null
                              ? "—"
                              : formatNumber(
                                  goalsAgainstAverage(season.goals_conceded, season.games_played),
                                  2,
                                )
                          }
                        />
                        <StatCard label="Shots Faced" value={formatNumber(season.shots_faced)} />
                        <StatCard label="Saves" value={formatNumber(season.saves)} />
                        <StatCard
                          label="Save %"
                          value={
                            savePercentage(season.saves, season.shots_faced, season.goals_conceded) === null
                              ? "—"
                              : `${formatNumber(savePercentage(season.saves, season.shots_faced, season.goals_conceded), 1)}%`
                          }
                        />
                        <StatCard label="Clean Sheets" value={formatNumber(season.clean_sheets)} />
                        <StatCard label="PKs Faced" value={formatNumber(season.pk_faced)} />
                        <StatCard label="PKs Saved" value={formatNumber(season.pk_saves)} />
                        <StatCard label="High Claims" value={formatNumber(season.high_claims)} />
                        <StatCard label="Punches" value={formatNumber(season.punches)} />
                        <StatCard label="Catches" value={formatNumber(season.catches)} />
                      </div>
                    </div>
                  )}
                </div>

                <HighlightsReel highlights={highlights} mode="public" />

                <GameLog games={games.filter((g) => g.sport === SPORT)} />
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-surface py-8 pb-safe">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img src={footyKpiLogo.url} alt="" className="h-8 w-8 rounded-lg object-cover" />
            <span className="font-display text-lg tracking-wide text-foreground">FOOTY KPI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for players, families, coaches, and recruiters.
          </p>
        </div>
      </footer>
    </div>
  );
}

function PrivateTeaser({ firstName }: { firstName: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Lock className="h-7 w-7" />
      </div>
      <h2 className="mt-5 font-display text-3xl text-foreground">This Portfolio Is Private</h2>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted-foreground">
        {firstName}&apos;s verified stats, game log, and highlights are visible only to them and invited family.
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-4 transition-colors hover:bg-surface-elevated">
      <div className="font-display text-3xl text-foreground">{value}</div>
      <div className="mt-1 text-sm font-medium text-muted-foreground">{label}</div>
    </div>
  );
}
