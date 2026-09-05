/**
 * QA PROBE — REACH the error/loading/empty states rather than accept the
 * existence of a component as proof it renders.
 *
 *   1. FORM / CAD FORMAT ERROR — upload an unsupported file on /teklif-al and
 *      read what actually appears, plus its computed styling.
 *   2. EMPTY  — /sss with a query that matches nothing.
 *   3. LOADING — the route Suspense fallback, caught by throttling the chunk.
 *   4. ROUTE ERROR (500 class) — the boundary body, reached by breaking the
 *      lazy chunk request for a routed page.
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(OUT, "shots"), { recursive: true });
const BASE = "http://localhost:4173";
const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });

/* ── 1. CAD / form format error on /teklif-al ─────────────────────────── */
{
  const p = await ctx.newPage();
  await p.goto(BASE + "/teklif-al", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const inputs = await p.locator('input[type="file"]').count();
  console.log(`/teklif-al file inputs: ${inputs}`);
  if (inputs > 0) {
    await p.locator('input[type="file"]').first().setInputFiles({
      name: "qa-not-a-cad-file.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("QA probe — deliberately not a CAD file"),
    });
    await p.waitForTimeout(1500);
    const state = await p.evaluate(() => {
      const nodes = [...document.querySelectorAll("[data-sonner-toast], [role='alert'], [role='status'], .shell-notice, li[data-sonner-toast]")];
      return nodes.map((n) => {
        const cs = getComputedStyle(n);
        return {
          tag: n.tagName.toLowerCase(),
          cls: n.getAttribute("class"),
          role: n.getAttribute("role"),
          sonner: n.hasAttribute("data-sonner-toast"),
          text: n.innerText.replace(/\s+/g, " ").trim().slice(0, 120),
          background: cs.backgroundColor,
          color: cs.color,
          borderRadius: cs.borderRadius,
          border: cs.border,
          boxShadow: cs.boxShadow.slice(0, 60),
          fontFamily: cs.fontFamily.slice(0, 60),
        };
      });
    });
    console.log("REACHED STATE(S) after unsupported upload:");
    console.log(JSON.stringify(state, null, 1));
    await p.screenshot({ path: join(OUT, "shots", "teklifal-format-error.png") });
  }
  await p.close();
}

/* ── 2. /sss empty state ──────────────────────────────────────────────── */
{
  const p = await ctx.newPage();
  await p.goto(BASE + "/sss", { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  await p.locator("#sss-arama").fill("zzzqqq-yok-boyle-bir-soru");
  await p.waitForTimeout(600);
  const empty = await p.evaluate(() => {
    const el = document.querySelector("[data-shell-state='empty']");
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { text: el.innerText.replace(/\s+/g, " ").trim(), borderRadius: cs.borderRadius, background: cs.backgroundColor, fontFamily: cs.fontFamily.slice(0, 40) };
  });
  console.log("\n/sss EMPTY state:", JSON.stringify(empty, null, 1));
  await p.locator("[data-shell-state='empty']").screenshot({ path: join(OUT, "shots", "sss-empty.png") }).catch(() => {});
  await p.close();
}

/* ── 3. LOADING — throttle the lazy chunk ─────────────────────────────── */
{
  const p = await ctx.newPage();
  await p.route("**/assets/KaliteDosyasi-*.js", async (route) => {
    await new Promise((r) => setTimeout(r, 4000));
    await route.continue();
  });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.evaluate(() => window.history.pushState({}, "", "/kalite-dosyasi"));
  await p.goto(BASE + "/kalite-dosyasi", { waitUntil: "commit" });
  await p.waitForTimeout(2500);
  const loading = await p.evaluate(() => {
    const el = document.querySelector("[data-shell-state='loading']");
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { text: el.innerText.replace(/\s+/g, " ").trim(), borderRadius: cs.borderRadius, fontFamily: cs.fontFamily.slice(0, 40) };
  });
  console.log("\nLOADING state:", JSON.stringify(loading, null, 1));
  if (loading) await p.screenshot({ path: join(OUT, "shots", "route-loading.png") });
  await p.close();
}

/* ── 4. ROUTE ERROR — break the lazy chunk ────────────────────────────── */
{
  const p = await ctx.newPage();
  await p.route("**/assets/KaliteDosyasi-*.js", (route) => route.abort("failed"));
  await p.goto(BASE + "/kalite-dosyasi", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(4000);
  const err = await p.evaluate(() => {
    const shell = document.querySelector("[data-shell-state='error']");
    const h1 = document.querySelector("h1");
    return {
      shellRouteError: !!shell,
      h1Count: document.querySelectorAll("h1").length,
      h1: h1?.innerText.replace(/\s+/g, " ").trim(),
      body: (document.querySelector("main") ?? document.body).innerText.replace(/\s+/g, " ").trim().slice(0, 400),
      links: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).slice(0, 12),
      hasHeader: !!document.querySelector("[data-fullscreen-header]"),
      hasFooter: !!document.querySelector("footer.tl-footer"),
    };
  });
  console.log("\nROUTE ERROR state:", JSON.stringify(err, null, 1));
  await p.screenshot({ path: join(OUT, "shots", "route-error.png"), fullPage: false });
  await p.close();
}

await b.close();
