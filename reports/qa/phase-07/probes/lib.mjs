// QA Phase 07 — shared probe harness.
// Read-only against the production preview build on http://localhost:4173.
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

export const BASE = process.env.QA_BASE ?? "http://localhost:4173";

export async function launch() {
  return chromium.launch({
    ...(EXECUTABLE ? { executablePath: EXECUTABLE } : {}),
  });
}

/** A context matching the visual/critical project shape. */
export async function ctx(browser, { width, height, mobile = false, reduce = true } = {}) {
  return browser.newContext({
    viewport: { width, height },
    ...(mobile ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}),
    reducedMotion: reduce ? "reduce" : "no-preference",
  });
}

/** Navigate and let the shell settle without trusting any app-owned flag. */
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

export function log(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + "\n");
}
