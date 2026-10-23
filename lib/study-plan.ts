import type { AttemptRecord } from "./history";

/**
 * The study plan's ranking (AI-STUDY-MODE 4.2): a formula in code, never a
 * model's judgement. A topic rises when its accuracy is low, when it has not
 * been practised lately, and stays visible when it has never been tried. The
 * wording is templated from the same numbers, so nothing here can be invented.
 * When the AI layer lands it rewords these reasons; it does not reorder them.
 */

export type PlanItem = {
  topic: string;
  subject: string;
  /** 0 to 1; higher means practise sooner. */
  priority: number;
  /** Right and total across every attempt; zero when never tried. */
  right: number;
  total: number;
  daysSince: number | null;
  questions: 10 | 20;
  reason: string;
};

const DAY = 86_400_000;
/** Below this many questions a topic's accuracy is a guess, and is treated as one. */
const TRUSTED_AT = 5;
/** Practised this long ago or more counts as fully stale. */
const STALE_DAYS = 14;

export function rankTopics(
  history: AttemptRecord[],
  /** Every topic the student could practise, by subject. */
  available: Array<{ subject: string; topic: string }>,
  now = Date.now(),
): PlanItem[] {
  const seen = new Map<string, { subject: string; right: number; total: number; lastAt: number }>();
  for (const a of history) {
    for (const [topic, t] of Object.entries(a.topics)) {
      const s = seen.get(topic) ?? { subject: t.subject, right: 0, total: 0, lastAt: 0 };
      s.right += t.right;
      s.total += t.total;
      s.lastAt = Math.max(s.lastAt, a.finishedAt);
      seen.set(topic, s);
    }
  }

  const items: PlanItem[] = [];
  for (const [topic, s] of seen) {
    // Smoothed toward 50%, so one lucky or unlucky question does not decide a topic.
    const accuracy = (s.right + 1) / (s.total + 2);
    const confidence = Math.min(1, s.total / TRUSTED_AT);
    const daysSince = Math.floor((now - s.lastAt) / DAY);
    const staleness = Math.min(1, daysSince / STALE_DAYS);
    // Weakness drives it; staleness adds up to 40% on top; a thin record is
    // pulled toward the middle rather than trusted at either extreme.
    const raw = (1 - accuracy) * (0.6 + 0.4 * staleness);
    const priority = confidence * raw + (1 - confidence) * 0.45;
    if (accuracy >= 0.85 && staleness < 0.5) continue; // strong and fresh: not on the plan
    items.push({
      topic,
      subject: s.subject,
      priority,
      right: s.right,
      total: s.total,
      daysSince,
      // Twenty only for a topic known to be weak; an uncertain one gets a short check.
      questions: confidence === 1 && accuracy < 0.5 ? 20 : 10,
      reason: reasonFor(s.right, s.total, daysSince, confidence),
    });
  }

  for (const { subject, topic } of available) {
    if (seen.has(topic)) continue;
    items.push({
      topic,
      subject,
      priority: 0.4,
      right: 0,
      total: 0,
      daysSince: null,
      questions: 10,
      reason: "Not practised yet. A short drill shows where you stand.",
    });
  }

  return items.sort((a, b) => b.priority - a.priority);
}

function reasonFor(right: number, total: number, daysSince: number, confidence: number): string {
  const record = `${right} of ${total} right so far`;
  if (confidence < 1) return `${record}, too few to be sure. A few more questions will tell.`;
  if (right / total < 0.5) return `${record}. One of your weakest topics, so practising it gains the most marks.`;
  if (daysSince >= STALE_DAYS) return `${record}, but last practised ${daysSince} days ago. A refresher stops it slipping.`;
  return `${record}. Close to solid: one more drill should lock it in.`;
}
