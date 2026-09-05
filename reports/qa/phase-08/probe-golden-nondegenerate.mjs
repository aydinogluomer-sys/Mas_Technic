/** QA PROBE — none of the 16 new waveb baselines is an empty band. */
import { createRequire } from "node:module";
import { readFileSync, readdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { PNG } = require("playwright-core/lib/utilsBundle");
const ROOT = "C:/Users/Trade Bilisim/pdh-wt/qa-p08/e2e/__golden__/win32";
for (const proj of readdirSync(ROOT)) {
  for (const f of readdirSync(`${ROOT}/${proj}`).filter((n) => n.startsWith("waveb-"))) {
    const p = PNG.sync.read(readFileSync(`${ROOT}/${proj}/${f}`));
    const hist = new Map();
    let sum = 0;
    for (let i = 0; i < p.data.length; i += 4) {
      const k = (p.data[i] >> 3 << 10) | (p.data[i + 1] >> 3 << 5) | (p.data[i + 2] >> 3);
      hist.set(k, (hist.get(k) ?? 0) + 1);
      sum += 1;
    }
    const top = [...hist.values()].sort((a, b) => b - a)[0];
    console.log(
      `${proj.padEnd(12)} ${f.padEnd(28)} ${String(p.width).padStart(5)}x${String(p.height).padStart(5)}`
      + `  distinctColours(5bit)=${String(hist.size).padStart(5)}`
      + `  dominantShare=${(top / sum * 100).toFixed(1)}%`,
    );
  }
}
