/* QA round 4 — probe 6. Adversarial inputs for the Coder pure detectors.
   Run against esbuild-bundled copies of e2e/visual/cursor-overlay.ts and
   radius-census.ts; the import paths below name the ORIGINALS so the source of
   truth is unambiguous. Output: reports/qa/phase-07c4/p6-attack-detectors.txt */
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  pageScopedGoldenSpecs, isVisualProject, finePointerVisualProjects,
  pointerIsFine, stripComments, readVisualSpecs,
} from "../../../../e2e/visual/cursor-overlay.ts";
import { parseRegisterTable, renderRow, foldRegister, citationDeclaresRadius } from "../../../../e2e/visual/radius-census.ts";

const ROOT = "C:/Users/Trade Bilisim/pdh-wt/qa-p07c3";
let fails = 0;
const rep = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fails += 1;
  console.log(`${ok ? "OK  " : "HOLE"} ${name}\n       got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
};

console.log("=== A. pageScopedGoldenSpecs — under-detection probes (dangerous direction) ===");
const spec = (text) => [{ file: "x.spec.ts", text }];
rep("A1 plain expect(page).toHaveScreenshot",
  pageScopedGoldenSpecs(spec('await expect(page).toHaveScreenshot("a.png");')), ["x.spec.ts"]);
rep("A2 newline between expect(page) and .toHaveScreenshot",
  pageScopedGoldenSpecs(spec('await expect(page)\n  .toHaveScreenshot("a.png");')), ["x.spec.ts"]);
rep("A3 ALIASED page variable  -> expect(p).toHaveScreenshot",
  pageScopedGoldenSpecs(spec('const p = page;\nawait expect(p).toHaveScreenshot("a.png");')), ["x.spec.ts"]);
rep("A4 destructured rename  ({ page: view })",
  pageScopedGoldenSpecs(spec('test("t", async ({ page: view }) => { await expect(view).toHaveScreenshot("a.png"); });')), ["x.spec.ts"]);
rep("A5 this.page / obj.page",
  pageScopedGoldenSpecs(spec('await expect(ctx.page).toHaveScreenshot("a.png");')), ["x.spec.ts"]);
rep("A6 element crop is correctly NOT flagged",
  pageScopedGoldenSpecs(spec('await expect(page.locator("footer")).toHaveScreenshot("z.png");')), []);
rep("A7 fullPage via a spread option object",
  pageScopedGoldenSpecs(spec('const OPTS = { fullPage: true };\nawait expect(el).toHaveScreenshot("z.png", OPTS);')), ["x.spec.ts"]);

console.log("\n=== B. readVisualSpecs — does the scan reach every file the config runs? ===");
const dir = mkdtempSync(join(tmpdir(), "qa-scan-"));
writeFileSync(join(dir, "flat.spec.ts"), 'await expect(page).toHaveScreenshot("a.png");');
mkdirSync(join(dir, "pages"));
writeFileSync(join(dir, "pages", "nested.spec.ts"), 'await expect(page).toHaveScreenshot("b.png");');
const scanned = readVisualSpecs(dir).map((s) => s.file);
rep("B1 subdirectory spec is scanned (config testMatch is visual/**/*.spec.ts)",
  scanned.sort(), ["flat.spec.ts", "nested.spec.ts"]);
rep("B2 the nested page-scoped golden is flagged",
  pageScopedGoldenSpecs(readVisualSpecs(dir)).sort(), ["flat.spec.ts", "nested.spec.ts"]);

console.log("\n=== C. isVisualProject — natural glob spellings the config could use ===");
const proj = (m) => ({ name: "visual-900", testMatch: m, use: {} });
rep("C1 'visual/**/*.spec.ts' (today)", isVisualProject(proj(["visual/**/*.spec.ts"])), true);
rep("C2 '**/visual/**/*.spec.ts'", isVisualProject(proj(["**/visual/**/*.spec.ts"])), true);
rep("C3 './visual/*.spec.ts'", isVisualProject(proj(["./visual/*.spec.ts"])), true);
rep("C4 RegExp testMatch /visual\\//", isVisualProject(proj([/visual\//])), true);
rep("C5 testDir-scoped project (no testMatch at all)",
  isVisualProject({ name: "visual-900", use: {} }), true);

console.log("\n=== D. pointerIsFine — the mechanism claim ===");
rep("D1 hasTouch:true -> coarse", pointerIsFine({ hasTouch: true }), false);
rep("D2 isMobile alone -> still fine", pointerIsFine({ isMobile: true }), true);
rep("D3 undefined use -> fine (a project that declares nothing)", pointerIsFine(undefined), true);

console.log("\n=== E. §4 register — is a STALE number actually fatal? ===");
const doc = readFileSync(join(ROOT, "docs/lean/17-inner-page-composition.md"), "utf8");
const live = parseRegisterTable(doc);
console.log("parsed rows:");
live.forEach((r) => console.log("   " + r));
const mutations = {
  "count 768 launcher 6 -> 5": doc.replace("| `chat launcher` | 6 | 6 | 6 |", "| `chat launcher` | 6 | 5 | 6 |"),
  "box 768 launcher 56x56 -> 48x48": doc.replace("768: 56×56 · 1280: 56×56", "768: 48×48 · 1280: 56×56"),
  "cursor dot back to 1280-only": doc.replace("| `cursor dot` | – | 6 | 6 |", "| `cursor dot` | – | – | 6 |"),
  "radius 9999px -> 8px on track": doc.replace("| `property-meter track` | – | 4 | 4 | `9999px`", "| `property-meter track` | – | 4 | 4 | `8px`"),
  "source line 228 -> 229": doc.replace("MaterialMorphScroll.tsx:228", "MaterialMorphScroll.tsx:229"),
};
for (const [label, text] of Object.entries(mutations)) {
  if (text === doc) { console.log(`SETUP-FAIL  ${label}: mutation string not found in doc`); fails += 1; continue; }
  const parsed = parseRegisterTable(text);
  const differs = JSON.stringify(parsed) !== JSON.stringify(live);
  console.log(`${differs ? "RED " : "HOLE"} stale-doc mutation "${label}" -> parsed table ${differs ? "differs from the live one, so toEqual(measured) fails" : "IS IDENTICAL: the mutation is invisible to the test"}`);
  if (!differs) fails += 1;
}

console.log("\n=== F. citationDeclaresRadius — does it really read the cited lines? ===");
for (const [file, lines, want] of [
  ["src/components/MaterialMorphScroll.tsx", "228", true],
  ["src/components/MaterialMorphScroll.tsx", "227", null],
  ["src/components/MaterialMorphScroll.tsx", "1", false],
  ["src/components/ui/CustomCursor.tsx", "194-207", true],
  ["src/components/ui/CustomCursor.tsx", "1-3", false],
  ["src/components/ui/CustomCursor.tsx", "1-400", null],
]) {
  const got = citationDeclaresRadius(ROOT, file, lines);
  const note = want === null ? "(informational)" : got === want ? "OK" : "HOLE";
  if (want !== null && got !== want) fails += 1;
  console.log(`${note.padEnd(15)} ${file}:${lines} -> ${got}`);
}

console.log("\n=== G. foldRegister — does an unlabelled radius source really throw? ===");
try {
  foldRegister([{ width: 375, route: "/x", groups: [{ signature: "div.brand-new-rounded-thing", radius: "4px", count: 1, sizes: ["10x10"] }] }]);
  console.log("HOLE  an unlabelled radius source did NOT throw"); fails += 1;
} catch (e) { console.log("RED   unlabelled source throws: " + String(e.message).split("\n")[0]); }
try {
  foldRegister([
    { width: 375, route: "/x", groups: [{ signature: "div.h-1.5.flex-1.rounded-full", radius: "9999px", count: 1, sizes: ["21x6"] }] },
    { width: 768, route: "/x", groups: [{ signature: "div.h-1.5.flex-1.rounded-full", radius: "4px", count: 1, sizes: ["21x6"] }] },
  ]);
  console.log("HOLE  two different radii for one label did NOT throw"); fails += 1;
} catch (e) { console.log("RED   two-radii row throws: " + String(e.message).split(";")[0]); }

console.log(`\n=== ${fails} hole(s)/unexpected result(s) ===`);
