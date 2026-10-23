import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { readOnboarding } from "@/lib/onboarding";
import { getPlanStatus } from "@/lib/plan";
import { page } from "@/app/_components/ui";
import { Locked } from "../_components/locked";
import { StudyPlanView } from "./study-plan-view";

export const metadata: Metadata = { title: "Study plan" };

/** Study plan (WEB-PRD 6.9, AI-STUDY-MODE C3). Part of advanced analytics. */
export default async function StudyPlanPage() {
  // The layout already redirected anyone without a session.
  const plan = getPlanStatus((await getSession())!);
  const onboarding = await readOnboarding();
  const subjects = onboarding?.status === "done" ? onboarding.profile.subjects : [];

  return (
    <div className={page}>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your study plan</h1>
      <p className="mt-2 text-muted">What to practise next, in order, and why.</p>
      {plan.full ? <StudyPlanView subjects={subjects} /> : <Locked feature="the study plan and advanced analytics" plan={plan} />}
    </div>
  );
}
