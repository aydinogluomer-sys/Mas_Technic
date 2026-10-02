/* QA-owned. Isolate the ESC-close failure observed at 320/375 under reduced
   motion: is it viewport, reduced-motion, or both? Poll for up to 12s and also
   try the close button and a trigger click as controls. */
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.PROBE_BASE_URL ?? "http://localhost:4307";
const exe = [process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined]
  .find((p) => p && existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});

const cases = [
  { name: "1280 no-reduce", vp: { width: 1280, height: 800 }, mobile: false, reduced: false },
  { name: "1280 reduce", vp: { width: 1280, height: 800 }, mobile: false, reduced: true },
  { name: "375 no-reduce", vp: { width: 375, height: 812 }, mobile: true, reduced: false },
  { name: "375 reduce", vp: { width: 375, height: 812 }, mobile: true, reduced: true },
  { name: "320 reduce", vp: { width: 320, height: 568 }, mobile: true, reduced: true },
];

for (const cs of cases) {
  const c = await browser.newContext({
    viewport: cs.vp, isMobile: cs.mobile, hasTouch: cs.mobile,
    reducedMotion: cs.reduced ? "reduce" : "no-preference",
  });
  const p = await c.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  p.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 200)}`); });
  await p.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("[data-fullscreen-header]", { state: "attached" });
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.waitForFunction(() => !document.getElementById("hero-shell")).catch(() => {});
  await p.waitForTimeout(600);

  // --- 1. ESC
  await p.locator("[data-menu-trigger]").click();
  await p.waitForSelector("[data-fullscreen-menu]", { state: "visible" });
  await p.waitForTimeout(700);
  const focusedBefore = await p.evaluate(() => document.activeElement
    ? `${document.activeElement.tagName}:${(document.activeElement.getAttribute("aria-label") || document.activeElement.textContent || "").trim().slice(0, 24)}` : "NONE");
  const t0 = Date.now();
  await p.keyboard.press("Escape");
  let escMs = null;
  for (let i = 0; i < 120; i += 1) {
    const n = await p.evaluate(() => document.querySelectorAll("[data-fullscreen-menu]").length);
    if (n === 0) { escMs = Date.now() - t0; break; }
    await p.waitForTimeout(100);
  }
  const stateAfterEsc = await p.evaluate(() => {
    const m = document.querySelector("[data-fullscreen-menu]");
    return m ? { present: true, opacity: getComputedStyle(m).opacity, clip: getComputedStyle(m).clipPath,
                 anims: m.getAnimations({ subtree: true }).map((a) => `${a.playState}`).join(",") || "none" }
             : { present: false };
  });

  // --- 2. control: close button (if ESC failed, is the close path itself broken?)
  let btnMs = null;
  if (escMs === null) {
    const t1 = Date.now();
    await p.locator("[data-fullscreen-menu] [data-menu-trigger]").click().catch(() => {});
    for (let i = 0; i < 100; i += 1) {
      const n = await p.evaluate(() => document.querySelectorAll("[data-fullscreen-menu]").length);
      if (n === 0) { btnMs = Date.now() - t1; break; }
      await p.waitForTimeout(100);
    }
  }

  console.log(`${cs.name.padEnd(16)} focusInDialog=${focusedBefore.padEnd(28)} ESC-close=${escMs === null ? "NEVER(>12s)" : escMs + "ms"}  closeBtn=${btnMs === null ? (escMs === null ? "NEVER" : "n/a") : btnMs + "ms"}  after=${JSON.stringify(stateAfterEsc)}  errors=${errors.length ? JSON.stringify(errors.slice(0, 2)) : "none"}`);
  await c.close();
}
await browser.close();
