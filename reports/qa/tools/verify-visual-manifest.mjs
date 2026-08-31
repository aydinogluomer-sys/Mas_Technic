#!/usr/bin/env node
/**
 * QA Phase 00 — SC5 (mechanical half): verify every PNG in reports/baseline/visual/
 * is a real PNG whose IHDR width/height matches the viewport width and the
 * documentHeight recorded in manifest.json. Reads the PNG header bytes directly;
 * no image library.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..", "..");
const dir = resolve(root, "reports/baseline/visual");

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const manifest = JSON.parse(readFileSync(resolve(dir, "manifest.json"), "utf8"));
const pngsOnDisk = readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".png")).sort();
const pngsInManifest = manifest.map((e) => e.file).sort();

console.log("=== QA SC5 visual-baseline mechanical verification ===");
console.log(`PNGS_ON_DISK: ${pngsOnDisk.length}`);
console.log(`PNGS_IN_MANIFEST: ${pngsInManifest.length}`);
const orphanFiles = pngsOnDisk.filter((f) => !pngsInManifest.includes(f));
const missingFiles = pngsInManifest.filter((f) => !pngsOnDisk.includes(f));
console.log(`ON_DISK_NOT_IN_MANIFEST: ${orphanFiles.length ? JSON.stringify(orphanFiles) : "[]"}`);
console.log(`IN_MANIFEST_NOT_ON_DISK: ${missingFiles.length ? JSON.stringify(missingFiles) : "[]"}`);

console.log("");
console.log("| file | valid PNG | IHDR w x h | manifest viewport | manifest docHeight | bytes on disk | bytes claimed | OK |");
console.log("|---|---|---|---|---|---|---|---|");

let bad = 0;
for (const entry of manifest) {
  const p = resolve(dir, entry.file);
  let ok = true;
  let notes = [];
  let w = null;
  let h = null;
  let sigOk = false;
  let bytes = null;
  try {
    const buf = readFileSync(p);
    bytes = statSync(p).size;
    sigOk = buf.subarray(0, 8).equals(PNG_SIG);
    // IHDR must be the first chunk: length(4) type(4)="IHDR" width(4) height(4)
    const chunkType = buf.subarray(12, 16).toString("ascii");
    if (!sigOk || chunkType !== "IHDR") {
      ok = false;
      notes.push("not a valid PNG/IHDR");
    } else {
      w = buf.readUInt32BE(16);
      h = buf.readUInt32BE(20);
    }
    // IEND terminator present => file not truncated
    const tail = buf.subarray(buf.length - 8, buf.length - 4).toString("ascii");
    if (tail !== "IEND") {
      ok = false;
      notes.push("missing IEND (truncated)");
    }
  } catch (e) {
    ok = false;
    notes.push("unreadable: " + e.message);
  }

  const [vw, vh] = String(entry.viewport).split("x").map(Number);
  if (w !== null && w !== vw) {
    ok = false;
    notes.push(`width ${w} != viewport width ${vw}`);
  }
  if (h !== null && h !== entry.documentHeight) {
    ok = false;
    notes.push(`height ${h} != documentHeight ${entry.documentHeight}`);
  }
  if (bytes !== null && bytes !== entry.bytes) {
    ok = false;
    notes.push(`bytes ${bytes} != manifest.bytes ${entry.bytes}`);
  }
  if (!ok) bad += 1;
  console.log(
    `| ${entry.file} | ${sigOk ? "yes" : "NO"} | ${w}x${h} | ${entry.viewport} (vh ${vh}) | ${entry.documentHeight} | ${bytes} | ${entry.bytes} | ${ok ? "OK" : "FAIL — " + notes.join("; ")} |`,
  );
}

console.log(`\nBAD_IMAGES: ${bad}`);
const fail = bad > 0 || orphanFiles.length > 0 || missingFiles.length > 0;
console.log(`VERDICT: ${fail ? "FAIL" : "PASS"}`);
process.exit(fail ? 1 : 0);
