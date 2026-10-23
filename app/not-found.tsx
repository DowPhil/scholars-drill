import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "./_components/brand-mark";
import { button } from "./_components/ui";

export const metadata: Metadata = { title: "Page not found" };

/** Every unmatched URL, and every notFound(): say so plainly and offer a way on. */
export default function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <p className="mt-10 font-mono text-sm font-semibold text-brand-ink">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">This page does not exist</h1>
        <p className="mt-3 text-muted">
          The link may be old or mistyped. Nothing you were working on is lost: drills and exams save as you go.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className={button.primary}>
            Go to Home
          </Link>
          <Link href="/practice" className={button.secondary}>
            Practise
          </Link>
        </div>
      </div>
    </main>
  );
}
