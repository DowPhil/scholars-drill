import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookmarkSimple, CalendarBlank, Lightning, Shuffle, Target, Timer } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { MODES, type ModeSlug } from "@/lib/practice";
import { card, page } from "@/app/_components/ui";

export const metadata: Metadata = { title: "Practice" };

const ICONS: Record<ModeSlug, Icon> = {
  quick: Lightning,
  topic: Target,
  mixed: Shuffle,
  past: CalendarBlank,
};

const linkCard = `${card} group flex flex-col transition-colors hover:border-brand/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`;

/** Mode picker (WEB-PRD 6.3). Each mode opens its own setup screen. */
export default function PracticePage() {
  return (
    <div className={page}>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Practice</h1>
      <p className="mt-2 text-muted">Pick how you want to practise. You will see the details before anything starts.</p>

      <Link
        href="/cbt"
        className="group mt-8 flex flex-col gap-4 rounded-2xl bg-brand p-6 text-on-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <div className="flex gap-4">
          <Timer size={28} aria-hidden className="shrink-0" />
          <div>
            <h2 className="text-lg font-semibold">Full CBT simulation</h2>
            <p className="mt-1 text-on-brand/80">
              Timed like the real exam, across several subjects. No feedback until you submit.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-semibold">
          See simulations
          <ArrowRight size={16} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(MODES) as ModeSlug[]).map((slug) => {
          const Icon = ICONS[slug];
          return (
            <li key={slug} className="flex">
              <Link href={`/practice/${slug}`} className={`${linkCard} w-full`}>
                <Icon size={24} className="text-brand-ink" aria-hidden />
                <h2 className="mt-3 font-semibold">{MODES[slug].title}</h2>
                <p className="mt-1 flex-1 text-sm text-muted">{MODES[slug].summary}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
                  Set up
                  <ArrowRight size={14} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link href="/practice/bookmarks" className={`${card} group mt-6 flex items-center gap-4 transition-colors hover:border-brand/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}>
        <BookmarkSimple size={24} className="shrink-0 text-brand-ink" aria-hidden />
        <div className="flex-1">
          <h2 className="font-semibold">Bookmarks</h2>
          <p className="mt-0.5 text-sm text-muted">Questions you saved, ready to practise again.</p>
        </div>
        <ArrowRight size={16} aria-hidden className="text-brand-ink transition-transform group-hover:translate-x-0.5" />
      </Link>

      <p className="mt-6 text-sm text-muted">
        Every practice question shows you right away whether you got it, with the worked solution.
      </p>
    </div>
  );
}
