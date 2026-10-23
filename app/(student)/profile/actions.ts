"use server";

import { apiFetch, ApiError } from "@/lib/api/client";
import { getSessionToken, setSessionCookie } from "@/lib/auth/session";

export type PasswordState = { error?: string; message?: string };

/** Change the password shared by Scholars Drill and DSA. */
export async function changePassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword) return { error: "Enter your current password." };
  // Matches the backend's own minimum for a password.
  if (newPassword.length < 6) return { error: "Use at least 6 characters for the new password." };
  if (newPassword !== confirm) return { error: "The two new passwords do not match." };
  if (newPassword === currentPassword) return { error: "The new password is the same as the current one." };

  const token = await getSessionToken();
  if (!token) return { error: "Your session has ended. Log in again." };

  try {
    const result = await apiFetch<{ success: boolean; token?: string }>("/auth/updatepassword", {
      method: "PUT",
      token,
      body: { currentPassword, newPassword },
    });
    // The API issues a fresh token with the new password; keep the student signed in on it.
    if (result?.token) await setSessionCookie(result.token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return { error: "Your current password is not right." };
    if (error instanceof ApiError) return { error: error.message };
    return { error: "Something went wrong. Try again." };
  }
  return { message: "Password changed. Use the new one on Scholars Drill and DSA." };
}
