import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
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
import { AiInsights } from "@/components/AiInsights";
import { SeasonJournal } from "@/components/SeasonJournal";
import { HighlightsReel } from "@/components/HighlightsReel";
import { TradingCard } from "@/components/TradingCard";
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
    achievements = [],
    games = [],
    highlights = [],
    isPrivate = false,
    access = { role: "public", linkLabel: null, invalidKey: false, contact: false, gameLog: false, highlights: false },
    privateDetails = null,
    gamesLocked = 0,
    highlightsLocked = 0,
  } = (data ?? {}) as Partial<PublicProfile>;
  const season = stats.find((s) => s.sport === SPORT);
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
      <header className="border-b border-border/50 bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3">
            <img src={footyKpiLogo.url} alt="Footy KPI shield" className="h-10 w-10 rounded-lg object-cover" />
            <span className="font-display text-2xl tracking-wide text-foreground">FOOTY KPI</span>
          </a>
          <div className="flex items-center gap-3">
            {unlocked && <RoleBadge access={access} />}
            {!locked && (
              <>
                <TradingCard
                  profile={profile}
                  season={season}
                  games={games.filter((g) => g.sport === SPORT)}
                  photoUrl={profile.photo_url ?? playerPhoto}
                />
                <ShareProfileButton
                  name={`${profile.first_name} ${profile.last_name}`}
                  slug={profile.slug}
                />
              </>
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

            <HighlightsReel highlights={highlights} mode="public" />

            {highlightsLocked > 0 && (
              <LockedNotice
                title={`${highlightsLocked} more highlight${highlightsLocked === 1 ? "" : "s"} reserved`}
                body="The full highlight library — including unlisted clips, certificates, and medals — opens with a recruiter or college coach unlock link."
              />
            )}

            <AiInsights profileId={profile.id} />

            <ProgressCharts games={games.filter((g) => g.sport === SPORT)} />

            <GameLog games={games.filter((g) => g.sport === SPORT)} />

            <SeasonJournal games={games.filter((g) => g.sport === SPORT)} />

            {gamesLocked > 0 && (
              <LockedNotice
                title={`${gamesLocked} earlier game${gamesLocked === 1 ? "" : "s"} not shown`}
                body="Coach notes, player reflections, mood, and performance ratings are only released to recruiters and college coaches with an unlock link."
              />
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
            </>
            )}

          </div>

        </section>
      </main>

      <footer className="border-t border-border/50 bg-surface py-8">
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

function ShareProfileButton({ name, slug }: { name: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/p/${slug}`;
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    try {
      if (nav.share) {
        await nav.share({ title: `${name} | Footy KPI`, text: `${name}'s soccer portfolio`, url });
        return;
      }
    } catch {
      // sharing cancelled or unavailable — fall back to copying
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this profile link", url);
      return;
    }
    setCopied(true);
    toast.success("Profile link copied");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated"
    >
      <Share2 className="h-4 w-4" />
      {copied ? "Link copied" : "Share Profile"}
    </button>
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

const ROLE_LABEL = {
  recruiter: { text: "Recruiter access", icon: UserSearch },
  coach: { text: "College coach access", icon: Telescope },
} as const;

function RoleBadge({ access }: { access: ViewerAccess }) {
  const meta = ROLE_LABEL[access.role as "recruiter" | "coach"];
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
      <Icon className="h-4 w-4" />
      {meta.text}
    </span>
  );
}

function UnlockedBanner({ access }: { access: ViewerAccess }) {
  const meta = ROLE_LABEL[access.role as "recruiter" | "coach"];
  const unlockedItems = [
    access.contact ? "Academics & contact details" : null,
    access.gameLog ? "Full game log with coach notes" : null,
    access.highlights ? "Full highlight library" : null,
  ].filter(Boolean) as string[];

  return (
    <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6">
      <div className="flex items-center gap-2 text-primary">
        <KeyRound className="h-5 w-5" />
        <h2 className="font-display text-2xl text-foreground">{meta.text} unlocked</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {access.linkLabel
          ? `You opened the link "${access.linkLabel}". `
          : "You opened a private unlock link. "}
        The athlete chose to share these extras with you:
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {unlockedItems.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactCard({
  details,
  profileGpa,
}: {
  details: {
    contact_email: string | null;
    contact_phone: string | null;
    guardian_name: string | null;
    academic_notes: string | null;
  };
  profileGpa: number | null;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 text-primary">
        <BookOpen className="h-5 w-5" />
        <h2 className="font-display text-2xl text-foreground">Academics &amp; Contact</h2>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {details.contact_email && (
          <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={details.contact_email} />
        )}
        {details.contact_phone && (
          <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone" value={details.contact_phone} />
        )}
        {details.guardian_name && (
          <DetailRow icon={<Users className="h-4 w-4" />} label="Guardian" value={details.guardian_name} />
        )}
        {profileGpa !== null && profileGpa !== undefined && (
          <DetailRow icon={<TrendingUp className="h-4 w-4" />} label="GPA" value={String(profileGpa)} />
        )}
      </div>
      {details.academic_notes && (
        <p className="mt-4 rounded-xl bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
          {details.academic_notes}
        </p>
      )}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-medium text-foreground">{value}</div>
    </div>
  );
}

function LockedNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border bg-surface/60 p-5">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Lock className="h-4 w-4" />
      </div>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
