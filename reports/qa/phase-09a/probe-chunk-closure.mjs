#!/usr/bin/env node
/**
 * QA PHASE 09a — INDEPENDENT ROUTE-CHUNK CLOSURE MEASUREMENT
 *
 * The Coder's own warning is the reason this exists: the heavy bytes were
 * never inside `TeklifAl-*.js`, they were inside a shared chunk that
 * `TeklifAl-*.js` STATICALLY imported. Measuring the route chunk alone
 * understates the cost by ~20x. So this walks the STATIC import graph of the
 * emitted ESM chunks and sums the transitive closure.
 *
 *   static edge   `import x from"./a.js"`  `import"./a.js"`  `export*from"./a.js"`
 *   dynamic edge  `import("./a.js")`   — NOT followed; that is the whole point
 *
 * `vite.config.ts` sets `output.hoistTransitiveImports: false`, so the edges
 * emitted in each chunk are that chunk's real direct static imports and the
 * graph is not pre-flattened.
 *
 * Usage: node probe-chunk-closure.mjs <distDir> <chunk-name-prefix>
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, basename } from "node:path";

const distDir = process.argv[2];
const routePrefix = process.argv[3] ?? "TeklifAl";
const assetsDir = join(distDir, "assets");

const files = readdirSync(assetsDir).filter((f) => f.endsWith(".js"));
const sizes = new Map();
const staticEdges = new Map();
const dynamicEdges = new Map();

// Minified rollup output: specifiers are always double-quoted relative paths.
const STATIC_RE = /(?:^|[^.\w$])(?:import|export)\s*(?:[^"'()]*?\bfrom\s*)?"(\.\/[^"]+\.js)"/g;
const DYNAMIC_RE = /import\s*\(\s*"(\.\/[^"]+\.js)"/g;

for (const file of files) {
  const full = join(assetsDir, file);
  sizes.set(file, statSync(full).size);
  const code = readFileSync(full, "utf8");
  const dyn = new Set();
  for (const m of code.matchAll(DYNAMIC_RE)) dyn.add(basename(m[1]));
  const stat = new Set();
  for (const m of code.matchAll(STATIC_RE)) {
    const name = basename(m[1]);
    // `import("./x.js")` also matches the loose static pattern when the
    // preceding token is `import`; the dynamic set is authoritative.
    if (!dyn.has(name)) stat.add(name);
  }
  staticEdges.set(file, stat);
  dynamicEdges.set(file, dyn);
}

function closure(roots) {
  const seen = new Set();
  const queue = [...roots];
  while (queue.length) {
    const cur = queue.pop();
    if (!cur || seen.has(cur) || !sizes.has(cur)) continue;
    seen.add(cur);
    for (const next of staticEdges.get(cur) ?? []) queue.push(next);
  }
  return seen;
}

const kb = (bytes) => (bytes / 1024).toFixed(2);
const sum = (set) => [...set].reduce((total, f) => total + (sizes.get(f) ?? 0), 0);

const routeChunk = files.find((f) => f.startsWith(routePrefix + "-"));
if (!routeChunk) {
  console.error(`no chunk starting with ${routePrefix}- in ${assetsDir}`);
  process.exit(2);
}
const entryChunk = files.find((f) => f.startsWith("index-"));

const routeClosure = closure([routeChunk]);
const entryClosure = entryChunk ? closure([entryChunk]) : new Set();
const marginal = new Set([...routeClosure].filter((f) => !entryClosure.has(f)));

console.log(`DIST                 ${distDir}`);
console.log(`ROUTE CHUNK          ${routeChunk}  ${kb(sizes.get(routeChunk))} kB`);
console.log(`ENTRY CHUNK          ${entryChunk ?? "(none)"}`);
console.log(`STATIC CLOSURE       ${routeClosure.size} chunks  ${kb(sum(routeClosure))} kB`);
console.log(`  of which new to the route (not already in the entry closure):`);
console.log(`MARGINAL CLOSURE     ${marginal.size} chunks  ${kb(sum(marginal))} kB`);
console.log("");
console.log("STATIC CLOSURE MEMBERS (desc):");
for (const f of [...routeClosure].sort((a, b) => sizes.get(b) - sizes.get(a))) {
  console.log(`  ${kb(sizes.get(f)).padStart(10)} kB  ${f}${entryClosure.has(f) ? "   [also in entry]" : ""}`);
}
console.log("");
console.log("DYNAMIC EDGES REACHABLE FROM THE ROUTE'S STATIC CLOSURE:");
const dynFromRoute = new Set();
for (const f of routeClosure) for (const d of dynamicEdges.get(f) ?? []) dynFromRoute.add(d);
for (const d of [...dynFromRoute].sort((a, b) => (sizes.get(b) ?? 0) - (sizes.get(a) ?? 0))) {
  const dc = closure([d]);
  const dMarginal = new Set([...dc].filter((f) => !routeClosure.has(f)));
  console.log(`  ${kb(sizes.get(d) ?? 0).padStart(10)} kB  ${d}   (own static closure beyond the route: ${kb(sum(dMarginal))} kB / ${dMarginal.size} chunks)`);
}
