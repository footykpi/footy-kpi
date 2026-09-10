import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, ShieldCheck, X } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { getMyAccount } from "@/lib/account.functions";
import { listCoachAthletes, respondToInvite } from "@/lib/coach.functions";

export const Route = createFileRoute("/_authenticated/coach")({
  head: () => ({
    meta: [
      { title: "Coach dashboard | Footy KPI" },
      { name: "description", content: "Review athletes who invited you and verify their awards." },
      { property: "og:title", content: "Coach dashboard | Footy KPI" },
      { property: "og:description", content: "Review athletes who invited you and verify their awards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoachDashboard,
});

function CoachDashboard() {
  const queryClient = useQueryClient();
  const fetchAccount = useServerFn(getMyAccount);
  const fetchAthletes = useServerFn(listCoachAthletes);
  const respond = useServerFn(respondToInvite);

  const { data: account } = useQuery({ queryKey: ["my-account"], queryFn: () => fetchAccount({}) });
  const { data: athletes = [], isLoading } = useQuery({
    queryKey: ["coach-athletes"],
    queryFn: () => fetchAthletes({}),
  });

  const decide = useMutation({
    mutationFn: (input: { id: string; decision: "accepted" | "declined" }) =>
      respond({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coach-athletes"] }),
  });

  const pending = athletes.filter((a) => a.status === "pending");
  const accepted = athletes.filter((a) => a.status === "accepted");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader email={account?.email ?? null} />
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <div>
          <h1 className="font-display text-4xl text-foreground">Coach dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Athletes invite you by email. Accept an invite to review their season and approve proof
            of awards, certificates, and medals.
          </p>
        </div>

        {isLoading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your athletes…
          </p>
        )}

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl text-foreground">Invitations</h2>
          {pending.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No invitations waiting.</p>
          ) : (
            <ul className="mt-5 space-y-2">
              {pending.map((athlete) => (
                <li
                  key={athlete.linkId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface p-4"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {athlete.firstName} {athlete.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {athlete.team || "No team listed"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => decide.mutate({ id: athlete.linkId, decision: "accepted" })}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                    >
                      <Check className="h-4 w-4" />
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => decide.mutate({ id: athlete.linkId, decision: "declined" })}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl text-foreground">Your athletes</h2>
          {accepted.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Accepted athletes will appear here.
            </p>
          ) : (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {accepted.map((athlete) => (
                <li key={athlete.linkId} className="rounded-xl bg-surface p-4">
                  <Link
                    to="/coach/$slug"
                    params={{ slug: athlete.slug }}
                    className="font-semibold text-foreground hover:underline"
                  >
                    {athlete.firstName} {athlete.lastName}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[athlete.team, athlete.position, athlete.graduationYear]
                      .filter(Boolean)
                      .join(" · ") || "No details yet"}
                  </p>
                  {athlete.pendingProofs > 0 && (
                    <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {athlete.pendingProofs} awaiting review
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
