import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, ShieldCheck, Share2, Telescope, UserSearch, Trophy } from "lucide-react";

import footyKpiLogo from "@/assets/footy-kpi-logo.png.asset.json";

const DESCRIPTION =
  "Footy KPI turns every match into a permanent football portfolio: stats, highlights, journal entries, and verified achievements in one shareable player profile.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Footy KPI — Football Portfolios for Youth Players" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Footy KPI — Football Portfolios for Youth Players" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: BarChart3,
    title: "Season stats & charts",
    body: "Goals, assists, minutes, tackles, cards and more — graphed automatically across the season.",
  },
  {
    icon: Trophy,
    title: "Highlights & achievements",
    body: "Upload photos, clips, medals and certificates. Every match becomes part of a permanent history.",
  },
  {
    icon: ShieldCheck,
    title: "Coach-verified proof",
    body: "Invite your coach to review your stats and awards so they carry a Verified badge.",
  },
  {
    icon: Share2,
    title: "Share on your terms",
    body: "Keep the portfolio private, share a public link, or unlock extras for a specific recruiter.",
  },
];

const ROLES = [
  {
    icon: Trophy,
    title: "Athletes",
    body: "Your own dashboard to manage your profile, stats, games, journal and media.",
  },
  {
    icon: Telescope,
    title: "Coaches",
    body: "Review the athletes who invite you and approve their proof of stats and awards.",
  },
  {
    icon: UserSearch,
    title: "Recruiters",
    body: "Search public player profiles by name, team, position or graduation year.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-surface pt-safe">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src={footyKpiLogo.url}
              alt="Footy KPI shield"
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span className="font-display text-2xl tracking-wide text-foreground">FOOTY KPI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated"
            >
              Log in
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h1 className="font-display text-5xl leading-tight text-foreground sm:text-6xl">
            Every match becomes part of your story
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {DESCRIPTION}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start your portfolio
            </Link>
            <Link
              to="/auth"
              className="rounded-full border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated"
            >
              I already have an account
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-display text-2xl text-foreground">{title}</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <h2 className="font-display text-3xl text-foreground">One app, three dashboards</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {ROLES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl bg-surface p-6">
                <div className="flex items-center gap-2 text-primary">
                  <Icon className="h-5 w-5" />
                  <span className="font-semibold text-foreground">{title}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-surface py-8 pb-safe">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6">
          <div className="flex items-center gap-3">
            <img src={footyKpiLogo.url} alt="" className="h-8 w-8 rounded-lg object-cover" />
            <span className="font-display text-lg tracking-wide text-foreground">FOOTY KPI</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>Built for players, families, coaches, and recruiters.</span>
            <Link to="/privacy" className="font-medium text-foreground hover:underline">
              Privacy Policy
            </Link>
            <Link to="/terms" className="font-medium text-foreground hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
