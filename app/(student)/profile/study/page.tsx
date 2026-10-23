import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { getSession } from "@/lib/auth/session";
import { readOnboarding } from "@/lib/onboarding";
import { examYears } from "@/lib/study-profile";
import { OnboardingWizard } from "../../onboarding/wizard";

export const metadata: Metadata = { title: "What you are preparing for" };

/** Edit the study profile onboarding collected, with the same steps. */
export default async function StudyProfilePage() {
  const session = (await getSession())!;
  const onboarding = await readOnboarding();
  const initial = onboarding?.status === "done" ? onboarding.profile : undefined;
  // A saved year that has since passed is kept so it shows as chosen.
  const years = [...new Set([...(initial ? [initial.year] : []), ...examYears()])].sort();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:py-14">
      <Link
        href="/profile"
        className="mb-4 inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <ArrowLeft size={14} aria-hidden />
        Profile
      </Link>
      <OnboardingWizard
        firstName={session.fullname.split(" ")[0]}
        years={years}
        // Never set up (skipped onboarding): start blank, but still return to Profile.
        initial={initial ?? { exam: "JAMB", year: examYears()[0], subjects: [], target: "" }}
      />
    </div>
  );
}
