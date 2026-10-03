import { CAD_ACCEPTED_EXTENSIONS, CAD_MAX_FILE_SIZE, getCadFileExtension } from "@/utils/cadFiles";

/* ══════════════════════════════════════════════════════════════════════════
   RFQ ATTACHMENT CONTRACT (RFQ01)

   One request may carry a 3D model, PDF technical drawings, or both:

       at most 1 model   (the seven extensions the CAD path already accepts)
       at most 3 PDFs    (a separate validator: extension AND `%PDF-` magic)
       50 MB per file, 100 MB per request, at least one file

   Each attachment travels as metadata the server is meant to re-check rather
   than trust: `kind`, `originalName`, `storagePath`, `sizeBytes`, `mediaType`,
   `sha256`, `revisionLabel`. DWG/DXF are out of scope this round. A PDF never
   reaches the 3D parser and gets no in-browser preview.

   ── WHY IT IS BEHIND A FLAG ─────────────────────────────────────────────
   The deployed edge function (`supabase/functions/rfq-rate-limit/index.ts`,
   read-only here) accepts `files: string[]` and rejects any path whose
   extension is not one of the seven CAD extensions — a PDF path is a 400. It
   also knows nothing of `attachments`, does not check that a path belongs to
   the request, and answers a repeated id with a duplicate-key 500. The
   contract says multiple attachments are NOT activated frontend-only without
   a real migration / edge change, so `RFQ_ATTACHMENTS_ENABLED` is false in
   every normal build. `VITE_RFQ_ATTACHMENTS=on` exists for the staging build
   that the backend change will be verified against, and for the e2e build
   that exercises this UI with the network mocked. The server half of the
   contract is written out in
   `docs/quality/mas-technic-awwwards/rfq-backend-contract.md` (BLOCKED_DATA:
   backend-contract, O06).
   ══════════════════════════════════════════════════════════════════════════ */

/* Written so Vite can fold it to a constant (`import.meta.env.VITE_*` is
   replaced at build time) and drop the multi-attachment UI from a normal
   build, while the pure e2e contract — which imports this module under Node,
   where `import.meta.env` does not exist — still reads `false`. */
export const RFQ_ATTACHMENTS_ENABLED =
  typeof import.meta.env !== "undefined" && import.meta.env.VITE_RFQ_ATTACHMENTS === "on";

export type AttachmentKind = "model" | "drawing";

export const RFQ_ATTACHMENT_LIMITS = {
  maxModels: 1,
  maxDrawings: 3,
  maxFileBytes: CAD_MAX_FILE_SIZE,
  maxTotalBytes: 100 * 1024 * 1024,
  minFiles: 1,
} as const;

export const MODEL_EXTENSIONS: readonly string[] = CAD_ACCEPTED_EXTENSIONS;
export const DRAWING_EXTENSIONS: readonly string[] = ["pdf"];

/** What the server is sent for each file. */
export type RfqAttachmentMeta = {
  kind: AttachmentKind;
  originalName: string;
  storagePath: string;
  sizeBytes: number;
  mediaType: string;
  sha256: string;
  revisionLabel: string | null;
};

/** A chosen file before upload. */
export type PendingAttachment = {
  /** Stable key for React and for the upload cache. */
  key: string;
  kind: AttachmentKind;
  file: File;
  revisionLabel: string;
};

export type AttachmentProblem = {
  code:
    | "none"
    | "too-many-models"
    | "too-many-drawings"
    | "file-too-large"
    | "total-too-large"
    | "wrong-extension"
    | "not-a-pdf"
    | "empty-file"
    | "revision-unacknowledged";
  /** Translation key; doubles as the Turkish sentence. */
  message: string;
  vars?: Record<string, string>;
  /** Which file, when the problem belongs to one. */
  key?: string;
};

/** Which slot a file belongs to, or null when neither validator accepts it. */
export function attachmentKindFor(name: string): AttachmentKind | null {
  const extension = getCadFileExtension(name);
  if (MODEL_EXTENSIONS.includes(extension)) return "model";
  if (DRAWING_EXTENSIONS.includes(extension)) return "drawing";
  return null;
}

/** Reads the first five bytes. A file named `.pdf` that is not one is refused. */
export async function looksLikePdf(file: Blob): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return String.fromCharCode(...head) === "%PDF-";
}

/** Hex SHA-256 of the file's bytes, computed in the browser before upload. */
export async function sha256Hex(file: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

const trimmed = (value: string) => value.trim();

/**
 * True when a model and a drawing both carry a revision label and the labels
 * differ. Equality is never assumed: an empty label is "unknown", not "same".
 */
export function revisionsDiffer(items: readonly PendingAttachment[]): boolean {
  const labels = new Set(items.map((item) => trimmed(item.revisionLabel)).filter(Boolean));
  const kinds = new Set(items.filter((item) => trimmed(item.revisionLabel)).map((item) => item.kind));
  return labels.size > 1 && kinds.has("model") && kinds.has("drawing");
}

export const REVISION_ACK_LABEL = "Revizyon farkını teknik inceleme için belirtiyorum.";

/**
 * Synchronous rules: counts, sizes, extensions, the revision acknowledgement.
 * The PDF magic check is asynchronous and runs when a file is chosen
 * (`looksLikePdf`); its result arrives here as `notPdf`.
 */
export function validateAttachments(
  items: readonly PendingAttachment[],
  options: { revisionAcknowledged: boolean; notPdf?: ReadonlySet<string> } = { revisionAcknowledged: false },
): AttachmentProblem[] {
  const problems: AttachmentProblem[] = [];
  const { maxModels, maxDrawings, maxFileBytes, maxTotalBytes, minFiles } = RFQ_ATTACHMENT_LIMITS;

  if (items.length < minFiles) {
    problems.push({ code: "none", message: "Önce bir dosya ekleyin: 3B model, PDF teknik resim veya ikisi birlikte." });
  }
  if (items.filter((item) => item.kind === "model").length > maxModels) {
    problems.push({ code: "too-many-models", message: "En fazla {{count}} 3B model eklenebilir.", vars: { count: String(maxModels) } });
  }
  if (items.filter((item) => item.kind === "drawing").length > maxDrawings) {
    problems.push({ code: "too-many-drawings", message: "En fazla {{count}} PDF teknik resim eklenebilir.", vars: { count: String(maxDrawings) } });
  }
  let total = 0;
  for (const item of items) {
    total += item.file.size;
    if (attachmentKindFor(item.file.name) !== item.kind) {
      problems.push({ code: "wrong-extension", key: item.key, message: "“{{name}}” bu alan için kabul edilen bir format değil.", vars: { name: item.file.name } });
    }
    if (item.file.size === 0) {
      problems.push({ code: "empty-file", key: item.key, message: "“{{name}}” boş bir dosya.", vars: { name: item.file.name } });
    }
    if (item.file.size > maxFileBytes) {
      problems.push({ code: "file-too-large", key: item.key, message: "“{{name}}” {{size}} MB sınırını aşıyor.", vars: { name: item.file.name, size: String(maxFileBytes / 1024 / 1024) } });
    }
    if (item.kind === "drawing" && options.notPdf?.has(item.key)) {
      problems.push({ code: "not-a-pdf", key: item.key, message: "“{{name}}” bir PDF dosyası değil.", vars: { name: item.file.name } });
    }
  }
  if (total > maxTotalBytes) {
    problems.push({ code: "total-too-large", message: "Dosyaların toplamı {{size}} MB sınırını aşıyor.", vars: { size: String(maxTotalBytes / 1024 / 1024) } });
  }
  if (revisionsDiffer(items) && !options.revisionAcknowledged) {
    problems.push({ code: "revision-unacknowledged", message: "Model ve resim revizyonları farklı. Devam etmek için farkı belirttiğinizi onaylayın." });
  }
  return problems;
}

/** Storage-safe object name; the original (Unicode) name travels in metadata. */
export function storageSafeName(name: string): string {
  const extension = getCadFileExtension(name);
  const base = name.slice(0, name.length - extension.length - 1)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "file";
  return `${base.slice(0, 80)}.${extension}`;
}

export function attachmentStoragePath(item: PendingAttachment, reference: string, userId: string | null, index: number): string {
  return `${userId || "anonymous"}/${reference}/${item.kind}-${index + 1}-${storageSafeName(item.file.name)}`;
}

export function mediaTypeFor(item: PendingAttachment): string {
  if (item.kind === "drawing") return "application/pdf";
  return item.file.type || "application/octet-stream";
}
