"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { EXAMS, SUBJECTS } from "@/lib/practice";
import { buildSimDrill } from "@/lib/practice-sim";
import { ONBOARDING_COOKIE, type OnboardingState } from "@/lib/onboarding";
import { TARGETS, examYears, subjectRule, type StudyProfile } from "@/lib/study-profile";

export type FinishState = { error?: string };

async function save(state: OnboardingState) {
  (await cookies()).set(ONBOARDING_COOKIE, JSON.stringify(state), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

/** Save the answers and go straight into a first drill, not back to a dashboard. */
export async function finishOnboarding(_prev: FinishState, formData: FormData): Promise<FinishState> {
  const exam = String(formData.get("exam") ?? "") as StudyProfile["exam"];
  if (!EXAMS.includes(exam)) return { error: "Pick the exam you are preparing for." };

  const year = Number(formData.get("year"));
  if (!examYears().includes(year)) return { error: "Pick the year you will sit the exam." };

  const subjects = formData.getAll("subjects").map(String);
  const rule = subjectRule(exam);
  if (subjects.some((s) => !(SUBJECTS as readonly string[]).includes(s))) return { error: "Pick subjects from the list." };
  if (subjects.length < rule.min || subjects.length > rule.max || (rule.fixed && !subjects.includes(rule.fixed))) {
    return { error: rule.hint };
  }

  const target = String(formData.get("target") ?? "");
  if (!TARGETS[exam].options.includes(target)) return { error: "Pick a target." };

  const minutes = Number(formData.get("minutes"));
  const profile: StudyProfile = { exam, year, subjects, target, ...(minutes > 0 ? { minutesPerDay: minutes } : {}) };
  await save({ status: "done", profile });
  if (formData.get("returnTo") === "profile") redirect("/profile");

  // First drill: the first chosen subject the sample bank can serve.
  const subject = subjects.find((s) => buildSimDrill({ subject: s, seed: 1 }).length > 0);
  if (!subject) redirect("/practice");
  const query = new URLSearchParams({ mode: "quick", subject, count: "10", seed: String(Math.floor(Math.random() * 1e9)) });
  redirect(`/attempt/sim?${query}`);
}

export async function skipOnboarding(): Promise<void> {
  await save({ status: "skipped" });
  redirect("/dashboard");
}
