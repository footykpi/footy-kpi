import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import {
  Trophy,
  Calendar,
  Ruler,
  Weight,
  Hand,
  GraduationCap,
  Share2,
  TrendingUp,
  Shield,
} from "lucide-react";

import { getPublicProfile, type PublicProfile } from "@/lib/profile.functions";
import playerPhoto from "@/assets/player-photo.jpg";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(profileQueryOptions({ slug: "demo-athlete" }));
  },
  head: () => ({
    meta: [
      { title: "Marcus Chen | Baseball Portfolio" },
      { name: "description", content: "Season stats, achievements, and player profile for Marcus Chen — youth baseball athlete." },
      { property: "og:title", content: "Marcus Chen | Baseball Portfolio" },
      { property: "og:description", content: "Season stats, achievements, and player profile for Marcus Chen — youth baseball athlete." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const profileQueryOptions = (params: { slug: string }) =>
  queryOptions({
    queryKey: ["profile", params.slug],
    queryFn: () => getPublicProfile({ data: { slug: params.slug } }),
  });

function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatAverage(value: number | null | undefined): string {
  if (value === null || value === undefined) return ".000";
  return value.toFixed(3).replace(/^0/, "");
}

function Index() {
  const fetchProfile = useServerFn(getPublicProfile);
  const { data } = useSuspenseQuery(
    profileQueryOptions({ slug: "demo-athlete", fetchProfile })
  );
  const { profile, stats, achievements } = data as PublicProfile;
  const season = stats[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BaseballIcon className="h-6 w-6" />
            </div>
            <span className="font-display text-2xl tracking-wide text-foreground">ATHLETEFOLIO</span>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated">
            <Share2 className="h-4 w-4" />
            Share Profile
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="sticky top-6 overflow-hidden rounded-2xl border border-border bg-card glow-indigo">
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
                      <Hand className="h-4 w-4" />
                      Bats / Throws
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
            {profile.bio && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-2xl text-foreground">About</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{profile.bio}</p>
              </div>
            )}

            {season && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl text-foreground">Season Stats</h2>
                  <span className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-muted-foreground">
                    {season.season}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <StatCard label="Batting Average" value={formatAverage(season.batting_average)} />
                  <StatCard label="Hits" value={formatNumber(season.hits)} />
                  <StatCard label="Home Runs" value={formatNumber(season.home_runs)} />
                  <StatCard label="RBI" value={formatNumber(season.rbi)} />
                  <StatCard label="Strikeouts" value={formatNumber(season.strikeouts)} />
                  <StatCard label="Stolen Bases" value={formatNumber(season.stolen_bases)} />
                  <StatCard label="Wins" value={formatNumber(season.wins)} />
                  <StatCard label="Saves" value={formatNumber(season.saves)} />
                  <StatCard label="ERA" value={formatNumber(season.era, 2)} />
                  <StatCard label="Games Played" value={formatNumber(season.games_played)} />
                </div>
              </div>
            )}

            {achievements.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-2xl text-foreground">Achievements</h2>
                <div className="mt-6 space-y-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-start gap-4 rounded-xl bg-surface p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                        {achievement.date && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {achievement.date}
                          </div>
                        )}
                        {achievement.description && (
                          <p className="mt-2 text-sm text-muted-foreground">{achievement.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-surface py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-4 w-4" />
            </div>
            <span className="font-display text-lg tracking-wide text-foreground">ATHLETEFOLIO</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for athletes, families, coaches, and recruiters.
          </p>
        </div>
      </footer>
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

function BaseballIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 7.5c1.5 2.5 1.5 6.5 0 9" />
      <path d="M15.5 7.5c-1.5 2.5-1.5 6.5 0 9" />
      <path d="M5 12h2" />
      <path d="M17 12h2" />
    </svg>
  );
}
