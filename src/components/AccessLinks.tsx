import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, KeyRound, Link2, ShieldOff, Telescope, UserSearch } from "lucide-react";

import {
  createUnlockLink,
  listUnlockLinks,
  revokeUnlockLink,
  type UnlockLink,
} from "@/lib/access.functions";

const ROLE_META = {
  recruiter: { label: "Recruiter", icon: UserSearch },
  coach: { label: "College coach", icon: Telescope },
} as const;

function linkUrl(token: string): string {
  if (typeof window === "undefined") return `?key=${token}`;
  return `${window.location.origin}${window.location.pathname}?key=${token}`;
}

export function AccessLinks({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const fetchLinks = useServerFn(listUnlockLinks);
  const createLink = useServerFn(createUnlockLink);
  const revoke = useServerFn(revokeUnlockLink);

  const [role, setRole] = useState<"recruiter" | "coach">("recruiter");
  const [label, setLabel] = useState("");
  const [contact, setContact] = useState(true);
  const [gameLog, setGameLog] = useState(true);
  const [highlights, setHighlights] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const { data: links = [], isLoading } = useQuery({
    queryKey: ["unlock-links", slug],
    queryFn: () => fetchLinks({ data: { slug } }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["unlock-links", slug] });

  const create = useMutation({
    mutationFn: () =>
      createLink({
        data: {
          slug,
          role,
          ...(label.trim() ? { label: label.trim() } : {}),
          unlock_contact: contact,
          unlock_game_log: gameLog,
          unlock_highlights: highlights,
          ...(expiresAt ? { expires_at: expiresAt } : {}),
        },
      }),
    onSuccess: async () => {
      setLabel("");
      setExpiresAt("");
      await invalidate();
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revoke({ data: { id } }),
    onSuccess: invalidate,
  });

  async function copy(token: string) {
    await navigator.clipboard.writeText(linkUrl(token));
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 text-primary">
        <KeyRound className="h-5 w-5" />
        <h2 className="font-display text-2xl text-foreground">Unlock Links</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Send a private link to recruiters or college coaches. Anyone opening it sees the extras you
        choose below — everyone else keeps seeing the standard public profile.
      </p>

      <div className="mt-6 space-y-4 rounded-xl bg-surface p-5">
        <div className="flex flex-wrap items-center gap-2">
          {(["recruiter", "coach"] as const).map((option) => {
            const Icon = ROLE_META[option].icon;
            const active = role === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setRole(option)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {ROLE_META[option].label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted-foreground">Label (who is this for?)</span>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Fall ID camp coaches"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground/60"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">Expires (optional)</span>
            <input
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
            />
          </label>
        </div>

        <fieldset className="space-y-2 text-sm">
          <legend className="text-muted-foreground">Unlock for this role</legend>
          <Toggle
            checked={contact}
            onChange={setContact}
            label="Academics & contact details"
          />
          <Toggle checked={gameLog} onChange={setGameLog} label="Full game log & coach notes" />
          <Toggle checked={highlights} onChange={setHighlights} label="Full highlight library" />
        </fieldset>

        <button
          type="button"
          onClick={() => create.mutate()}
          disabled={create.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Link2 className="h-4 w-4" />
          {create.isPending ? "Creating…" : "Create unlock link"}
        </button>
        {create.isError && (
          <p className="text-sm text-destructive">
            {create.error instanceof Error ? create.error.message : "Could not create the link."}
          </p>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading links…</p>}
        {!isLoading && links.length === 0 && (
          <p className="text-sm text-muted-foreground">No unlock links yet.</p>
        )}
        {links.map((link: UnlockLink) => {
          const Icon = ROLE_META[link.role].icon;
          const expired = link.expires_at && new Date(link.expires_at).getTime() < Date.now();
          const dead = Boolean(link.revoked_at || expired);
          return (
            <div
              key={link.id}
              className={`rounded-xl bg-surface p-4 ${dead ? "opacity-60" : ""}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">
                      {link.label ?? ROLE_META[link.role].label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ROLE_META[link.role].label} •{" "}
                      {link.revoked_at
                        ? "Revoked"
                        : expired
                          ? "Expired"
                          : `${link.view_count} view${link.view_count === 1 ? "" : "s"}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copy(link.token)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-elevated"
                  >
                    {copied === link.token ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied === link.token ? "Copied" : "Copy link"}
                  </button>
                  {!dead && (
                    <button
                      type="button"
                      onClick={() => revokeMutation.mutate(link.id)}
                      disabled={revokeMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                    >
                      <ShieldOff className="h-3.5 w-3.5" />
                      Revoke
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {link.unlock_contact && <Chip>Academics & contact</Chip>}
                {link.unlock_game_log && <Chip>Game log & notes</Chip>}
                {link.unlock_highlights && <Chip>Full highlights</Chip>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
      {children}
    </span>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-border accent-primary"
      />
      {label}
    </label>
  );
}
