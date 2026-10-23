import { Bone } from "@/app/_components/skeleton";
import { card } from "@/app/_components/ui";

/** The runner's shape: a question with four options beside the question grid. */
export default function Loading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_17rem] lg:py-10" aria-busy="true" aria-label="Loading">
      <div className={card}>
        <Bone className="h-4 w-40" />
        <Bone className="mt-5 h-5 w-full" />
        <Bone className="mt-2 h-5 w-2/3" />
        {[0, 1, 2, 3].map((i) => (
          <Bone key={i} className="mt-3 h-12 w-full rounded-xl" />
        ))}
      </div>
      <div className={`${card} self-start`}>
        <Bone className="h-4 w-24" />
        <div className="mt-4 grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => (
            <Bone key={i} className="h-10" />
          ))}
        </div>
      </div>
    </div>
  );
}
