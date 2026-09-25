import { useState } from "react";

import type { SeasonStats } from "@/lib/profile.functions";
import {
  goalsAgainstAverage,
  POSITION_GROUPS,
  positionGroup,
  savePercentage,
  shotAccuracy,
  type PositionGroup,
} from "@/lib/season-stats-validation";

type View = "all" | PositionGroup;
type Stat = { label: string; value: string };

const num = (v: number | null | undefined, digits = 0) =>
  v === null || v === undefined ? "—" : Number(v).toFixed(digits);
const pct = (v: number | null | undefined) => (v === null || v === undefined ? "—" : `${Number(v).toFixed(1)}%`);

function groupStats(s: SeasonStats, group: PositionGroup): Stat[] {
  const gaa = goalsAgainstAverage(s.goals_conceded, s.games_played);
  switch (group) {
    case "goalkeeper":
      return [
        { label: "Saves", value: num(s.saves) },
        { label: "Save %", value: pct(savePercentage(s.saves, s.shots_faced, s.goals_conceded)) },
        { label: "Goals Conceded", value: num(s.goals_conceded) },
        { label: "Goals Against Avg", value: gaa === null ? "—" : gaa.toFixed(2) },
        { label: "Clean Sheets", value: num(s.clean_sheets) },
        { label: "Shots Faced", value: num(s.shots_faced) },
        { label: "PKs Faced", value: num(s.pk_faced) },
        { label: "PKs Saved", value: num(s.pk_saves) },
        { label: "Punches", value: num(s.punches) },
        { label: "High Claims", value: num(s.high_claims) },
      ];
    case "defenders":
      return [
        { label: "Tackles", value: num(s.tackles) },
        { label: "Interceptions", value: num(s.interceptions) },
        { label: "Clean Sheets", value: num(s.clean_sheets) },
        { label: "Fouls", value: num(s.fouls) },
        { label: "Headers Won", value: num(s.headers_won) },
        { label: "Minutes Played", value: num(s.minutes_played) },
        { label: "Pass Completion", value: pct(s.pass_completion) },
      ];
    case "midfielders":
      return [
        { label: "Assists", value: num(s.assists) },
        { label: "Pass Completion", value: pct(s.pass_completion) },
        { label: "Key Passes / Chances", value: num(s.key_passes) },
        { label: "Tackles", value: num(s.tackles) },
        { label: "Interceptions", value: num(s.interceptions) },
        { label: "Goals", value: num(s.goals) },
        { label: "Minutes Played", value: num(s.minutes_played) },
      ];
    case "forwards":
      return [
        { label: "Goals", value: num(s.goals) },
        { label: "Assists", value: num(s.assists) },
        { label: "Shots", value: num(s.shots) },
        { label: "Shots on Goal", value: num(s.shots_on_goal) },
        { label: "Shot Accuracy", value: pct(shotAccuracy(s.shots_on_goal, s.shots)) },
        { label: "Penalty Kicks", value: num(s.penalty_kicks) },
        { label: "Minutes Played", value: num(s.minutes_played) },
      ];
  }
}

function allStats(s: SeasonStats): { title: string; stats: Stat[] }[] {
  return [
    {
      title: "General",
      stats: [
        { label: "Games Played", value: num(s.games_played) },
        { label: "Minutes Played", value: num(s.minutes_played) },
        { label: "MVP Awards", value: num(s.mvp_awards) },
        { label: "Yellow Cards", value: num(s.yellow_cards) },
        { label: "Red Cards", value: num(s.red_cards) },
      ],
    },
    ...POSITION_GROUPS.map((g) => ({
      title: g.label,
      stats: groupStats(s, g.id).filter((st) => st.label !== "Minutes Played"),
    })),
  ];
}

export function SeasonStatsBreakdown({
  season,
  position,
}: {
  season: SeasonStats;
  position: string | null | undefined;
}) {
  const primary = positionGroup(position);
  const [view, setView] = useState<View>(primary ?? "all");
  const tabs: { id: View; label: string }[] = [{ id: "all", label: "All Stats" }, ...POSITION_GROUPS];

  return (
    <div className="mt-5">
      <div role="tablist" aria-label="Stat view" className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={view === t.id}
            onClick={() => setView(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              view === t.id
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {primary === t.id ? <span className="ml-1 text-xs opacity-80">★</span> : null}
          </button>
        ))}
      </div>

      {view === "all" ? (
        <div className="mt-6 space-y-6">
          {allStats(season).map((section) => (
            <div key={section.title}>
              <h3 className="font-display text-xl text-foreground">{section.title}</h3>
              <StatGrid stats={section.stats} />
            </div>
          ))}
        </div>
      ) : (
        <StatGrid stats={groupStats(season, view)} />
      )}
    </div>
  );
}

function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl bg-surface p-4 transition-colors hover:bg-surface-elevated">
          <div className="font-display text-3xl text-foreground">{s.value}</div>
          <div className="mt-1 text-sm font-medium text-muted-foreground">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
