import { createClient } from "@supabase/supabase-js";

export interface InsightCard {
  headline: string;
  detail: string;
  tone: "up" | "down" | "neutral";
}

export interface InsightsResult {
  metrics: {
    gamesAnalyzed: number;
    shotsPerGame: number;
    goalsPerGame: number;
    assistsPerGame: number;
    minutesPerGame: number;
    improvementPct: number;
    passCompletionTrend: number;
    toughestOpponent: string | null;
    bestOpponent: string | null;
    lastFive: { record: string; goals: number; assists: number; avgRating: number };
    since: string | null;
  };
  insights: InsightCard[];
  generated: "ai" | "fallback";
}

type GameRow = {
  game_date: string;
  opponent: string;
  result: string | null;
  team_score: number | null;
  opponent_score: number | null;
  performance_rating: number | null;
  stats: Record<string, number | null> | null;
};

function num(stats: GameRow["stats"], key: string): number {
  const v = stats?.[key];
  return typeof v === "number" ? v : 0;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function round(value: number, digits = 1): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

function monthName(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export async function loadGames(profileId: string, sport: string): Promise<GameRow[]> {
  const supabase = createClient(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase
    .from("games")
    .select("game_date, opponent, result, team_score, opponent_score, performance_rating, stats")
    .eq("profile_id", profileId)
    .eq("sport", sport)
    .order("game_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as GameRow[];
}

export function computeMetrics(games: GameRow[]): InsightsResult["metrics"] {
  const shots = games.map((g) => num(g.stats, "shots"));
  const goals = games.map((g) => num(g.stats, "goals"));
  const assists = games.map((g) => num(g.stats, "assists"));
  const minutes = games.map((g) => num(g.stats, "minutes_played"));

  const half = Math.max(1, Math.floor(games.length / 2));
  const early = avg(games.slice(0, half).map((g) => g.performance_rating ?? 0));
  const late = avg(games.slice(-half).map((g) => g.performance_rating ?? 0));
  const improvementPct = early === 0 ? 0 : ((late - early) / early) * 100;

  const passEarly = avg(games.slice(0, half).map((g) => num(g.stats, "pass_completion")));
  const passLate = avg(games.slice(-half).map((g) => num(g.stats, "pass_completion")));

  // Toughest opponent = the one the athlete produced least against / lost to.
  const byOpponent = new Map<string, { ga: number; games: number; wins: number }>();
  games.forEach((g) => {
    const entry = byOpponent.get(g.opponent) ?? { ga: 0, games: 0, wins: 0 };
    entry.ga += num(g.stats, "goals") + num(g.stats, "assists");
    entry.games += 1;
    if (g.result === "W") entry.wins += 1;
    byOpponent.set(g.opponent, entry);
  });
  const ranked = [...byOpponent.entries()].map(([opponent, e]) => ({
    opponent,
    perGame: e.ga / e.games,
    winRate: e.wins / e.games,
  }));
  const toughest = [...ranked].sort(
    (a, b) => a.winRate - b.winRate || a.perGame - b.perGame,
  )[0];
  const best = [...ranked].sort((a, b) => b.perGame - a.perGame || b.winRate - a.winRate)[0];

  const lastFiveGames = games.slice(-5);
  const w = lastFiveGames.filter((g) => g.result === "W").length;
  const l = lastFiveGames.filter((g) => g.result === "L").length;
  const d = lastFiveGames.filter((g) => g.result === "D").length;

  return {
    gamesAnalyzed: games.length,
    shotsPerGame: round(avg(shots)),
    goalsPerGame: round(avg(goals), 2),
    assistsPerGame: round(avg(assists), 2),
    minutesPerGame: round(avg(minutes)),
    improvementPct: round(improvementPct, 0),
    passCompletionTrend: round(passLate - passEarly),
    toughestOpponent: toughest?.opponent ?? null,
    bestOpponent: best?.opponent ?? null,
    lastFive: {
      record: `${w}-${l}-${d}`,
      goals: lastFiveGames.reduce((s, g) => s + num(g.stats, "goals"), 0),
      assists: lastFiveGames.reduce((s, g) => s + num(g.stats, "assists"), 0),
      avgRating: round(avg(lastFiveGames.map((g) => g.performance_rating ?? 0)), 1),
    },
    since: games[0] ? monthName(games[0].game_date) : null,
  };
}

export function fallbackInsights(m: InsightsResult["metrics"]): InsightCard[] {
  const cards: InsightCard[] = [
    {
      headline: `You're averaging ${m.shotsPerGame} shots/game.`,
      detail: `Across ${m.gamesAnalyzed} logged games you're also producing ${m.goalsPerGame} goals and ${m.assistsPerGame} assists per game.`,
      tone: "neutral",
    },
    {
      headline: `You've ${m.improvementPct >= 0 ? "improved" : "dipped"} ${Math.abs(
        m.improvementPct,
      )}%${m.since ? ` since ${m.since}` : ""}.`,
      detail: "Based on coach performance ratings comparing the first half of the season to the most recent stretch.",
      tone: m.improvementPct >= 0 ? "up" : "down",
    },
  ];
  if (m.toughestOpponent) {
    cards.push({
      headline: `Your strongest opponent was ${m.toughestOpponent}.`,
      detail: `That matchup limited your goal contributions the most.${m.bestOpponent ? ` You produced most freely against ${m.bestOpponent}.` : ""}`,
      tone: "neutral",
    });
  }
  cards.push({
    headline: `Your passing is ${m.passCompletionTrend >= 0 ? "improving" : "slipping"}.`,
    detail: `Pass completion has moved ${m.passCompletionTrend >= 0 ? "+" : ""}${m.passCompletionTrend} points between the early and recent halves of the season.`,
    tone: m.passCompletionTrend >= 0 ? "up" : "down",
  });
  cards.push({
    headline: `In the last 5 games you're ${m.lastFive.record}.`,
    detail: `${m.lastFive.goals} goals, ${m.lastFive.assists} assists, and an average coach rating of ${m.lastFive.avgRating}/5.`,
    tone: m.lastFive.avgRating >= 3.5 ? "up" : "neutral",
  });
  return cards;
}

export async function generateAiInsights(
  m: InsightsResult["metrics"],
): Promise<InsightCard[] | null> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return null;

  const scaffold = fallbackInsights(m);

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are a youth soccer performance analyst writing insight cards for an athlete's portfolio. You receive season metrics and a list of draft cards. Keep the SAME number of cards, the SAME order, and the SAME factual claim and numbers in each headline — you may only lightly polish wording. Rewrite each detail into one encouraging, coaching-style sentence (max 160 chars) grounded strictly in the provided metrics. Never invent numbers. Return ONLY JSON: {\"insights\":[{\"headline\":string,\"detail\":string,\"tone\":\"up\"|\"down\"|\"neutral\"}]}",
          },
          { role: "user", content: JSON.stringify({ metrics: m, draft: scaffold }) },
        ],
      }),
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = payload.choices?.[0]?.message?.content ?? "";
    const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const parsed = JSON.parse(json) as { insights?: InsightCard[] };
    const cards = (parsed.insights ?? [])
      .filter((c) => typeof c?.headline === "string" && typeof c?.detail === "string")
      .slice(0, scaffold.length)
      .map((c, index) => ({
        headline: c.headline,
        detail: c.detail,
        tone: (c.tone === "up" || c.tone === "down" || c.tone === "neutral"
          ? c.tone
          : scaffold[index]!.tone) as InsightCard["tone"],
      }));
    return cards.length === scaffold.length ? cards : null;
  } catch {
    return null;
  }
}
