/* QA probe — AC8 follow-up: diagnose the single failure from
 * `probe-transition.mjs` ("the site is still fully navigable after the
 * hammering"). Is it a stuck transition state, or a flaw in the probe?
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://localhost:4200";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const snapshot = () => ({
  url: location.pathname + location.hash,
  trigger: document.querySelectorAll("[data-menu-trigger]").length,
  triggerLabel: document.querySelector("[data-menu-trigger]")?.getAttribute("aria-label") ?? null,
  triggerExpanded: document.querySelector("[data-menu-trigger]")?.getAttribute("aria-expanded") ?? null,
  menuOpen: !!document.querySelector("[data-fullscreen-menu]"),
  rootInert: document.getElementById("root")?.hasAttribute("inert") ?? false,
  htmlOverflow: getComputedStyle(document.documentElement).overflow,
  wrappers: document.querySelectorAll("[data-route-transition]").length,
  headers: document.querySelectorAll("[data-fullscreen-header]").length,
  mains: document.querySelectorAll("main").length,
  curtains: document.querySelectorAll("[data-route-curtain]").length,
  // What is actually on top at the centre of the viewport?
  topAtCentre: (() => {
    const el = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
    return el ? `${el.tagName}.${(el.className || "").toString().slice(0, 50)}` : null;
  })(),
  iletisimLinks: [...document.querySelectorAll("a")].filter((a) => a.textContent.trim() === "İletişim").length,
});

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

console.log("== reproducing the hammering loop, with a snapshot after every iteration ==");
for (let i = 0; i < 6; i++) {
  await page.locator("[data-menu-trigger]").first().click();
  await page.waitForSelector("[data-fullscreen-menu]", { timeout: 5000 });
  await page.getByRole("link", { name: "Hakkımızda", exact: true }).first().click();
  await page.waitForTimeout(80);
  await page.mouse.click(640, 400).catch(() => {});
  await page.waitForTimeout(60);
  await page.goBack().catch(() => {});
  await page.waitForTimeout(120);
  await page.goForward().catch(() => {});
  await page.waitForTimeout(300);
  const s = await page.evaluate(snapshot);
  console.log(`  iter ${i}: ${JSON.stringify(s)}`);
}

await page.waitForTimeout(3000);
console.log("\n== settled state 3s after the loop ==");
let s = await page.evaluate(snapshot);
console.log("  " + JSON.stringify(s, null, 2).replace(/\n/g, "\n  "));

console.log("\n== step 1: can the menu trigger be clicked and does the menu open? ==");
try {
  await page.locator("[data-menu-trigger]").first().click({ timeout: 5000 });
  console.log("  trigger click: OK");
  await page.waitForSelector("[data-fullscreen-menu]", { timeout: 5000 });
  console.log("  menu opened: OK");
} catch (e) {
  console.log("  FAILED: " + String(e).split("\n")[0]);
}

s = await page.evaluate(snapshot);
console.log(`  after opening: menuOpen=${s.menuOpen} iletisimLinks=${s.iletisimLinks}`);

console.log("\n== step 2: how many links are named exactly 'İletişim' in the open menu? ==");
const names = await page.evaluate(() =>
  [...document.querySelectorAll("[data-fullscreen-menu] a")]
    .map((a) => ({ text: a.textContent.trim(), href: a.getAttribute("href"), aria: a.getAttribute("aria-label") }))
    .filter((a) => a.text.includes("letişim") || (a.aria ?? "").includes("letişim")));
console.log("  " + JSON.stringify(names));

console.log("\n== step 3: click it and see whether navigation happens ==");
try {
  await page.getByRole("link", { name: "İletişim", exact: true }).first().click({ timeout: 5000 });
  await page.waitForURL("**/iletisim", { timeout: 10000 });
  console.log("  navigated to /iletisim: OK");
} catch (e) {
  console.log("  FAILED: " + String(e).split("\n").slice(0, 4).join(" | "));
  console.log("  state now: " + JSON.stringify(await page.evaluate(snapshot)));
}

console.log("\n== step 4: is the site navigable by ANY route from here? ==");
for (const target of ["/sss", "/blog", "/"]) {
  try {
    await page.locator("[data-menu-trigger]").first().click({ timeout: 5000 });
    await page.waitForSelector("[data-fullscreen-menu]", { timeout: 5000 });
    const label = { "/sss": "Sık Sorulanlar", "/blog": "Teknik Günlük", "/": "Ana Sayfa" }[target];
    await page.getByRole("link", { name: label, exact: true }).first().click({ timeout: 5000 });
    await page.waitForURL(`**${target === "/" ? "/" : target}`, { timeout: 10000 });
    console.log(`  ${target}: OK`);
  } catch (e) {
    console.log(`  ${target}: FAILED — ${String(e).split("\n")[0]}`);
  }
  await page.waitForTimeout(500);
}

await browser.close();
