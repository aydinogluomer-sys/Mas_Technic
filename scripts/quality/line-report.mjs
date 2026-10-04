#!/usr/bin/env node
/**
 * Line counts of src/ in the buckets the minimal-code plan measures against:
 * content (never shortened), locked zones (never refactored), and the rest
 * (refactorable). Same definitions at every gate, so the numbers compare.
 *
 *   node scripts/quality/line-report.mjs [--out report.json]
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BUCKETS = [
  ["content", /^src\/(data|content|i18n\/locales)\/|^src\/integrations\/supabase\/types\.ts$/],
  ["locked", /^src\/components\/(admin|musteri)\/|^src\/pages\/(AdminDashboard|AdminLogin|MusteriPaneli)\.tsx$|^src\/utils\/excelExport\.ts$/],
];
const files = [];
const walk = (dir) => readdirSync(dir).forEach((name) => {
  const path = join(dir, name);
  if (statSync(path).isDirectory()) walk(path);
  else if (/\.(ts|tsx|css)$/.test(name)) files.push(path.split("\\").join("/"));
});
walk("src");

const totals = { content: 0, locked: 0, refactorable: 0 };
const byExt = { ts: 0, tsx: 0, css: 0 };
for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n").length - 1;
  totals[BUCKETS.find(([, re]) => re.test(file))?.[0] ?? "refactorable"] += lines;
  byExt[file.split(".").pop()] += lines;
}
const total = Object.values(totals).reduce((a, b) => a + b, 0);
const report = { capturedAt: new Date().toISOString(), files: files.length, total, ...totals, byExtension: byExt };
console.log(`src: ${total} lines in ${files.length} files · content ${totals.content} · locked ${totals.locked} · refactorable ${totals.refactorable}`);
const outIndex = process.argv.indexOf("--out");
if (outIndex > -1) writeFileSync(process.argv[outIndex + 1], JSON.stringify(report, null, 2));
