/**
 * QA round 3 — THE FOOTER INVARIANT UNDER THE CORRECTED TRIGGER.
 *
 * Round 2 reported the trigger as "rename `Kabiliyetler` in `ia.ts`". C4
 * falsified that: `footerGroups` passed `family("Kabiliyetler")` as this file's
 * own string literal, so an `ia.ts` rename never reached the map. The edit that
 * actually zeroed a link was the TWO-STEP one — rename the family in `ia.ts`
 * AND update the map key to follow it, which is exactly what a careful person
 * does while chasing a rename through a codebase.
 *
 * So this evaluates the REAL modules, not a re-implementation, under three
 * scenarios, for both the OLD (pre-C4, label-keyed) and the NEW (route-keyed)
 * `footer-groups.ts`. `ia.ts` has no imports of its own, so the two files are
 * copied into a scratch directory, the `@/` import is rewritten to a relative
 * one, the rename is applied as a text edit, and esbuild bundles the result.
 * Nothing in the repository is written to.
 *
 * The invariant: EVERY `resourceLinks` entry appears in the footer EXACTLY
 * ONCE, under every scenario.
 */
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const REPO = process.cwd();
const IA = readFileSync(join(REPO, "src/components/navigation/ia.ts"), "utf8");
const NEW_GROUPS = readFileSync(join(REPO, "src/components/shell/footer-groups.ts"), "utf8");
const OLD_GROUPS = process.env.OLD_GROUPS ? readFileSync(process.env.OLD_GROUPS, "utf8") : null;

const OLD_LABEL = "Kabiliyetler";
const NEW_LABEL = "Yetkinlikler";

/** Rename the family label in `ia.ts` the way a real rename would: the
 *  navigationItems entry's own `label`, and nothing else. */
function renameInIa(source) {
  const marker = `label: "${OLD_LABEL}"`;
  if (!source.includes(marker)) throw new Error(`ia.ts does not contain ${marker}`);
  return source.replace(marker, `label: "${NEW_LABEL}"`);
}

/** Update the map so it follows the rename — the second step of the two. */
function updateMap(source) {
  // NEW file: `"/kabiliyet-profilleri": "Kabiliyetler"` (value is the label)
  // OLD file: `Kabiliyetler: ["/kabiliyet-profilleri"]`  (key is the label)
  let out = source;
  if (out.includes(`: "${OLD_LABEL}"`)) out = out.replaceAll(`: "${OLD_LABEL}"`, `: "${NEW_LABEL}"`);
  if (out.includes(`${OLD_LABEL}: [`)) out = out.replace(`${OLD_LABEL}: [`, `${NEW_LABEL}: [`);
  if (out.includes(`"${OLD_LABEL}": [`)) out = out.replace(`"${OLD_LABEL}": [`, `"${NEW_LABEL}": [`);
  return out;
}

/** The FAMILY_COLUMNS list is this file's own copy of the three family names;
 *  a real rename follows it there too. Applied only in the "map follows" case,
 *  because that is what "chasing the rename through the codebase" means. */
function updateColumns(source) {
  return source.replaceAll(`"${OLD_LABEL}"`, `"${NEW_LABEL}"`);
}

async function evaluate(iaSource, groupsSource) {
  const dir = mkdtempSync(join(tmpdir(), "qa-footer-"));
  try {
    writeFileSync(join(dir, "ia.ts"), iaSource);
    writeFileSync(join(dir, "footer-groups.ts"),
      groupsSource.replace(/from "@\/components\/navigation\/ia"/, 'from "./ia"'));
    writeFileSync(join(dir, "entry.ts"),
      'import { footerGroups } from "./footer-groups";\n'
      + 'import { resourceLinks, navigationItems, companyLinks } from "./ia";\n'
      + "export { footerGroups, resourceLinks, navigationItems, companyLinks };\n");
    const outfile = join(dir, "out.mjs");
    await build({ entryPoints: [join(dir, "entry.ts")], bundle: true, format: "esm", outfile, logLevel: "silent" });
    return await import(pathToFileURL(outfile).href + `?t=${Date.now()}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function describe(mod) {
  const columns = mod.footerGroups.map((g) => ({ title: g.title, count: g.items.length, items: g.items.map((i) => i.href) }));
  const allHrefs = mod.footerGroups.flatMap((g) => g.items.map((i) => i.href));
  const occurrences = Object.fromEntries(
    mod.resourceLinks.map((l) => [l.path, allHrefs.filter((h) => h === l.path).length]),
  );
  const placement = Object.fromEntries(
    mod.resourceLinks.map((l) => [l.path, columns.filter((c) => c.items.includes(l.path)).map((c) => c.title)]),
  );
  const violations = Object.entries(occurrences).filter(([, n]) => n !== 1).map(([p, n]) => `${p} appears ${n}x`);
  return { columns: columns.map((c) => `${c.title}:${c.count}`), occurrences, placement, violations, totalLinks: allHrefs.length };
}

/* "The map follows the rename" has TWO readings, and they give different
   answers on the OLD code, so both are measured rather than one being picked.
   C4's table is the first; the second is what a complete rename looks like. */
const scenarios = [
  { name: "1 today", ia: IA, patch: (g) => g },
  { name: "2 ia.ts renamed, map untouched", ia: renameInIa(IA), patch: (g) => g },
  { name: "3a ia.ts renamed, MAP KEY follows, call-site literal untouched", ia: renameInIa(IA), patch: (g) => updateMap(g) },
  { name: "3b ia.ts renamed, the rename chased everywhere", ia: renameInIa(IA), patch: (g) => updateColumns(updateMap(g)) },
];

const report = {};
for (const s of scenarios) {
  report[s.name] = { NEW: describe(await evaluate(s.ia, s.patch(NEW_GROUPS))) };
  if (OLD_GROUPS) report[s.name].OLD = describe(await evaluate(s.ia, s.patch(OLD_GROUPS)));
}

console.log(JSON.stringify(report, null, 2));
