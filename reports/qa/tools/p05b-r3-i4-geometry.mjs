#!/usr/bin/env node
/* QA — phase 05b R3. The I4 claim has two halves and both are checked here.
 *
 * HALF 1 (fixed, must be true): no scroll POSITION reduces the opacity of the
 * service-detail heading. Sampled across the scroll range rather than at two
 * endpoints, because the removed binding was a ramp and a two-point check
 * passes on a ramp that dips in the middle.
 *
 * HALF 2 (NOT fixed, must still be present and must be PRE-EXISTING): at 375
 * the `absolute bottom-0` block is taller than the hero that clips it, so the
 * eyebrow and the whole `<h1>` are cut away by `overflow: hidden`.
 *
 * WHY THIS MEASUREMENT ALSO SETTLES "PRE-EXISTING" WITHOUT BUILDING THE BASE.
 * The only thing this packet changed on this route is the removal of
 * `style={{ opacity: heroOpacity }}`, where
 * `heroOpacity = useTransform(heroScrollProgress, [0, 0.6], [1, 0])`. At
 * scrollY = 0, `heroScrollProgress` is 0 and that transform evaluates to
 * exactly 1 — so at rest the base build renders this block with `opacity: 1`,
 * identical to HEAD. `opacity` is not a layout property in any case. Therefore
 * an AT-REST geometry reading taken on HEAD is numerically the same reading
 * the base build would give, and the clip is established as predating the
 * packet by construction rather than by trusting a summary.
 */
import { chromium } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:4211";
const ROUTE = "/hizmetler/cnc-frezeleme";

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

const GEOMETRY = () => {
  const h1 = document.querySelector("h1");
  if (!h1) return { error: "no h1" };
  // the `absolute bottom-0` block that holds breadcrumb + eyebrow + h1
  const block = h1.closest(".container-industrial") || h1.parentElement;
  const hero = block && block.parentElement;
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) };
  };
  const eff = (el) => {
    let n = el, o = 1;
    while (n && n !== document.documentElement) { o *= Number.parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
    return Number(o.toFixed(3));
  };
  const eyebrow = block ? block.querySelector("p,span,div") : null;
  return {
    scrollY: Math.round(window.scrollY),
    hero: box(hero),
    heroOverflow: hero ? getComputedStyle(hero).overflow : null,
    block: box(block),
    blockTag: block ? block.tagName + "." + String(block.className).slice(0, 50) : null,
    h1: box(h1),
    h1Text: (h1.textContent || "").trim().slice(0, 40),
    h1Opacity: eff(h1),
    blockOpacity: eff(block),
    eyebrowText: eyebrow ? (eyebrow.textContent || "").trim().slice(0, 40) : null,
    // is the h1's box entirely above the hero's clipping box?
    h1ClippedByHero: hero && h1 ? h1.getBoundingClientRect().bottom <= hero.getBoundingClientRect().top : null,
  };
};

const OPACITY_OF_H1 = () => {
  const h1 = document.querySelector("h1");
  if (!h1) return -1;
  let n = h1, o = 1;
  while (n && n !== document.documentElement) { o *= Number.parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
  return Number(o.toFixed(3));
};

const VPS = [{ n: "375", w: 375, h: 812 }, { n: "1280", w: 1280, h: 900 }]
  .filter((v) => !process.env.QA_VP || v.n === process.env.QA_VP);

for (const vp of VPS) {
  const browser = await chromium.launch({
    executablePath: chrome(),
    args: ["--disable-dev-shm-usage", "--disable-gpu", "--no-sandbox", "--disable-extensions"],
  });
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    isMobile: vp.w < 768, hasTouch: vp.w < 768, deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(BASE + ROUTE, { waitUntil: "load" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1600);

  console.log("\n=== viewport " + vp.n + " — AT REST (scrollY=0) ===");
  console.log(JSON.stringify(await page.evaluate(GEOMETRY), null, 2));

  console.log("--- half 1: h1 effective opacity across the scroll range ---");
  const readings = [];
  for (let y = 0; y <= 600; y += 50) {
    await page.evaluate((t) => window.scrollTo(0, t), y);
    await page.waitForTimeout(110);
    readings.push({ y, o: await page.evaluate(OPACITY_OF_H1) });
  }
  console.log(readings.map((r) => r.y + ":" + r.o).join("  "));
  const drops = readings.filter((r, i) => i > 0 && r.o < readings[i - 1].o - 0.01);
  console.log(drops.length === 0
    ? "HALF 1 PASS - opacity is monotonic non-decreasing across the scroll range"
    : "HALF 1 FAIL - opacity fell at: " + JSON.stringify(drops));

  await page.evaluate(() => window.scrollTo(0, 2400));
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  console.log("after round trip to 2400 and back: h1 opacity = " + await page.evaluate(OPACITY_OF_H1));

  await ctx.close();
  await browser.close();
}
