/**
 * rfq-rate-limit — the public RFQ endpoint, implementing
 * docs/quality/mas-technic-awwwards/rfq-backend-contract.md (RFQ01–03).
 *
 * NOT DEPLOYED. Prepared as a drop-in replacement for
 * supabase/functions/rfq-rate-limit/index.ts; needs the migration next to it
 * (20261003120000_rfq_attachments_and_limits.sql) and staging verification
 * before production (README.md in this folder).
 *
 * What changes against the deployed function:
 *   · attachments: up to 1 model + 3 PDF drawings, at least 1 file; `files`
 *     is derived from them (old single-file requests still accepted)
 *   · the server measures: object size from storage (50 MB / 100 MB), the
 *     PDF signature of every drawing; the client's numbers are not trusted
 *   · ownership: every path must start with `<owner>/<id>/`, owner = the
 *     JWT user or `anonymous` — no request can claim another request's file
 *   · idempotency: the request id is the key. A retry with the same id and
 *     the same e-mail + files returns the existing row (201, `replayed`);
 *     the same id with a different payload is 409. No more duplicate-key 500.
 *   · rate limit: shared by every isolate (rfq_rate_limit_hit), 5/min per IP
 *   · notification outcome is reported (`email`), never claimed
 * Unchanged: the owner comes from the JWT, never from the body.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BUCKET = "cad-uploads";
const MODEL_EXTENSIONS = ["step", "stp", "stl", "obj", "iges", "igs", "3mf"];
const DRAWING_EXTENSIONS = ["pdf"];
const MAX_MODELS = 1;
const MAX_DRAWINGS = 3;
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_TOTAL_BYTES = 100 * 1024 * 1024;
const RATE_WINDOW_SECONDS = 60;
const RATE_MAX = 5;
const ID_PATTERN = /^RFQ-[A-Za-z0-9-]{4,40}$/;

type Kind = "model" | "drawing";
type Attachment = {
  kind: Kind;
  originalName: string;
  storagePath: string;
  sizeBytes: number;
  mediaType: string;
  sha256: string | null;
  revisionLabel: string | null;
};

class HttpError extends Error {
  constructor(readonly status: number, message: string, readonly headers: Record<string, string> = {}) {
    super(message);
  }
}

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", ...headers } });

const extensionOf = (path: string) => path.split(".").pop()?.toLowerCase() ?? "";
const baseName = (path: string) => path.slice(path.lastIndexOf("/") + 1);

function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && email.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function text(value: unknown, field: string, min: number, max: number): string {
  if (typeof value !== "string" || value.trim().length < min || value.length > max) {
    throw new HttpError(400, `${field} alanı geçersiz.`);
  }
  return value.trim();
}

function optionalText(value: unknown, max: number): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length > max) throw new HttpError(400, "Form alanlarından biri geçersiz.");
  return value.trim();
}

function parseAttachments(raw: unknown, prefix: string): Attachment[] {
  if (!Array.isArray(raw)) throw new HttpError(400, "Ek listesi geçersiz.");
  const items = raw.map((item): Attachment => {
    if (!item || typeof item !== "object") throw new HttpError(400, "Ek bilgisi geçersiz.");
    const a = item as Record<string, unknown>;
    const kind = a.kind;
    if (kind !== "model" && kind !== "drawing") throw new HttpError(400, "Ek türü geçersiz.");
    const storagePath = typeof a.storagePath === "string" ? a.storagePath : "";
    if (!storagePath.startsWith(prefix) || storagePath.length > 512 || storagePath.includes("..")) {
      throw new HttpError(400, "Dosya bu talebe ait değil.");
    }
    const allowed = kind === "model" ? MODEL_EXTENSIONS : DRAWING_EXTENSIONS;
    if (!allowed.includes(extensionOf(storagePath))) throw new HttpError(400, "Dosya biçimi bu ek türü için desteklenmiyor.");
    const originalName = typeof a.originalName === "string" && a.originalName.length > 0 && a.originalName.length <= 255
      ? a.originalName : null;
    if (!originalName) throw new HttpError(400, "Dosya adı geçersiz.");
    const sizeBytes = Number(a.sizeBytes);
    if (!Number.isFinite(sizeBytes) || sizeBytes < 0) throw new HttpError(400, "Dosya boyutu geçersiz.");
    const sha256 = typeof a.sha256 === "string" && /^[0-9a-f]{64}$/.test(a.sha256) ? a.sha256 : null;
    const revisionLabel = typeof a.revisionLabel === "string" && a.revisionLabel.length <= 40 ? a.revisionLabel : null;
    const mediaType = typeof a.mediaType === "string" && a.mediaType.length <= 120 ? a.mediaType : "application/octet-stream";
    return { kind, originalName, storagePath, sizeBytes, mediaType, sha256, revisionLabel };
  });
  const models = items.filter((item) => item.kind === "model").length;
  const drawings = items.length - models;
  if (items.length < 1) throw new HttpError(400, "En az bir dosya gerekli.");
  if (models > MAX_MODELS) throw new HttpError(400, "En fazla bir model dosyası eklenebilir.");
  if (drawings > MAX_DRAWINGS) throw new HttpError(400, "En fazla üç PDF teknik resim eklenebilir.");
  if (new Set(items.map((item) => item.storagePath)).size !== items.length) throw new HttpError(400, "Aynı dosya iki kez eklenmiş.");
  return items;
}

/** Old single-model requests: `files` only, CAD extensions, same ownership rule. */
function legacyAttachments(files: unknown, prefix: string): Attachment[] {
  if (!Array.isArray(files) || files.length < 1 || files.length > MAX_MODELS) throw new HttpError(400, "CAD dosyası gerekli.");
  return files.map((path) => {
    if (typeof path !== "string" || !path.startsWith(prefix) || path.includes("..") || !MODEL_EXTENSIONS.includes(extensionOf(path))) {
      throw new HttpError(400, "CAD dosyası formatı geçersiz.");
    }
    return { kind: "model", originalName: baseName(path), storagePath: path, sizeBytes: -1, mediaType: "application/octet-stream", sha256: null, revisionLabel: null };
  });
}

type Storage = ReturnType<typeof createClient>["storage"];

/** Sizes from storage, PDF signatures from the bytes — never from the body. */
async function verifyObjects(storage: Storage, prefix: string, items: Attachment[]): Promise<Attachment[]> {
  const folder = prefix.replace(/\/$/, "");
  const { data: listed, error } = await storage.from(BUCKET).list(folder, { limit: 100 });
  if (error) throw new HttpError(500, "Dosyalar doğrulanamadı.");
  const sizes = new Map((listed ?? []).map((object) => [object.name, Number((object.metadata as { size?: number } | null)?.size ?? -1)]));
  let total = 0;
  const verified: Attachment[] = [];
  for (const item of items) {
    const size = sizes.get(baseName(item.storagePath));
    if (size === undefined || size < 0) throw new HttpError(400, `${item.originalName}: dosya yüklenmemiş görünüyor.`);
    if (size > MAX_FILE_BYTES) throw new HttpError(413, `${item.originalName}: dosya 50 MB sınırını aşıyor.`);
    if (item.sizeBytes >= 0 && item.sizeBytes !== size) throw new HttpError(400, `${item.originalName}: bildirilen boyut yüklenen dosyayla uyuşmuyor.`);
    total += size;
    if (item.kind === "drawing") {
      const { data: signed, error: signError } = await storage.from(BUCKET).createSignedUrl(item.storagePath, 60);
      if (signError || !signed?.signedUrl) throw new HttpError(500, "Dosyalar doğrulanamadı.");
      const head = await fetch(signed.signedUrl, { headers: { Range: "bytes=0-4" } });
      const magic = new TextDecoder().decode(new Uint8Array(await head.arrayBuffer()).slice(0, 5));
      if (magic !== "%PDF-") throw new HttpError(400, `${item.originalName}: dosya bir PDF değil.`);
    }
    verified.push({ ...item, sizeBytes: size });
  }
  if (total > MAX_TOTAL_BYTES) throw new HttpError(413, "Dosyaların toplamı 100 MB sınırını aşıyor.");
  return verified;
}

const sameFiles = (a: unknown, b: string[]) =>
  Array.isArray(a) && a.length === b.length && [...a].sort().join("\n") === [...b].sort().join("\n");

export async function handle(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Yalnız POST." });

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const { data: limit, error: limitError } = await db.rpc("rfq_rate_limit_hit", {
      p_key: `ip:${ip}`, p_window_seconds: RATE_WINDOW_SECONDS, p_max: RATE_MAX,
    });
    if (limitError) throw new HttpError(500, "Sunucu hatası.");
    const verdict = Array.isArray(limit) ? limit[0] : limit;
    if (verdict && verdict.allowed === false) {
      const retryAfter = Number(verdict.retry_after) || RATE_WINDOW_SECONDS;
      return json(429, { error: "Çok fazla talep gönderildi. Lütfen biraz sonra tekrar deneyin.", retry_after: retryAfter }, { "Retry-After": String(retryAfter) });
    }

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch { throw new HttpError(400, "İstek okunamadı."); }

    const id = typeof body.id === "string" && ID_PATTERN.test(body.id) ? body.id : null;
    if (!id) throw new HttpError(400, "Geçersiz talep: id zorunludur.");
    if (!isValidEmail(body.email)) throw new HttpError(400, "Geçerli bir e-posta adresi zorunludur.");
    const email = (body.email as string).trim();
    const customer = text(body.customer, "Ad soyad", 2, 120);
    const company = text(body.company, "Firma adı", 2, 160);
    const phone = optionalText(body.phone, 40);
    const service = optionalText(body.service, 120);
    const material = optionalText(body.material, 120);
    const notes = optionalText(body.notes, 4000);
    const quantity = body.quantity === undefined || body.quantity === null || body.quantity === ""
      ? null
      : Number.isInteger(Number(body.quantity)) && Number(body.quantity) > 0 && Number(body.quantity) <= 1_000_000
        ? Number(body.quantity)
        : (() => { throw new HttpError(400, "Adet geçersiz."); })();

    let user_id: string | null = null;
    const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (bearer) {
      const { data: auth } = await db.auth.getUser(bearer);
      user_id = auth?.user?.id ?? null;
    }
    const prefix = `${user_id ?? "anonymous"}/${id}/`;

    const declared = body.attachments !== undefined && body.attachments !== null
      ? parseAttachments(body.attachments, prefix)
      : legacyAttachments(body.files, prefix);
    const files = declared.map((item) => item.storagePath);
    if (body.attachments && body.files !== undefined && !sameFiles(body.files, files)) {
      throw new HttpError(400, "Dosya listesi eklerle uyuşmuyor.");
    }
    const attachments = await verifyObjects(db.storage, prefix, declared);

    const row = {
      id, customer, company, email, phone, service, material, quantity, notes,
      files,
      attachments: attachments.map((item) => ({ ...item, sha256Source: item.sha256 ? "client" : null })),
      user_id,
      date: new Date().toISOString().split("T")[0],
      status: "Yeni",
      email_status: "not_configured",
    };

    const { data: inserted, error: insertError } = await db.from("rfqs")
      .upsert(row, { onConflict: "id", ignoreDuplicates: true })
      .select();
    if (insertError) {
      console.error("RFQ insert error:", insertError.code ?? "unknown");
      throw new HttpError(500, "Talep oluşturulamadı.");
    }
    if (Array.isArray(inserted) && inserted.length === 1) {
      return json(201, { success: true, rfq: inserted[0], email: row.email_status });
    }
    // The id exists: the same request whose answer was lost, or a collision.
    const { data: existing, error: readError } = await db.from("rfqs").select("*").eq("id", id).maybeSingle();
    if (readError || !existing) throw new HttpError(500, "Talep oluşturulamadı.");
    if (existing.email === email && sameFiles(existing.files, files)) {
      return json(201, { success: true, rfq: existing, replayed: true, email: existing.email_status ?? "not_configured" });
    }
    return json(409, { error: "Bu talep numarası farklı bir talepte kullanılmış. Lütfen formu yeniden gönderin." });
  } catch (error) {
    if (error instanceof HttpError) return json(error.status, { error: error.message }, error.headers);
    console.error("RFQ function error:", error instanceof Error ? error.name : "unknown");
    return json(500, { error: "Sunucu hatası." });
  }
}

Deno.serve(handle);
