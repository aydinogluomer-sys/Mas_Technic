/* QA-owned follow-ups:
   (1) axe on two more inner pages to locate the ServiceDetail debt,
   (2) mobile 320/375 menu completeness (accordion expands to the full tree),
   (3) confirm the `#iletisim` 1280 anchor result is a page-bottom limit. */
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.PROBE_BASE_URL ?? "http://localhost:4307";
const exe = [process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined]
  .find((p) => p && existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

console.log("──── (1) axe on further inner pages, 1280, menu closed ────");
for (const path of ["/sss", "/hakkimizda", "/blog", "/malzemeler", "/kvkk", "/teklif-al"]) {
  const c = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await c.newPage();
  await p.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.waitForTimeout(1200);
  const r = await new AxeBuilder({ page: p }).withTags(TAGS).analyze();
  const sc = r.violations.filter((v) => ["serious", "critical"].includes(v.impact));
  console.log(`  ${path.padEnd(22)} serious/critical=${sc.length}${sc.length ? " -> " + sc.map((v) => `${v.id}(${v.nodes.length})`).join(", ") : ""}`);
  await c.close();
}

console.log("\n──── (1b) axe scoped to the navigation only, inner page ────");
{
  const c = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await c.newPage();
  await p.goto(`${BASE}/hizmetler/cnc-frezeleme`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);
  const closed = await new AxeBuilder({ page: p }).withTags(TAGS).include("[data-fullscreen-header]").analyze();
  await p.locator("[data-menu-trigger]").click();
  await p.waitForSelector("[data-fullscreen-menu]", { state: "visible" });
  await p.waitForTimeout(800);
  const open = await new AxeBuilder({ page: p }).withTags(TAGS).include("[data-fullscreen-menu]").analyze();
  const f = (r) => r.violations.filter((v) => ["serious", "critical"].includes(v.impact)).map((v) => `${v.id}(${v.nodes.length})`);
  console.log(`  header only : ${JSON.stringify(f(closed))}`);
  console.log(`  menu only   : ${JSON.stringify(f(open))}`);
  await c.close();
}

console.log("\n──── (2) mobile menu completeness (normal motion) ────");
for (const vp of [{ width: 320, height: 568 }, { width: 375, height: 812 }]) {
  const c = await browser.newContext({ viewport: vp, isMobile: true, hasTouch: true });
  const p = await c.newPage();
  await p.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("[data-fullscreen-header]", { state: "attached" });
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.waitForFunction(() => !document.getElementById("hero-shell")).catch(() => {});
  await p.waitForTimeout(600);
  await p.locator("[data-menu-trigger]").click();
  await p.waitForSelector("[data-fullscreen-menu]", { state: "visible" });
  await p.waitForTimeout(600);
  const menu = p.locator("[data-fullscreen-menu]");
  const initialLinks = await menu.locator("a[href]").count();
  const collected = new Set();
  const families = menu.locator("button[aria-pressed]");
  const famCount = await families.count();
  for (let fi = 0; fi < famCount; fi += 1) {
    await families.nth(fi).click();
    await p.waitForTimeout(200);
    const cats = menu.locator("[data-nav-category]");
    const cc = await cats.count();
    for (let ci = 0; ci < cc; ci += 1) {
      await cats.nth(ci).click();
      await p.waitForTimeout(150);
      for (const h of await menu.locator("a[href]").evaluateAll((ls) => ls.map((l) => l.getAttribute("href")))) collected.add(h);
    }
  }
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(`  ${vp.width}px: families=${famCount} linksBeforeExpand=${initialLinks} distinctHrefsAfterExpand=${collected.size} horizOverflow=${overflow}`);
  await c.close();
}

console.log("\n──── (3) #iletisim at 1280: page-bottom check ────");
{
  const c = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await c.newPage();
  await p.goto(`${BASE}/#iletisim`, { waitUntil: "domcontentloaded" });
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.waitForFunction(() => !document.getElementById("hero-shell")).catch(() => {});
  await p.waitForTimeout(4000);
  console.log("  " + JSON.stringify(await p.evaluate(() => {
    const el = document.getElementById("iletisim");
    const r = el.getBoundingClientRect();
    return {
      scrollY: Math.round(window.scrollY),
      maxScrollY: Math.round(document.documentElement.scrollHeight - window.innerHeight),
      atBottom: Math.round(window.scrollY) >= Math.round(document.documentElement.scrollHeight - window.innerHeight) - 2,
      sectionTop: Math.round(r.top), sectionHeight: Math.round(r.height), viewportH: window.innerHeight,
      docHeight: document.documentElement.scrollHeight,
    };
  })));
  await c.close();
}
await browser.close();
