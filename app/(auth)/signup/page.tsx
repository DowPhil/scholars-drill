import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { SignupWizard } from "./signup-wizard";

export const metadata: Metadata = {
  title: "Create your free account",
  description:
    "Sign up free for Scholars Drill: practise past questions and CBT mocks for JAMB, WAEC, NECO and Post-UTME.",
};

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Create your free account</h1>
      <p className="mt-2 leading-relaxed text-muted">
        Free to join. Already a Distinguished Scholars Academy student?{" "}
        <a
          href="/login"
          className="font-semibold text-brand-ink hover:underline hover:underline-offset-4"
        >
          Log in with your DSA details
        </a>{" "}
        instead.
      </p>

      <div className="mt-7">
        <SignupWizard />
      </div>
    </div>
  );
}
