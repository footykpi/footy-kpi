import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Trophy,
  Medal,
  ScrollText,
  Sparkles,
  Upload,
  Play,
  X,
  Loader2,
  ImagePlus,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  FileCheck2,

} from "lucide-react";

import type { Highlight } from "@/lib/profile.functions";
import {
  uploadHighlight,
  deleteHighlight,
  uploadHighlightProof,
} from "@/lib/highlights.functions";
import {
  submitHighlightProof,
  reviewHighlightProof,
  VERIFIABLE_CATEGORIES,
} from "@/lib/verification.functions";


type Category = Highlight["category"];

const CATEGORIES: { value: Category; label: string; icon: typeof Trophy }[] = [
  { value: "moment", label: "Game-Winning Moments", icon: Sparkles },
  { value: "award", label: "Awards", icon: Trophy },
  { value: "certificate", label: "Certificates", icon: ScrollText },
  { value: "medal", label: "Tournament Medals", icon: Medal },
];

const ACCEPT = "image/*,video/*";
const PROOF_ACCEPT = "image/*,video/*,application/pdf";

function isVerifiable(category: Category) {
  return (VERIFIABLE_CATEGORIES as readonly string[]).includes(category);
}

function categoryMeta(value: Category) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[0]!;
}

function VerificationBadge({ status }: { status: Highlight["verification_status"] }) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
        <ShieldCheck className="h-3.5 w-3.5" />
        Verified
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground">
        <ShieldQuestion className="h-3.5 w-3.5" />
        Pending review
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-background px-2 py-0.5 text-xs font-semibold text-destructive">
        <ShieldAlert className="h-3.5 w-3.5" />
        Proof rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
      <ShieldQuestion className="h-3.5 w-3.5" />
      Unverified
    </span>
  );
}


export type HighlightsMode = "owner" | "coach" | "public";

export function HighlightsReel({
  highlights,
  mode = "public",
}: {
  highlights: Highlight[];
  mode?: HighlightsMode;
}) {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [uploadCategory, setUploadCategory] = useState<Category>("moment");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<Highlight | null>(null);

  const uploadHighlightFn = useServerFn(uploadHighlight);
  const deleteHighlightFn = useServerFn(deleteHighlight);
  const isOwner = mode === "owner";

  const visible = filter === "all" ? highlights : highlights.filter((h) => h.category === filter);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.set("file", file);
        body.set("category", uploadCategory);
        if (title.trim()) body.set("title", title.trim());
        await uploadHighlightFn({ data: body });
      }

      setTitle("");
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["my-portfolio"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function handleRemove(id: string) {
    try {
      await deleteHighlightFn({ data: { highlightId: id } });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["my-portfolio"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove highlight.");
    }
  }


  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl text-foreground">Highlights</h2>
        <span className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-muted-foreground">
          {highlights.length} {highlights.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Upload panel — the athlete only */}
      {isOwner && (
      <div className="mt-5 rounded-xl border border-dashed border-border bg-surface p-5">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const active = uploadCategory === category.value;
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => setUploadCategory(category.value)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Caption or moment title (optional)"
            className="w-full flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(event) => void handleFiles(event.target.files)}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInput.current?.click()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading…" : "Upload Photos or Videos"}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      </div>
      )}

      {/* Filters */}
      {highlights.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterPill>
          {CATEGORIES.map((category) => (
            <FilterPill
              key={category.value}
              active={filter === category.value}
              onClick={() => setFilter(category.value)}
            >
              {category.label}
            </FilterPill>
          ))}
        </div>
      )}

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl bg-surface p-10 text-center">
          <ImagePlus className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            No highlights here yet — upload game-winning moments, awards, certificates, or
            tournament medals.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((highlight) => {
            const meta = categoryMeta(highlight.category);
            const Icon = meta.icon;
            return (
              <div
                key={highlight.id}
                className="group relative overflow-hidden rounded-xl border border-border bg-surface"
              >
                <button
                  type="button"
                  onClick={() => setLightbox(highlight)}
                  className="block w-full text-left"
                >
                  <div className="relative aspect-video bg-background">
                    {highlight.media_type === "video" ? (
                      <>
                        <video
                          src={highlight.url}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/90 text-primary-foreground">
                            <Play className="h-5 w-5" />
                          </span>
                        </span>
                      </>
                    ) : (
                      <img
                        src={highlight.url}
                        alt={highlight.title ?? meta.label}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-primary">
                        <Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </div>
                      {isVerifiable(highlight.category) && (
                        <VerificationBadge status={highlight.verification_status} />
                      )}
                    </div>
                    <div className="mt-1 font-semibold text-foreground">
                      {highlight.title ?? "Untitled highlight"}
                    </div>
                    {highlight.caption && (
                      <p className="mt-1 text-sm text-muted-foreground">{highlight.caption}</p>
                    )}
                  </div>
                </button>
                {isVerifiable(highlight.category) && mode !== "public" && (
                  <VerificationPanel highlight={highlight} mode={mode} />
                )}

                {isOwner && (
                <button
                  type="button"
                  aria-label="Remove highlight"
                  onClick={() => void handleRemove(highlight.id)}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          className="p-safe-overlay fixed inset-0 z-50 flex items-center justify-center bg-background/90"
          onClick={() => setLightbox(null)}
        >
          <div
            className="max-h-full w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-background">
              {lightbox.media_type === "video" ? (
                <video src={lightbox.url} controls autoPlay className="max-h-[70vh] w-full" />
              ) : (
                <img
                  src={lightbox.url}
                  alt={lightbox.title ?? "Highlight"}
                  className="max-h-[70vh] w-full object-contain"
                />
              )}
            </div>
            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-primary">
                  {categoryMeta(lightbox.category).label}
                </div>
                <h3 className="mt-1 font-display text-2xl text-foreground">
                  {lightbox.title ?? "Untitled highlight"}
                </h3>
                {lightbox.caption && (
                  <p className="mt-1 text-sm text-muted-foreground">{lightbox.caption}</p>
                )}
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setLightbox(null)}
                className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-surface text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function VerificationPanel({
  highlight,
  mode,
}: {
  highlight: Highlight;
  mode: HighlightsMode;
}) {
  const queryClient = useQueryClient();
  const proofInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [note, setNote] = useState("");

  const uploadProofFn = useServerFn(uploadHighlightProof);
  const reviewProofFn = useServerFn(reviewHighlightProof);
  const isOwner = mode === "owner";
  const isCoach = mode === "coach";

  const status = highlight.verification_status;

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    await queryClient.invalidateQueries({ queryKey: ["my-portfolio"] });
    await queryClient.invalidateQueries({ queryKey: ["coach-athlete"] });
  }

  async function uploadProof(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("highlightId", highlight.id);
      await uploadProofFn({ data: body });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit proof.");
    } finally {
      setBusy(false);
      if (proofInput.current) proofInput.current.value = "";
    }
  }

  async function decide(decision: "verified" | "rejected") {
    if (!reviewerName.trim()) {
      setError("Add the reviewer's name (coach, club, or tournament official).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await reviewProofFn({
        data: {
          highlightId: highlight.id,
          decision,
          reviewerName: reviewerName.trim(),
          note: note.trim() || undefined,
        },
      });
      setReviewOpen(false);
      setNote("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the review.");
    } finally {
      setBusy(false);
    }
  }


  return (
    <div className="border-t border-border bg-background/40 p-4">
      {status === "verified" ? (
        <p className="text-xs text-muted-foreground">
          Approved{highlight.reviewer_name ? ` by ${highlight.reviewer_name}` : ""}
          {highlight.reviewed_at
            ? ` on ${new Date(highlight.reviewed_at).toLocaleDateString()}`
            : ""}
          .
        </p>
      ) : (
        <>
          <input
            ref={proofInput}
            type="file"
            accept={PROOF_ACCEPT}
            className="hidden"
            onChange={(event) => void uploadProof(event.target.files)}
          />

          {status === "pending" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {highlight.proof_url && (
                  <a
                    href={highlight.proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    <FileCheck2 className="h-3.5 w-3.5" />
                    View submitted proof
                  </a>
                )}
                {isCoach ? (
                <button
                  type="button"
                  onClick={() => setReviewOpen((open) => !open)}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {reviewOpen ? "Cancel review" : "Review proof"}
                </button>
                ) : (
                  <span className="text-xs text-muted-foreground">Waiting for your coach to review.</span>
                )}
              </div>

              {reviewOpen && (
                <div className="space-y-2">
                  <input
                    value={reviewerName}
                    onChange={(event) => setReviewerName(event.target.value)}
                    placeholder="Reviewer name (coach, club, official)"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Note (optional)"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void decide("verified")}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                    >
                      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void decide("rejected")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive disabled:opacity-60"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              {isOwner && (
              <button
                type="button"
                disabled={busy}
                onClick={() => proofInput.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-elevated disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {status === "rejected" ? "Upload new proof" : "Upload proof for verification"}
              </button>
              )}
              {status === "rejected" && highlight.verification_note && (
                <span className="text-xs text-muted-foreground">
                  Reviewer note: {highlight.verification_note}
                </span>
              )}
            </div>
          )}

          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </>
      )}
    </div>
  );
}
