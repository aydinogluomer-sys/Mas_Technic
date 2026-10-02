// QA A2 — re-derive the per-viewport adjudication in docs/lean/17 §8.2.
//
// For each changed golden, every differing pixel is classified:
//   DISC  — the OLD pixel is within 40 (euclidean) of the launcher's teal
//   STRAY — it differs but was not teal: the shadow halo, or the disc's rim
// and then the three falsifiable predictions are checked:
//   1. the disc bbox matches the CSS geometry for that width
//   2. shadow strays only ever get BRIGHTER (removing a translucent black wash)
//   3. the largest change outside the disc is small
import { launch, ctx } from "./lib.mjs";
import { readFileSync, writeFileSync } from "node:fs";

const PAIRS = JSON.parse(readFileSync(process.argv[2], "utf8"));
const OUT = process.argv[3];
const TEAL = [10, 125, 138];

const browser = await launch();
const c = await ctx(browser, { width: 400, height: 300 });
const page = await c.newPage();
await page.goto("about:blank");

const rows = [];
for (const p of PAIRS) {
  const a = readFileSync(p.oldPath).toString("base64");
  const b = readFileSync(p.newPath).toString("base64");
  const r = await page.evaluate(async ([oldB64, newB64, teal]) => {
    const dec = async (d) => {
      const blob = await (await fetch("data:image/png;base64," + d)).blob();
      const bmp = await createImageBitmap(blob);
      const cv = new OffscreenCanvas(bmp.width, bmp.height);
      const cx = cv.getContext("2d", { willReadFrequently: true });
      cx.drawImage(bmp, 0, 0);
      return { w: bmp.width, h: bmp.height, d: cx.getImageData(0, 0, bmp.width, bmp.height).data };
    };
    const A = await dec(oldB64), B = await dec(newB64);
    const lum = (r, g, bb) => 0.2126 * r + 0.7152 * g + 0.0722 * bb;

    // PASS 1 — the DISC REGION, as docs/lean/17 §8.2 defines it: the bounding
    // box of the launcher itself. Located from the teal fill in the OLD image.
    // The disc's white speech-bubble ICON is not teal, so a pure colour test
    // would throw it out into "strays" and report thousands of darker pixels.
    // (My first version did exactly that. The instrument was wrong.)
    let dx0 = 1e9, dy0 = 1e9, dx1 = -1, dy1 = -1;
    for (let y = 0; y < A.h; y++) {
      for (let x = 0; x < A.w; x++) {
        const i = (y * A.w + x) * 4;
        const dl = Math.max(Math.abs(A.d[i] - B.d[i]), Math.abs(A.d[i + 1] - B.d[i + 1]), Math.abs(A.d[i + 2] - B.d[i + 2]));
        if (dl === 0) continue;
        const dr = A.d[i] - teal[0], dg = A.d[i + 1] - teal[1], db = A.d[i + 2] - teal[2];
        if (Math.sqrt(dr * dr + dg * dg + db * db) > 40) continue;
        if (x < dx0) dx0 = x; if (x > dx1) dx1 = x;
        if (y < dy0) dy0 = y; if (y > dy1) dy1 = y;
      }
    }
    // PASS 2 — everything changed INSIDE that box is the disc; everything
    // changed OUTSIDE it is a stray, i.e. the shadow halo.
    let disc = 0, stray = 0, brighter = 0, darker = 0, equalLum = 0;
    let maxOutsideDisc = 0, maxDiscDelta = 0, maxStrayDarker = 0;
    let sx0 = 1e9, sy0 = 1e9, sx1 = -1, sy1 = -1;
    for (let y = 0; y < A.h; y++) {
      for (let x = 0; x < A.w; x++) {
        const i = (y * A.w + x) * 4;
        const dl = Math.max(Math.abs(A.d[i] - B.d[i]), Math.abs(A.d[i + 1] - B.d[i + 1]), Math.abs(A.d[i + 2] - B.d[i + 2]));
        if (dl === 0) continue;
        const inDisc = dx1 >= 0 && x >= dx0 && x <= dx1 && y >= dy0 && y <= dy1;
        if (inDisc) {
          disc++;
          if (dl > maxDiscDelta) maxDiscDelta = dl;
        } else {
          stray++;
          if (dl > maxOutsideDisc) maxOutsideDisc = dl;
          if (x < sx0) sx0 = x; if (x > sx1) sx1 = x;
          if (y < sy0) sy0 = y; if (y > sy1) sy1 = y;
          const la = lum(A.d[i], A.d[i + 1], A.d[i + 2]);
          const lb = lum(B.d[i], B.d[i + 1], B.d[i + 2]);
          if (lb > la) brighter++;
          else if (lb < la) { darker++; if (dl > maxStrayDarker) maxStrayDarker = dl; }
          else equalLum++;
        }
      }
    }
    return {
      w: A.w, h: A.h, disc, stray, brighter, darker, equalLum,
      discBox: dx1 >= 0 ? { x0: dx0, y0: dy0, x1: dx1, y1: dy1, w: dx1 - dx0 + 1, h: dy1 - dy0 + 1 } : null,
      strayBox: sx1 >= 0 ? { x0: sx0, y0: sy0, x1: sx1, y1: sy1, w: sx1 - sx0 + 1, h: sy1 - sy0 + 1 } : null,
      maxDiscDelta, maxOutsideDisc, maxStrayDarker,
    };
  }, [a, b, TEAL]);
  rows.push({ name: p.name, ...r });
}
await browser.close();
writeFileSync(OUT, JSON.stringify(rows, null, 2));

// CSS prediction: right:1rem (16px), h-12 w-12 (48) below md, md:h-14 md:w-14 (56).
const CSS = { "visual-375": 48, "visual-768": 56, "visual-1280": 56, "visual-1440": 56 };
const byVp = {};
for (const r of rows) {
  const vp = r.name.split("/")[1];
  (byVp[vp] ??= []).push(r);
}

console.log("DISC GEOMETRY vs CSS PREDICTION (right:1rem => x0 = imageWidth - 16 - size)\n");
for (const vp of Object.keys(byVp).sort()) {
  const size = CSS[vp];
  console.log(`${vp}  (CSS disc ${size}x${size})`);
  for (const r of byVp[vp]) {
    if (!r.discBox) { console.log(`   ${r.name.split("/").pop().padEnd(34)} NO DISC PIXELS`); continue; }
    const pred = r.w - 16 - size;
    const dx = r.discBox.x0 - pred;
    const clipped = r.discBox.h < size - 2;
    console.log(`   ${r.name.split("/").pop().padEnd(34)} disc ${String(r.discBox.w).padStart(2)}x${String(r.discBox.h).padStart(2)} at x ${r.discBox.x0}-${r.discBox.x1}  predicted x0=${pred}  Δx=${dx >= 0 ? "+" : ""}${dx}${clipped ? "   [CLIPPED by the crop]" : ""}`);
  }
  console.log("");
}

console.log("STRAYS — the falsifiable prediction: removing a translucent black shadow can only BRIGHTEN\n");
let totalStray = 0, totalDarker = 0, worstOutside = 0;
for (const vp of Object.keys(byVp).sort()) {
  let s = 0, br = 0, dk = 0, eq = 0, mo = 0, md = 0;
  for (const r of byVp[vp]) { s += r.stray; br += r.brighter; dk += r.darker; eq += r.equalLum; mo = Math.max(mo, r.maxOutsideDisc); md = Math.max(md, r.maxStrayDarker); }
  totalStray += s; totalDarker += dk; worstOutside = Math.max(worstOutside, mo);
  console.log(`  ${vp.padEnd(12)} strays=${String(s).padStart(4)}  brighter=${String(br).padStart(4)}  darker=${String(dk).padStart(3)}  same-lum=${eq}  maxΔ outside disc=${mo}  maxΔ of a darker stray=${md}`);
}
console.log(`\n  TOTAL strays across all 25: ${totalStray}   darker: ${totalDarker}   largest change outside the disc: ${worstOutside}/255`);
console.log(`\nDARKER STRAYS BY FILE (the doc predicts these ONLY on the two inner-next slivers):`);
for (const r of rows) if (r.darker > 0) console.log(`  ${r.name}  darker=${r.darker}  maxΔ=${r.maxStrayDarker}  disc=${r.disc}  stray=${r.stray}`);
