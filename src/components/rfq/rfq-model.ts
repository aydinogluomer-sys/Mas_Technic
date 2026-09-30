import { MINIMUM_TOLERANCE } from "@/content/claims";
import { materialCategories, materialsData } from "@/data/materialsData";
import { CAD_ACCEPTED_EXTENSIONS, CAD_MAX_FILE_SIZE } from "@/utils/cadFiles";

/* ══════════════════════════════════════════════════════════════════════════
   RFQ MODEL — the choices the form offers and the record it sends

   WHY THIS FILE EXISTS (the first seam of the Phase 09 decomposition)

   `TeklifAl.tsx` was 1540 lines and mixed five unrelated concerns in one
   module scope: an option catalogue, a WebGL viewer, a validation routine, a
   network pipeline and four screens of markup. The seams chosen here are the
   ones the repository already uses elsewhere — data and non-React logic in
   plain `.ts` modules, React in `.tsx`, and the heavy optional subsystem
   behind its own dynamic boundary:

       rfq-model.ts        what may be asked and what is sent   (no React)
       rfq-schema.ts       what a valid answer is               (no React)
       useCadSelection.ts  choosing a file                      (no three)
       useRfqSubmission.ts talking to the backend               (no three)
       Rfq*Step.tsx        one screen each
       CadStageHost.tsx    the lazy boundary
       cad/CadStage.tsx    three / R3F / drei / STL / OBJ / OCCT — HERE ONLY

   THE RULE THE LAST SEAM ENCODES: nothing outside `cad/` may import `three`
   at value position. A single static `import * as THREE` anywhere else pulls
   858 kB back into the route chunk, which is exactly the defect Phase 09 is
   here to remove.

   ── TWO PUBLISHED LEAD-TIME BANDS ARE GONE ──────────────────────────────
   The delivery selector shipped "Standart · 10-12 Gün" and "Ekspres · 3-5
   Gün", and the review step and the live summary repeated them — four
   renderings of a production lead time that `USER_INPUTS.md` does not
   contain. §J supplies `QUOTE_SLA: 1-3 Days` and nothing else; there is no
   `PRODUCTION_LEAD_TIME` field at all. Phase 08 removed the same class of
   claim from the sidebar panel of this very page and left a note saying so
   (`src/pages/TeklifAl.tsx`, "This block published three production lead-time
   bands"), but the selector three hundred lines above it kept publishing two.
   The control now records what the buyer is ASKING for — normal or
   prioritised handling — and states the one true thing about the date: it
   comes with the quote.
   ══════════════════════════════════════════════════════════════════════════ */

export type Dimensions = { x: number; y: number; z: number };

/** The formats the CAD viewer can actually draw. The rest are accepted for
 *  quoting but have no preview, and the page says so rather than mounting an
 *  empty stage. */
export type CadPreviewKind = "stl" | "obj" | "step";

export function cadPreviewKind(extension: string): CadPreviewKind | null {
  if (extension === "stl") return "stl";
  if (extension === "obj") return "obj";
  if (extension === "step" || extension === "stp") return "step";
  return null;
}

/* ── Options ──────────────────────────────────────────────────────────── */

export type RfqOption = { id: string; label: string; detail?: string };

export const RFQ_SERVICES: readonly RfqOption[] = [
  { id: "cnc-mill", label: "CNC Frezeleme (3 & 5 eksen)" },
  { id: "cnc-turn", label: "CNC Tornalama" },
  { id: "edm", label: "Tel erozyon (EDM)" },
  { id: "grinding", label: "Taşlama" },
];

export const RFQ_SURFACE_FINISHES: readonly RfqOption[] = [
  { id: "machined", label: "İşlenmiş yüzey", detail: "Ra 3.2 µm" },
  { id: "bead", label: "Kumlama", detail: "Mat yüzey" },
  { id: "anodized", label: "Anodizasyon", detail: "Tip II / III" },
  { id: "powder", label: "Toz boya", detail: "Kaplama" },
];

/**
 * Priority, not a lead time. Neither option states a number of days, because
 * no supplied field authorises one; the date is set when the quote is written
 * and the sidebar says exactly that.
 */
export const RFQ_PRIORITIES: readonly RfqOption[] = [
  { id: "standard", label: "Standart", detail: "Termin teklifle birlikte verilir" },
  { id: "priority", label: "Öncelikli", detail: "Aciliyet notu teklife işlenir" },
];

/** The tightest entry is the ledger's published capability, not a second
 *  hand-written figure that could drift away from it. */
export const RFQ_TOLERANCES: readonly string[] = [
  MINIMUM_TOLERANCE,
  "±0.02 mm",
  "±0.05 mm",
  "Teknik resme göre",
];

export const RFQ_MATERIAL_OTHER = "other";

export const RFQ_MATERIAL_GROUPS = materialCategories.map((category) => ({
  category: category.name,
  items: materialsData
    .filter((material) => material.subcategory === category.subcategoryKey)
    .map((material) => ({ id: material.id, label: material.name })),
}));

/** The three screens of the request, and the order they are answered in. */
export type RfqStep = { no: string; label: string };

export const RFQ_STEPS: readonly RfqStep[] = [
  { no: "01", label: "CAD DOSYASI" },
  { no: "02", label: "ÖZELLİKLER" },
  { no: "03", label: "GÖNDER" },
];

export const RFQ_DEFAULTS = {
  service: RFQ_SERVICES[0].id,
  finish: RFQ_SURFACE_FINISHES[0].id,
  priority: RFQ_PRIORITIES[0].id,
  material: "al-6061-t6",
  tolerance: RFQ_TOLERANCES[0],
  quantity: 25,
} as const;

export function optionLabel(options: readonly RfqOption[], id: string): string {
  return options.find((option) => option.id === id)?.label ?? id;
}

export function resolveMaterialLabel(materialId: string, customMaterial: string): string {
  if (materialId === RFQ_MATERIAL_OTHER) return customMaterial.trim() || "Belirtilmedi";
  return materialsData.find((material) => material.id === materialId)?.name ?? materialId;
}

/* ── What the reader is told BEFORE choosing a file ───────────────────────
   Derived from `@/utils/cadUpload`'s constants, never re-typed: a second
   hand-written format list is how `.x_t` came to be advertised on the landing
   while the validator rejected it. */
export const CAD_MAX_FILE_SIZE_MB = Math.round(CAD_MAX_FILE_SIZE / (1024 * 1024));
export const CAD_FORMAT_COUNT = CAD_ACCEPTED_EXTENSIONS.length;

/** `0.00 MB` is not a file size: a small STL is genuinely a few kilobytes. */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/* ── The record that is sent ──────────────────────────────────────────── */

export type RfqDraft = {
  name: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  material: string;
  customMaterial: string;
  finish: string;
  priority: string;
  tolerance: string;
  quantity: number;
  drawingNumber: string;
  criticalFeatures: string;
};

export const EMPTY_RFQ_DRAFT: RfqDraft = {
  name: "",
  email: "",
  company: "",
  phone: "",
  service: RFQ_DEFAULTS.service,
  material: RFQ_DEFAULTS.material,
  customMaterial: "",
  finish: RFQ_DEFAULTS.finish,
  priority: RFQ_DEFAULTS.priority,
  tolerance: RFQ_DEFAULTS.tolerance,
  quantity: RFQ_DEFAULTS.quantity,
  drawingNumber: "",
  criticalFeatures: "",
};

/**
 * The free-text `notes` column the edge function writes.
 *
 * `docs/supabase-full-setup.sql:347` constrains it to 2000 characters, and a
 * violation surfaces to the reader as a bare 500. The schema's per-field caps
 * (`rfq-schema.ts`) are sized so the joined string cannot reach it — that is
 * what those numbers are for, not arbitrary tidiness.
 */
export function buildRfqNotes(draft: RfqDraft): string {
  return [
    `Yüzey: ${optionLabel(RFQ_SURFACE_FINISHES, draft.finish)}`,
    `Öncelik: ${optionLabel(RFQ_PRIORITIES, draft.priority)}`,
    `Tolerans: ${draft.tolerance}`,
    `Parça/Revizyon: ${draft.drawingNumber.trim() || "Belirtilmedi"}`,
    `Kritik ölçüler: ${draft.criticalFeatures.trim() || "Belirtilmedi"}`,
  ].join(" | ");
}

/**
 * THE REQUEST REFERENCE, AND WHY IT IS NOT AN INVENTED CONFIRMATION NUMBER.
 *
 * `rfqs.id` is a client-supplied primary key: this string is what
 * `supabase/functions/rfq-rate-limit/index.ts` inserts, what it returns in
 * `{ rfq: … }` on 201, what the admin register prints as the row's identity
 * (`src/components/admin/RFQManager.tsx:426`) and what staff quote back to the
 * customer (`:151`, "… numaralı teklifiniz"). The success screen therefore
 * shows a value the system already stores and already uses — never one this
 * page made up — and it shows the value the SERVER echoed, not the one the
 * browser generated, so a reference is only ever displayed for a row that
 * actually exists.
 *
 * THE OLD GENERATOR WAS NOT STABLE. It was
 * `RFQ-${year}-${Math.floor(1000 + Math.random() * 9000)}`: 9000 values per
 * year against a PRIMARY KEY, so by the birthday bound two requests collide
 * with probability ½ after about 112 submissions in a year, and the loser gets
 * a 500 and no quote. The shape is unchanged — the admin surface already
 * handles free-form ids (`QuickActionModals.tsx:126` writes a base-36 one) —
 * but the tail is now a base-36 millisecond stamp plus two random characters,
 * so a collision needs the same millisecond and the same 1-in-1296 salt.
 */
export function createRfqReference(now: Date = new Date()): string {
  const stamp = now.getTime().toString(36).toUpperCase().slice(-6);
  const alphabet = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let salt = "";
  const bytes = new Uint8Array(2);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    bytes[0] = Math.floor(Math.random() * 256);
    bytes[1] = Math.floor(Math.random() * 256);
  }
  for (const byte of bytes) salt += alphabet[byte % alphabet.length];
  return `RFQ-${now.getFullYear()}-${stamp}${salt}`;
}
