/* QA-owned. Phase 03 RE-VERIFICATION, R6.
   MENU_SETTLE_FALLBACK_MS = 900 is claimed to be a FLOOR, not the schedule:
   under full motion `onAnimationComplete` should settle the close at roughly
   NAV_MOTION.open (620ms) and the timer should never be what is observed;
   under reduced motion the settle should be immediate.

   Measures wall time from the Escape keypress to the sheet leaving the DOM.
   If full-motion closes cluster at ~900ms the accelerator is dead and only the
   net is running — still correct, but the claim would be false. Read-only. */
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.PROBE_BASE_URL ?? "http://localhost:4271";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((p) => p && existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});

for (const rm of ["no-preference", "reduce"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: rm });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/hakkimizda`, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("[data-fullscreen-header]", { state: "attached" });
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.waitForTimeout(600);

  const samples = [];
  for (let i = 0; i < 5; i++) {
    await p.locator("[data-fullscreen-header] [data-menu-trigger]").first().click();
    await p.waitForSelector("[data-fullscreen-menu]", { state: "visible" });
    await p.waitForTimeout(1200); // let the open settle completely
    const t0 = Date.now();
    await p.keyboard.press("Escape");
    await p.waitForFunction(() => !document.querySelector("[data-fullscreen-menu]"), null, { timeout: 5000 });
    samples.push(Date.now() - t0);
    await p.waitForTimeout(500);
  }
  const avg = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
  console.log(`${rm.padEnd(14)} escape -> unmount ms: [${samples.join(", ")}]  avg=${avg}`);
  await p.close();
  await ctx.close();
}
await browser.close();
