import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, LineChart as LineChartIcon, Minus } from "lucide-react";

import type { Game } from "@/lib/profile.functions";

type Point = {
  label: string;
  goals: number;
  assists: number;
  minutes: number;
  rating: number | null;
  cumulativeGoals: number;
  cumulativeAssists: number;
};

function statValue(game: Game, key: string): number {
  const value = game.stats?.[key];
  return typeof value === "number" ? value : 0;
}

function shortDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function buildPoints(games: Game[]): Point[] {
  let goals = 0;
  let assists = 0;
  return games.map((game) => {
    const g = statValue(game, "goals");
    const a = statValue(game, "assists");
    goals += g;
    assists += a;
    return {
      label: shortDate(game.game_date),
      goals: g,
      assists: a,
      minutes: statValue(game, "minutes_played"),
      rating: game.performance_rating ?? null,
      cumulativeGoals: goals,
      cumulativeAssists: assists,
    };
  });
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

const axisProps = {
  stroke: "var(--muted-foreground)",
  tick: { fill: "var(--muted-foreground)", fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

const tooltipStyle = {
  contentStyle: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    color: "var(--foreground)",
    fontSize: 12,
  },
  labelStyle: { color: "var(--muted-foreground)" },
} as const;

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl tracking-wide text-foreground">{title}</h3>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>
      <div className="mt-3 h-48">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ProgressCharts({ games }: { games: Game[] }) {
  const ordered = [...games].sort((a, b) => a.game_date.localeCompare(b.game_date));

  if (ordered.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-2xl text-foreground">Progress Charts</h2>
        <p className="mt-3 text-muted-foreground">
          Charts appear automatically once games are logged this season.
        </p>
      </div>
    );
  }

  const points = buildPoints(ordered);

  const half = Math.max(1, Math.floor(points.length / 2));
  const firstHalf = points.slice(0, half);
  const secondHalf = points.slice(-half);
  const earlyRating = average(firstHalf.map((p) => p.rating ?? 0));
  const lateRating = average(secondHalf.map((p) => p.rating ?? 0));
  const improvement = earlyRating === 0 ? 0 : ((lateRating - earlyRating) / earlyRating) * 100;

  const wins = ordered.filter((g) => g.result === "W").length;
  const losses = ordered.filter((g) => g.result === "L").length;
  const draws = ordered.filter((g) => g.result === "D").length;
  const winRate = (wins / ordered.length) * 100;

  const totalGoals = points.at(-1)?.cumulativeGoals ?? 0;
  const totalAssists = points.at(-1)?.cumulativeAssists ?? 0;

  const heatMax = Math.max(...points.map((p) => p.goals + p.assists), 1);

  const TrendIcon = improvement > 1 ? ArrowUpRight : improvement < -1 ? ArrowDownRight : Minus;
  const trendTone =
    improvement > 1 ? "text-indigo-light" : improvement < -1 ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
          <LineChartIcon className="h-5 w-5 text-indigo-light" />
          Progress Charts
        </h2>
        <span className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-muted-foreground">
          {ordered.length} games logged
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-surface p-4">
          <div className={`flex items-center gap-1 font-display text-3xl ${trendTone}`}>
            <TrendIcon className="h-6 w-6" />
            {improvement >= 0 ? "+" : ""}
            {improvement.toFixed(0)}%
          </div>
          <div className="mt-1 text-sm font-medium text-muted-foreground">Improvement</div>
        </div>
        <div className="rounded-xl bg-surface p-4">
          <div className="font-display text-3xl text-foreground">
            {wins}-{losses}-{draws}
          </div>
          <div className="mt-1 text-sm font-medium text-muted-foreground">Win / Loss / Draw</div>
        </div>
        <div className="rounded-xl bg-surface p-4">
          <div className="font-display text-3xl text-foreground">{totalGoals}</div>
          <div className="mt-1 text-sm font-medium text-muted-foreground">Season Goals</div>
        </div>
        <div className="rounded-xl bg-surface p-4">
          <div className="font-display text-3xl text-foreground">{totalAssists}</div>
          <div className="mt-1 text-sm font-medium text-muted-foreground">Season Assists</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Goals Over Season" subtitle="Cumulative">
          <AreaChart data={points} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="goalsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis allowDecimals={false} {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Area
              type="monotone"
              dataKey="cumulativeGoals"
              name="Goals"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#goalsFill)"
            />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Assists" subtitle="Per game">
          <BarChart data={points} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis allowDecimals={false} {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="assists" name="Assists" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Minutes" subtitle="Per game">
          <BarChart data={points} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis domain={[0, 90]} {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="minutes" name="Minutes" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Performance Trend" subtitle="Coach rating (1-5)">
          <LineChart data={points} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Line
              type="monotone"
              dataKey="rating"
              name="Rating"
              stroke="var(--chart-3)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "var(--chart-3)" }}
              connectNulls
            />
          </LineChart>
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-surface p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-xl tracking-wide text-foreground">Heat Map</h3>
            <span className="text-xs text-muted-foreground">Goal contributions per game</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {points.map((point) => {
              const contribution = point.goals + point.assists;
              const intensity = contribution / heatMax;
              return (
                <div
                  key={point.label}
                  title={`${point.label}: ${contribution} G+A`}
                  className="flex h-12 w-12 flex-col items-center justify-center rounded-lg border border-border text-xs font-semibold text-foreground"
                  style={{
                    backgroundColor: `color-mix(in oklab, var(--chart-3) ${Math.round(
                      12 + intensity * 88,
                    )}%, transparent)`,
                  }}
                >
                  <span className="font-display text-lg leading-none">{contribution}</span>
                  <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                    {point.label.split(" ")[1]}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            Low
            <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-transparent to-[var(--chart-3)]" />
            High
          </div>
        </div>

        <div className="rounded-xl bg-surface p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-xl tracking-wide text-foreground">Win / Loss Record</h3>
            <span className="text-xs text-muted-foreground">{winRate.toFixed(0)}% win rate</span>
          </div>

          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-surface-elevated">
            <div style={{ width: `${(wins / ordered.length) * 100}%` }} className="bg-primary" />
            <div
              style={{ width: `${(draws / ordered.length) * 100}%` }}
              className="bg-indigo-light/40"
            />
            <div style={{ width: `${(losses / ordered.length) * 100}%` }} className="bg-destructive" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="font-display text-2xl text-foreground">{wins}</div>
              <div className="text-xs font-medium text-muted-foreground">Wins</div>
            </div>
            <div>
              <div className="font-display text-2xl text-foreground">{draws}</div>
              <div className="text-xs font-medium text-muted-foreground">Draws</div>
            </div>
            <div>
              <div className="font-display text-2xl text-foreground">{losses}</div>
              <div className="text-xs font-medium text-muted-foreground">Losses</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {ordered.map((game) => (
              <span
                key={game.id}
                title={`${shortDate(game.game_date)} vs ${game.opponent}`}
                className={`flex h-7 w-7 items-center justify-center rounded-md font-display text-sm ${
                  game.result === "W"
                    ? "bg-primary text-primary-foreground"
                    : game.result === "L"
                      ? "bg-destructive/20 text-destructive"
                      : "bg-surface-elevated text-muted-foreground"
                }`}
              >
                {game.result ?? "–"}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
