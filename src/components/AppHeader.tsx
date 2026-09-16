import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import footyKpiLogo from "@/assets/footy-kpi-logo.png.asset.json";

export function AppHeader({
  email,
  children,
}: {
  email?: string | null;
  children?: React.ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="border-b border-border/50 bg-surface pt-safe">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={footyKpiLogo.url}
            alt="Footy KPI shield"
            className="h-10 w-10 rounded-lg object-cover"
          />
          <span className="font-display text-2xl tracking-wide text-foreground">FOOTY KPI</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          {children}
          {email && (
            <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
          )}
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
