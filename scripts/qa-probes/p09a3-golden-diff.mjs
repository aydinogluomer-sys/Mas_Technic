/* QA 09a-R3 — what actually changed in the six moved baselines.
 *
 * "One device row" is a falsifiable claim, so it gets measured rather than
 * accepted: read the IHDR of each baseline before and after `15e19ef`, then
 * decode both and compare the overlapping region pixel by pixel. A crop that
 * lost or gained one row leaves the overlap IDENTICAL; a blanket re-record of
 * changed content does not.
 *
 * The whole `__golden__` tree is also diffed against `fe3a525`, so a claim that
 * only six moved is checked rather than trusted.
 *
 * No `--update-snapshots` anywhere. Nothing under `e2e/__golden__` is written.
 */
import { execFileSync } from "node:child_process";
import { inflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = resolve(ROOT, "reports/qa/phase-09a-r3");
mkdirSync(OUT, { recursive: true });

const git = (args, buffer = false) =>
  execFileSync("git", args, { cwd: ROOT, maxBuffer: 1 << 28, ...(buffer ? {} : { encoding: "utf8" }) });

/* Minimal PNG decoder: enough for Playwright baselines, which are 8-bit RGBA,
   colour type 6, no interlace. Anything else throws rather than guessing. */
function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  let off = 8;
  let ihdr = null;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") {
      ihdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        depth: data[8],
        colorType: data[9],
        interlace: data[12],
      };
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    off += 12 + len;
  }
  if (!ihdr) throw new Error("no IHDR");
  if (ihdr.depth !== 8 || (ihdr.colorType !== 6 && ihdr.colorType !== 2) || ihdr.interlace !== 0) {
    throw new Error(`unsupported PNG: depth=${ihdr.depth} colorType=${ihdr.colorType} interlace=${ihdr.interlace}`);
  }
  const raw = inflateSync(Buffer.concat(idat));
  const bpp = ihdr.colorType === 6 ? 4 : 3;
  const stride = ihdr.width * bpp;
  const out = Buffer.alloc(ihdr.height * stride);
  let p = 0;
  for (let y = 0; y < ihdr.height; y += 1) {
    const filter = raw[p];
    p += 1;
    const line = raw.subarray(p, p + stride);
    p += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    for (let x = 0; x < stride; x += 1) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      const v = line[x];
      let val;
      if (filter === 0) val = v;
      else if (filter === 1) val = v + a;
      else if (filter === 2) val = v + b;
      else if (filter === 3) val = v + ((a + b) >> 1);
      else if (filter === 4) {
        const pp = a + b - c;
        const pa = Math.abs(pp - a);
        const pb = Math.abs(pp - b);
        const pc = Math.abs(pp - c);
        val = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      } else throw new Error(`bad filter ${filter}`);
      cur[x] = val & 0xff;
    }
  }
  return { ...ihdr, pixels: out, stride, bpp };
}

const MOVED = [
  "e2e/__golden__/win32/visual-1280/inner-next-service-detail.png",
  "e2e/__golden__/win32/visual-1280/shell-footer-service.png",
  "e2e/__golden__/win32/visual-375/inner-next-service-detail.png",
  "e2e/__golden__/win32/visual-375/shell-footer-service.png",
  "e2e/__golden__/win32/visual-768/inner-next-service-detail.png",
  "e2e/__golden__/win32/visual-768/shell-footer-service.png",
];

const results = [];
for (const f of MOVED) {
  const before = decodePng(git(["show", `15e19ef~1:${f}`], true));
  const after = decodePng(git(["show", `15e19ef:${f}`], true));
  const w = Math.min(before.width, after.width);
  const h = Math.min(before.height, after.height);

  /* Two alignments: overlap anchored at the TOP, and at the BOTTOM. A crop
     that lost its first row matches bottom-anchored; one that lost its last
     row matches top-anchored. */
  const count = (offBefore, offAfter) => {
    let differing = 0;
    let maxChannel = 0;
    for (let y = 0; y < h; y += 1) {
      const rb = (y + offBefore) * before.stride;
      const ra = (y + offAfter) * after.stride;
      for (let x = 0; x < w * before.bpp; x += 1) {
        const d = Math.abs(before.pixels[rb + x] - after.pixels[ra + x]);
        if (d !== 0) {
          differing += 1;
          if (d > maxChannel) maxChannel = d;
        }
      }
    }
    return { differing, maxChannel, ofSamples: h * w * before.bpp };
  };

  const top = count(0, 0);
  const bottom = count(before.height - h, after.height - h);
  results.push({
    file: f.replace("e2e/__golden__/win32/", ""),
    before: `${before.width}x${before.height}`,
    after: `${after.width}x${after.height}`,
    dHeight: after.height - before.height,
    dWidth: after.width - before.width,
    overlapTopAnchored: top,
    overlapBottomAnchored: bottom,
    interpretation:
      top.differing === 0
        ? "IDENTICAL content, top-anchored: the crop changed length, the pixels did not"
        : bottom.differing === 0
          ? "IDENTICAL content, bottom-anchored: the crop changed length, the pixels did not"
          : `content differs in the overlap: ${Math.min(top.differing, bottom.differing)} channel samples of ${top.ofSamples}`,
  });
}

/* Every baseline in the tree, against the pre-C3 base. */
const allChanged = git(["diff", "--name-only", "fe3a525..38d4f73", "--", "e2e/__golden__"]).split("\n").filter(Boolean);
const totalBaselines = git(["ls-files", "e2e/__golden__"]).split("\n").filter(Boolean).length;

const report = { totalBaselines, changedSinceBase: allChanged, moved: results };
writeFileSync(resolve(OUT, "golden-diff.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`baselines in the tree: ${totalBaselines}`);
console.log(`changed fe3a525..38d4f73: ${allChanged.length}`);
for (const c of allChanged) console.log(`   ${c}`);
console.log("");
for (const r of results) {
  console.log(`${r.file}`);
  console.log(`   ${r.before} -> ${r.after}   dH=${r.dHeight} dW=${r.dWidth}`);
  console.log(`   top-anchored overlap    : ${r.overlapTopAnchored.differing} differing channel samples (max delta ${r.overlapTopAnchored.maxChannel})`);
  console.log(`   bottom-anchored overlap : ${r.overlapBottomAnchored.differing} differing channel samples (max delta ${r.overlapBottomAnchored.maxChannel})`);
  console.log(`   => ${r.interpretation}`);
}
