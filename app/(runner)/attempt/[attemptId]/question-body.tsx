"use client";

import { useState } from "react";
import Image from "next/image";
import { MagnifyingGlassPlus, X } from "@phosphor-icons/react";
import type { SimQuestion } from "@/lib/practice-sim";
import { MathText } from "@/app/_components/math-text";

/**
 * The question itself (WEB-PRD 7): a shared passage beside it on wide
 * screens and above it on narrow ones, a diagram that opens larger, then the
 * prompt and whatever the runner puts under it (options, feedback).
 */
export function QuestionBody({ question, children }: { question: SimQuestion; children: React.ReactNode }) {
  const [zoom, setZoom] = useState(false);
  const { passage, image } = question;

  const body = (
    <div className="min-w-0">
      {image && (
        <figure className="mt-4">
          <button
            type="button"
            onClick={() => setZoom(true)}
            className="group relative block overflow-hidden rounded-xl border border-line bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            aria-label={`Enlarge diagram: ${image.alt}`}
          >
            <Image src={image.src} alt={image.alt} width={image.width} height={image.height} className="h-auto max-h-56 w-auto max-w-full" />
            <span className="absolute right-2 bottom-2 grid size-8 place-items-center rounded-lg bg-ink/70 text-canvas opacity-80 group-hover:opacity-100">
              <MagnifyingGlassPlus size={16} aria-hidden />
            </span>
          </button>
        </figure>
      )}
      <p className="mt-4 text-lg leading-snug font-medium text-pretty"><MathText text={question.prompt} /></p>
      {children}
    </div>
  );

  return (
    <>
      {passage ? (
        <div className="mt-4 grid gap-6 xl:grid-cols-2">
          <section aria-label="Passage" className="rounded-xl bg-canvas p-4 xl:max-h-[65vh] xl:overflow-y-auto">
            <p className="text-sm font-semibold text-brand-ink">{passage.title}</p>
            <p className="mt-3 leading-relaxed whitespace-pre-line"><MathText text={passage.text} /></p>
          </section>
          {body}
        </div>
      ) : (
        body
      )}

      {zoom && image && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={image.alt}
          className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4"
          onClick={() => setZoom(false)}
          onKeyDown={(e) => e.key === "Escape" && setZoom(false)}
        >
          <div className="relative max-h-full w-full max-w-3xl overflow-auto rounded-2xl bg-white p-3" onClick={(e) => e.stopPropagation()}>
            <Image src={image.src} alt={image.alt} width={image.width * 2} height={image.height * 2} className="h-auto w-full" />
            <button
              type="button"
              autoFocus
              onClick={() => setZoom(false)}
              className="absolute top-2 right-2 grid size-10 place-items-center rounded-xl bg-ink/80 text-canvas"
            >
              <X size={18} aria-hidden />
              <span className="sr-only">Close diagram</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
