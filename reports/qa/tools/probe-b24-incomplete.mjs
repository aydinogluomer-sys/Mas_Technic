/* QA probe — did B24's 28 `color-contrast` nodes get FIXED, or did they move
 * to axe's `incomplete` bucket (undetermined background), which is not a fix?
 */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://localhost:4200";
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
for (const width of [1280, 375]) {
  const ctx = await browser.newContext({
    viewport: { width, height: width < 768 ? 812 : 800 },
    ...(width < 768 ? { isMobile: true, hasTouch: true } : {}),
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/hizmetler/cnc-frezeleme`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const res = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  console.log(`\n===== ${width}px /hizmetler/cnc-frezeleme =====`);
  console.log("  violations (all impacts):");
  for (const v of res.violations) console.log(`    ${v.impact} ${v.id} x${v.nodes.length}`);
  if (!res.violations.length) console.log("    (none)");
  console.log("  INCOMPLETE (axe could not decide — NOT a pass):");
  for (const v of res.incomplete) {
    console.log(`    ${v.impact ?? "?"} ${v.id} x${v.nodes.length}`);
    for (const n of v.nodes.slice(0, 3)) {
      const msg = (n.any?.[0]?.message ?? "").replace(/\s+/g, " ").slice(0, 150);
      console.log(`        ${n.target.join(" ")}`);
      if (msg) console.log(`          ${msg}`);
    }
  }
  if (!res.incomplete.length) console.log("    (none)");

  // Direct measurement of the exact chip pair B24 named.
  const chip = await page.evaluate(() => {
    const el = document.querySelector(".w-7.h-7");
    if (!el) return null;
    const cs = getComputedStyle(el);
    // walk up for the first opaque background
    let node = el, bg = null;
    while (node) {
      const c = getComputedStyle(node).backgroundColor;
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const p = m[1].split(",").map((x) => parseFloat(x));
        if ((p[3] ?? 1) === 1) { bg = c; break; }
      }
      node = node.parentElement;
    }
    return { color: cs.color, ownBg: cs.backgroundColor, firstOpaqueAncestorBg: bg,
      fontSize: cs.fontSize, fontWeight: cs.fontWeight };
  });
  console.log("  the B24 chip, measured directly: " + JSON.stringify(chip));
  await ctx.close();
}
await browser.close();
