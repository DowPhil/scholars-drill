/**
 * Shared between the session helpers and `proxy.ts`.
 *
 * It lives in its own module because proxy runs before the request reaches the
 * app and must not pull in `next/headers`.
 */
export const SESSION_COOKIE = "sd_session";

/**
 * Carries the email from signup to the verify page without putting it in the
 * URL, where it would land in browser history and server logs.
 */
export const PENDING_EMAIL_COOKIE = "sd_pending_email";

/** Areas that require a signed-in account. Used by the optimistic proxy gate. */
export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/practice",
  "/cbt",
  "/attempt",
  "/history",
  "/performance",
  "/bookmarks",
  "/billing",
  "/profile",
  "/study",
  "/content",
  "/admin",
] as const;
