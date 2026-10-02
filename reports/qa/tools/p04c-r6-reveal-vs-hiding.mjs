/* QA P04-C / R6 — is the axe node-count drop a reveal-timing SAMPLING artefact
 * or is content genuinely HIDDEN FROM ASSISTIVE TECHNOLOGY?
 *
 * The distinction that decides it:
 *   opacity:0                     -> still in the a11y tree, still read by a
 *                                    screen reader, still focusable. axe skips
 *                                    COLOUR checks because it cannot sample a
 *                                    ground. Sampling artefact.
 *   display:none / visibility:hidden / aria-hidden=true / inert
 *                                 -> removed from the a11y tree. REAL DEFECT.
 *
 *   QA_BASE=... QA_REDUCED=1 node p04c-r6-reveal-vs-hiding.mjs
 */
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:4200";
const ROUTE = "/hizmetler/cnc-frezeleme";
const REDUCED = process.env.QA_REDUCED === "1";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
  ...(REDUCED ? { reducedMotion: "reduce" } : {}),
});
const page = await ctx.newPage();
await page.goto(`${BASE}${ROUTE}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const label = `${BASE} reducedMotion=${REDUCED ? "reduce" : "no-preference"}`;
console.log(`\n############ ${label} ############`);

/* --- how AT-visibility is judged, applied to every element carrying text --- */
const visibilityCensus = () => page.evaluate(() => {
  const hiddenFromAT = (el) => {
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.display === "none") return "display:none";
      if (s.visibility === "hidden" || s.visibility === "collapse") return `visibility:${s.visibility}`;
      if (n.getAttribute("aria-hidden") === "true") return "aria-hidden=true";
      if (n.hasAttribute("inert")) return "inert";
      if (s.contentVisibility === "hidden") return "content-visibility:hidden";
    }
    return null;
  };
  const zeroOpacity = (el) => {
    for (let n = el; n; n = n.parentElement) {
      if (Number(getComputedStyle(n).opacity) === 0) return true;
    }
    return false;
  };

  const main = document.querySelector("main#main-content") ?? document.body;
  let textNodes = 0, atHidden = 0, opacityZeroOnly = 0, fullyVisible = 0;
  const hiddenReasons = {};
  for (const el of main.querySelectorAll("*")) {
    // only leaf-ish elements that actually carry their own text
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue;
    textNodes += 1;
    const reason = hiddenFromAT(el);
    if (reason) { atHidden += 1; hiddenReasons[reason] = (hiddenReasons[reason] ?? 0) + 1; continue; }
    if (zeroOpacity(el)) opacityZeroOnly += 1; else fullyVisible += 1;
  }
  return { textNodes, atHidden, hiddenReasons, opacityZeroOnly, fullyVisible };
});

const axeCount = async () => {
  const r = await new AxeBuilder({ page }).analyze();
  const nodes = r.violations.reduce((n, v) => n + v.nodes.length, 0);
  const byImpact = {};
  for (const v of r.violations) byImpact[v.impact] = (byImpact[v.impact] ?? 0) + v.nodes.length;
  return { nodes, byImpact, rules: r.violations.map((v) => `${v.id} x${v.nodes.length}`) };
};

const atRestVis = await visibilityCensus();
const atRestAxe = await axeCount();
console.log(`\n[AT REST, no scroll]`);
console.log(`   axe violation nodes: ${atRestAxe.nodes}   ${JSON.stringify(atRestAxe.byImpact)}`);
console.log(`   rules: ${atRestAxe.rules.join(", ")}`);
console.log(`   text-bearing elements in <main>: ${atRestVis.textNodes}`);
console.log(`      hidden FROM ASSISTIVE TECH : ${atRestVis.atHidden}  ${JSON.stringify(atRestVis.hiddenReasons)}`);
console.log(`      opacity:0 only (STILL in a11y tree): ${atRestVis.opacityZeroOnly}`);
console.log(`      fully visible              : ${atRestVis.fullyVisible}`);

/* --- full scroll pass, then settle --- */
await page.evaluate(async () => {
  const max = document.documentElement.scrollHeight;
  for (let y = 0; y < max; y += 300) {
    window.scrollTo(0, y);
    await new Promise((r) => requestAnimationFrame(() => r()));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(2500);

const afterVis = await visibilityCensus();
const afterAxe = await axeCount();
console.log(`\n[AFTER A FULL SCROLL PASS]`);
console.log(`   axe violation nodes: ${afterAxe.nodes}   ${JSON.stringify(afterAxe.byImpact)}`);
console.log(`   rules: ${afterAxe.rules.join(", ")}`);
console.log(`   text-bearing elements in <main>: ${afterVis.textNodes}`);
console.log(`      hidden FROM ASSISTIVE TECH : ${afterVis.atHidden}  ${JSON.stringify(afterVis.hiddenReasons)}`);
console.log(`      opacity:0 only (STILL in a11y tree): ${afterVis.opacityZeroOnly}`);
console.log(`      fully visible              : ${afterVis.fullyVisible}`);

/* --- name the elements that ARE hidden from AT, so both builds can be compared --- */
const hiddenList = await page.evaluate(() => {
  const main = document.querySelector("main#main-content") ?? document.body;
  const out = [];
  for (const el of main.querySelectorAll("*")) {
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue;
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      const why = s.display === "none" ? "display:none"
        : (s.visibility === "hidden" || s.visibility === "collapse") ? `visibility:${s.visibility}`
        : n.getAttribute("aria-hidden") === "true" ? "aria-hidden=true"
        : n.hasAttribute("inert") ? "inert" : null;
      if (why) {
        out.push({
          why,
          tag: el.tagName.toLowerCase(),
          text: el.textContent.trim().slice(0, 50),
          onAncestor: n !== el ? String(n.className).slice(0, 45) : "(self)",
        });
        break;
      }
    }
  }
  return out;
});
console.log(`\n[ELEMENTS HIDDEN FROM ASSISTIVE TECH] ${hiddenList.length}`);
for (const h of hiddenList) console.log(`   ${h.why}  <${h.tag}> "${h.text}"  via ${h.onAncestor}`);

await browser.close();
