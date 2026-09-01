/* QA-owned. Phase 03 RE-VERIFICATION.
   `p03-axe-audit.mjs` audited the navigation closed and open, but only in the
   default motion mode. The fix under re-verification changes what is MOUNTED
   under `prefers-reduced-motion: reduce` (the sheet is now rendered by phase
   rather than by a presence library), so the reduced-motion tree is a
   different tree and has to be audited as one. Serious + critical only. */
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.PROBE_BASE_URL ?? "http://localhost:4271";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((p) => p && existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const all = [];
let bad = 0;

for (const vp of [{ w: 1280, h: 800, m: false }, { w: 375, h: 812, m: true }]) {
  for (const path of ["/", "/hizmetler/cnc-frezeleme"]) {
    for (const state of ["closed", "open", "reopened-after-close"]) {
      const c = await browser.newContext({
        viewport: { width: vp.w, height: vp.h }, isMobile: vp.m, hasTouch: vp.m,
        reducedMotion: "reduce",
      });
      const p = await c.newPage();
      await p.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
      await p.waitForSelector("[data-fullscreen-header]", { state: "attached", timeout: 30000 });
      await p.waitForLoadState("networkidle").catch(() => {});
      await p.waitForFunction(() => !document.getElementById("hero-shell")).catch(() => {});
      await p.waitForTimeout(900);

      const openMenu = async () => {
        await p.locator("[data-fullscreen-header] [data-menu-trigger]").first().click();
        await p.waitForSelector("[data-fullscreen-menu]", { state: "visible", timeout: 15000 });
        const cat = p.locator("[data-nav-category]").first();
        if (await cat.getAttribute("aria-expanded") === "false") await cat.click();
        await p.waitForTimeout(700);
      };

      if (state === "open") {
        await openMenu();
      } else if (state === "reopened-after-close") {
        // The state the old code could never reach: a page that has been
        // through a full reduced-motion open/close cycle. Audited because the
        // teardown restores `inert`/`aria-hidden` from saved values, and a
        // restore that puts back the WRONG value is an a11y defect that only
        // shows up on the second cycle.
        await openMenu();
        await p.keyboard.press("Escape");
        await p.waitForSelector("[data-fullscreen-menu]", { state: "detached", timeout: 15000 });
        await p.waitForTimeout(600);
      }

      const res = await new AxeBuilder({ page: p }).withTags(TAGS).analyze();
      const sc = res.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      const label = `RM ${vp.w}px ${path} ${state}`;
      console.log(`${sc.length === 0 ? "PASS" : "FAIL"}  ${label.padEnd(54)} serious/critical=${sc.length}  (all impacts=${res.violations.length})`);
      for (const v of sc) console.log(`      ${v.impact} ${v.id}: ${v.nodes.length} node(s) — ${v.nodes[0]?.target?.join(" ")}`);
      bad += sc.length;
      all.push({
        label,
        serious: sc.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, target: v.nodes[0]?.target })),
        allImpacts: res.violations.map((v) => `${v.impact}:${v.id}(${v.nodes.length})`),
      });
      await c.close();
    }
  }
}
writeFileSync("reports/qa/tools/p03b-axe-reduced-results.json", JSON.stringify(all, null, 2));
console.log(`\nTOTAL serious/critical violations under reduced motion: ${bad}`);
await browser.close();
process.exit(bad ? 1 : 0);
