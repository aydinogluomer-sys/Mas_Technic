#!/usr/bin/env node
/* QA — phase 05b RE-VERIFICATION, R6.
 *
 * The Coder flagged its own trade-off: the isolation dims non-hovered
 * measurement TEXT to .34, which must drop its contrast. It is not enough to
 * agree in principle — the question is how far below 4.5:1 it goes, because
 * "transiently 4.3" and "transiently 1.6" are different decisions.
 *
 * These boxes sit on a photograph, so the composited colour cannot be
 * computed from the stylesheet alone. This reads RENDERED PIXELS: it captures
 * the hero at 1440 at rest and while each state is hovered, and for every
 * measurement box takes the luminance of the glyph pixels against the
 * luminance of the local backdrop inside the same box.
 *
 * Percentiles, not extrema: a single stray pixel from antialiasing or the
 * photograph would otherwise set the answer.
 */
import { createRequire } from "node:module";
import { chromium } from "@playwright/test";
import { existsSync, readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { PNG } = require("playwright-core/lib/utilsBundle");

const BASE = process.env.QA_BASE_URL ?? "http://localhost:4211";
const OUT = "reports/qa/tools/shots";
mkdirSync(OUT, { recursive: true });

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

const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const relL = (r, g, b) => 0.2126 * lin(r / 255) + 0.7152 * lin(g / 255) + 0.0722 * lin(b / 255);
const ratio = (a, b) => { const [x, y] = [a, b].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)))];

const MEASURES = [".tl-measure-top", ".tl-measure-left", ".tl-measure-finish", ".tl-fcf-top", ".tl-fcf-bottom", ".tl-datum"];

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
await page.waitForTimeout(2800);

/** Contrast of glyph pixels against local backdrop, inside one box, from a full-page shot. */
async function measure(label, hovered) {
  const file = join(OUT, `p05c-r6-${label}.png`);
  await page.screenshot({ path: file });
  const png = PNG.sync.read(require("node:fs").readFileSync(file));

  const boxes = await page.evaluate((sels) => {
    const out = {};
    for (const s of sels) {
      const el = document.querySelector(s);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      out[s] = {
        x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
        opacity: Number.parseFloat(getComputedStyle(el).opacity),
        color: getComputedStyle(el).color,
      };
    }
    return out;
  }, MEASURES);

  console.log(`\n=== ${label}${hovered ? `  (pointer on ${hovered})` : "  (at rest)"} ===`);
  for (const sel of MEASURES) {
    const b = boxes[sel];
    if (!b) { console.log(`  ${sel.padEnd(20)} MISSING`); continue; }
    const ls = [];
    for (let y = b.y + 1; y < Math.min(b.y + b.h - 1, png.height); y += 1) {
      for (let x = b.x + 1; x < Math.min(b.x + b.w - 1, png.width); x += 1) {
        const i = (png.width * y + x) << 2;
        ls.push(relL(png.data[i], png.data[i + 1], png.data[i + 2]));
      }
    }
    if (ls.length < 40) { console.log(`  ${sel.padEnd(20)} too small to sample`); continue; }
    ls.sort((p, q) => p - q);
    // Glyph = the bright tail, backdrop = the dark bulk (light type on a dark plate).
    const back = pct(ls, 0.25);
    const glyph = pct(ls, 0.97);
    const cr = ratio(glyph, back);
    const flag = cr >= 4.5 ? "AA " : cr >= 3 ? "AA-large" : "FAIL";
    console.log(`  ${sel.padEnd(20)} opacity=${b.opacity.toFixed(2)}  glyphL=${glyph.toFixed(4)}  backL=${back.toFixed(4)}  contrast=${cr.toFixed(2)}:1  ${flag}`);
  }
}

await page.mouse.move(4, 4);
await page.waitForTimeout(400);
await measure("rest", null);

await page.locator(".tl-measure-top").first().hover();
await page.waitForTimeout(450);
await measure("hover-measure-top", ".tl-measure-top");

await page.mouse.move(4, 4);
await page.waitForTimeout(500);

/* Is any information pointer-gated? Compare the accessible text of the hero
   between the two states — if it is identical, dimming costs appearance and
   not content. */
const text = async () => page.evaluate(() => document.querySelector(".tl-hero")?.innerText.replace(/\s+/g, " ").trim());
const restText = await text();
await page.locator(".tl-measure-top").first().hover();
await page.waitForTimeout(400);
const hoverText = await text();
console.log(`\naccessible text identical in both states: ${restText === hoverText}`);
console.log(`  rest : ${JSON.stringify(restText?.slice(0, 120))}`);
console.log(`  hover: ${JSON.stringify(hoverText?.slice(0, 120))}`);

/* And is the state reachable/persistent without a pointer? */
const kb = await page.evaluate(() => ({
  focusable: Array.from(document.querySelectorAll(".tl-hero [data-dim]"))
    .map((el) => ({ tag: el.tagName.toLowerCase(), tabindex: el.getAttribute("tabindex"), role: el.getAttribute("role") })),
  ariaHidden: Array.from(document.querySelectorAll(".tl-hero [data-dim]"))
    .map((el) => `${el.className}=${el.getAttribute("aria-hidden")}`),
}));
console.log("\ncorrelation targets, keyboard/AT exposure: " + JSON.stringify(kb, null, 2));

await ctx.close();
await browser.close();
