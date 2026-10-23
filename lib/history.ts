/**
 * Finished attempts, kept in this browser while practice is simulated.
 * When the backend lands, Progress reads `GET /api/analytics/me` and attempt
 * history instead, and this file goes.
 */

import type { SimQuestion } from "./practice-sim";

const KEY = "sd-history";

export type TopicTally = { subject: string; right: number; total: number };

export type AttemptRecord = {
  /** The attempt's storage key, so a re-render never records it twice. */
  id: string;
  title: string;
  kind: "Practice" | "CBT";
  /** Where the attempt lives; opening it shows its result. */
  href: string;
  finishedAt: number;
  total: number;
  right: number;
  unanswered: number;
  timeMs?: number;
  topics: Record<string, TopicTally>;
};

export function loadHistory(): AttemptRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AttemptRecord[]) : [];
  } catch {
    return [];
  }
}

export function recordAttempt(
  base: Omit<AttemptRecord, "total" | "right" | "unanswered" | "topics" | "finishedAt">,
  questions: SimQuestion[],
  answers: Record<string, number>,
  finishedAt = Date.now(),
): void {
  clearCurrent(base.id);
  const history = loadHistory();
  if (history.some((a) => a.id === base.id)) return;

  const topics: Record<string, TopicTally> = {};
  for (const q of questions) {
    const t = (topics[q.topic] ??= { subject: q.subject, right: 0, total: 0 });
    t.total += 1;
    if (answers[q.id] === q.answer) t.right += 1;
  }

  history.unshift({
    ...base,
    finishedAt,
    total: questions.length,
    right: questions.filter((q) => answers[q.id] === q.answer).length,
    unanswered: questions.filter((q) => answers[q.id] === undefined).length,
    topics,
  });
  try {
    localStorage.setItem(KEY, JSON.stringify(history.slice(0, 200)));
  } catch {
    // Storage blocked or full: progress just won't include this attempt.
  }
}

const CURRENT_KEY = "sd-current";

/** The attempt in progress, so Home can offer to resume it. */
export type CurrentAttempt = { id: string; title: string; href: string };

export function loadCurrent(): CurrentAttempt | null {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? (JSON.parse(raw) as CurrentAttempt) : null;
  } catch {
    return null;
  }
}

export function setCurrent(attempt: CurrentAttempt): void {
  try {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(attempt));
  } catch {}
}

/** Clear it only if it is this attempt: another may have started since. */
export function clearCurrent(id: string): void {
  if (loadCurrent()?.id === id) {
    try {
      localStorage.removeItem(CURRENT_KEY);
    } catch {}
  }
}

/**
 * Headline numbers, shared by Home and Progress so they always agree.
 * Accuracy is over questions answered: a blank is not a wrong answer here,
 * it shows up in each attempt's own result instead.
 */
export function summarise(history: AttemptRecord[]) {
  const answered = history.reduce((n, a) => n + a.total - a.unanswered, 0);
  const right = history.reduce((n, a) => n + a.right, 0);
  const topics: Record<string, TopicTally> = {};
  for (const a of history) {
    for (const [name, t] of Object.entries(a.topics)) {
      const sum = (topics[name] ??= { subject: t.subject, right: 0, total: 0 });
      sum.right += t.right;
      sum.total += t.total;
    }
  }
  return {
    attempts: history.length,
    answered,
    accuracy: answered ? Math.round((right / answered) * 100) : 0,
    /** Weakest first. */
    topics: Object.entries(topics).sort(([, a], [, b]) => a.right / a.total - b.right / b.total),
  };
}
