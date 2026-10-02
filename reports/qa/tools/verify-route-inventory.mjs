#!/usr/bin/env node
/**
 * QA Phase 00 — SC8: independently extract every <Route path=...> from src/App.tsx
 * and diff that set against reports/baseline/route-inventory.md.
 *
 * Reports MISSING_FROM_INVENTORY (route in code, absent from report) and
 * INVENTED_IN_INVENTORY (path row in report with no matching <Route> in code).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..", "..");

const app = readFileSync(resolve(root, "src/App.tsx"), "utf8");
const inv = readFileSync(resolve(root, "reports/baseline/route-inventory.md"), "utf8");

// --- 1. routes declared in code -------------------------------------------
const appLines = app.split(/\r?\n/);
/** @type {{path:string, line:number}[]} */
const codeRoutes = [];
appLines.forEach((l, i) => {
  const m = l.match(/path=\{?["'`]([^"'`]+)["'`]\}?/);
  if (m) codeRoutes.push({ path: m[1], line: i + 1 });
});

// --- 2. paths claimed in the inventory tables ------------------------------
// table rows look like: | `/blog/:slug` | ... |   or  | `*` (public catch-all) | ...
const invPaths = new Set();
for (const line of inv.split(/\r?\n/)) {
  if (!line.startsWith("|")) continue;
  const first = line.split("|")[1];
  if (!first) continue;
  const m = first.match(/`([^`]+)`/);
  if (!m) continue;
  const p = m[1];
  if (!p.startsWith("/") && p !== "*") continue;
  invPaths.add(p);
}

const codePaths = codeRoutes.map((r) => r.path);
const codeSet = new Set(codePaths);

const missing = [...codeSet].filter((p) => !invPaths.has(p));
const invented = [...invPaths].filter((p) => !codeSet.has(p));

console.log("=== QA SC8 route-inventory verification ===");
console.log(`ROUTE_DECLARATIONS_IN_App.tsx: ${codeRoutes.length}`);
console.log(`DISTINCT_PATHS_IN_CODE: ${codeSet.size}`);
console.log(`DISTINCT_PATHS_IN_INVENTORY: ${invPaths.size}`);
console.log(`MISSING_FROM_INVENTORY: ${missing.length ? JSON.stringify(missing) : "[]"}`);
console.log(`INVENTED_IN_INVENTORY: ${invented.length ? JSON.stringify(invented) : "[]"}`);
console.log("\n--- <Route> declarations found in src/App.tsx ---");
for (const r of codeRoutes) console.log(`  App.tsx:${r.line}  ${r.path}`);

const fail = missing.length > 0 || invented.length > 0;
console.log(`\nVERDICT: ${fail ? "FAIL" : "PASS"}`);
process.exit(fail ? 1 : 0);
