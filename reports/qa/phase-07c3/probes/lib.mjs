// QA round 3 — shared probe harness. Read-only against MY OWN preview build.
// Port 4917 on purpose: 4173 and 4183 were already occupied by other agents'
// servers in this run, and a census taken against someone else's bundle is not
// evidence about this tree.
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const CANDIDATES = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  process.env.ProgramFiles
    ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe")
    : undefined,
];
export const EXECUTABLE = CANDIDATES.find((c) => !!c && existsSync(c));
export const BASE = process.env.QA_BASE ?? "http://localhost:4917";

export async function launch() {
  return chromium.launch({ ...(EXECUTABLE ? { executablePath: EXECUTABLE } : {}) });
}
export async function ctx(browser, { width, height, mobile = false, reduce = true } = {}) {
  return browser.newContext({
    viewport: { width, height },
    ...(mobile ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}),
    reducedMotion: reduce ? "reduce" : "no-preference",
  });
}
export async function goto(page, path, { settle = true } = {}) {
  await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector(".shell-root, #root main, body", { timeout: 30_000 });
  if (settle) {
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.evaluate(async () => {
      await document.fonts.ready.catch(() => {});
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
  }
}
export function log(obj) { process.stdout.write(JSON.stringify(obj, null, 2) + "\n"); }
