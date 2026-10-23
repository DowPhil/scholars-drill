import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { page } from "@/app/_components/ui";
import { BookmarksView } from "./bookmarks-view";

export const metadata: Metadata = { title: "Bookmarks" };

export default function BookmarksPage() {
  return (
    <div className={page}>
      <Link
        href="/practice"
        className="inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <ArrowLeft size={14} aria-hidden />
        Practice
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Bookmarks</h1>
      <p className="mt-2 text-muted">Questions you saved to come back to.</p>
      <BookmarksView />
    </div>
  );
}
