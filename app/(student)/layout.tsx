import { redirect } from "next/navigation";
import { List, SignOut } from "@phosphor-icons/react/dist/ssr";
import { getSession, getSessionToken } from "@/lib/auth/session";
import { unreadCount } from "@/lib/notifications";
import { logout } from "@/app/(auth)/login/actions";
import { BrandMark } from "@/app/_components/brand-mark";
import { NavLinks } from "./_components/nav-links";
import { ThemeSwitch } from "@/app/_components/theme-switch";
import { PlanBanner } from "./_components/plan-banner";
import { getPlanStatus } from "@/lib/plan";

const logoutButton =
  "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted transition-colors hover:bg-tint/60 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/**
 * The real guard for the signed-in area, and its shell.
 *
 * `proxy.ts` only checks that a cookie exists. This asks the API who the cookie
 * belongs to, so an expired or revoked token cannot reach a student page.
 *
 * Desktop gets a left sidebar (WEB-PRD section 5). It shrinks to an icon rail
 * below 1024px and becomes a top bar with a menu below 768px. The quiz runner
 * will sit outside this group so it can take the full window.
 */
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const unread = await unreadCount(await getSessionToken());

  return (
    <div className="flex min-h-[100dvh] flex-col md:flex-row">
      {/* Below 768px: top bar. <details> keeps the menu working without JS. */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/85 backdrop-blur-md md:hidden">
        <details className="group">
          <summary className="flex h-16 cursor-pointer list-none items-center justify-between px-4 [&::-webkit-details-marker]:hidden">
            <BrandMark />
            <span className="grid size-11 place-items-center rounded-xl text-ink group-open:bg-tint">
              <List size={22} aria-hidden />
              <span className="sr-only">Menu</span>
            </span>
          </summary>
          <nav aria-label="Main" className="grid gap-1 border-t border-line px-4 py-3">
            <NavLinks unread={unread} />
            <ThemeSwitch className="my-2" />
            <form action={logout}>
              <button type="submit" className={logoutButton}>
                <SignOut size={20} aria-hidden />
                Log out
              </button>
            </form>
          </nav>
        </details>
      </header>

      <aside className="sticky top-0 hidden h-[100dvh] w-[4.5rem] shrink-0 flex-col border-r border-line bg-surface px-3 py-5 md:flex lg:w-60">
        <div className="px-1 [&_a]:max-lg:[font-size:0] [&_a]:max-lg:gap-0">
          <BrandMark />
        </div>
        <nav aria-label="Main" className="mt-8 flex-1">
          <NavLinks compact unread={unread} />
        </nav>
        <div className="grid gap-1 border-t border-line pt-4">
          <ThemeSwitch className="mb-2 hidden lg:grid" />
          <ThemeSwitch variant="icon" className="mx-auto lg:hidden" />
          <p className="hidden truncate px-3 pb-1 text-sm text-muted lg:block">{session.fullname}</p>
          <form action={logout}>
            <button type="submit" title="Log out" className={`${logoutButton} max-lg:justify-center`}>
              <SignOut size={20} aria-hidden />
              <span className="sr-only lg:not-sr-only">Log out</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <PlanBanner plan={getPlanStatus(session)} />
        {children}
      </main>
    </div>
  );
}
