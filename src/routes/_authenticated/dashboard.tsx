import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Telescope, Trophy, UserSearch } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { claimRole, getMyAccount, type AccountRole } from "@/lib/account.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard | Footy KPI" },
      { name: "description", content: "Open your Footy KPI dashboard." },
      { property: "og:title", content: "Your dashboard | Footy KPI" },
      { property: "og:description", content: "Open your Footy KPI dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardRouter,
});

const ROLES: { value: AccountRole; label: string; blurb: string; icon: typeof Trophy }[] = [
  {
    value: "athlete",
    label: "Athlete",
    blurb: "Build and share my own portfolio",
    icon: Trophy,
  },
  {
    value: "coach",
    label: "Coach",
    blurb: "Review and verify athletes who invite me",
    icon: Telescope,
  },
  {
    value: "recruiter",
    label: "Recruiter",
    blurb: "Search and view public player profiles",
    icon: UserSearch,
  },
];

function DashboardRouter() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchAccount = useServerFn(getMyAccount);
  const claim = useServerFn(claimRole);
  const [role, setRole] = useState<AccountRole>("athlete");
  const [name, setName] = useState("");

  const { data: account, isLoading } = useQuery({
    queryKey: ["my-account"],
    queryFn: () => fetchAccount({}),
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.sessionStorage.getItem("footykpi:role") as AccountRole | null;
    if (stored) setRole(stored);
    setName(window.sessionStorage.getItem("footykpi:name") ?? "");
  }, []);

  const save = useMutation({
    mutationFn: () => claim({ data: { role, ...(name.trim() ? { fullName: name.trim() } : {}) } }),
    onSuccess: async () => {
      window.sessionStorage.removeItem("footykpi:role");
      window.sessionStorage.removeItem("footykpi:name");
      await queryClient.invalidateQueries({ queryKey: ["my-account"] });
    },
  });

  useEffect(() => {
    if (!account?.role) return;
    if (account.role === "athlete") navigate({ to: "/athlete", replace: true });
    if (account.role === "coach") navigate({ to: "/coach", replace: true });
    if (account.role === "recruiter") navigate({ to: "/recruiter", replace: true });
  }, [account?.role, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader email={account?.email ?? null} />
      <main className="mx-auto w-full max-w-md px-6 py-12">
        {isLoading || account?.role ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Opening your dashboard…
          </p>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8">
            <h1 className="font-display text-3xl text-foreground">How will you use Footy KPI?</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Pick one — this sets up your dashboard and can't be swapped later.
            </p>

            <div className="mt-6 space-y-2">
              {ROLES.map(({ value, label, blurb, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  aria-pressed={role === value}
                  className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                    role === value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface hover:bg-surface-elevated"
                  }`}
                >
                  <Icon className="mt-0.5 h-5 w-5 text-primary" />
                  <span>
                    <span className="font-semibold text-foreground">{label}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{blurb}</span>
                  </span>
                </button>
              ))}
            </div>

            {role === "athlete" && (
              <label className="mt-5 block text-sm font-medium text-foreground">
                Your full name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Marcus Chen"
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>
            )}

            {save.isError && (
              <p className="mt-4 text-sm text-destructive">
                {save.error instanceof Error ? save.error.message : "Could not save your choice."}
              </p>
            )}

            <button
              type="button"
              disabled={save.isPending}
              onClick={() => save.mutate()}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
