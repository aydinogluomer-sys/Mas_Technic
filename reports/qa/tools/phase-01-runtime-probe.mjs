/**
 * QA-owned runtime probe for Phase 01 (AC1, AC2, AC3, AC4).
 * Read-only: drives a real browser against an already-running server.
 * Usage: node reports/qa/tools/phase-01-runtime-probe.mjs <baseURL> <label>
 */
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:4173";
const LABEL = process.argv[3] ?? "preview";

const candidates = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter((c) => c && existsSync(c));
const launch = candidates.length ? { executablePath: candidates[0] } : {};

const out = { base: BASE, label: LABEL, executable: candidates[0] ?? "bundled", checks: {} };
const browser = await chromium.launch({ ...launch });

async function ctx(opts = {}) {
  return browser.newContext({ viewport: { width: 1280, height: 800 }, ...opts });
}

// ---- AC1: dev-only routes must render the 404 page ----
{
  const c = await ctx();
  const page = await c.newPage();
  const routes = ["/technical-preview", "/legacy-landing", "/test"];
  out.checks.devRoutes = {};
  for (const r of routes) {
    const resp = await page.goto(BASE + r, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    const info = await page.evaluate(() => ({
      h1: [...document.querySelectorAll("h1")].map((h) => h.textContent.trim()).slice(0, 4),
      bodyHas404: /404/.test(document.body.innerText),
      hasTechnicalLandingRoot: !!document.querySelector('[data-testid="technical-landing-root"]'),
      hasLfRoot: !!document.querySelector(".lf-root"),
      title: document.title,
      path: location.pathname,
    }));
    out.checks.devRoutes[r] = { httpStatus: resp ? resp.status() : null, ...info };
  }
  await c.close();
}

// ---- AC3: hero-shell teardown, normal + reduced motion ----
for (const rm of ["no-preference", "reduce"]) {
  const c = await ctx({ reducedMotion: rm === "reduce" ? "reduce" : "no-preference" });
  const page = await c.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  const t0 = Date.now();
  const atLoad = await page.evaluate(() => ({
    shell: document.getElementById("hero-shell") !== null,
    introActive: document.documentElement.hasAttribute("data-intro-active"),
    hasIntroAttr: document.getElementById("hero-shell")
      ? document.getElementById("hero-shell").hasAttribute("data-intro")
      : null,
  }));
  let goneAt = null;
  for (let i = 0; i < 140; i++) {
    const s = await page.evaluate(() =>
      document.getElementById("hero-shell") === null &&
      !document.documentElement.hasAttribute("data-intro-active"));
    if (s) { goneAt = Date.now() - t0; break; }
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(3000);
  const after = await page.evaluate(() => ({
    shellNull: document.getElementById("hero-shell") === null,
    introActive: document.documentElement.hasAttribute("data-intro-active"),
  }));
  out.checks["heroShell_" + rm] = { atLoad, teardownMs: goneAt, ...after };
  await c.close();
}

// ---- AC3b: fallback timeout path — suppress mas:intro-done ----
{
  const c = await ctx();
  const page = await c.newPage();
  await page.addInitScript(() => {
    const origDispatch = EventTarget.prototype.dispatchEvent;
    window.__suppressedIntroDone = 0;
    EventTarget.prototype.dispatchEvent = function (ev) {
      if (ev && ev.type === "mas:intro-done") { window.__suppressedIntroDone++; return true; }
      return origDispatch.call(this, ev);
    };
  });
  await page.goto(BASE + "/", { waitUntil: "load" });
  const t0 = Date.now();
  await page.waitForTimeout(4000);
  const at4s = await page.evaluate(() => ({
    shell: document.getElementById("hero-shell") !== null,
    introActive: document.documentElement.hasAttribute("data-intro-active"),
    suppressed: window.__suppressedIntroDone,
  }));
  let goneAt = null;
  for (let i = 0; i < 200; i++) {
    const s = await page.evaluate(() =>
      document.getElementById("hero-shell") === null &&
      !document.documentElement.hasAttribute("data-intro-active"));
    if (s) { goneAt = Date.now() - t0; break; }
    await page.waitForTimeout(100);
  }
  const final = await page.evaluate(() => ({
    shellNull: document.getElementById("hero-shell") === null,
    introActive: document.documentElement.hasAttribute("data-intro-active"),
    suppressed: window.__suppressedIntroDone,
  }));
  out.checks.heroShellFallbackTimeout = { at4s, teardownMs: goneAt, ...final };
  await c.close();
}

// ---- AC2/AC4: landing DOM anchors + preload vs rendered hero src ----
{
  const c = await ctx();
  const page = await c.newPage();
  const failedRequests = [];
  page.on("response", (r) => {
    if (r.status() >= 400) failedRequests.push(r.status() + " " + r.url());
  });
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(9000);
  out.checks.landing = await page.evaluate(() => {
    const preloads = [...document.querySelectorAll('link[rel="preload"]')]
      .map((l) => ({ as: l.getAttribute("as"), href: l.getAttribute("href"), type: l.getAttribute("type") }));
    const imagePreloads = preloads.filter((p) => p.as === "image");
    const heroImg = document.querySelector(".tl-part-frame img");
    const ids = ["surec", "nexus", "projeler", "sektorler", "kalite", "sss", "iletisim"];
    const legacyIds = ["top", "hizmetler", "endustriler", "malzemeler", "neden-biz", "kabiliyetler", "referanslar"];
    return {
      preloads,
      imagePreloadCount: imagePreloads.length,
      imagePreloadHref: imagePreloads.length ? imagePreloads[0].href : null,
      heroImgSrc: heroImg ? heroImg.getAttribute("src") : null,
      heroImgCurrentSrc: heroImg ? heroImg.currentSrc : null,
      heroImgComplete: heroImg ? heroImg.complete : null,
      heroImgNaturalWidth: heroImg ? heroImg.naturalWidth : null,
      headerHashes: [...document.querySelectorAll(".tl-header .tl-nav a[href^='#']")]
        .map((a) => a.getAttribute("href").slice(1)),
      anchorPresence: Object.fromEntries(ids.map((id) => [id, document.querySelectorAll("#" + id).length])),
      legacyIdsPresent: Object.fromEntries(legacyIds.map((id) => [id, document.querySelectorAll("#" + id).length])),
      lfClassElements: document.querySelectorAll('[class*="lf-"]').length,
      sectionIdsInMain: [...document.querySelectorAll("main [id]")].map((e) => e.id),
      fullscreenHeaderCount: document.querySelectorAll("[data-fullscreen-header]").length,
      contentinfoCount: document.querySelectorAll("footer, [role=contentinfo]").length,
      technicalLandingRoot: !!document.querySelector('[data-testid="technical-landing-root"]'),
    };
  });
  out.checks.landing.failedRequests = failedRequests;
  await c.close();
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
