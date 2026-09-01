/* QA probe — AC12 / B24 delta on `/hizmetler/cnc-frezeleme`.
 *
 * Same-tool comparison (`p03-axe-audit.mjs` re-run on the Phase 04 build)
 * showed two changes against the Phase 03 baseline:
 *   · `color-contrast` x28  ->  0        (apparently "fixed")
 *   · `scrollable-region-focusable` x1 -> x2   (worsened)
 *
 * Neither may be taken at face value:
 *   · a contrast finding disappears just as readily because the element stopped
 *     being rendered as because its colours were fixed;
 *   · a second scrollable region is a NEW serious node and must be attributed.
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://localhost:4200";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(`${BASE}/hizmetler/cnc-frezeleme`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

console.log("== 1. Are the elements B24 flagged still rendered? ==");
console.log("   Phase 03 target: '.py-4.hover\\:bg-primary\\/5.px-4:nth-child(1) > .w-7.h-7.group-hover\\:bg-primary'");
const b24 = await page.evaluate(() => {
  const rows = [...document.querySelectorAll(".py-4.px-4")];
  const chips = [...document.querySelectorAll(".w-7.h-7")];
  const sample = chips.slice(0, 3).map((el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      cls: el.className.slice(0, 70),
      color: cs.color, background: cs.backgroundColor,
      visible: r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none",
      text: el.textContent.trim().slice(0, 20),
    };
  });
  return { rowCount: rows.length, chipCount: chips.length, sample };
});
console.log("   " + JSON.stringify(b24, null, 2).replace(/\n/g, "\n   "));

console.log("\n== 2. Every horizontally scrollable region, and whether it has a focus stop ==");
const scrollables = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    const scrollsX = el.scrollWidth > el.clientWidth + 1
      && ["auto", "scroll"].includes(cs.overflowX);
    const scrollsY = el.scrollHeight > el.clientHeight + 1
      && ["auto", "scroll"].includes(cs.overflowY);
    if (!scrollsX && !scrollsY) continue;
    const focusable = el.matches("a[href],button,input,select,textarea,[tabindex]")
      || !!el.querySelector("a[href],button,input,select,textarea,[tabindex]:not([tabindex='-1'])");
    out.push({
      tag: el.tagName,
      cls: String(el.className).slice(0, 70),
      scrollWidth: el.scrollWidth, clientWidth: el.clientWidth,
      overflowX: cs.overflowX,
      hasTabindex: el.hasAttribute("tabindex"),
      containsFocusable: focusable,
      inMain: !!el.closest("main"),
      captionOrNearestHeading: el.closest("section,article,div[class*='border']")?.querySelector("h2,h3")?.textContent?.trim().slice(0, 40) ?? null,
    });
  }
  return out;
});
console.log("   " + JSON.stringify(scrollables, null, 2).replace(/\n/g, "\n   "));

console.log("\n== 3. How wide is the content field on this page, and what is the rail costing? ==");
const geom = await page.evaluate(() => {
  const main = document.querySelector("main");
  const rail = document.querySelector(".shell-rail");
  const sheet = document.querySelector(".tl-sheet");
  const r = (e) => e ? { l: Math.round(e.getBoundingClientRect().left), w: Math.round(e.getBoundingClientRect().width) } : null;
  return {
    viewport: innerWidth,
    sheet: r(sheet),
    main: r(main),
    rail: r(rail),
    railVar: getComputedStyle(document.documentElement).getPropertyValue("--tl-rail").trim(),
    firstChildOfMain: (() => {
      const c = [...(main?.children ?? [])].find((n) => !n.classList.contains("shell-rail"));
      return r(c);
    })(),
  };
});
console.log("   " + JSON.stringify(geom, null, 2).replace(/\n/g, "\n   "));

console.log("\n== 4. The same page at a width where the rail costs nothing (the old shell had no rail) ==");
// Simulate the pre-Phase-04 content width by widening the viewport by the rail.
await page.setViewportSize({ width: 1280 + Math.round(geom.rail?.w ?? 64), height: 800 });
await page.waitForTimeout(1200);
const wider = await page.evaluate(() => {
  let n = 0;
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (el.scrollWidth > el.clientWidth + 1 && ["auto", "scroll"].includes(cs.overflowX)) n++;
  }
  return n;
});
console.log(`   horizontally scrollable regions at ${1280 + Math.round(geom.rail?.w ?? 64)}px: ${wider}`);
await page.setViewportSize({ width: 1280, height: 800 });
await page.waitForTimeout(1200);
const atBase = await page.evaluate(() => {
  let n = 0;
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (el.scrollWidth > el.clientWidth + 1 && ["auto", "scroll"].includes(cs.overflowX)) n++;
  }
  return n;
});
console.log(`   horizontally scrollable regions at 1280px:            ${atBase}`);

await browser.close();
