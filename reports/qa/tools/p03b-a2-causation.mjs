/* QA-owned. Phase 03 RE-VERIFICATION, R3 follow-up.
   A2 in p03b-teardown-adversarial.mjs showed the pending navigation NOT
   happening when Escape is spammed immediately after a menu link is clicked.
   Two readings are possible and they have very different verdicts:

     (a) the close dropped the pending navigation  -> a teardown defect;
     (b) Escape deliberately cancelled it          -> the documented dismissal
         semantics, since the modal keydown handler explicitly nulls
         `pendingHref` before requesting the close.

   This isolates the cause: same click, three different follow-ups. Read-only. */
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
  return {
    menuCount: document.querySelectorAll("[data-fullscreen-menu]").length,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    rootInert: root ? root.hasAttribute("inert") : null,
    rootAriaHidden: root ? root.getAttribute("aria-hidden") : null,
    path: location.pathname,
    historyLength: history.length,
  };
});

async function run(rm, label, follow) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: rm });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("[data-fullscreen-header]", { state: "attached" });
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.waitForFunction(() => !document.getElementById("hero-shell"), null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(500);
  const before = await snap(p);
  await p.locator("[data-fullscreen-header] [data-menu-trigger]").first().click();
  await p.waitForSelector("[data-fullscreen-menu]", { state: "visible" });
  await p.waitForTimeout(200);
  await p.locator("[data-fullscreen-menu]").getByRole("link", { name: "Sık Sorulanlar", exact: true }).first().click();
  await follow(p);
  await p.waitForTimeout(2500);
  const after = await snap(p);
  const released = after.menuCount === 0 && after.rootInert === false
    && after.rootAriaHidden === null && after.htmlOverflow !== "hidden";
  console.log(`${rm === "reduce" ? "RM" : "FM"} ${label.padEnd(34)} path=${after.path.padEnd(12)} historyDelta=${after.historyLength - before.historyLength} released=${released}`);
  await p.close();
  await ctx.close();
}

for (const rm of ["reduce", "no-preference"]) {
  await run(rm, "no follow-up", async () => {});
  await run(rm, "Escape x5 immediately", async (p) => {
    for (let i = 0; i < 5; i++) { await p.keyboard.press("Escape"); await p.waitForTimeout(10); }
  });
  await run(rm, "Escape x5 after 400ms", async (p) => {
    await p.waitForTimeout(400);
    for (let i = 0; i < 5; i++) { await p.keyboard.press("Escape"); await p.waitForTimeout(10); }
  });
  await run(rm, "unrelated key (KeyA) x5", async (p) => {
    for (let i = 0; i < 5; i++) { await p.keyboard.press("a"); await p.waitForTimeout(10); }
  });
}
await browser.close();
