/**
 * The acceptance list of rfq-backend-contract.md §4, run against the two
 * functions in ../supabase/functions with an in-memory Supabase
 * (fake-supabase.ts). PASS_LOCAL only: storage, Postgres and RLS are
 * modelled, not real. Staging must still run the same list for real.
 *
 *   npx deno test --allow-env --import-map=import_map.json rfq.test.ts
 */
import { state } from "./fake-supabase.ts";

Deno.env.set("SUPABASE_URL", "https://fake.supabase.co");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "service");
// The functions call Deno.serve(handle) at import; the tests call handle().
Object.defineProperty(Deno, "serve", { value: () => ({ finished: Promise.resolve() }), configurable: true });

const { handle: submit } = await import("../supabase/functions/rfq-rate-limit/index.ts");
const { handle: signedUrl } = await import("../supabase/functions/rfq-attachment-url/index.ts");

// Signed URLs from the fake resolve to the stored bytes; a Range read of the
// PDF signature gets the first bytes.
globalThis.fetch = (async (input: string | URL) => {
  const path = String(input).replace("fake://", "");
  const obj = state.objects.get(path);
  return new Response(obj ? obj.bytes.slice(0, 5) : new Uint8Array(), { status: obj ? 206 : 404 });
}) as typeof fetch;

const MB = 1024 * 1024;
const PDF = new TextEncoder().encode("%PDF-1.7 rest");
const NOT_PDF = new TextEncoder().encode("PK\x03\x04zip");
let counter = 0;

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

function reset() {
  state.rfqs.clear(); state.objects.clear(); state.hits.clear(); state.users.clear(); state.staff.clear();
}

function put(path: string, size: number, bytes: Uint8Array = PDF) {
  state.objects.set(path, { size, bytes });
}

function newId() { counter += 1; return `RFQ-2026-TEST${String(counter).padStart(4, "0")}`; }

type Att = { kind: "model" | "drawing"; originalName: string; storagePath: string; sizeBytes: number; mediaType: string; sha256: null; revisionLabel: string | null };
const att = (id: string, kind: "model" | "drawing", n: number, name: string, size: number, owner = "anonymous"): Att => ({
  kind, originalName: name, storagePath: `${owner}/${id}/${kind}-${n}-${name.replace(/[^\w.-]+/g, "-")}`,
  sizeBytes: size, mediaType: kind === "drawing" ? "application/pdf" : "application/octet-stream", sha256: null, revisionLabel: null,
});

async function post(body: unknown, { ip = "10.0.0.1", token }: { ip?: string; token?: string } = {}) {
  const headers: Record<string, string> = { "content-type": "application/json", "x-forwarded-for": ip };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await submit(new Request("http://fn/", { method: "POST", headers, body: typeof body === "string" ? body : JSON.stringify(body) }));
  return { status: res.status, body: await res.json(), headers: res.headers };
}

const base = (id: string, attachments: Att[]) => ({
  id, customer: "Ayşe Yılmaz", company: "Örnek Mühendislik", email: "ayse@example.com", phone: null,
  service: null, material: null, quantity: 10, notes: "Not",
  files: attachments.map((a) => a.storagePath), attachments,
});

function upload(attachments: Att[], sizes?: number[], bytes?: Uint8Array[]) {
  attachments.forEach((a, i) => put(a.storagePath, sizes?.[i] ?? a.sizeBytes, bytes?.[i] ?? (a.kind === "drawing" ? PDF : new Uint8Array([1]))));
}

Deno.test("model-only → 201, one row", async () => {
  reset(); const id = newId(); const a = [att(id, "model", 1, "govde.step", 2 * MB)]; upload(a);
  const r = await post(base(id, a));
  assert(r.status === 201, `status ${r.status} ${JSON.stringify(r.body)}`);
  assert(state.rfqs.size === 1, "one row");
});

Deno.test("PDF-only → 201", async () => {
  reset(); const id = newId(); const a = [att(id, "drawing", 1, "resim.pdf", MB)]; upload(a);
  const r = await post(base(id, a)); assert(r.status === 201, `status ${r.status} ${JSON.stringify(r.body)}`);
});

Deno.test("model + 3 PDF → 201, attachments stored with measured sizes", async () => {
  reset(); const id = newId();
  const a = [att(id, "model", 1, "govde.step", 10 * MB), att(id, "drawing", 1, "a.pdf", MB), att(id, "drawing", 2, "b.pdf", MB), att(id, "drawing", 3, "c.pdf", MB)];
  upload(a); const r = await post(base(id, a));
  assert(r.status === 201, `status ${r.status} ${JSON.stringify(r.body)}`);
  const row = state.rfqs.get(id)!; assert((row.attachments as unknown[]).length === 4, "4 attachments");
  assert(r.body.email === "not_configured", "notification outcome reported, not claimed");
});

Deno.test("2 models → 400", async () => {
  reset(); const id = newId(); const a = [att(id, "model", 1, "a.step", MB), att(id, "model", 2, "b.step", MB)]; upload(a);
  const r = await post(base(id, a)); assert(r.status === 400, `status ${r.status}`); assert(state.rfqs.size === 0, "no row");
});

Deno.test("4 PDFs → 400", async () => {
  reset(); const id = newId(); const a = [1, 2, 3, 4].map((n) => att(id, "drawing", n, `${n}.pdf`, MB)); upload(a);
  const r = await post(base(id, a)); assert(r.status === 400, `status ${r.status}`);
});

Deno.test("no file → 400", async () => {
  reset(); const id = newId(); const r = await post(base(id, []));
  assert(r.status === 400, `status ${r.status}`);
});

Deno.test("51 MB file → 413 (size measured from storage, not the body)", async () => {
  reset(); const id = newId(); const a = [att(id, "model", 1, "big.step", 1 * MB)];
  upload(a, [51 * MB]);
  a[0].sizeBytes = 51 * MB;
  const r = await post(base(id, a)); assert(r.status === 413, `status ${r.status} ${JSON.stringify(r.body)}`);
});

Deno.test("total 101 MB → 413", async () => {
  reset(); const id = newId();
  const a = [att(id, "model", 1, "m.step", 50 * MB), att(id, "drawing", 1, "a.pdf", 17 * MB), att(id, "drawing", 2, "b.pdf", 17 * MB), att(id, "drawing", 3, "c.pdf", 17 * MB)];
  upload(a); const r = await post(base(id, a)); assert(r.status === 413, `status ${r.status}`);
});

Deno.test("declared size that does not match the upload → 400", async () => {
  reset(); const id = newId(); const a = [att(id, "model", 1, "m.step", 2 * MB)]; upload(a, [3 * MB]);
  const r = await post(base(id, a)); assert(r.status === 400, `status ${r.status}`);
});

Deno.test("a .pdf that is not a PDF → 400", async () => {
  reset(); const id = newId(); const a = [att(id, "drawing", 1, "fake.pdf", MB)]; upload(a, undefined, [NOT_PDF]);
  const r = await post(base(id, a)); assert(r.status === 400, `status ${r.status}`); assert(/PDF/.test(r.body.error), r.body.error);
});

Deno.test("a file that was never uploaded → 400", async () => {
  reset(); const id = newId(); const a = [att(id, "model", 1, "m.step", MB)];
  const r = await post(base(id, a)); assert(r.status === 400, `status ${r.status}`);
});

Deno.test("Unicode file name kept as the original name", async () => {
  reset(); const id = newId(); const a = [att(id, "model", 1, "Gövde Ön Rev B.step", MB)]; upload(a);
  const r = await post(base(id, a)); assert(r.status === 201, `status ${r.status}`);
  const stored = (state.rfqs.get(id)!.attachments as { originalName: string }[])[0].originalName;
  assert(stored === "Gövde Ön Rev B.step", stored);
});

Deno.test("same id twice (answer lost) → second 201 replayed, still one row", async () => {
  reset(); const id = newId(); const a = [att(id, "model", 1, "m.step", MB)]; upload(a);
  const first = await post(base(id, a)); const second = await post(base(id, a));
  assert(first.status === 201 && second.status === 201, `${first.status}/${second.status}`);
  assert(second.body.replayed === true, "replayed flag"); assert(state.rfqs.size === 1, "one row");
});

Deno.test("same id with a different payload → 409", async () => {
  reset(); const id = newId(); const a = [att(id, "model", 1, "m.step", MB)]; upload(a);
  await post(base(id, a));
  const other = { ...base(id, a), email: "baska@example.com" };
  const r = await post(other); assert(r.status === 409, `status ${r.status}`);
});

Deno.test("another request's path → 400 (ownership)", async () => {
  reset(); const id = newId(); const victim = newId();
  const a = [{ ...att(victim, "model", 1, "secret.step", MB) }]; upload(a);
  const r = await post(base(id, a)); assert(r.status === 400, `status ${r.status}`); assert(state.rfqs.size === 0, "no row");
});

Deno.test("signed-in user: paths must live under their own id", async () => {
  reset(); state.users.set("tok-u1", "u1"); const id = newId();
  const mine = [att(id, "model", 1, "m.step", MB, "u1")]; upload(mine);
  const ok = await post(base(id, mine), { token: "tok-u1" }); assert(ok.status === 201, `status ${ok.status}`);
  assert(state.rfqs.get(id)!.user_id === "u1", "owner from JWT");
  const id2 = newId(); const anon = [att(id2, "model", 1, "m.step", MB)]; upload(anon);
  const bad = await post(base(id2, anon), { token: "tok-u1" }); assert(bad.status === 400, `status ${bad.status}`);
});

Deno.test("files that disagree with attachments → 400", async () => {
  reset(); const id = newId(); const a = [att(id, "model", 1, "m.step", MB)]; upload(a);
  const r = await post({ ...base(id, a), files: [`anonymous/${id}/other.step`] }); assert(r.status === 400, `status ${r.status}`);
});

Deno.test("legacy single-model request (files only) → 201", async () => {
  reset(); const id = newId(); const path = `anonymous/${id}/govde.step`; put(path, MB, new Uint8Array([1]));
  const { attachments: _drop, ...legacy } = base(id, []);
  const r = await post({ ...legacy, files: [path] }); assert(r.status === 201, `status ${r.status} ${JSON.stringify(r.body)}`);
});

Deno.test("6th request in a minute from one IP → 429 with Retry-After", async () => {
  reset(); let last = 0; let header: string | null = null;
  for (let i = 0; i < 6; i += 1) {
    const id = newId(); const a = [att(id, "model", 1, "m.step", MB)]; upload(a);
    const r = await post(base(id, a), { ip: "10.9.9.9" }); last = r.status; header = r.headers.get("retry-after");
  }
  assert(last === 429, `status ${last}`); assert(header === "42", `Retry-After ${header}`);
});

Deno.test("unreadable body → 400, never 500", async () => {
  reset(); const r = await post("{not json"); assert(r.status === 400, `status ${r.status}`);
});

/* ── rfq-attachment-url ─────────────────────────────────────────────── */
async function sign(body: unknown, token?: string) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await signedUrl(new Request("http://fn/", { method: "POST", headers, body: JSON.stringify(body) }));
  return { status: res.status, body: await res.json() };
}

Deno.test("signed URL: owner 200, other customer 403, staff 200, foreign path 404, no session 401", async () => {
  reset();
  state.users.set("tok-owner", "owner"); state.users.set("tok-other", "other"); state.users.set("tok-staff", "staff"); state.staff.add("staff");
  const id = newId(); const path = `owner/${id}/model-1-m.step`;
  state.rfqs.set(id, { id, user_id: "owner", files: [path], attachments: [{ storagePath: path }] });
  assert((await sign({ rfqId: id, storagePath: path }, "tok-owner")).status === 200, "owner");
  assert((await sign({ rfqId: id, storagePath: path }, "tok-other")).status === 403, "other");
  assert((await sign({ rfqId: id, storagePath: path }, "tok-staff")).status === 200, "staff");
  assert((await sign({ rfqId: id, storagePath: "owner/x/secret.step" }, "tok-staff")).status === 404, "foreign path");
  assert((await sign({ rfqId: id, storagePath: path })).status === 401, "no session");
});
