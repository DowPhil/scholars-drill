import Link from "next/link";
import { button, card, page } from "@/app/_components/ui";

/** Holding page for a destination whose screens are not built yet. */
export function ComingNext({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={page}>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      <div className={`${card} mt-8 max-w-2xl`}>
        <p className="leading-relaxed text-muted">{children}</p>
        <Link href="/dashboard" className={`${button.secondary} mt-5`}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
