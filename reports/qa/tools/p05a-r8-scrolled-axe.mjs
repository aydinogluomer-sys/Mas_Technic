/* QA probe — Phase 05a R8: is the +28 `color-contrast` delta on
 * `/hizmetler/cnc-frezeleme` NEWLY VISIBLE PRE-EXISTING DEBT, or a violation
 * that Phase 05a INTRODUCED?
 *
 * `scripts/motion-audit.mjs --mode=axe` compares two AT-REST states:
 *   reduce, no scroll        -> 28 color-contrast
 *   no-preference, no scroll -> 0   (axe skips opacity:0 nodes)
 * That shows the count rose, and explains WHY it rose, but on its own it
 * cannot distinguish the two hypotheses: it never observes the nodes in a
 * state where a motion-enabled user would actually see them.
 *
 * The discriminator this probe adds: take a MOTION-ENABLED user and SCROLL the
 * whole page so every `whileInView` reveal fires naturally. If the same 28
 * nodes fail there too, the debt is reachable by an ordinary user and has
 * nothing to do with the reduced-motion primitive — it is pre-existing (B24).
 * If they failed ONLY on the reduced path, the primitive would be resolving
 * elements to a state that a normal reveal never produces, i.e. Phase 05a
 * would have introduced them.
 *
 * Also prints the failing colour pairs so the classification can be read, not
 * taken on trust, and so B24's recorded 4.025:1 can be checked as unmoved.
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

async function scan({ motion, scroll }) {
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
    // Walk the whole document so every IntersectionObserver reveal fires.
    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < height; y += 600) {
      await page.evaluate((to) => window.scrollTo(0, to), y);
      await page.waitForTimeout(160);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(900);
  }

  const res = await new AxeBuilder({ page }).analyze();
  const bad = res.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  const contrast = bad.find((v) => v.id === "color-contrast");

  // Distinct target selectors, so the two runs can be compared node-for-node.
  const targets = (contrast?.nodes ?? []).map((n) => n.target.join(" ")).sort();
  const ratios = [...new Set((contrast?.nodes ?? [])
    .map((n) => (n.any?.[0]?.data?.contrastRatio ?? "?") + ":1"))].sort();

  await ctx.close();
  return {
    label: `motion=${motion} scroll=${scroll}`,
    rules: bad.length,
    nodes: bad.reduce((s, v) => s + v.nodes.length, 0),
    breakdown: bad.map((v) => `${v.id}:${v.nodes.length}`).join(" ") || "-",
    contrastNodes: contrast?.nodes.length ?? 0,
    ratios,
    targets,
  };
}

const runs = [
  await scan({ motion: "reduce", scroll: false }),          // what a reduced user sees NOW
  await scan({ motion: "no-preference", scroll: false }),   // the pre-fix hidden set
  await scan({ motion: "no-preference", scroll: true }),    // THE DISCRIMINATOR
  await scan({ motion: "reduce", scroll: true }),
];

console.log(`\nP05a R8 — scrolled-axe discriminator on ${ROUTE} @1280\n`);
for (const r of runs) {
  console.log(`${r.label.padEnd(34)} rules=${r.rules} nodes=${r.nodes}  ${r.breakdown}`);
  if (r.ratios.length) console.log(`${" ".repeat(34)} contrastRatios=${r.ratios.join(" ")}`);
}

const atRestReduced = runs[0];
const scrolledNormal = runs[2];
const shared = atRestReduced.targets.filter((t) => scrolledNormal.targets.includes(t));
const onlyReduced = atRestReduced.targets.filter((t) => !scrolledNormal.targets.includes(t));

console.log(`\ncolor-contrast nodes, reduced-at-rest = ${atRestReduced.contrastNodes}`);
console.log(`color-contrast nodes, normal-user-scrolled = ${scrolledNormal.contrastNodes}`);
console.log(`  shared (pre-existing debt, merely newly visible) = ${shared.length}`);
console.log(`  present ONLY on the reduced path (would be NEWLY INTRODUCED) = ${onlyReduced.length}`);
if (onlyReduced.length) console.log(`  ${onlyReduced.slice(0, 10).join("\n  ")}`);

console.log(
  onlyReduced.length === 0
    ? "\nVERDICT: separation is REAL — every node axe now reports on the reduced\npath is also reported for an ordinary motion-enabled user who scrolls.\nNewly VISIBLE pre-existing debt, not newly INTRODUCED."
    : "\nVERDICT: NOT fully pre-existing — some nodes fail only on the reduced path.",
);

await browser.close();
