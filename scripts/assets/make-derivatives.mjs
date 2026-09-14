/**
 * make-derivatives — width variants of the raster assets that carry `srcset`.
 *
 * Phase 10-2a. Writes `<name>-<w>.webp` beside each source in `src/assets/`
 * for every ladder width that is STRICTLY SMALLER than the source; the source
 * itself serves its own width in the `srcset`, so nothing is ever upscaled and
 * nothing is re-encoded at its own size.
 *
 * Encoder: ffmpeg + libwebp (ffmpeg 8.1.1 is on the machine; `sharp` is not
 * installed and CLAUDE.md forbids a new npm package). Quality is MATCHED TO
 * THE SOURCE rather than fixed: lossy WebP does not record the quality it was
 * encoded at, so the script re-encodes the decoded source at its own size
 * across a quality ladder and keeps the quality whose file size lands closest
 * to the source's — the best available estimate of the source's own setting.
 * All widths of one asset are then encoded at that quality, so a derivative
 * is never visibly softer than (or heavier than) the picture it stands in for.
 *
 * Usage:
 *   node scripts/assets/make-derivatives.mjs            build missing/stale derivatives
 *   node scripts/assets/make-derivatives.mjs --force    rebuild everything
 *   node scripts/assets/make-derivatives.mjs --check    verify only; exit 1 if anything is missing or the wrong size
 *   node scripts/assets/make-derivatives.mjs --report reports/10/derivatives.json
 *   node scripts/assets/make-derivatives.mjs hero-cnc-frezeleme industry-defense   (subset)
 *
 * The asset list below is the list of surfaces that render at more than one
 * width across the 375/768/1280/1440 matrix (`reports/10/responsive-images.md`).
 * An asset that renders at one size everywhere does not belong here — a
 * derivative it would never be picked for is dead weight in the repository.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync, unlinkSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { tmpdir } from "node:os";

const ASSET_DIR = "src/assets";
const LADDER = [640, 960, 1600];
const QUALITY_LADDER = [60, 65, 70, 75, 80, 85, 90, 95];

/** Every source that carries a `srcset` on a public route. */
const SOURCES = [
  // ServiceDetail plate hero — every `heroImageMap` entry plus the two fallbacks.
  "hero-cnc-frezeleme", "hero-cnc-tornalama", "hero-mikro-isleme", "hero-derin-delik",
  "hero-enjeksiyon-kalibi", "hero-anodizasyon", "hero-lazer-kazima", "hero-havacilik",
  "hero-basincli-dokum", "hero-fikstur-aparat", "hero-silikon-kaliplama", "hero-mekanik-yuzey",
  "hero-kimyasal-islemler", "hero-boya-kaplama", "hero-tavlama", "hero-qr-datamatrix",
  "hero-logo-markalama", "hero-insert-uygulama", "hero-mekanik-montaj", "hero-kitting-paketleme",
  "hero-kaynakli-imalat", "hero-makine-parkuru", "hero-kalite-kontrol", "hero-dfm-tasarim",
  "hero-yuzey-islemleri", "hero-tolerans-hassasiyet", "hero-malzeme-kutuphanesi", "hero-proje-yonetimi",
  "hero-tedarik-zinciri", "hero-operasyonel-verimlilik", "hero-seri-uretim",
  "cnc-workshop", "quality-control",
  // Blog lead (`/blog`) and blog-detail plates.
  "blog-5eksen", "blog-malzeme", "blog-dfm", "service-cnc-freze",
  // Capability-profile plate (`/kabiliyet-profilleri/:slug`).
  "industry-defense", "industry-medical",
];

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const CHECK = flag("--check");
const FORCE = flag("--force");
const REPORT = option("--report");
const subset = args.filter((a) => !a.startsWith("--") && a !== REPORT);
const names = subset.length ? subset : SOURCES;

function run(cmd, cmdArgs) {
  return execFileSync(cmd, cmdArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function probe(file) {
  const [w, h] = run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", file]).split(",").map(Number);
  return { width: w, height: h };
}

function encode(src, out, width, quality) {
  // `-2` keeps the height even (WebP is 4:2:0); lanczos is the sharpest of the
  // stock downscalers on machined-metal detail. `-preset photo` is libwebp's
  // photographic tuning; the sources are photographic renders.
  const vf = width ? `scale=${width}:-2:flags=lanczos` : "scale=iw:ih";
  run("ffmpeg", ["-y", "-v", "error", "-i", src, "-vf", vf, "-c:v", "libwebp", "-quality", String(quality), "-compression_level", "6", "-preset", "photo", "-pix_fmt", "yuv420p", out]);
  return statSync(out).size;
}

/** Estimate the source's own encoder quality by size-matching a same-size re-encode. */
function matchQuality(src, sourceBytes) {
  const scratch = join(tmpdir(), "mas-derivatives");
  mkdirSync(scratch, { recursive: true });
  let best = { quality: 80, delta: Infinity };
  for (const q of QUALITY_LADDER) {
    const out = join(scratch, `${basename(src, ".webp")}-q${q}.webp`);
    const bytes = encode(src, out, null, q);
    unlinkSync(out);
    const delta = Math.abs(bytes - sourceBytes);
    if (delta < best.delta) best = { quality: q, delta };
  }
  return best.quality;
}

const rows = [];
let failures = 0;

for (const name of names) {
  const src = join(ASSET_DIR, `${name}.webp`);
  if (!existsSync(src)) { console.error(`MISSING SOURCE ${src}`); failures++; continue; }
  const { width, height } = probe(src);
  const sourceBytes = statSync(src).size;
  const widths = LADDER.filter((w) => w < width);
  const row = { name, source: { width, height, bytes: sourceBytes }, quality: null, derivatives: [] };

  let quality = null;
  for (const w of widths) {
    const out = join(ASSET_DIR, `${name}-${w}.webp`);
    const stale = existsSync(out) ? probe(out).width !== w : true;
    if (CHECK) {
      if (stale) { console.error(`${existsSync(out) ? "WRONG WIDTH" : "MISSING"} ${out}`); failures++; }
      else row.derivatives.push({ width: w, ...probe(out), bytes: statSync(out).size });
      continue;
    }
    if (stale || FORCE) {
      quality ??= matchQuality(src, sourceBytes);
      encode(src, out, w, quality);
    }
    row.derivatives.push({ width: w, ...probe(out), bytes: statSync(out).size });
  }
  row.quality = quality;
  rows.push(row);
  const list = row.derivatives.map((d) => `${d.width}w ${(d.bytes / 1024).toFixed(1)}K`).join("  ");
  console.log(`${name.padEnd(30)} ${String(width).padStart(4)}x${String(height).padEnd(4)} ${(sourceBytes / 1024).toFixed(1).padStart(6)}K  q=${quality ?? "-"}  ${list || "(no derivative: source is not wider than 640)"}`);
}

if (REPORT) {
  mkdirSync(dirname(REPORT), { recursive: true });
  writeFileSync(REPORT, JSON.stringify(rows, null, 2) + "\n");
  console.log(`report -> ${REPORT}`);
}

// Orphan guard: a `-<w>.webp` beside no source, or for a source not in the list, is flagged.
for (const file of readdirSync(ASSET_DIR)) {
  const m = /^(.+)-(640|960|1600)\.webp$/.exec(file);
  if (m && !SOURCES.includes(m[1])) { console.error(`ORPHAN DERIVATIVE ${join(ASSET_DIR, file)} (source "${m[1]}" is not in SOURCES)`); failures++; }
}

if (failures) { console.error(`${failures} problem(s)`); process.exit(1); }
