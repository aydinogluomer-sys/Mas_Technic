/* QA P04-C / R2 — dump the raw numbers the spec's second assertion works on,
 * so we can judge whether it has teeth or passes vacuously.
 *
 * Reimplements the classification in
 * `e2e/landing/shell-cascade-contract.spec.ts:87-134` and prints, per shipped
 * stylesheet, how many BASE and how many MOBILE-OVERRIDE `.tl-sheet`
 * `border-inline` rules it carries. The assertion is
 *     override >= (base > 0 ? 1 : 0)
 * so it only bites on stylesheets with base > 0. If no stylesheet ever has
 * base > 0, the assertion is vacuous.
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:4200";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const browser = await chromium.launch(exe ? { executablePath: exe } : {});

for (const width of [375, 1280]) {
  const ctx = await browser.newContext({
    viewport: { width, height: width < 768 ? 812 : 800 },
    ...(width < 768 ? { isMobile: true, hasTouch: true } : {}),
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const audit = await page.evaluate(() => {
    const results = [];
    const isSheetSelector = (s) => s.split(",").some((p) => p.trim() === ".tl-sheet");
    const isMobileCondition = (c) => {
      const m = /max-width:\s*(\d+(?:\.\d+)?)px/.exec(c);
      return !!m && Number(m[1]) <= 767;
    };
    for (const styleSheet of [...document.styleSheets]) {
      let topLevel;
      try { topLevel = [...styleSheet.cssRules]; } catch { continue; }
      const entry = { href: styleSheet.href?.split("/").pop() ?? "(inline)", base: 0, override: 0, texts: [] };
      const walk = (rules, mobile) => {
        for (const rule of rules) {
          if (rule instanceof CSSMediaRule) { walk([...rule.cssRules], mobile || isMobileCondition(rule.conditionText)); continue; }
          if (rule instanceof CSSSupportsRule || rule instanceof CSSLayerBlockRule) { walk([...rule.cssRules], mobile); continue; }
          if (!(rule instanceof CSSStyleRule)) continue;
          if (!isSheetSelector(rule.selectorText)) continue;
          if (!/border-inline/.test(rule.cssText)) continue;
          if (mobile) entry.override += 1; else entry.base += 1;
          entry.texts.push(`${mobile ? "OVERRIDE" : "BASE    "} ${rule.cssText.slice(0, 150)}`);
        }
      };
      walk(topLevel, false);
      if (entry.base || entry.override) results.push(entry);
    }
    return { results, isMobile: matchMedia("(max-width: 767px)").matches, width: innerWidth };
  });

  console.log(`\n===== / at ${width}px (CSS width ${audit.width}, mobile=${audit.isMobile}) =====`);
  console.log(`stylesheets carrying .tl-sheet border-inline: ${audit.results.length}`);
  let wouldFail = 0;
  let biting = 0;
  for (const e of audit.results) {
    const required = e.base > 0 ? 1 : 0;
    const ok = e.override >= required;
    if (e.base > 0) biting += 1;
    if (!ok) wouldFail += 1;
    console.log(`  ${e.href}: base=${e.base} override=${e.override}  required>=${required}  ${ok ? "ok" : "*** ASSERTION FAILS ***"}`);
    for (const t of e.texts) console.log(`        ${t}`);
  }
  console.log(`  -> stylesheets where the assertion actually bites (base>0): ${biting}`);
  console.log(`  -> stylesheets that would FAIL the assertion: ${wouldFail}`);
  console.log(`  -> VERDICT: ${biting === 0 ? "VACUOUS at this width" : "NON-VACUOUS at this width"}`);
  await ctx.close();
}
await browser.close();
