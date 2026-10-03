import { createHash } from "node:crypto";
import { expect, test, type Page, type Route } from "@playwright/test";
import { gotoAndSettle } from "./helpers";
import {
  RFQ_ATTACHMENTS_ENABLED,
  attachmentKindFor,
  looksLikePdf,
  revisionsDiffer,
  sha256Hex,
  storageSafeName,
  validateAttachments,
  type PendingAttachment,
} from "../src/components/rfq/rfq-attachments";

/* Package 6 — RFQ01 attachment contract, RFQ02 client retry behaviour, RFQ03
   request screen. Every network call to storage or the edge function is
   answered INSIDE the browser (`route.fulfill` / `route.abort`); nothing
   reaches a backend, so nothing is written.

   The multi-attachment UI exists only in a build with
   `VITE_RFQ_ATTACHMENTS=on`. Its block runs when `P6_ATTACHMENTS_URL` points
   at such a build (see status.md, package 6) and is skipped otherwise. */

const MB = 1024 * 1024;
const PDF_BYTES = Buffer.from("%PDF-1.7\n%test\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n");
const STL = Buffer.from("solid t\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid t\n");

/** A file-shaped object for size rules, without allocating the bytes. */
const fake = (name: string, size: number): File => ({ name, size, type: "" }) as unknown as File;
let seq = 0;
const item = (kind: "model" | "drawing", name: string, size = 1000, revisionLabel = ""): PendingAttachment =>
  ({ key: `k${(seq += 1)}`, kind, file: fake(name, size), revisionLabel });
const codes = (items: PendingAttachment[], ack = false, notPdf?: Set<string>) =>
  validateAttachments(items, { revisionAcknowledged: ack, notPdf }).map((problem) => problem.code);

test.describe("RFQ01 attachment contract (pure)", () => {
  test.skip(({ browserName }) => browserName !== "chromium" || test.info().project.name !== "desktop-1280", "data-only checks run in desktop-1280");

  test("the flag is off unless a build sets VITE_RFQ_ATTACHMENTS=on", () => {
    expect(RFQ_ATTACHMENTS_ENABLED).toBe(false);
  });

  test("model-only, PDF-only and combined requests are valid; none is not", () => {
    expect(codes([item("model", "a.step")])).toEqual([]);
    expect(codes([item("drawing", "a.pdf")])).toEqual([]);
    expect(codes([item("model", "a.stp"), item("drawing", "a.pdf"), item("drawing", "b.pdf"), item("drawing", "c.pdf")])).toEqual([]);
    expect(codes([])).toEqual(["none"]);
  });

  test("count, per-file and total limits", () => {
    expect(codes([item("model", "a.step"), item("model", "b.stl")])).toContain("too-many-models");
    expect(codes(["a", "b", "c", "d"].map((n) => item("drawing", `${n}.pdf`)))).toContain("too-many-drawings");
    expect(codes([item("model", "big.step", 50 * MB + 1)])).toContain("file-too-large");
    expect(codes([item("model", "ok.step", 50 * MB)])).toEqual([]);
    const total = [item("model", "a.step", 40 * MB), item("drawing", "a.pdf", 40 * MB), item("drawing", "b.pdf", 21 * MB)];
    expect(codes(total)).toEqual(["total-too-large"]);
    expect(codes([item("model", "zero.step", 0)])).toContain("empty-file");
  });

  test("wrong extension, a PDF that is not one, DWG/DXF out of scope", async () => {
    expect(attachmentKindFor("part.dwg")).toBeNull();
    expect(attachmentKindFor("part.dxf")).toBeNull();
    expect(attachmentKindFor("PART.PDF")).toBe("drawing");
    expect(attachmentKindFor("Gövde.STEP")).toBe("model");
    expect(codes([item("drawing", "a.step")])).toContain("wrong-extension");
    const fakePdf = item("drawing", "fake.pdf");
    expect(codes([fakePdf], false, new Set([fakePdf.key]))).toContain("not-a-pdf");
    expect(await looksLikePdf(new Blob([PDF_BYTES]))).toBe(true);
    expect(await looksLikePdf(new Blob([Buffer.from("PK\u0003\u0004 zip")]))).toBe(false);
  });

  test("revision difference needs the acknowledgement; equality is never assumed", () => {
    const sameUnknown = [item("model", "a.step"), item("drawing", "a.pdf", 1000, "Rev B")];
    expect(revisionsDiffer(sameUnknown)).toBe(false);
    const differ = [item("model", "a.step", 1000, "Rev B"), item("drawing", "a.pdf", 1000, "Rev C")];
    expect(revisionsDiffer(differ)).toBe(true);
    expect(codes(differ)).toEqual(["revision-unacknowledged"]);
    expect(codes(differ, true)).toEqual([]);
  });

  test("Unicode names keep their original in metadata and get a storage-safe object name", async () => {
    expect(storageSafeName("Gövde Ön Kapak (Rev B).STEP")).toBe("Govde-On-Kapak-Rev-B.step");
    expect(storageSafeName("çizim_şğü.pdf")).toBe("cizim_sgu.pdf");
    expect(storageSafeName("ıİ.pdf")).toMatch(/\.pdf$/);
    const bytes = Buffer.from("mas-technic");
    expect(await sha256Hex(new Blob([bytes]))).toBe(createHash("sha256").update(bytes).digest("hex"));
  });
});

/* ── Browser: the default build (flag off) ─────────────────────────────── */

type Calls = { uploads: string[]; invocations: { id: string; files: string[]; attachments?: unknown[]; service: unknown; material: unknown; quantity: unknown }[] };

async function seal(page: Page, edge: (call: number, route: Route) => Promise<void>, storage?: (call: number, route: Route) => Promise<void>): Promise<Calls> {
  const calls: Calls = { uploads: [], invocations: [] };
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.startsWith("http://127.0.0.1") || url.startsWith("http://localhost") || url.startsWith("data:") || url.startsWith("blob:")) return route.fallback();
    if (url.includes("/storage/v1/object/")) {
      calls.uploads.push(url);
      if (storage) return storage(calls.uploads.length, route);
      return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ Key: "sealed" }) });
    }
    if (url.includes("/functions/v1/rfq-rate-limit")) {
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 200, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" } });
      calls.invocations.push(route.request().postDataJSON());
      return edge(calls.invocations.length, route);
    }
    return route.abort("blockedbyclient");
  });
  return calls;
}
const json = (route: Route, status: number, body: unknown) =>
  route.fulfill({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });

const submit = (page: Page) => page.locator("form button[type='submit']");

async function fillDetails(page: Page) {
  await page.locator("#rfq-name").fill("QA Denetim");
  await page.locator("#rfq-email").fill("qa@example.com");
  await page.locator("#rfq-company").fill("QA Ltd");
  await page.locator("#rfq-quantity").fill("10");
}

test.describe("RFQ03 request screen (default build)", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "chromium only");

  test("contract heading, three steps, nothing pre-chosen, empty-step error", async ({ page }) => {
    const calls = await seal(page, (_, route) => json(route, 500, {}));
    await gotoAndSettle(page, "/teklif-al");
    await expect(page.getByRole("heading", { level: 1, name: "Üretim Teklifi İsteyin" })).toBeVisible();
    await expect(page.locator(".rfq-lede")).toContainText("1-3 iş günü");
    await expect(page.getByRole("navigation", { name: "Teklif adımları" })).toContainText("DOSYALAR");
    await expect(page.getByRole("navigation", { name: "Teklif adımları" })).toContainText("BİLGİLER");
    await expect(page.getByRole("navigation", { name: "Teklif adımları" })).toContainText("İNCELE / GÖNDER");
    const aside = page.locator(".rfq-summary");
    await expect(aside).toContainText("Belirtilmedi");
    await expect(aside).not.toContainText("25 adet");
    await expect(aside).not.toContainText("6061");
    await expect(aside).not.toContainText("CNC Frezeleme");
    await expect(page.locator("#rfq-drawings")).toHaveCount(0);
    await submit(page).click();
    await expect(page.locator("div.shell-notice[data-tone='error']")).toContainText("Önce bir 3B model dosyası ekleyin");
    expect(calls.invocations).toHaveLength(0);
  });

  test("selections survive back and forward; the review shows Belirtilmedi for what was not chosen", async ({ page }) => {
    await seal(page, (_, route) => json(route, 500, {}));
    await gotoAndSettle(page, "/teklif-al");
    await page.locator("#rfq-cad").setInputFiles({ name: "parça.stl", mimeType: "model/stl", buffer: STL });
    await submit(page).click();
    await expect(page.locator("#rfq-quantity")).toHaveValue("");
    await expect(page.locator("#rfq-service")).toHaveValue("");
    await submit(page).click();
    await expect(page.locator("#rfq-quantity-error")).toBeVisible();
    await fillDetails(page);
    await page.locator("#rfq-tolerance").selectOption({ index: 2 });
    await submit(page).click();
    const review = page.locator(".rfq-canvas");
    await expect(review).toContainText("parça.stl");
    await expect(review).toContainText("Belirtilmedi");
    await page.getByRole("button", { name: "Bilgileri düzenle" }).click();
    await expect(page.locator("#rfq-quantity")).toHaveValue("10");
    await page.getByRole("button", { name: "Geri" }).click();
    await expect(page.locator(".shell-dropzone-title")).toHaveText("parça.stl");
    await submit(page).click();
    await expect(page.locator("#rfq-name")).toHaveValue("QA Denetim");
  });

  test("RFQ02: a retry after a lost response reuses the same reference", async ({ page }) => {
    const calls = await seal(page, async (call, route) => {
      if (call === 1) return route.abort("connectionreset");
      return json(route, 201, { rfq: { id: calls.invocations[call - 1].id } });
    });
    await gotoAndSettle(page, "/teklif-al");
    await page.locator("#rfq-cad").setInputFiles({ name: "p.stl", mimeType: "model/stl", buffer: STL });
    await submit(page).click();
    await fillDetails(page);
    await submit(page).click();
    await submit(page).click();
    await expect(page.locator("div.shell-notice[data-tone='error']")).toBeVisible();
    await submit(page).click();
    await expect(page.getByRole("heading", { name: "Teklif talebiniz kaydedildi" })).toBeVisible({ timeout: 15_000 });
    expect(calls.invocations).toHaveLength(2);
    expect(calls.invocations[1].id).toBe(calls.invocations[0].id);
    expect(calls.uploads, "the file is uploaded once across both attempts").toHaveLength(1);
    // Nothing chosen on step 2 is sent as a choice.
    expect(calls.invocations[1].service).toBeNull();
    expect(calls.invocations[1].material).toBeNull();
  });

  test("RFQ02: a 5xx after an unanswered attempt is reported as 'possibly received', not as a fresh failure", async ({ page }) => {
    await seal(page, async (call, route) => (call === 1 ? route.abort("timedout") : json(route, 500, { error: "Talep oluşturulamadı." })));
    await gotoAndSettle(page, "/teklif-al");
    await page.locator("#rfq-cad").setInputFiles({ name: "p.stl", mimeType: "model/stl", buffer: STL });
    await submit(page).click();
    await fillDetails(page);
    await submit(page).click();
    await submit(page).click();
    await expect(page.locator("div.shell-notice[data-tone='error']")).toBeVisible();
    await submit(page).click();
    const notice = page.locator("div.shell-notice[data-tone='error']");
    await expect(notice).toContainText("DURUM BELİRSİZ");
    await expect(notice).toContainText(/RFQ-\d{4}-/);
  });

  test("RFQ02: 413 and 429 map to their own sentences", async ({ page }) => {
    await seal(page, async (call, route) => (call === 1 ? json(route, 413, {}) : json(route, 429, { retry_after: 30 })));
    await gotoAndSettle(page, "/teklif-al");
    await page.locator("#rfq-cad").setInputFiles({ name: "p.stl", mimeType: "model/stl", buffer: STL });
    await submit(page).click();
    await fillDetails(page);
    await submit(page).click();
    await submit(page).click();
    await expect(page.locator("div.shell-notice[data-tone='error']")).toContainText("DOSYA ÇOK BÜYÜK");
    await submit(page).click();
    await expect(page.locator("div.shell-notice[data-tone='error']")).toContainText("30 saniye");
  });
});

/* ── Browser: a build with VITE_RFQ_ATTACHMENTS=on ─────────────────────── */

const ATTACHMENTS_URL = process.env.P6_ATTACHMENTS_URL;

test.describe("RFQ01 multi-attachment UI (flag-on build, network mocked)", () => {
  test.skip(({ browserName }) => browserName !== "chromium" || !ATTACHMENTS_URL, "needs P6_ATTACHMENTS_URL pointing at a VITE_RFQ_ATTACHMENTS=on build");

  const open = (page: Page) => page.goto(`${ATTACHMENTS_URL}/teklif-al`);

  test("PDF-only request: uploaded as application/pdf and described in attachments", async ({ page }) => {
    const calls = await seal(page, (_, route) => json(route, 201, { rfq: { id: "SEALED" } }));
    await open(page);
    await expect(page.locator(".rfq-lede")).toContainText("PDF teknik resminizi");
    await page.locator("#rfq-drawings").setInputFiles({ name: "Çizim Rev C.pdf", mimeType: "application/pdf", buffer: PDF_BYTES });
    await submit(page).click();
    await fillDetails(page);
    await submit(page).click();
    await submit(page).click();
    await expect(page.getByRole("heading", { name: "Teklif talebiniz kaydedildi" })).toBeVisible({ timeout: 15_000 });
    const body = calls.invocations[0];
    expect(body.attachments).toHaveLength(1);
    expect(body.attachments?.[0]).toMatchObject({
      kind: "drawing",
      originalName: "Çizim Rev C.pdf",
      mediaType: "application/pdf",
      sizeBytes: PDF_BYTES.length,
      sha256: createHash("sha256").update(PDF_BYTES).digest("hex"),
    });
    expect(body.files).toEqual([(body.attachments?.[0] as { storagePath: string }).storagePath]);
    expect(body.files[0]).toMatch(/^anonymous\/RFQ-\d{4}-[A-Z0-9]+\/drawing-1-Cizim-Rev-C\.pdf$/);
  });

  test("limits, a fake PDF and the revision acknowledgement block step 1", async ({ page }) => {
    await seal(page, (_, route) => json(route, 500, {}));
    await open(page);
    await page.locator("#rfq-drawings").setInputFiles(["a", "b", "c", "d"].map((n) => ({ name: `${n}.pdf`, mimeType: "application/pdf", buffer: PDF_BYTES })));
    await expect(page.locator(".rfq-attachments li")).toHaveCount(4);
    await submit(page).click();
    await expect(page.locator("div.shell-notice[data-tone='error']").first()).toContainText("En fazla 3 PDF");
    for (let i = 0; i < 4; i += 1) await page.locator(".rfq-attachments li").first().getByRole("button", { name: "Kaldır" }).click();

    await page.locator("#rfq-drawings").setInputFiles({ name: "fake.pdf", mimeType: "application/pdf", buffer: Buffer.from("not a pdf") });
    await expect(page.getByText("“fake.pdf” bir PDF dosyası değil.")).toBeVisible();
    await page.locator(".rfq-attachments li").first().getByRole("button", { name: "Kaldır" }).click();

    await page.locator("#rfq-model").setInputFiles({ name: "m.stl", mimeType: "model/stl", buffer: STL });
    await page.locator("#rfq-drawings").setInputFiles({ name: "d.pdf", mimeType: "application/pdf", buffer: PDF_BYTES });
    const revisions = page.locator(".rfq-attachments input[type='text']");
    await revisions.nth(0).fill("Rev B");
    await revisions.nth(1).fill("Rev C");
    await expect(page.getByText("Revizyon farkını teknik inceleme için belirtiyorum.")).toBeVisible();
    await submit(page).click();
    await expect(page.locator("#rfq-name")).toHaveCount(0);
    await page.getByLabel("Revizyon farkını teknik inceleme için belirtiyorum.").check();
    await submit(page).click();
    await expect(page.locator("#rfq-name")).toBeVisible();
  });

  test("a failure on the second file keeps the first; the retry uploads only the missing one", async ({ page }) => {
    const calls = await seal(
      page,
      (_, route) => json(route, 201, { rfq: { id: "SEALED" } }),
      async (call, route) => (call === 2
        ? route.fulfill({ status: 500, body: "x", headers: { "access-control-allow-origin": "*" } })
        : json(route, 200, { Key: "sealed" })),
    );
    await open(page);
    await page.locator("#rfq-model").setInputFiles({ name: "m.stl", mimeType: "model/stl", buffer: STL });
    await page.locator("#rfq-drawings").setInputFiles({ name: "d.pdf", mimeType: "application/pdf", buffer: PDF_BYTES });
    await submit(page).click();
    await fillDetails(page);
    await submit(page).click();
    await submit(page).click();
    await expect(page.locator("div.shell-notice[data-tone='error']")).toContainText("“d.pdf” yüklenemedi");
    await submit(page).click();
    await expect(page.getByRole("heading", { name: "Teklif talebiniz kaydedildi" })).toBeVisible({ timeout: 15_000 });
    expect(calls.uploads).toHaveLength(3);
    expect(calls.uploads[2]).toContain("drawing-2-d.pdf");
    expect(calls.invocations).toHaveLength(1);
    expect(calls.invocations[0].attachments).toHaveLength(2);
  });
});
