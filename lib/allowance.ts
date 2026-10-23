import { apiFetch } from "./api/client";

/**
 * The monthly practice allowance for students without full access ("capped
 * practice", WEB-PRD 6.8). The limit is the one DSA admins already set per
 * plan in Platform Settings (quizzes.monthlyAttempts), read from
 * `GET /api/entitlements/me`, so there is one number to manage, not two.
 *
 * While drills are simulated the backend never sees them, so the page adds
 * this month's finished drills from the browser. Once drills run on the
 * backend its own counter enforces the limit and that local count goes.
 */
export type Allowance = {
  /** The backend's month, YYYY-MM, in its timezone. */
  period: string;
  limit: number;
  /** Counted by the backend: DSA quizzes taken this month. */
  usedOnServer: number;
  resetsAt: string;
  timezone: string;
};

type EntitlementsQuizzes = {
  enabled: boolean;
  period: string;
  used: number;
  limit: number | null;
  resetsAt: string;
};

/** Null when there is no limit to apply, or the API could not say. */
export async function getAllowance(token: string | undefined): Promise<Allowance | null> {
  if (!token) return null;
  try {
    const res = await apiFetch<{ success: boolean; data: { timezone?: string; quizzes?: EntitlementsQuizzes } }>(
      "/entitlements/me",
      { token },
    );
    const q = res.data?.quizzes;
    if (!q || q.limit === null || q.limit === undefined) return null;
    return {
      period: q.period,
      limit: q.limit,
      usedOnServer: q.used ?? 0,
      resetsAt: q.resetsAt,
      timezone: res.data.timezone ?? "Africa/Lagos",
    };
  } catch {
    return null;
  }
}

/** The YYYY-MM a moment falls in, in the backend's timezone. */
export function periodOf(ms: number, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit" }).formatToParts(new Date(ms));
  return `${parts.find((p) => p.type === "year")!.value}-${parts.find((p) => p.type === "month")!.value}`;
}
