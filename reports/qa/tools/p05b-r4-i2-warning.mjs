#!/usr/bin/env node
/* QA — phase 05b R4 / I2. Two things must both be true of `restingOpacity`:
 *   1. it WARNS in DEV when an opacity keyframe array's maximum is not its
 *      last frame (the "this may be an end-hidden state" tripwire), and
 *   2. the reduced-motion SEMANTICS did not shift — the element must still
 *      rest at the MAXIMUM, exactly as before the change.
 *
 * Run against a DEV server, because `import.meta.env.DEV` strips the warning
 * from the production build. `/giris` renders `FloatingPaths`, whose
 * `opacity: [0.3, 0.6, 0.3]` has max 0.6 != last 0.3 and is the only such call
 * site reachable from a live route.
 */
import { chromium } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:5311";

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
  viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce",
});
const page = await ctx.newPage();
const logs = [];
page.on("console", (m) => logs.push(m.type() + ": " + m.text()));
page.on("pageerror", (e) => logs.push("pageerror: " + e.message));

await page.goto(BASE + "/giris", { waitUntil: "load" });
await page.waitForLoadState("networkidle").catch(() => {});
await page.waitForTimeout(3000);

const relevant = logs.filter((l) => l.includes("shell/motion"));
console.log("--- console lines mentioning [shell/motion] ---");
if (!relevant.length) console.log("  (none)");
for (const l of relevant) console.log("  " + l);
console.log("  distinct: " + new Set(relevant).size + "  total occurrences: " + relevant.length);

console.log("\n--- semantics: where do the pulsing paths actually REST? ---");
const rest = await page.evaluate(() => {
  const out = [];
  for (const p of document.querySelectorAll("svg path")) {
    const s = getComputedStyle(p);
    if (s.animationName !== "none") continue;
    const o = Number.parseFloat(s.opacity);
    if (o > 0 && o < 1) out.push({ o, d: (p.getAttribute("d") || "").slice(0, 18) });
  }
  const vals = [...new Set(out.map((x) => x.o))].sort((a, b) => a - b);
  return { count: out.length, distinctOpacities: vals };
});
console.log("  " + JSON.stringify(rest));
console.log("  expected: 0.6 present (the MAXIMUM of [0.3, 0.6, 0.3]); 0.3 (the last frame) must NOT be the resting value");

await ctx.close();
await browser.close();
