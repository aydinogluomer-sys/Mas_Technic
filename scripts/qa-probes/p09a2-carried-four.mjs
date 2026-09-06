/**
 * QA 09a-R2 item 7 — the Coder's four unacted findings.
 *
 * The Orchestrator is carrying these to a later phase and does not want to
 * carry a phantom. This confirms each is genuinely STILL LIVE in the tree at
 * dae15bb, reports the ACTUAL file:line (the packet's line number for the
 * first one is stale), and — because item 3 established that every
 * servicePages `faq` entry is also a chatbot answer — flags which of them
 * additionally reach the chatbot pool.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const file = path.join(root, "src", "data", "servicePages.ts");
const lines = readFileSync(file, "utf8").split(/\r?\n/);

const TARGETS = [
  { id: "F1", packetSaid: "servicePages.ts:77", needle: /HSM ile %40 daha h[ıi]zl[ıi] [üu]retim/u,
    desc: '"HSM ile %40 daha hızlı üretim" — unsubstantiated productivity delta' },
  { id: "F2a", packetSaid: "tasarim-rehberi-dfm", needle: /%70'e kadar maliyet tasarrufu/u,
    desc: "%70'e kadar maliyet tasarrufu" },
  { id: "F2b", packetSaid: "tasarim-rehberi-dfm", needle: /Ortalama %30-50/u,
    desc: "Ortalama %30-50 cost saving" },
  { id: "F3", packetSaid: "dusuk-hacimli-uretim", needle: /EOS M290/u,
    desc: "named machine model (Phase 06 removed these under §D MACHINE_COUNT: PRIVATE_DO_NOT_DISCLOSE)" },
  { id: "F4", packetSaid: "enjeksiyon-kalibi", needle: /"Par[çc]a\/Saat"/u,
    desc: "Parça/Saat comparisonTables header — matches WITHHELD_SPEC_CLASSES but escapes the filter" },
];

// The chatbot pool, to see which of these are also chat answers.
const pool = JSON.parse(readFileSync(path.join(root, "reports", "qa", "phase-09a-r2", "chat-pool.json"), "utf8"));

const results = [];
for (const t of TARGETS) {
  const hits = [];
  lines.forEach((l, i) => {
    if (t.needle.test(l)) hits.push({ line: i + 1, text: l.trim().slice(0, 170) });
  });
  const inPool = pool.entries.filter((e) => t.needle.test(e.answer) || t.needle.test(e.question))
    .map((e) => ({ i: e.i, slug: e.slug, question: e.question }));
  results.push({ ...t, needle: String(t.needle), live: hits.length > 0, occurrences: hits.length, hits, inChatPool: inPool });
}

writeFileSync(path.join(root, "reports", "qa", "phase-09a-r2", "carried-four.json"),
  JSON.stringify(results, null, 2), "utf8");

for (const r of results) {
  console.log(`${r.id}  ${r.live ? "STILL LIVE" : "NOT FOUND — PHANTOM"}  (${r.occurrences} occurrence(s))  packet said: ${r.packetSaid}`);
  console.log(`     ${r.desc}`);
  for (const h of r.hits) console.log(`     servicePages.ts:${h.line}  ${h.text}`);
  if (r.inChatPool.length) {
    for (const p of r.inChatPool) console.log(`     ↳ ALSO A CHATBOT ANSWER: pool #${p.i} [${p.slug}] "${p.question}"`);
  }
  console.log("");
}
console.log("LIVE=" + results.filter((r) => r.live).length + "/" + results.length);
