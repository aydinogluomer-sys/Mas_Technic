#!/usr/bin/env node
/* QA — phase 05b R2, climax 1 (02 hero) measurement correlation.
 *
 * The documented claim (docs/lean/07-motion-system.md, and the block comment
 * at src/styles/technical-landing.css:~975) is that hovering ONE measurement
 * does three things at once:
 *     - the box itself comes forward,
 *     - its guide line on the photograph brightens,
 *     - the CORRESPONDING element in the orthographic passport lights up,
 *   and everything else RECEDES.
 *
 * A first pass suggested only the guide-line half is live. This reads the
 * computed opacity/stroke of every participant in three states so the claim is
 * settled per element rather than per impression.
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

const TARGETS = [
  ".tl-measure-top", ".tl-measure-left", ".tl-measure-finish",
  ".tl-fcf-top", ".tl-fcf-bottom", ".tl-datum",
  ".tl-dim--bore", ".tl-dim--tol", ".tl-dim--height", ".tl-dim--perp", ".tl-dim--finish", ".tl-dim--datum",
  ".tl-pp-body", ".tl-pp-bore", ".tl-pp-holes", ".tl-pp-dim",
];

const READ = (sels) => {
  const out = {};
  for (const sel of sels) {
    const el = document.querySelector(sel);
    if (!el) { out[sel] = "MISSING"; continue; }
    const s = getComputedStyle(el);
    out[sel] = {
      opacity: s.opacity,
      stroke: s.stroke,
      border: s.borderTopColor,
      anim: s.animationName === "none" ? "" : s.animationName,
      fill: s.animationFillMode,
    };
  }
  return out;
};

const browser = await chromium.launch({
  executablePath: chrome(),
  args: ["--disable-dev-shm-usage", "--disable-gpu", "--no-sandbox", "--disable-extensions"],
});
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference",
});
const page = await ctx.newPage();
await page.goto(BASE + "/", { waitUntil: "load" });
await page.waitForLoadState("networkidle").catch(() => {});
await page.waitForTimeout(2600);   // let the DRAW -> LOCK entrance finish

const states = {};
states.NO_HOVER = await page.evaluate(READ, TARGETS);

for (const hoverSel of [".tl-measure-top", ".tl-measure-finish"]) {
  await page.mouse.move(5, 5);
  await page.waitForTimeout(400);
  const ok = await page.locator(hoverSel).first().hover().then(() => true).catch((e) => e.message);
  await page.waitForTimeout(500);
  const hasHover = await page.evaluate((s) => ({
    heroHasDataDim: !!document.querySelector(".tl-hero:has([data-dim]:hover)"),
    heroHasThis: !!document.querySelector(".tl-hero:has(" + s + ":hover)"),
  }), hoverSel);
  states["HOVER " + hoverSel] = { _hoverOk: ok, _selectorsMatch: hasHover, ...await page.evaluate(READ, TARGETS) };
  await page.locator(".tl-hero").first().screenshot({
    path: "reports/qa/tools/shots/p05b-hero-hover-" + hoverSel.replace(/\W+/g, "") + ".png",
  }).catch((e) => console.log("  shot failed: " + e.message));
}
await page.mouse.move(5, 5);
await page.waitForTimeout(400);
await page.locator(".tl-hero").first().screenshot({ path: "reports/qa/tools/shots/p05b-hero-nohover.png" })
  .catch((e) => console.log("  shot failed: " + e.message));

for (const [name, st] of Object.entries(states)) {
  console.log("\n=== " + name + " ===");
  if (st._selectorsMatch) console.log("  :has() selectors matching -> " + JSON.stringify(st._selectorsMatch) + "   hoverCall=" + st._hoverOk);
  for (const sel of TARGETS) {
    const v = st[sel];
    if (v === "MISSING") { console.log("  " + sel.padEnd(20) + " MISSING"); continue; }
    console.log("  " + sel.padEnd(20) + " opacity=" + String(v.opacity).padEnd(6)
      + " stroke=" + String(v.stroke).padEnd(26) + " border=" + String(v.border).padEnd(26)
      + (v.anim ? " anim=" + v.anim + "/" + v.fill : ""));
  }
}

await ctx.close();
await browser.close();
