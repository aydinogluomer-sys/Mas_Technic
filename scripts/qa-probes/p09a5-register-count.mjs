/**
 * QA 09a-R5 item 4 — COUNT THE 09b SOFTWARE-INVENTORY CLASS INDEPENDENTLY.
 *
 * The packet says C5 makes it six and the orchestrator re-counted six, and asks
 * me not to take two agreeing parties as proof. So this counts from the source,
 * with the class defined before the counting starts:
 *
 *   A SITE is a LIVE (non-comment) string in the public source that names a CAD
 *   AUTHORING package — CATIA, SolidWorks, NX — as SOMETHING WE OPERATE.
 *
 * The two exclusions the definition forces, both stated rather than assumed:
 *   - a comment is not a site: `blankComments()` is what the gate itself uses to
 *     decide that, so the split is made with the gate's own function, not a
 *     regex of my own;
 *   - naming a package as A FILE FORMAT THE VISITOR MAY SEND is the CAD-format
 *     class, not the software-inventory class. `servicePages.ts:224` is exactly
 *     that and 09a-C3 documents why it stays, at `:216-222`.
 *
 * The search is over EVERY scanned root, not `servicePages.ts` alone, because
 * "six sites in one file" is a claim about the whole tree and the register's
 * single-file scope is one of the things under test.
 *
 * Usage: node --import=./scripts/qa-probes/p09a5-expose.mjs scripts/qa-probes/p09a5-register-count.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const gate = await import(new URL("../claims-gate.mjs", import.meta.url).href);
const { DEFERRED_09B_SOFTWARE_INVENTORY, checkDeferredClassRegister } = gate;

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const ROOTS = [
  "src/pages", "src/components", "src/data", "src/content", "src/hooks",
  "src/utils", "src/config", "src/lib", "src/routes", "src/App.tsx", "index.html", "public",
];
const EXCLUDE = [/[\\/]admin[\\/]/i, /[\\/]musteri[\\/]/i, /AdminDashboard\./, /AdminLogin\./, /MusteriPaneli\./];
const TEXT_EXT = /\.([cm]?[jt]sx?|html|txt|xml|json|webmanifest|svg|md)$/;
const PACKAGE = /CATIA|SolidWorks|Solid\s?Works|\bNX\b/i;

/* `blankComments` is not exported by name in the appended list, so the split is
   made by re-deriving it the way the gate does: read the file, blank it, and ask
   whether the line still carries the package name. */
const blank = gate.blankComments ?? null;

function* files(rel) {
  const abs = resolve(REPO, rel);
  let s;
  try {
    s = statSync(abs);
  } catch {
    return;
  }
  if (s.isDirectory()) {
    for (const e of readdirSync(abs)) yield* files(join(rel, e));
    return;
  }
  if (!TEXT_EXT.test(abs)) return;
  if (EXCLUDE.some((re) => re.test(abs))) return;
  yield rel.replace(/\\/g, "/");
}

const hits = [];
for (const root of ROOTS) {
  for (const rel of files(root)) {
    const raw = readFileSync(resolve(REPO, rel), "utf8");
    if (!PACKAGE.test(raw)) continue;
    const blanked = blank ? blank(raw, rel.endsWith(".html")) : raw;
    const rawLines = raw.split(/\r?\n/);
    const blankLines = blanked.split(/\r?\n/);
    rawLines.forEach((line, i) => {
      if (!PACKAGE.test(line)) return;
      const live = blank ? PACKAGE.test(blankLines[i] ?? "") : null;
      hits.push({ file: rel, line: i + 1, live, text: line.trim() });
    });
  }
}

console.log("# QA 09a-R5 — independent count of the 09b SOFTWARE-INVENTORY class");
console.log(`# blankComments available for the live/comment split: ${blank ? "yes" : "NO — falling back to raw"}`);
console.log("");
console.log(`every line naming CATIA / SolidWorks / NX in the scanned roots: ${hits.length}`);
console.log("");
for (const h of hits) {
  console.log(`  ${h.live === false ? "comment" : "LIVE   "}  ${h.file}:${h.line}`);
  console.log(`           ${h.text.slice(0, 150)}`);
}

const live = hits.filter((h) => h.live !== false);
console.log("");
console.log(`LIVE lines: ${live.length}`);
console.log("");
console.log("## classification of the live lines");
const FORMAT_CLASS = new Set(["src/data/servicePages.ts:224", "src/components/landing/RestoredLandingSections.tsx:42"]);
const inventory = [];
for (const h of live) {
  const key = `${h.file}:${h.line}`;
  if (FORMAT_CLASS.has(key)) {
    console.log(`  CAD-FORMAT class (a file the VISITOR sends, not software we operate): ${key}`);
    continue;
  }
  inventory.push(key);
  console.log(`  SOFTWARE-INVENTORY class: ${key}`);
}
console.log("");
console.log(`## MY COUNT: ${inventory.length}`);
console.log(`   ${inventory.join("  ")}`);

console.log("");
console.log("## the register, as committed");
console.log(`   file:   ${DEFERRED_09B_SOFTWARE_INVENTORY.file}`);
console.log(`   marker: ${DEFERRED_09B_SOFTWARE_INVENTORY.marker}`);
console.log(`   sites:  ${DEFERRED_09B_SOFTWARE_INVENTORY.sites.length}`);
const src = readFileSync(resolve(REPO, DEFERRED_09B_SOFTWARE_INVENTORY.file), "utf8");
const lines = src.split(/\r?\n/);
for (const site of DEFERRED_09B_SOFTWARE_INVENTORY.sites) {
  const n = src.split(site).length - 1;
  const at = lines.findIndex((l) => l.includes(site)) + 1;
  console.log(`     occurs ${n}x  at :${at || "?"}  ${JSON.stringify(site.slice(0, 60))}`);
}
const problems = checkDeferredClassRegister();
console.log(`   checkDeferredClassRegister() problems: ${problems.length}`);
for (const p of problems) console.log(`     ${p.message}`);

console.log("");
const registerLines = new Set(
  DEFERRED_09B_SOFTWARE_INVENTORY.sites.map((s) => lines.findIndex((l) => l.includes(s)) + 1),
);
const mine = new Set(inventory.filter((k) => k.startsWith("src/data/servicePages.ts:")).map((k) => Number(k.split(":")[2] ?? k.split(":").pop())));
console.log(`## do the register's resolved lines equal my counted sites?`);
console.log(`   register resolves to lines: ${[...registerLines].sort((a, b) => a - b).join(", ")}`);
console.log(`   my count is at lines:       ${[...mine].sort((a, b) => a - b).join(", ")}`);
const same = registerLines.size === mine.size && [...registerLines].every((l) => mine.has(l));
console.log(`   SAME SET: ${same}`);
