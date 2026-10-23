import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { readOnboarding } from "@/lib/onboarding";
import { page } from "@/app/_components/ui";
import { DashboardLive } from "./dashboard-live";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Home: answers "what do I do now" (WEB-PRD 6.2).
 *
 * The greeting renders here; the cards read attempt history, which lives in
 * the browser while practice is simulated (see DashboardLive).
 */
export default async function DashboardPage() {
  // The layout already redirected anyone without a session.
  const session = (await getSession())!;
  const firstName = session.fullname.split(" ")[0];

  // First visit after sign-up: onboarding, once. Finishing or skipping ends it.
  const onboarding = await readOnboarding();
  if (!onboarding) redirect("/onboarding");
  const profile = onboarding.status === "done" ? onboarding.profile : undefined;
  const preparing = profile ? `${profile.exam} ${profile.year}` : session.examTrack;

  return (
    <div className={page}>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome, {firstName}.</h1>
      <p className="mt-2 text-muted">
        {preparing ? `Preparing for ${preparing}. ` : ""}
        Here is where you stand and what to do next.
      </p>

      <DashboardLive firstSubject={profile?.subjects[0]} />
    </div>
  );
}
