import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/AppHeader";
import { DangerZone } from "@/components/DangerZone";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/coach/settings")({
  head: () => ({
    meta: [
      { title: "Coach account settings | Footy KPI" },
      { name: "description", content: "Manage your Footy KPI coach name, club, email, and password." },
      { property: "og:title", content: "Coach account settings | Footy KPI" },
      { property: "og:description", content: "Manage your Footy KPI coach name, club, email, and password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CoachSettings,
});

const input =
  "mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

function CoachSettings() {
  const { data: user, refetch } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });

  const [name, setName] = useState("");
  const [club, setClub] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
    setName(meta["full_name"] ?? "");
    setClub(meta["club"] ?? "");
    setPhone(meta["phone"] ?? "");
    setEmail(user.email ?? "");
  }, [user]);

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length > 100 || club.trim().length > 100 || phone.trim().length > 30) {
      toast.error("One of the fields is too long.");
      return;
    }
    setBusy("details");
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim(), club: club.trim(), phone: phone.trim() },
    });
    setBusy(null);
    if (error) toast.error(error.message);
    else {
      toast.success("Details saved");
      refetch();
    }
  }

  async function saveEmail(e: React.FormEvent) {
    e.preventDefault();
    const next = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) { toast.error("Enter a valid email address."); return; }
    if (next === user?.email) { toast.info("That's already your email."); return; }
    setBusy("email");
    const { error } = await supabase.auth.updateUser({ email: next });
    setBusy(null);
    if (error) toast.error(error.message);
    else toast.success("Check both inboxes to confirm the email change.");
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (password !== confirm) { toast.error("Passwords don't match."); return; }
    setBusy("password");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(null);
    if (error) toast.error(error.message);
    else {
      setPassword("");
      setConfirm("");
      toast.success("Password updated");
    }
  }

  const spin = (key: string) => busy === key && <Loader2 className="h-4 w-4 animate-spin" />;
  const btn =
    "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader email={user?.email ?? null} />
      <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
        <Link to="/coach" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to coach dashboard
        </Link>
        <h1 className="font-display text-4xl text-foreground">Account settings</h1>

        <form onSubmit={saveDetails} className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl text-foreground">Coach details</h2>
          <label className="block text-sm text-muted-foreground">
            Full name
            <input className={input} value={name} maxLength={100} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block text-sm text-muted-foreground">
            Club / school
            <input className={input} value={club} maxLength={100} onChange={(e) => setClub(e.target.value)} />
          </label>
          <label className="block text-sm text-muted-foreground">
            Phone (optional)
            <input className={input} value={phone} maxLength={30} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <button type="submit" disabled={!!busy} className={btn}>
            {spin("details")} Save details
          </button>
        </form>

        <form onSubmit={saveEmail} className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl text-foreground">Email</h2>
          <p className="text-xs text-muted-foreground">
            Athletes invite you by email — invites sent to your old address won't move automatically.
          </p>
          <input type="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" disabled={!!busy} className={btn}>
            {spin("email")} Change email
          </button>
        </form>

        <form onSubmit={savePassword} className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl text-foreground">Password</h2>
          <input type="password" placeholder="New password" autoComplete="new-password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" placeholder="Confirm new password" autoComplete="new-password" className={input} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button type="submit" disabled={!!busy} className={btn}>
            {spin("password")} Update password
          </button>
        </form>

        <DangerZone />
      </main>
    </div>
  );
}
