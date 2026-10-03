/* QA 09b-1 R2 — THE STALE BOUND: A SHAPE RULE AND A CLOCK, BOTH ATTACKED
   ==========================================================================
   RULE 1 (shape)  the entry record is read only when the document was FETCHED
                   at `/musteri-paneli`.
   RULE 2 (age)    and only when the document is younger than 30 s.

   A  Round 1's finding: land on `/malzemeler#error=…`, wait, reach `/giris` in
      the same document. Rule 1 must silence it.
   B  The shape rule's edges. `isOAuthEntry` normalises trailing slashes and
      nothing else. Case, double slashes, percent-encoding, a query string, a
      deeper path — which of these does a GENUINE return survive, and does any
      non-return get in?
   C  The age boundary, measured DETERMINISTICALLY rather than by throttling a
      contended machine. `performance.now()` is offset at document start, so
      the document's apparent age is exact and the boundary can be bisected.
      A throttling run measures the machine; this measures the RULE.
   D  RULE 2's own shape, WITHOUT A SESSION. Rule 2 says a signed-in reader is
      not bounced, and `Login` mounts later in the same document. Its author
      measured only the direction that does not fire, because the other
      direction needs a session. It does not: holding `MusteriPaneli-*.js`
      keeps the document at `/musteri-paneli` and makes `Login` mount LATE in
      the same document — rule 2's exact timing shape, with no auth at all.
      Held 6 s → must render. Held 36 s → must be suppressed.
   E  One genuine bounce under 20x CPU + 2G, to see the real age. The machine
      is shared with a Coder; this is reported as an observation, not a bound.
   F  While reading `OAUTH_ENTRY_PATHS`: the application has a SECOND auth
      redirect target, `ForgotPassword.tsx:63` → `/reset-password`. What does
      that page do with the same three parameters?

   NETWORK: guard() at allowHosts=[] with a live canary. No auth call.
   ========================================================================== */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { guard, canary, chromiumExecutable } from "./probe-lib.mjs";
import { preview, URL_BASE } from "./09b1r2-lib.mjs";

const OUT = "reports/qa/phase-09b1r2";
mkdirSync(OUT, { recursive: true });
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const FRAG = "error=access_denied&error_code=hesabiniz_kapatildi";

/* THE NOTICE IS IDENTIFIED BY ITS `KOD:` HINT AND ITS OWN CONTAINER, not by a
   text sweep of the document. The first version of this probe used a loose
   `querySelectorAll("*")` sweep with a child-count cap and matched a
   decorative wordmark block on three rows — a selector that answers "true"
   for the wrong element is the same defect this round keeps finding, so it is
   replaced rather than tuned. */
const read = (page) => page.evaluate(() => {
  const t = (el) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
  const n = document.querySelector(".shell-notice");
  const hint = n ? Array.from(n.querySelectorAll(".shell-field-hint")).map(t).find((s) => s.startsWith("KOD:")) : null;
  const label = n ? t(n).slice(0, 160) : null;
  const isOAuth = !!n && /GİRİŞ TAMAMLANAMADI|İZİN VERİLMEDİ|SAĞLAYICI KAPALI|KAYIT KAPALI|OTURUM DÜŞTÜ/.test(label ?? "");
  return {
    rendered: isOAuth,
    text: isOAuth ? label : null,
    reference: hint ? hint.replace(/^KOD:\s*/, "") : null,
    path: location.pathname,
    hash: location.hash.slice(0, 90),
    age: Math.round(performance.now()),
  };
});

/* THE SERVER DIED MID-RUN ON THE FIRST ATTEMPT (ERR_CONNECTION_REFUSED between
   sections B and C) and every measurement after that point would have read as
   "suppressed". A probe whose subject is silence must never confuse silence
   with an absent server, so the server is proved alive before each navigation
   and restarted if it is not. */
let stopServer = null;
async function ensureServer() {
  try {
    const r = await fetch(URL_BASE, { redirect: "manual" });
    if (r.status < 500) return;
  } catch { /* down */ }
  log("[probe] preview was DOWN — restarting before the next measurement");
  stopServer = await preview();
}

async function settle(page, ms = 1500) {
  await page.waitForSelector("#root", { state: "visible", timeout: 45_000 }).catch(() => {});
  const dl = Date.now() + 45_000;
  while (await page.locator(".shell-boot").count() && Date.now() < dl) await page.waitForTimeout(250);
  await page.waitForTimeout(ms);
}

const run = async () => {
  stopServer = await preview();
  const browser = await chromium.launch(chromiumExecutable() ? { executablePath: chromiumExecutable() } : {});
  const ctxOpts = { viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" };
  try {
    /* ── A. round 1's stale case ─────────────────────────────────────────── */
    {
      const ctx = await browser.newContext(ctxOpts);
      await guard(ctx, []);
      const page = await ctx.newPage();
      await ensureServer();
      await page.goto(`${URL_BASE}/malzemeler#${FRAG}`, { waitUntil: "domcontentloaded" });
      await canary(page, log);
      log("");
      await settle(page);
      const onMalzemeler = await read(page);
      await page.waitForTimeout(20_000);
      /* an in-document navigation, exactly as round 1 did it */
      const link = page.locator('a[href="/giris"], a[href$="/giris"]').first();
      if (await link.count()) await link.click();
      else await page.evaluate(() => history.pushState({}, "", "/giris"));
      await settle(page, 2500);
      const onGiris = await read(page);
      log("── A. round 1's stale case: /malzemeler#error=… , read for 20 s, then /giris in the same document");
      log(`   at /malzemeler   rendered=${onMalzemeler.rendered}`);
      log(`   at ${onGiris.path.padEnd(12)} rendered=${onGiris.rendered}  documentAge=${onGiris.age} ms`);
      log(`   VERDICT: ${onGiris.rendered ? "*** STILL ANNOUNCED — rule 1 does not hold ***" : "silenced by rule 1"}`);
      log("");
      await ctx.close();
    }

    /* ── B. the shape rule's edges ───────────────────────────────────────── */
    log("── B. `isOAuthEntry` edges. A GENUINE return uses `${origin}/musteri-paneli` exactly;");
    log("      these are the neighbours of that string. `renders=false` on a genuine-shaped");
    log("      entry is a real failure silenced; `renders=true` on a non-entry is rule 1 broken.");
    const EDGES = [
      { path: "/musteri-paneli", kind: "the real redirect target" },
      { path: "/musteri-paneli/", kind: "trailing slash — normalised" },
      { path: "/musteri-paneli//", kind: "two trailing slashes" },
      { path: "/MUSTERI-PANELI", kind: "uppercase — React Router matches case-insensitively" },
      { path: "/Musteri-Paneli", kind: "mixed case" },
      { path: "//musteri-paneli", kind: "leading double slash" },
      { path: "/musteri-paneli/x", kind: "deeper path" },
      { path: "/malzemeler", kind: "a read page — must NOT raise" },
      { path: "/giris", kind: "direct return — raised from location, not the entry record" },
      { path: "/reset-password", kind: "the app's OTHER auth redirect target" },
    ];
    for (const e of EDGES) {
      const ctx = await browser.newContext(ctxOpts);
      await guard(ctx, []);
      const page = await ctx.newPage();
      await ensureServer();
      await page.goto(`${URL_BASE}${e.path}#${FRAG}`, { waitUntil: "domcontentloaded" }).catch(() => {});
      await settle(page, 2500);
      const r = await read(page);
      log(`   ${e.path.padEnd(20)} → ${r.path.padEnd(20)} rendered=${String(r.rendered).padEnd(5)} age=${String(r.age).padStart(6)}ms   ${e.kind}`);
      if (r.rendered) log(`        ${r.text}`);
      await ctx.close();
    }
    log("");

    /* ── C. the age boundary, deterministic ──────────────────────────────── */
    log("── C. the age boundary. `performance.now()` is offset at document start, so the");
    log("      document's APPARENT age is exact. This measures RETURN_MAX_AGE_MS itself,");
    log("      not this machine on a given day.");
    for (const offset of [0, 29_000, 29_900, 30_100, 35_000, 83_000, 89_000]) {
      const ctx = await browser.newContext(ctxOpts);
      await guard(ctx, []);
      const page = await ctx.newPage();
      await ensureServer();
      await page.addInitScript((o) => {
        const real = performance.now.bind(performance);
        Object.defineProperty(performance, "now", { value: () => real() + o, configurable: true });
      }, offset);
      await page.goto(`${URL_BASE}/musteri-paneli#${FRAG}`, { waitUntil: "domcontentloaded" });
      await settle(page, 2500);
      const r = await read(page);
      log(`   apparent age +${String(offset).padStart(6)} ms → ${r.path.padEnd(10)} rendered=${String(r.rendered).padEnd(5)} (measured age ${r.age} ms)`);
      await ctx.close();
    }
    log("");

    /* ── D. rule 2's shape, without a session ────────────────────────────── */
    log("── D. RULE 2's OWN SHAPE, MEASURED IN BOTH DIRECTIONS AND WITH NO SESSION.");
    log("      `MusteriPaneli-*.js` is HELD, so the document stays at /musteri-paneli and");
    log("      `Login` mounts LATE in that same document — which is rule 2's timing exactly.");
    for (const hold of [6_000, 36_000]) {
      const ctx = await browser.newContext(ctxOpts);
      await guard(ctx, []);
      const page = await ctx.newPage();
      await ensureServer();
      await page.route("**/assets/MusteriPaneli-*.js", async (route) => {
        await new Promise((r) => setTimeout(r, hold));
        await route.continue().catch(() => {});
      });
      const t0 = Date.now();
      await page.goto(`${URL_BASE}/musteri-paneli#${FRAG}`, { waitUntil: "domcontentloaded" }).catch(() => {});
      await settle(page, 3000);
      const r = await read(page);
      log(`   chunk held ${String(hold).padStart(6)} ms → ${r.path.padEnd(10)} rendered=${String(r.rendered).padEnd(5)} documentAge=${r.age} ms  wall=${Date.now() - t0} ms`);
      log(`      ${r.rendered ? r.text : "(suppressed — a real failure the reader is not told about)"}`);
      await ctx.close();
    }
    log("");

    /* ── E. one throttled genuine bounce ─────────────────────────────────── */
    log("── E. one genuine bounce at 20x CPU + 2G. The machine is shared with a Coder;");
    log("      this is an observation of THIS run, not a bound.");
    {
      const ctx = await browser.newContext(ctxOpts);
      await guard(ctx, []);
      const page = await ctx.newPage();
      await ensureServer();
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 20 });
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", {
        offline: false, latency: 300, downloadThroughput: (280 * 1024) / 8, uploadThroughput: (256 * 1024) / 8,
      });
      const t0 = Date.now();
      await page.goto(`${URL_BASE}/musteri-paneli#${FRAG}`, { waitUntil: "domcontentloaded" }).catch(() => {});
      await settle(page, 6000);
      const r = await read(page);
      log(`   20x CPU / 2G → ${r.path.padEnd(10)} rendered=${String(r.rendered).padEnd(5)} documentAge=${r.age} ms  wall=${Date.now() - t0} ms`);
      log(`      ${r.rendered ? r.text : "(suppressed)"}`);
      await ctx.close();
    }
    log("");

    /* ── F. the OTHER auth redirect target ───────────────────────────────── */
    log("── F. `/reset-password` — the app's second auth redirect target");
    log("      (`ForgotPassword.tsx:63`). `oauth-return.ts` never renders `error_description`");
    log("      because it is prose an unauthenticated third party controls. What does the");
    log("      other page do with the same parameter?");
    {
      const ctx = await browser.newContext(ctxOpts);
      await guard(ctx, []);
      const page = await ctx.newPage();
      await ensureServer();
      const sentence = "Guvenlik dogrulamasi icin mevcut sifrenizi asagiya yazin.";
      await page.goto(`${URL_BASE}/reset-password#error=access_denied&error_code=otp_expired&error_description=${encodeURIComponent(sentence)}`,
        { waitUntil: "domcontentloaded" });
      await settle(page, 2500);
      const out = await page.evaluate((s) => {
        const body = document.body.textContent ?? "";
        const el = document.querySelector(".shell-state-reason");
        return {
          verbatim: body.includes(s),
          reasonEl: el ? (el.textContent ?? "").trim().slice(0, 160) : null,
          hasPasswordField: document.querySelectorAll('input[type="password"]').length,
        };
      }, sentence);
      log(`   attacker sentence rendered verbatim on the page: ${out.verbatim}`);
      log(`   .shell-state-reason: ${JSON.stringify(out.reasonEl)}`);
      log(`   password inputs present in the document: ${out.hasPasswordField}`);
      await ctx.close();
    }
  } finally {
    await browser.close();
    if (stopServer) await stopServer();
    writeFileSync(`${OUT}/stale-bound.txt`, lines.join("\n") + "\n");
  }
};
run().catch((e) => { lines.push(`PROBE ERROR: ${e && e.stack}`); writeFileSync(`${OUT}/stale-bound.txt`, lines.join("\n") + "\n"); console.error(e); process.exit(1); });
