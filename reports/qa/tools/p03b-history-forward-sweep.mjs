/* QA-owned. Phase 03 RE-VERIFICATION, R7 part 2.
   The single-timing probe cleared 8/8 in ~550ms, but the spec's failure
   snapshot shows a LIVE `dialog "Ana menü"` sitting over a fully mounted
   /hakkimizda for more than 5s. So the latch is timing-dependent, and the
   question that decides the verdict is whether it is (a) reachable by a human
   and (b) permanent or self-clearing.

   Sweeps the two delays the spec and the probe differ on:
     settleAfterBack  — how long the landing is left to remount before opening
     openToForward    — how long the menu is left open before the history move

   For every latched cell it then measures how long the menu ACTUALLY stays,
   up to 30s, and whether Escape recovers. Read-only. */
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.PROBE_BASE_URL ?? "http://localhost:4271";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((p) => p && existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});

const snap = (p) => p.evaluate(() => {
  const root = document.getElementById("root");
  const menu = document.querySelector("[data-fullscreen-menu]");
  return {
    menuCount: document.querySelectorAll("[data-fullscreen-menu]").length,
    menuVisible: menu ? getComputedStyle(menu).visibility !== "hidden" && Number(getComputedStyle(menu).opacity) > 0 : false,
    headerCount: document.querySelectorAll("[data-fullscreen-header]").length,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    rootInert: root ? root.hasAttribute("inert") : null,
    rootAriaHidden: root ? root.getAttribute("aria-hidden") : null,
    path: location.pathname,
  };
});

for (const settleAfterBack of [200, 600, 1500]) {
  for (const openToForward of [80, 300, 1000]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const p = await ctx.newPage();
    let verdict;
    try {
      await p.goto(`${BASE}/#sektorler`, { waitUntil: "domcontentloaded" });
      await p.waitForSelector("[data-fullscreen-header]", { state: "attached" });
      await p.waitForFunction(() => !document.getElementById("hero-shell"), null, { timeout: 20000 }).catch(() => {});
      await p.waitForTimeout(1200);
      await p.locator("[data-fullscreen-header] [data-menu-trigger]").first().click();
      await p.waitForSelector("[data-fullscreen-menu]", { state: "visible" });
      await p.locator("[data-fullscreen-menu]").getByRole("link", { name: "Hakkımızda" }).first().click();
      await p.waitForFunction(() => location.pathname === "/hakkimizda", null, { timeout: 15000 });
      await p.waitForTimeout(800);
      await p.goBack();
      await p.waitForFunction(() => location.pathname === "/", null, { timeout: 15000 });
      await p.waitForTimeout(settleAfterBack);

      await p.locator("[data-fullscreen-header] [data-menu-trigger]").first().click({ timeout: 8000 });
      await p.waitForSelector("[data-fullscreen-menu]", { state: "visible", timeout: 8000 });
      await p.waitForTimeout(openToForward);
      const t0 = Date.now();
      await p.goForward();

      let cleared = null;
      let last;
      const end = Date.now() + 30000;
      for (;;) {
        last = await snap(p);
        if (last.path.startsWith("/hakkimizda") && last.menuCount === 0) { cleared = Date.now() - t0; break; }
        if (Date.now() > end) break;
        await p.waitForTimeout(100);
      }
      if (cleared !== null) {
        verdict = `cleared in ${cleared}ms`;
      } else {
        await p.keyboard.press("Escape");
        await p.waitForTimeout(1500);
        const afterEsc = await snap(p);
        const recovered = afterEsc.menuCount === 0 && afterEsc.rootInert === false && afterEsc.htmlOverflow !== "hidden";
        verdict = `LATCHED >30s ${JSON.stringify(last)} escapeRecovers=${recovered}`;
      }
    } catch (err) {
      verdict = `threw: ${String(err).slice(0, 120)}`;
    }
    console.log(`settleAfterBack=${String(settleAfterBack).padStart(4)}ms openToForward=${String(openToForward).padStart(4)}ms -> ${verdict}`);
    await p.close();
    await ctx.close();
  }
}
await browser.close();
