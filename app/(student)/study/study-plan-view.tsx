"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "@phosphor-icons/react";
import { loadHistory, type AttemptRecord } from "@/lib/history";
import { practiseHref, TOPICS } from "@/lib/practice";
import { buildSimDrill } from "@/lib/practice-sim";
import { rankTopics } from "@/lib/study-plan";
import { button, card } from "@/app/_components/ui";

/** How many topics a plan holds: enough for a week, few enough to act on. */
const PLAN_SIZE = 5;

/** The study plan (AI-STUDY-MODE C3), ranked by formula from this browser's history. */
export function StudyPlanView({ subjects }: { subjects: string[] }) {
  const [history, setHistory] = useState<AttemptRecord[] | null>(null);

  useEffect(() => {
    // Browser storage is only readable after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(loadHistory());
  }, []);

  if (history === null) {
    return <div className={`${card} mt-8 h-48 animate-pulse motion-reduce:animate-none`} aria-label="Loading your plan" />;
  }

  // Untried topics from the student's subjects. While practice is simulated,
  // only topics the sample bank can serve, so every Practise button works.
  const available = subjects.flatMap((subject) =>
    (TOPICS[subject] ?? [])
      .filter((topic) => buildSimDrill({ subject, topic, seed: 1 }).length > 0)
      .map((topic) => ({ subject, topic })),
  );
  const plan = rankTopics(history, available).slice(0, PLAN_SIZE);

  if (plan.length === 0) {
    return (
      <div className={`${card} mt-8 max-w-2xl`}>
        <Compass size={24} className="text-brand-ink" aria-hidden />
        <h2 className="mt-3 font-semibold">Nothing to plan yet</h2>
        <p className="mt-1 text-muted">
          {subjects.length === 0
            ? "Tell us your subjects, or finish a drill, and your plan builds itself from your results."
            : "Every topic you have practised is strong and recent. Try a CBT simulation to test it all together."}
        </p>
        <Link href={subjects.length === 0 ? "/profile/study" : "/practice"} className={`${button.primary} mt-5`}>
          {subjects.length === 0 ? "Set your subjects" : "Practise"}
        </Link>
      </div>
    );
  }

  const totalQuestions = plan.reduce((n, p) => n + p.questions, 0);

  return (
    <>
      <p className="mt-6 text-sm text-muted">
        {plan.length} topics, {totalQuestions} questions in all. Work down the list; it updates after every drill.
      </p>
      <ol className="mt-4 grid max-w-3xl gap-3">
        {plan.map((item, i) => (
          <li key={item.topic} className={`${card} flex flex-wrap items-start gap-4`}>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-tint font-mono text-sm font-semibold text-brand-ink">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {item.topic} <span className="font-normal text-muted">· {item.subject}</span>
              </p>
              <p className="mt-1 text-sm text-muted">{item.reason}</p>
              {item.total > 0 && (
                <span className="mt-3 block h-1.5 w-40 overflow-hidden rounded-full bg-line" aria-hidden>
                  <span className="block h-full bg-brand" style={{ width: `${(item.right / item.total) * 100}%` }} />
                </span>
              )}
            </div>
            <Link href={practiseHref(item.subject, item.topic, item.questions)} className={`${button.secondary} shrink-0`}>
              {item.questions} questions
              <ArrowRight size={14} aria-hidden />
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-6 max-w-3xl text-xs text-muted">
        How it is ranked: low accuracy first, then topics you have not practised lately, then ones you have not tried.
        Topics with only a few questions answered are treated as uncertain rather than weak or strong.
      </p>
    </>
  );
}
