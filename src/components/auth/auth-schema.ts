import { z } from "zod";

/* ══════════════════════════════════════════════════════════════════════════
   WHAT A VALID ANSWER IS — client side, for the three auth routes

   THE SAME SHAPE `rfq-schema.ts` USES, FOR THE SAME REASON. Before this file
   the auth family had no validation object at all: every failure — a missing
   captcha, two passwords that disagree, a password below the minimum — was a
   `toast.error()` that named one problem, floated over the page and then
   disappeared. A message that leaves cannot be re-read, cannot be linked to
   the control it is about, and is not there when the reader finally looks up.
   Here each message is a string on a field, the field carries `aria-invalid`
   and points at it with `aria-describedby`, and it stays until it is fixed.

   CLIENT VALIDATION IS UX, NOT SECURITY (`mas-security-rfq`). Nothing below
   protects anything; the server decides. What it does is stop a reader
   spending a round-trip to be told something the browser already knew.

   ── THE E-MAIL PATTERN IS BORROWED, NOT INVENTED ─────────────────────────
   It is character-for-character the one `rfq-schema.ts` takes from
   `supabase/functions/rfq-rate-limit/index.ts`. A stricter client regex
   rejects addresses the backend accepts, which is the worse failure.

   ── THE PASSWORD MINIMUM IS THE FORM'S, AND IT IS NOT A CLAIM ABOUT THE
   ── SERVER, WHICH IS WHY THE MESSAGE IS WORDED THE WAY IT IS
   6 is what `Login.tsx` and `ResetPassword.tsx` already enforced through
   `minLength={6}`, so keeping it changes no behaviour. It is NOT known to be
   the project's real minimum: that lives in the Supabase project's auth
   configuration, `supabase/config.toml` in this repository carries no `[auth]`
   block at all, and reading the deployed value is a network call this phase
   does not make. So the copy says what THIS FORM requires and does not tell
   the reader what the account system requires. If the project's minimum is
   higher, a reader still learns that from the server's own answer, rendered
   in the same branded notice — which is exactly the failure mode a fabricated
   "en az 6 karakter" promise would have hidden.
   ══════════════════════════════════════════════════════════════════════════ */

const SERVER_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** What the FORM requires. Deliberately not described as the account rule. */
export const MIN_PASSWORD_LENGTH = 6;

export type AuthFieldName =
  | "email"
  | "password"
  | "confirmPassword"
  | "fullName"
  | "company"
  | "phone"
  | "city";

export type AuthFieldErrors = Partial<Record<AuthFieldName, string>>;

export const authFieldId = (field: AuthFieldName) => `auth-${field}`;
export const authErrorId = (field: AuthFieldName) => `auth-${field}-error`;

const email = z
  .string()
  .trim()
  .min(1, "E-posta adresinizi girin.")
  .max(255, "E-posta adresi en fazla 255 karakter olabilir.")
  .regex(SERVER_EMAIL_PATTERN, "Geçerli bir e-posta adresi girin.");

const password = z
  .string()
  .min(1, "Şifrenizi girin.")
  .min(MIN_PASSWORD_LENGTH, `Bu form en az ${MIN_PASSWORD_LENGTH} karakter istiyor.`)
  .max(72, "Şifre en fazla 72 karakter olabilir.");

export const loginSchema = z.object({ email, password });

export const signupSchema = z.object({
  email,
  password,
  fullName: z
    .string()
    .trim()
    .min(2, "Ad soyad en az 2 karakter olmalı.")
    .max(100, "Ad soyad en fazla 100 karakter olabilir."),
  company: z.string().trim().max(100, "Firma adı en fazla 100 karakter olabilir."),
  phone: z.string().trim().max(20, "Telefon en fazla 20 karakter olabilir."),
  city: z.string().trim().max(50, "Şehir en fazla 50 karakter olabilir."),
});

export const forgotSchema = z.object({ email });

export const resetSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, "Şifreyi bir kez daha girin."),
  })
  .superRefine((value, ctx) => {
    if (value.password && value.confirmPassword && value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "İki şifre aynı değil.",
      });
    }
  });

/**
 * Collapse a Zod failure into one message per field.
 *
 * FIRST issue per field, not last: the first is the one closest to what the
 * reader actually typed ("girin" before "en az 6 karakter"), and a field can
 * only show one message.
 */
export function collectAuthErrors(issues: z.ZodIssue[]): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  for (const issue of issues) {
    const field = issue.path[0] as AuthFieldName | undefined;
    if (!field || errors[field]) continue;
    errors[field] = issue.message;
  }
  return errors;
}

/** The order errors are announced and focused in — source order of the form. */
export const AUTH_FIELD_ORDER: AuthFieldName[] = [
  "fullName",
  "company",
  "phone",
  "city",
  "email",
  "password",
  "confirmPassword",
];

export function firstInvalidField(errors: AuthFieldErrors): AuthFieldName | null {
  return AUTH_FIELD_ORDER.find((field) => errors[field]) ?? null;
}

/**
 * The three auth forms' shared submit gate: on failure, show one message per
 * field and focus the first invalid control, then return null; on success,
 * clear the errors and return the parsed values.
 */
export function validateAuthForm<T>(
  schema: z.ZodType<T>,
  values: unknown,
  setErrors: (errors: AuthFieldErrors) => void,
): T | null {
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors = collectAuthErrors(parsed.error.issues);
    setErrors(fieldErrors);
    const first = firstInvalidField(fieldErrors);
    if (first) document.getElementById(authFieldId(first))?.focus();
    return null;
  }
  setErrors({});
  return parsed.data;
}
