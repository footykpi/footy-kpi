import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, ImagePlus, Loader2, Mail, Pencil, Trash2, UserPlus } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { AccessLinks } from "@/components/AccessLinks";
import { AiInsights } from "@/components/AiInsights";
import { GameEntryForm } from "@/components/GameEntryForm";
import { GameLog } from "@/components/GameLog";
import { HighlightsReel } from "@/components/HighlightsReel";
import { ProgressCharts } from "@/components/ProgressCharts";
import { SeasonJournal } from "@/components/SeasonJournal";
import { SeasonStatsEditor } from "@/components/SeasonStatsEditor";
import { TradingCard } from "@/components/TradingCard";
import { getMyAccount, saveMyProfile } from "@/lib/account.functions";
import { removeProfilePhoto, uploadProfilePhoto } from "@/lib/profile-photo.functions";
import { inviteCoach, listMyCoaches, removeCoachLink } from "@/lib/coach.functions";
import { getMyPortfolio } from "@/lib/profile.functions";
import playerPhoto from "@/assets/player-photo.jpg";

export const Route = createFileRoute("/_authenticated/athlete")({
  head: () => ({
    meta: [
      { title: "Athlete dashboard | Footy KPI" },
      { name: "description", content: "Manage your football profile, stats, games, and media." },
      { property: "og:title", content: "Athlete dashboard | Footy KPI" },
      { property: "og:description", content: "Manage your football profile, stats, games, and media." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AthleteDashboard,
});

const FIELDS = [
  { key: "first_name", label: "First name" },
  { key: "last_name", label: "Last name" },
  { key: "team", label: "Team / club" },
  { key: "jersey_number", label: "Jersey number" },
  { key: "position", label: "Position" },
  { key: "graduation_year", label: "Graduation year" },
  { key: "height", label: "Height" },
  { key: "weight", label: "Weight" },
  { key: "dominant_hand", label: "Dominant foot" },
  { key: "gpa", label: "GPA (optional)" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];
type FormState = Record<FieldKey | "bio", string> & {
  visibility: "public" | "private";
};

const EMPTY: FormState = {
  first_name: "",
  last_name: "",
  team: "",
  jersey_number: "",
  position: "",
  graduation_year: "",
  height: "",
  weight: "",
  dominant_hand: "",
  gpa: "",
  bio: "",
  
  visibility: "private",
};

function AthleteDashboard() {
  const queryClient = useQueryClient();
  const fetchAccount = useServerFn(getMyAccount);
  const saveProfile = useServerFn(saveMyProfile);
  const fetchCoaches = useServerFn(listMyCoaches);
  const invite = useServerFn(inviteCoach);
  const removeCoach = useServerFn(removeCoachLink);
  const sendPhoto = useServerFn(uploadProfilePhoto);
  const clearPhoto = useServerFn(removeProfilePhoto);

  const photoInput = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [coachEmail, setCoachEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  const { data: account } = useQuery({ queryKey: ["my-account"], queryFn: () => fetchAccount({}) });
  const slug = account?.profileSlug ?? null;

  const fetchPortfolio = useServerFn(getMyPortfolio);
  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["my-portfolio", slug],
    enabled: Boolean(slug),
    queryFn: () => fetchPortfolio({}),
  });

  const { data: coaches = [] } = useQuery({
    queryKey: ["my-coaches"],
    queryFn: () => fetchCoaches({}),
  });

  const profile = portfolio?.profile;

  useEffect(() => {
    if (!profile) return;
    setForm({
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      team: profile.team ?? "",
      jersey_number: profile.jersey_number ?? "",
      position: profile.position ?? "",
      graduation_year: profile.graduation_year ? String(profile.graduation_year) : "",
      height: profile.height ?? "",
      weight: profile.weight ?? "",
      dominant_hand: profile.dominant_hand ?? "",
      gpa: profile.gpa ? String(profile.gpa) : "",
      bio: profile.bio ?? "",
      
      visibility: profile.visibility === "public" ? "public" : "private",
    });
  }, [profile]);

  const save = useMutation({
    mutationFn: () =>
      saveProfile({
        data: {
          first_name: form.first_name.trim() || "Athlete",
          last_name: form.last_name.trim(),
          team: form.team.trim(),
          jersey_number: form.jersey_number.trim() || null,
          position: form.position.trim() || null,
          graduation_year: form.graduation_year.trim() || null,
          height: form.height.trim() || null,
          weight: form.weight.trim() || null,
          dominant_hand: form.dominant_hand.trim() || null,
          gpa: form.gpa.trim() || null,
          bio: form.bio.trim() || null,
          
          visibility: form.visibility,
        },
      }),
    onSuccess: async () => {
      setSaved(true);
      setEditing(false);
      await queryClient.invalidateQueries({ queryKey: ["my-portfolio"] });
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const sendInvite = useMutation({
    mutationFn: () => invite({ data: { email: coachEmail.trim() } }),
    onSuccess: async () => {
      setCoachEmail("");
      await queryClient.invalidateQueries({ queryKey: ["my-coaches"] });
    },
  });

  const drop = useMutation({
    mutationFn: (id: string) => removeCoach({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-coaches"] }),
  });

  const uploadPhoto = useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.set("file", file);
      return sendPhoto({ data: body });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-portfolio"] }),
  });

  const dropPhoto = useMutation({
    mutationFn: () => clearPhoto({}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-portfolio"] }),
  });


  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }) as FormState);

  const games = (portfolio?.games ?? []).filter((g) => g.sport === "soccer");
  const season = (portfolio?.stats ?? []).find((s) => s.sport === "soccer");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader email={account?.email ?? null}>
        {slug && (
          <Link
            to="/p/$slug"
            params={{ slug }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-elevated"
          >
            <ExternalLink className="h-4 w-4" />
            View public profile
          </Link>
        )}
      </AppHeader>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <div>
          <h1 className="font-display text-4xl text-foreground">Your portfolio</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything here is yours to edit. Keep it private while you build it, then switch to
            public when you're ready to share.
          </p>
        </div>

        {isLoading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your portfolio…
          </p>
        )}

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-foreground">Profile details</h2>
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-elevated"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>

          {!editing ? (
            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-4">
                <img
                  src={profile?.photo_url ?? playerPhoto}
                  alt={`${form.first_name} ${form.last_name}`.trim() || "Profile photo"}
                  className="h-20 w-20 rounded-full border border-border object-cover"
                />
                <div>
                  <p className="font-display text-2xl text-foreground">
                    {`${form.first_name} ${form.last_name}`.trim() || "Athlete"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {[form.position, form.team].filter(Boolean).join(" · ") || "No team or position yet"}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      form.visibility === "public"
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface text-muted-foreground"
                    }`}
                  >
                    {form.visibility}
                  </span>
                </div>
              </div>
              <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {FIELDS.filter(
                  ({ key }) => !["first_name", "last_name", "team", "position"].includes(key),
                ).map(({ key, label }) => (
                  <div key={key}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">{form[key] || "—"}</dd>
                  </div>
                ))}
              </dl>
              {form.bio && (
                <div className="mt-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Bio
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-foreground">{form.bio}</p>
                </div>
              )}
            </div>
          ) : (
            <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {FIELDS.map(({ key, label }) => (
              <label key={key} className="text-sm font-medium text-foreground">
                {label}
                <input
                  value={form[key]}
                  onChange={(event) => set(key, event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>
            ))}
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-foreground">Profile photo</p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <img
                  src={profile?.photo_url ?? playerPhoto}
                  alt={`${form.first_name} ${form.last_name}`.trim() || "Profile photo"}
                  className="h-20 w-20 rounded-full border border-border object-cover"
                />
                <input
                  ref={photoInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) uploadPhoto.mutate(file);
                  }}
                />
                <button
                  type="button"
                  disabled={uploadPhoto.isPending}
                  onClick={() => photoInput.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-elevated disabled:opacity-60"
                >
                  {uploadPhoto.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                  {profile?.photo_url ? "Change photo" : "Upload photo"}
                </button>
                {profile?.photo_url && (
                  <button
                    type="button"
                    disabled={dropPhoto.isPending}
                    onClick={() => dropPhoto.mutate()}
                    className="text-sm text-muted-foreground hover:text-destructive disabled:opacity-60"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                JPG or PNG from your phone or computer, up to 8MB.
              </p>
              {(uploadPhoto.isError || dropPhoto.isError) && (
                <p className="mt-2 text-sm text-destructive">
                  {(uploadPhoto.error ?? dropPhoto.error) instanceof Error
                    ? ((uploadPhoto.error ?? dropPhoto.error) as Error).message
                    : "Could not update your photo."}
                </p>
              )}
            </div>
            <label className="text-sm font-medium text-foreground sm:col-span-2">
              Bio
              <textarea
                value={form.bio}
                onChange={(event) => set("bio", event.target.value)}
                rows={4}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {(["private", "public"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => set("visibility", value)}
                aria-pressed={form.visibility === value}
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                  form.visibility === value
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {value}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                if (profile) {
                  setForm({
                    first_name: profile.first_name ?? "",
                    last_name: profile.last_name ?? "",
                    team: profile.team ?? "",
                    jersey_number: profile.jersey_number ?? "",
                    position: profile.position ?? "",
                    graduation_year: profile.graduation_year ? String(profile.graduation_year) : "",
                    height: profile.height ?? "",
                    weight: profile.weight ?? "",
                    dominant_hand: profile.dominant_hand ?? "",
                    gpa: profile.gpa ? String(profile.gpa) : "",
                    bio: profile.bio ?? "",
                    visibility: profile.visibility === "public" ? "public" : "private",
                  });
                }
                setEditing(false);
              }}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-elevated"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={save.isPending}
              onClick={() => save.mutate()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {saved ? "Saved" : "Save profile"}
            </button>
          </div>
          {save.isError && (
            <p className="mt-3 text-sm text-destructive">
              {save.error instanceof Error ? save.error.message : "Could not save your profile."}
            </p>
          )}
            </>
          )}
        </section>

        {profile && (
          <>
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-2xl text-foreground">Season stats</h2>
                <TradingCard
                  profile={profile}
                  season={season}
                  games={games}
                  photoUrl={profile.photo_url ?? playerPhoto}
                />
              </div>
              <div className="mt-5">
                <SeasonStatsEditor profileId={profile.id} season={season} />
              </div>
            </section>

            <HighlightsReel highlights={portfolio?.highlights ?? []} mode="owner" />

            <AiInsights profileId={profile.id} />

            <ProgressCharts games={games} />

            <GameEntryForm position={profile.position} />

            <GameLog games={games} />

            <SeasonJournal games={games} editable />

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
                <UserPlus className="h-5 w-5 text-indigo-light" />
                Your coaches
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Invite a coach by email. Once they accept, they can review your stats and awards
                and approve the proof you submit.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={coachEmail}
                  onChange={(event) => setCoachEmail(event.target.value)}
                  placeholder="coach@club.com"
                  className="w-full flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="button"
                  disabled={sendInvite.isPending || !coachEmail.trim()}
                  onClick={() => sendInvite.mutate()}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {sendInvite.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  Invite coach
                </button>
              </div>
              {sendInvite.isError && (
                <p className="mt-3 text-sm text-destructive">
                  {sendInvite.error instanceof Error
                    ? sendInvite.error.message
                    : "Could not send the invite."}
                </p>
              )}

              <ul className="mt-5 space-y-2">
                {coaches.length === 0 && (
                  <li className="text-sm text-muted-foreground">No coaches invited yet.</li>
                )}
                {coaches.map((link) => (
                  <li
                    key={link.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">{link.coach_email}</p>
                      <p className="text-xs capitalize text-muted-foreground">{link.status}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => drop.mutate(link.id)}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <AccessLinks slug={profile.slug} />
          </>
        )}
      </main>
    </div>
  );
}
