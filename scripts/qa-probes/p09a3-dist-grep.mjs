/* QA 09a-R3 — the removed claims, over the BUILT BUNDLE.
 *
 * `dist/` matters here for a reason the packet did not anticipate: two of the
 * carried claims (D3b `:81`, F2a `:1922`) live in `metaDescription`, and
 * `ServiceDetail.tsx:193` passes `page.description` — not `page.metaDescription`
 * — to `usePageMeta` and to `JsonLdSchema`. So those strings never reach a
 * `<meta>` tag at all; the only surface on which they were ever published is
 * the JS chunk. That is what this greps.
 */
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DIST = resolve(ROOT, "dist");
const OUT = resolve(ROOT, "reports/qa/phase-09a-r3");
mkdirSync(OUT, { recursive: true });

const walk = (d, acc = []) => {
  for (const n of readdirSync(d)) {
    const p = resolve(d, n);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(js|html|css|json|txt|xml)$/i.test(p)) acc.push(p);
  }
  return acc;
};
const files = walk(DIST).map((p) => ({ p, rel: relative(ROOT, p).replace(/\\/g, "/"), src: readFileSync(p, "utf8") }));

const MUST_BE_ABSENT = [
  ["D3  free DFM, FAQ", "İlk DFM değerlendirmesi ücretsizdir"],
  ["D3b free DFM, metaDescription", "ücretsiz DFM analizi"],
  ["F1  %40 daha hızlı", "HSM ile %40 daha hızlı"],
  ["F1b %50 setup tasarrufu", "%50 setup tasarrufu"],
  ["F2a %70'e kadar, metaDescription", "%70'e kadar maliyet tasarrufu"],
  ["F2b Ortalama %30-50", "Ortalama %30-50"],
  ["F3  EOS M290", "EOS M290"],
  ["F4  Parça/Saat column", "Parça/Saat"],
  ["D1  the nine-format list", "STEP, IGES, Parasolid"],
  ["D1b body prose", "SolidWorks, CATIA ve NX formatlarını"],
  ["D1c label/value", "STEP, IGES, CATIA, NX, SW"],
  ["D2  hand-written correct list", "Teklif akışında STEP, STP"],
  ["D4b CAD/CAM software inventory", "CAD/CAM Entegrasyonu — CATIA"],
  ["D4c CATIA/SolidWorks/NX entegre", "CATIA, SolidWorks, NX entegre çalışma"],
  ["D4d metaDescription software inventory", "CATIA/SolidWorks/NX entegrasyonu"],
];
const MUST_BE_PRESENT = [
  ["the derived prose list", "STEP, STP, STL, OBJ, IGES, IGS ve 3MF"],
  ["the derived extension list", ".step, .stp, .stl, .obj, .iges, .igs, .3mf"],
  ["the refusal that keeps the six phrasings honest", "SolidWorks .sldprt, CATIA .catpart, NX .prt"],
  ["the cycle-rate column the Coder kept", "Çevrim/Saat"],
  ["the authority's own list", '["step","stp","stl","obj","iges","igs","3mf"]'],
];

const hit = (needle) => files.filter((f) => f.src.includes(needle)).map((f) => f.rel);

const absent = MUST_BE_ABSENT.map(([id, s]) => ({ id, needle: s, files: hit(s) }));
const present = MUST_BE_PRESENT.map(([id, s]) => ({ id, needle: s, files: hit(s) }));

writeFileSync(resolve(OUT, "dist-grep.json"), `${JSON.stringify({ scanned: files.length, absent, present }, null, 2)}\n`, "utf8");
console.log(`scanned ${files.length} built files under dist/\n`);
console.log("MUST BE ABSENT:");
for (const a of absent) console.log(`  ${a.files.length === 0 ? "gone " : "*** STILL PRESENT ***"}  ${a.id.padEnd(38)} ${a.files.join(", ")}`);
console.log("\nMUST BE PRESENT:");
for (const p of present) console.log(`  ${p.files.length > 0 ? "ok   " : "*** MISSING ***"}  ${p.id.padEnd(48)} ${p.files.join(", ")}`);
