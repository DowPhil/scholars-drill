"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookmarkSimple, Play } from "@phosphor-icons/react";
import { getSimQuestions } from "@/lib/practice-sim";
import { loadSaved, toggleSaved, type SavedEntry } from "@/lib/saved-questions";
import { button, card } from "@/app/_components/ui";
import { LETTERS } from "@/app/(runner)/attempt/[attemptId]/result";
import { MathText } from "@/app/_components/math-text";

/** Bookmarks (WEB-PRD 6.3): every saved question, filterable, practisable again. */
export function BookmarksView() {
  const [entries, setEntries] = useState<SavedEntry[] | null>(null);
  const [subject, setSubject] = useState("All");
  const router = useRouter();

  useEffect(() => {
    // Browser storage is only readable after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(loadSaved("bookmarks"));
  }, []);

  if (entries === null) {
    return <div className={`${card} mt-8 h-40 animate-pulse motion-reduce:animate-none`} aria-label="Loading bookmarks" />;
  }

  const questions = getSimQuestions(entries.map((e) => e.id));
  if (questions.length === 0) {
    return (
      <div className={`${card} mt-8 max-w-2xl`}>
        <BookmarkSimple size={24} className="text-brand-ink" aria-hidden />
        <h2 className="mt-3 font-semibold">No bookmarks yet</h2>
        <p className="mt-1 text-muted">
          Tap Bookmark on any practice question to keep it here, then practise your saved questions together.
        </p>
        <Link href="/practice" className={`${button.primary} mt-5`}>
          Start practising
        </Link>
      </div>
    );
  }

  const subjects = ["All", ...new Set(questions.map((q) => q.subject))];
  const shown = subject === "All" ? questions : questions.filter((q) => q.subject === subject);
  // A fresh seed per click, so each run is a new attempt rather than the last result.
  const startDrill = () =>
    router.push(
      `/attempt/sim?${new URLSearchParams({ mode: "bookmarks", ids: shown.map((q) => q.id).join(","), seed: String(Date.now()) })}`,
    );

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-full border border-line bg-surface p-1 text-sm" role="group" aria-label="Filter by subject">
          {subjects.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={subject === s}
              onClick={() => setSubject(s)}
              className="rounded-full px-3 py-1.5 font-semibold text-muted aria-pressed:bg-tint aria-pressed:text-brand-ink focus-visible:outline-2 focus-visible:outline-brand"
            >
              {s}
            </button>
          ))}
        </div>
        <button type="button" onClick={startDrill} className={button.primary}>
          <Play size={16} weight="fill" aria-hidden />
          Practise {shown.length === 1 ? "this question" : `these ${shown.length}`}
        </button>
      </div>

      <ol className="mt-6 grid gap-3">
        {shown.map((q) => (
          <li key={q.id} className={card}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-brand-ink">
                {q.subject} · {q.topic}
              </p>
              <button
                type="button"
                onClick={() => setEntries(toggleSaved("bookmarks", q.id))}
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
              >
                <BookmarkSimple size={18} weight="fill" aria-hidden />
                Remove
              </button>
            </div>
            <p className="mt-1 font-medium"><MathText text={q.prompt} /></p>
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer font-semibold text-brand-ink">Show answer and working</summary>
              <p className="mt-2">
                Answer: {LETTERS[q.answer]}. <MathText text={q.options[q.answer]} />
              </p>
              <p className="mt-1 text-muted"><MathText text={q.explanation} /></p>
            </details>
          </li>
        ))}
      </ol>
    </>
  );
}
