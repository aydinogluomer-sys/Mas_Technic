/* QA probe — is the `@media (max-width:767px){.tl-sheet{border-inline:0}}`
 * override effective per route? It moved from `technical-landing.css` into
 * `shell.css` in Phase 04, but `technical-landing.css` still `@import`s
 * `master-grid.css`, so the landing chunk re-declares the base rule.
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://localhost:4200";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const ROUTES = ["/", "/sss", "/hakkimizda", "/teklif-al", "/blog", "/hizmetler/cnc-frezeleme", "/yok-boyle-bir-sayfa"];

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
for (const width of [375, 1280]) {
  const ctx = await browser.newContext({
    viewport: { width, height: width < 768 ? 812 : 800 },
    ...(width < 768 ? { isMobile: true, hasTouch: true } : {}),
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  console.log(`\n===== ${width}px =====`);
  for (const route of ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const r = await page.evaluate(() => {
      const sheet = document.querySelector(".tl-sheet");
      if (!sheet) return { sheet: null };
      const cs = getComputedStyle(sheet);
      const links = [...document.querySelectorAll('link[rel="stylesheet"][href^="/assets"]')].map((l) => l.getAttribute("href"));
      return { borderLeft: cs.borderLeftWidth, borderRight: cs.borderRightWidth, cssLinks: links };
    });
    console.log(`  ${route.padEnd(28)} borderInline=${r.sheet === null ? "NO .tl-sheet" : r.borderLeft + "/" + r.borderRight}   css=${(r.cssLinks ?? []).map((h) => h.split("/").pop()).join(" ")}`);
  }
  await ctx.close();
}
await browser.close();
