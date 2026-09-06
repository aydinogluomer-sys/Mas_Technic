import { test, expect, type Page, type Route, type Request } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/* ══════════════════════════════════════════════════════════════════════════
   QA PHASE 09a — /teklif-al FORM BEHAVIOUR, ACCESSIBILITY AND CONTENT TRUTH

   ── WHY EVERY TEST IN THIS FILE STARTS BY SEALING THE NETWORK ────────────
   The Phase 09a Coder wrote four rows to `public.rfqs` and three objects to
   `cad-uploads` on the production project while trying to verify this same
   form. It had reasoned from `supabase/functions/rfq-rate-limit/index.ts` in
   this repository, which rejects a malformed e-mail with 400 BEFORE the
   insert — but that source has never been deployed, so a write it had
   engineered to be impossible happened anyway. There is exactly one
   configured Supabase project and it is production.

   So this file never lets a request reach a non-loopback host. `sealNetwork`
   installs a context route that FULFILLS or ABORTS every off-origin request
   and never calls `continue()`, and each test that needs it asserts the seal
   with a live canary BEFORE it touches a control. A fulfilled route is
   answered inside the browser; the request does not leave the machine.

   Consequence, stated plainly: these tests prove the CLIENT half of the
   submission pipeline — the guard, the states, the copy. They cannot and must
   not prove that the deployed backend behaves as its source claims.
   ══════════════════════════════════════════════════════════════════════════ */

const CANARY = "https://example.com/qa-p09a-network-seal-canary";
const SMALL_STL = Buffer.from(
  "solid qa\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid qa\n",
);

/**
 * THE ONE OFF-ORIGIN ALLOWANCE, AND WHY IT IS SAFE.
 *
 * `index.html` loads Space Grotesk / IBM Plex Mono / Newsreader from Google
 * Fonts. Aborting them would leave every measurement in this file describing a
 * fallback-font layout, which is not the page. These two hosts are public
 * read-only CDNs, they are not the configured Supabase project, and no request
 * to them can create a row or an object. Everything else off-origin is aborted
 * or answered inside the browser, and `seal.passed` is asserted to contain
 * these two hosts and nothing else.
 */
const FONT_HOSTS = new Set(["fonts.googleapis.com", "fonts.gstatic.com"]);

type Seal = {
  /** Every off-origin URL the page attempted, none of which was forwarded. */
  blocked: string[];
  /** Requests answered with a synthetic response, still never sent. */
  fulfilled: string[];
  /** Off-origin requests deliberately allowed out: font CDN only. */
  passed: string[];
  /** Must stay empty: anything here escaped the seal. */
  escaped: string[];
};

function isLoopback(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname === "::1";
  } catch {
    return false;
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

/**
 * @param fakes URL substring → synthetic response. Anything not matched is
 *              aborted outright.
 */
async function sealNetwork(
  page: Page,
  fakes: { match: string; status: number; body: unknown; delayMs?: number }[] = [],
): Promise<Seal> {
  const seal: Seal = { blocked: [], fulfilled: [], passed: [], escaped: [] };
  await page.route("**/*", async (route: Route, request: Request) => {
    const url = request.url();
    if (isLoopback(url) || url.startsWith("data:") || url.startsWith("blob:")) {
      await route.fallback();
      return;
    }
    if (FONT_HOSTS.has(hostOf(url)) && request.method() === "GET") {
      seal.passed.push(`${request.method()} ${url}`);
      await route.fallback();
      return;
    }
    const fake = fakes.find((f) => url.includes(f.match));
    if (fake) {
      if (fake.delayMs) await new Promise((r) => setTimeout(r, fake.delayMs));
      seal.fulfilled.push(`${request.method()} ${url}`);
      await route.fulfill({
        status: fake.status,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify(fake.body),
      });
      return;
    }
    seal.blocked.push(`${request.method()} ${url}`);
    await route.abort("blockedbyclient");
  });
  return seal;
}

/** Proves the seal is live before the test does anything that could write. */
async function assertSealed(page: Page, seal: Seal) {
  const reached = await page.evaluate(async (url) => {
    try {
      await fetch(url, { method: "GET", mode: "no-cors" });
      return true;
    } catch {
      return false;
    }
  }, CANARY);
  expect(reached, "canary GET to a non-loopback host must be blocked").toBe(false);
  expect(seal.blocked.some((entry) => entry.includes("qa-p09a-network-seal-canary"))).toBe(true);
  expect(seal.escaped).toEqual([]);
  // The only off-origin traffic permitted is the font CDN.
  expect([...new Set(seal.passed.map((entry) => hostOf(entry.split(" ")[1])))]
    .filter((host) => !FONT_HOSTS.has(host))).toEqual([]);
}

/** Run at the end of every test: nothing that could write ever left the page. */
function assertNothingReachedTheBackend(seal: Seal) {
  expect(seal.passed.filter((entry) => /supabase|storage\/v1|functions\/v1|rest\/v1/i.test(entry))).toEqual([]);
  expect(seal.escaped).toEqual([]);
}

async function openForm(page: Page) {
  await page.goto("/teklif-al", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1, name: "Hassas Fiyat Teklifi Alın" })).toBeVisible();
}

const submitButton = (page: Page) => page.locator("form button[type='submit']");

/* ── 1. Disclosure before the choice (§7.7) ───────────────────────────── */

test("accepted formats and the size ceiling are on screen before a file is chosen", async ({ page }) => {
  const seal = await sealNetwork(page);
  await openForm(page);
  await assertSealed(page, seal);

  // Nothing chosen yet.
  await expect(page.locator("#rfq-cad")).toHaveJSProperty("value", "");

  const main = page.locator("main");
  // Every accepted extension, from CAD_ACCEPTED_EXTENSIONS, as a visible chip.
  for (const format of ["STEP", "STP", "STL", "OBJ", "IGES", "IGS", "3MF"]) {
    await expect(main.getByText(format, { exact: true }).first()).toBeVisible();
  }
  await expect(main.getByText(/Maks\. 50 MB/).first()).toBeVisible();
  await expect(main.getByText(/en fazla 50 MB/).first()).toBeVisible();
  // Hero meta row states both facts too.
  await expect(main.getByText("Kabul edilen format", { exact: true })).toBeVisible();

  // The `accept` attribute is generated from the same constant, so the OS file
  // picker and the printed list cannot drift apart.
  await expect(page.locator("#rfq-cad")).toHaveAttribute(
    "accept",
    ".step,.stp,.stl,.obj,.iges,.igs,.3mf",
  );
});

/* ── 2. The two branded error states (A20), reached without submitting ── */

test("the CAD format error is a persistent announced ShellNotice, not a toast", async ({ page }) => {
  const seal = await sealNetwork(page);
  await openForm(page);
  await assertSealed(page, seal);

  await page.locator("#rfq-cad").setInputFiles({
    name: "qa-not-a-cad-file.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("QA probe - deliberately not a CAD file"),
  });

  const notice = page.locator("div.shell-notice[data-tone='error']");
  await expect(notice).toBeVisible();
  await expect(notice).toHaveAttribute("role", "alert");
  await expect(notice).toHaveCSS("border-radius", "0px");
  await expect(notice).toContainText("DOSYA REDDEDİLDİ");
  const font = await notice.evaluate((n) => getComputedStyle(n).fontFamily);
  expect(font).toContain("Space Grotesk");
  expect(await page.locator("[data-sonner-toast]").count()).toBe(0);

  // Persistent: still there four seconds later (sonner's default dismiss).
  await page.waitForTimeout(4500);
  await expect(notice).toBeVisible();

  // No write of any kind was attempted by choosing a file.
  expect(seal.blocked.filter((e) => /storage|functions|rfqs/.test(e))).toEqual([]);
  assertNothingReachedTheBackend(seal);
});

test("advancing with no file raises the branded form error and never posts", async ({ page }) => {
  const seal = await sealNetwork(page);
  await openForm(page);
  await assertSealed(page, seal);

  await submitButton(page).click();

  const notice = page.locator("div.shell-notice[data-tone='error']");
  await expect(notice).toBeVisible();
  await expect(notice).toHaveAttribute("role", "alert");
  await expect(notice).toHaveCSS("border-radius", "0px");
  await expect(notice).toContainText("FORM HATASI");
  await expect(notice).toContainText("Önce bir CAD dosyası ekleyin");
  expect((await notice.evaluate((n) => getComputedStyle(n).fontFamily))).toContain("Space Grotesk");
  expect(await page.locator("[data-sonner-toast]").count()).toBe(0);

  // The step machine did not advance and nothing left the page.
  await expect(page.getByRole("heading", { name: "CAD dosyanızı yükleyin" })).toBeVisible();
  expect(seal.blocked.filter((e) => /storage\/v1|functions\/v1/.test(e))).toEqual([]);
  assertNothingReachedTheBackend(seal);
});

/* ── 3. Field-level accessibility (§7.4) ──────────────────────────────── */

test("field errors are associated, announced, focused and cleared on edit", async ({ page }) => {
  const seal = await sealNetwork(page);
  await openForm(page);
  await assertSealed(page, seal);

  await page.locator("#rfq-cad").setInputFiles({
    name: "qa-part.stl",
    mimeType: "model/stl",
    buffer: SMALL_STL,
  });
  await submitButton(page).click();
  await expect(page.getByRole("heading", { name: "Talep bilgileri" })).toBeVisible();

  // Every control is labelled before anything is wrong with it.
  for (const id of ["rfq-name", "rfq-email", "rfq-company", "rfq-phone", "rfq-service", "rfq-material", "rfq-quantity", "rfq-tolerance"]) {
    const label = page.locator(`label[for='${id}']`);
    await expect(label, `${id} must have a <label for>`).toHaveCount(1);
    expect((await label.innerText()).trim().length).toBeGreaterThan(0);
  }

  // Advance with the three required fields empty.
  await submitButton(page).click();

  const name = page.locator("#rfq-name");
  await expect(name).toHaveAttribute("aria-invalid", "true");
  const describedBy = await name.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  const message = page.locator(`#${describedBy}`);
  await expect(message, "aria-describedby must resolve to a real element").toHaveCount(1);
  expect((await message.innerText()).trim().length).toBeGreaterThan(0);

  // Focus is on the FIRST invalid control in document order.
  await expect(name).toBeFocused();

  // The failure is also announced at form level.
  const alert = page.locator("div.shell-notice[data-tone='error'][role='alert']");
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("Bazı alanlar eksik veya hatalı");

  // Not colour alone: the message is words.
  expect(await message.innerText()).toMatch(/[A-Za-zÇĞİÖŞÜçğıöşü]{4,}/);

  // Editing the field clears its own error and only its own.
  await expect(page.locator("#rfq-email")).toHaveAttribute("aria-invalid", "true");
  await name.fill("QA Denetim");
  await expect(name).not.toHaveAttribute("aria-invalid", "true");
  await expect(page.locator(`#${describedBy}`)).toHaveCount(0);
  await expect(page.locator("#rfq-email")).toHaveAttribute("aria-invalid", "true");

  // A malformed e-mail is rejected with its own message, on the same wiring.
  await page.locator("#rfq-email").fill("not-an-email");
  await page.locator("#rfq-company").fill("QA Ltd");
  await submitButton(page).click();
  await expect(page.locator("#rfq-email")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#rfq-email")).toBeFocused();
  await expect(page.locator("#rfq-email-error")).toContainText("Geçerli bir e-posta");

  expect(seal.blocked.filter((e) => /storage\/v1|functions\/v1/.test(e))).toEqual([]);
  assertNothingReachedTheBackend(seal);
});

/* ── 4. Double-submit (§7.5), against a sealed transport ──────────────── */

test("thirteen submit attempts against a slow handler produce exactly one invocation", async ({ page }) => {
  /* Both backend calls are answered INSIDE the browser. `route.fulfill` does
     not forward the request, so no row and no object can be created; the
     `blocked`/`fulfilled` ledgers below are the proof. The function response
     is delayed 2.5 s so the in-flight window is wide enough to hammer. */
  const seal = await sealNetwork(page, [
    { match: "/storage/v1/object/", status: 200, body: { Key: "qa/sealed" } },
    {
      match: "/functions/v1/rfq-rate-limit",
      status: 200,
      delayMs: 2500,
      body: { rfq: { id: "QA-SEALED-NOT-A-REAL-ROW" } },
    },
  ]);
  await openForm(page);
  await assertSealed(page, seal);

  await page.locator("#rfq-cad").setInputFiles({ name: "qa-part.stl", mimeType: "model/stl", buffer: SMALL_STL });
  await submitButton(page).click();
  await page.locator("#rfq-name").fill("QA Denetim");
  await page.locator("#rfq-email").fill("qa@example.com");
  await page.locator("#rfq-company").fill("QA Ltd");
  await submitButton(page).click();
  await expect(page.getByRole("heading", { name: "Talebinizi kontrol edin ve gönderin" })).toBeVisible();

  const before = seal.fulfilled.length;

  // 13 attempts: one real click, then twelve more routes into the handler —
  // synthesised clicks and implicit submission (Enter), which is the path that
  // bypasses `disabled` because state has not committed yet.
  await submitButton(page).click();
  for (let i = 0; i < 6; i += 1) {
    await page.locator("form").evaluate((form: HTMLFormElement) => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    await page.locator("form button[type='submit']").evaluate((b: HTMLButtonElement) => b.click());
  }
  await page.waitForTimeout(200);

  // The visible half of the guard, while the request is in flight.
  await expect(submitButton(page)).toBeDisabled();
  await expect(page.locator("form")).toHaveAttribute("aria-busy", "true");

  await expect(page.getByRole("heading", { name: "Teklif talebiniz kaydedildi" })).toBeVisible({ timeout: 15_000 });

  const invocations = seal.fulfilled.filter((e) => e.includes("/functions/v1/rfq-rate-limit"));
  const uploads = seal.fulfilled.filter((e) => e.includes("/storage/v1/object/"));
  expect(invocations.length, `13 attempts must yield 1 invocation, got ${invocations.length}`).toBe(1);
  expect(uploads.length, "the file must be uploaded once").toBe(1);
  expect(seal.fulfilled.length - before).toBe(2);
  assertNothingReachedTheBackend(seal);
});

/* ── 5. Content truth (§13) ───────────────────────────────────────────── */

test("no production lead time is rendered anywhere in the request, and the reference is the server's", async ({ page }) => {
  const seal = await sealNetwork(page, [
    { match: "/storage/v1/object/", status: 200, body: { Key: "qa/sealed" } },
    { match: "/functions/v1/rfq-rate-limit", status: 200, body: { rfq: { id: "RFQ-2026-QASEAL" } } },
  ]);
  await openForm(page);
  await assertSealed(page, seal);

  /* The four renderings Phase 09a removed were "10-12 Gün" in the delivery
     selector and the two summaries, and "3-5 Gün" in the express option. §J
     carries QUOTE_SLA and no production lead time at all. */
  const FORBIDDEN = /10\s*-\s*12\s*G[üu]n|3\s*-\s*5\s*G[üu]n|Ekspres|Teslimat s[üu]resi/i;

  const step1 = await page.locator("main").innerText();
  expect(step1, "step 1 must publish no lead time").not.toMatch(FORBIDDEN);

  await page.locator("#rfq-cad").setInputFiles({ name: "qa-part.stl", mimeType: "model/stl", buffer: SMALL_STL });
  await submitButton(page).click();
  const step2 = await page.locator("main").innerText();
  expect(step2, "step 2 must publish no lead time").not.toMatch(FORBIDDEN);

  await page.locator("#rfq-name").fill("QA Denetim");
  await page.locator("#rfq-email").fill("qa@example.com");
  await page.locator("#rfq-company").fill("QA Ltd");
  await submitButton(page).click();
  const step3 = await page.locator("main").innerText();
  expect(step3, "the review summary must publish no lead time").not.toMatch(FORBIDDEN);

  await submitButton(page).click();
  await expect(page.getByRole("heading", { name: "Teklif talebiniz kaydedildi" })).toBeVisible({ timeout: 15_000 });
  const sent = await page.locator("main").innerText();
  expect(sent, "the success state must publish no lead time").not.toMatch(FORBIDDEN);

  /* THE REFERENCE IS THE ONE THE SERVER ECHOED. The browser generates its own
     id for the primary key; if the success screen showed THAT, it would be a
     fabricated confirmation number for a row that may not exist. The sealed
     response echoes a value the browser could not have produced, and that is
     the value on screen. */
  expect(sent).toContain("RFQ-2026-QASEAL");

  /* NOTHING IS PROMISED THAT THE SYSTEM DOES NOT DO: there is no mailer, no
     trigger and no scheduled reader behind `rfqs`, and the copy says so. */
  expect(sent).toMatch(/otomatik bir onay e-postası gönderilmez/i);
  expect(sent).not.toMatch(/onay e-postası (gönderildi|gönderilecek)|e-posta adresinize gönderildi/i);
  /* §J withholds NDA_AVAILABLE, CONFIDENTIALITY_TEXT_APPROVED and
     CAD_RETENTION_PERIOD, so none of these may be asserted anywhere.
     `NDA` is matched case-SENSITIVELY on a word boundary on purpose: a
     case-insensitive `NDA` also matches the middle of "açısından". */
  expect(sent).not.toMatch(/\bNDA\b/);
  expect(sent).not.toMatch(/gizlilik sözleşmesi|şifreli|şifrelenir|imha edilir|kalıcı olarak silinir/i);
});

test("the success state shows no reference at all when the server echoes none", async ({ page }) => {
  const seal = await sealNetwork(page, [
    { match: "/storage/v1/object/", status: 200, body: { Key: "qa/sealed" } },
    // A 2xx with no `rfq.id`: the client-generated id must NOT be substituted.
    { match: "/functions/v1/rfq-rate-limit", status: 200, body: { ok: true } },
  ]);
  await openForm(page);
  await assertSealed(page, seal);

  await page.locator("#rfq-cad").setInputFiles({ name: "qa-part.stl", mimeType: "model/stl", buffer: SMALL_STL });
  await submitButton(page).click();
  await page.locator("#rfq-name").fill("QA Denetim");
  await page.locator("#rfq-email").fill("qa@example.com");
  await page.locator("#rfq-company").fill("QA Ltd");
  await submitButton(page).click();
  await submitButton(page).click();
  await expect(page.getByRole("heading", { name: "Teklif talebiniz kaydedildi" })).toBeVisible({ timeout: 15_000 });

  const sent = await page.locator("main").innerText();
  expect(sent, "no reference line without a server-side id").not.toContain("Talep numarası");
  expect(sent, "a browser-generated id must never be shown").not.toMatch(/RFQ-\d{4}-[0-9A-Z]{6,}/);
});

/* ── 6. Branded failure branches, all reached with the seal in place ──── */

test("a rejected submission renders a branded announced failure and offers a way out", async ({ page }) => {
  const seal = await sealNetwork(page, [
    { match: "/storage/v1/object/", status: 200, body: { Key: "qa/sealed" } },
    {
      match: "/functions/v1/rfq-rate-limit",
      status: 429,
      body: { error: "Çok fazla talep gönderildi. Lütfen 1 dakika sonra tekrar deneyin.", retry_after: 60 },
    },
  ]);
  await openForm(page);
  await assertSealed(page, seal);

  await page.locator("#rfq-cad").setInputFiles({ name: "qa-part.stl", mimeType: "model/stl", buffer: SMALL_STL });
  await submitButton(page).click();
  await page.locator("#rfq-name").fill("QA Denetim");
  await page.locator("#rfq-email").fill("qa@example.com");
  await page.locator("#rfq-company").fill("QA Ltd");
  await submitButton(page).click();
  await submitButton(page).click();

  const notice = page.locator("div.shell-notice[data-tone='error'][role='alert']");
  await expect(notice).toBeVisible({ timeout: 15_000 });
  await expect(notice).toContainText("ÇOK FAZLA TALEP");
  // The backend's own sentence reaches the reader — the dead `fnData?.error`
  // branch this phase replaced could never show it.
  await expect(notice).toContainText("Çok fazla talep gönderildi");
  await expect(notice).toHaveCSS("border-radius", "0px");
  // No stack trace, no URL, no Supabase code.
  const text = await notice.innerText();
  expect(text).not.toMatch(/https?:\/\/|supabase|PGRST|at \w+ \(/i);
  // Re-enabled, so the reader can retry.
  await expect(submitButton(page)).toBeEnabled();
});

/* ── 7. axe, and reflow ───────────────────────────────────────────────── */

for (const width of [1280, 375] as const) {
  test(`axe reports no serious or critical violation on /teklif-al at ${width}`, async ({ page }) => {
    const seal = await sealNetwork(page);
    await page.setViewportSize({ width, height: width === 1280 ? 900 : 812 });
    await openForm(page);
    await assertSealed(page, seal);

    const step1 = await new AxeBuilder({ page }).include("main").analyze();
    const bad1 = step1.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad1.map((v) => `${v.id}(${v.impact}) x${v.nodes.length}`)).toEqual([]);

    // Step 2 with live field errors is the state the audit actually cares about.
    await page.locator("#rfq-cad").setInputFiles({ name: "qa-part.stl", mimeType: "model/stl", buffer: SMALL_STL });
    await submitButton(page).click();
    await submitButton(page).click();
    await expect(page.locator("#rfq-name")).toHaveAttribute("aria-invalid", "true");

    const step2 = await new AxeBuilder({ page }).include("main").analyze();
    const bad2 = step2.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad2.map((v) => `${v.id}(${v.impact}) x${v.nodes.length}`)).toEqual([]);
  });
}

test("the form reflows at 320 with no horizontal overflow", async ({ page }) => {
  const seal = await sealNetwork(page);
  await page.setViewportSize({ width: 320, height: 568 });
  await openForm(page);
  await assertSealed(page, seal);

  const overflow = async () =>
    page.evaluate(() => {
      const doc = document.documentElement;
      const offenders: string[] = [];
      for (const node of Array.from(document.querySelectorAll("main *"))) {
        const rect = node.getBoundingClientRect();
        if (rect.width > 0 && rect.right > doc.clientWidth + 1) {
          offenders.push(`${node.tagName.toLowerCase()}.${(node.className || "").toString().slice(0, 40)} right=${Math.round(rect.right)}`);
        }
      }
      return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, offenders: offenders.slice(0, 6) };
    });

  const step1 = await overflow();
  expect(step1.offenders).toEqual([]);
  expect(step1.scrollWidth).toBeLessThanOrEqual(step1.clientWidth + 1);

  await page.locator("#rfq-cad").setInputFiles({ name: "qa-part.stl", mimeType: "model/stl", buffer: SMALL_STL });
  await submitButton(page).click();
  const step2 = await overflow();
  expect(step2.offenders).toEqual([]);
  expect(step2.scrollWidth).toBeLessThanOrEqual(step2.clientWidth + 1);
});

/* ── 8. The lazy boundary, measured at runtime ────────────────────────── */

test("the WebGL stack is fetched only when a preview is explicitly requested", async ({ page }) => {
  const seal = await sealNetwork(page);
  const scripts: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script" && request.url().includes("/assets/")) {
      scripts.push(request.url().split("/assets/")[1]);
    }
  });

  await openForm(page);
  await assertSealed(page, seal);

  const HEAVY = /^(CadStage|cssVar|occt-import-js|three)/;
  expect(scripts.filter((s) => HEAVY.test(s)), "nothing heavy on load").toEqual([]);

  await page.locator("#rfq-cad").setInputFiles({ name: "qa-part.stl", mimeType: "model/stl", buffer: SMALL_STL });
  await page.waitForTimeout(800);
  expect(scripts.filter((s) => HEAVY.test(s)), "nothing heavy after choosing a file").toEqual([]);

  await page.getByRole("button", { name: /3B önizlemeyi aç/ }).click();
  await page.waitForTimeout(3000);
  const heavy = scripts.filter((s) => HEAVY.test(s));
  expect(heavy.some((s) => s.startsWith("CadStage")), "CadStage arrives on request").toBe(true);
  expect(heavy.some((s) => s.startsWith("cssVar")), "the three/R3F chunk arrives on request").toBe(true);
  // A .stl needs no OCCT; that chunk is a second boundary inside the first.
  expect(heavy.some((s) => s.startsWith("occt-import-js")), "OCCT stays unfetched for an STL").toBe(false);
});
