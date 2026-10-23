/**
 * Bookmarked and reported questions, across every attempt, kept in this
 * browser while practice is simulated. Reports go to the checkers' queue
 * (admin `questions/reports`) once the backend accepts them.
 */

export type SavedKind = "bookmarks" | "reported";

const KEYS: Record<SavedKind, string> = { bookmarks: "sd-bookmarks", reported: "sd-reported" };

/** Newest first: each entry is a question id and when it was saved. */
export type SavedEntry = { id: string; at: number };

export function loadSaved(kind: SavedKind): SavedEntry[] {
  try {
    const raw = localStorage.getItem(KEYS[kind]);
    return raw ? (JSON.parse(raw) as SavedEntry[]) : [];
  } catch {
    return [];
  }
}

/** Add or remove one question; returns the updated list. */
export function toggleSaved(kind: SavedKind, id: string): SavedEntry[] {
  const list = loadSaved(kind);
  const next = list.some((e) => e.id === id) ? list.filter((e) => e.id !== id) : [{ id, at: Date.now() }, ...list];
  try {
    localStorage.setItem(KEYS[kind], JSON.stringify(next));
  } catch {}
  return next;
}
