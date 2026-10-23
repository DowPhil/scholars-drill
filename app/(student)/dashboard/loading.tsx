import { PageSkeleton } from "@/app/_components/skeleton";

/** Home's shape: greeting, the main action, three cards. */
export default function Loading() {
  return <PageSkeleton hero cards={3} />;
}
