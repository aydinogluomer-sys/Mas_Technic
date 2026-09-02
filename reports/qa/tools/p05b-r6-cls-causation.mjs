#!/usr/bin/env node
/* QA — phase 05b R6. `--mode=cls` gives a total; it does not answer the
 * acceptance criterion, which is "no major ANIMATION causes layout shift".
 *
 * So the same scripted scroll is run twice on the same build: once with the
 * motion layer live, once under `prefers-reduced-motion: reduce`, where
 * `technical-landing.css` switches the whole layer off (`[data-motion="ready"]`
 * never matches, the last block kills every animation and transition). Any
 * shift present in BOTH runs cannot have been caused by the motion layer.
 *
 * Also records, per entry, whether the manifesto is among the sources — that
 * is the one layout-touching animation in the phase (`letter-spacing`), and
 * the Coder's argument for it is that `strong` is the only box on its line.
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

const VP = process.env.QA_VP === "375" ? { n: "375", w: 375, h: 812 } : { n: "1280", w: 1280, h: 900 };

for (const motion of ["no-preference", "reduce"]) {
  const browser = await chromium.launch({
    executablePath: chrome(),
    args: ["--disable-dev-shm-usage", "--disable-gpu", "--no-sandbox", "--disable-extensions"],
  });
  const ctx = await browser.newContext({
    viewport: { width: VP.w, height: VP.h },
    isMobile: VP.w < 768, hasTouch: VP.w < 768, deviceScaleFactor: 1,
    reducedMotion: motion,
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__shifts = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        window.__shifts.push({
          value: e.value,
          time: Math.round(e.startTime),
          sources: (e.sources || []).map((s) => {
            const n = s.node;
            if (!n || !n.tagName) return "?";
            return n.tagName.toLowerCase() + "." + ((n.getAttribute && n.getAttribute("class")) || "").split(" ")[0];
          }),
        });
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1500);
  const height = await page.evaluate(() => document.body.scrollHeight);
  const step = Math.round(VP.h * 0.75);
  for (let y = 0; y < height; y += step) {
    await page.evaluate((t) => window.scrollTo(0, t), y);
    await page.waitForTimeout(320);
  }
  await page.waitForTimeout(1200);
  const shifts = await page.evaluate(() => window.__shifts);
  const total = shifts.reduce((s, x) => s + x.value, 0);
  const afterLoad = shifts.filter((s) => s.time > 2000);
  console.log("\n=== " + VP.n + "  prefers-reduced-motion: " + motion + " ===");
  console.log("  CLS total = " + total.toFixed(5) + "   entries = " + shifts.length);
  console.log("  of which AFTER 2000ms (i.e. during the scripted scroll, where entrances run):");
  console.log("    count = " + afterLoad.length + "   sum = " + afterLoad.reduce((s, x) => s + x.value, 0).toFixed(5));
  for (const s of shifts.sort((a, b) => b.value - a.value).slice(0, 6)) {
    console.log("    " + s.value.toFixed(5) + " @" + s.time + "ms  " + s.sources.join(", "));
  }
  const manifesto = shifts.filter((s) => s.sources.some((x) => x.includes("manifesto")));
  console.log("  entries naming the manifesto (the letter-spacing close): " + manifesto.length);
  await ctx.close();
  await browser.close();
}
