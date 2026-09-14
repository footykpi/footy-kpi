import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { addGame } from "@/lib/games.functions";
import { isGoalkeeper } from "@/lib/season-stats-validation";

const GAME_STATS = [
  { key: "goals", label: "Goals" },
  { key: "assists", label: "Assists" },
  { key: "shots", label: "Shots" },
  { key: "shots_on_goal", label: "Shots on goal" },
  { key: "minutes_played", label: "Minutes" },
  { key: "tackles", label: "Tackles" },
  { key: "interceptions", label: "Interceptions" },
  { key: "yellow_cards", label: "Yellow cards" },
  { key: "red_cards", label: "Red cards" },
] as const;

const KEEPER_STATS = [
  { key: "goals_conceded", label: "Goals against" },
  { key: "shots_faced", label: "Shots faced" },
  { key: "saves", label: "Saves" },
  { key: "clean_sheets", label: "Clean sheet (1/0)" },
  { key: "pk_faced", label: "PKs faced" },
  { key: "pk_saves", label: "PKs saved" },
  { key: "high_claims", label: "High claims" },
  { key: "punches", label: "Punches" },
  { key: "catches", label: "Catches" },
] as const;

const MOODS = ["confident", "proud", "focused", "frustrated", "tired", "nervous"] as const;

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY = {
  gameDate: today(),
  opponent: "",
  location: "",
  season: "",
  teamScore: "",
  opponentScore: "",
  performanceRating: "",
  mood: "",
  coachNotes: "",
  playerReflection: "",
};

function toNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function GameEntryForm({ position }: { position?: string | null }) {
  const keeper = isGoalkeeper(position);
  const queryClient = useQueryClient();
  const submitGame = useServerFn(addGame);
  const [open, setOpen] = useState(false);
  const [showKeeper, setShowKeeper] = useState(keeper);
  const [form, setForm] = useState({ ...EMPTY });
  const [stats, setStats] = useState<Record<string, string>>({});

  const set = (key: keyof typeof EMPTY, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const create = useMutation({
    mutationFn: () =>
      submitGame({
        data: {
          gameDate: form.gameDate,
          opponent: form.opponent.trim(),
          location: form.location.trim(),
          season: form.season.trim(),
          teamScore: toNumber(form.teamScore),
          opponentScore: toNumber(form.opponentScore),
          performanceRating: toNumber(form.performanceRating),
          mood: form.mood,
          coachNotes: form.coachNotes.trim(),
          playerReflection: form.playerReflection.trim(),
          stats: Object.fromEntries(
            Object.entries(stats).map(([key, value]) => [key, toNumber(value)]),
          ),
        },
      }),
    onSuccess: async () => {
      setForm({ ...EMPTY });
      setStats({});
      setOpen(false);
      toast.success("Game added to your log");
      await queryClient.invalidateQueries({ queryKey: ["my-portfolio"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save the game."),
  });

  const canSave = form.opponent.trim().length > 0 && form.gameDate !== "" && !create.isPending;

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-foreground">Add a game</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Log the opponent, score, your stats, and how it felt.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {open ? "Close" : "New game"}
        </button>
      </div>

      {open && (
        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSave) create.mutate();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-foreground">
              Date
              <input
                type="date"
                required
                value={form.gameDate}
                onChange={(event) => set("gameDate", event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium text-foreground">
              Opponent
              <input
                required
                value={form.opponent}
                onChange={(event) => set("opponent", event.target.value)}
                placeholder="Riverside United"
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium text-foreground">
              Location
              <input
                value={form.location}
                onChange={(event) => set("location", event.target.value)}
                placeholder="Home"
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium text-foreground">
              Season
              <input
                value={form.season}
                onChange={(event) => set("season", event.target.value)}
                placeholder="2026"
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium text-foreground">
              Your team score
              <input
                type="number"
                min={0}
                value={form.teamScore}
                onChange={(event) => set("teamScore", event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium text-foreground">
              Opponent score
              <input
                type="number"
                min={0}
                value={form.opponentScore}
                onChange={(event) => set("opponentScore", event.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Your stats for this game</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {GAME_STATS.map((stat) => (
                <label key={stat.key} className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                  <input
                    type="number"
                    min={0}
                    value={stats[stat.key] ?? ""}
                    onChange={(event) =>
                      setStats((prev) => ({ ...prev, [stat.key]: event.target.value }))
                    }
                    className={inputClass}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-foreground">
              Performance rating (1–5)
              <input
                type="number"
                min={1}
                max={5}
                value={form.performanceRating}
                onChange={(event) => set("performanceRating", event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium text-foreground">
              Mood
              <select
                value={form.mood}
                onChange={(event) => set("mood", event.target.value)}
                className={inputClass}
              >
                <option value="">Not set</option>
                {MOODS.map((mood) => (
                  <option key={mood} value={mood}>
                    {mood}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-foreground sm:col-span-2">
              Coach notes
              <textarea
                rows={3}
                value={form.coachNotes}
                onChange={(event) => set("coachNotes", event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium text-foreground sm:col-span-2">
              Your reflection
              <textarea
                rows={3}
                value={form.playerReflection}
                onChange={(event) => set("playerReflection", event.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={!canSave}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save game
          </button>
        </form>
      )}
    </section>
  );
}
