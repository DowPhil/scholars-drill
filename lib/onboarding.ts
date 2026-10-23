import { cookies } from "next/headers";
import type { StudyProfile } from "./study-profile";

/**
 * Onboarding's outcome, kept in a cookie so the server can decide "never shown
 * twice" and the dashboard can use the profile, until the backend has
 * somewhere to store it.
 */

export const ONBOARDING_COOKIE = "sd_onboarding";

export type OnboardingState = { status: "done"; profile: StudyProfile } | { status: "skipped" };

export async function readOnboarding(): Promise<OnboardingState | null> {
  const raw = (await cookies()).get(ONBOARDING_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return null;
  }
}
