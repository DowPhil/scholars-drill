import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { MODES, isModeSlug } from "@/lib/practice";
import { page } from "@/app/_components/ui";
import { SetupForm } from "./setup-form";
import { getSession, getSessionToken } from "@/lib/auth/session";
import { getPlanStatus } from "@/lib/plan";
import { getAllowance } from "@/lib/allowance";

export async function generateMetadata({ params }: { params: Promise<{ mode: string }> }): Promise<Metadata> {
  const { mode } = await params;
  return { title: isModeSlug(mode) ? MODES[mode].title : "Practice" };
}

/** Setup screen before every attempt (WEB-PRD 6.3). Nothing starts until Start. */
export default async function SetupPage({
  params,
  searchParams,
}: {
  params: Promise<{ mode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { mode } = await params;
  if (!isModeSlug(mode)) notFound();
  // "Practise <topic>" buttons arrive with the subject and topic chosen.
  const q = await searchParams;
  // Capped practice applies only without full access (WEB-PRD 6.8).
  const plan = getPlanStatus((await getSession())!);
  const allowance = plan.full ? null : await getAllowance(await getSessionToken());

  return (
    <div className={page}>
      <Link
        href="/practice"
        className="inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <ArrowLeft size={14} aria-hidden />
        All modes
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{MODES[mode].title}</h1>
      <p className="mt-2 text-muted">{MODES[mode].summary}</p>

      <div className="mt-8">
        <SetupForm
          mode={mode}
          initialSubject={typeof q.subject === "string" ? q.subject : undefined}
          initialTopic={typeof q.topic === "string" ? q.topic : undefined}
          initialCount={typeof q.count === "string" ? Number(q.count) : undefined}
          allowance={allowance}
        />
      </div>
    </div>
  );
}
