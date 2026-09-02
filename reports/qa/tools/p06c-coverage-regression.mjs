#!/usr/bin/env node
/**
 * R4 — did the corrected gate SILENTLY LOSE COVERAGE?
 *
 * The Coder self-reported an instrument regression: its literal-boundary guard
 * silenced two real claims, `company-scale-disclosure` dropping 42 → 38 on the
 * known-red pre-Phase-06 tree, and it says it restored both. Its stated
 * principle is right — a gate that reports FEWER claims on a red tree is the
 * same failure as one that reports zero on a live one — so it has to be checked
 * rule by rule, and by SET rather than by count: a rule that gains three hits
 * and loses three nets to zero and hides the loss.
 *
 * This runs two gate builds over the SAME tree and diffs the violation sets
 * keyed `rule@file:line`. Anything the previous gate reported and the new gate
 * does not is a coverage loss and must be individually justified.
 *
 * Usage:
 *   node p06c-coverage-regression.mjs --prev <gate.mjs> --new <gate.mjs> --tree <dir>
 */
import { execFileSync } from "node:child_process";
import { copyFileSync } from "node:fs";
import { resolve, join } from "node:path";

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i === -1 ? d : argv[i + 1]; };
const TREE = resolve(arg("--tree"));
const PREV = resolve(arg("--prev"));
const NEW = resolve(arg("--new"));

function run(gate, tag) {
  const dest = join(TREE, "scripts", `gate-${tag}.mjs`);
  copyFileSync(gate, dest);
  let out = "";
  try {
    out = execFileSync(process.execPath, [dest], { encoding: "utf8", cwd: TREE, maxBuffer: 64 * 1024 * 1024 });
  } catch (e) { out = (e.stdout ?? "") + (e.stderr ?? ""); }
  /** @type {Map<string, Set<string>>} rule → set of `file:line` */
  const byRule = new Map();
  let rule = null;
  for (const line of out.split("\n")) {
    const h = line.match(/^### ([a-z-]+) — (\d+)/);
    if (h) { rule = h[1]; if (!byRule.has(rule)) byRule.set(rule, new Set()); continue; }
    const v = line.match(/^\s{2}(\S+?):(\d+): /);
    if (v && rule) byRule.get(rule).add(`${v[1]}:${v[2]}`);
  }
  const header = out.split("\n").find((l) => l.startsWith("# scanned:")) ?? "";
  const verdict = out.split("\n").find((l) => /^(PASS|FAIL)/.test(l)) ?? "";
  return { byRule, header, verdict };
}

const prev = run(PREV, "prev");
const next = run(NEW, "new");

console.log("# COVERAGE REGRESSION — previous gate vs corrected gate, same tree");
console.log(`# tree:   ${TREE}`);
console.log(`# ${prev.header}`);
console.log(`# prev:   ${prev.verdict}`);
console.log(`# new:    ${next.verdict}`);
console.log("");

const rules = [...new Set([...prev.byRule.keys(), ...next.byRule.keys()])].sort();
let lost = 0;
let gained = 0;
console.log("rule                                  prev   new  delta   LOST  GAINED");
for (const r of rules) {
  const a = prev.byRule.get(r) ?? new Set();
  const b = next.byRule.get(r) ?? new Set();
  const onlyPrev = [...a].filter((x) => !b.has(x));
  const onlyNew = [...b].filter((x) => !a.has(x));
  lost += onlyPrev.length;
  gained += onlyNew.length;
  const d = b.size - a.size;
  console.log(
    `${r.padEnd(36)} ${String(a.size).padStart(5)} ${String(b.size).padStart(5)} ${(d > 0 ? "+" + d : String(d)).padStart(6)} ${String(onlyPrev.length).padStart(6)} ${String(onlyNew.length).padStart(7)}`,
  );
}
console.log("");
console.log(`## LINES THE PREVIOUS GATE REPORTED AND THE CORRECTED GATE DOES NOT — ${lost}`);
for (const r of rules) {
  const a = prev.byRule.get(r) ?? new Set();
  const b = next.byRule.get(r) ?? new Set();
  for (const x of a) if (!b.has(x)) console.log(`  LOST    ${r}  ${x}`);
}
console.log("");
console.log(`## lines only the corrected gate reports — ${gained}`);
for (const r of rules) {
  const a = prev.byRule.get(r) ?? new Set();
  const b = next.byRule.get(r) ?? new Set();
  for (const x of b) if (!a.has(x)) console.log(`  gained  ${r}  ${x}`);
}
console.log("");
console.log(lost === 0
  ? "COVERAGE_REGRESSION: NONE — every line the previous gate saw, the corrected gate still sees."
  : `COVERAGE_REGRESSION: ${lost} line(s) lost — each must be justified individually.`);
