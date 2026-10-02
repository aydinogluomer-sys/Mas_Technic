/**
 * Phase 00 — throwaway public-copy claim scanner.
 *
 * Walks the public-facing source (src/pages, src/components, src/data, plus
 * index.html) EXCLUDING admin/ and musteri/ surfaces, and reports every line
 * matching a claim pattern. Output is deliberately raw: the human-curated
 * classification lives in reports/baseline/content-claims-inventory.md.
 *
 * Usage: node reports/baseline/tools/scan-claims.mjs > reports/baseline/raw/claims-scan.txt
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const ROOTS = ["src/pages", "src/components", "src/data", "index.html"];
const EXCLUDE = [/[\\/]admin[\\/]/i, /[\\/]musteri[\\/]/i, /[\\/]AdminDashboard\./, /[\\/]AdminLogin\./, /[\\/]MusteriPaneli\./];
const EXT = /\.(tsx?|html)$/;

/** Ordered: first matching pattern wins, so the label is stable. */
const PATTERNS = [
  ["certification", /\b(AS9100|IATF\s?16949|ISO\s?9001|ISO\s?14001|ISO\s?13485|OHSAS|NADCAP|EN\s?10204|ISO\s?2768|ASME\s?Y14\.5|PPAP|MIL-DTL)\b/i],
  ["tolerance", /±\s?0[.,]\d+\s?(mm|µm|um)?|\bRa\s?0\.\d|\bCpk\b|\bH7\b|\bh6\b/],
  ["kpi-percent", /%\s?\d{1,3}([.,]\d+)?|\b\d{1,3}([.,]\d+)?\s?%/],
  ["kpi-count", /\b\d{2,}\s?\+|\b50\+|\b\d+K\+|\b\d{1,3}\.\d{3}\b/],
  ["sla-time", /\b(24|48|72)\s?(saat|s\b|h\b)|\b\d+\s?(gün|iş günü)\b/i],
  ["facility-scale", /\b\d[\d.,]*\s?m²|tezgah|makine\s?park|üretim\s?alan|vardiya|7\/24|24\/7/i],
  ["measurement-doc", /\bCMM\b|ölçüm raporu|FAI\b|malzeme sertifika|kalite belgesi|sertifikas[ıi]/i],
  ["customer-reference", /\b(HPT|TAAC|METSAN|ZTM|TEKNİK BALANS|TEKNIK BALANS|AKON|TEKNOPAR)\b/],
  ["demo-badge", /DEMO İÇERİK|ÖRNEK İÇERİK|HAZIRLANIYOR|TEMSİLÎ|TEMSİLİ|GERÇEK RAPOR DEĞİLDİR|DOĞRULANMIŞ"/i],
  ["verification-qr", /QR|doğrula|verify/i],
  ["language-toggle", /["'>]EN["'<]|availableLanguage|English|İngilizce/],
];

const results = new Map(PATTERNS.map(([name]) => [name, []]));

function walk(path) {
  const abs = resolve(REPO_ROOT, path);
  let stats;
  try { stats = statSync(abs); } catch { return; }
  if (stats.isDirectory()) {
    for (const entry of readdirSync(abs)) walk(join(path, entry));
    return;
  }
  if (!EXT.test(abs)) return;
  if (EXCLUDE.some((re) => re.test(abs))) return;

  const rel = relative(REPO_ROOT, abs).replace(/\\/g, "/");
  const lines = readFileSync(abs, "utf8").split(/\r?\n/);
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*")) return;
    for (const [name, re] of PATTERNS) {
      if (re.test(line)) {
        results.get(name).push(`${rel}:${index + 1}: ${trimmed.slice(0, 220)}`);
        break;
      }
    }
  });
}

for (const root of ROOTS) walk(root);

let grand = 0;
console.log("# Phase 00 raw public-copy claim scan");
console.log(`# roots: ${ROOTS.join(", ")}`);
console.log("# excluded: admin/, musteri/, AdminDashboard, AdminLogin, MusteriPaneli");
console.log("");
console.log("## COUNTS");
for (const [name, hits] of results) {
  console.log(`${name.padEnd(20)} ${hits.length}`);
  grand += hits.length;
}
console.log(`${"TOTAL".padEnd(20)} ${grand}`);
for (const [name, hits] of results) {
  console.log("");
  console.log(`## ${name.toUpperCase()} (${hits.length})`);
  for (const hit of hits) console.log(hit);
}
