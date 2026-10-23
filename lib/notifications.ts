import { apiFetch } from "./api/client";

/**
 * In-app notifications from the DSA API (`/api/notifications`). The same feed
 * DSA shows: class reminders, deadlines, grades, announcements, quizzes.
 */

export type Notification = {
  id: string;
  type: "class_reminder" | "deadline" | "grade_posted" | "announcement" | "quiz" | "message" | "attendance_open" | "enrollment";
  title: string;
  body?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

type ListResponse = { success: boolean; count: number; data: Notification[] };

/** Newest first, at most 100. Null when the API could not be reached. */
export async function getNotifications(token: string, unreadOnly = false): Promise<Notification[] | null> {
  try {
    const res = await apiFetch<ListResponse>(`/notifications${unreadOnly ? "?unread=true" : ""}`, { token });
    return res.data ?? [];
  } catch {
    return null;
  }
}

/** For the bell. A failure shows no badge rather than breaking the page. */
export async function unreadCount(token: string | undefined): Promise<number> {
  if (!token) return 0;
  return (await getNotifications(token, true))?.length ?? 0;
}
