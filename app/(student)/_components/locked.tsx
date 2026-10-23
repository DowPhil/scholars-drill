import Link from "next/link";
import { LockSimple } from "@phosphor-icons/react/dist/ssr";
import { formatDate, type PlanStatus } from "@/lib/plan";
import { button, card } from "@/app/_components/ui";

/** Shown in place of a paid feature: what it is, why it is locked, what to do. */
export function Locked({ feature, plan, compact = false }: { feature: string; plan: PlanStatus; compact?: boolean }) {
  const why =
    plan.state === "expired"
      ? `Your ${plan.label ? `${plan.label} plan` : "plan"} ended${plan.endsAt ? ` on ${formatDate(plan.endsAt)}` : ""}, so ${feature} are locked until you renew.`
      : `${feature[0].toUpperCase()}${feature.slice(1)} come with a paid plan.`;

  return (
    <div className={`${card} ${compact ? "" : "mt-8 max-w-2xl"}`}>
      <LockSimple size={24} className="text-brand-ink" aria-hidden />
      <h2 className="mt-3 font-semibold">{plan.state === "expired" ? "Your plan has ended" : "Part of a paid plan"}</h2>
      <p className="mt-1 text-sm text-muted">{why} Free practice drills, bookmarks and your history stay open.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/profile/plan" className={button.primary}>
          {plan.state === "expired" ? "Renew" : "See plans"}
        </Link>
        <Link href="/practice" className={button.secondary}>
          Free practice
        </Link>
      </div>
    </div>
  );
}
