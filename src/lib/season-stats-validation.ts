import { z } from "zod";

export const SEASON_LABEL_PATTERN = /^\d{4}(\/\d{2,4})?$/;

export type StatFieldKey =
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

export type StatFieldRule = {
  label: string;
  min: number;
  max: number;
  /** Percent fields accept one decimal; every other field is a whole number. */
  decimals: 0 | 1;
  required?: boolean;
  suffix?: string;
};

export const STAT_RULES: Record<StatFieldKey, StatFieldRule> = {
  games_played: { label: "Games played", min: 0, max: 200, decimals: 0, required: true },
  goals: { label: "Goals", min: 0, max: 500, decimals: 0 },
  assists: { label: "Assists", min: 0, max: 500, decimals: 0 },
  shots: { label: "Shots", min: 0, max: 2000, decimals: 0 },
  shots_on_goal: { label: "Shots on goal", min: 0, max: 2000, decimals: 0 },
  minutes_played: { label: "Minutes played", min: 0, max: 24000, decimals: 0, required: true },
  yellow_cards: { label: "Yellow cards", min: 0, max: 400, decimals: 0 },
  red_cards: { label: "Red cards", min: 0, max: 200, decimals: 0 },
  penalty_kicks: { label: "Penalty kicks", min: 0, max: 200, decimals: 0 },
  pk_saves: { label: "PK saves", min: 0, max: 200, decimals: 0 },
  saves: { label: "Saves", min: 0, max: 2000, decimals: 0 },
  clean_sheets: { label: "Clean sheets", min: 0, max: 200, decimals: 0 },
  fouls: { label: "Fouls", min: 0, max: 1000, decimals: 0 },
  tackles: { label: "Tackles", min: 0, max: 2000, decimals: 0 },
  interceptions: { label: "Interceptions", min: 0, max: 2000, decimals: 0 },
  headers_won: { label: "Headers won", min: 0, max: 2000, decimals: 0 },
  mvp_awards: { label: "MVP awards", min: 0, max: 200, decimals: 0 },
  pass_completion: { label: "Pass completion", min: 0, max: 100, decimals: 1, suffix: "%" },
};

export const STAT_FIELD_KEYS = Object.keys(STAT_RULES) as StatFieldKey[];

export type StatValues = Record<StatFieldKey, number | null>;

/** Cross-field rules that must hold no matter where the data comes from. */
export function crossFieldErrors(values: StatValues): Partial<Record<StatFieldKey, string>> {
  const errors: Partial<Record<StatFieldKey, string>> = {};
  const gp = values.games_played;

  if (values.shots !== null && values.shots_on_goal !== null && values.shots_on_goal > values.shots) {
    errors.shots_on_goal = "Shots on goal can't exceed total shots.";
  }
  if (values.shots_on_goal !== null && values.goals !== null && values.goals > values.shots_on_goal) {
    errors.goals = "Goals can't exceed shots on goal.";
  }
  if (gp !== null) {
    if (values.minutes_played !== null && values.minutes_played > gp * 120) {
      errors.minutes_played = `With ${gp} games played, minutes can't exceed ${gp * 120}.`;
    }
    if (values.red_cards !== null && values.red_cards > gp) {
      errors.red_cards = "Red cards can't exceed games played.";
    }
    if (values.yellow_cards !== null && values.yellow_cards > gp * 2) {
      errors.yellow_cards = "Yellow cards can't exceed 2 per game played.";
    }
    if (values.clean_sheets !== null && values.clean_sheets > gp) {
      errors.clean_sheets = "Clean sheets can't exceed games played.";
    }
    if (values.mvp_awards !== null && values.mvp_awards > gp) {
      errors.mvp_awards = "MVP awards can't exceed games played.";
    }
  }
  return errors;
}

/** Validates one raw text input against its rule. Returns an error message or null. */
export function validateField(key: StatFieldKey, raw: string): string | null {
  const rule = STAT_RULES[key];
  const value = raw.trim();

  if (value === "") return rule.required ? `${rule.label} is required.` : null;

  const numeric = rule.decimals === 0 ? /^\d+$/ : /^\d+(\.\d)?$/;
  if (!numeric.test(value)) {
    return rule.decimals === 0
      ? `${rule.label} must be a whole number.`
      : `${rule.label} must be a percent like 82 or 82.5.`;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < rule.min || parsed > rule.max) {
    return `${rule.label} must be between ${rule.min} and ${rule.max}${rule.suffix ?? ""}.`;
  }
  return null;
}

export function validateSeasonLabel(raw: string): string | null {
  const value = raw.trim();
  if (value === "") return "Season is required.";
  if (!SEASON_LABEL_PATTERN.test(value)) return "Use a season like 2026 or 2025/26.";
  const startYear = Number(value.slice(0, 4));
  if (startYear < 1950 || startYear > new Date().getFullYear() + 1) {
    return "Season year looks out of range.";
  }
  return null;
}

/** Zod schema mirroring the same rules for the server boundary. */
export const seasonStatsSchema = z
  .object({
    profileId: z.string().uuid(),
    season: z
      .string()
      .trim()
      .refine((value) => validateSeasonLabel(value) === null, {
        message: "Use a season like 2026 or 2025/26.",
      }),
    ...(Object.fromEntries(
      STAT_FIELD_KEYS.map((key) => {
        const rule = STAT_RULES[key];
        let base = z.number().min(rule.min).max(rule.max);
        if (rule.decimals === 0) base = base.int();
        else base = base.refine((v) => Number.isInteger(v * 10), {
          message: `${rule.label} allows at most one decimal.`,
        }) as unknown as typeof base;
        return [key, rule.required ? base : base.nullable()];
      }),
    ) as {
      [K in StatFieldKey]: z.ZodType<number | null>;
    }),
  })
  .superRefine((data, ctx) => {
    const values = Object.fromEntries(
      STAT_FIELD_KEYS.map((key) => [key, data[key] ?? null]),
    ) as StatValues;
    for (const [key, message] of Object.entries(crossFieldErrors(values))) {
      ctx.addIssue({ code: "custom", path: [key], message: message as string });
    }
  });

export type SeasonStatsInput = z.infer<typeof seasonStatsSchema>;
