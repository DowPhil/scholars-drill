import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { EXAMS } from "@/lib/practice";
import { readOnboarding } from "@/lib/onboarding";
import { examYears } from "@/lib/study-profile";
import { OnboardingWizard } from "./wizard";

export const metadata: Metadata = { title: "Get started" };

/** Onboarding (WEB-PRD 6.1). Shown once: finishing or skipping both end it. */
export default async function OnboardingPage() {
  if (await readOnboarding()) redirect("/dashboard");

  // The layout already redirected anyone without a session.
  const session = (await getSession())!;
  // A DSA student arrives with an exam track: confirm it rather than ask.
  const track = session.examTrack?.toLowerCase() ?? "";
  const knownExam = EXAMS.find((e) => track.includes(e.toLowerCase().replace("-", "")) || track.includes(e.toLowerCase()));

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:py-14">
      <OnboardingWizard firstName={session.fullname.split(" ")[0]} knownExam={knownExam} years={examYears()} />
    </div>
  );
}
