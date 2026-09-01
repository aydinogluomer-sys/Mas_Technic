/* QA-owned. AC11 — axe on `/` and a representative inner page, menu CLOSED and
   OPEN, at desktop and mobile. Serious + critical only. */
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.PROBE_BASE_URL ?? "http://localhost:4307";
const exe = [process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined]
  .find((p) => p && existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const all = [];
let bad = 0;

for (const vp of [{ w: 1280, h: 800, m: false }, { w: 375, h: 812, m: true }]) {
  for (const path of ["/", "/hizmetler/cnc-frezeleme"]) {
    for (const open of [false, true]) {
      const c = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: vp.m, hasTouch: vp.m });
      const p = await c.newPage();
      await p.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
      await p.waitForSelector("[data-fullscreen-header]", { state: "attached", timeout: 30000 });
      await p.waitForLoadState("networkidle").catch(() => {});
      await p.waitForFunction(() => !document.getElementById("hero-shell")).catch(() => {});
      await p.waitForTimeout(900);
      if (open) {
        await p.locator("[data-menu-trigger]").click();
        await p.waitForSelector("[data-fullscreen-menu]", { state: "visible", timeout: 15000 });
        // expand the first category so the detail list is in the audited tree
        const cat = p.locator("[data-nav-category]").first();
        if (await cat.getAttribute("aria-expanded") === "false") await cat.click();
        await p.waitForTimeout(900);
      }
      const res = await new AxeBuilder({ page: p }).withTags(TAGS).analyze();
      const sc = res.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      const label = `${vp.w}px ${path} menu-${open ? "OPEN" : "CLOSED"}`;
      console.log(`${sc.length === 0 ? "PASS" : "FAIL"}  ${label.padEnd(46)} serious/critical=${sc.length}  (all impacts=${res.violations.length})`);
      for (const v of sc) console.log(`      ${v.impact} ${v.id}: ${v.nodes.length} node(s) — ${v.nodes[0]?.target?.join(" ")}`);
      if (sc.length) bad += sc.length;
      all.push({ label, serious: sc.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, target: v.nodes[0]?.target })),
                 allImpacts: res.violations.map((v) => `${v.impact}:${v.id}(${v.nodes.length})`) });
      await c.close();
    }
  }
}
writeFileSync("reports/qa/tools/p04-axe-same-tool-results.json", JSON.stringify(all, null, 2));
console.log(`\nTOTAL serious/critical violations: ${bad}`);
await browser.close();
process.exit(bad ? 1 : 0);
