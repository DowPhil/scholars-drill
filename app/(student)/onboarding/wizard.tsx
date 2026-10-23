"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Play } from "@phosphor-icons/react";
import { EXAMS, SUBJECTS } from "@/lib/practice";
import { MINUTES, TARGETS, subjectRule, type StudyProfile } from "@/lib/study-profile";
import { button, card } from "@/app/_components/ui";
import { FormError } from "@/app/(auth)/_components/form";
import { finishOnboarding, skipOnboarding, type FinishState } from "./actions";

type Exam = StudyProfile["exam"];
type Draft = { step: number; exam?: Exam; year?: number; subjects: string[]; target?: string; minutes?: number };

const DRAFT_KEY = "sd-onboarding-draft";
const STEPS = ["Exam", "Year", "Subjects", "Target", "Daily time"] as const;

const choice =
  "flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-line bg-canvas px-3 text-center text-sm font-semibold transition-colors hover:border-brand has-checked:border-brand has-checked:bg-tint has-checked:text-brand-ink has-focus-visible:outline-2 has-focus-visible:outline-brand has-disabled:cursor-not-allowed has-disabled:opacity-50";

/**
 * Onboarding (WEB-PRD 6.1): one idea per step, under a minute, skippable and
 * resumable. The draft lives in this browser until Finish sends it.
 */
export function OnboardingWizard({
  firstName,
  knownExam,
  years,
  initial,
}: {
  firstName: string;
  knownExam?: Exam;
  years: number[];
  /** Editing from Profile: start from the saved answers, no draft, no skip. */
  initial?: StudyProfile;
}) {
  const editing = Boolean(initial);
  const [state, action, pending] = useActionState<FinishState, FormData>(finishOnboarding, {});
  const [draft, setDraft] = useState<Draft>(
    initial
      ? { step: 0, exam: initial.exam, year: initial.year, subjects: initial.subjects, target: initial.target, minutes: initial.minutesPerDay }
      : { step: 0, exam: knownExam, subjects: [] },
  );

  useEffect(() => {
    if (editing) return;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      // Browser storage is only readable after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setDraft((d) => ({ ...d, ...JSON.parse(saved) }));
    } catch {}
  }, [editing]);

  function update(patch: Partial<Draft>) {
    setDraft((d) => {
      const next = { ...d, ...patch };
      if (!editing) {
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  }

  const { step, exam, year, target, minutes } = draft;
  const rule = exam ? subjectRule(exam) : undefined;
  // A required subject is always in, however the exam was chosen.
  const subjects = rule?.fixed
    ? [rule.fixed, ...draft.subjects.filter((s) => s !== rule.fixed)].slice(0, rule.max)
    : draft.subjects;

  function pickExam(e: Exam) {
    // Changing exam can change the target scale.
    update({ exam: e, target: undefined });
  }

  function toggleSubject(s: string) {
    if (s === rule?.fixed) return;
    update({ subjects: subjects.includes(s) ? subjects.filter((x) => x !== s) : [...subjects, s] });
  }

  const ready = [
    Boolean(exam),
    Boolean(year),
    Boolean(rule && subjects.length >= rule.min && subjects.length <= rule.max),
    Boolean(target),
    true,
  ];

  return (
    <form action={action} className={card} onSubmit={() => localStorage.removeItem(DRAFT_KEY)}>
      {exam && <input type="hidden" name="exam" value={exam} />}
      {year && <input type="hidden" name="year" value={year} />}
      {subjects.map((s) => (
        <input key={s} type="hidden" name="subjects" value={s} />
      ))}
      {target && <input type="hidden" name="target" value={target} />}
      {minutes && <input type="hidden" name="minutes" value={minutes} />}
      {editing && <input type="hidden" name="returnTo" value="profile" />}

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-brand-ink">
          Step {step + 1} of {STEPS.length}
        </p>
        {!editing && (
        <button
          type="submit"
          formAction={skipOnboarding}
          formNoValidate
          className="rounded-full px-2 py-1 text-sm font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
        >
          Skip for now
        </button>
        )}
      </div>
      <ol className="mt-3 grid grid-cols-5 gap-1.5" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className={`h-1.5 rounded-full ${i <= step ? "bg-brand" : "bg-line"}`}>
            <span className="sr-only">
              {s}
              {i < step ? " (done)" : i === step ? " (current)" : ""}
            </span>
          </li>
        ))}
      </ol>

      <fieldset key={step} className="mt-8">
        {step === 0 && (
          <>
            <legend className="text-2xl font-semibold tracking-tight">
              {editing
                ? "Which exam are you preparing for?"
                : knownExam
                  ? `Welcome, ${firstName}. Still preparing for ${knownExam}?`
                  : `Welcome, ${firstName}. Which exam are you preparing for?`}
            </legend>
            <p className="mt-2 text-muted">
              {knownExam && !editing ? "We took this from your DSA account. Change it if it is wrong." : "We use it to pick the right questions and layout."}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              {EXAMS.map((e) => (
                <label key={e} className={choice}>
                  <input type="radio" name="exam-choice" className="sr-only" checked={exam === e} onChange={() => pickExam(e)} />
                  {e}
                </label>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <legend className="text-2xl font-semibold tracking-tight">When are you sitting {exam}?</legend>
            <p className="mt-2 text-muted">So we know how much time you have.</p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {years.map((y) => (
                <label key={y} className={`${choice} font-mono`}>
                  <input type="radio" name="year-choice" className="sr-only" checked={year === y} onChange={() => update({ year: y })} />
                  {y}
                </label>
              ))}
            </div>
          </>
        )}

        {step === 2 && rule && (
          <>
            <legend className="text-2xl font-semibold tracking-tight">Which subjects?</legend>
            <p className="mt-2 text-muted">
              {rule.hint} <span className="font-mono">{subjects.length}/{rule.max}</span> chosen.
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {SUBJECTS.map((s) => {
                const on = subjects.includes(s);
                return (
                  <label key={s} className={`${choice} justify-start`}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      disabled={s === rule.fixed || (!on && subjects.length >= rule.max)}
                      onChange={() => toggleSubject(s)}
                    />
                    {s}
                    {s === rule.fixed && <span className="ml-auto text-xs font-medium text-muted">Required</span>}
                  </label>
                );
              })}
            </div>
          </>
        )}

        {step === 3 && exam && (
          <>
            <legend className="text-2xl font-semibold tracking-tight">What are you aiming for?</legend>
            <p className="mt-2 text-muted">{TARGETS[exam].label}. You can change it later.</p>
            <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {TARGETS[exam].options.map((t) => (
                <label key={t} className={`${choice} font-mono`}>
                  <input type="radio" name="target-choice" className="sr-only" checked={target === t} onChange={() => update({ target: t })} />
                  {t}
                </label>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <legend className="text-2xl font-semibold tracking-tight">How long can you practise a day?</legend>
            <p className="mt-2 text-muted">Optional. Short and often beats long and rare.</p>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MINUTES.map((m) => (
                <label key={m} className={choice}>
                  <input type="radio" name="minutes-choice" className="sr-only" checked={minutes === m} onChange={() => update({ minutes: m })} />
                  {m} min
                </label>
              ))}
            </div>
          </>
        )}
      </fieldset>

      <div className="mt-6">
        <FormError message={state.error} />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => update({ step: step - 1 })} className={button.secondary}>
            <ArrowLeft size={16} aria-hidden />
            Back
          </button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" disabled={!ready[step]} onClick={() => update({ step: step + 1 })} className={`${button.primary} disabled:opacity-50`}>
            Continue
            <ArrowRight size={16} aria-hidden />
          </button>
        ) : (
          <button type="submit" disabled={pending || !ready.every(Boolean)} className={`${button.primary} disabled:opacity-50`}>
            <Play size={16} weight="fill" aria-hidden />
            {pending ? "Saving..." : editing ? "Save changes" : "Start my first drill"}
          </button>
        )}
      </div>
    </form>
  );
}
