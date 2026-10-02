import { readFileSync } from "node:fs";
const t = readFileSync(process.argv[2], "utf8");
const i = t.indexOf("{");
process.stdout.write(t.slice(0, i));
const d = JSON.parse(t.slice(i));
for (const k in d) {
  console.log("\n### " + k + "  measured=" + d[k].measured + "  dist=" + JSON.stringify(d[k].dist) + "  below=" + d[k].failures.length);
  for (const f of d[k].failures) {
    console.log("  FAIL " + f.ratio + " < " + f.required + " | " + f.fontSize + "px/" + f.fontWeight
      + " | " + f.color + " on rgb(" + f.bg + ") share " + f.bgShare
      + (f.ariaHidden ? " | aria-hidden" : "") + "\n        " + f.sel + "\n        " + JSON.stringify(f.text));
  }
}
