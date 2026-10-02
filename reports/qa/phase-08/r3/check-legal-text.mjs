/**
 * QA round 3 — the textual invariants the packet names, checked over the
 * RENDERED text of the three legal documents (`legal-rendered.json`).
 */
import { readFileSync } from "node:fs";

const d = JSON.parse(readFileSync("reports/qa/phase-08/r3/legal-rendered.json", "utf8"));
const results = [];
const say = (name, ok, detail) => results.push({ name, ok, detail });

// 1 — no `#` fragment in any cross-reference link, on any of the three docs.
const allLinks = [];
for (const [route, r] of Object.entries(d)) {
  for (const c of r.clauses) for (const l of c.links) allLinks.push({ route, clause: c.no, ...l });
}
const fragments = allLinks.filter((l) => (l.href ?? "").includes("#"));
say("no `#` fragment in any legal cross-reference", fragments.length === 0,
  `${allLinks.length} links checked; fragments: ${JSON.stringify(fragments)}`);

// 1b — each cross-reference is ONE link, i.e. no duplicate href inside a clause.
const dupes = [];
for (const [route, r] of Object.entries(d)) {
  for (const c of r.clauses) {
    const hrefs = c.links.map((l) => l.href);
    const seen = new Set();
    for (const h of hrefs) { if (seen.has(h)) dupes.push(`${route} clause ${c.no}: ${h}`); seen.add(h); }
  }
}
say("no clause links the same destination twice", dupes.length === 0, JSON.stringify(dupes));

// 2 — /kvkk madde 04 carries no numeral counting its own enumeration.
const kvkk04 = d["/kvkk"].clauses.find((c) => c.no === "04");
const COUNT_WORDS = /\b(bir|iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on|\d+)\s+(hâl|hal|hâlde|halde|hâlden|durum|durumda)\b/gi;
const ORDINALS = /\b(birinci|ikinci|üçüncü|dördüncü|beşinci)\s+(hâl|hal)\b/gi;
const numerals = [...(kvkk04.text ?? "").matchAll(COUNT_WORDS)].map((m) => m[0])
  .concat([...(kvkk04.text ?? "").matchAll(ORDINALS)].map((m) => m[0]));
say("/kvkk madde 04 carries no numeral counting the enumeration", numerals.length === 0,
  `matches: ${JSON.stringify(numerals)}`);

// 3 — the supplier transfer sits INSIDE the enumeration, above the closing paragraph.
const paras = kvkk04.paragraphs;
const supplierIdx = paras.findIndex((p) => p.includes("tedarikçi"));
const closingIdx = paras.findIndex((p) => p.startsWith("Aktarımın gerçekleştiği hâller bunlardır"));
say("the supplier case is inside the enumeration, before the closing paragraph",
  supplierIdx > 0 && closingIdx > supplierIdx,
  `supplier at p${supplierIdx}, closing at p${closingIdx}, ${paras.length} paragraphs`);

// 4 — nothing asserts what a third party does AFTER RECEIPT.
const AFTER_RECEIPT = [
  /\bsakla(r|nır|ma süresi|maz)\b/i, /\bimha\b/i, /\bsil(er|inir|me takvimi)\b/i,
  /\bşifrele/i, /\benc?rypt/i, /\bgizlilik sözleşmesi\b/i, /\bNDA\b/, /\beğitim(inde|de)? kullan/i,
  /\bmodel(in)? eğit/i, /\bgüvenlik (standard|sertifika|önlem)/i, /\bISO 27001\b/i, /\bGDPR uyumlu\b/i,
];
const THIRD_PARTY = /(hcaptcha|cloudflare|__cf_bm|google|gemini|yazı tipi dağıtım ağı)/i;
/* ADJUDICATED, one entry, with the measurement that settles it. The pattern
   above is deliberately broad and this is the only sentence it catches that is
   not a claim about a third party's conduct. Anything NEW still fails. */
const ADJUDICATED = [{
  route: "/cerez-politikasi",
  clause: "04",
  startsWith: "01. maddedeki __cf_bm çerezi bu sitenin alan adına değil",
  reason:
    "The deleting party here is the READER'S OWN BROWSER, not hCaptcha or Cloudflare. "
    + "\"tarayıcınızın çerez listesinden ayrıca silinir ya da otuz dakika içinde kendiliğinden "
    + "düşer\" describes the cookie's own Expires attribute and the browser's own cookie UI. "
    + "Measured this round: lifetimeMinutes 29.9, httpOnly true, secure true, sameSite None, "
    + "domain .hcaptcha.com (reports/qa/phase-08/r3/hosts-frames.json). It says nothing about "
    + "what anybody does with the data after receipt.",
}];

const suspicious = [];
for (const [route, r] of Object.entries(d)) {
  for (const c of r.clauses) {
    for (const p of c.paragraphs) {
      if (!THIRD_PARTY.test(p)) continue;
      for (const rx of AFTER_RECEIPT) {
        if (!rx.test(p)) continue;
        const cleared = ADJUDICATED.find((a) => a.route === route && a.clause === c.no && p.startsWith(a.startsWith));
        if (cleared) continue;
        suspicious.push({ route, clause: c.no, pattern: String(rx), paragraph: p.slice(0, 200) });
      }
    }
  }
}
say("no paragraph naming a third party claims anything about it after receipt",
  suspicious.length === 0,
  `${suspicious.length === 0 ? "clean" : JSON.stringify(suspicious, null, 2)}`
  + ` · 1 adjudicated: ${ADJUDICATED[0].route} madde ${ADJUDICATED[0].clause} — ${ADJUDICATED[0].reason}`);

// 5 — `__cf_bm` is absent from the madde 02 table, and the note's two reasons hold.
const table = d["/cerez-politikasi"].table;
const keys = table.rows.map((r) => r[0]);
say("`__cf_bm` has no row in the madde 02 table", !keys.includes("__cf_bm"), JSON.stringify(keys));
say("the note still states the two properties `__cf_bm` fails",
  /her HTTP isteğiyle birlikte otomatik gönderilmezler/.test(table.note)
  && /yalnızca bu sitenin kendi sayfaları tarafından okunabilirler/.test(table.note),
  table.note);

// 6 — the three ledes / meta descriptions no longer carry the retired absolute.
const RETIRED = [
  "Herkese açık sayfalarda hiçbir çerez oluşturulmuyor",
  "Bu site çerez kullanmıyor",
  "bu sitede çerez kullanılmaz",
  "Site çerez kullanmaz",
  "ikinci ve son",
  "üç hâlde olur",
  "iki hâlde olur",
];
const stillThere = [];
for (const [route, r] of Object.entries(d)) {
  const haystack = [r.metaDescription ?? "", r.lede ?? "", r.mainText].join(" ");
  for (const s of RETIRED) if (haystack.includes(s)) stillThere.push(`${route}: ${s}`);
}
say("no retired absolute survives anywhere in the rendered documents or their metadata",
  stillThere.length === 0, JSON.stringify(stillThere));

for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}\n      ${r.detail}\n`);
console.log(results.every((r) => r.ok) ? "ALL PASS" : "SOME FAILED");
