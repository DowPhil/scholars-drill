import { card, page } from "./ui";

/** A grey block in the shape of the content it stands in for (WEB-PRD 8). */
export function Bone({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-line/70 motion-reduce:animate-none ${className}`} />;
}

/** The common signed-in page: a heading, a line of text, then cards. */
export function PageSkeleton({ hero = false, cards = 3 }: { hero?: boolean; cards?: number }) {
  return (
    <div className={page} aria-busy="true" aria-label="Loading">
      <Bone className="h-8 w-56" />
      <Bone className="mt-3 h-4 w-80 max-w-full" />
      {hero && <Bone className="mt-8 h-32 w-full rounded-2xl" />}
      <div className={`mt-6 grid gap-6 ${cards > 2 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className={card}>
            <Bone className="h-5 w-5" />
            <Bone className="mt-4 h-4 w-32" />
            <Bone className="mt-3 h-3 w-full" />
            <Bone className="mt-2 h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
