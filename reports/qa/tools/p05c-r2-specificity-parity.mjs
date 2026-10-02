#!/usr/bin/env node
/* QA — phase 05b RE-VERIFICATION, R2 second half.
 *
 * The stylesheet now claims a SPECIFICITY CONTRACT: isolation and correlation
 * are deliberately held at the same weight, (0,4,0), so that source order —
 * isolation first, correlation second — is what decides.
 *
 * Observing that the correlation wins today does not prove parity. It is
 * equally consistent with the correlation simply being MORE specific. The two
 * hypotheses differ in exactly one observable: under parity, reversing the
 * source order must flip the outcome; under "correlation is more specific",
 * reversing the order must change nothing.
 *
 * So this reverses them in place on the live CSSOM and reads the result.
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
  viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference",
});
const page = await ctx.newPage();
await page.goto(BASE + "/", { waitUntil: "load" });
await page.waitForLoadState("networkidle").catch(() => {});
await page.waitForTimeout(2600);

const read = () => page.evaluate(() => ({
  hovered: getComputedStyle(document.querySelector(".tl-measure-top")).opacity,
  guide: getComputedStyle(document.querySelector(".tl-dim--bore")).opacity,
  passport: getComputedStyle(document.querySelector(".tl-pp-bore")).opacity,
  other: getComputedStyle(document.querySelector(".tl-measure-finish")).opacity,
}));

await page.locator(".tl-measure-top").first().hover();
await page.waitForTimeout(420);
console.log("shipped order  (isolation, then correlation):", JSON.stringify(await read()));

const swapped = await page.evaluate(() => {
  const find = (container, out) => {
    const rules = container.cssRules;
    if (!rules) return out;
    for (let i = 0; i < rules.length; i += 1) {
      const r = rules[i];
      if (r.type === CSSRule.STYLE_RULE && r.selectorText) {
        if (r.selectorText.includes(":has([data-dim]:hover)")) out.isolation = { container, index: i, text: r.cssText };
        if (r.selectorText.includes(":has(.tl-measure-top:hover)") && /opacity:\s*1/.test(r.cssText)) {
          out.correlation = { container, index: i, text: r.cssText };
        }
      }
      if (r.cssRules) { try { find(r, out); } catch { /* noop */ } }
    }
    return out;
  };
  const hit = {};
  for (const s of document.styleSheets) { try { find(s, hit); } catch { /* noop */ } }
  if (!hit.isolation || !hit.correlation) return { ok: false, hit: Object.keys(hit) };
  const { container } = hit.isolation;
  const iso = hit.isolation.text;
  const cor = hit.correlation.text;
  const iIdx = hit.isolation.index;
  const cIdx = hit.correlation.index;
  if (hit.correlation.container !== container) return { ok: false, why: "different containers" };
  // Delete the higher index first so the lower index stays valid.
  const [hi, lo] = iIdx > cIdx ? [iIdx, cIdx] : [cIdx, iIdx];
  const hiText = hi === iIdx ? iso : cor;
  const loText = lo === iIdx ? iso : cor;
  container.deleteRule(hi);
  container.deleteRule(lo);
  container.insertRule(hiText, lo);   // what was LAST is now FIRST
  container.insertRule(loText, lo + 1);
  return { ok: true, isolationIndexWas: iIdx, correlationIndexWas: cIdx, nowFirst: hiText.slice(0, 70) };
});
console.log("swap result:", JSON.stringify(swapped));

await page.mouse.move(4, 4);
await page.waitForTimeout(300);
await page.locator(".tl-measure-top").first().hover();
await page.waitForTimeout(420);
const after = await read();
console.log("reversed order (correlation, then isolation):", JSON.stringify(after));

const flipped = Number(after.hovered) < 0.5 && Number(after.guide) < 0.5;
console.log(flipped
  ? "\nPARITY CONFIRMED — reversing source order reverses the winner, so the two rules are equally specific."
  : "\nPARITY NOT CONFIRMED — order made no difference, so the correlation is winning on specificity, not order.");

await ctx.close();
await browser.close();
process.exit(flipped ? 0 : 1);
