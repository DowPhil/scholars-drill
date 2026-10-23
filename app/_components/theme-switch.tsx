"use client";

import { useSyncExternalStore } from "react";
import { Desktop, Moon, Sun } from "@phosphor-icons/react";
import { THEME_COOKIE, type Theme } from "@/lib/theme";

/**
 * Light, Dark or System (see lib/theme). Switching applies at once through
 * data-theme on <html>, and the cookie makes the server render the same
 * theme on every later page, so it never flashes.
 */

const OPTIONS: Array<{ value: Theme; label: string; Icon: typeof Sun }> = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Desktop },
];

const listeners = new Set<() => void>();

function read(): Theme {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "light" || t === "dark" ? t : "system";
}

function setTheme(theme: Theme) {
  const year = 60 * 60 * 24 * 365;
  document.cookie =
    theme === "system"
      ? `${THEME_COOKIE}=; path=/; max-age=0; samesite=lax`
      : `${THEME_COOKIE}=${theme}; path=/; max-age=${year}; samesite=lax`;
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function useTheme(): Theme {
  // The server snapshot is "system": the true value appears after hydration.
  return useSyncExternalStore(subscribe, read, () => "system");
}

/**
 * `segmented`: three labelled buttons, for the sidebar, menu and Profile.
 * `icon`: one button that steps Light → Dark → System, for tight spaces.
 */
export function ThemeSwitch({ variant = "segmented", className = "" }: { variant?: "segmented" | "icon"; className?: string }) {
  const theme = useTheme();

  if (variant === "icon") {
    const current = OPTIONS.find((o) => o.value === theme)!;
    const next = OPTIONS[(OPTIONS.indexOf(current) + 1) % OPTIONS.length];
    return (
      <button
        type="button"
        onClick={() => setTheme(next.value)}
        title={`Theme: ${current.label}. Switch to ${next.label}`}
        className={`grid size-11 place-items-center rounded-xl text-muted transition-colors hover:bg-tint hover:text-ink focus-visible:outline-2 focus-visible:outline-brand ${className}`}
      >
        <current.Icon size={20} aria-hidden />
        <span className="sr-only">
          Theme: {current.label}. Switch to {next.label}
        </span>
      </button>
    );
  }

  return (
    <div role="radiogroup" aria-label="Theme" className={`grid grid-cols-3 gap-1 rounded-xl border border-line bg-canvas p-1 ${className}`}>
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          onClick={() => setTheme(value)}
          className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-muted transition-colors hover:text-ink aria-checked:bg-surface aria-checked:text-ink aria-checked:shadow-sm focus-visible:outline-2 focus-visible:outline-brand"
        >
          <Icon size={16} aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}
