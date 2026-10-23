import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, CheckCircle, Minus } from "@phosphor-icons/react/dist/ssr";
import { getSession } from "@/lib/auth/session";
import { formatDate, getPlanStatus } from "@/lib/plan";
import { button, card, page } from "@/app/_components/ui";

export const metadata: Metadata = { title: "Plan" };

// What each plan includes, as WEB-PRD 6.8 states it. Limits, prices and tier
// names are an open product decision (WEB-PRD 12.1), so none are invented here.
const ROWS: Array<[string, boolean, boolean]> = [
  ["Practice drills with worked solutions", true, true],
  ["CBT simulations", false, true],
  ["Bookmarks and question reports", true, true],
  ["Basic performance: score, accuracy, history", true, true],
  ["The full question bank", false, true],
  ["More practice each month", false, true],
  ["Advanced analytics: accuracy over time, topic breakdown", false, true],
];

/** Plan and billing (WEB-PRD 6.8). DSA students are covered by their DSA plan. */
export default async function PlanPage() {
  const session = (await getSession())!;
  const plan = getPlanStatus(session);
  const full = plan.full;

  return (
    <div className={page}>
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <ArrowLeft size={14} aria-hidden />
        Profile
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Your plan</h1>

      {full ? (
        <div className={`${card} mt-8 max-w-2xl`}>
          <p className="flex items-center gap-2 text-xl font-semibold">
            <CheckCircle size={24} weight="fill" className="text-good" aria-hidden />
            You have full access
          </p>
          <p className="mt-2 text-muted">
            {plan.kind === "dsa"
              ? `You are a Distinguished Scholars Academy student, and your DSA account${plan.label ? ` (${plan.label} plan)` : ""} covers Scholars Drill too. There is nothing to pay here. Payments stay on your DSA account.`
              : `Your ${plan.label} plan covers everything below.`}
          </p>
          {plan.endsAt && (
            <p className={`mt-3 text-sm font-medium ${plan.state === "ending" ? "text-bad" : ""}`}>
              Ends {formatDate(plan.endsAt)}. From two weeks before, you will see a reminder on every page; after it,
              CBT simulations and advanced analytics lock until you renew.
            </p>
          )}
        </div>
      ) : plan.state === "expired" ? (
        <div className={`${card} mt-8 max-w-2xl border-bad/40`}>
          <p className="text-xl font-semibold text-bad">Your plan has ended</p>
          <p className="mt-2 text-muted">
            Your {plan.label ? `${plan.label} plan` : "plan"} ended{plan.endsAt ? ` on ${formatDate(plan.endsAt)}` : ""}.
            CBT simulations and advanced analytics are locked until you renew. Your history, bookmarks and free practice
            are all still here.
            {plan.kind === "dsa" && " Renew on your DSA account and access comes back here straight away."}
          </p>
        </div>
      ) : (
        <p className="mt-2 max-w-2xl text-muted">
          You are on Free. Keep practising for free, or see what a paid plan adds.
        </p>
      )}

      <section className={`${card} mt-6 max-w-3xl overflow-x-auto`} aria-labelledby="compare-heading">
        <h2 id="compare-heading" className="font-semibold">What each plan includes</h2>
        <table className="mt-4 w-full min-w-[28rem] text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th scope="col" className="py-2 pr-4 font-medium">
                <span className="sr-only">Feature</span>
              </th>
              <th scope="col" className={`py-2 pr-4 text-center font-medium ${full ? "" : "text-brand-ink"}`}>
                Free {full ? "" : "(you)"}
              </th>
              <th scope="col" className={`py-2 text-center font-medium ${full ? "text-brand-ink" : ""}`}>
                Paid {full ? "(you)" : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([feature, free, paid]) => (
              <tr key={feature} className="border-b border-line last:border-0">
                <th scope="row" className="py-3 pr-4 font-normal">
                  {feature}
                </th>
                {[free, paid].map((yes, i) => (
                  <td key={i} className="py-3 pr-4 text-center">
                    {yes ? (
                      <Check size={18} weight="bold" className="inline text-good" aria-label="Included" />
                    ) : (
                      <Minus size={18} className="inline text-muted" aria-label="Not included" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {!full && (
        <div className="mt-6 grid max-w-3xl gap-6 md:grid-cols-2">
          <section className={card} aria-labelledby="upgrade-heading">
            <h2 id="upgrade-heading" className="font-semibold">Upgrade</h2>
            <p className="mt-1 text-sm text-muted">
              Paid plans and prices are being finalised. You will be able to pay by card or bank transfer, or upload
              proof of a bank deposit.
            </p>
            <button type="button" disabled className={`${button.primary} mt-5 opacity-60`}>
              Pricing announced soon
            </button>
          </section>
          <section className={card} aria-labelledby="dsa-heading">
            <h2 id="dsa-heading" className="font-semibold">Already a DSA student?</h2>
            <p className="mt-1 text-sm text-muted">
              Your DSA plan covers Scholars Drill. Log in with the email and password from your DSA account and you
              get full access with nothing more to pay.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
