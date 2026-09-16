/**
 * Registration fields, options and validation.
 *
 * Shared by the signup form (per-step checks) and the server action (the full
 * check before anything is sent), so the two cannot disagree.
 *
 * Values mirror the DSA signup wizard exactly. Both products write the same
 * `users` record, and DSA's own screens filter and derive exam tracks from these
 * strings, so a Scholars Drill signup must store them identically.
 */

export const GENDERS = ["Male", "Female"] as const;

export const CLASS_LEVELS = [
  "SS1",
  "SS2",
  "SS3",
  "Jambite/Aspirant",
  "100 Level",
  "200 Level",
] as const;

/** Label shown to the student, value stored by the API (a lowercase enum). */
export const LEARNING_MODES = [
  { value: "online", label: "Online" },
  { value: "physical", label: "Physical" },
] as const;

/** The backend derives the exam track from these names, so keep them verbatim. */
export const PROGRAMMES = [
  "JAMB Tutorials",
  "WAEC Tutorials",
  "Post-UTME Tutorials",
  "Summer Classes",
  "After-School Classes",
  "A(100) Level Tutorials",
  "Preclinical Tutorials",
] as const;

export const MAX_PROGRAMMES = 2;

export const DEPARTMENTS = [
  { value: "science", label: "Science" },
  { value: "art", label: "Art" },
  { value: "commercial", label: "Commercial" },
] as const;

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
] as const;

export type SignupValues = {
  fullname: string;
  email: string;
  whatsapp: string;
  password: string;
  confirmPassword: string;
  gender: string;
  dob: string;
  state: string;
  school: string;
  classLevel: string;
  learningMode: string;
  programmes: string[];
  department: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  acceptTerms: boolean;
};

export type SignupField = keyof SignupValues;
export type FieldErrors = Partial<Record<SignupField, string>>;

export const EMPTY_SIGNUP: SignupValues = {
  fullname: "",
  email: "",
  whatsapp: "",
  password: "",
  confirmPassword: "",
  gender: "",
  dob: "",
  state: "",
  school: "",
  classLevel: "",
  learningMode: "",
  programmes: [],
  department: "",
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  acceptTerms: false,
};

export const STEPS: ReadonlyArray<{
  id: string;
  title: string;
  fields: readonly SignupField[];
}> = [
  {
    id: "account",
    title: "Your account",
    fields: ["fullname", "email", "whatsapp", "password", "confirmPassword"],
  },
  {
    id: "about",
    title: "About you",
    fields: ["gender", "dob", "state", "school", "classLevel", "learningMode"],
  },
  {
    id: "programmes",
    title: "What you are preparing for",
    fields: ["programmes", "department"],
  },
  {
    id: "guardian",
    title: "Parent or guardian",
    fields: ["guardianName", "guardianPhone", "guardianEmail"],
  },
  { id: "review", title: "Check and confirm", fields: ["acceptTerms"] },
];

/** Accept "0803 123 4567" or "0803-123-4567" and store digits only. */
export function normalisePhone(value: string): string {
  return value.replace(/[\s-]/g, "");
}

/**
 * Science, Art or Commercial is asked of SS1 to SS3 students and of anyone on an
 * exam programme. Same rule as the DSA wizard: its track derivation checks the
 * exam programmes first, so "has an exam programme" is exactly the same test.
 */
export function needsDepartment(classLevel: string, programmes: string[]): boolean {
  const level = classLevel.toLowerCase();
  if (level.includes("ss1") || level.includes("ss2") || level.includes("ss3")) return true;
  return programmes.some((p) => {
    const name = p.toLowerCase();
    return name.includes("jamb") || name.includes("waec") || name.includes("post-utme");
  });
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\d{10,11}$/;

/**
 * Validate the whole form, or only the listed fields (one step).
 * Returns a message per failing field; an empty object means valid.
 */
export function validateSignup(
  v: SignupValues,
  only?: readonly SignupField[],
): FieldErrors {
  const errors: FieldErrors = {};
  const check = (field: SignupField) => !only || only.includes(field);

  if (check("fullname") && v.fullname.trim().length < 2) {
    errors.fullname = "Enter your full name.";
  }
  if (check("email") && !EMAIL.test(v.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (check("whatsapp") && !PHONE.test(normalisePhone(v.whatsapp))) {
    errors.whatsapp = "Enter a 10 or 11 digit number, e.g. 08031234567.";
  }
  if (check("password") && v.password.length < 6) {
    errors.password = "Use at least 6 characters.";
  }
  if (check("confirmPassword") && v.confirmPassword !== v.password) {
    errors.confirmPassword = "The two passwords do not match.";
  }

  if (check("gender") && !GENDERS.includes(v.gender as (typeof GENDERS)[number])) {
    errors.gender = "Select your gender.";
  }
  if (check("dob")) {
    const date = new Date(v.dob);
    if (!v.dob || Number.isNaN(date.getTime())) {
      errors.dob = "Enter your date of birth.";
    } else if (date.getTime() > Date.now()) {
      errors.dob = "Date of birth cannot be in the future.";
    }
  }
  if (check("state") && !NIGERIAN_STATES.includes(v.state as (typeof NIGERIAN_STATES)[number])) {
    errors.state = "Select your state.";
  }
  if (check("school") && v.school.trim().length < 2) {
    errors.school = "Enter your school.";
  }
  if (check("classLevel") && !CLASS_LEVELS.includes(v.classLevel as (typeof CLASS_LEVELS)[number])) {
    errors.classLevel = "Select your class or level.";
  }
  if (check("learningMode") && !LEARNING_MODES.some((m) => m.value === v.learningMode)) {
    errors.learningMode = "Select how you learn.";
  }

  if (check("programmes")) {
    if (v.programmes.length === 0) {
      errors.programmes = "Choose at least one.";
    } else if (v.programmes.length > MAX_PROGRAMMES) {
      errors.programmes = `Choose up to ${MAX_PROGRAMMES}.`;
    }
  }
  if (
    check("department") &&
    needsDepartment(v.classLevel, v.programmes) &&
    !DEPARTMENTS.some((d) => d.value === v.department)
  ) {
    errors.department = "Select your department.";
  }

  if (check("guardianName") && v.guardianName.trim().length < 2) {
    errors.guardianName = "Enter your parent or guardian's name.";
  }
  if (check("guardianPhone") && !PHONE.test(normalisePhone(v.guardianPhone))) {
    errors.guardianPhone = "Enter a 10 or 11 digit number.";
  }
  if (check("guardianEmail") && v.guardianEmail.trim() && !EMAIL.test(v.guardianEmail.trim())) {
    errors.guardianEmail = "Enter a valid email, or leave it blank.";
  }

  if (check("acceptTerms") && !v.acceptTerms) {
    errors.acceptTerms = "Please confirm to create your account.";
  }

  return errors;
}

/** Index of the first step that holds an error, or -1. */
export function firstStepWithError(errors: FieldErrors): number {
  return STEPS.findIndex((step) => step.fields.some((f) => errors[f]));
}
