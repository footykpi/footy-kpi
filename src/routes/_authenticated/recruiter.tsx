import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Search } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { DangerZone } from "@/components/DangerZone";
import { getMyAccount } from "@/lib/account.functions";
import { searchAthletes } from "@/lib/recruiter.functions";
import playerPhoto from "@/assets/player-photo.jpg";

export const Route = createFileRoute("/_authenticated/recruiter")({
  head: () => ({
    meta: [
      { title: "Recruiter search | Footy KPI" },
      { name: "description", content: "Search public youth football profiles by name, team, position, or class year." },
      { property: "og:title", content: "Recruiter search | Footy KPI" },
      { property: "og:description", content: "Search public youth football profiles by name, team, position, or class year." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RecruiterDashboard,
});

function RecruiterDashboard() {
  const fetchAccount = useServerFn(getMyAccount);
  const [filters, setFilters] = useState({ q: "", team: "", position: "", graduationYear: "" });
  const [applied, setApplied] = useState(filters);

  const { data: account } = useQuery({ queryKey: ["my-account"], queryFn: () => fetchAccount({}) });

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["athlete-search", applied],
    queryFn: () =>
      searchAthletes({
        data: {
          ...(applied.q.trim() ? { q: applied.q.trim() } : {}),
          ...(applied.team.trim() ? { team: applied.team.trim() } : {}),
          ...(applied.position.trim() ? { position: applied.position.trim() } : {}),
          ...(applied.graduationYear.trim()
            ? { graduationYear: applied.graduationYear.trim() }
            : {}),
        },
      }),
  });

  const set = (key: keyof typeof filters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-background">
      <AppHeader email={account?.email ?? null} />
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <div>
          <h1 className="font-display text-4xl text-foreground">Find players</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only players who made their portfolio public appear here.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setApplied(filters);
          }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["q", "Player name"],
                ["team", "Team / club"],
                ["position", "Position"],
                ["graduationYear", "Graduation year"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="text-sm font-medium text-foreground">
                {label}
                <input
                  value={filters[key]}
                  onChange={(event) => set(key, event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </form>

        <section>
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">No public players match that search yet.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {results.map((athlete) => (
                <li key={athlete.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-4">
                    <img
                      src={athlete.photo_url ?? playerPhoto}
                      alt={`${athlete.first_name} ${athlete.last_name}`}
                      className="h-16 w-16 rounded-xl object-cover"
                      width={64}
                      height={64}
                    />
                    <div className="min-w-0">
                      <Link
                        to="/p/$slug"
                        params={{ slug: athlete.slug }}
                        className="font-semibold text-foreground hover:underline"
                      >
                        {athlete.first_name} {athlete.last_name}
                      </Link>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {[athlete.team, athlete.position, athlete.graduation_year]
                          .filter(Boolean)
                          .join(" · ") || "No details yet"}
                      </p>
                    </div>
                  </div>
                  {athlete.bio && (
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{athlete.bio}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <DangerZone />
      </main>
    </div>
  );
}
