#!/usr/bin/env node
/* QA — phase 05b RE-VERIFICATION, R5.
 *
 * The Coder reports one first-run visual flake, `visual-375 › notfound
 * carries the same shell chrome`, ~1px wordmark shift, and argues its diff
 * cannot reach that route. The argument is testable rather than rhetorical,
 * so this tests it under the SAME conditions the golden project uses
 * (`reducedMotion: "reduce"`, 375x812, mobile emulation):
 *
 *   1. is `.tl-hero` — the ancestor every changed selector requires —
 *      present on the 404 route at all?
 *   2. is the landing stylesheet that carries the changed rules even loaded
 *      there?
 *   3. does `tl-label-lock-*` exist as an applied animation under reduced
 *      motion anywhere, including on `/`?
 *   4. does the captured element (`[data-fullscreen-header]`, which holds the
 *      wordmark) intersect the hero subtree on any route?
 *
 * If all four say no, the diff has no path to that pixel and the flake is a
 * settle race, not a regression.
 */
import { chromium } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:4211";

function chrome() {
  const c = [
    process.env.ProgramFiles && join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe"),
    process.env["ProgramFiles(x86)"] && join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe"),
  ].filter(Boolean).find(existsSync);
  if (c) return c;
  const root = join(process.env.LOCALAPPDATA, "ms-playwright");
  return readdirSync(root).filter((e) => e.startsWith("chromium-"))
    .map((e) => join(root, e, "chrome-win", "chrome.exe")).find(existsSync);
}

const browser = await chromium.launch({
  executablePath: chrome(),
  args: ["--disable-dev-shm-usage", "--disable-gpu", "--no-sandbox", "--disable-extensions"],
});

for (const path of ["/__phase04-not-a-route__", "/"]) {
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true,
    deviceScaleFactor: 1, reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "load" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(2500);

  const seen = await page.evaluate(() => {
    const header = document.querySelector("[data-fullscreen-header]");
    const hero = document.querySelector(".tl-hero");
    // Does any loaded sheet carry the rules this correction touched?
    let carriesChangedRules = false;
    let sheetHrefs = [];
    const walk = (rules) => {
      for (const r of rules) {
        if (r.selectorText && r.selectorText.includes(":has([data-dim]:hover)")) carriesChangedRules = true;
        if (r.name && /^tl-label-lock-/.test(r.name)) carriesChangedRules = true;
        if (r.cssRules) { try { walk(r.cssRules); } catch { /* noop */ } }
      }
    };
    for (const s of document.styleSheets) {
      sheetHrefs.push((s.href ?? "inline").split("/").pop());
      try { walk(s.cssRules); } catch { /* noop */ }
    }
    // Is the label-lock animation actually running/filled anywhere?
    const animated = Array.from(document.querySelectorAll("*"))
      .filter((el) => /tl-label-lock/.test(getComputedStyle(el).animationName))
      .map((el) => el.className?.baseVal ?? el.className);
    return {
      route: location.pathname,
      dataMotion: document.querySelector(".tl-root")?.getAttribute("data-motion") ?? "(no .tl-root)",
      hasHero: !!hero,
      hasHeader: !!header,
      headerContainsHero: !!(header && hero && header.contains(hero)),
      wordmark: document.querySelector("[data-fullscreen-header] a[href='/'], [data-fullscreen-header] a")?.textContent?.trim().slice(0, 40) ?? null,
      elementsWithLabelLock: animated,
      carriesChangedRules,
      sheets: sheetHrefs,
    };
  });
  console.log("\n=== " + path + " (375, reduced motion — the golden project's own conditions) ===");
  console.log(JSON.stringify(seen, null, 2));
  await ctx.close();
}

await browser.close();
