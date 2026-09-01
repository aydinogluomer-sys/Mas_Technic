/* QA P04-C / R1 — PNG dimensions straight from the IHDR chunk, no decoder. */
import fs from "node:fs";
import { execSync } from "node:child_process";

const targets = process.argv.slice(2);

function dims(buf) {
  // PNG signature 8 bytes, then length(4) "IHDR"(4) width(4) height(4)
  if (buf.readUInt32BE(12) !== 0x49484452) throw new Error("not a PNG IHDR");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

for (const t of targets) {
  const now = dims(fs.readFileSync(t));
  let before = null;
  for (const rev of ["4dc80d4", "076c16a"]) {
    try {
      const buf = execSync(`git show ${rev}:${t}`, { encoding: "buffer", maxBuffer: 64 * 1024 * 1024 });
      before = before ?? {};
      before[rev] = dims(buf);
    } catch { /* not present at that rev */ }
  }
  console.log(`${t}`);
  console.log(`   HEAD (97e134b): ${now.width} x ${now.height}`);
  for (const [rev, d] of Object.entries(before ?? {})) {
    console.log(`   ${rev}:        ${d.width} x ${d.height}`);
  }
}
