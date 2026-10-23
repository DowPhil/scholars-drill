"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Calculator as CalcIcon, Flag, Timer, X } from "@phosphor-icons/react";
import type { SimQuestion } from "@/lib/practice-sim";
import { recordAttempt, setCurrent } from "@/lib/history";
import { button, card } from "@/app/_components/ui";
import { Calculator } from "./calculator";
import { QuestionBody } from "./question-body";
import { ConnectionBanner, useSyncAcrossTabs } from "./connection";
import { LETTERS, Result } from "./result";
import { MathText } from "@/app/_components/math-text";

type Saved = {
  answers: Record<string, number>;
  flagged: string[];
  index: number;
  submittedAt: number | null;
  timedOut: boolean;
};

const EMPTY: Saved = { answers: {}, flagged: [], index: 0, submittedAt: null, timedOut: false };

function clock(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

function duration(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

/**
 * The CBT runner (WEB-PRD 6.4): one countdown for the whole sitting, subject
 * tabs, a per-subject question grid, flags, calculator, and no feedback until
 * submit. The deadline comes from the start time the server stamped; the
 * display only counts down to it.
 */
export function CbtRunner({
  storageKey,
  title,
  subjects,
  questions,
  startedAt,
  minutes,
  againHref,
}: {
  storageKey: string;
  title: string;
  subjects: string[];
  questions: SimQuestion[];
  startedAt: number;
  minutes: number;
  againHref: string;
}) {
  const router = useRouter();
  const deadline = startedAt + minutes * 60_000;
  const [state, setState] = useState<Saved>(EMPTY);
  const applyFromOtherTab = useCallback((saved: Saved) => setState((s) => ({ ...s, ...saved })), []);
  useSyncAcrossTabs<Saved>(storageKey, applyFromOtherTab);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [confirming, setConfirming] = useState(false);
  const [calc, setCalc] = useState(false);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      // Storage blocked: the sitting still works, it just won't survive a refresh.
    }
    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
  }, [state, loaded, storageKey]);

  const submitted = state.submittedAt !== null;

  useEffect(() => {
    if (!loaded) return;
    const href = window.location.pathname + window.location.search;
    if (state.submittedAt === null) return setCurrent({ id: storageKey, title, href });
    const timeMs = state.submittedAt - startedAt;
    recordAttempt({ id: storageKey, title, kind: "CBT", href, timeMs }, questions, state.answers, state.submittedAt);
  }, [loaded, state.submittedAt, state.answers, storageKey, title, questions, startedAt]);
  const remaining = deadline - now;

  const submit = useCallback((timedOut: boolean) => {
    setConfirming(false);
    setState((s) => (s.submittedAt ? s : { ...s, submittedAt: Math.min(Date.now(), deadline), timedOut }));
  }, [deadline]);

  // Tick once a second; the deadline decides, not the tick count.
  useEffect(() => {
    if (!loaded || submitted) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [loaded, submitted]);

  useEffect(() => {
    if (!loaded || submitted) return;
    if (remaining <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      submit(true);
      return;
    }
    const mins = Math.ceil(remaining / 60000);
    if ((mins === 5 || mins === 1) && remaining % 60000 > 59000) setAnnounce(`${mins} minute${mins > 1 ? "s" : ""} left.`);
  }, [remaining, loaded, submitted, submit]);

  // Closing the tab is not leaving: warn, and the attempt resumes on return.
  useEffect(() => {
    if (!loaded || submitted) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [loaded, submitted]);

  const { answers, flagged, index } = state;
  const question = questions[index];
  const subject = question.subject;
  const inSubject = questions.map((q, i) => ({ q, i })).filter(({ q }) => q.subject === subject);
  const answeredCount = Object.keys(answers).length;

  const go = useCallback(
    (to: number) => {
      if (to >= 0 && to < questions.length) setState((s) => ({ ...s, index: to }));
    },
    [questions.length],
  );
  const choose = useCallback(
    (option: number) => {
      if (option < question.options.length) setState((s) => ({ ...s, answers: { ...s.answers, [question.id]: option } }));
    },
    [question],
  );
  const toggleFlag = useCallback(() => {
    setState((s) => ({
      ...s,
      flagged: s.flagged.includes(question.id) ? s.flagged.filter((id) => id !== question.id) : [...s.flagged, question.id],
    }));
  }, [question.id]);

  useEffect(() => {
    if (!loaded || submitted || confirming) return;
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as HTMLElement).closest("input, textarea, select, [role=dialog]")) return;
      const key = e.key.toUpperCase();
      const letter = LETTERS.indexOf(key);
      if (letter >= 0) choose(letter);
      else if (key === "N" || e.key === "ArrowRight") go(index + 1);
      else if (key === "P" || e.key === "ArrowLeft") go(index - 1);
      else if (key === "F") toggleFlag();
      else if (key === "S") setConfirming(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loaded, submitted, confirming, choose, go, toggleFlag, index]);

  if (!loaded) return <div className="m-auto text-sm text-muted">Loading your exam…</div>;

  if (submitted) {
    return (
      <Result
        title={title}
        againHref={againHref}
        questions={questions}
        answers={answers}
        timeUsed={duration(state.submittedAt! - startedAt)}
        notice={state.timedOut ? "Time ran out, so your answers were submitted for you." : undefined}
      />
    );
  }

  const low = remaining < 5 * 60_000;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <ConnectionBanner />
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <p className="truncate font-semibold">{title}</p>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:inline">Saved</span>
            <p
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-base font-semibold tabular-nums ${low ? "bg-bad-soft text-bad" : "bg-tint text-ink"}`}
              aria-label={`Time left ${clock(remaining)}`}
            >
              <Timer size={18} aria-hidden />
              {clock(remaining)}
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm("Leave the exam? The clock keeps running and your answers stay saved.")) router.push("/cbt");
              }}
              className="grid size-11 place-items-center rounded-xl text-muted hover:bg-tint hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
            >
              <X size={20} aria-hidden />
              <span className="sr-only">Leave exam</span>
            </button>
          </div>
        </div>
        <p className="sr-only" aria-live="assertive">{announce}</p>
        <nav aria-label="Subjects" className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {subjects.map((s) => {
            const first = questions.findIndex((q) => q.subject === s);
            const done = questions.filter((q) => q.subject === s && answers[q.id] !== undefined).length;
            const total = questions.filter((q) => q.subject === s).length;
            return (
              <button
                key={s}
                type="button"
                onClick={() => go(first)}
                aria-current={s === subject ? "true" : undefined}
                className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-muted hover:bg-tint aria-[current]:bg-brand aria-[current]:text-on-brand focus-visible:outline-2 focus-visible:outline-brand"
              >
                {s} <span className="font-mono text-xs opacity-80">{done}/{total}</span>
              </button>
            );
          })}
        </nav>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_18rem]">
        <section className={card} aria-label={`Question ${index + 1}`}>
          <div className="flex items-center justify-between gap-4 text-sm">
            <p className="font-mono text-muted tabular-nums">
              {subject} · Question {inSubject.findIndex(({ i }) => i === index) + 1} of {inSubject.length}
            </p>
            <button
              type="button"
              onClick={toggleFlag}
              aria-pressed={flagged.includes(question.id)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 font-semibold text-muted hover:text-ink aria-pressed:bg-tint aria-pressed:text-brand-ink focus-visible:outline-2 focus-visible:outline-brand"
            >
              <Flag size={18} weight={flagged.includes(question.id) ? "fill" : "regular"} aria-hidden />
              {flagged.includes(question.id) ? "Flagged" : "Flag"}
            </button>
          </div>

          <QuestionBody question={question}>

          <fieldset className="mt-5">
            <legend className="sr-only">Options</legend>
            <div className="grid gap-2.5">
              {question.options.map((option, i) => (
                <label
                  key={option}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line bg-canvas px-3.5 py-3 transition-colors hover:border-brand has-checked:border-brand has-checked:bg-tint has-focus-visible:outline-2 has-focus-visible:outline-brand"
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={answers[question.id] === i}
                    onChange={() => choose(i)}
                    className="size-4 accent-brand"
                  />
                  <span className="font-mono text-sm font-semibold text-muted">{LETTERS[i]}.</span>
                  <span className="flex-1"><MathText text={option} /></span>
                </label>
              ))}
            </div>
          </fieldset>

          </QuestionBody>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className={`${button.secondary} disabled:opacity-50`}>
              <ArrowLeft size={16} aria-hidden />
              Previous
            </button>
            <button type="button" onClick={() => go(index + 1)} disabled={index === questions.length - 1} className={`${button.primary} disabled:opacity-50`}>
              Next
              <ArrowRight size={16} aria-hidden />
            </button>
          </div>
        </section>

        <aside className={`${card} self-start lg:sticky lg:top-32`} aria-label={`${subject} questions`}>
          <p className="text-sm font-semibold">{subject}</p>
          <ol className="mt-3 grid grid-cols-5 gap-2">
            {inSubject.map(({ q, i }, n) => {
              const isFlagged = flagged.includes(q.id);
              const done = answers[q.id] !== undefined;
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={i === index ? "step" : undefined}
                    aria-label={`Question ${n + 1}, ${done ? "answered" : "unanswered"}${isFlagged ? ", flagged" : ""}`}
                    className={`relative grid h-10 w-full place-items-center rounded-lg border font-mono text-sm font-semibold focus-visible:outline-2 focus-visible:outline-brand ${
                      done ? "border-brand bg-brand text-on-brand" : "border-line text-muted"
                    } ${i === index ? "ring-2 ring-brand ring-offset-2 ring-offset-surface" : ""}`}
                  >
                    {n + 1}
                    {isFlagged && <Flag size={10} weight="fill" className="absolute top-0.5 right-0.5 text-bad" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ol>
          <ul className="mt-4 grid gap-1 text-xs text-muted">
            <li className="flex items-center gap-2"><span className="size-3 rounded bg-brand" aria-hidden /> Answered</li>
            <li className="flex items-center gap-2"><span className="size-3 rounded border border-line" aria-hidden /> Unanswered</li>
            <li className="flex items-center gap-2"><Flag size={12} weight="fill" className="text-bad" aria-hidden /> Flagged</li>
          </ul>
          <p className="mt-4 text-sm text-muted">
            {answeredCount} of {questions.length} answered overall
          </p>
          <div className="mt-4 grid gap-2">
            <button type="button" onClick={() => setCalc((c) => !c)} aria-pressed={calc} className={button.secondary}>
              <CalcIcon size={16} aria-hidden />
              Calculator
            </button>
            <button type="button" onClick={() => setConfirming(true)} className={button.primary}>
              Submit
            </button>
          </div>
          <p className="mt-3 text-xs text-muted">Keys: A–D answer · N/P move · F flag · S submit</p>
        </aside>
      </div>

      {calc && <Calculator onClose={() => setCalc(false)} />}

      {confirming && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
          <div role="alertdialog" aria-modal="true" aria-labelledby="submit-heading" className={`${card} w-full max-w-md shadow-xl`}>
            <h2 id="submit-heading" className="text-lg font-semibold">Submit your exam?</h2>
            <p className="mt-2 text-muted">
              You have answered {answeredCount} of {questions.length}.
              {answeredCount < questions.length && ` ${questions.length - answeredCount} remain unanswered.`}
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button type="button" autoFocus onClick={() => setConfirming(false)} className={button.secondary}>
                Continue exam
              </button>
              <button type="button" onClick={() => submit(false)} className={button.primary}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
