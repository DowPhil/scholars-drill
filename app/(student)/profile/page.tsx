import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, SignOut } from "@phosphor-icons/react/dist/ssr";
import { getSession } from "@/lib/auth/session";
import { logout } from "@/app/(auth)/login/actions";
import { readOnboarding } from "@/lib/onboarding";
import { formatDate, getPlanStatus } from "@/lib/plan";
import { button, card, page } from "@/app/_components/ui";
import { PasswordForm } from "./password-form";
import { ThemeSwitch } from "@/app/_components/theme-switch";

export const metadata: Metadata = { title: "Profile" };

const linkStyle = "inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:underline focus-visible:outline-2 focus-visible:outline-brand";

/** Profile, plan and settings (WEB-PRD 6.8). */
export default async function ProfilePage() {
  // The layout already redirected anyone without a session.
  const session = (await getSession())!;
  const plan = getPlanStatus(session);
  const onboarding = await readOnboarding();
  const study = onboarding?.status === "done" ? onboarding.profile : undefined;

  const account: Array<[string, string | null | undefined]> = [
    ["Name", session.fullname],
    ["Email", session.email],
    ["DSA Student ID", session.studentId],
    ["Level", session.currentLevel],
    ["Programmes", session.programmes?.length ? session.programmes.join(", ") : null],
  ];

  return (
    <div className={page}>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Profile</h1>
      <p className="mt-2 text-muted">One account for Distinguished Scholars Academy and Scholars Drill.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className={card} aria-labelledby="plan-heading">
          <h2 id="plan-heading" className="font-semibold">Your plan</h2>
          {plan.state === "expired" ? (
            <>
              <p className="mt-3 text-2xl font-semibold text-bad">Ended</p>
              <p className="mt-1 text-sm text-muted">
                Your {plan.label ? `${plan.label} plan` : "plan"} ended{plan.endsAt ? ` on ${formatDate(plan.endsAt)}` : ""}. CBT
                simulations and advanced analytics are locked; free practice carries on.
              </p>
              <Link href="/profile/plan" className={`${button.primary} mt-5`}>
                Renew
                <ArrowRight size={16} aria-hidden />
              </Link>
            </>
          ) : !plan.full ? (
            <>
              <p className="mt-3 text-2xl font-semibold">Free</p>
              <p className="mt-1 text-sm text-muted">Capped practice and basic performance data.</p>
              <Link href="/profile/plan" className={`${button.primary} mt-5`}>
                See what paid adds
                <ArrowRight size={16} aria-hidden />
              </Link>
            </>
          ) : (
            <>
              <p className="mt-3 flex items-center gap-2 text-2xl font-semibold">
                <CheckCircle size={26} weight="fill" className="text-good" aria-hidden />
                Full access
              </p>
              <p className="mt-1 text-sm text-muted">
                {plan.kind === "dsa"
                  ? `Included with your DSA account${plan.label ? ` (${plan.label} plan)` : ""}. Nothing more to pay here.`
                  : `Your ${plan.label} plan covers the full question bank and analytics.`}
              </p>
              {plan.endsAt && (
                <p className={`mt-2 text-sm font-medium ${plan.state === "ending" ? "text-bad" : ""}`}>
                  Ends {formatDate(plan.endsAt)}
                  {plan.daysLeft !== undefined && ` (${plan.daysLeft} day${plan.daysLeft === 1 ? "" : "s"} left)`}
                </p>
              )}
              <Link href="/profile/plan" className={`${linkStyle} mt-5`}>
                Plan details
                <ArrowRight size={14} aria-hidden />
              </Link>
            </>
          )}
        </section>

        <section className={card} aria-labelledby="study-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="study-heading" className="font-semibold">What you are preparing for</h2>
            <Link href="/profile/study" className={linkStyle}>
              {study ? "Edit" : "Set up"}
            </Link>
          </div>
          {study ? (
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-muted">Exam</dt>
                <dd className="mt-0.5 font-medium">
                  {study.exam} {study.year}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Target</dt>
                <dd className="mt-0.5 font-mono font-medium">{study.target}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted">Subjects</dt>
                <dd className="mt-0.5 font-medium">{study.subjects.join(", ")}</dd>
              </div>
              {study.minutesPerDay && (
                <div>
                  <dt className="text-muted">Daily practice</dt>
                  <dd className="mt-0.5 font-medium">{study.minutesPerDay} min</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Tell us your exam, subjects and target so we can recommend the right drills.
            </p>
          )}
        </section>

        <section className={card} aria-labelledby="account-heading">
          <h2 id="account-heading" className="font-semibold">Account</h2>
          <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {account
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted">{label}</dt>
                  <dd className="mt-0.5 font-medium break-words">{value}</dd>
                </div>
              ))}
          </dl>
          <p className="mt-4 text-sm text-muted">Name and email are managed on your DSA account.</p>
        </section>

        <section className={card} aria-labelledby="appearance-heading">
          <h2 id="appearance-heading" className="font-semibold">Appearance</h2>
          <p className="mt-1 text-sm text-muted">
            System follows your device. Dark is easier on the eyes for night practice.
          </p>
          <ThemeSwitch className="mt-4 max-w-sm" />
        </section>

        <section className={card} aria-labelledby="password-heading">
          <h2 id="password-heading" className="font-semibold">Change password</h2>
          <PasswordForm />
        </section>
      </div>

      <form action={logout} className="mt-8">
        <button type="submit" className={button.secondary}>
          <SignOut size={16} aria-hidden />
          Log out
        </button>
      </form>
    </div>
  );
}
