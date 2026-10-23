import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  CalendarCheck,
  ChalkboardTeacher,
  ChatText,
  Exam,
  Medal,
  Megaphone,
  Timer,
  UserPlus,
  Warning,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { getSession, getSessionToken } from "@/lib/auth/session";
import { getNotifications, type Notification } from "@/lib/notifications";
import { formatDate, getPlanStatus } from "@/lib/plan";
import { button, card, page } from "@/app/_components/ui";
import { markAllRead, markRead } from "./actions";

export const metadata: Metadata = { title: "Notifications" };

const ICONS: Record<Notification["type"], Icon> = {
  class_reminder: ChalkboardTeacher,
  deadline: Timer,
  grade_posted: Medal,
  announcement: Megaphone,
  quiz: Exam,
  message: ChatText,
  attendance_open: CalendarCheck,
  enrollment: UserPlus,
};

const when = new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** Notifications (WEB-PRD 6.8): the DSA feed, plus the plan reminder at the top. */
export default async function NotificationsPage() {
  // The layout already redirected anyone without a session.
  const session = (await getSession())!;
  const items = await getNotifications((await getSessionToken())!);
  const plan = getPlanStatus(session);
  const unread = items?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className={page}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Notifications</h1>
          <p className="mt-2 text-muted">
            {items === null ? "" : unread ? `${unread} unread.` : "You are all caught up."} The same feed as your DSA account.
          </p>
        </div>
        {unread > 0 && (
          <form action={markAllRead}>
            <button type="submit" className={button.secondary}>
              Mark all as read
            </button>
          </form>
        )}
      </div>

      <ul className="mt-8 grid max-w-3xl gap-3">
        {(plan.state === "ending" || plan.state === "expired") && (
          <li className={`${card} flex gap-4 ${plan.state === "expired" ? "border-bad/40" : "border-brand/40"}`}>
            <Warning size={22} weight="fill" className={`mt-0.5 shrink-0 ${plan.state === "expired" ? "text-bad" : "text-brand-ink"}`} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{plan.state === "expired" ? "Your plan has ended" : `Your plan ends in ${plan.daysLeft} day${plan.daysLeft === 1 ? "" : "s"}`}</p>
              <p className="mt-1 text-sm text-muted">
                {plan.endsAt && `${plan.state === "expired" ? "It ended" : "It ends"} on ${formatDate(plan.endsAt)}. `}
                {plan.state === "expired" ? "CBT simulations and advanced analytics are locked until you renew." : "Renew to keep CBT simulations and advanced analytics."}
              </p>
              <Link href="/profile/plan" className="mt-2 inline-block text-sm font-semibold text-brand-ink hover:underline">
                Renew
              </Link>
            </div>
          </li>
        )}

        {items === null ? (
          <li className={`${card} text-sm text-muted`}>
            Could not reach the server to load notifications. Check your connection and refresh.
          </li>
        ) : items.length === 0 ? (
          <li className={card}>
            <Bell size={24} className="text-brand-ink" aria-hidden />
            <p className="mt-3 font-semibold">No notifications yet</p>
            <p className="mt-1 text-sm text-muted">Class reminders, deadlines, results and announcements will show up here.</p>
          </li>
        ) : (
          items.map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            // DSA's links point into the DSA site; only absolute ones open from here.
            const external = n.link && /^https?:\/\//.test(n.link) ? n.link : undefined;
            return (
              <li key={n.id} className={`${card} flex gap-4 ${n.isRead ? "" : "border-brand/40 bg-tint/40"}`}>
                <Icon size={22} className="mt-0.5 shrink-0 text-brand-ink" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-semibold">
                    {!n.isRead && <span className="size-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
                    {n.title}
                  </p>
                  {n.body && <p className="mt-1 text-sm break-words text-muted">{n.body}</p>}
                  <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    <time dateTime={n.createdAt}>{when.format(new Date(n.createdAt))}</time>
                    {external && (
                      <a href={external} className="font-semibold text-brand-ink hover:underline" rel="noopener noreferrer">
                        Open
                      </a>
                    )}
                  </p>
                </div>
                {!n.isRead && (
                  <form action={markRead} className="shrink-0">
                    <input type="hidden" name="id" value={n.id} />
                    <button type="submit" className="rounded-full px-3 py-1.5 text-sm font-semibold text-brand-ink hover:bg-tint focus-visible:outline-2 focus-visible:outline-brand">
                      Mark read
                    </button>
                  </form>
                )}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
