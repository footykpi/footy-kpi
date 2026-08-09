import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, PencilLine, Save, X } from "lucide-react";
import { toast } from "sonner";

import { saveSeasonStats } from "@/lib/season-stats.functions";
import type { SeasonStats } from "@/lib/profile.functions";

type FieldKey =
  | "games_played"
  | "goals"
  | "assists"
  | "shots"
  | "shots_on_goal"
  | "minutes_played"
  | "yellow_cards"
  | "red_cards"
  | "penalty_kicks"
  | "pk_saves"
  | "saves"
  | "clean_sheets"
  | "fouls"
  | "tackles"
  | "interceptions"
  | "headers_won"
  | "mvp_awards"
  | "pass_completion";

const GROUPS: { title: string; fields: { key: FieldKey; label: string; suffix?: string }[] }[] = [
  {
    title: "Attacking",
    fields: [
      { key: "goals", label: "Goals" },
      { key: "assists", label: "Assists" },
      { key: "shots", label: "Shots" },
      { key: "shots_on_goal", label: "Shots on goal" },
      { key: "penalty_kicks", label: "Penalty kicks" },
      { key: "headers_won", label: "Headers won" },
    ],
  },
  {
    title: "Defending & goalkeeping",
    fields: [
      { key: "tackles", label: "Tackles" },
      { key: "interceptions", label: "Interceptions" },
      { key: "saves", label: "Saves" },
      { key: "pk_saves", label: "PK saves" },
      { key: "clean_sheets", label: "Clean sheets" },
      { key: "fouls", label: "Fouls" },
    ],
  },
  {
    title: "Playing time & discipline",
    fields: [
      { key: "games_played", label: "Games played" },
      { key: "minutes_played", label: "Minutes played" },
      { key: "pass_completion", label: "Pass completion", suffix: "%" },
      { key: "yellow_cards", label: "Yellow cards" },
      { key: "red_cards", label: "Red cards" },
      { key: "mvp_awards", label: "MVP awards" },
    ],
  },
];

type FormState = Record<FieldKey, string> & { season: string };

function toForm(season: SeasonStats | undefined): FormState {
  const value = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v));
  return {
    season: season?.season ?? String(new Date().getFullYear()),
    games_played: value(season?.games_played),
    goals: value(season?.goals),
    assists: value(season?.assists),
    shots: value(season?.shots),
    shots_on_goal: value(season?.shots_on_goal),
    minutes_played: value(season?.minutes_played),
    yellow_cards: value(season?.yellow_cards),
    red_cards: value(season?.red_cards),
    penalty_kicks: value(season?.penalty_kicks),
    pk_saves: value(season?.pk_saves),
    saves: value(season?.saves),
    clean_sheets: value(season?.clean_sheets),
    fouls: value(season?.fouls),
    tackles: value(season?.tackles),
    interceptions: value(season?.interceptions),
    headers_won: value(season?.headers_won),
    mvp_awards: value(season?.mvp_awards),
    pass_completion: value(season?.pass_completion),
  };
}

export function SeasonStatsEditor({
  profileId,
  season,
}: {
  profileId: string;
  season: SeasonStats | undefined;
}) {
  const queryClient = useQueryClient();
  const save = useServerFn(saveSeasonStats);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => toForm(season));

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const num = (key: FieldKey, decimals = false) => {
        const raw = form[key].trim();
        if (raw === "") return null;
        const parsed = decimals ? Number.parseFloat(raw) : Number.parseInt(raw, 10);
        if (Number.isNaN(parsed) || parsed < 0) throw new Error(`Enter a valid number for ${key}`);
        return parsed;
      };

      const seasonLabel = form.season.trim();
      if (seasonLabel.length < 2) throw new Error("Enter a season label, e.g. 2026");

      const pass = num("pass_completion", true);
      if (pass !== null && pass > 100) throw new Error("Pass completion must be 0–100%");

      return save({
        data: {
          profileId,
          season: seasonLabel,
          games_played: num("games_played"),
          goals: num("goals"),
          assists: num("assists"),
          shots: num("shots"),
          shots_on_goal: num("shots_on_goal"),
          minutes_played: num("minutes_played"),
          yellow_cards: num("yellow_cards"),
          red_cards: num("red_cards"),
          penalty_kicks: num("penalty_kicks"),
          pk_saves: num("pk_saves"),
          saves: num("saves"),
          clean_sheets: num("clean_sheets"),
          fouls: num("fouls"),
          tackles: num("tackles"),
          interceptions: num("interceptions"),
          headers_won: num("headers_won"),
          mvp_awards: num("mvp_awards"),
          pass_completion: pass,
        },
      });
    },
    onSuccess: async () => {
      toast.success("Season stats saved");
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: Error) => toast.error(error.message || "Could not save season stats"),
  });

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setForm(toForm(season));
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <PencilLine className="h-4 w-4" />
        {season ? "Edit season stats" : "Add season stats"}
      </button>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
      className="mt-6 rounded-2xl border border-border bg-surface p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Season
          </span>
          <input
            value={form.season}
            onChange={(event) => set("season", event.target.value)}
            maxLength={20}
            placeholder="2026"
            className="mt-1 w-32 rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary"
          />
        </label>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>

      <div className="mt-6 space-y-6">
        {GROUPS.map((group) => (
          <fieldset key={group.title}>
            <legend className="font-display text-lg tracking-wide text-foreground">
              {group.title}
            </legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.fields.map((field) => (
                <label key={field.key} className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {field.label}
                    {field.suffix ? ` (${field.suffix})` : ""}
                  </span>
                  <input
                    type="number"
                    min={0}
                    {...(field.key === "pass_completion"
                      ? { max: 100, step: "0.1" }
                      : { step: "1" })}
                    inputMode="decimal"
                    value={form[field.key]}
                    onChange={(event) => set(field.key, event.target.value)}
                    placeholder="—"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary"
                  />
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {mutation.isSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {mutation.isPending ? "Saving…" : "Save season stats"}
        </button>
        <p className="text-xs text-muted-foreground">
          Leave a field blank to keep it off the portfolio.
        </p>
      </div>
    </form>
  );
}
