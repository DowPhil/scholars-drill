import Link from "next/link";
import { Warning, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { formatDate, type PlanStatus } from "@/lib/plan";

/**
 * The plan alert on every signed-in page: from two weeks before the end date,
 * and after it. Says what happens and what to do (WEB-PRD 6.8: an honest
 * moment, not a trap).
 */
export function PlanBanner({ plan }: { plan: PlanStatus }) {
  if (plan.state !== "ending" && plan.state !== "expired") return null;

  const expired = plan.state === "expired";
  const name = plan.label ? `${plan.label} plan` : "plan";
  const when = plan.endsAt ? formatDate(plan.endsAt) : undefined;
  const days = plan.daysLeft ?? 0;

  return (
    <div
      role={expired ? "alert" : "status"}
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-3 text-sm sm:px-6 lg:px-10 ${
        expired ? "border-bad/30 bg-bad-soft text-bad" : "border-brand/20 bg-tint text-brand-ink"
      }`}
    >
      {expired ? <WarningCircle size={20} weight="fill" aria-hidden className="shrink-0" /> : <Warning size={20} weight="fill" aria-hidden className="shrink-0" />}
      <p className="min-w-0 flex-1 font-medium">
        {expired
          ? `Your ${name} ended${when ? ` on ${when}` : ""}. CBT simulations and advanced analytics are locked. Free practice carries on.`
          : `Your ${name} ends on ${when}, ${days === 1 ? "tomorrow" : `in ${days} days`}. Renew before then to keep CBT simulations and advanced analytics.`}
      </p>
      <Link href="/profile/plan" className="shrink-0 font-semibold underline underline-offset-2">
        {expired ? "Renew" : "Renew now"}
      </Link>
    </div>
  );
}
