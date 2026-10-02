/* QA probe — the one FAIL from `probe-trigger-clickability.mjs`:
 * `/malzemeler` at settle=0ms, the menu trigger click did not open the menu.
 *
 * "a trigger click that opened nothing" is one of the three B25 symptoms, so
 * this has to be separated from a plain lazy-chunk race:
 *   · Does the click itself throw, or does it land and open nothing?
 *   · Does the site RECOVER on a second click (race) or stay dead (B25)?
 *   · Does it happen on other heavy routes too?
 *   · Does it happen with the transition curtain suppressed (reduced motion)?
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://localhost:4200";
const ROUNDS = Number(process.env.QA_ROUNDS ?? 10);
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const state = () => ({
  url: location.pathname,
  menuOpen: !!document.querySelector("[data-fullscreen-menu]"),
  expanded: document.querySelector("[data-menu-trigger]")?.getAttribute("aria-expanded") ?? null,
  triggers: document.querySelectorAll("[data-menu-trigger]").length,
  headers: document.querySelectorAll("[data-fullscreen-header]").length,
  mains: document.querySelectorAll("main").length,
  wrappers: document.querySelectorAll("[data-route-transition]").length,
  rootInert: document.getElementById("root")?.hasAttribute("inert") ?? false,
  htmlOverflow: getComputedStyle(document.documentElement).overflow,
  // is the destination page actually mounted yet, or is Suspense showing?
  bootVisible: !!document.querySelector(".shell-boot"),
  shellRoot: document.querySelectorAll(".shell-root").length,
  h1: document.querySelector("h1")?.textContent?.trim().slice(0, 30) ?? null,
});

async function run(label, reducedMotion, route) {
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    ...(reducedMotion ? { reducedMotion: "reduce" } : {}),
  });
  const page = await ctx.newPage();
  console.log(`\n== ${label} — ${route}, ${ROUNDS} rounds, click at settle=0ms ==`);
  let firstClickFailed = 0;
  let neverRecovered = 0;

  for (let i = 1; i <= ROUNDS; i++) {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.evaluate((p) => {
      history.pushState({}, "", p);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }, route);

    // Click immediately, no settle.
    let clickThrew = null;
    try {
      await page.locator("[data-menu-trigger]").first().click({ timeout: 5000 });
    } catch (e) { clickThrew = String(e).split("\n")[0].slice(0, 70); }

    let opened = false;
    try {
      await page.waitForSelector("[data-fullscreen-menu]", { timeout: 3000 });
      opened = true;
    } catch { opened = false; }

    const afterFirst = await page.evaluate(state);

    // RECOVERY: a second click after the page has settled.
    let recovered = false;
    if (!opened) {
      firstClickFailed++;
      await page.waitForTimeout(1500);
      try {
        await page.locator("[data-menu-trigger]").first().click({ timeout: 5000 });
        await page.waitForSelector("[data-fullscreen-menu]", { timeout: 5000 });
        recovered = true;
      } catch { recovered = false; }
      if (!recovered) neverRecovered++;
      console.log(`    round ${i}: FIRST CLICK opened nothing  clickThrew=${clickThrew}  `
        + `state=${JSON.stringify(afterFirst)}  recoveredOnSecondClick=${recovered}`);
    }
    // tidy up
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(300);
  }
  console.log(`  first-click miss: ${firstClickFailed}/${ROUNDS}   never recovered (true stuck state): ${neverRecovered}/${ROUNDS}`);
  await browser.close();
  return { firstClickFailed, neverRecovered };
}

const a = await run("A. motion on", false, "/malzemeler");
const b = await run("B. reduced motion (no curtain at all)", true, "/malzemeler");
const c = await run("C. control — a light route", false, "/kvkk");

console.log("\n===== SUMMARY =====");
console.log(`  /malzemeler, motion on : first-click miss ${a.firstClickFailed}/${ROUNDS}, unrecoverable ${a.neverRecovered}/${ROUNDS}`);
console.log(`  /malzemeler, reduced   : first-click miss ${b.firstClickFailed}/${ROUNDS}, unrecoverable ${b.neverRecovered}/${ROUNDS}`);
console.log(`  /kvkk,        motion on: first-click miss ${c.firstClickFailed}/${ROUNDS}, unrecoverable ${c.neverRecovered}/${ROUNDS}`);
console.log(`  A stuck state means unrecoverable > 0. B25 was unrecoverable in 8/8.`);
