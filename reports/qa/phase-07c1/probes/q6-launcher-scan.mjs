// QA A2 — does the chat launcher appear in any banked golden?
//
// The launcher is a `bg-primary` disc. Its colour is read from the LIVE page
// (never hardcoded), then every golden PNG is decoded in a browser canvas and
// scanned for pixels within a small distance of it. A disc is antialiased at
// its rim, so an exact-match scan would under-count; the tolerance is reported
// alongside a control that must find the disc where it is known to be.
import { launch, ctx, goto, log } from "./lib.mjs";
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.argv[2];               // e2e/__golden__ dir
const OUT = process.argv[3];
const CONTROL = process.argv[4];            // optional: a PNG known to contain the disc

const browser = await launch();

/* ── 1. read the launcher's colour and box from the live page ───────────── */
const c1 = await ctx(browser, { width: 1280, height: 900 });
const p1 = await c1.newPage();
await goto(p1, "/hizmetler/cnc-frezeleme");
const launcher = await p1.evaluate(() => {
  const b = document.querySelector("button.fixed.rounded-full, button[class*='rounded-full'][class*='fixed']");
  if (!b) return null;
  const cs = getComputedStyle(b);
  const r = b.getBoundingClientRect();
  return {
    bg: cs.backgroundColor,
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    cls: (b.getAttribute("class") || "").slice(0, 80),
  };
});
// POSITIVE CONTROL: a capture of the same page WITH the launcher in it. If the
// scan cannot find the disc here, the scan is broken and no "0 hits" result
// from it means anything.
const controlPath = join(process.env.TEMP ?? ".", "qa-a2-launcher-control.png");
await p1.screenshot({ path: controlPath });
await c1.close();
if (!launcher) throw new Error("launcher not found on the live page — cannot derive its colour");
const m = launcher.bg.match(/rgba?\(([^)]+)\)/);
const TARGET = m[1].split(/[,\s/]+/).filter(Boolean).slice(0, 3).map(Number);

/* ── 2. decode every golden in a canvas and count near-target pixels ────── */
const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const f = join(d, e);
    if (statSync(f).isDirectory()) walk(f);
    else if (f.endsWith(".png")) files.push(f);
  }
})(ROOT);
files.push(CONTROL ?? controlPath);

const c2 = await ctx(browser, { width: 400, height: 300 });
const page = await c2.newPage();
await page.goto("about:blank");

const rows = [];
for (const f of files) {
  const b64 = readFileSync(f).toString("base64");
  const res = await page.evaluate(async ([data, target]) => {
    const blob = await (await fetch("data:image/png;base64," + data)).blob();
    const bmp = await createImageBitmap(blob);
    const cv = new OffscreenCanvas(bmp.width, bmp.height);
    const cx = cv.getContext("2d", { willReadFrequently: true });
    cx.drawImage(bmp, 0, 0);
    const d = cx.getImageData(0, 0, bmp.width, bmp.height).data;
    let near = 0, exact = 0, tight = 0, minD = 1e9;
    let bx0 = 1e9, by0 = 1e9, bx1 = -1, by1 = -1;
    // THE DISCRIMINATOR. The launcher is a SOLID disc >= 48 px across, so it
    // must contain long horizontal runs of near-target pixels. The site's teal
    // accent TEXT is within 11-13 of the same colour but is antialiased strokes
    // a few pixels wide, so it cannot produce a long run. `maxRun` separates
    // "the disc is in this image" from "this image uses the brand teal".
    let maxRun = 0, runAt = null;
    for (let y = 0; y < bmp.height; y++) {
      let run = 0;
      for (let x = 0; x < bmp.width; x++) {
        const i = (y * bmp.width + x) * 4;
        const dr = d[i] - target[0], dg = d[i + 1] - target[1], db = d[i + 2] - target[2];
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);
        if (dist < minD) minD = dist;
        if (dist === 0) exact++;
        if (dist <= 8) tight++;
        if (dist <= 24) {
          near++;
          if (x < bx0) bx0 = x; if (x > bx1) bx1 = x;
          if (y < by0) by0 = y; if (y > by1) by1 = y;
        }
        if (dist <= 24) { run++; if (run > maxRun) { maxRun = run; runAt = [x - run + 1, y]; } }
        else run = 0;
      }
    }
    return {
      w: bmp.width, h: bmp.height, near, tight, exact, maxRun, runAt,
      minDist: +minD.toFixed(1),
      bbox: bx1 >= 0 ? [bx0, by0, bx1 - bx0 + 1, by1 - by0 + 1] : null,
    };
  }, [b64, TARGET]);
  rows.push({ file: f.replace(/\\/g, "/").split("__golden__/").pop() ?? f, ...res });
}
await browser.close();

writeFileSync(OUT, JSON.stringify({ launcher, TARGET, rows }, null, 2));

console.log(`launcher: ${launcher.bg} -> target rgb(${TARGET.join(",")})`);
console.log(`          box ${launcher.rect.w}x${launcher.rect.h} at (${launcher.rect.x},${launcher.rect.y}) @1280`);
console.log(`scanned ${rows.length} PNG(s), tolerance = euclidean distance <= 24\n`);
const RUN = 30; // a 48-56 px disc always yields a run well over this
const control = rows[rows.length - 1];
const goldens = rows.slice(0, -1);
const hits = goldens.filter((r) => r.maxRun >= RUN);

console.log(`POSITIVE CONTROL (a live capture that DOES contain the launcher):`);
console.log(`  exact=${control.exact}  tight(<=8)=${control.tight}  near(<=24)=${control.near}  maxRun=${control.maxRun} at ${JSON.stringify(control.runAt)}`);
if (control.maxRun < RUN) throw new Error("the scan cannot find the disc it is looking for — instrument is broken");
console.log(`  -> the instrument finds the disc, so a zero result below is meaningful.\n`);

console.log(`GOLDENS WITH A SOLID RUN >= ${RUN}px OF THE LAUNCHER COLOUR: ${hits.length} / ${goldens.length}`);
for (const h of hits) console.log(`  ${h.file}  maxRun=${h.maxRun} exact=${h.exact} bbox=${JSON.stringify(h.bbox)}`);

console.log(`\nGOLDENS WITH ANY EXACT-COLOUR PIXEL: ${goldens.filter((r) => r.exact > 0).length} / ${goldens.length}`);
const top = [...goldens].sort((a, b) => b.maxRun - a.maxRun).slice(0, 6);
console.log(`\nLONGEST RUNS AMONG THE GOLDENS (all brand-teal TEXT, not the disc):`);
for (const r of top) console.log(`  maxRun=${String(r.maxRun).padStart(3)}  exact=${r.exact}  minDist=${r.minDist}  ${r.file}`);
log({ goldens: goldens.length, controlMaxRun: control.maxRun, goldensWithDisc: hits.length, goldensWithExactPixel: goldens.filter((r) => r.exact > 0).length });
