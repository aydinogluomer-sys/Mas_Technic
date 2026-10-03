/* QA 09b-1 R2 — where do the gate's "grounds" actually come from?
   The first CSS mutation aimed at `[data-shell-surface="paper"]` and the gate
   stayed green. Before concluding anything about the gate, find out whether
   the selector matched at all. `groundOf` prefers `.tl-band[data-band-tone]`
   over `[data-shell-surface]`, so "paper" in the census may be a BAND tone and
   not a surface. Measure, then aim again. */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { guard, canary, chromiumExecutable } from "./probe-lib.mjs";
import { preview, URL_BASE, CENSUS_SRC } from "./09b1r2-lib.mjs";

const OUT = "reports/qa/phase-09b1r2";
mkdirSync(OUT, { recursive: true });
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };

const ROUTES = ["/iletisim", "/hakkimizda", "/sss", "/malzemeler", "/"];

const run = async () => {
  const stop = await preview();
  const browser = await chromium.launch(chromiumExecutable() ? { executablePath: chromiumExecutable() } : {});
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    await guard(ctx, []);
    const page = await ctx.newPage();
    await page.goto(`${URL_BASE}/`, { waitUntil: "domcontentloaded" });
    await canary(page, log);
    log("");
    for (const route of ROUTES) {
      await page.goto(`${URL_BASE}${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("#root", { state: "visible", timeout: 20_000 });
      const dl = Date.now() + 20_000;
      while (await page.locator(".shell-boot").count() && Date.now() < dl) await page.waitForTimeout(200);
      await page.evaluate(async () => { await document.fonts?.ready; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
      const info = await page.evaluate(() => ({
        surfaces: Array.from(document.querySelectorAll("[data-shell-surface]")).map((e) => `${e.tagName.toLowerCase()}[${e.getAttribute("data-shell-surface")}]`),
        tones: Array.from(document.querySelectorAll("[data-band-tone]")).map((e) => `${e.tagName.toLowerCase()}[${e.getAttribute("data-band-tone")}]`),
        titleBlocks: Array.from(document.querySelectorAll(".shell-title-block")).map((e) => {
          const s = getComputedStyle(e);
          const band = e.closest(".tl-band[data-band-tone]");
          const root = e.closest("[data-shell-surface]");
          return {
            classes: e.className,
            surfaceAncestor: root ? root.getAttribute("data-shell-surface") : null,
            bandAncestor: band ? band.getAttribute("data-band-tone") : null,
            matchesPaperSurfaceRule: e.matches('[data-shell-surface="paper"] .shell-title-block'),
            fp: [s.fontFamily.split(",")[0].replace(/["']/g, ""), s.fontSize, s.fontWeight, s.fontStyle, s.letterSpacing, s.textTransform].join(" / "),
          };
        }),
        mutationPresent: Array.from(document.styleSheets).some((ss) => {
          try { return Array.from(ss.cssRules).some((r) => r.cssText.includes("09b1r2") || (r.selectorText || "").includes('[data-shell-surface="paper"] .shell-title-block')); }
          catch { return false; }
        }),
      }));
      log(`── ${route}`);
      log(`  [data-shell-surface] elements: ${[...new Set(info.surfaces)].join(", ") || "(none)"}`);
      log(`  [data-band-tone] elements    : ${[...new Set(info.tones)].join(", ") || "(none)"}`);
      log(`  mutation rule present in CSSOM: ${info.mutationPresent}`);
      for (const t of info.titleBlocks) {
        log(`  .shell-title-block  surface=${t.surfaceAncestor} bandTone=${t.bandAncestor} matchesMutationSelector=${t.matchesPaperSurfaceRule}`);
        log(`      classes="${t.classes}"  fp=${t.fp}`);
      }
      log("");
    }
  } finally {
    await browser.close();
    await stop();
    writeFileSync(`${OUT}/ground-recon.txt`, lines.join("\n") + "\n");
  }
};
run().catch((e) => { lines.push(`PROBE ERROR: ${e && e.stack}`); writeFileSync(`${OUT}/ground-recon.txt`, lines.join("\n") + "\n"); console.error(e); process.exit(1); });
