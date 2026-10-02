/**
 * QA-owned coverage accounting: compares declared test blocks and assertion
 * counts in e2e/ between the Phase 00 baseline commit and the integrated head.
 * Read-only. Usage: node reports/qa/tools/phase-01-coverage-diff.mjs <baseRef>
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const BASE = process.argv[2] ?? "076c16a";
const git = (...a) => execFileSync("git", a, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const TEST_RE = /(^|\n)\s*test(?:\.describe)?(?:\.\w+)*\s*\(/g;
const ASSERT_RE = /\bexpect(?:\.poll|\.soft)?\s*\(/g;
const SKIP_RE = /\btest\.(skip|fixme|fail|only)\s*\(/g;

const baseFiles = git("ls-tree", "-r", "--name-only", BASE, "e2e/")
  .split("\n").filter((f) => f.endsWith(".ts"));
const headFiles = git("ls-files", "e2e/")
  .split("\n").filter((f) => f.endsWith(".ts"));

function stats(text) {
  return {
    tests: (text.match(TEST_RE) || []).length,
    asserts: (text.match(ASSERT_RE) || []).length,
    skips: (text.match(SKIP_RE) || []).length,
  };
}

const baseStats = {};
for (const f of baseFiles) baseStats[f] = stats(git("show", `${BASE}:${f}`));
const headStats = {};
for (const f of headFiles) if (existsSync(f)) headStats[f] = stats(readFileSync(f, "utf8"));

// Map renames: e2e/X.spec.ts -> e2e/legacy/X.spec.ts
const renameOf = (f) => {
  const legacy = f.replace(/^e2e\//, "e2e/legacy/");
  return headStats[legacy] ? legacy : null;
};

const rows = [];
for (const f of baseFiles) {
  const target = headStats[f] ? f : renameOf(f);
  rows.push({
    baseFile: f,
    headFile: target ?? "(REMOVED)",
    base: baseStats[f],
    head: target ? headStats[target] : { tests: 0, asserts: 0, skips: 0 },
  });
}
const added = headFiles.filter((f) => headStats[f] && !baseStats[f] &&
  !rows.some((r) => r.headFile === f));

const sum = (o, k) => o.reduce((n, r) => n + r[k], 0);
const totals = {
  base: { tests: sum(Object.values(baseStats), "tests"), asserts: sum(Object.values(baseStats), "asserts"), skips: sum(Object.values(baseStats), "skips") },
  head: { tests: sum(Object.values(headStats), "tests"), asserts: sum(Object.values(headStats), "asserts"), skips: sum(Object.values(headStats), "skips") },
};

console.log(JSON.stringify({
  perFile: rows.map((r) => ({
    from: r.baseFile, to: r.headFile,
    tests: `${r.base.tests} -> ${r.head.tests}`,
    asserts: `${r.base.asserts} -> ${r.head.asserts}`,
    skips: `${r.base.skips} -> ${r.head.skips}`,
    changed: r.base.tests !== r.head.tests || r.base.asserts !== r.head.asserts || r.base.skips !== r.head.skips,
  })),
  addedFiles: added.map((f) => ({ file: f, ...headStats[f] })),
  totals,
}, null, 2));
