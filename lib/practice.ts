/**
 * What a student can choose when setting up practice.
 *
 * The API has no subject or topic catalogue endpoint yet, so this is the list.
 * Subject and topic strings must match `Question.subject` and `Question.topic`
 * in the bank exactly, or filters return nothing. Replace with an API call once
 * one exists.
 */

export const EXAMS = ["JAMB", "WAEC", "NECO", "Post-UTME"] as const;

export const YEARS = Array.from({ length: 16 }, (_, i) => String(2025 - i));

export const COUNTS = [10, 20, 30, 40] as const;

export const DIFFICULTIES = [
  { value: "mixed", label: "Mixed" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
] as const;

/** JAMB syllabus headings. A subject with no entry cannot do topic practice yet. */
export const TOPICS: Record<string, string[]> = {
  "Use of English": ["Comprehension", "Summary", "Lexis and structure", "Synonyms", "Antonyms", "Oral English", "Sentence interpretation"],
  Mathematics: ["Indices and logarithms", "Sets", "Quadratic equations", "Variation", "Sequences and series", "Matrices", "Trigonometry", "Mensuration", "Coordinate geometry", "Differentiation", "Integration", "Statistics", "Probability", "Permutation and combination"],
  Physics: ["Measurement and units", "Motion", "Work, energy and power", "Heat", "Waves", "Light", "Electricity", "Magnetism", "Modern physics"],
  Chemistry: ["Atomic structure", "Chemical bonding", "Stoichiometry", "Gas laws", "Acids, bases and salts", "Electrolysis", "Organic chemistry", "Rates of reaction", "Equilibrium"],
  Biology: ["Cell biology", "Classification", "Nutrition", "Transport", "Respiration", "Reproduction", "Genetics", "Ecology", "Evolution"],
};

export const SUBJECTS = [
  "Use of English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Government",
  "Literature in English",
  "Commerce",
  "Principles of Accounts",
  "Geography",
  "Agricultural Science",
  "Christian Religious Studies",
  "Islamic Religious Studies",
] as const;

export type ModeSlug = "quick" | "topic" | "mixed" | "past";

type ModeField = "subject" | "topic" | "count" | "difficulty" | "exam" | "year";

export const MODES: Record<
  ModeSlug,
  { title: string; summary: string; fields: ModeField[]; instructions: string }
> = {
  quick: {
    title: "Quick drill",
    summary: "Pick a subject and a number of questions. Done in minutes.",
    fields: ["subject", "count", "difficulty"],
    instructions: "Questions come from across the subject.",
  },
  topic: {
    title: "Topic practice",
    summary: "Go straight to the topic you keep getting wrong.",
    fields: ["subject", "topic", "count", "difficulty"],
    instructions: "Every question is from the topic you picked.",
  },
  mixed: {
    title: "Mixed practice",
    summary: "Questions drawn across a subject's topics, so you see where you stand.",
    fields: ["subject", "count", "difficulty"],
    instructions: "Questions are spread evenly across the subject's topics.",
  },
  past: {
    title: "Past questions",
    summary: "Choose the exam, the subject and the year.",
    fields: ["exam", "subject", "year"],
    instructions: "The questions from that paper, in their original order.",
  },
};

export function isModeSlug(value: string): value is ModeSlug {
  return value in MODES;
}

/** Untimed practice, so this is a guide: about 45 seconds a question. */
export function estimateMinutes(count: number): number {
  return Math.max(1, Math.round((count * 45) / 60));
}

/** Where a "Practise <topic>" button goes: topic practice if the topic is listed, else a quick drill. */
export function practiseHref(subject: string, topic?: string, count?: number): string {
  const extra: Record<string, string> = count ? { count: String(count) } : {};
  if (topic && TOPICS[subject]?.includes(topic)) {
    return `/practice/topic?${new URLSearchParams({ subject, topic, ...extra })}`;
  }
  return `/practice/quick?${new URLSearchParams({ subject, ...extra })}`;
}
