/* QA 09a-R3 — over the PAINTED text captured by p09a3-dom-dump.mjs, find every
 * sentence that NAMES a CAD format the validator refuses, and classify it as an
 * OFFER or a REFUSAL. A format may be named in order to be refused; that is
 * what keeps the six chatbot phrasings landing on a true answer. It may not be
 * named in order to be offered.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = resolve(ROOT, "reports/qa/phase-09a-r3");
const { dump } = JSON.parse(readFileSync(resolve(OUT, "dom-dump.json"), "utf8"));

const REJECTED = [
  "parasolid", "x_t", "x_b", "sldprt", "sldasm", "solidworks", "catpart", "catproduct",
  "catia", "dwg", "dxf", "ipt", "iam", "inventor", "creo", "rhino", "3dm", "f3d",
  "acis", "jt", "pdf", "prt", "nx", "mastercam",
];
const TOKEN = new RegExp(`(?<![A-Za-z0-9_])\\.?(?:${REJECTED.join("|")})(?![A-Za-z0-9_])`, "gi");
const OFFER =
  /kabul\s+ed(?:iyoruz|iyor|er|ilir|ilen|ilmekte|ebiliyoruz|iliyor)|destekl(?:iyoruz|iyor|enen|ediğimiz|emekteyiz|enir)|işleyebiliyoruz|işleyebiliriz|doğrudan\s+işl|yükleyebilirsiniz|yükleyebileceğiniz|yüklenebilir|yükleyebiliyorsunuz|gönderebilirsiniz/i;

const sentenceAt = (t, i) => {
  let s = 0;
  for (const p of [".", "!", "?", "\n"]) {
    const k = t.lastIndexOf(p, i);
    if (k + 1 > s) s = k + 1;
  }
  let e = t.length;
  for (const p of [".", "!", "?", "\n"]) {
    const k = t.indexOf(p, i);
    if (k !== -1 && k < e) e = k;
  }
  return t.slice(s, Math.min(e + 1, t.length)).trim();
};

const offers = [];
const refusals = [];
for (const [route, v] of Object.entries(dump)) {
  TOKEN.lastIndex = 0;
  let m;
  while ((m = TOKEN.exec(v.text)) !== null) {
    const rec = { route, token: m[0], sentence: sentenceAt(v.text, m.index) };
    (OFFER.test(rec.sentence) ? offers : refusals).push(rec);
  }
}

const uniq = (a) => [...new Map(a.map((x) => [`${x.route}|${x.sentence}`, x])).values()];
const report = { offers, refusals: uniq(refusals) };
writeFileSync(resolve(OUT, "dom-offers.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`OFFERS of a refused format in the painted DOM: ${offers.length}`);
for (const o of offers) console.log(`  ${o.route}  [${o.token}]  ${o.sentence}`);
console.log(`\nREFUSAL / non-offer mentions: ${report.refusals.length}`);
for (const o of report.refusals) console.log(`  ${o.route}  [${o.token}]\n     ${o.sentence}`);
