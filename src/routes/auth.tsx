import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2, Mail } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import footyKpiLogo from "@/assets/footy-kpi-logo.png.asset.json";

const DESCRIPTION =
  "Log in or create your Footy KPI account as an athlete, coach, or recruiter.";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: z.object({ mode: z.enum(["login", "signup"]).optional() }),
  head: () => ({
    meta: [
      { title: "Log in or sign up | Footy KPI" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Log in or sign up | Footy KPI" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Role = "athlete" | "coach" | "recruiter";

const ROLES: { value: Role; label: string; blurb: string }[] = [
  { value: "athlete", label: "Athlete", blurb: "Build and share my own portfolio" },
  { value: "coach", label: "Coach", blurb: "Review and verify athletes who invite me" },
  { value: "recruiter", label: "Recruiter", blurb: "Search and view public player profiles" },
];

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">(search.mode ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("athlete");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        navigate({ to: "/dashboard", replace: true });
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim(), requested_role: role },
          },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
        window.sessionStorage.setItem("footykpi:role", role);
        window.sessionStorage.setItem("footykpi:name", fullName.trim());
        navigate({ to: "/dashboard", replace: true });
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function forgotPassword() {
    if (!email.trim()) {
      setError("Enter your email first, then tap reset.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setNotice("Check your email for a link to choose a new password.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the reset email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/50 bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={footyKpiLogo.url}
              alt="Footy KPI shield"
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span className="font-display text-2xl tracking-wide text-foreground">FOOTY KPI</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-12">
        {checkEmail ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <h1 className="mt-5 font-display text-3xl text-foreground">Check your email</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We sent a confirmation link to {email.trim()}. Open it to finish creating your
              account, then come back and log in.
            </p>
            <button
              type="button"
              onClick={() => {
                setCheckEmail(false);
                setMode("login");
              }}
              className="mt-6 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-surface-elevated"
            >
              Back to log in
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-8">
            <h1 className="font-display text-3xl text-foreground">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signup"
                ? "Choose who you are — we'll open the right dashboard."
                : "Log in to your Footy KPI dashboard."}
            </p>

            {mode === "signup" && (
              <>
                <div className="mt-6 space-y-2">
                  {ROLES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      aria-pressed={role === option.value}
                      className={`w-full rounded-xl border p-4 text-left transition-colors ${
                        role === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-surface hover:bg-surface-elevated"
                      }`}
                    >
                      <span className="font-semibold text-foreground">{option.label}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {option.blurb}
                      </span>
                    </button>
                  ))}
                </div>

                <label className="mt-5 block text-sm font-medium text-foreground">
                  Full name
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                    autoComplete="name"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>
              </>
            )}

            <label className="mt-5 block text-sm font-medium text-foreground">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-foreground">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            {notice && <p className="mt-4 text-sm text-primary">{notice}</p>}

            <button
              type="submit"
              disabled={busy}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signup" ? "Create account" : "Log in"}
            </button>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signup" ? "login" : "signup");
                  setError(null);
                  setNotice(null);
                }}
                className="font-medium text-primary hover:underline"
              >
                {mode === "signup" ? "I already have an account" : "Create an account"}
              </button>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => void forgotPassword()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Forgot password?
                </button>
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
