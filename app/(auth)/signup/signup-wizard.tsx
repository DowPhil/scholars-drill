"use client";

import { useActionState, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { signup, type SignupState } from "./actions";
import { field, FormError } from "../_components/form";
import { button } from "@/app/_components/ui";
import {
  CLASS_LEVELS,
  DEPARTMENTS,
  EMPTY_SIGNUP,
  GENDERS,
  LEARNING_MODES,
  MAX_PROGRAMMES,
  NIGERIAN_STATES,
  PROGRAMMES,
  STEPS,
  firstStepWithError,
  needsDepartment,
  validateSignup,
  type FieldErrors,
  type SignupField,
  type SignupValues,
} from "@/lib/registration";

const choice =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-canvas px-3.5 py-3 transition-colors has-[:checked]:border-brand has-[:checked]:bg-tint has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50";

function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-bad">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Radio and checkbox groups need a fieldset and legend, not a label. */
function Group({
  id,
  legend,
  hint,
  error,
  children,
}: {
  id: string;
  legend: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="grid gap-2" aria-describedby={describedBy(id, error, hint)}>
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-bad">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </fieldset>
  );
}

export function SignupWizard() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(signup, {});
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<SignupValues>(EMPTY_SIGNUP);
  const [errors, setErrors] = useState<FieldErrors>({});
  const headingRef = useRef<HTMLHeadingElement>(null);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const departmentNeeded = needsDepartment(values.classLevel, values.programmes);

  function update<K extends SignupField>(key: K, value: SignupValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Clear an error the moment the student starts fixing it.
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function goTo(index: number) {
    setStep(index);
    // Move focus to the new step so screen readers announce it.
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function next() {
    const stepErrors = validateSignup(values, current.fields);
    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      return;
    }
    goTo(step + 1);
  }

  function toggleProgramme(name: string, checked: boolean) {
    const list = checked
      ? [...values.programmes, name]
      : values.programmes.filter((p) => p !== name);
    update("programmes", list);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    // Every step stays in the DOM so the final post carries all fields, which
    // means Enter inside any field would submit. Before the last step, treat it
    // as Continue instead.
    if (!isLast) {
      event.preventDefault();
      next();
      return;
    }
    const all = validateSignup(values);
    if (Object.keys(all).length > 0) {
      event.preventDefault();
      setErrors(all);
      const first = firstStepWithError(all);
      if (first >= 0 && first !== step) goTo(first);
    }
  }

  const input = (id: SignupField, hint?: string) => ({
    id,
    name: id,
    "aria-invalid": errors[id] ? true : undefined,
    "aria-describedby": describedBy(id, errors[id], hint),
  });

  return (
    // noValidate: fields on hidden steps cannot receive focus, so native
    // validation would silently block the submit. Validation is ours instead.
    <form action={formAction} onSubmit={onSubmit} noValidate className="grid gap-6">
      <div>
        <p className="text-sm font-medium text-muted">
          Step {step + 1} of {STEPS.length}
        </p>
        <ol className="mt-3 grid grid-cols-5 gap-1.5" aria-label="Signup progress">
          {STEPS.map((s, i) => (
            <li
              key={s.id}
              aria-current={i === step ? "step" : undefined}
              className={`h-1.5 rounded-full ${i <= step ? "bg-brand" : "bg-line"}`}
            >
              <span className="sr-only">
                {s.title}
                {i < step ? " (done)" : i === step ? " (current)" : ""}
              </span>
            </li>
          ))}
        </ol>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-5 text-lg font-semibold tracking-tight outline-none"
        >
          {current.title}
        </h2>
      </div>

      {/* Step 1: account */}
      <div hidden={step !== 0} className="grid gap-5">
        <Field id="fullname" label="Full name" error={errors.fullname}>
          <input
            {...input("fullname")}
            type="text"
            autoComplete="name"
            value={values.fullname}
            onChange={(e) => update("fullname", e.target.value)}
            className={field}
          />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input
            {...input("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@example.com"
            className={field}
          />
        </Field>
        <Field
          id="whatsapp"
          label="WhatsApp number"
          hint="e.g. 08031234567"
          error={errors.whatsapp}
        >
          <input
            {...input("whatsapp", "e.g. 08031234567")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.whatsapp}
            onChange={(e) => update("whatsapp", e.target.value)}
            className={field}
          />
        </Field>
        <Field id="password" label="Password" hint="At least 6 characters." error={errors.password}>
          <input
            {...input("password", "At least 6 characters.")}
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            className={field}
          />
        </Field>
        <Field id="confirmPassword" label="Confirm password" error={errors.confirmPassword}>
          <input
            {...input("confirmPassword")}
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            className={field}
          />
        </Field>
      </div>

      {/* Step 2: about you */}
      <div hidden={step !== 1} className="grid gap-5">
        <Group id="gender" legend="Gender" error={errors.gender}>
          <div className="grid grid-cols-2 gap-2.5">
            {GENDERS.map((g) => (
              <label key={g} className={choice}>
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={values.gender === g}
                  onChange={() => update("gender", g)}
                  className="accent-brand"
                />
                {g}
              </label>
            ))}
          </div>
        </Group>
        <Field id="dob" label="Date of birth" error={errors.dob}>
          <input
            {...input("dob")}
            type="date"
            autoComplete="bday"
            max={new Date().toISOString().slice(0, 10)}
            value={values.dob}
            onChange={(e) => update("dob", e.target.value)}
            className={field}
          />
        </Field>
        <Field id="state" label="State of residence" error={errors.state}>
          <select
            {...input("state")}
            value={values.state}
            onChange={(e) => update("state", e.target.value)}
            className={field}
          >
            <option value="">Select your state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field id="school" label="School" error={errors.school}>
          <input
            {...input("school")}
            type="text"
            autoComplete="organization"
            value={values.school}
            onChange={(e) => update("school", e.target.value)}
            className={field}
          />
        </Field>
        <Field id="classLevel" label="Class or level" error={errors.classLevel}>
          <select
            {...input("classLevel")}
            value={values.classLevel}
            onChange={(e) => update("classLevel", e.target.value)}
            className={field}
          >
            <option value="">Select your class or level</option>
            {CLASS_LEVELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Group
          id="learningMode"
          legend="How do you learn?"
          hint="Physical means you attend DSA classes in person."
          error={errors.learningMode}
        >
          <div className="grid grid-cols-2 gap-2.5">
            {LEARNING_MODES.map((m) => (
              <label key={m.value} className={choice}>
                <input
                  type="radio"
                  name="learningMode"
                  value={m.value}
                  checked={values.learningMode === m.value}
                  onChange={() => update("learningMode", m.value)}
                  className="accent-brand"
                />
                {m.label}
              </label>
            ))}
          </div>
        </Group>
      </div>

      {/* Step 3: programmes */}
      <div hidden={step !== 2} className="grid gap-5">
        <Group
          id="programmes"
          legend="What are you preparing for?"
          hint={`Choose up to ${MAX_PROGRAMMES}.`}
          error={errors.programmes}
        >
          <div className="grid gap-2.5">
            {PROGRAMMES.map((p) => {
              const checked = values.programmes.includes(p);
              return (
                <label key={p} className={choice}>
                  <input
                    type="checkbox"
                    name="programmes"
                    value={p}
                    checked={checked}
                    disabled={!checked && values.programmes.length >= MAX_PROGRAMMES}
                    onChange={(e) => toggleProgramme(p, e.target.checked)}
                    className="accent-brand"
                  />
                  {p}
                </label>
              );
            })}
          </div>
        </Group>

        {departmentNeeded ? (
          <Group id="department" legend="Department" error={errors.department}>
            <div className="grid grid-cols-3 gap-2.5">
              {DEPARTMENTS.map((d) => (
                <label key={d.value} className={choice}>
                  <input
                    type="radio"
                    name="department"
                    value={d.value}
                    checked={values.department === d.value}
                    onChange={() => update("department", d.value)}
                    className="accent-brand"
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </Group>
        ) : null}
      </div>

      {/* Step 4: guardian */}
      <div hidden={step !== 3} className="grid gap-5">
        <Field id="guardianName" label="Parent or guardian's full name" error={errors.guardianName}>
          <input
            {...input("guardianName")}
            type="text"
            value={values.guardianName}
            onChange={(e) => update("guardianName", e.target.value)}
            className={field}
          />
        </Field>
        <Field
          id="guardianPhone"
          label="Parent or guardian's phone"
          hint="e.g. 08031234567"
          error={errors.guardianPhone}
        >
          <input
            {...input("guardianPhone", "e.g. 08031234567")}
            type="tel"
            inputMode="tel"
            value={values.guardianPhone}
            onChange={(e) => update("guardianPhone", e.target.value)}
            className={field}
          />
        </Field>
        <Field
          id="guardianEmail"
          label="Parent or guardian's email (optional)"
          error={errors.guardianEmail}
        >
          <input
            {...input("guardianEmail")}
            type="email"
            inputMode="email"
            value={values.guardianEmail}
            onChange={(e) => update("guardianEmail", e.target.value)}
            className={field}
          />
        </Field>
      </div>

      {/* Step 5: review */}
      <div hidden={step !== 4} className="grid gap-5">
        <dl className="grid gap-x-6 gap-y-4 rounded-xl bg-canvas p-4 text-sm sm:grid-cols-2">
          {(
            [
              ["Name", values.fullname],
              ["Email", values.email],
              ["WhatsApp", values.whatsapp],
              ["Gender", values.gender],
              ["Date of birth", values.dob],
              ["State", values.state],
              ["School", values.school],
              ["Class or level", values.classLevel],
              [
                "Learning mode",
                LEARNING_MODES.find((m) => m.value === values.learningMode)?.label,
              ],
              ["Preparing for", values.programmes.join(", ")],
              [
                "Department",
                departmentNeeded
                  ? DEPARTMENTS.find((d) => d.value === values.department)?.label
                  : undefined,
              ],
              ["Guardian", values.guardianName],
              ["Guardian phone", values.guardianPhone],
            ] as Array<[string, string | undefined]>
          )
            .filter(([, v]) => v)
            .map(([label, v]) => (
              <div key={label}>
                <dt className="text-muted">{label}</dt>
                <dd className="mt-0.5 font-medium break-words">{v}</dd>
              </div>
            ))}
        </dl>

        <Group id="acceptTerms" legend="Confirm" error={errors.acceptTerms}>
          <label className={choice}>
            <input
              type="checkbox"
              name="acceptTerms"
              value="yes"
              checked={values.acceptTerms}
              onChange={(e) => update("acceptTerms", e.target.checked)}
              className="accent-brand"
            />
            <span className="text-sm leading-relaxed">
              These details are correct, and I agree to Scholars Drill storing
              them to run my account.
            </span>
          </label>
        </Group>

        <FormError message={state.formError} />
        {state.accountExists ? (
          <a
            href="/login"
            className="-mt-2 text-sm font-semibold text-brand-ink hover:underline hover:underline-offset-4"
          >
            Log in to that account instead
          </a>
        ) : null}
        {state.fieldErrors && Object.keys(state.fieldErrors).length > 0 ? (
          <ul className="list-disc pl-5 text-sm text-bad">
            {Object.values(state.fieldErrors).map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
        {step > 0 ? (
          <button type="button" onClick={() => goTo(step - 1)} className={button.secondary}>
            <ArrowLeft size={16} aria-hidden />
            Back
          </button>
        ) : (
          <span />
        )}

        {/*
          Distinct keys are load-bearing. Without them React reuses one <button>
          and flips its type from "button" to "submit" inside Continue's click
          handler, and the browser then submits the form on that same click:
          the student lands on the last step already showing a validation error.
        */}
        {isLast ? (
          <button
            key="submit"
            type="submit"
            disabled={pending}
            className={`${button.primary} disabled:opacity-70`}
          >
            {pending ? "Creating account..." : "Create account"}
          </button>
        ) : (
          <button key="continue" type="button" onClick={next} className={button.primary}>
            Continue
            <ArrowRight size={16} aria-hidden />
          </button>
        )}
      </div>
    </form>
  );
}
