import type { Metadata } from "next";
import Link from "next/link";
import { page } from "@/app/_components/ui";
import { ProgressView } from "./progress-view";
import { getSession } from "@/lib/auth/session";
import { getPlanStatus } from "@/lib/plan";

export const metadata: Metadata = { title: "Progress" };

export default async function ProgressPage() {
  // The layout already redirected anyone without a session.
  const plan = getPlanStatus((await getSession())!);

  return (
    <div className={page}>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Progress</h1>
      <p className="mt-2 text-muted">
        How you are doing over time, and where marks are going.{" "}
        <Link href="/study" className="font-semibold text-brand-ink hover:underline">
          See your study plan
        </Link>
      </p>
      <ProgressView analytics={plan.full} plan={plan} />
    </div>
  );
}
