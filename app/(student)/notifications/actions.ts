"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api/client";
import { getSessionToken } from "@/lib/auth/session";

export async function markRead(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const token = await getSessionToken();
  if (!token || !/^[a-f0-9]{24}$/i.test(id)) return;
  try {
    await apiFetch(`/notifications/${id}/read`, { method: "PATCH", token });
  } catch {
    // Left unread; the page shows it as such.
  }
  revalidatePath("/", "layout");
}

export async function markAllRead(): Promise<void> {
  const token = await getSessionToken();
  if (!token) return;
  try {
    await apiFetch("/notifications/read-all", { method: "PATCH", token });
  } catch {}
  revalidatePath("/", "layout");
}
