import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import QRCode from "qrcode";
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
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!shareUrl) return;
    let active = true;
    QRCode.toDataURL(shareUrl, {
      margin: 0,
      width: 240,
      errorCorrectionLevel: "M",
      color: { dark: "#0a0a1a", light: "#ffffff" },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => setQrDataUrl(null));
    return () => {
      active = false;
    };
  }, [shareUrl]);



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
          {/* Foil border frame */}
          <div
            ref={cardRef}
            className="w-[330px] rounded-[20px] p-[6px]"
            style={{
              background:
                "linear-gradient(135deg, #f2e6a8 0%, #b9932f 18%, #fff6c9 32%, #8d6c1c 48%, #e8d78a 64%, #6f5410 82%, #f6ecb6 100%)",
              boxShadow: "0 24px 50px -20px rgba(0,0,0,.75)",
            }}
          >
            <div
              className="relative overflow-hidden rounded-[15px] border border-black/40"
              style={{
                background:
                  "radial-gradient(120% 90% at 50% 0%, var(--surface-elevated) 0%, var(--background) 60%, #05050f 100%)",
              }}
            >
              {/* holographic sheen */}
              <div
                className="pointer-events-none absolute inset-0 z-20 opacity-[0.16]"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 20%, #ffffff 38%, transparent 46%, #7df9ff 58%, transparent 66%, #ff8ae2 78%, transparent 88%)",
                  mixBlendMode: "screen",
                }}
              />

              {/* Team banner */}
              <div className="relative z-10 flex items-center justify-between bg-primary px-3 py-1.5">
                <span className="font-display text-[15px] tracking-[0.22em] text-primary-foreground">
                  {(profile.team ?? "").toUpperCase()}
                </span>
                <span className="font-display text-[13px] tracking-[0.18em] text-primary-foreground/80">
                  {season?.season ?? "SEASON"}
                </span>
              </div>

              {/* Portrait window */}
              <div className="relative mx-[10px] mt-[10px] overflow-hidden rounded-[10px] border-2 border-yellow-200/50">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(90% 70% at 50% 20%, color-mix(in oklab, var(--primary) 45%, transparent) 0%, transparent 70%)",
                  }}
                />
                <img
                  src={photoUrl}
                  alt={fullName}
                  crossOrigin="anonymous"
                  className="relative h-[290px] w-full object-cover"
                />
                {/* position tab */}
                <span className="absolute left-0 top-3 rounded-r-md bg-black/75 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-200">
                  {profile.position ?? "Player"}
                </span>
                {/* jersey roundel */}
                {profile.jersey_number && (
                  <span
                    className="absolute bottom-3 right-3 flex h-14 w-14 items-center justify-center rounded-full font-display text-3xl leading-none text-primary-foreground"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 25%, color-mix(in oklab, var(--primary) 80%, white) 0%, var(--primary) 70%)",
                      boxShadow: "0 0 0 3px rgba(255,246,201,.75), 0 6px 14px rgba(0,0,0,.5)",
                    }}
                  >
                    {profile.jersey_number}
                  </span>
                )}
              </div>

              {/* Name plate */}
              <div
                className="relative z-10 mx-[10px] mt-[10px] rounded-md border border-yellow-200/40 px-3 py-2 text-center"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,246,201,.14) 0%, rgba(0,0,0,.35) 100%)",
                }}
              >
                <h3 className="font-display text-[30px] uppercase leading-none tracking-wide text-foreground">
                  {fullName}
                </h3>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-200/90">
                  Class of {profile.graduation_year ?? "—"}
                  {profile.height ? ` • ${profile.height}` : ""}
                  {profile.dominant_hand ? ` • ${profile.dominant_hand} foot` : ""}
                </p>
              </div>

              {/* Stat strip */}
              <div className="relative z-10 px-[10px] pb-1 pt-2">
                <div className="grid grid-cols-4 overflow-hidden rounded-md border border-border/70">
                  {[
                    { label: "GP", value: num(season?.games_played) },
                    { label: "G", value: num(season?.goals) },
                    { label: "A", value: num(season?.assists) },
                    { label: "MVP", value: num(season?.mvp_awards) },
                  ].map((s, i) => (
                    <div
                      key={s.label}
                      className={`bg-black/35 py-1.5 text-center ${i > 0 ? "border-l border-border/60" : ""}`}
                    >
                      <div className="font-display text-[22px] leading-none text-foreground">
                        {s.value}
                      </div>
                      <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-1 grid grid-cols-3 overflow-hidden rounded-md border border-border/70 text-center">
                  {[
                    { label: "Record", value: record(games) },
                    { label: "Min", value: num(season?.minutes_played) },
                    { label: "Pass %", value: num(season?.pass_completion) },
                  ].map((s, i) => (
                    <div
                      key={s.label}
                      className={`bg-black/25 py-1 ${i > 0 ? "border-l border-border/60" : ""}`}
                    >
                      <div className="text-[13px] font-semibold text-foreground">{s.value}</div>
                      <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer / serial */}
              <div className="relative z-10 flex items-center justify-between px-[12px] pb-2 pt-1">
                <span className="font-display text-[12px] tracking-[0.28em] text-yellow-200/80">
                  ATHLETEFOLIO
                </span>
                <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  No. {(profile.jersey_number ?? 1).toString().padStart(3, "0")} · Official Rookie
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
