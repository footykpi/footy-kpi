import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, Check, PencilLine, Save, X } from "lucide-react";
import { toast } from "sonner";

import { saveSeasonStats } from "@/lib/season-stats.functions";
import {
  crossFieldErrors,
  goalsAgainstAverage,
  KEEPER_FIELD_KEYS,
  savePercentage,
  STAT_FIELD_KEYS,
  STAT_RULES,
  validateField,
  validateSeasonLabel,
  type StatFieldKey,
  type StatValues,
} from "@/lib/season-stats-validation";
import type { SeasonStats } from "@/lib/profile.functions";

type FieldKey = StatFieldKey;

const GROUPS: { title: string; fields: FieldKey[] }[] = [
  {
    title: "Attacking",
    fields: ["goals", "assists", "shots", "shots_on_goal", "penalty_kicks", "headers_won"],
  },
  {
    title: "Defending",
    fields: ["tackles", "interceptions", "fouls"],
  },
  {
    title: "Goalkeeping",
    fields: [...KEEPER_FIELD_KEYS],
  },
  {
    title: "Playing time & discipline",
    fields: [
      "games_played",
      "minutes_played",
      "pass_completion",
      "yellow_cards",
      "red_cards",
      "mvp_awards",
    ],
  },
];

type FormState = Record<FieldKey, string> & { season: string };

function toForm(season: SeasonStats | undefined): FormState {
  const value = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v));
  const entries = STAT_FIELD_KEYS.map((key) => [
    key,
    value((season as unknown as Record<string, number | null | undefined>)?.[key]),
  ]);
  return {
    ...(Object.fromEntries(entries) as Record<FieldKey, string>),
    season: season?.season ?? String(new Date().getFullYear()),
  };
}

function parsed(form: FormState): StatValues {
  return Object.fromEntries(
    STAT_FIELD_KEYS.map((key) => {
      const raw = form[key].trim();
      return [key, raw === "" ? null : Number(raw)];
    }),
  ) as StatValues;
}

type Errors = Partial<Record<FieldKey | "season", string>>;

function validateAll(form: FormState): Errors {
  const errors: Errors = {};
  const seasonError = validateSeasonLabel(form.season);
  if (seasonError) errors.season = seasonError;

  let hasFieldError = false;
  for (const key of STAT_FIELD_KEYS) {
    const message = validateField(key, form[key]);
    if (message) {
      errors[key] = message;
      hasFieldError = true;
    }
  }
  if (!hasFieldError) Object.assign(errors, crossFieldErrors(parsed(form)));
  return errors;
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validateAll(form), [form]);
  const errorCount = Object.keys(errors).length;
  const showError = (key: FieldKey | "season") =>
    (submitted || touched[key]) && errors[key] ? errors[key] : null;

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const values = parsed(form);
      return save({
        data: {
          profileId,
          season: form.season.trim(),
          ...values,
          games_played: values.games_played ?? 0,
          minutes_played: values.minutes_played ?? 0,
        },
      });
    },
    onSuccess: async () => {
      toast.success("Season stats saved");
      setOpen(false);
      setSubmitted(false);
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
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
        if (Object.keys(validateAll(form)).length > 0) {
          toast.error("Fix the highlighted fields before saving");
          return;
        }
        mutation.mutate();
      }}
      className="mt-6 rounded-2xl border border-border bg-surface p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Season <span className="text-primary">*</span>
          </span>
          <input
            value={form.season}
            onChange={(event) => set("season", event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, season: true }))}
            maxLength={20}
            placeholder="2026"
            aria-invalid={Boolean(showError("season"))}
            className={`mt-1 w-32 rounded-lg border bg-background px-3 py-2 text-foreground outline-none focus:border-primary ${
              showError("season") ? "border-destructive" : "border-border"
            }`}
          />
          {showError("season") ? (
            <span className="mt-1 block text-xs text-destructive">{showError("season")}</span>
          ) : null}
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
              {group.fields.map((key) => {
                const rule = STAT_RULES[key];
                const error = showError(key);
                return (
                  <label key={key} className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {rule.label}
                      {rule.suffix ? ` (${rule.suffix})` : ""}
                      {rule.required ? <span className="text-primary"> *</span> : null}
                    </span>
                    <input
                      type="number"
                      min={rule.min}
                      max={rule.max}
                      step={rule.decimals === 1 ? "0.1" : "1"}
                      inputMode={rule.decimals === 1 ? "decimal" : "numeric"}
                      value={form[key]}
                      onChange={(event) => set(key, event.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, [key]: true }))}
                      placeholder={rule.required ? "0" : "—"}
                      aria-invalid={Boolean(error)}
                      className={`mt-1 w-full rounded-lg border bg-background px-3 py-2 text-foreground outline-none focus:border-primary ${
                        error ? "border-destructive" : "border-border"
                      }`}
                    />
                    <span className="mt-1 block text-xs text-destructive">
                      {error ?? "\u00a0"}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {submitted && errorCount > 0 ? (
        <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="h-4 w-4" />
          {errorCount} field{errorCount === 1 ? "" : "s"} need fixing before this season can be
          saved.
        </p>
      ) : null}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={mutation.isPending || errorCount > 0}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {mutation.isSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {mutation.isPending ? "Saving…" : "Save season stats"}
        </button>
        <p className="text-xs text-muted-foreground">
          Required fields are marked *. Leave optional fields blank to keep them off the portfolio.
        </p>
      </div>
    </form>
  );
}

