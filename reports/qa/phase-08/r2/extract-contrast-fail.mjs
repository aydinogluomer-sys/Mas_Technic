import { readFileSync } from "node:fs";
const t = readFileSync("C:/Users/Trade Bilisim/pdh-wt/qa-p08/reports/qa/phase-08/r2/contrast-375.txt", "utf8");
const key = "375|" + "/qa-r2-no-such-route";
const s = t.indexOf(JSON.stringify(key));
const seg = t.slice(s);
const f = seg.indexOf('"fails": [');
console.log(seg.slice(f, f + 1500));
