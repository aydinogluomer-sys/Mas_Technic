// Phase 10-4 — fallback font metrics, computed from the real font files.
//
// WHAT IT DOES
//   1. Fetches the Google `css2` stylesheet the site loads (`index.html`) with a Chrome UA so the
//      response carries WOFF2 `src` URLs and `unicode-range` blocks, and picks the LATIN block of
//      the upright 400 face of each family (metrics do not change with weight; the average advance
//      does, and body text is 400).
//   2. Reads each WOFF2 with a minimal parser written here: header, table directory (base-128
//      lengths, known-tag index), one Brotli stream (`node:zlib`), then `head`, `hhea`, `OS/2`,
//      `maxp`, `cmap` (format 4 / 12) and `hmtx`. Only `glyf`/`loca` are transformed in these
//      files; the script refuses a transformed `hmtx` rather than guessing.
//   3. Reads the system fallback faces the same way from `C:\Windows\Fonts` (plain sfnt, no
//      decompression): Arial, Georgia, Courier New — the faces that render the flash on Windows
//      and macOS, and that Liberation Sans/Serif/Mono are metric-compatible with on Linux.
//   4. Computes, per family:
//        avg advance   = Σ freq(c) × advance(c) / unitsPerEm, over a Turkish letter-frequency
//                        table plus the space (the site is Turkish; an English table would weight
//                        `w`, `x`, `q` that Turkish text hardly uses and under-weight `ı ş ğ ç ö ü`)
//        size-adjust   = avg(webfont) / avg(fallback)
//        ascent-override / descent-override / line-gap-override
//                      = hhea ascender / |descender| / lineGap of the WEBFONT, over its em,
//                        divided by size-adjust (the overrides are applied to the scaled face)
//   5. Writes `reports/10/probes/font-metrics.json` and prints the `@font-face` blocks to paste
//      into `src/styles/design-tokens.css`.
//
// No package is used: `fontkit` is not installed and none may be added. The parser is ~120 lines
// and reads exactly the six tables it needs.
//
// Usage: node scripts/fonts/metrics.mjs
import { brotliDecompressSync } from "node:zlib";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const CSS_URL = readFileSync(join(root, "index.html"), "utf8").match(/href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)"/)[1].replace(/&amp;/g, "&");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const OUT = join(root, "reports", "10", "probes", "font-metrics.json");
// Downloaded WOFF2s are cached OUTSIDE the repo: they are Google's files, not the project's.
const CACHE = join(tmpdir(), "mas-font-metrics-cache");
mkdirSync(CACHE, { recursive: true });

const FAMILIES = [
  { family: "Space Grotesk", role: "sans", fallback: { name: "Arial", file: "C:/Windows/Fonts/arial.ttf" } },
  { family: "Newsreader", role: "serif", fallback: { name: "Georgia", file: "C:/Windows/Fonts/georgia.ttf" } },
  { family: "IBM Plex Mono", role: "mono", fallback: { name: "Courier New", file: "C:/Windows/Fonts/cour.ttf" } },
];

/* Turkish letter frequencies (percent of letters, Wikipedia "Letter frequency", Turkish column),
   with the space weighted as capsize/fontaine do (~17% of characters in running text). */
const TR_FREQ = {
  a: 11.92, e: 8.91, i: 8.60, n: 7.49, r: 6.72, l: 5.92, "ı": 5.11, k: 4.68, d: 4.63, m: 3.75, y: 3.34, t: 3.31,
  u: 3.24, s: 3.01, b: 2.84, o: 2.48, "ü": 1.85, "ş": 1.78, z: 1.50, g: 1.25, h: 1.21, "ç": 1.16, "ğ": 1.07,
  v: 0.96, c: 0.96, p: 0.79, "ö": 0.78, f: 0.44, j: 0.03, " ": 17.0,
};

/* ── sfnt / WOFF2 reading ─────────────────────────────────────────────────────────────── */
const KNOWN_TAGS = ["cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post", "cvt ", "fpgm", "glyf", "loca", "prep",
  "CFF ", "VORG", "EBDT", "EBLC", "gasp", "hdmx", "kern", "LTSH", "PCLT", "VDMX", "vhea", "vmtx", "BASE", "GDEF", "GPOS",
  "GSUB", "EBSC", "JSTF", "MATH", "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar", "bdat", "bloc", "bsln",
  "cvar", "fdsc", "feat", "fmtx", "fvar", "gvar", "hsty", "just", "lcar", "mort", "morx", "opbd", "prop", "trak", "Zapf",
  "Silf", "Glat", "Gloc", "Feat", "Sill"];

function readBase128(buf, pos) {
  let v = 0;
  for (let i = 0; i < 5; i++) {
    const b = buf[pos++];
    v = (v << 7) | (b & 0x7f);
    if (!(b & 0x80)) return [v >>> 0, pos];
  }
  throw new Error("bad base128");
}

/** Returns { tag → Buffer } for a WOFF2 or a plain sfnt file. */
function readTables(buf) {
  const sig = buf.toString("latin1", 0, 4);
  if (sig === "wOF2") {
    const numTables = buf.readUInt16BE(12);
    const totalCompressedSize = buf.readUInt32BE(20);
    let pos = 48;
    const dir = [];
    for (let i = 0; i < numTables; i++) {
      const flags = buf[pos++];
      let tag;
      if ((flags & 0x3f) === 63) { tag = buf.toString("latin1", pos, pos + 4); pos += 4; } else tag = KNOWN_TAGS[flags & 0x3f];
      const transform = (flags >> 6) & 3;
      let origLength, transformLength;
      [origLength, pos] = readBase128(buf, pos);
      const transformed = (tag === "glyf" || tag === "loca") ? transform === 0 : transform !== 0;
      if (transformed) [transformLength, pos] = readBase128(buf, pos); else transformLength = origLength;
      dir.push({ tag, transformed, origLength, transformLength });
    }
    const data = brotliDecompressSync(buf.subarray(pos, pos + totalCompressedSize));
    const tables = {};
    let off = 0;
    for (const t of dir) {
      tables[t.tag] = { data: data.subarray(off, off + t.transformLength), transformed: t.transformed };
      off += t.transformLength;
    }
    if (off !== data.length) throw new Error(`woff2 table walk ended at ${off}, stream is ${data.length}`);
    return tables;
  }
  // plain sfnt
  const numTables = buf.readUInt16BE(4);
  const tables = {};
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16;
    const tag = buf.toString("latin1", rec, rec + 4);
    const offset = buf.readUInt32BE(rec + 8), length = buf.readUInt32BE(rec + 12);
    tables[tag] = { data: buf.subarray(offset, offset + length), transformed: false };
  }
  return tables;
}

function parseCmap(t) {
  const n = t.readUInt16BE(2);
  let best = null;
  for (let i = 0; i < n; i++) {
    const pid = t.readUInt16BE(4 + i * 8), eid = t.readUInt16BE(6 + i * 8), off = t.readUInt32BE(8 + i * 8);
    const fmt = t.readUInt16BE(off);
    const score = (pid === 3 && eid === 10 && fmt === 12) ? 3 : (pid === 3 && eid === 1 && fmt === 4) ? 2 : (pid === 0 && (fmt === 4 || fmt === 12)) ? 1 : 0;
    if (score && (!best || score > best.score)) best = { off, fmt, score };
  }
  if (!best) throw new Error("no usable cmap subtable");
  const map = new Map();
  const { off, fmt } = best;
  if (fmt === 4) {
    const segX2 = t.readUInt16BE(off + 6), seg = segX2 / 2;
    const ends = off + 14, starts = ends + segX2 + 2, deltas = starts + segX2, ranges = deltas + segX2;
    for (let s = 0; s < seg; s++) {
      const end = t.readUInt16BE(ends + s * 2), start = t.readUInt16BE(starts + s * 2);
      const delta = t.readInt16BE(deltas + s * 2), rangeOff = t.readUInt16BE(ranges + s * 2);
      if (start === 0xffff) continue;
      for (let c = start; c <= end; c++) {
        let g;
        if (rangeOff === 0) g = (c + delta) & 0xffff;
        else {
          const gi = ranges + s * 2 + rangeOff + (c - start) * 2;
          if (gi + 1 >= t.length) continue;
          g = t.readUInt16BE(gi);
          if (g) g = (g + delta) & 0xffff;
        }
        if (g) map.set(c, g);
      }
    }
  } else {
    const groups = t.readUInt32BE(off + 12);
    for (let i = 0; i < groups; i++) {
      const p = off + 16 + i * 12;
      const sc = t.readUInt32BE(p), ec = t.readUInt32BE(p + 4), sg = t.readUInt32BE(p + 8);
      for (let c = sc; c <= ec && c < 0x30000; c++) map.set(c, sg + (c - sc));
    }
  }
  return map;
}

function metricsOf(buf, label) {
  const T = readTables(buf);
  for (const need of ["head", "hhea", "OS/2", "maxp", "cmap", "hmtx"]) if (!T[need]) throw new Error(`${label}: no ${need} table`);
  if (T.hmtx.transformed) throw new Error(`${label}: hmtx is transformed — not handled`);
  const head = T.head.data, hhea = T.hhea.data, os2 = T["OS/2"].data;
  if (head.readUInt32BE(12) !== 0x5f0f3cf5) throw new Error(`${label}: head magic mismatch (table walk is off)`);
  const upm = head.readUInt16BE(18);
  const m = {
    label, unitsPerEm: upm,
    hhea: { ascender: hhea.readInt16BE(4), descender: hhea.readInt16BE(6), lineGap: hhea.readInt16BE(8) },
    os2: {
      xAvgCharWidth: os2.readInt16BE(2), fsSelection: os2.readUInt16BE(62), useTypoMetrics: !!(os2.readUInt16BE(62) & 0x80),
      typoAscender: os2.readInt16BE(68), typoDescender: os2.readInt16BE(70), typoLineGap: os2.readInt16BE(72),
      winAscent: os2.readUInt16BE(74), winDescent: os2.readUInt16BE(76),
      capHeight: os2.length >= 90 ? os2.readInt16BE(88) : null, xHeight: os2.length >= 88 ? os2.readInt16BE(86) : null,
    },
  };
  const numH = hhea.readUInt16BE(34);
  const cmap = parseCmap(T.cmap.data);
  const hmtx = T.hmtx.data;
  const adv = (gid) => hmtx.readUInt16BE(Math.min(gid, numH - 1) * 4);
  let sum = 0, wsum = 0, missing = [];
  for (const [ch, f] of Object.entries(TR_FREQ)) {
    const gid = cmap.get(ch.codePointAt(0));
    if (!gid) { missing.push(ch); continue; }
    sum += f * adv(gid); wsum += f;
  }
  m.avgAdvanceEm = sum / wsum / upm;
  m.avgMissing = missing;
  m.zeroAdvanceEm = cmap.get(48) ? adv(cmap.get(48)) / upm : null;
  m.glyphCount = T.maxp.data.readUInt16BE(4);
  m.cmapSize = cmap.size;
  return m;
}

/* ── Fetch the css2 stylesheet and the latin 400 upright face of each family. ─────────── */
const css = await (await fetch(CSS_URL, { headers: { "User-Agent": UA } })).text();
const faces = [];
// Google writes `/* latin */` BEFORE each `@font-face`, so the comment names the block after it.
for (const m of css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g)) {
  const block = m[2];
  const get = (re) => block.match(re)?.[1];
  faces.push({
    family: get(/font-family:\s*'([^']+)'/), style: get(/font-style:\s*(\w+)/), weight: get(/font-weight:\s*([\d ]+)/)?.trim(),
    src: get(/url\(([^)]+)\)/), unicodeRange: get(/unicode-range:\s*([^;]+);/), subset: m[1],
  });
}
const result = { cssUrl: CSS_URL, faces: faces.map(({ family, style, weight, subset }) => ({ family, style, weight, subset })), families: [] };

for (const fam of FAMILIES) {
  const face = faces.find((f) => f.family === fam.family && f.style === "normal" && /^400/.test(f.weight) && f.subset === "latin");
  if (!face) throw new Error(`no latin 400 upright face for ${fam.family}`);
  const cachePath = join(CACHE, `${fam.family.replace(/\s+/g, "-")}-400-latin.woff2`);
  let buf;
  try { buf = readFileSync(cachePath); } catch { buf = Buffer.from(await (await fetch(face.src)).arrayBuffer()); writeFileSync(cachePath, buf); }
  const web = metricsOf(buf, fam.family);
  const fb = metricsOf(readFileSync(fam.fallback.file), fam.fallback.name);
  const sizeAdjust = web.avgAdvanceEm / fb.avgAdvanceEm;
  const pct = (v) => `${(v * 100).toFixed(2)}%`;
  const overrides = {
    "size-adjust": pct(sizeAdjust),
    "ascent-override": pct(web.hhea.ascender / web.unitsPerEm / sizeAdjust),
    "descent-override": pct(Math.abs(web.hhea.descender) / web.unitsPerEm / sizeAdjust),
    "line-gap-override": pct(web.hhea.lineGap / web.unitsPerEm / sizeAdjust),
  };
  result.families.push({ ...fam, face: { weight: face.weight, style: face.style, subset: face.subset, src: face.src, unicodeRange: face.unicodeRange }, webfont: web, fallbackMetrics: fb, sizeAdjust, overrides });
  console.log(`\n@font-face {\n  font-family: "${fam.family} Fallback";\n  src: local("${fam.fallback.name}");\n` +
    Object.entries(overrides).map(([k, v]) => `  ${k}: ${v};`).join("\n") + "\n}");
  console.log(`  /* ${fam.family}: upm ${web.unitsPerEm}, hhea ${web.hhea.ascender}/${web.hhea.descender}/${web.hhea.lineGap}, typo ${web.os2.typoAscender}/${web.os2.typoDescender}/${web.os2.typoLineGap} useTypo=${web.os2.useTypoMetrics}, avg advance ${web.avgAdvanceEm.toFixed(4)}em (missing: ${web.avgMissing.join("") || "none"})`);
  console.log(`     ${fam.fallback.name}: upm ${fb.unitsPerEm}, hhea ${fb.hhea.ascender}/${fb.hhea.descender}/${fb.hhea.lineGap}, avg advance ${fb.avgAdvanceEm.toFixed(4)}em (missing: ${fb.avgMissing.join("") || "none"}) */`);
}
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(result, null, 1));
console.log(`\nwritten ${OUT}`);
