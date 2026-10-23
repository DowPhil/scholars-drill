"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle } from "@phosphor-icons/react";
import type { SimQuestion } from "@/lib/practice-sim";
import { practiseHref } from "@/lib/practice";
import { button, card } from "@/app/_components/ui";
import { MathText } from "@/app/_components/math-text";

export const LETTERS = ["A", "B", "C", "D", "E"];

type Tally = { right: number; total: number; subject: string };

function tallyBy(questions: SimQuestion[], answers: Record<string, number>, key: "topic" | "subject") {
  const groups: Record<string, Tally> = {};
  for (const q of questions) {
    const t = (groups[q[key]] ??= { right: 0, total: 0, subject: q.subject });
    t.total += 1;
    if (answers[q.id] === q.answer) t.right += 1;
  }
  return Object.entries(groups).sort(([, a], [, b]) => a.right / a.total - b.right / b.total);
}

function Breakdown({ heading, rows, practise }: { heading: string; rows: Array<[string, Tally]>; practise: boolean }) {
  return (
    <section className={`${card} mt-6`}>
      <h2 className="font-semibold">{heading}</h2>
      <ul className="mt-4 grid gap-3">
        {rows.map(([name, t]) => (
          <li key={name} className="flex flex-wrap items-center gap-3">
            <span className="min-w-40 flex-1 text-sm font-medium">{name}</span>
            <span className="h-2 w-24 overflow-hidden rounded-full bg-line" aria-hidden>
              <span className="block h-full bg-brand" style={{ width: `${(t.right / t.total) * 100}%` }} />
            </span>
            <span className="w-12 text-right font-mono text-sm text-muted">
              {t.right}/{t.total}
            </span>
            {practise && (
              <Link
                href={practiseHref(t.subject, name)}
                className="rounded-full px-3 py-1.5 text-sm font-semibold text-brand-ink hover:bg-tint focus-visible:outline-2 focus-visible:outline-brand"
              >
                Practise {name}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Result and review (WEB-PRD 6.6), shared by practice and CBT. */
export function Result({
  title,
  againHref,
  questions,
  answers,
  timeUsed,
  notice,
}: {
  title: string;
  againHref: string;
  questions: SimQuestion[];
  answers: Record<string, number>;
  timeUsed?: string;
  notice?: string;
}) {
  const [onlyWrong, setOnlyWrong] = useState(false);
  const total = questions.length;
  const right = questions.filter((q) => answers[q.id] === q.answer).length;
  const unanswered = questions.filter((q) => answers[q.id] === undefined).length;
  const wrong = total - right - unanswered;
  const percent = Math.round((right / total) * 100);

  const byTopic = tallyBy(questions, answers, "topic");
  const bySubject = tallyBy(questions, answers, "subject");
  const strong = byTopic.filter(([, t]) => t.right === t.total).map(([n]) => n);
  const weak = byTopic.filter(([, t]) => t.right < t.total).map(([n]) => n);
  const sentence =
    weak.length === 0
      ? "Every answer right. Try a harder drill or another subject."
      : unanswered > total / 2
        ? `You left ${unanswered} unanswered. A blank scores nothing, so answer every question, even when unsure.`
        : percent >= 50 && strong.length > 0
          ? `Good attempt. You were strong in ${strong.slice(0, 2).join(" and ")} but lost marks in ${weak[0]}.`
          : `Keep going. Start with ${weak[0]}: that is where most marks went.`;

  const review = onlyWrong ? questions.filter((q) => answers[q.id] !== q.answer) : questions;
  const stats: Array<[string, number | string, string]> = [
    ["Correct", right, "text-good"],
    ["Incorrect", wrong, "text-bad"],
    ["Unanswered", unanswered, "text-muted"],
  ];
  if (timeUsed) stats.push(["Time used", timeUsed, "text-ink"]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      {notice && <p className="mb-6 rounded-xl bg-tint px-4 py-3 text-sm font-medium text-brand-ink">{notice}</p>}
      <p className="text-sm font-semibold text-brand-ink">{title}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        <span className="font-mono">{right}</span> of <span className="font-mono">{total}</span>{" "}
        <span className="text-muted">({percent}%)</span>
      </h1>
      <p className="mt-2 text-muted">{sentence}</p>

      <dl className={`mt-6 grid grid-cols-2 gap-3 ${timeUsed ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
        {stats.map(([label, value, tone]) => (
          <div key={label} className={card}>
            <dt className="text-sm text-muted">{label}</dt>
            <dd className={`mt-1 font-mono text-2xl font-semibold ${tone}`}>{value}</dd>
          </div>
        ))}
      </dl>

      {bySubject.length > 1 && <Breakdown heading="By subject, weakest first" rows={bySubject} practise={false} />}
      <Breakdown heading="By topic, weakest first" rows={byTopic} practise />

      <section className="mt-8" aria-labelledby="review-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="review-heading" className="text-lg font-semibold">Review</h2>
          <div className="flex gap-1 rounded-full border border-line bg-surface p-1 text-sm" role="group" aria-label="Filter review">
            {([["All", false], ["Wrong and unanswered", true]] as const).map(([label, value]) => (
              <button
                key={label}
                type="button"
                aria-pressed={onlyWrong === value}
                onClick={() => setOnlyWrong(value)}
                className="rounded-full px-3 py-1.5 font-semibold text-muted aria-pressed:bg-tint aria-pressed:text-brand-ink focus-visible:outline-2 focus-visible:outline-brand"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {review.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Nothing to review here. Every answer was right.</p>
        ) : (
          <ol className="mt-4 grid gap-3">
            {review.map((q) => {
              const a = answers[q.id];
              const ok = a === q.answer;
              return (
                <li key={q.id} className={`${card} border-l-4 ${ok ? "border-l-good" : "border-l-bad"}`}>
                  <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
                    {ok ? (
                      <CheckCircle size={18} weight="fill" className="text-good" aria-hidden />
                    ) : (
                      <XCircle size={18} weight="fill" className="text-bad" aria-hidden />
                    )}
                    <span className={ok ? "text-good" : "text-bad"}>{ok ? "Correct" : a === undefined ? "Unanswered" : "Incorrect"}</span>
                    <span className="text-muted">
                      · Question {questions.indexOf(q) + 1} · {q.subject}, {q.topic}
                    </span>
                  </p>
                  {q.passage && (
                    <details className="mt-2 text-sm">
                      <summary className="cursor-pointer font-semibold text-brand-ink">Show the passage</summary>
                      <p className="mt-2 leading-relaxed text-muted"><MathText text={q.passage.text} /></p>
                    </details>
                  )}
                  {q.image && (
                    // eslint-disable-next-line @next/next/no-img-element -- a small SVG diagram; next/image adds nothing here
                    <img src={q.image.src} alt={q.image.alt} className="mt-3 h-auto max-h-40 w-auto rounded-lg border border-line bg-white" />
                  )}
                  <p className="mt-2 font-medium"><MathText text={q.prompt} /></p>
                  <p className="mt-2 text-sm">
                    {a !== undefined && !ok && (
                      <>
                        Your answer: {LETTERS[a]}. <MathText text={q.options[a]} /> ·{" "}
                      </>
                    )}
                    Correct answer: {LETTERS[q.answer]}. <MathText text={q.options[q.answer]} />
                  </p>
                  <p className="mt-2 text-sm text-muted"><MathText text={q.explanation} /></p>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={againHref} className={button.primary}>
          Practise again
        </Link>
        <Link href="/dashboard" className={button.secondary}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
