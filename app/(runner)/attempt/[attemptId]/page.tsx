import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildSimDrill, buildSimExam, findSimExam, getSimQuestions } from "@/lib/practice-sim";
import { CbtRunner } from "./cbt-runner";
import { getSession } from "@/lib/auth/session";
import { getPlanStatus } from "@/lib/plan";
import { Locked } from "@/app/(student)/_components/locked";
import { MODES, isModeSlug } from "@/lib/practice";
import { button, card, page } from "@/app/_components/ui";
import { PracticeRunner } from "./practice-runner";

export async function generateMetadata({ params }: { params: Promise<{ attemptId: string }> }): Promise<Metadata> {
  const { attemptId } = await params;
  return { title: attemptId === "cbt" ? "CBT exam" : "Practice" };
}

type Search = Record<string, string | string[] | undefined>;

/**
 * Practice runner. Only simulated attempts (`/attempt/sim?...`) exist until
 * the backend can start sessions; a real attemptId will load from the API.
 */
export default async function AttemptPage({
  params,
  searchParams,
}: {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<Search>;
}) {
  const { attemptId } = await params;
  const q = await searchParams;
  const one = (key: string) => (typeof q[key] === "string" ? q[key] : undefined);

  if (attemptId === "cbt") {
    const exam = findSimExam(one("quiz") ?? "");
    const startedAt = Number(one("started"));
    if (!exam || !Number.isFinite(startedAt)) notFound();
    // A sitting started while the plan was live can still be finished and reviewed.
    const plan = getPlanStatus((await getSession())!);
    const startedInPlan = plan.endsAt !== undefined && startedAt < new Date(plan.endsAt).getTime();
    if (!plan.full && !startedInPlan) {
      return (
        <div className={`${page} mx-auto`}>
          <Locked feature="CBT simulations" plan={plan} />
        </div>
      );
    }
    return (
      <CbtRunner
        storageKey={`sd-cbt:${exam.id}:${startedAt}`}
        title={exam.title}
        subjects={exam.subjects}
        questions={buildSimExam(exam, Number(one("seed") ?? 1))}
        startedAt={startedAt}
        minutes={exam.minutes}
        againHref={`/cbt/${exam.id}`}
      />
    );
  }
  if (attemptId !== "sim") notFound();

  const mode = one("mode") ?? "";
  const subject = one("subject") ?? "";
  const topic = one("topic");
  const count = one("count") ? Number(one("count")) : undefined;
  const seed = Number(one("seed") ?? 1);

  // A bookmarks drill names its questions; every other mode is assembled.
  const ids = mode === "bookmarks" ? (one("ids") ?? "").split(",").filter(Boolean) : null;
  const questions = ids ? getSimQuestions(ids) : isModeSlug(mode) ? buildSimDrill({ subject, topic, count, seed }) : [];

  if (questions.length === 0) {
    return (
      <div className={page}>
        <div className={`${card} mx-auto mt-10 max-w-xl`}>
          <h1 className="text-xl font-semibold">No questions match that combination</h1>
          <p className="mt-2 text-muted">
            The sample bank has nothing for {[subject, topic].filter(Boolean).join(", ") || "that choice"} yet. Try
            another subject or topic.
          </p>
          <Link href={isModeSlug(mode) ? `/practice/${mode}` : "/practice"} className={`${button.primary} mt-5`}>
            Change the setup
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PracticeRunner
      // The query string identifies the drill, so saved answers belong to it alone.
      storageKey={`sd-sim:${new URLSearchParams(q as Record<string, string>)}`}
      title={ids ? "Bookmarked questions" : `${MODES[mode as keyof typeof MODES].title} · ${topic ?? subject}`}
      mode={mode}
      shortfall={count !== undefined && questions.length < count ? count : undefined}
      questions={questions}
    />
  );
}
