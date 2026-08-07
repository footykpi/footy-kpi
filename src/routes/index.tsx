import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

import {
  Trophy,
  Calendar,
  Ruler,
  Weight,
  Footprints,
  GraduationCap,
  Share2,
  TrendingUp,
  Shield,
  Lock,
  Globe,
  Users,
  Mail,
  Eye,
  KeyRound,
  Phone,
  BookOpen,
  Telescope,
  UserSearch,
  AlertTriangle,
} from "lucide-react";

import { getPublicProfile, type PublicProfile, type ViewerAccess } from "@/lib/profile.functions";
import { GameLog } from "@/components/GameLog";
import { ProgressCharts } from "@/components/ProgressCharts";
import { HighlightsReel } from "@/components/HighlightsReel";
import { AccessLinks } from "@/components/AccessLinks";
import playerPhoto from "@/assets/player-photo.jpg";

const SLUG = "demo-athlete";

export const Route = createFileRoute("/")({
  validateSearch: z.object({ key: z.string().trim().max(120).optional() }),
  loaderDeps: ({ search }) => ({ key: search.key }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(profileQueryOptions({ slug: SLUG, key: deps.key }));
  },
  head: () => ({
    meta: [
      { title: "Marcus Chen | Soccer Portfolio" },
      { name: "description", content: "Season stats, achievements, and game log for Marcus Chen — youth soccer athlete." },
      { property: "og:title", content: "Marcus Chen | Soccer Portfolio" },
      { property: "og:description", content: "Season stats, achievements, and game log for Marcus Chen — youth soccer athlete." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

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

function Index() {
  const search = Route.useSearch();
  const { data } = useSuspenseQuery(profileQueryOptions({ slug: SLUG, key: search.key }));
  const {
    profile,
    stats,
    achievements,
    games,
    highlights,
    isPrivate,
    access,
    privateDetails,
    gamesLocked,
    highlightsLocked,
  } = data as PublicProfile;
  const season = stats.find((s) => s.sport === SPORT);
  const [previewPrivate, setPreviewPrivate] = useState(isPrivate);
  const unlocked = access.role !== "public";
  const locked = (isPrivate || previewPrivate) && !unlocked;


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <SoccerBallIcon className="h-6 w-6" />
            </div>
            <span className="font-display text-2xl tracking-wide text-foreground">ATHLETEFOLIO</span>
          </div>
          <div className="flex items-center gap-3">
            {unlocked ? (
              <RoleBadge access={access} />
            ) : (
              <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => setPreviewPrivate(false)}
                  aria-pressed={!locked}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${!locked ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Globe className="h-4 w-4" />
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPrivate(true)}
                  aria-pressed={locked}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${locked ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Lock className="h-4 w-4" />
                  Private
                </button>
              </div>
            )}
            {!locked && (
              <button className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated">
                <Share2 className="h-4 w-4" />
                Share Profile
              </button>
            )}
          </div>

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
            {access.invalidKey && (
              <div className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-5">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
                <div>
                  <p className="font-semibold text-foreground">This unlock link is no longer valid</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    It may have expired or been revoked. You&apos;re seeing the standard public
                    profile — ask the athlete for a fresh link.
                  </p>
                </div>
              </div>
            )}
            {locked ? (
              <PrivateTeaser firstName={profile.first_name} />
            ) : (
            <>
            {unlocked && <UnlockedBanner access={access} />}

            {privateDetails && <ContactCard details={privateDetails} profileGpa={profile.gpa} />}

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
                  <StatCard label="PK Saves" value={formatNumber(season.pk_saves)} />
                  <StatCard label="Saves" value={formatNumber(season.saves)} />
                  <StatCard label="Clean Sheets" value={formatNumber(season.clean_sheets)} />
                  <StatCard label="Fouls" value={formatNumber(season.fouls)} />
                  <StatCard label="Yellow Cards" value={formatNumber(season.yellow_cards)} />
                  <StatCard label="Red Cards" value={formatNumber(season.red_cards)} />
                  <StatCard label="MVP Awards" value={formatNumber(season.mvp_awards)} />
                  <StatCard label="Games Played" value={formatNumber(season.games_played)} />
                </div>
              )}
            </div>

            <HighlightsReel
              profileId={profile.id}
              profileSlug={profile.slug}
              highlights={highlights}
            />

            <ProgressCharts games={games.filter((g) => g.sport === SPORT)} />

            <GameLog games={games.filter((g) => g.sport === SPORT)} />

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
            </>
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

function PrivateTeaser({ firstName }: { firstName: string }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="mt-5 font-display text-3xl text-foreground">This Portfolio Is Private</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted-foreground">
          {firstName}&apos;s verified stats, game log, media, and progress charts are visible only to
          {" "}{firstName} and invited family. Coaches and recruiters can request access.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            <Mail className="h-4 w-4" />
            Request Access
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated">
            <Users className="h-4 w-4" />
            Invite Family
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-2xl text-foreground">Who Can See What</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <AccessCard
            icon={<Lock className="h-5 w-5" />}
            title="Private Mode"
            items={["Player only", "Invited family", "Nothing shared publicly"]}
          />
          <AccessCard
            icon={<Globe className="h-5 w-5" />}
            title="Public Mode"
            items={[
              "Shareable profile link",
              "Recruiters can view verified stats",
              "College coaches can view",
              "Friends can follow",
            ]}
          />
        </div>
        <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="h-4 w-4" />
          Toggle the switch above to preview how each mode looks to visitors.
        </p>
      </div>
    </div>
  );
}

function AccessCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl bg-surface p-5">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="font-semibold text-foreground">{title}</span>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>
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

function SoccerBallIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.2 9 9.4l1.1 3.6h3.8L15 9.4z" />
      <path d="M12 3.2v4M5.2 8.8 9 9.4M18.8 8.8 15 9.4M8.2 20.2 10.1 13M15.8 20.2 13.9 13" />
    </svg>
  );
}
