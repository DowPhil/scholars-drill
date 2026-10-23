"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ClockCounterClockwise, Lightning, Target } from "@phosphor-icons/react";
import { loadCurrent, loadHistory, summarise, type AttemptRecord, type CurrentAttempt } from "@/lib/history";
import { practiseHref } from "@/lib/practice";
import { button, card } from "@/app/_components/ui";

const dateFmt = new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short" });

/**
 * Home's live half (WEB-PRD 6.2), read from this browser's attempt history
 * while practice is simulated. One primary action: resume, else practise the
 * weakest topic, else a first drill.
 */
export function DashboardLive({ firstSubject }: { firstSubject?: string }) {
  const [data, setData] = useState<{ history: AttemptRecord[]; current: CurrentAttempt | null } | null>(null);

  useEffect(() => {
    // Browser storage is only readable after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData({ history: loadHistory().sort((a, b) => b.finishedAt - a.finishedAt), current: loadCurrent() });
  }, []);

  if (data === null) {
    return (
      <div className="mt-8 grid gap-6" aria-label="Loading your dashboard">
        <div className="h-32 animate-pulse rounded-2xl bg-tint motion-reduce:animate-none" />
        <div className="grid gap-6 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`${card} h-44 animate-pulse motion-reduce:animate-none`} />
          ))}
        </div>
      </div>
    );
  }

  const { history, current } = data;
  const summary = summarise(history);
  const weak = summary.topics.filter(([, t]) => t.right < t.total).slice(0, 3);

  const hero = current
    ? { heading: "Pick up where you left off", body: current.title, href: current.href, cta: "Resume" }
    : weak.length > 0
      ? {
          heading: `Next: ${weak[0][0]}`,
          body: `Your weakest topic so far, ${weak[0][1].right} of ${weak[0][1].total} right. A short drill on it is the quickest win.`,
          href: practiseHref(weak[0][1].subject, weak[0][0]),
          cta: `Practise ${weak[0][0]}`,
        }
      : history.length > 0
        ? { heading: "Daily drill", body: "10 questions, about 8 minutes.", href: firstSubject ? practiseHref(firstSubject) : "/practice", cta: "Start drill" }
        : {
            heading: "Your first drill",
            body: "10 questions, about 8 minutes. Answers are checked as you go.",
            href: firstSubject ? practiseHref(firstSubject) : "/practice",
            cta: "Continue practising",
          };

  return (
    <>
      <section className="mt-8 flex flex-col gap-5 rounded-2xl bg-brand p-6 text-on-brand sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{hero.heading}</h2>
          <p className="mt-1 text-on-brand/80">{hero.body}</p>
        </div>
        <Link href={hero.href} className={`${button.inverse} self-start sm:self-auto`}>
          {hero.cta}
          <ArrowRight size={16} aria-hidden />
        </Link>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className={card} aria-labelledby="weak-heading">
          <Target size={22} className="text-brand-ink" aria-hidden />
          <h2 id="weak-heading" className="mt-3 font-semibold">Weak areas</h2>
          {weak.length === 0 ? (
            <p className="mt-1 text-sm text-muted">
              {history.length === 0
                ? "After your first few drills, the topics costing you the most marks show up here, each with a Practise button."
                : "No weak topics so far: every answer right. Try a harder drill."}
            </p>
          ) : (
            <ul className="mt-3 grid gap-3">
              {weak.map(([name, t]) => (
                <li key={name} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="font-mono text-xs text-muted">
                      {Math.round((t.right / t.total) * 100)}% · {t.right}/{t.total}
                    </p>
                  </div>
                  <Link
                    href={practiseHref(t.subject, name)}
                    className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-brand-ink hover:bg-tint focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    Practise<span className="sr-only"> {name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/study" className="mt-4 inline-block text-sm font-semibold text-brand-ink hover:underline">
            Your study plan
          </Link>
        </section>

        <section className={card} aria-labelledby="recent-heading">
          <ClockCounterClockwise size={22} className="text-brand-ink" aria-hidden />
          <h2 id="recent-heading" className="mt-3 font-semibold">Recent activity</h2>
          {history.length === 0 ? (
            <p className="mt-1 text-sm text-muted">No attempts yet. Your scores and subjects will appear here.</p>
          ) : (
            <>
              <ul className="mt-3 grid gap-3">
                {history.slice(0, 3).map((a) => (
                  <li key={a.id}>
                    <Link href={a.href} className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-brand">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium hover:text-brand-ink">{a.title}</p>
                        <p className="text-xs text-muted">
                          {a.kind} · {dateFmt.format(a.finishedAt)}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-sm">
                        {a.right}/{a.total}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/progress" className="mt-4 inline-block text-sm font-semibold text-brand-ink hover:underline">
                All history
              </Link>
            </>
          )}
        </section>

        <section className={card} aria-labelledby="glance-heading">
          <Lightning size={22} className="text-brand-ink" aria-hidden />
          <h2 id="glance-heading" className="mt-3 font-semibold">Progress at a glance</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            {(
              [
                ["Questions answered", summary.answered],
                ["Accuracy", summary.answered ? `${summary.accuracy}%` : null],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-xl bg-tint p-3">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="mt-1 font-mono text-xl font-semibold" aria-label={value === null || value === 0 ? "None yet" : undefined}>
                  {value === null || value === 0 ? "–" : value}
                </dd>
              </div>
            ))}
          </dl>
          {history.length > 0 && (
            <p className="mt-3 text-xs text-muted">
              Across {summary.attempts} attempt{summary.attempts === 1 ? "" : "s"}.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
