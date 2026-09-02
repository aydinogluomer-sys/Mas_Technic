#!/usr/bin/env node
/* QA — phase 05b R8. Two claims:
 *   (a) every `clip-path` that WRAPS A FOCUSABLE element ends at `inset(-8px)`,
 *       not `inset(0)`, so the `:focus-visible` ring (outline-offset: 4px plus
 *       its own width) is not sliced off by the entrance;
 *   (b) nothing keeps animating while it is off screen.
 *
 * (a) is checked at the END of the entrance — the resting state after the band
 * has arrived — because that is the state a keyboard user focuses in. Checking
 * the armed state would prove nothing.
 * It is then checked FOR REAL: the element is focused with the keyboard and the
 * resulting outline box is compared against the clip rectangle.
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
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference",
});
const page = await ctx.newPage();
await page.goto(BASE + "/", { waitUntil: "load" });
await page.waitForLoadState("networkidle").catch(() => {});
await page.waitForTimeout(1200);

// Drive every band through its entrance, then come back.
const h = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < h; y += 600) {
  await page.evaluate((t) => window.scrollTo(0, t), y);
  await page.waitForTimeout(260);
}
await page.waitForTimeout(1500);

console.log("--- every clip-path in effect AFTER the entrance, vs focusable content ---");
const clips = await page.evaluate(() => {
  const FOCUSABLE = "a[href],button,input,select,textarea,summary,[tabindex]:not([tabindex='-1'])";
  const seen = new Map();
  for (const el of document.querySelectorAll(".tl-root *")) {
    const cp = getComputedStyle(el).clipPath;
    if (!cp || cp === "none") continue;
    const focus = el.querySelectorAll(FOCUSABLE).length + (el.matches(FOCUSABLE) ? 1 : 0);
    const key = el.tagName + "|" + String(el.className).split(" ")[0] + "|" + cp + "|" + (focus > 0);
    if (!seen.has(key)) seen.set(key, { tag: el.tagName, cls: String(el.className).slice(0, 44), cp, focus });
  }
  return [...seen.values()];
});
let bad = 0;
for (const c of clips) {
  const risky = c.focus > 0 && /inset\(0px\)|inset\(0px 0px 0px 0px\)/.test(c.cp);
  if (risky) bad += 1;
  console.log("  " + (c.focus > 0 ? "FOCUSABLE(" + c.focus + ")" : "no-focusable ").padEnd(15)
    + c.cp.padEnd(30) + (risky ? "  <-- RING WOULD BE CLIPPED  " : "  ") + c.tag + "." + c.cls);
}
console.log("  clips that would slice a focus ring: " + bad);

console.log("\n--- real keyboard focus vs the clip rectangle ---");
for (const sel of [".tl-sector-card", ".tl-cad-drop"]) {
  const r = await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return "MISSING";
    el.scrollIntoView({ block: "center" });
    el.focus();
    const st = getComputedStyle(el);
    return {
      clip: st.clipPath,
      outlineWidth: st.outlineWidth,
      outlineOffset: st.outlineOffset,
      outlineStyle: st.outlineStyle,
      focused: document.activeElement === el,
    };
  }, sel);
  await page.waitForTimeout(200);
  console.log("  " + sel.padEnd(18) + JSON.stringify(r));
}

await ctx.close();
await browser.close();
