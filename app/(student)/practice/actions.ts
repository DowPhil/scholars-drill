"use server";

import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api/client";
import { getSession, getSessionToken } from "@/lib/auth/session";
import { getPlanStatus } from "@/lib/plan";
import { getAllowance } from "@/lib/allowance";
import { SIMULATE_PRACTICE } from "@/lib/practice-sim";
import { COUNTS, DIFFICULTIES, EXAMS, MODES, SUBJECTS, TOPICS, YEARS, isModeSlug } from "@/lib/practice";

export type StartState = { error?: string };

type StartResponse = { attemptId: string };

/**
 * Start a practice session.
 *
 * Calls the on-demand assembly endpoint the PRD recommends (§2.2, option a).
 * Until the backend ships it, the 404 is reported as what it is rather than as
 * "no questions found".
 */
export async function startPractice(_prev: StartState, formData: FormData): Promise<StartState> {
  const get = (key: string) => String(formData.get(key) ?? "");
  const mode = get("mode");
  if (!isModeSlug(mode)) return { error: "Pick a practice mode first." };

  const fields = MODES[mode].fields;
  const body: Record<string, string | number> = { mode };

  const subject = get("subject");
  if (!(SUBJECTS as readonly string[]).includes(subject)) return { error: "Pick a subject." };
  body.subject = subject;

  if (fields.includes("topic")) {
    const topic = get("topic");
    if (!TOPICS[subject]?.includes(topic)) return { error: "Pick a topic." };
    body.topic = topic;
  }
  if (fields.includes("count")) {
    const count = Number(get("count"));
    if (!(COUNTS as readonly number[]).includes(count)) return { error: "Pick how many questions." };
    body.count = count;
  }
  if (fields.includes("difficulty")) {
    const difficulty = get("difficulty");
    if (!DIFFICULTIES.some((d) => d.value === difficulty)) return { error: "Pick a difficulty." };
    if (difficulty !== "mixed") body.difficulty = difficulty;
  }
  if (fields.includes("exam")) {
    const exam = get("exam");
    if (!(EXAMS as readonly string[]).includes(exam)) return { error: "Pick an exam." };
    body.examination = exam;
  }
  if (fields.includes("year")) {
    const year = get("year");
    if (!YEARS.includes(year)) return { error: "Pick a year." };
    body.year = Number(year);
  }

  // The page enforces the free allowance with this browser's count too; here
  // only the server's count is known, so this catches what the page cannot.
  const session = await getSession();
  if (session && !getPlanStatus(session).full) {
    const allowance = await getAllowance(await getSessionToken());
    if (allowance && allowance.usedOnServer >= allowance.limit) {
      return { error: `You have used all ${allowance.limit} free practice sessions this month.` };
    }
  }

  if (SIMULATE_PRACTICE) {
    const query = new URLSearchParams({
      ...Object.fromEntries(Object.entries(body).map(([k, v]) => [k, String(v)])),
      seed: String(Math.floor(Math.random() * 1e9)),
    });
    redirect(`/attempt/sim?${query}`);
  }

  const token = await getSessionToken();
  if (!token) redirect(`/login?next=/practice/${mode}`);

  let attemptId: string;
  try {
    const result = await apiFetch<StartResponse>("/practice/sessions", { method: "POST", token, body });
    if (!result?.attemptId) return { error: "The server did not start a session. Try again." };
    attemptId = result.attemptId;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { error: "Starting practice is not switched on yet. The server cannot build drills so far." };
    }
    if (error instanceof ApiError) return { error: error.message };
    return { error: "Something went wrong. Try again." };
  }

  // redirect() throws to unwind, so it must sit outside the try block.
  redirect(`/attempt/${attemptId}`);
}
