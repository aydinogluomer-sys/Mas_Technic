/* QA-owned. Capture the reduced-motion modal trap as an image + a final state
   dump, and confirm it reproduces on an inner page too. */
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.PROBE_BASE_URL ?? "http://localhost:4307";
const exe = [process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined]
  .find((p) => p && existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});

for (const [name, path, vp] of [
  ["landing-1280", "/", { width: 1280, height: 800 }],
  ["inner-375", "/hakkimizda", { width: 375, height: 812 }],
]) {
  const c = await browser.newContext({ viewport: vp, isMobile: vp.width < 768, hasTouch: vp.width < 768, reducedMotion: "reduce" });
  const p = await c.newPage();
  await p.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("[data-fullscreen-header]", { state: "attached" });
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.waitForFunction(() => !document.getElementById("hero-shell")).catch(() => {});
  await p.waitForTimeout(800);
  await p.locator("[data-menu-trigger]").click();
  await p.waitForSelector("[data-fullscreen-menu]", { state: "visible" });
  await p.waitForTimeout(600);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(4000);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(4000);
  const stuck = await p.evaluate(() => ({
    url: location.pathname,
    menuStillMounted: document.querySelectorAll("[data-fullscreen-menu]").length,
    bodyOverflow: getComputedStyle(document.body).overflow,
    rootInert: document.getElementById("root")?.hasAttribute("inert"),
  }));
  console.log(`${name} (${path}) after two Escapes + 8s: ${JSON.stringify(stuck)}`);
  await p.screenshot({ path: `reports/qa/tools/crops/reduced-motion-trap-${name}.png`, animations: "disabled" });
  await c.close();
}
await browser.close();
