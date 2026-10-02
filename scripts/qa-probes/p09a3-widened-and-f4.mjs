/* QA 09a-R3 — two independent checks that do not go through the gate's own
 * control harness:
 *
 *   (1) FALSE POSITIVES on the widened `delivery-or-quality-rate`. The two new
 *       alternations are lifted VERBATIM out of `scripts/claims-gate.mjs` (and
 *       the lift is asserted, so a copy that drifted fails loudly), then run
 *       over a battery of legitimate strings and over the whole scanned tree.
 *
 *   (2) THE F4 REVERSAL. Run `isPublishableSpec` — an ALLOWLIST — over every
 *       `comparisonTables` header in the tree, as the packet asked the Coder to
 *       do, and count what it would drop. Then compare the surviving header
 *       count with the row width each table actually renders.
 *
 * Read-only. No production file is written.
 */
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const OUT = resolve(ROOT, "reports/qa/phase-09a-r3");
mkdirSync(OUT, { recursive: true });

/* ── (1) lift the two new alternations verbatim ──────────────────────────── */
const gateSrc = readFileSync(resolve(ROOT, "scripts/claims-gate.mjs"), "utf8");
const UNSOURCED_BENEFIT_PCT =
  String.raw`(?:%\s?|yüzde\s+)\d{1,3}(?:[.,]\d+)?(?:\s?[-–]\s?\d{1,3}(?:[.,]\d+)?)?(?:['’]?[a-zçğıöşü]{0,4})?` +
  String.raw`[^.!?;{}\n"]{0,30}?(?:tasarruf|kazanç|daha hızlı|daha ucuz|daha az maliyet|maliyet düş|maliyet avantaj|verim(?:lilik)?\s+artış|hız\s+artış)`;
const UNSOURCED_BENEFIT_LABEL_VALUE =
  String.raw`(?:label|title|name|key)\s*:\s*["'\x60][^"'\x60]*(?:tasarruf|kazanç|maliyet düşüşü|verim artışı|hız artışı|iyileşme)[^"'\x60]*["'\x60]` +
  String.raw`\s*,\s*(?:value|val|text|desc)\s*:\s*["'\x60][^"'\x60]*(?:%\s?|yüzde\s+)\d[^"'\x60]*["'\x60]`;

/* The lift is only evidence if it is the same text. Both halves of each
   constant must appear literally in the gate source. */
const liftOk = [
  String.raw`[^.!?;{}\n"]{0,30}?(?:tasarruf|kazanç|daha hızlı|daha ucuz|daha az maliyet|maliyet düş|maliyet avantaj|verim(?:lilik)?\s+artış|hız\s+artış)`,
  String.raw`\s*,\s*(?:value|val|text|desc)\s*:\s*["'\x60][^"'\x60]*(?:%\s?|yüzde\s+)\d[^"'\x60]*["'\x60]`,
].every((s) => gateSrc.includes(s));
if (!liftOk) throw new Error("the alternations were not lifted verbatim from claims-gate.mjs — abort");

const NEW_ALTS = new RegExp([UNSOURCED_BENEFIT_PCT, UNSOURCED_BENEFIT_LABEL_VALUE].join("|"), "gi");

/** Legitimate strings the widened rule MUST NOT touch, plus the two the Coder
 *  named. Each is a real shape from this repository or its domain. */
const BATTERY = [
  { s: '["0.1 – 0.2", "Ayna parlaklığı", "Optik, yatak yüzeyleri", "Lepleme, polisaj", "+%80-100"],', want: "silent", why: "Ra guide surcharge — a price relativity, no performance claim" },
  { s: '{ label: "Ek Maliyet", value: "+%80-100" },', want: "silent", why: "the same surcharge as a label/value pair" },
  { s: '{ label: "Ek Maliyet", value: "+%80-100 daha yüksek" },', want: "silent", why: "surcharge with a comparative that is not a benefit" },
  { s: '"OFE bakır (C10100 — IACS %101) ve ETP bakır (C11000 — IACS %99.9)"', want: "silent", why: "material conductivity percentage" },
  { s: '{ label: "IACS İletkenlik", value: "%99+" },', want: "silent", why: "material percentage as label/value" },
  { s: '{ label: "Okuma Oranı", value: "%99.9+" },', want: "silent", why: "read rate — owned by another rule, not this one" },
  { s: '"Kaplama kalınlığının %50\'si malzemeye nüfuz eder, %50\'si yüzeyden dışarı çıkar."', want: "silent", why: "physics of a coating, not a benefit" },
  { s: '"Alaşımda %12 silisyum bulunur ve akışkanlığı artırır."', want: "silent", why: "alloy composition next to an ordinary verb" },
  { s: '"Nem %50 bağıl nemin altında tutulur."', want: "silent", why: "environmental spec" },
  { s: '"Karbon çeliğinde %0,45 C, tasarruf sağlamaz."', want: "fires", why: "adversarial: composition 24 chars from `tasarruf` — inside the 30-char gap" },
  { s: '"%20 uzama, %8 kesit daralması ve iyi kazanç sağlar."', want: "fires", why: "adversarial: a mechanical property reaching `kazanç` through the gap" },
  { s: '"Fire oranı %2 seviyesindedir."', want: "silent", why: "already owned by the pre-existing alternation? measured, not assumed" },
  { s: '"Parça başına %30 daha hızlı üretim"', want: "fires", why: "the F1 class" },
  { s: '{ label: "Zaman Kazancı", value: "%25" },', want: "fires", why: "the F2b label/value class" },
  { s: '{ label: "Kavite", value: "8" },', want: "silent", why: "an ordinary spec row" },
  { s: '"Yüzde doksan sekiz kalite oranı"', want: "n/a", why: "pre-existing alternation, not one of the two new ones" },
];

const battery = BATTERY.map((b) => {
  NEW_ALTS.lastIndex = 0;
  const m = NEW_ALTS.exec(b.s);
  const fired = m !== null;
  return {
    string: b.s,
    why: b.why,
    expected: b.want,
    fired,
    matched: m ? m[0] : null,
    result: b.want === "n/a" ? "informational" : (fired ? "fires" : "silent") === b.want ? "as expected" : "*** UNEXPECTED ***",
  };
});

/* ── the whole scanned tree, comment-blanked, against the two new alternations */
const ROOTS = ["src/pages", "src/components", "src/data", "src/content", "src/hooks", "src/utils", "src/config", "src/lib", "src/routes"];
const EXCLUDE = /admin\/|musteri\/|AdminDashboard|AdminLogin|MusteriPaneli/i;
const walk = (dir, acc = []) => {
  for (const name of readdirSync(dir)) {
    const p = resolve(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx)$/.test(p)) acc.push(p);
  }
  return acc;
};
/** Crude but conservative: blank block and line comments, preserving length. */
const blankComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));

const treeHits = [];
const files = ROOTS.flatMap((r) => {
  try {
    return walk(resolve(ROOT, r));
  } catch {
    return [];
  }
}).concat([resolve(ROOT, "src/App.tsx")]);
for (const f of files) {
  const rel = relative(ROOT, f).replace(/\\/g, "/");
  if (EXCLUDE.test(rel)) continue;
  const text = blankComments(readFileSync(f, "utf8"));
  NEW_ALTS.lastIndex = 0;
  let m;
  while ((m = NEW_ALTS.exec(text)) !== null) {
    treeHits.push({ file: rel, line: text.slice(0, m.index).split("\n").length, match: m[0] });
  }
}

/* ── (2) the F4 reversal: the allowlist over comparison-table headers ─────── */
const ENTRY = resolve(HERE, "p09a3-f4-entry.mjs");
writeFileSync(
  ENTRY,
  ['export { servicePages } from "@/data/servicePages";', 'export { isPublishableSpec } from "@/content/claims";', ""].join("\n"),
  "utf8",
);
const BUNDLE = resolve(HERE, "p09a3-f4.bundle.mjs");
await build({
  entryPoints: [ENTRY],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: BUNDLE,
  logLevel: "warning",
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("http://127.0.0.1:1/qa-probe-never-reachable"),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify("qa-probe-junk-key-not-a-credential"),
  },
  alias: { "@/integrations/supabase/client": resolve(HERE, "p09a3-supabase-client-stub.mjs"), "@": resolve(ROOT, "src") },
});
const { servicePages, isPublishableSpec } = await import(pathToFileURL(BUNDLE).href);

const headerVerdicts = [];
let tables = 0;
let headersTotal = 0;
let headersDropped = 0;
const brokenTables = [];
for (const page of servicePages) {
  for (const t of page.comparisonTables ?? []) {
    tables += 1;
    const kept = [];
    for (const h of t.headers) {
      headersTotal += 1;
      /* Exactly as the packet's instruction would have to be implemented:
         a header is one string, so it is both label and value. */
      const ok = isPublishableSpec({ label: h, value: h });
      if (!ok) headersDropped += 1;
      else kept.push(h);
      headerVerdicts.push({ page: page.slug, table: t.title, header: h, kept: ok });
    }
    const rowWidths = [...new Set(t.rows.map((r) => r.length))];
    if (kept.length !== t.headers.length) {
      brokenTables.push({
        page: page.slug,
        table: t.title,
        headersBefore: t.headers.length,
        headersAfter: kept.length,
        rowWidths,
        dropped: t.headers.filter((h) => !kept.includes(h)),
      });
    }
    /* Sanity on the tree as it stands: headers must equal row width. */
    if (rowWidths.length !== 1 || rowWidths[0] !== t.headers.length) {
      headerVerdicts.push({ page: page.slug, table: t.title, MISMATCH_IN_TREE: { headers: t.headers.length, rowWidths } });
    }
  }
}

const report = {
  widenedRule: {
    liftedVerbatimFromGate: liftOk,
    battery,
    liveTreeHits: treeHits,
  },
  f4Reversal: {
    tables,
    headersTotal,
    headersDropped,
    dropRate: `${((headersDropped / headersTotal) * 100).toFixed(1)}%`,
    tablesThatWouldLoseAColumn: brokenTables.length,
    brokenTables,
    headerVerdicts,
  },
};
writeFileSync(resolve(OUT, "widened-and-f4.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("── widened delivery-or-quality-rate: false-positive battery ──");
for (const b of battery) console.log(`  ${b.result.padEnd(16)} fired=${String(b.fired).padEnd(5)} ${b.string.slice(0, 82)}`);
console.log(`\nlive hits of the two NEW alternations across the scanned tree: ${treeHits.length}`);
for (const h of treeHits) console.log(`  ${h.file}:${h.line}  ${h.match}`);

console.log("\n── F4 reversal: isPublishableSpec run over comparisonTables headers ──");
console.log(`  tables                       : ${tables}`);
console.log(`  headers                      : ${headersTotal}`);
console.log(`  headers the ALLOWLIST DROPS  : ${headersDropped}  (${report.f4Reversal.dropRate})`);
console.log(`  tables that would lose ≥1 col: ${brokenTables.length}`);
console.log("\n  first 12 tables that would break (headers vs. row width):");
for (const b of brokenTables.slice(0, 12)) {
  console.log(`   ${b.page} / "${b.table}"  ${b.headersBefore} -> ${b.headersAfter} headers, rows still ${b.rowWidths.join("/")} cells`);
  console.log(`     dropped: ${b.dropped.join(" | ")}`);
}
const mismatches = headerVerdicts.filter((v) => v.MISMATCH_IN_TREE);
console.log(`\n  header/row-width mismatches IN THE TREE AS IT STANDS: ${mismatches.length}`);
for (const m of mismatches) console.log(`   ${m.page} / "${m.table}" ${JSON.stringify(m.MISMATCH_IN_TREE)}`);
