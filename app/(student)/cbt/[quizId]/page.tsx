import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Play } from "@phosphor-icons/react/dist/ssr";
import { buildSimExam, findSimExam } from "@/lib/practice-sim";
import { button, card, page } from "@/app/_components/ui";
import { getSession } from "@/lib/auth/session";
import { getPlanStatus } from "@/lib/plan";
import { Locked } from "../../_components/locked";

export const metadata: Metadata = { title: "CBT simulation" };

/**
 * Start the sitting. The start time is stamped here, on the server, so the
 * runner counts down from a time it did not choose: a stand-in for the API's
 * server-side `expiresAt` (WEB-PRD 6.4 rule 9).
 */
async function start(formData: FormData) {
  "use server";
  const id = String(formData.get("quizId") ?? "");
  if (!findSimExam(id)) redirect("/cbt");
  // Checked again here: the page may have been open since before the plan ended.
  const session = await getSession();
  if (!session || !getPlanStatus(session).full) redirect("/cbt");
  const query = new URLSearchParams({
    quiz: id,
    started: String(Date.now()),
    seed: String(Math.floor(Math.random() * 1e9)),
  });
  redirect(`/attempt/cbt?${query}`);
}

/** Setup screen for a CBT simulation (WEB-PRD 6.3): rules first, clock after Start. */
export default async function CbtSetupPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const exam = findSimExam(quizId);
  if (!exam) notFound();
  const plan = getPlanStatus((await getSession())!);
  if (!plan.full) {
    return (
      <div className={page}>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{exam.title}</h1>
        <Locked feature="CBT simulations" plan={plan} />
      </div>
    );
  }

  const questions = buildSimExam(exam, 1);
  const rules = [
    `One countdown of ${exam.minutes} minutes for the whole sitting. It starts when you click Start and keeps running if you leave.`,
    "Move freely between subjects with the tabs. The question grid shows what you have answered and flagged.",
    "No right or wrong until you submit. Then you get your score and the full working.",
    "When time runs out, your answers are submitted for you.",
    "Keyboard: A to D picks an option, N and P move, F flags, S opens Submit.",
  ];

  return (
    <div className={page}>
      <Link
        href="/cbt"
        className="inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <ArrowLeft size={14} aria-hidden />
        All simulations
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{exam.title}</h1>
      <p className="mt-2 text-muted">Sample questions, laid out like the real {exam.exam} CBT.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <section className={card} aria-labelledby="rules-heading">
          <h2 id="rules-heading" className="font-semibold">Instructions</h2>
          <ol className="mt-4 grid list-decimal gap-2 pl-5 text-sm leading-relaxed text-muted marker:font-mono">
            {rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        </section>

        <aside className={card} aria-labelledby="sitting-heading">
          <h2 id="sitting-heading" className="font-semibold">This sitting</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            {exam.subjects.map((s) => (
              <div key={s} className="flex justify-between gap-4">
                <dt className="text-muted">{s}</dt>
                <dd className="font-mono">{questions.filter((q) => q.subject === s).length} q</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t border-line pt-3 font-semibold">
              <dt>Total</dt>
              <dd className="font-mono">
                {questions.length} q · {exam.minutes} min
              </dd>
            </div>
          </dl>
          <form action={start} className="mt-5">
            <input type="hidden" name="quizId" value={exam.id} />
            <button type="submit" className={`${button.primary} w-full`}>
              <Play size={16} weight="fill" aria-hidden />
              Start exam
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
