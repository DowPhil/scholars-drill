"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChartLineUp } from "@phosphor-icons/react";
import { loadHistory, summarise, type AttemptRecord } from "@/lib/history";
import { getSimQuestions } from "@/lib/practice-sim";
import { loadSaved } from "@/lib/saved-questions";
import { practiseHref } from "@/lib/practice";
import type { PlanStatus } from "@/lib/plan";
import { Locked } from "../_components/locked";
import { button, card } from "@/app/_components/ui";
import { MathText } from "@/app/_components/math-text";

const pct = (right: number, total: number) => (total ? Math.round((right / total) * 100) : 0);

function minutes(ms?: number) {
  if (ms === undefined) return "–";
  const m = Math.floor(ms / 60000);
  return `${m}m ${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}s`;
}

const dateFmt = new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** Progress (WEB-PRD 6.7): accuracy over time, topics weakest first, history. */
/**
 * `analytics` is false without an active paid plan: the trend chart and topic
 * breakdown lock, the headline numbers and history stay.
 */
export function ProgressView({ analytics, plan }: { analytics: boolean; plan: PlanStatus }) {
  const [history, setHistory] = useState<AttemptRecord[] | null>(null);

  useEffect(() => {
    // Browser storage is only readable after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(loadHistory().sort((a, b) => b.finishedAt - a.finishedAt));
  }, []);

  if (history === null) {
    return <div className={`${card} mt-8 h-40 animate-pulse motion-reduce:animate-none`} aria-label="Loading progress" />;
  }

  if (history.length === 0) {
    return (
      <div className={`${card} mt-8 max-w-2xl`}>
        <ChartLineUp size={24} className="text-brand-ink" aria-hidden />
        <h2 className="mt-3 font-semibold">Nothing to show yet</h2>
        <p className="mt-1 text-muted">
          Finish a drill or a CBT simulation and your scores, accuracy and weakest topics appear here.
        </p>
        <Link href="/practice" className={`${button.primary} mt-5`}>
          Start practising
        </Link>
      </div>
    );
  }

  const summary = summarise(history);
  const byTopic = summary.topics;

  // Oldest to newest, the last ten: few points so the chart reads on a phone.
  const trend = history.slice(0, 10).reverse();

  return (
    <>
      <dl className="mt-8 grid grid-cols-3 gap-3">
        {[
          ["Attempts", summary.attempts],
          ["Answered", summary.answered],
          ["Accuracy", `${summary.accuracy}%`],
        ].map(([label, value]) => (
          <div key={label} className={card}>
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="mt-1 font-mono text-2xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      {analytics ? (
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className={card} aria-labelledby="trend-heading">
          <h2 id="trend-heading" className="font-semibold">Accuracy, last {trend.length} attempts</h2>
          <ol className="mt-5 flex h-40 items-end gap-2" aria-label="Accuracy per attempt, oldest first">
            {trend.map((a) => {
              const p = pct(a.right, a.total);
              return (
                <li key={a.id} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="font-mono text-xs text-muted">{p}%</span>
                  <span
                    className="w-full max-w-10 rounded-t-md bg-brand"
                    style={{ height: `${Math.max(p, 2)}%` }}
                    title={`${a.title}, ${dateFmt.format(a.finishedAt)}`}
                  />
                </li>
              );
            })}
          </ol>
        </section>

        <section className={card} aria-labelledby="topics-heading">
          <h2 id="topics-heading" className="font-semibold">By topic, weakest first</h2>
          <ul className="mt-4 grid gap-3">
            {byTopic.slice(0, 8).map(([name, t]) => (
              <li key={name} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="min-w-0 flex-1 text-sm">
                  <span className="font-medium">{name}</span>
                  <span className="text-muted"> · {t.subject}</span>
                </span>
                <span className="h-2 w-20 overflow-hidden rounded-full bg-line" aria-hidden>
                  <span className="block h-full bg-brand" style={{ width: `${pct(t.right, t.total)}%` }} />
                </span>
                <span className="w-16 text-right font-mono text-sm text-muted">
                  {t.right}/{t.total}
                </span>
                <Link
                  href={practiseHref(t.subject, name)}
                  className="rounded-full px-2.5 py-1 text-sm font-semibold text-brand-ink hover:bg-tint focus-visible:outline-2 focus-visible:outline-brand"
                >
                  Practise
                  <span className="sr-only"> {name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      ) : (
        <div className="mt-6">
          <Locked feature="advanced analytics" plan={plan} compact />
        </div>
      )}

      <ReportedQuestions />

      <section className={`${card} mt-6`} aria-labelledby="history-heading">
        <h2 id="history-heading" className="font-semibold">History</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                {["Date", "Attempt", "Mode", "Questions", "Score", "Accuracy", "Time"].map((h) => (
                  <th key={h} scope="col" className="py-2 pr-4 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0 hover:bg-tint/50">
                  <td className="py-3 pr-4 whitespace-nowrap text-muted">{dateFmt.format(a.finishedAt)}</td>
                  <td className="py-3 pr-4">
                    <Link href={a.href} className="font-medium text-brand-ink hover:underline focus-visible:outline-2 focus-visible:outline-brand">
                      {a.title}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{a.kind}</td>
                  <td className="py-3 pr-4 font-mono">{a.total}</td>
                  <td className="py-3 pr-4 font-mono">
                    {a.right}/{a.total}
                  </td>
                  <td className="py-3 pr-4 font-mono">{pct(a.right, a.total)}%</td>
                  <td className="py-3 pr-4 font-mono whitespace-nowrap">{minutes(a.timeMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-4 text-sm text-muted">Saved on this device while practice runs on sample questions.</p>
    </>
  );
}

/**
 * Questions this student reported, and where each stands (WEB-PRD 6.7). Every
 * report is "Received" until the backend has a review queue to report back from.
 */
function ReportedQuestions() {
  const [reports] = useState(() => getSimQuestions(loadSaved("reported").map((e) => e.id)));
  const at = new Map(loadSaved("reported").map((e) => [e.id, e.at]));
  if (reports.length === 0) return null;

  return (
    <section className={`${card} mt-6`} aria-labelledby="reported-heading">
      <h2 id="reported-heading" className="font-semibold">Reported questions</h2>
      <p className="mt-1 text-sm text-muted">
        Our checkers review every report. If a question was wrong, it is corrected and you will see what changed here.
      </p>
      <ul className="mt-4 grid gap-3">
        {reports.map((q) => (
          <li key={q.id} className="flex flex-wrap items-start gap-x-4 gap-y-1 border-t border-line pt-3 first:border-0 first:pt-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium"><MathText text={q.prompt} /></p>
              <p className="text-xs text-muted">
                {q.subject} · {q.topic} · reported {dateFmt.format(at.get(q.id) ?? 0)}
              </p>
            </div>
            <span className="rounded-full bg-tint px-2.5 py-1 text-xs font-semibold text-brand-ink">Received</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
