"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { loadHistory } from "@/lib/history";
import { periodOf, type Allowance } from "@/lib/allowance";
import { Play } from "@phosphor-icons/react";
import {
  COUNTS,
  DIFFICULTIES,
  EXAMS,
  MODES,
  SUBJECTS,
  TOPICS,
  YEARS,
  estimateMinutes,
  type ModeSlug,
} from "@/lib/practice";
import { button, card } from "@/app/_components/ui";
import { field, FormError } from "@/app/(auth)/_components/form";
import { startPractice, type StartState } from "../actions";

const label = "text-sm font-semibold";

export function SetupForm({
  mode,
  initialSubject,
  initialTopic,
  initialCount,
  allowance,
}: {
  mode: ModeSlug;
  initialSubject?: string;
  initialTopic?: string;
  initialCount?: number;
  /** Set only for students without full access. */
  allowance?: Allowance | null;
}) {
  const startSubject = (SUBJECTS as readonly string[]).includes(initialSubject ?? "") ? initialSubject! : "";
  const startTopic = TOPICS[startSubject]?.includes(initialTopic ?? "") ? initialTopic! : "";
  const { fields, instructions } = MODES[mode];
  const [state, action, pending] = useActionState<StartState, FormData>(startPractice, {});
  const [subject, setSubject] = useState(startSubject);
  const [topic, setTopic] = useState(startTopic);
  const [count, setCount] = useState<number>(
    (COUNTS as readonly number[]).includes(initialCount ?? 0) ? initialCount! : COUNTS[0],
  );
  const [difficulty, setDifficulty] = useState("mixed");
  const [exam, setExam] = useState<string>(EXAMS[0]);
  const [year, setYear] = useState(YEARS[0]);
  const [usedLocally, setUsedLocally] = useState(0);

  useEffect(() => {
    if (!allowance) return;
    // Drills finished this month in this browser; the backend cannot see them yet.
    const n = loadHistory().filter((a) => periodOf(a.finishedAt, allowance.timezone) === allowance.period).length;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsedLocally(n);
  }, [allowance]);

  const remaining = allowance ? Math.max(0, allowance.limit - allowance.usedOnServer - usedLocally) : null;
  const usedUp = remaining === 0;

  const has = (name: (typeof fields)[number]) => fields.includes(name);
  const topics = TOPICS[subject] ?? [];
  const noTopics = has("topic") && subject !== "" && topics.length === 0;

  const summary: Array<[string, string]> = [["Mode", MODES[mode].title]];
  if (has("exam")) summary.push(["Exam", `${exam} ${year}`]);
  summary.push(["Subject", subject || "Not chosen"]);
  if (has("topic")) summary.push(["Topic", topic || "Not chosen"]);
  if (has("count")) {
    summary.push(["Questions", String(count)], ["Estimated time", `About ${estimateMinutes(count)} min`]);
  } else {
    summary.push(["Questions", "The full paper"]);
  }
  if (has("difficulty")) {
    summary.push(["Difficulty", DIFFICULTIES.find((d) => d.value === difficulty)!.label]);
  }

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
      <input type="hidden" name="mode" value={mode} />

      <div className={`${card} grid gap-5`}>
        {has("exam") && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="exam" className={label}>Exam</label>
              <select id="exam" name="exam" value={exam} onChange={(e) => setExam(e.target.value)} className={field}>
                {EXAMS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="year" className={label}>Year</label>
              <select id="year" name="year" value={year} onChange={(e) => setYear(e.target.value)} className={field}>
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="grid gap-2">
          <label htmlFor="subject" className={label}>Subject</label>
          <select
            id="subject"
            name="subject"
            required
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setTopic("");
            }}
            className={field}
          >
            <option value="" disabled>Choose a subject</option>
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {has("topic") && (
          <div className="grid gap-2">
            <label htmlFor="topic" className={label}>Topic</label>
            <select
              id="topic"
              name="topic"
              required
              disabled={!subject || noTopics}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={`${field} disabled:opacity-60`}
            >
              <option value="" disabled>{subject ? "Choose a topic" : "Choose a subject first"}</option>
              {topics.map((t) => <option key={t}>{t}</option>)}
            </select>
            {noTopics && (
              <p className="text-sm text-muted">
                Topics for {subject} are not listed yet. Try a Quick drill or Mixed practice instead.
              </p>
            )}
          </div>
        )}

        {has("count") && (
          <fieldset className="grid gap-2">
            <legend className={`${label} mb-2`}>Number of questions</legend>
            <div className="grid grid-cols-4 gap-2">
              {COUNTS.map((n) => (
                <label
                  key={n}
                  className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line font-mono font-semibold has-checked:border-brand has-checked:bg-tint has-checked:text-brand-ink has-focus-visible:outline-2 has-focus-visible:outline-brand"
                >
                  <input type="radio" name="count" value={n} checked={count === n} onChange={() => setCount(n)} className="sr-only" />
                  {n}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {has("difficulty") && (
          <fieldset className="grid gap-2">
            <legend className={`${label} mb-2`}>Difficulty</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DIFFICULTIES.map((d) => (
                <label
                  key={d.value}
                  className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line text-sm font-semibold has-checked:border-brand has-checked:bg-tint has-checked:text-brand-ink has-focus-visible:outline-2 has-focus-visible:outline-brand"
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={d.value}
                    checked={difficulty === d.value}
                    onChange={() => setDifficulty(d.value)}
                    className="sr-only"
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>

      <aside className={`${card} lg:sticky lg:top-8`} aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="font-semibold">Before you start</h2>
        <dl className="mt-4 grid gap-3 text-sm">
          {summary.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-5 grid gap-1.5 border-t border-line pt-4 text-sm text-muted">
          <li>{instructions}</li>
          <li>Untimed. You see the answer and working after each question.</li>
          <li>Your answers save as you go.</li>
        </ul>

        <div className="mt-5">
          <FormError message={state.error} />
          {allowance && remaining !== null && (
            <p className={`mt-2 rounded-xl px-3.5 py-3 text-sm ${usedUp ? "bg-bad-soft font-medium text-bad" : "bg-tint text-brand-ink"}`}>
              {usedUp
                ? `You have used all ${allowance.limit} free practice sessions this month. They come back on ${new Date(allowance.resetsAt).toLocaleDateString("en-NG", { day: "numeric", month: "long" })}.`
                : `${remaining} of ${allowance.limit} free practice sessions left this month.`}{" "}
              <Link href="/profile/plan" className="font-semibold underline underline-offset-2">
                {usedUp ? "See paid plans" : "Want more?"}
              </Link>
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={pending || noTopics || usedUp}
          className={`${button.primary} mt-3 w-full disabled:opacity-60`}
        >
          <Play size={16} weight="fill" aria-hidden />
          {pending ? "Starting..." : "Start"}
        </button>
      </aside>
    </form>
  );
}
