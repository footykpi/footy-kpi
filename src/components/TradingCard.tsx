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
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  /** The portrait lives on a signed remote URL; inline it so the export can never miss it. */
  useEffect(() => {
    if (!photoUrl) return;
    let active = true;
    setPhotoDataUrl(null);
    (async () => {
      try {
        const res = await fetch(photoUrl, { mode: "cors", cache: "reload" });
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        });
        if (active) setPhotoDataUrl(dataUrl);
      } catch {
        if (active) setPhotoDataUrl(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [photoUrl]);

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



  /** Everything on the card must be loaded before the pixels are captured. */
  async function waitForCardReady(node: HTMLElement) {
    if (typeof document !== "undefined" && "fonts" in document) {
      try {
        await (document as Document & { fonts: FontFaceSet }).fonts.ready;
      } catch {
        // fonts unavailable — fall through to the bundled fallback family
      }
    }
    const images = Array.from(node.querySelectorAll("img"));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
              resolve();
              return;
            }
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
            setTimeout(resolve, 4000);
          }),
      ),
    );
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  async function renderBlob(): Promise<Blob | null> {
    const node = cardRef.current;
    if (!node) return null;
    await waitForCardReady(node);

    const options = {
      pixelRatio: 2,
      cacheBust: true,
      width: node.offsetWidth,
      height: node.offsetHeight,
    } as const;

    // The first pass primes caches — some browsers return a blank canvas otherwise.
    await toPng(node, options).catch(() => "");
    let dataUrl = await toPng(node, options).catch(() => "");
    // Remote font stylesheets can't always be inlined; retry without them rather than fail.
    if (!dataUrl || dataUrl.length < 5000) {
      dataUrl = await toPng(node, { ...options, skipFonts: true });
    }
    if (!dataUrl || dataUrl.length < 5000) throw new Error("Empty card render");
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
          {/* Foil border frame — colors are literal hex so the exported PNG never
              depends on CSS theme variables resolving inside the capture. */}
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
                  "radial-gradient(120% 90% at 50% 0%, #322c5a 0%, #16142b 60%, #05050f 100%)",
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
              <div
                className="relative z-10 flex items-center justify-between px-3 py-1.5"
                style={{ background: "#6d4bf6" }}
              >
                <span
                  className="font-display text-[15px] tracking-[0.22em]"
                  style={{ color: "#ffffff" }}
                >
                  {(profile.team ?? "").toUpperCase()}
                </span>
                <span
                  className="font-display text-[13px] tracking-[0.18em]"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  {season?.season ?? "SEASON"}
                </span>
              </div>

              {/* Portrait window */}
              <div
                className="relative mx-[10px] mt-[10px] overflow-hidden rounded-[10px]"
                style={{ border: "2px solid rgba(254,240,138,0.5)" }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(90% 70% at 50% 20%, rgba(109,75,246,0.45) 0%, rgba(109,75,246,0) 70%)",
                  }}
                />
                <img
                  src={photoDataUrl ?? photoUrl}
                  alt={fullName}
                  {...(photoDataUrl ? {} : { crossOrigin: "anonymous" as const })}
                  className="relative h-[290px] w-full object-cover"
                />
                {/* position tab */}
                <span
                  className="absolute left-0 top-3 rounded-r-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
                  style={{ background: "rgba(0,0,0,0.75)", color: "#fef08a" }}
                >
                  {profile.position ?? "Player"}
                </span>
                {/* jersey roundel */}
                {profile.jersey_number && (
                  <span
                    className="absolute bottom-3 right-3 flex h-14 w-14 items-center justify-center rounded-full font-display text-3xl leading-none"
                    style={{
                      color: "#ffffff",
                      background:
                        "radial-gradient(circle at 30% 25%, #9c86f9 0%, #6d4bf6 70%)",
                      boxShadow: "0 0 0 3px rgba(255,246,201,.75), 0 6px 14px rgba(0,0,0,.5)",
                    }}
                  >
                    {profile.jersey_number}
                  </span>
                )}
              </div>

              {/* Name plate */}
              <div
                className="relative z-10 mx-[10px] mt-[10px] rounded-md px-3 py-2 text-center"
                style={{
                  border: "1px solid rgba(254,240,138,0.4)",
                  background:
                    "linear-gradient(180deg, rgba(255,246,201,.14) 0%, rgba(0,0,0,.35) 100%)",
                }}
              >
                <h3
                  className="font-display text-[30px] uppercase leading-none tracking-wide"
                  style={{ color: "#f8f8fc" }}
                >
                  {fullName}
                </h3>
                <p
                  className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: "rgba(254,240,138,0.9)" }}
                >
                  Class of {profile.graduation_year ?? "—"}
                  {profile.height ? ` • ${profile.height}` : ""}
                  {profile.dominant_hand ? ` • ${profile.dominant_hand} foot` : ""}
                </p>
              </div>

              {/* Stat strip */}
              <div className="relative z-10 px-[10px] pb-1 pt-2">
                <div
                  className="grid grid-cols-4 overflow-hidden rounded-md"
                  style={{ border: "1px solid rgba(255,255,255,0.14)" }}
                >
                  {[
                    { label: "GP", value: num(season?.games_played) },
                    { label: "G", value: num(season?.goals) },
                    { label: "A", value: num(season?.assists) },
                    { label: "MVP", value: num(season?.mvp_awards) },
                  ].map((s, i) => (
                    <div
                      key={s.label}
                      className="py-1.5 text-center"
                      style={{
                        background: "rgba(0,0,0,0.35)",
                        ...(i > 0 ? { borderLeft: "1px solid rgba(255,255,255,0.12)" } : {}),
                      }}
                    >
                      <div
                        className="font-display text-[22px] leading-none"
                        style={{ color: "#f8f8fc" }}
                      >
                        {s.value}
                      </div>
                      <div
                        className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em]"
                        style={{ color: "#a3a8bd" }}
                      >
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-1 grid grid-cols-3 overflow-hidden rounded-md text-center"
                  style={{ border: "1px solid rgba(255,255,255,0.14)" }}
                >
                  {[
                    { label: "Record", value: record(games) },
                    { label: "Min", value: num(season?.minutes_played) },
                    { label: "Pass %", value: num(season?.pass_completion) },
                  ].map((s, i) => (
                    <div
                      key={s.label}
                      className="py-1"
                      style={{
                        background: "rgba(0,0,0,0.25)",
                        ...(i > 0 ? { borderLeft: "1px solid rgba(255,255,255,0.12)" } : {}),
                      }}
                    >
                      <div className="text-[13px] font-semibold" style={{ color: "#f8f8fc" }}>
                        {s.value}
                      </div>
                      <div
                        className="text-[9px] uppercase tracking-[0.14em]"
                        style={{ color: "#a3a8bd" }}
                      >
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer / serial + QR */}
              <div className="relative z-10 flex items-end justify-between gap-2 px-[12px] pb-2 pt-1">
                <div>
                  <span
                    className="block font-display text-[12px] tracking-[0.28em]"
                    style={{ color: "rgba(254,240,138,0.8)" }}
                  >
                    FOOTY KPI
                  </span>
                  <span
                    className="text-[9px] font-medium uppercase tracking-[0.16em]"
                    style={{ color: "#a3a8bd" }}
                  >
                    No. {(profile.jersey_number ?? 1).toString().padStart(3, "0")} · Official Rookie
                  </span>
                </div>
                {qrDataUrl && (
                  <div className="flex flex-col items-center gap-0.5">
                    <img
                      src={qrDataUrl}
                      alt={`Scan to view ${fullName}'s profile`}
                      className="h-[52px] w-[52px] rounded-[3px] p-[3px]"
                      style={{ background: "#ffffff", border: "1px solid rgba(254,240,138,0.6)" }}
                    />
                    <span
                      className="text-[7px] font-bold uppercase tracking-[0.12em]"
                      style={{ color: "#a3a8bd" }}
                    >
                      Scan profile
                    </span>
                  </div>
                )}
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
