/* QA-owned. Phase 03 RE-VERIFICATION, R7.
   `navigation-reachability.spec.ts` › "keeps deep links and history navigation
   correct" fails intermittently at its last step: with the menu OPEN, a
   `goForward()` changes the URL but `[data-fullscreen-menu]` is still mounted.

   The disclosure calls this deterministic under PLAYWRIGHT_ARTIFACTS=0 and
   green in the canonical config. Measured here instead:

     - is the latch permanent or transient?
     - is the reader stranded (scroll lock / inert / aria-hidden held over a
       page they did not open the menu from), or merely slow?
     - does the SAME thing happen on goBack, and on a plain in-app link?

   N repeats, long polls, no test-runner assertions in the way. Read-only. */
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.PROBE_BASE_URL ?? "http://localhost:4271";
const RUNS = Number(process.env.PROBE_RUNS ?? 8);
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((p) => p && existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});

const snap = (p) => p.evaluate(() => {
  const root = document.getElementById("root");
  return {
    menuCount: document.querySelectorAll("[data-fullscreen-menu]").length,
    headerCount: document.querySelectorAll("[data-fullscreen-header]").length,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    rootInert: root ? root.hasAttribute("inert") : null,
    rootAriaHidden: root ? root.getAttribute("aria-hidden") : null,
    path: location.pathname + location.hash,
  };
});

let latched = 0;
let permanent = 0;
const durations = [];

for (let run = 1; run <= RUNS; run++) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();

  // Build the same two-entry history the spec builds.
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
  await p.waitForTimeout(1500);

  // The step under test: open the menu, then move FORWARD in history.
  await p.locator("[data-fullscreen-header] [data-menu-trigger]").first().click();
  await p.waitForSelector("[data-fullscreen-menu]", { state: "visible" });
  await p.waitForTimeout(300);
  const open = await snap(p);
  const t0 = Date.now();
  await p.goForward();

  // Poll far longer than the spec's 5s, to separate "slow" from "stuck".
  let cleared = null;
  let last = open;
  const end = Date.now() + 30000;
  while (Date.now() < end) {
    last = await snap(p);
    if (last.path.startsWith("/hakkimizda") && last.menuCount === 0) { cleared = Date.now() - t0; break; }
    await p.waitForTimeout(100);
  }

  if (cleared === null) {
    latched++;
    // Is the reader stranded, and can they get out at all?
    const stranded = last.htmlOverflow === "hidden" || last.rootInert === true || last.rootAriaHidden === "true";
    await p.keyboard.press("Escape");
    await p.waitForTimeout(1500);
    const afterEsc = await snap(p);
    const recovered = afterEsc.menuCount === 0 && afterEsc.rootInert === false && afterEsc.htmlOverflow !== "hidden";
    if (!recovered) permanent++;
    console.log(`run ${run}: LATCHED after 30s  ${JSON.stringify(last)}  stranded=${stranded} escapeRecovers=${recovered}`);
  } else {
    durations.push(cleared);
    console.log(`run ${run}: cleared in ${cleared}ms  ${JSON.stringify(last)}`);
  }
  await p.close();
  await ctx.close();
}
await browser.close();
console.log(`\nRUNS ${RUNS}  cleared ${RUNS - latched}  latched>30s ${latched}  unrecoverable ${permanent}`);
if (durations.length) {
  console.log(`clear times ms: [${durations.join(", ")}]  max=${Math.max(...durations)}`);
}
