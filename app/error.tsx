"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowClockwise, WifiSlash } from "@phosphor-icons/react";
import { button } from "./_components/ui";

/**
 * Anything that fails while a page loads, including the signed-in layout when
 * the DSA API cannot be reached. Says what happened and what to do (WEB-PRD
 * 3.5), never "invalid credentials" for a server that is down (WEB-PRD 8).
 */
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="grid min-h-[60dvh] place-items-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <WifiSlash size={32} className="mx-auto text-brand-ink" aria-hidden />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">We could not load this page</h1>
        <p className="mt-3 text-muted">
          Either your connection dropped or our server is not answering right now. Check your data or Wi-Fi and try
          again. Drills and exams you started are saved on this device.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => retry()} className={button.primary}>
            <ArrowClockwise size={16} aria-hidden />
            Try again
          </button>
          <Link href="/dashboard" className={button.secondary}>
            Go to Home
          </Link>
        </div>
        {error.digest && <p className="mt-6 font-mono text-xs text-muted">Reference: {error.digest}</p>}
      </div>
    </div>
  );
}
