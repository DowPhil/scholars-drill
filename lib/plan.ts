import type { SessionUser } from "./auth/session";

/**
 * What a student has paid for, and until when, as Scholars Drill sees it.
 *
 * Read from the plan fields `/auth/me` already returns, with the backend's
 * own rules (utils/entitlements.js, accessHelpers.computeEffectiveAccessLevel):
 *   - a verified, unexpired on-campus enrollment is a paid plan to its end date;
 *   - a Tutorial plan runs to `tutorialExpiry`; a Portal plan has no end date;
 *   - access switched off, or payment disabled or expired, ends paid access.
 * A DSA student with no plan on record is covered by DSA and never asked to
 * pay twice (WEB-PRD 2, P2).
 */

/** Warn this many days before a plan ends. */
export const WARN_DAYS = 14;

export type PlanStatus = {
  kind: "dsa" | "paid" | "free";
  /** Tutorial, Portal or Physical (on campus); empty when there is no named plan. */
  label: string;
  /** Full access right now: the paid features are open. */
  full: boolean;
  /** none: no end date. ending: within WARN_DAYS. expired: a plan that has run out. */
  state: "active" | "ending" | "expired" | "none";
  endsAt?: string;
  daysLeft?: number;
};

const DAY = 86_400_000;

export function getPlanStatus(user: SessionUser, now = new Date()): PlanStatus {
  const kind = user.studentId ? "dsa" : "free";
  const pe = user.physicalEnrollment;
  const physical = Boolean(pe?.verified && user.learningMode === "physical");
  const level = user.accessLevel ?? "free";
  const hasPlan = physical || level === "tutorial" || level === "portal";

  const endsAt = physical ? pe?.expiresAt ?? undefined : level === "tutorial" ? user.tutorialExpiry ?? undefined : undefined;
  const label = physical ? "Physical (on campus)" : level === "tutorial" ? "Tutorial" : level === "portal" ? "Portal" : "";
  const lapsed =
    user.paymentStatus === "expired" ||
    user.paymentStatus === "disabled" ||
    user.accessEnabled === false ||
    (endsAt !== undefined && new Date(endsAt) <= now);

  if (!hasPlan) {
    // Had a plan and it ran out: the backend resets the level but keeps the status.
    if (user.paymentStatus === "expired") return { kind, label: "", full: false, state: "expired", endsAt: user.tutorialExpiry ?? undefined };
    return kind === "dsa" ? { kind, label, full: true, state: "none" } : { kind, label, full: false, state: "none" };
  }

  const planKind = kind === "dsa" ? "dsa" : "paid";
  if (lapsed) return { kind: planKind, label, full: false, state: "expired", endsAt };
  if (!endsAt) return { kind: planKind, label, full: true, state: "none" };

  const daysLeft = Math.ceil((new Date(endsAt).getTime() - now.getTime()) / DAY);
  return { kind: planKind, label, full: true, state: daysLeft <= WARN_DAYS ? "ending" : "active", endsAt, daysLeft };
}

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
