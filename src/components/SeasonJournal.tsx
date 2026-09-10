import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Check, NotebookPen, Sparkles, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { saveGameJournal } from "@/lib/journal.functions";
import type { Game } from "@/lib/profile.functions";

const MOODS = ["confident", "proud", "focused", "frustrated", "tired", "nervous"] as const;

const MOOD_EMOJI: Record<string, string> = {
  confident: "😤",
  proud: "😃",
  focused: "🎯",
  frustrated: "😖",
  tired: "😮‍💨",
  nervous: "😬",
};

const QUESTIONS = [
  { key: "wentWell", label: "What went well?", icon: Sparkles },
  { key: "improve", label: "What can I improve?", icon: TrendingUp },
  { key: "nextGoal", label: "What is my goal for next game?", icon: Target },
] as const;

type Answers = { wentWell: string; improve: string; nextGoal: string };

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function answersOf(game: Game): Answers {
  return {
    wentWell: game.journal_went_well ?? "",
    improve: game.journal_improve ?? "",
    nextGoal: game.journal_next_goal ?? "",
  };
}

function hasEntry(game: Game): boolean {
  const a = answersOf(game);
  return Boolean(a.wentWell || a.improve || a.nextGoal);
}

function JournalEditor({
  game,
  onDone,
}: {
  game: Game;
  onDone: () => void;
}) {
  const [answers, setAnswers] = useState<Answers>(answersOf(game));
  const [mood, setMood] = useState<string>(game.mood ?? "");
  const save = useServerFn(saveGameJournal);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      save({
        data: {
          gameId: game.id,
          ...answers,
          ...(mood ? { mood } : {}),
        },
      }),
    onSuccess: async () => {
      toast.success("Journal entry saved");
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      onDone();
    },
    onError: (error: Error) => toast.error(error.message || "Could not save the entry"),
  });

  return (
    <form
      className="mt-4 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
      {QUESTIONS.map(({ key, label, icon: Icon }) => (
        <div key={key}>
          <label
            htmlFor={`${game.id}-${key}`}
            className="flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <Icon className="h-4 w-4 text-indigo-light" />
            {label}
          </label>
          <textarea
            id={`${game.id}-${key}`}
            value={answers[key]}
            onChange={(event) => setAnswers((prev) => ({ ...prev, [key]: event.target.value }))}
            rows={3}
            placeholder="Write a few honest sentences…"
            className="mt-2 w-full resize-y rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary"
          />
        </div>
      ))}

      <div>
        <span className="text-sm font-semibold text-foreground">How did it feel?</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {MOODS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMood(mood === option ? "" : option)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                mood === option
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <span aria-hidden="true">{MOOD_EMOJI[option]}</span>
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          <Check className="h-4 w-4" />
          {mutation.isPending ? "Saving…" : "Save entry"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function SeasonJournal({ games, editable = false }: { games: Game[]; editable?: boolean }) {
  const ordered = useMemo(
    () => [...games].sort((a, b) => b.game_date.localeCompare(a.game_date)),
    [games],
  );
  const [editingId, setEditingId] = useState<string | null>(null);

  const entryCount = ordered.filter(hasEntry).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
          <BookOpen className="h-5 w-5 text-indigo-light" />
          Season Journal
        </h2>
        <span className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-muted-foreground">
          {entryCount} of {ordered.length} games reflected on
        </span>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        After every game, answer three questions. Together they become your season story.
      </p>

      {ordered.length === 0 ? (
        <p className="mt-5 text-muted-foreground">
          Log a game and the journal prompts will appear here.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {ordered.map((game) => {
            const answers = answersOf(game);
            const filled = hasEntry(game);
            const isEditing = editingId === game.id;

            return (
              <article key={game.id} className="rounded-xl bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">vs {game.opponent}</h3>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      <span>{formatDate(game.game_date)}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {game.result ?? "—"} {game.team_score ?? "—"}–{game.opponent_score ?? "—"}
                      </span>
                      {game.mood && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">
                            <span aria-hidden="true">{MOOD_EMOJI[game.mood] ?? "🙂"}</span>{" "}
                            {game.mood}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  {!isEditing && editable && (
                    <button
                      type="button"
                      onClick={() => setEditingId(game.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-elevated"
                    >
                      <NotebookPen className="h-4 w-4 text-indigo-light" />
                      {filled ? "Edit entry" : "Write entry"}
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <JournalEditor game={game} onDone={() => setEditingId(null)} />
                ) : filled ? (
                  <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                    {QUESTIONS.map(({ key, label, icon: Icon }) =>
                      answers[key] ? (
                        <div key={key} className="rounded-lg bg-card p-3">
                          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <Icon className="h-3.5 w-3.5 text-indigo-light" />
                            {label.replace(/\?$/, "")}
                          </dt>
                          <dd className="mt-1.5 text-sm leading-relaxed text-foreground">
                            {answers[key]}
                          </dd>
                        </div>
                      ) : null,
                    )}
                  </dl>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No reflection yet — answer the three questions while the game is fresh.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
