"use client";

import { useActionState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { field, FormError } from "@/app/(auth)/_components/form";
import { button } from "@/app/_components/ui";
import { changePassword, type PasswordState } from "./actions";

const fields = [
  { name: "currentPassword", label: "Current password", autoComplete: "current-password" },
  { name: "newPassword", label: "New password", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirm new password", autoComplete: "new-password" },
];

export function PasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePassword, {});

  return (
    // key resets the inputs after a successful change.
    <form key={state.message} action={action} className="mt-4 grid gap-4 sm:max-w-md">
      {fields.map((f) => (
        <div key={f.name} className="grid gap-2">
          <label htmlFor={f.name} className="text-sm font-semibold">
            {f.label}
          </label>
          <input id={f.name} name={f.name} type="password" autoComplete={f.autoComplete} required className={field} />
        </div>
      ))}
      <p className="-mt-2 text-sm text-muted">At least 6 characters. This also changes your DSA password.</p>
      <FormError message={state.error} />
      {state.message && (
        <p className="flex items-center gap-2 rounded-xl bg-good-soft px-3.5 py-3 text-sm font-medium text-good" aria-live="polite">
          <CheckCircle size={18} weight="fill" aria-hidden />
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${button.secondary} justify-self-start disabled:opacity-60`}>
        {pending ? "Changing..." : "Change password"}
      </button>
    </form>
  );
}
