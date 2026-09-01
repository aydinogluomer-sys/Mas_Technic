/* QA probe — is the global menu trigger clickable on every public route,
 * both on direct load and after a client navigation? Chases the `/blog`
 * `locator.click` timeout seen in `probe-ac8-diagnose.mjs` step 4.
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://localhost:4200";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const ROUTES = ["/", "/blog", "/sss", "/hakkimizda", "/iletisim", "/malzemeler", "/teklif-al",
  "/hizmetler/cnc-frezeleme", "/kvkk", "/__not-a-route__"];

const diag = () => {
  const t = document.querySelector("[data-menu-trigger]");
  if (!t) return { present: false };
  const r = t.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const hit = document.elementFromPoint(cx, cy);
  const cs = getComputedStyle(t);
  return {
    present: true,
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    inViewport: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth,
    visibility: cs.visibility, display: cs.display, opacity: cs.opacity, pointerEvents: cs.pointerEvents,
    disabled: t.disabled ?? false,
    hitIsTrigger: !!hit && (hit === t || t.contains(hit)),
    hitElement: hit ? `${hit.tagName}.${String(hit.className).slice(0, 60)}` : null,
    rootInert: document.getElementById("root")?.hasAttribute("inert") ?? false,
    curtains: document.querySelectorAll("[data-route-curtain]").length,
    curtainPointerEvents: [...document.querySelectorAll("[data-route-curtain-panel],.route-curtain-label")]
      .map((n) => getComputedStyle(n).pointerEvents),
  };
};

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

console.log("== A. DIRECT LOAD of each route: is the trigger clickable? ==");
for (const route of ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const d = await page.evaluate(diag);
  let clicked = "n/a";
  try {
    await page.locator("[data-menu-trigger]").first().click({ timeout: 5000 });
    await page.waitForSelector("[data-fullscreen-menu]", { timeout: 5000 });
    clicked = "OK";
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  } catch (e) { clicked = "FAIL: " + String(e).split("\n")[0].slice(0, 90); }
  console.log(`  ${route.padEnd(26)} click=${clicked}`);
  if (clicked !== "OK") console.log("      diag=" + JSON.stringify(d));
}

console.log("\n== B. AFTER A CLIENT NAVIGATION into each route, at several settle delays ==");
for (const route of ROUTES.slice(1)) {
  for (const settle of [0, 300, 1000]) {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.locator("[data-menu-trigger]").first().click();
    await page.waitForSelector("[data-fullscreen-menu]", { timeout: 5000 });
    // navigate by URL through the router rather than by label, to avoid
    // ambiguous accessible names.
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await page.evaluate((p) => {
      history.pushState({}, "", p);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }, route);
    await page.waitForTimeout(settle);
    let clicked;
    try {
      await page.locator("[data-menu-trigger]").first().click({ timeout: 5000 });
      await page.waitForSelector("[data-fullscreen-menu]", { timeout: 5000 });
      clicked = "OK";
    } catch (e) { clicked = "FAIL"; }
    if (clicked !== "OK") {
      const d = await page.evaluate(diag);
      console.log(`  ${route.padEnd(26)} settle=${String(settle).padStart(4)}ms  ${clicked}   diag=${JSON.stringify(d)}`);
    } else {
      console.log(`  ${route.padEnd(26)} settle=${String(settle).padStart(4)}ms  ${clicked}`);
    }
  }
}

console.log("\n== C. the ambiguous accessible name found in the menu ==");
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.locator("[data-menu-trigger]").first().click();
await page.waitForSelector("[data-fullscreen-menu]", { timeout: 5000 });
const dupes = await page.evaluate(() => {
  const links = [...document.querySelectorAll("[data-fullscreen-menu] a")];
  const byName = new Map();
  for (const a of links) {
    // approximate the accessible name: text of nodes that are not aria-hidden
    const clone = a.cloneNode(true);
    clone.querySelectorAll("[aria-hidden='true']").forEach((n) => n.remove());
    const name = (a.getAttribute("aria-label") ?? clone.textContent).replace(/\s+/g, " ").trim();
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(a.getAttribute("href"));
  }
  return [...byName.entries()].filter(([, hrefs]) => hrefs.length > 1);
});
console.log("  duplicate accessible names in the open menu: " + JSON.stringify(dupes));

await browser.close();
