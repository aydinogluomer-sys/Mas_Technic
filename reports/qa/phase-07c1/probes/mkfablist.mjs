import { readdirSync, writeFileSync } from "node:fs";
const root = "e2e/__golden__/win32";
const pairs = [];
for (const d of readdirSync(root).sort()) {
  for (const f of readdirSync(`${root}/${d}`).sort()) {
    if (f.endsWith(".png")) pairs.push({ name: `${d}/${f}`, b: `${root}/${d}/${f}`, needle: [10, 125, 138], tol: 10 });
  }
}
writeFileSync(process.argv[2], JSON.stringify(pairs, null, 1));
console.log(pairs.length, "images");
