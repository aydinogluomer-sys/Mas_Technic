/* QA probe — Phase 05a R8, follow-up.
 *
 * `p05a-r8-scrolled-axe.mjs` found 28 color-contrast nodes on BOTH the
 * reduced-at-rest path and the ordinary motion-enabled-and-scrolled path, with
 * identical contrast ratios (4.03:1, 4.3:1) — but 6 of axe's `target`
 * SELECTOR STRINGS differed. A selector string is not a node identity: axe
 * synthesises the shortest unique CSS path, which can change when unrelated
 * siblings differ. Comparing on it can manufacture a phantom difference.
 *
 * So compare on the thing that actually identifies the element: its own
 * outerHTML snippet (which axe returns as `node.html`) plus the resolved
 * foreground/background colours axe measured. If those sets match, the two
 * runs are reporting the SAME elements and the delta is purely "these became
 * visible", i.e. pre-existing B24 debt.
 */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://localhost:4188";
const ROUTE = "/hizmetler/cnc-frezeleme";

const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const browser = await chromium.launch(exe ? { executablePath: exe } : {});

async function contrastNodes({ motion, scroll }) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: motion,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${ROUTE}`, { waitUntil: "load" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1200);
  if (scroll) {
    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < height; y += 600) {
      await page.evaluate((to) => window.scrollTo(0, to), y);
      await page.waitForTimeout(160);
    }
    await page.waitForTimeout(900);
    // NOTE: deliberately do NOT scroll back to top — returning to the top can
    // re-hide `whileInView` elements that lack `once:true` and would falsify
    // the comparison.
  }
  const res = await new AxeBuilder({ page }).analyze();
  const v = res.violations.find((x) => x.id === "color-contrast");
  const out = (v?.nodes ?? []).map((n) => {
    const d = n.any?.[0]?.data ?? {};
    return {
      key: `${(n.html ?? "").replace(/\s+/g, " ").trim()}|${d.fgColor}|${d.bgColor}|${d.contrastRatio}`,
      html: (n.html ?? "").replace(/\s+/g, " ").trim().slice(0, 110),
      fg: d.fgColor, bg: d.bgColor, ratio: d.contrastRatio,
    };
  });
  await ctx.close();
  return out;
}

const reduced = await contrastNodes({ motion: "reduce", scroll: false });
const normal = await contrastNodes({ motion: "no-preference", scroll: true });

const rKeys = reduced.map((n) => n.key).sort();
const nKeys = normal.map((n) => n.key).sort();
const onlyR = rKeys.filter((k) => !nKeys.includes(k));
const onlyN = nKeys.filter((k) => !rKeys.includes(k));

console.log(`\nP05a R8 — node-identity comparison on ${ROUTE} @1280\n`);
console.log(`reduced, at rest (no scroll)      : ${reduced.length} color-contrast nodes`);
console.log(`no-preference, scrolled naturally : ${normal.length} color-contrast nodes`);
console.log(`identical nodes in both           : ${rKeys.filter((k) => nKeys.includes(k)).length}`);
console.log(`only on the reduced path          : ${onlyR.length}`);
console.log(`only on the normal-scrolled path  : ${onlyN.length}`);

const ratios = [...new Set(reduced.map((n) => n.ratio))].sort();
console.log(`\ncontrast ratios measured (reduced): ${ratios.join(", ")}`);
console.log(`B24 baseline of record is 4.025:1 against a 4.5:1 requirement.`);

console.log(`\nDistinct failing colour pairs (reduced path):`);
for (const pair of [...new Set(reduced.map((n) => `${n.fg} on ${n.bg} = ${n.ratio}:1`))].sort()) {
  console.log(`  ${pair}  x${reduced.filter((n) => `${n.fg} on ${n.bg} = ${n.ratio}:1` === pair).length}`);
}

if (onlyR.length) {
  console.log(`\nNodes ONLY on the reduced path:`);
  for (const k of onlyR.slice(0, 8)) console.log(`  ${reduced.find((n) => n.key === k)?.html}`);
}

console.log(
  onlyR.length === 0
    ? `\nVERDICT: node sets are IDENTICAL. The +28 is newly VISIBLE pre-existing\ndebt (B24), not newly INTRODUCED by Phase 05a. The earlier 6-selector\ndifference was an axe selector-string artifact.`
    : `\nVERDICT: ${onlyR.length} node(s) genuinely differ — inspect above.`,
);

await browser.close();
