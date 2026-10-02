/**
 * QA PROBE â€” publication-policy scan of RENDERED text.
 * Flags scale / throughput / capacity / headcount / revenue / experience /
 * client-name / testimonial / delivery-statistic shapes in what the page
 * actually shows a reader.
 */
import { readFileSync } from "node:fs";
const rows = JSON.parse(readFileSync(new URL("./rendered-expanded.json", import.meta.url), "utf8"));

const RULES = [
  ["machine-count", /\b\d{1,4}\s*(adet\s+)?(tezg[aÃ¢]h|CNC\s+tezg|makine|makina)\b/gi],
  ["headcount", /\b\d{1,5}\s*(kiÅŸilik|Ã§alÄ±ÅŸan|personel|mÃ¼hendis|operatÃ¶r|uzman)\b/gi],
  ["facility-size", /\b[\d.,]+\s*(m2|mÂ²|metrekare|dÃ¶nÃ¼m)\b/gi],
  ["revenue-volume", /\b[\d.,]+\s*(TL|USD|EUR|â‚º|\$|â‚¬|milyon|milyar|ciro)\b/gi],
  ["order-volume", /\b[\d.,]+\+?\s*(sipariÅŸ|proje|parÃ§a\/ay|adet\/ay|teslimat|mÃ¼ÅŸteri|firma)\b/gi],
  ["years-experience", /\b\d{1,3}\+?\s*(yÄ±l(lÄ±k)?)\s+(deneyim|tecrÃ¼be|aÅŸkÄ±n)/gi],
  ["since-year", /\b(19|20)\d{2}\s*(yÄ±lÄ±ndan beri|'?dan beri|'?den beri)/gi],
  ["percentage-kpi", /\b\d{1,3}(?:[.,]\d+)?\s*%|%\s*\d{1,3}/g],
  ["capacity", /\b(kapasitemiz|yÄ±llÄ±k kapasite|aylÄ±k kapasite|Ã¼retim kapasitesi)\b/gi],
  ["superlative", /\b(TÃ¼rkiye'?nin en|lider|Ã¶ncÃ¼|bir numara|en bÃ¼yÃ¼k|en geliÅŸmiÅŸ|dÃ¼nya Ã§apÄ±nda)\b/gi],
  ["testimonial", /\b(mÃ¼ÅŸterimiz|referansÄ±mÄ±z|memnuniyet(le)?)\b/gi],
  ["client-name", /\b(HPT|TAAC|METSAN|ZTM|TEKNIK BALANS|TEKNÄ°K BALANS|AKON|TEKNOPAR)\b/g],
  ["cert-number", /\b(belge\s*(no|numaras[Ä±i])|sertifika\s*(no|numaras[Ä±i])|registrar|TÃœV|BSI|SGS|Bureau Veritas|DNV|Intertek)\b/gi],
  ["material-count", /\b\d{2,4}\+?\s*(malzeme|alaÅŸÄ±m)\b/gi],
  ["ontime-delivery", /\b(zamanÄ±nda teslimat|on-time|termin baÅŸarÄ±)\b/gi],
];

let total = 0;
for (const row of rows) {
  const hits = [];
  for (const [name, re] of RULES) {
    re.lastIndex = 0;
    const found = row.text.match(re);
    if (found) hits.push([name, [...new Set(found)]]);
  }
  if (hits.length) {
    total += hits.length;
    console.log(`\n### ${row.route}`);
    for (const [name, found] of hits) {
      console.log(`  ${name}: ${JSON.stringify(found)}`);
      for (const f of found) {
        const i = row.text.indexOf(f.split(/\s+/)[0]);
        console.log(`     ctx: â€¦${row.text.slice(Math.max(0, i - 90), i + 110).replace(/\s+/g, " ")}â€¦`);
      }
    }
  }
}
console.log(`\nTOTAL FLAGGED RULE-HITS: ${total}`);

