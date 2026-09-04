// QA A2 — WHAT became visible when the launcher was removed from 25 goldens.
//
// A first baseline pins a defect as readily as a regenerated one. This decodes
// the OLD and NEW blob of each changed golden, diffs them, reports the changed
// bounding box, and writes a side-by-side crop of that region (old on top, new
// below, a 1px rule between) so the newly-baselined content can be LOOKED AT
// rather than assumed correct.
import { launch, ctx } from "./lib.mjs";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const PAIRS = JSON.parse(readFileSync(process.argv[2], "utf8")); // [{name, oldPath, newPath}]
const OUTDIR = process.argv[3];
const JSONOUT = process.argv[4];
mkdirSync(OUTDIR, { recursive: true });

const browser = await launch();
const c = await ctx(browser, { width: 600, height: 400 });
const page = await c.newPage();
await page.goto("about:blank");

const rows = [];
for (const p of PAIRS) {
  const a = readFileSync(p.oldPath).toString("base64");
  const b = readFileSync(p.newPath).toString("base64");
  const res = await page.evaluate(async ([oldB64, newB64]) => {
    const dec = async (d) => {
      const blob = await (await fetch("data:image/png;base64," + d)).blob();
      const bmp = await createImageBitmap(blob);
      const cv = new OffscreenCanvas(bmp.width, bmp.height);
      const cx = cv.getContext("2d", { willReadFrequently: true });
      cx.drawImage(bmp, 0, 0);
      return { w: bmp.width, h: bmp.height, d: cx.getImageData(0, 0, bmp.width, bmp.height).data };
    };
    const A = await dec(oldB64), B = await dec(newB64);
    if (A.w !== B.w || A.h !== B.h) return { sizeChanged: true, a: [A.w, A.h], b: [B.w, B.h] };

    let changed = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, maxDelta = 0;
    for (let y = 0; y < A.h; y++) {
      for (let x = 0; x < A.w; x++) {
        const i = (y * A.w + x) * 4;
        const dl = Math.max(Math.abs(A.d[i] - B.d[i]), Math.abs(A.d[i + 1] - B.d[i + 1]), Math.abs(A.d[i + 2] - B.d[i + 2]));
        if (dl === 0) continue;
        changed++;
        if (dl > maxDelta) maxDelta = dl;
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    if (x1 < 0) return { w: A.w, h: A.h, changed: 0, bbox: null, maxDelta: 0 };

    // Pad the bbox a little so the crop has context.
    const PAD = 14;
    const cx0 = Math.max(0, x0 - PAD), cy0 = Math.max(0, y0 - PAD);
    const cw = Math.min(A.w - cx0, x1 - x0 + 1 + PAD * 2);
    const ch = Math.min(A.h - cy0, y1 - y0 + 1 + PAD * 2);

    // Build an old-over-new stack of just that region.
    const cv = new OffscreenCanvas(cw, ch * 2 + 3);
    const g = cv.getContext("2d");
    const put = (src, dy) => {
      const tmp = new ImageData(cw, ch);
      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          const si = ((cy0 + y) * src.w + (cx0 + x)) * 4, di = (y * cw + x) * 4;
          tmp.data[di] = src.d[si]; tmp.data[di + 1] = src.d[si + 1];
          tmp.data[di + 2] = src.d[si + 2]; tmp.data[di + 3] = 255;
        }
      }
      g.putImageData(tmp, 0, dy);
    };
    put(A, 0);
    g.fillStyle = "#ff00ff";
    g.fillRect(0, ch, cw, 3);
    put(B, ch + 3);
    const out = await cv.convertToBlob({ type: "image/png" });
    const buf = new Uint8Array(await out.arrayBuffer());
    let s = "";
    for (let i = 0; i < buf.length; i++) s += String.fromCharCode(buf[i]);
    return {
      w: A.w, h: A.h, changed, maxDelta,
      bbox: [x0, y0, x1 - x0 + 1, y1 - y0 + 1],
      crop: [cx0, cy0, cw, ch],
      png: btoa(s),
    };
  }, [a, b]);

  if (res.png) {
    writeFileSync(join(OUTDIR, p.name.replace(/[\\/]/g, "__") + ".stack.png"), Buffer.from(res.png, "base64"));
    delete res.png;
  }
  rows.push({ name: p.name, ...res });
  const pct = res.changed != null && res.w ? ((res.changed / (res.w * res.h)) * 100).toFixed(3) : "—";
  console.log(`${p.name}`);
  console.log(`   ${res.w}x${res.h}  changed=${res.changed} (${pct}%)  maxDelta=${res.maxDelta}  bbox=${JSON.stringify(res.bbox)}`);
}
await browser.close();
writeFileSync(JSONOUT, JSON.stringify(rows, null, 2));
