import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, IdCard, Share2, Link as LinkIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Game, Profile, SeasonStats } from "@/lib/profile.functions";

interface TradingCardProps {
  profile: Profile;
  season: SeasonStats | undefined;
  games: Game[];
  photoUrl: string;
}

function record(games: Game[]) {
  let w = 0;
  let l = 0;
  let d = 0;
  for (const g of games) {
    const r = (g.result ?? "").toLowerCase();
    if (r.startsWith("w")) w += 1;
    else if (r.startsWith("l")) l += 1;
    else if (r) d += 1;
  }
  return `${w}-${l}-${d}`;
}

function num(value: number | null | undefined, suffix = ""): string {
  if (value === null || value === undefined) return "—";
  return `${value}${suffix}`;
}

export function TradingCard({ profile, season, games, photoUrl }: TradingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const fullName = `${profile.first_name} ${profile.last_name}`;
  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/?slug=${profile.slug}` : "";
  const shareText = `${fullName} — ${profile.position ?? "Soccer"} · ${profile.team} · Class of ${profile.graduation_year ?? ""}`.trim();

  async function renderBlob(): Promise<Blob | null> {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      skipFonts: false,
    });
    const res = await fetch(dataUrl);
    return await res.blob();
  }

  async function handleDownload() {
    try {
      setBusy(true);
      const blob = await renderBlob();
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${profile.slug}-trading-card.png`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("Trading card downloaded");
    } catch {
      toast.error("Couldn't create the card image. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    try {
      setBusy(true);
      const blob = await renderBlob();
      const file = blob
        ? new File([blob], `${profile.slug}-trading-card.png`, { type: "image/png" })
        : null;
      const nav = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
      };
      if (file && nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ title: fullName, text: shareText, files: [file] });
        return;
      }
      if (nav.share) {
        await nav.share({ title: fullName, text: shareText, url: shareUrl });
        return;
      }
      await handleDownload();
      toast.info("Card saved — attach it to your post.");
    } catch {
      // user cancelled or share failed silently
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Profile link copied");
  }

  const socials = [
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated">
          <IdCard className="h-4 w-4" />
          Trading Card
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">Your Trading Card</DialogTitle>
          <DialogDescription>
            Download it as an image or share it straight to social.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center">
          <div
            ref={cardRef}
            className="w-[320px] overflow-hidden rounded-2xl border border-indigo-light/40 bg-card"
            style={{
              background:
                "linear-gradient(160deg, var(--surface-elevated) 0%, var(--background) 55%, var(--surface) 100%)",
            }}
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-2">
              <span className="font-display text-lg tracking-widest text-indigo-light">
                ATHLETEFOLIO
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {season?.season ?? "Season"}
              </span>
            </div>

            <div className="relative">
              <img
                src={photoUrl}
                alt={fullName}
                crossOrigin="anonymous"
                className="h-[300px] w-full object-cover"
              />
              {profile.jersey_number && (
                <span className="absolute right-3 top-3 rounded-lg bg-primary px-2.5 py-1 font-display text-2xl leading-none text-primary-foreground">
                  #{profile.jersey_number}
                </span>
              )}
            </div>

            <div className="px-4 pb-4 pt-3">
              <h3 className="font-display text-3xl leading-tight text-foreground">{fullName}</h3>
              <p className="text-sm font-medium text-indigo-light">
                {profile.position} • {profile.team}
              </p>
              <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                Class of {profile.graduation_year ?? "—"}
                {profile.height ? ` • ${profile.height}` : ""}
                {profile.dominant_hand ? ` • ${profile.dominant_hand} foot` : ""}
              </p>

              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "GP", value: num(season?.games_played) },
                  { label: "Goals", value: num(season?.goals) },
                  { label: "Assists", value: num(season?.assists) },
                  { label: "MVP", value: num(season?.mvp_awards) },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-surface/80 py-2">
                    <div className="font-display text-xl text-foreground">{s.value}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex items-center justify-between rounded-lg bg-surface/60 px-3 py-2 text-xs text-muted-foreground">
                <span>
                  Record <span className="text-foreground">{record(games)}</span>
                </span>
                <span>
                  Minutes <span className="text-foreground">{num(season?.minutes_played)}</span>
                </span>
                <span>
                  Pass % <span className="text-foreground">{num(season?.pass_completion)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download PNG
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated disabled:opacity-60"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {s.label}
            </a>
          ))}
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <LinkIcon className="h-3.5 w-3.5" />
            Copy link
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
