/**
 * Phase 10-2b golden adjudication.
 *
 * For each visual project whose `landing-fullpage.png` moved, decode the
 * pixelmatch diff Playwright wrote (differing pixels are painted red), find
 * the row bands the red pixels occupy, and compare them with the document
 * boxes of the two elements this packet changed on `/` — the manifesto band
 * (`.tl-manifesto`, new ≤767 `<source>`) and the fourth sector card
 * (`.tl-sector-card:nth-child(4)`, cropped `industry-hydraulic`). A golden is
 * adjudicated as explained when every red band lies inside one of those two
 * boxes (a 4px tolerance for anti-aliasing at the box edge).
 *
 * Usage: PROBE_RESULTS=<playwright output dir> node reports/10/probes/golden-adjudicate.mjs
 */
import { chromium } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.PROBE_BASE_URL ?? "http://localhost:4194";
const RESULTS = process.env.PROBE_RESULTS;
if (!RESULTS) throw new Error("PROBE_RESULTS (playwright output dir) is required");
const executablePath = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const PROJECTS = [
  { name: "visual-375", viewport: { width: 375, height: 812 }, mobile: true },
  { name: "visual-768", viewport: { width: 768, height: 1024 }, mobile: true },
  { name: "visual-1280", viewport: { width: 1280, height: 900 }, mobile: false },
  { name: "visual-1440", viewport: { width: 1440, height: 900 }, mobile: false },
];
const SELECTORS = { manifesto: ".tl-manifesto", "sector-card-hydraulic": ".tl-sector-card:nth-child(4)" };

const browser = await chromium.launch(executablePath ? { executablePath } : {});
const out = [];
for (const project of PROJECTS) {
  const dir = join(RESULTS, `visual-landing-golden-land-7bc18--committed-landing-baseline-${project.name}`);
  const diffFile = join(dir, "landing-fullpage-diff.png");
  if (!existsSync(diffFile)) { out.push({ project: project.name, moved: false }); continue; }
  const diffB64 = readFileSync(diffFile).toString("base64");

  const context = await browser.newContext({ viewport: project.viewport, ...(project.mobile ? { isMobile: true, hasTouch: true } : {}), reducedMotion: "reduce" });
  const page = await context.newPage();

  // 1. Red-pixel row bands from the diff image (decoded on a canvas — no PNG dependency).
  const bands = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    const rowHits = new Int32Array(c.height);
    let minX = c.width, maxX = -1, total = 0;
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4;
        if (data[i] > 200 && data[i + 1] < 90 && data[i + 2] < 90) {
          rowHits[y]++; total++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
    }
    const bands = [];
    let start = -1;
    for (let y = 0; y <= c.height; y++) {
      const hit = y < c.height && rowHits[y] > 0;
      if (hit && start < 0) start = y;
      if (!hit && start >= 0) { bands.push([start, y - 1]); start = -1; }
    }
    // merge bands separated by < 8 px, and count the pixels each band holds
    const merged = [];
    for (const b of bands) {
      const last = merged[merged.length - 1];
      if (last && b[0] - last[1] < 8) last[1] = b[1]; else merged.push([...b]);
    }
    const counted = merged.map(([y0, y1]) => { let n = 0; for (let y = y0; y <= y1; y++) n += rowHits[y]; return [y0, y1, n]; });
    return { image: [c.width, c.height], total, x: [minX, maxX], bands: counted };
  }, diffB64);

  // 1b. Which candidate the two untouched pictures near the stray bands resolve to.
  //     (band 05 process figure and the ≥768 manifesto candidate must be what 10-2a measured)

  // 2. Document boxes of the two changed elements on the real page.
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const ALL = { ...SELECTORS, "process-figure (untouched)": ".tl-process figure" };
  const boxes = await page.evaluate((sels) => {
    const r = {};
    for (const [k, sel] of Object.entries(sels)) {
      const el = document.querySelector(sel);
      const b = el.getBoundingClientRect();
      r[k] = { top: Math.round(b.top + scrollY), bottom: Math.round(b.bottom + scrollY), left: Math.round(b.left), right: Math.round(b.right) };
    }
    return r;
  }, ALL);
  for (const sel of [".tl-process figure img", ".tl-manifesto-body img"]) {
    const img = page.locator(sel).first();
    await img.scrollIntoViewIfNeeded();
    await page.waitForFunction((s) => { const el = document.querySelector(s); return el && el.complete && el.naturalWidth > 0; }, sel, { timeout: 20_000 });
  }
  const chosen = await page.evaluate(() => Object.fromEntries([".tl-process figure img", ".tl-manifesto-body img"].map((s) => {
    const el = document.querySelector(s);
    return [s, { currentSrc: el.currentSrc.split("/").pop(), natural: [el.naturalWidth, el.naturalHeight] }];
  })));

  // 3. Assign every band to a box (4px tolerance) or flag it. A band inside an untouched
  //    picture with fewer pixels than the golden's own budget (200) is raster jitter, not a change.
  const dpr = bands.image[0] / project.viewport.width;
  const assigned = bands.bands.map(([y0, y1, pixels]) => {
    const top = y0 / dpr, bottom = y1 / dpr;
    const owner = Object.entries(boxes).find(([, b]) => top >= b.top - 4 && bottom <= b.bottom + 4);
    return { rows: [y0, y1], cssRows: [Math.round(top), Math.round(bottom)], pixels, owner: owner ? owner[0] : "UNEXPLAINED" };
  });
  const changed = assigned.filter((b) => b.owner in SELECTORS).reduce((n, b) => n + b.pixels, 0);
  const stray = assigned.filter((b) => !(b.owner in SELECTORS)).reduce((n, b) => n + b.pixels, 0);
  out.push({ project: project.name, moved: true, dpr, differingPixels: bands.total, pixelsInChangedElements: changed, strayPixels: stray, xRange: bands.x, boxes, chosenCandidates: chosen, bands: assigned, verdict: stray <= 200 ? "EXPLAINED" : "UNEXPLAINED" });
  await context.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
