"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookmarkSimple,
  CheckCircle,
  Flag,
  Calculator as CalcIcon,
  X,
  XCircle,
} from "@phosphor-icons/react";
import type { SimQuestion } from "@/lib/practice-sim";
import { recordAttempt, setCurrent } from "@/lib/history";
import { loadSaved, toggleSaved, type SavedKind } from "@/lib/saved-questions";
import { button, card } from "@/app/_components/ui";

import { QuestionBody } from "./question-body";
import { ConnectionBanner, useSyncAcrossTabs } from "./connection";
import { LETTERS, Result } from "./result";
import { Calculator } from "./calculator";
import { MathText } from "@/app/_components/math-text";

type Saved = {
  answers: Record<string, number>;
  index: number;
  bookmarks: string[];
  reported: string[];
  finished: boolean;
};

const EMPTY: Saved = { answers: {}, index: 0, bookmarks: [], reported: [], finished: false };

function load(key: string): Saved {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

/**
 * Practice runner (WEB-PRD 6.5): untimed, feedback straight after each answer,
 * then the result and review (6.6). Answers save to this browser as they are
 * picked so a refresh or closed tab loses nothing.
 */
export function PracticeRunner({
  storageKey,
  title,
  mode,
  shortfall,
  questions,
}: {
  storageKey: string;
  title: string;
  mode: string;
  shortfall?: number;
  questions: SimQuestion[];
}) {
  const [state, setState] = useState<Saved>(EMPTY);
  const applyFromOtherTab = useCallback((saved: Saved) => setState((s) => ({ ...s, ...saved })), []);
  useSyncAcrossTabs<Saved>(storageKey, applyFromOtherTab);
  const [calc, setCalc] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Browser storage is only readable after mount.
    // Bookmarks and reports are shared across attempts, not per drill.
    const ids = (kind: SavedKind) => loadSaved(kind).map((e) => e.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ ...load(storageKey), bookmarks: ids("bookmarks"), reported: ids("reported") });
    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Storage blocked: the drill still works, it just won't survive a refresh.
    }
  }, [state, loaded, storageKey]);

  const { answers, index, finished } = state;

  useEffect(() => {
    if (!loaded) return;
    const href = window.location.pathname + window.location.search;
    if (!finished) return setCurrent({ id: storageKey, title, href });
    recordAttempt({ id: storageKey, title, kind: "Practice", href }, questions, answers);
  }, [loaded, finished, storageKey, title, questions, answers]);
  const question = questions[Math.min(index, questions.length - 1)];
  const chosen = answers[question.id];
  const answered = chosen !== undefined;
  const isLast = index === questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  const update = useCallback((patch: Partial<Saved>) => setState((s) => ({ ...s, ...patch })), []);

  const choose = useCallback(
    (option: number) => {
      if (answered || finished || option >= question.options.length) return;
      setState((s) => ({ ...s, answers: { ...s.answers, [question.id]: option } }));
    },
    [answered, finished, question],
  );

  const go = useCallback(
    (to: number) => {
      if (to >= 0 && to < questions.length) update({ index: to });
    },
    [questions.length, update],
  );

  // Keyboard: A to E picks an option, N and P move (WEB-PRD 6.4 rule 5).
  useEffect(() => {
    if (finished) return;
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      const key = e.key.toUpperCase();
      const letter = LETTERS.indexOf(key);
      if (letter >= 0) choose(letter);
      else if (key === "N" || e.key === "ArrowRight") go(index + 1);
      else if (key === "P" || e.key === "ArrowLeft") go(index - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, go, index, finished]);

  function toggle(kind: SavedKind) {
    update({ [kind]: toggleSaved(kind, question.id).map((e) => e.id) });
  }

  if (!loaded) {
    return <div className="m-auto text-sm text-muted">Loading your drill…</div>;
  }

  if (finished) {
    return <Result title={title} againHref={`/practice/${mode}`} questions={questions} answers={answers} />;
  }

  const correct = chosen === question.answer;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <ConnectionBanner />
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <p className="truncate font-semibold">{title}</p>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-tint px-2.5 py-1 text-xs font-semibold text-brand-ink sm:inline">
              Sample questions
            </span>
            <span className="text-xs text-muted" aria-live="polite">Saved</span>
            <Link
              href="/practice"
              onClick={(e) => {
                if (answeredCount > 0 && !confirm("Leave this drill? Your answers stay saved on this device."))
                  e.preventDefault();
              }}
              className="grid size-11 place-items-center rounded-xl text-muted hover:bg-tint hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
            >
              <X size={20} aria-hidden />
              <span className="sr-only">Leave drill</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_17rem] lg:py-10">
        <section className={card} aria-label={`Question ${index + 1}`}>
          {shortfall ? (
            <p className="mb-4 rounded-xl bg-tint px-3.5 py-2.5 text-sm text-brand-ink">
              You asked for {shortfall} questions. The sample bank has {questions.length} for this choice.
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-4 text-sm">
            <p className="font-semibold text-brand-ink">{question.topic}</p>
            <p className="font-mono text-muted tabular-nums">
              {index + 1} of {questions.length}
            </p>
          </div>

          <QuestionBody question={question}>

          <ul className="mt-5 grid gap-2.5">
            {question.options.map((option, i) => {
              const style = !answered
                ? "border-line bg-canvas hover:border-brand hover:bg-tint"
                : i === question.answer
                  ? "border-good bg-good-soft"
                  : i === chosen
                    ? "border-bad bg-bad-soft"
                    : "border-line bg-canvas opacity-55";
              return (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => choose(i)}
                    disabled={answered}
                    aria-pressed={chosen === i}
                    className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default ${style}`}
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface font-mono text-sm font-semibold text-muted">
                      {LETTERS[i]}
                    </span>
                    <span className="flex-1"><MathText text={option} /></span>
                    {answered && i === question.answer && (
                      <CheckCircle size={22} weight="fill" className="text-good" aria-label="Correct answer" />
                    )}
                    {answered && i === chosen && i !== question.answer && (
                      <XCircle size={22} weight="fill" className="text-bad" aria-label="Your answer" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div aria-live="polite">
            {answered ? (
              <div className="mt-5 rounded-xl bg-canvas p-4 text-sm leading-relaxed">
                <p className={`flex items-center gap-1.5 font-semibold ${correct ? "text-good" : "text-bad"}`}>
                  {correct ? <CheckCircle size={18} weight="fill" aria-hidden /> : <XCircle size={18} weight="fill" aria-hidden />}
                  {correct ? "Correct." : `Not quite. The answer is ${LETTERS[question.answer]}.`}
                </p>
                {!correct && question.why[chosen] && <p className="mt-1 text-muted"><MathText text={question.why[chosen]} /></p>}
                <p className="mt-2"><MathText text={question.explanation} /></p>
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted">Pick an answer to see the working. Keys A to {LETTERS[question.options.length - 1]} work too.</p>
            )}
          </div>

          </QuestionBody>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4 text-sm">
            <button
              type="button"
              onClick={() => toggle("bookmarks")}
              aria-pressed={state.bookmarks.includes(question.id)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 font-semibold text-muted hover:text-ink aria-pressed:text-brand-ink focus-visible:outline-2 focus-visible:outline-brand"
            >
              <BookmarkSimple size={18} weight={state.bookmarks.includes(question.id) ? "fill" : "regular"} aria-hidden />
              {state.bookmarks.includes(question.id) ? "Bookmarked" : "Bookmark"}
            </button>
            <button
              type="button"
              onClick={() => toggle("reported")}
              aria-pressed={state.reported.includes(question.id)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 font-semibold text-muted hover:text-ink aria-pressed:text-bad focus-visible:outline-2 focus-visible:outline-brand"
            >
              <Flag size={18} weight={state.reported.includes(question.id) ? "fill" : "regular"} aria-hidden />
              {state.reported.includes(question.id) ? "Reported" : "Report a problem"}
            </button>
          </div>
          {state.reported.includes(question.id) && (
            <p className="mt-2 text-sm text-muted">
              Noted. Follow it under Progress. Reports reach our checkers once the live question bank is connected.
            </p>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className={`${button.secondary} disabled:opacity-50`}>
              <ArrowLeft size={16} aria-hidden />
              Previous
            </button>
            {isLast ? (
              <button type="button" onClick={() => update({ finished: true })} className={button.primary}>
                See result
              </button>
            ) : (
              <button type="button" onClick={() => go(index + 1)} className={button.primary}>
                Next
                <ArrowRight size={16} aria-hidden />
              </button>
            )}
          </div>
        </section>

        <aside className={`${card} self-start lg:sticky lg:top-20`} aria-label="Progress through this drill">
          <p className="text-sm font-semibold">
            {answeredCount} of {questions.length} answered
          </p>
          <ol className="mt-4 grid grid-cols-5 gap-2">
            {questions.map((q, i) => {
              const a = answers[q.id];
              const tone =
                a === undefined ? "border-line text-muted" : a === q.answer ? "border-good bg-good-soft text-good" : "border-bad bg-bad-soft text-bad";
              const status = a === undefined ? "unanswered" : a === q.answer ? "correct" : "wrong";
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={i === index ? "step" : undefined}
                    aria-label={`Question ${i + 1}, ${status}`}
                    className={`grid size-10 w-full place-items-center rounded-lg border font-mono text-sm font-semibold focus-visible:outline-2 focus-visible:outline-brand ${tone} ${i === index ? "ring-2 ring-brand ring-offset-2 ring-offset-surface" : ""}`}
                  >
                    {i + 1}
                  </button>
                </li>
              );
            })}
          </ol>
          <button type="button" onClick={() => update({ finished: true })} className={`${button.secondary} mt-5 w-full`}>
            Finish drill
          </button>
        </aside>
      </div>
      <button
        type="button"
        onClick={() => setCalc((c) => !c)}
        aria-pressed={calc}
        title="Calculator"
        className="fixed right-6 bottom-6 z-40 grid size-12 place-items-center rounded-2xl bg-brand text-on-brand shadow-xl active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <CalcIcon size={20} aria-hidden />
        <span className="sr-only">Calculator</span>
      </button>
      {calc && <Calculator onClose={() => setCalc(false)} />}
    </>
  );
}
