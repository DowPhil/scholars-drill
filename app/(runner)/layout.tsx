import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

/**
 * The quiz runner sits outside the student shell so it takes the full window:
 * nothing should invite a student out of an attempt by accident (WEB-PRD 5).
 * Same guard as the student layout.
 */
export default async function RunnerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return <main className="flex min-h-[100dvh] flex-col">{children}</main>;
}
