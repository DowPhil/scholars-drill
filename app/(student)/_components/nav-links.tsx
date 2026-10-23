"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChartLineUp, House, Exam, UserCircle } from "@phosphor-icons/react";

export const NAV = [
  { href: "/dashboard", label: "Home", Icon: House },
  { href: "/practice", label: "Practice", Icon: Exam },
  { href: "/progress", label: "Progress", Icon: ChartLineUp },
  { href: "/profile", label: "Profile", Icon: UserCircle },
  { href: "/notifications", label: "Notifications", Icon: Bell },
] as const;

/**
 * The signed-in destinations. `compact` hides the labels for the icon
 * rail between 768 and 1024px; the label stays as the accessible name.
 */
export function NavLinks({ compact = false, unread = 0 }: { compact?: boolean; unread?: number }) {
  const pathname = usePathname();

  return (
    <ul className="grid gap-1">
      {NAV.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              title={compact ? label : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                compact ? "justify-center lg:justify-start" : ""
              } ${active ? "bg-tint text-brand-ink" : "text-muted hover:bg-tint/60 hover:text-ink"}`}
            >
              <span className="relative">
                <Icon size={20} weight={active ? "fill" : "regular"} aria-hidden />
                {href === "/notifications" && unread > 0 && (
                  <span className="absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-bad px-1 font-mono text-[10px] leading-none font-bold text-on-brand">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </span>
              <span className={compact ? "sr-only lg:not-sr-only" : undefined}>
                {label}
                {href === "/notifications" && unread > 0 && <span className="sr-only">, {unread} unread</span>}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
