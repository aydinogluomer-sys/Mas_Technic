import { z } from "zod";
import { RFQ_MATERIAL_OTHER, type RfqDraft } from "./rfq-model";

/* ══════════════════════════════════════════════════════════════════════════
   WHAT A VALID REQUEST IS — client side

   CLIENT VALIDATION IS UX, NOT SECURITY (`mas-security-rfq`), and the bounds
   below are copied from the two places that are supposed to be the authority
   rather than chosen: `supabase/functions/rfq-rate-limit/index.ts`, whose
   source re-checks the e-mail, the two required names and every file
   extension with the service role, and `docs/supabase-full-setup.sql` §4.3,
   which caps each column in the database.

   MEASURED CAVEAT, AND IT IS A LARGE ONE. The DEPLOYED function does not
   match that source. Probed against the project this checkout is configured
   for, with a payload whose `id` already exists so nothing could be written,
   every guard except the `id` check let the request through to the insert —
   a missing e-mail, a malformed e-mail, a one-character customer, a missing
   company and a `.txt` in `files` all returned the duplicate-key 500 rather
   than the 400 the source would return. Fifteen requests in under a minute
   from one address produced no 429 either. So as things stand the rules below
   are not a mirror of a server check; on that project they are currently the
   ONLY check before the database's own constraints. That is a Phase 09b
   security finding, not something this file can fix — `supabase/**` is
   read-only here and deploying is a stop condition — and it is recorded at
   the point where somebody would otherwise trust the mirror.

       name      ≥2   server `customer.trim().length < 2`   · db ≤ 200
       company   ≥2   server `company.trim().length < 2`    · db ≤ 200
       email     rfc-ish + ≤255, both server and db
       service   —    db ≤ 100   (fixed list, cannot violate)
       material  ≤100 db `check_rfq_material_length`  ← the ONE field a
                      free-text answer can actually overflow
       quantity  ≥1   db `check_rfq_quantity_positive`
       notes     —    db ≤ 2000; the two free-text fields below are capped so
                      `buildRfqNotes()` cannot reach it

   The e-mail pattern is the server's own, character for character. A stricter
   client regex would reject addresses the backend accepts, which is a worse
   failure than a lax one: the server still refuses what it refuses.
   ══════════════════════════════════════════════════════════════════════════ */

const SERVER_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const rfqDraftSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Ad soyad en az 2 karakter olmalı.")
      .max(120, "Ad soyad en fazla 120 karakter olabilir."),
    email: z
      .string()
      .trim()
      .min(1, "E-posta adresi zorunludur.")
      .max(255, "E-posta adresi en fazla 255 karakter olabilir.")
      .regex(SERVER_EMAIL_PATTERN, "Geçerli bir e-posta adresi girin."),
    company: z
      .string()
      .trim()
      .min(2, "Firma adı en az 2 karakter olmalı.")
      .max(160, "Firma adı en fazla 160 karakter olabilir."),
    phone: z.string().trim().max(32, "Telefon en fazla 32 karakter olabilir."),
    service: z.string().min(1),
    material: z.string().min(1),
    customMaterial: z.string().trim().max(100, "Malzeme adı en fazla 100 karakter olabilir."),
    finish: z.string().min(1),
    priority: z.string().min(1),
    tolerance: z.string().min(1),
    quantity: z
      .number({ invalid_type_error: "Miktar bir sayı olmalı." })
      .int("Miktar tam sayı olmalı.")
      .min(1, "Miktar en az 1 adet olmalı.")
      .max(1_000_000, "Miktar en fazla 1.000.000 adet olabilir."),
    drawingNumber: z.string().trim().max(60, "Parça / revizyon en fazla 60 karakter olabilir."),
    criticalFeatures: z
      .string()
      .trim()
      .max(400, "Kritik ölçü notu en fazla 400 karakter olabilir."),
  })
  .superRefine((draft, ctx) => {
    /* "Diğer (manuel giriş)" turns an option into a free-text field, so the
       requirement has to move with it. Without this the request reaches the
       backend with `material: "Belirtilmedi"`. */
    if (draft.material === RFQ_MATERIAL_OTHER && draft.customMaterial.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customMaterial"],
        message: "Malzeme adını yazın veya listeden bir malzeme seçin.",
      });
    }
  });

export type RfqFieldName = keyof RfqDraft;
export type RfqFieldErrors = Partial<Record<RfqFieldName, string>>;

/**
 * Document order of the controls, which is the order focus must visit them in.
 *
 * WCAG 3.3.2 asks for the error to be identified; moving focus to the FIRST
 * invalid control is what makes that reachable without sight — and "first"
 * means first on the page, not first key of an object literal, so the order is
 * stated here rather than inferred from `Object.keys`.
 */
export const RFQ_FIELD_ORDER: readonly RfqFieldName[] = [
  "name",
  "email",
  "company",
  "phone",
  "service",
  "material",
  "customMaterial",
  "quantity",
  "tolerance",
  "drawingNumber",
  "criticalFeatures",
];

/** DOM id of a control, so the label, the error and the focus call agree. */
export function rfqFieldId(field: RfqFieldName): string {
  return `rfq-${field}`;
}

/** DOM id of a field's error paragraph — the `aria-describedby` target. */
export function rfqErrorId(field: RfqFieldName): string {
  return `rfq-${field}-error`;
}

export function validateRfqDraft(draft: RfqDraft): {
  errors: RfqFieldErrors;
  firstInvalid: RfqFieldName | null;
} {
  const parsed = rfqDraftSchema.safeParse(draft);
  if (parsed.success) return { errors: {}, firstInvalid: null };

  const errors: RfqFieldErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as RfqFieldName | undefined;
    if (!field || errors[field]) continue;
    errors[field] = issue.message;
  }
  const firstInvalid = RFQ_FIELD_ORDER.find((field) => errors[field]) ?? null;
  return { errors, firstInvalid };
}
