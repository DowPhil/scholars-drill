import { EXAMS } from "./practice";

/** What onboarding learns about a student (WEB-PRD 6.1). Safe to use in the browser. */
export type StudyProfile = {
  exam: (typeof EXAMS)[number];
  year: number;
  subjects: string[];
  /** JAMB and Post-UTME: a score; WAEC and NECO: a grade. */
  target: string;
  minutesPerDay?: number;
};

/** Exam years a candidate can be preparing for: from the next sitting onward. */
export function examYears(now = new Date()): number[] {
  // JAMB sits around April to May, so from mid-year the next sitting is next year.
  const first = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();
  return [first, first + 1, first + 2];
}

export const TARGETS: Record<StudyProfile["exam"], { label: string; options: string[] }> = {
  JAMB: { label: "Target UTME score, out of 400", options: ["200", "250", "280", "300", "320", "350"] },
  "Post-UTME": { label: "Target Post-UTME score, out of 100", options: ["50", "60", "70", "80", "90"] },
  WAEC: { label: "Grade you are aiming for in most subjects", options: ["A1", "B2", "B3", "C4"] },
  NECO: { label: "Grade you are aiming for in most subjects", options: ["A1", "B2", "B3", "C4"] },
};

export const MINUTES = [10, 20, 30, 60];

/** JAMB and Post-UTME: Use of English plus three. WAEC and NECO: up to nine. */
export function subjectRule(exam: StudyProfile["exam"]) {
  return exam === "JAMB" || exam === "Post-UTME"
    ? { min: 4, max: 4, fixed: "Use of English", hint: "Use of English plus three others, as on your UTME form." }
    : { min: 1, max: 9, fixed: undefined, hint: "Pick up to nine: the subjects you will sit." };
}
