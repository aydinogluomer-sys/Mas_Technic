/**
 * QA 09a-R2 item 4 — column and list coherence.
 *
 * C2 removed four whole duration columns rather than filling them with five
 * identical "Teklifle birlikte" cells. A half-neutralised column (some cells
 * numeric, some deferred) was C1's failure and the reason C2 existed.
 *
 * This walks the REAL servicePages structure and reports, for every
 * comparisonTables column whose header looks time-related, the full set of
 * cell values -- so a mixed column is visible rather than inferred.
 */
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import { writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const outfile = path.join(root, "scripts", "qa-probes", ".p09a2-cols.mjs");

await build({
  entryPoints: [path.join(root, "src", "data", "servicePages.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile,
  alias: { "@": path.join(root, "src") },
  define: {
    "import.meta.env": JSON.stringify({
      VITE_SUPABASE_URL: "http://127.0.0.1:9",
      VITE_SUPABASE_PUBLISHABLE_KEY: "qa-probe-not-a-real-key",
      VITE_SUPABASE_PROJECT_ID: "qa-probe",
      MODE: "test", DEV: false, PROD: false,
    }),
  },
  logLevel: "error",
});

const { servicePages } = await import(pathToFileURL(outfile).href);

// Header words that mean "how long", in the delivery/production sense.
const TIME_HEADER = /(s[üu]re|termin|teslim|zaman|takvim|g[üu]n|hafta|çevrim|cevrim|lead)/i;
// A cell that states an absolute duration.
const DURATION_CELL = /\b\d+\s*[-–—]?\s*\d*\s*(iş\s*g[üu]n[üu]|g[üu]n|saat|hafta|ay)\b/iu;

const report = [];
let timeColCount = 0;
let mixedCount = 0;

for (const page of servicePages) {
  for (const t of page.comparisonTables ?? []) {
    (t.headers ?? []).forEach((h, ci) => {
      if (!TIME_HEADER.test(h)) return;
      timeColCount++;
      const cells = (t.rows ?? []).map((r) => r[ci]);
      const durational = cells.filter((c) => DURATION_CELL.test(String(c ?? "")));
      const deferred = cells.filter((c) => /teklif|birlikte|incelem/i.test(String(c ?? "")));
      const mixed = durational.length > 0 && deferred.length > 0;
      if (mixed) mixedCount++;
      report.push({
        slug: page.slug, table: t.title, header: h, cells,
        durationalCells: durational, deferredCells: deferred, mixed,
      });
    });
  }

  // Lists / specs that may carry a duration
  for (const s of page.technicalSpecs ?? []) {
    if (TIME_HEADER.test(s.label ?? "")) {
      report.push({ slug: page.slug, table: "<technicalSpecs>", header: s.label, cells: [s.value],
        durationalCells: DURATION_CELL.test(String(s.value)) ? [s.value] : [], deferredCells: [], mixed: false });
    }
  }
}

writeFileSync(path.join(root, "reports", "qa", "phase-09a-r2", "columns.json"), JSON.stringify(report, null, 2), "utf8");

console.log(`TIME_LIKE_COLUMNS=${timeColCount}  MIXED_COLUMNS=${mixedCount}`);
console.log("");
for (const r of report) {
  const flag = r.mixed ? "  ‼ MIXED" : (r.durationalCells.length ? "  ← carries duration" : "");
  console.log(`[${r.slug}] "${r.table}" :: column "${r.header}"${flag}`);
  console.log(`    cells: ${JSON.stringify(r.cells)}`);
}
