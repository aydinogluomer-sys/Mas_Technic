/* 09b-1 — THE STATES, REACHED RATHER THAN INFERRED.
   ------------------------------------------------------------------------
   Criterion 3 is the standard 09a was held to: an error, loading or empty
   state counts only if it was rendered in a browser and read back out of the
   DOM. Nothing below is asserted from source.

   EVERY STATE HERE IS REACHED WITHOUT A SINGLE REQUEST LEAVING THE MACHINE,
   and eleven of the twelve are reached without invoking a Supabase method at
   all. The abort guard is installed with an EMPTY allow list and proved with
   a live canary before any control is touched.

   THE ONE SUPABASE CALL, AND WHY IT IS SAFE — stated so it can be checked.
   Step R4 presses "Şifreyi güncelle" on /reset-password. That calls
   `supabase.auth.updateUser`. Read from the installed SDK,
   `GoTrueClient._updateUser` (auth-js, line 1310) runs `_useSession` FIRST and
   throws `AuthSessionMissingError` at line 1318 — BEFORE the `_request` on
   line 1327 — whenever there is no stored session. There is none here: this
   browser has never signed in. So the call returns the SDK's own error object
   having made no request, which is why the guard's `allowed` count below is 0
   and why this is a real failure state rather than a mocked one. It signs
   nothing in, signs nothing up, requests no reset and starts no redirect.

   THE FORM ON /reset-password IS REACHED AT `#token_hash=…`, WHICH ALSO COSTS
   NOTHING. supabase-js only acts on a URL when it sees `access_token` /
   `error_description` in the fragment (implicit) or `code` in the query with a
   stored verifier (PKCE). `token_hash` matches neither, so `initialize()`
   contacts nothing and the page settles in `checking` — which renders the
   form, so its labels, focus order and contrast are measurable.

   NOTHING IS CLICKED ON /giris THAT COULD SUBMIT A CREDENTIAL: the captcha is
   never solved (hCaptcha is blocked by the guard), so the submit path stops at
   the captcha notice by construction as well as by intent. */
import { mkdirSync, writeFileSync } from "node:fs";
import { launch, guard, canary, BASE } from "./probe-lib.mjs";

const OUT = process.env.PROBE_OUT ?? "reports/09b1/states.json";
const SHOTS = "reports/09b1/shots";
mkdirSync(SHOTS, { recursive: true });

const browser = await launch();
const record = [];

/** Read every branded message the page is currently showing. */
async function readState(page) {
  return page.evaluate(() => ({
    h1: Array.from(document.querySelectorAll("h1")).map((n) => n.textContent.trim()),
    notices: Array.from(document.querySelectorAll(".shell-notice")).map((n) => ({
      tone: n.getAttribute("data-tone"),
      role: n.getAttribute("role"),
      label: n.querySelector(".shell-notice-label")?.textContent.trim() ?? null,
      title: n.querySelector(".shell-notice-title")?.textContent.trim() ?? null,
      body: (n.querySelector(".shell-notice-body")?.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 160),
      edge: getComputedStyle(n).borderLeftColor,
    })),
    fieldErrors: Array.from(document.querySelectorAll(".shell-form-error")).map((n) => ({
      id: n.id,
      text: n.textContent.trim(),
      describedBy: !!document.querySelector(`[aria-describedby~="${n.id}"]`),
      invalid: !!document.querySelector(`[aria-describedby~="${n.id}"][aria-invalid="true"]`),
      edge: getComputedStyle(n).borderLeftColor,
    })),
    pending: Array.from(document.querySelectorAll('[data-auth-state="pending"]')).map((n) => n.textContent.trim()),
    statuses: Array.from(document.querySelectorAll('[role="status"],[role="alert"]')).map((n) => ({
      role: n.getAttribute("role"),
      text: n.textContent.trim().slice(0, 80),
    })),
  }));
}

async function step(page, name, action) {
  if (action) await action();
  await page.waitForTimeout(350);
  const state = await readState(page);
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });
  record.push({ step: name, ...state });
  const summary = state.notices.map((n) => `${n.tone}:${n.label}`).join(", ")
    || state.fieldErrors.map((e) => e.id).join(", ")
    || "(none)";
  console.log(`  ${name}: ${summary}`);
}

for (const width of [1280, 375]) {
  const context = await browser.newContext({
    viewport: { width, height: width === 1280 ? 900 : 812 },
    isMobile: width === 375,
    hasTouch: width === 375,
    reducedMotion: "reduce",
  });
  const traffic = await guard(context, []);
  const tag = `w${width}`;
  console.log(`\n── ${width} ──`);

  /* ── /giris ─────────────────────────────────────────────────────────── */
  let page = await context.newPage();
  await page.goto(`${BASE}/giris`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  await canary(page, (m) => console.log(`  ${m}`));

  await step(page, `${tag}-giris-rest`);
  await step(page, `${tag}-giris-empty-submit`, async () => {
    await page.getByRole("button", { name: /Giriş yap/i }).click();
  });
  await step(page, `${tag}-giris-captcha-missing`, async () => {
    await page.locator("#auth-email").fill("blocked@localhost.invalid");
    await page.locator("#auth-password").fill("probe-password");
    await page.getByRole("button", { name: /Giriş yap/i }).click();
  });
  await step(page, `${tag}-giris-reveal`, async () => {
    await page.getByRole("button", { name: "Şifreyi göster" }).click();
  });
  await step(page, `${tag}-giris-signup`, async () => {
    await page.getByRole("button", { name: /Kayıt olun/i }).click();
  });
  await page.close();

  /* ── /sifremi-unuttum ───────────────────────────────────────────────── */
  page = await context.newPage();
  await page.goto(`${BASE}/sifremi-unuttum`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  await step(page, `${tag}-forgot-rest`);
  await step(page, `${tag}-forgot-empty`, async () => {
    await page.getByRole("button", { name: /Sıfırlama bağlantısı iste/i }).click();
  });
  await step(page, `${tag}-forgot-malformed`, async () => {
    await page.locator("#auth-email").fill("not-an-address");
    await page.getByRole("button", { name: /Sıfırlama bağlantısı iste/i }).click();
  });
  await page.close();

  /* ── /reset-password ────────────────────────────────────────────────── */
  page = await context.newPage();
  await page.goto(`${BASE}/reset-password`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  await step(page, `${tag}-reset-absent`);
  await page.close();

  page = await context.newPage();
  await page.goto(
    `${BASE}/reset-password#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired`,
    { waitUntil: "load" },
  );
  await page.waitForTimeout(700);
  await step(page, `${tag}-reset-expired`);
  await page.close();

  page = await context.newPage();
  await page.goto(`${BASE}/reset-password#token_hash=probe-no-network`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  await step(page, `${tag}-reset-form`);
  await step(page, `${tag}-reset-short`, async () => {
    await page.locator("#auth-password").fill("abc");
    await page.locator("#auth-confirmPassword").fill("abc");
    await page.getByRole("button", { name: /Şifreyi güncelle/i }).click();
  });
  await step(page, `${tag}-reset-mismatch`, async () => {
    await page.locator("#auth-password").fill("probe-password-1");
    await page.locator("#auth-confirmPassword").fill("probe-password-2");
    await page.getByRole("button", { name: /Şifreyi güncelle/i }).click();
  });

  /* The one Supabase call. See the header. */
  const armed = page.waitForSelector('[data-auth-state="pending"]', { timeout: 3000 })
    .then(() => true).catch(() => false);
  await step(page, `${tag}-reset-session-missing`, async () => {
    await page.locator("#auth-confirmPassword").fill("probe-password-1");
    await page.getByRole("button", { name: /Şifreyi güncelle/i }).click();
  });
  record.push({ step: `${tag}-reset-pending-observed`, pendingSeen: await armed });
  console.log(`  ${tag}-reset-pending-observed: ${await armed}`);
  await page.close();

  record.push({
    step: `${tag}-traffic`,
    blocked: [...new Set(traffic.blocked.map((u) => { try { return new URL(u).hostname; } catch { return u; } }))].sort(),
    blockedCount: traffic.blocked.length,
    allowedCount: traffic.allowed.length,
  });
  console.log(`  traffic: blocked ${traffic.blocked.length}, ALLOWED ${traffic.allowed.length}`);
  await context.close();
}

await browser.close();
writeFileSync(OUT, JSON.stringify(record, null, 2));
console.log(`\nwrote ${OUT}`);
