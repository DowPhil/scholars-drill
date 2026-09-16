"use server";

import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api/client";
import { setPendingEmail } from "@/lib/auth/session";
import {
  needsDepartment,
  normalisePhone,
  validateSignup,
  type FieldErrors,
  type SignupValues,
} from "@/lib/registration";

export type SignupState = {
  formError?: string;
  fieldErrors?: FieldErrors;
  /** The email already has an active account, so point them at log in. */
  accountExists?: boolean;
};

function readValues(formData: FormData): SignupValues {
  const text = (name: string) => String(formData.get(name) ?? "");
  return {
    fullname: text("fullname"),
    email: text("email"),
    whatsapp: text("whatsapp"),
    password: text("password"),
    confirmPassword: text("confirmPassword"),
    gender: text("gender"),
    dob: text("dob"),
    state: text("state"),
    school: text("school"),
    classLevel: text("classLevel"),
    learningMode: text("learningMode"),
    programmes: formData.getAll("programmes").map(String),
    department: text("department"),
    guardianName: text("guardianName"),
    guardianPhone: text("guardianPhone"),
    guardianEmail: text("guardianEmail"),
    acceptTerms: formData.get("acceptTerms") === "yes",
  };
}

export async function signup(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const v = readValues(formData);

  // The form already checked each step, but a Server Action is a public POST
  // endpoint, so never trust that it came through the form.
  const fieldErrors = validateSignup(v);
  if (Object.keys(fieldErrors).length > 0) {
    return { formError: "Some details need attention.", fieldErrors };
  }

  const email = v.email.trim().toLowerCase();

  // Same shape as the DSA signup wizard sends, so both products create
  // identical user records.
  const payload = {
    fullname: v.fullname.trim(),
    email,
    whatsappNumber: normalisePhone(v.whatsapp),
    password: v.password,
    gender: v.gender,
    dateOfBirth: v.dob,
    stateOfResidence: v.state,
    institution: v.school.trim(),
    currentLevel: v.classLevel,
    learningMode: v.learningMode,
    programmes: v.programmes,
    ...(needsDepartment(v.classLevel, v.programmes) && v.department
      ? { department: v.department }
      : {}),
    guardianInfo: {
      fullname: v.guardianName.trim(),
      phoneNumber: normalisePhone(v.guardianPhone),
      ...(v.guardianEmail.trim() ? { email: v.guardianEmail.trim().toLowerCase() } : {}),
    },
    role: "student",
  };

  try {
    await apiFetch<{ success: boolean }>("/auth/register", {
      method: "POST",
      body: payload,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      // The API returns messages rather than error codes, so these two cases
      // are recognised by wording. Anything else is shown as the API said it.
      if (/already exists/i.test(error.message)) {
        return {
          formError: "An account with this email already exists.",
          accountExists: true,
        };
      }
      if (/another role/i.test(error.message)) {
        return {
          formError:
            "This email belongs to a staff or parent account. Use a different email to sign up as a student.",
        };
      }
      return { formError: error.message };
    }
    return { formError: "Something went wrong. Try again." };
  }

  await setPendingEmail(email);
  redirect("/verify");
}
