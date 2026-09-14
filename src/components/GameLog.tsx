import { useState } from "react";
import {
  Calendar,
  MapPin,
  Star,
  ClipboardList,
  MessageSquareQuote,
  Images,
  Play,
  ChevronDown,
} from "lucide-react";

import type { Game } from "@/lib/profile.functions";

const STAT_LABELS: Record<string, string> = {
  hits: "Hits",
  rbi: "RBI",
  home_runs: "HR",
  strikeouts: "K",
  stolen_bases: "SB",
  batting_average: "AVG",
  era: "ERA",
  wins: "W",
  saves: "SV",
  goals: "Goals",
  assists: "Assists",
  shots: "Shots",
  shots_on_goal: "SOG",
  minutes_played: "Minutes",
  tackles: "Tackles",
  interceptions: "Int",
  pass_completion: "Pass %",
  yellow_cards: "Yellow",
  red_cards: "Red",
  clean_sheets: "Clean Sheets",
  fouls: "Fouls",
  headers_won: "Headers",
  penalty_kicks: "PK",
  pk_saves: "PK Saves",
  goals_conceded: "Goals Against",
  shots_faced: "Shots Faced",
  pk_faced: "PKs Faced",
  high_claims: "High Claims",
  punches: "Punches",
  catches: "Catches",
};

const MOOD_EMOJI: Record<string, string> = {
  confident: "😤",
  proud: "😃",
  focused: "🎯",
  frustrated: "😖",
  tired: "😮‍💨",
  nervous: "😬",
};

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatStat(key: string, value: number | null): string {
  if (value === null || value === undefined) return "—";
  if (key === "batting_average") return value.toFixed(3).replace(/^0/, "");
  if (key === "era") return value.toFixed(2);
  if (key === "pass_completion") return `${value.toFixed(1)}%`;
  return value.toLocaleString();
}

function resultStyle(result: string | null): string {
  if (result === "W") return "bg-primary text-primary-foreground";
  if (result === "L") return "bg-destructive/15 text-destructive";
  return "bg-surface-elevated text-muted-foreground";
}

export function GameLog({ games }: { games: Game[] }) {
  const [openId, setOpenId] = useState<string | null>(games[0]?.id ?? null);

  if (games.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-2xl text-foreground">Game Log</h2>
        <p className="mt-3 text-muted-foreground">No games logged yet for this season.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-foreground">Game Log</h2>
        <span className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-muted-foreground">
          {games.length} {games.length === 1 ? "game" : "games"}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {games.map((game) => {
          const isOpen = openId === game.id;
          const photos = game.media.filter((m) => m.media_type === "photo");
          const videos = game.media.filter((m) => m.media_type === "video");
          const statEntries = Object.entries(game.stats ?? {});

          return (
            <div key={game.id} className="overflow-hidden rounded-xl bg-surface">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : game.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-surface-elevated"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-lg ${resultStyle(game.result)}`}
                >
                  {game.result ?? "—"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-foreground">vs {game.opponent}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(game.game_date)}
                    </span>
                    {game.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {game.location}
                      </span>
                    )}
                    <span className="capitalize">{game.sport}</span>
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-display text-2xl text-foreground">
                    {game.team_score ?? "—"}–{game.opponent_score ?? "—"}
                  </span>
                  {game.performance_rating !== null && (
                    <span className="mt-0.5 flex items-center justify-end gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-3 w-3 ${
                            n <= (game.performance_rating ?? 0)
                              ? "fill-primary text-primary"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      ))}
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="space-y-5 border-t border-border/50 p-4">
                  {statEntries.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {statEntries.map(([key, value]) => (
                        <div
                          key={key}
                          className="rounded-lg bg-card px-3 py-2 text-center"
                        >
                          <div className="font-display text-xl text-foreground">
                            {formatStat(key, value)}
                          </div>
                          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            {STAT_LABELS[key] ?? key.replace(/_/g, " ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {photos.length > 0 && (
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Images className="h-4 w-4 text-primary" />
                        Photos
                      </h4>
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {photos.map((photo) => (
                          <img
                            key={photo.id}
                            src={photo.url}
                            alt={photo.caption ?? `Photo from game vs ${game.opponent}`}
                            loading="lazy"
                            className="aspect-video w-full rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {videos.length > 0 && (
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Play className="h-4 w-4 text-primary" />
                        Videos
                      </h4>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {videos.map((video) => (
                          <video
                            key={video.id}
                            src={video.url}
                            poster={video.thumbnail_url ?? undefined}
                            controls
                            preload="none"
                            className="aspect-video w-full rounded-lg bg-black"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    {game.coach_notes && (
                      <div className="rounded-lg bg-card p-4">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <ClipboardList className="h-4 w-4 text-primary" />
                          Coach Notes
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {game.coach_notes}
                        </p>
                      </div>
                    )}
                    {game.player_reflection && (
                      <div className="rounded-lg bg-card p-4">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <MessageSquareQuote className="h-4 w-4 text-primary" />
                          Player Reflection
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {game.player_reflection}
                        </p>
                        {game.mood && (
                          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-medium capitalize text-foreground">
                            <span aria-hidden="true">{MOOD_EMOJI[game.mood] ?? "🙂"}</span>
                            {game.mood}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
