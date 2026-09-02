#!/usr/bin/env node
/* QA-owned INDEPENDENT B28 re-measurement (phase 05b R1).
 *
 * Deliberately does NOT reuse `scripts/motion-audit.mjs --mode=rest`: the
 * point is to confirm the number with a second instrument written from the
 * acceptance criterion, not to re-run the Coder's own tool.
 *
 * POPULATION — same as the project probe, and for the same reason: only
 * elements that HAVE a layout box. A `display:none` subtree (the closed
 * fullscreen menu, the closed footer accordions) is not "hidden by a reveal",
 * it is not rendered at all, and counting it produces ~52 false positives per
 * route. That exclusion is sound.
 *
 * WHAT THIS ADDS over the project probe. `motion-audit`'s `effective()`
 * returns -1 for `visibility:hidden` and the caller then does
 * `if (value !== 0) continue`, so a reveal implemented with `visibility`
 * would be silently skipped; and it does not look at `clip-path` at all,
 * although the 05b motion layer parks `.tl-sector-card` at
 * `clip-path: inset(0 -8px 100% -8px)` — fully clipped — in its resting
 * declaration. Both are counted here as separate buckets so that a pass is a
 * pass against three hiding mechanisms rather than one.
 */
import { chromium } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:4211";
/* Sliceable on purpose. This host is memory-constrained and kills the browser
   part-way through a ten-page run ("Target page, context or browser has been
   closed"), which is an environment fault and not a finding. `QA_VP` and
   `QA_ROUTES` let the same measurement be taken in small pieces that complete. */
const ALL_ROUTES = ["/", "/hizmetler/cnc-frezeleme", "/iletisim", "/malzemeler/aluminyum", "/hakkimizda"];
const ROUTES = process.env.QA_ROUTES ? process.env.QA_ROUTES.split(",") : ALL_ROUTES;
const VIEWPORTS = [
  { name: "1280", width: 1280, height: 900 },
  { name: "375", width: 375, height: 812 },
].filter((v) => !process.env.QA_VP || v.name === process.env.QA_VP);

function chrome() {
  const c = [
    process.env.ProgramFiles && join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe"),
    process.env["ProgramFiles(x86)"] && join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe"),
  ].filter(Boolean).find(existsSync);
  if (c) return c;
  const root = join(process.env.LOCALAPPDATA, "ms-playwright");
  return readdirSync(root).filter((e) => e.startsWith("chromium-"))
    .map((e) => join(root, e, "chrome-win", "chrome.exe")).find(existsSync);
}

const PROBE = () => {
  const buckets = { opacity: [], visibility: [], clip: [] };
  for (const el of document.querySelectorAll("body *")) {
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 && rect.height <= 0) continue;      // not laid out at all
    let own = "";
    for (const n of el.childNodes) if (n.nodeType === 3) own += n.nodeValue + " ";
    own = own.replace(/\s+/g, " ").trim();
    if (own.length <= 1) continue;                           // no own text
    if (el.closest("[aria-hidden='true']")) continue;        // deliberately not exposed

    let node = el, opacity = 1, why = "";
    while (node && node !== document.documentElement) {
      const s = getComputedStyle(node);
      if (s.display === "none") { why = "SKIP"; break; }
      if (s.visibility === "hidden") { why = "visibility:hidden@" + node.tagName + "." + String(node.className).slice(0, 40); break; }
      opacity *= Number.parseFloat(s.opacity);
      if (opacity < 0.01) { why = "opacity@" + node.tagName + "." + String(node.className).slice(0, 40); break; }
      const cp = s.clipPath;
      if (cp && cp !== "none" && /inset\(/.test(cp)) {
        const nums = (cp.match(/-?[\d.]+%/g) || []).map(Number.parseFloat);
        if (nums.some((v) => v >= 100)) { why = "clip-path:" + cp + "@" + node.tagName + "." + String(node.className).slice(0, 40); break; }
      }
      node = node.parentElement;
    }
    if (!why || why === "SKIP") continue;
    const rec = { tag: el.tagName, cls: String(el.className).slice(0, 50), text: own.slice(0, 55), why };
    if (why.startsWith("visibility")) buckets.visibility.push(rec);
    else if (why.startsWith("clip-path")) buckets.clip.push(rec);
    else buckets.opacity.push(rec);
  }
  return buckets;
};

/* One browser per VIEWPORT, not one per run, and closed between them: on this
   host a single long-lived browser is killed part-way through. Restarting it is
   an environment workaround, not a change to what is measured. */
let total = 0;
for (const vp of VIEWPORTS) {
  const browser = await chromium.launch({
    executablePath: chrome(),
    args: ["--disable-dev-shm-usage", "--disable-gpu", "--no-sandbox", "--disable-extensions"],
  });
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.width < 768,
    hasTouch: vp.width < 768,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1400);                          // NO scrolling
    const y = await page.evaluate(() => window.scrollY);
    const b = await page.evaluate(PROBE);
    const n = b.opacity.length + b.visibility.length + b.clip.length;
    total += n;
    console.log("vp=" + vp.name + "  route=" + route + "  scrollY=" + y
      + "  hiddenText=" + n
      + "  (opacity=" + b.opacity.length + " visibility=" + b.visibility.length + " clip=" + b.clip.length + ")");
    for (const h of [...b.opacity, ...b.visibility, ...b.clip].slice(0, 10)) {
      console.log("      <" + h.tag + " class=\"" + h.cls + "\"> \"" + h.text + "\"  [" + h.why + "]");
    }
  }
  await ctx.close();
  await browser.close();
}
console.log(total === 0
  ? "\nINDEPENDENT PASS - 0 text-bearing elements hidden at rest under reduced motion (opacity, visibility and clip-path all checked)."
  : "\nINDEPENDENT FAIL - " + total + " text-bearing elements hidden.");
process.exit(total === 0 ? 0 : 1);
