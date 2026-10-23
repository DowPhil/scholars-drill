import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Timer } from "@phosphor-icons/react/dist/ssr";
import { SIM_EXAMS, buildSimExam } from "@/lib/practice-sim";
import { card, page } from "@/app/_components/ui";
import { getSession } from "@/lib/auth/session";
import { getPlanStatus } from "@/lib/plan";
import { Locked } from "../_components/locked";

export const metadata: Metadata = { title: "CBT simulations" };

/** Published CBT simulations. Sample ones until admins can publish real ones. */
export default async function CbtPage() {
  // The layout already redirected anyone without a session.
  const plan = getPlanStatus((await getSession())!);

  return (
    <div className={page}>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">CBT simulations</h1>
      <p className="mt-2 text-muted">Sit a full timed exam laid out like the real JAMB CBT.</p>

      {!plan.full ? (
        <Locked feature="CBT simulations" plan={plan} />
      ) : (

      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {SIM_EXAMS.map((exam) => (
          <li key={exam.id} className="flex">
            <Link
              href={`/cbt/${exam.id}`}
              className={`${card} group flex w-full flex-col transition-colors hover:border-brand/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
            >
              <div className="flex items-center justify-between gap-3">
                <Timer size={24} className="text-brand-ink" aria-hidden />
                <span className="rounded-full bg-tint px-2.5 py-1 text-xs font-semibold text-brand-ink">Sample</span>
              </div>
              <h2 className="mt-3 font-semibold">{exam.title}</h2>
              <p className="mt-1 flex-1 text-sm text-muted">{exam.subjects.join(", ")}</p>
              <p className="mt-3 font-mono text-sm text-muted">
                {buildSimExam(exam, 1).length} questions · {exam.minutes} min
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
                See details
                <ArrowRight size={14} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
