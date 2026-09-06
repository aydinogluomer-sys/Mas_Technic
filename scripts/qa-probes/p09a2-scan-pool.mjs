/**
 * QA 09a-R2 item 3 — scan the assembled 140-entry chatbot pool.
 * Reads the dump produced by p09a2-dump-chat-pool.mjs.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { scan } from "./p09a2-scan.mjs";

const root = process.cwd();
const outDir = path.join(root, "reports", "qa", "phase-09a-r2");
const pool = JSON.parse(readFileSync(path.join(outDir, "chat-pool.json"), "utf8"));

const all = [];
for (const e of pool.entries) {
  // Only the ANSWER is published by ChatBot.tsx:261. The question is matcher
  // input. Scan both, but tag which is which -- a question may legitimately
  // contain "garanti" as a keyword without publishing a guarantee.
  for (const [field, text] of [["A", e.answer], ["Q", e.question]]) {
    for (const h of scan(text, `#${e.i} ${e.origin}${e.slug ? "::" + e.slug : ""} [${field}]`)) {
      all.push({ ...h, field, i: e.i, origin: e.origin, slug: e.slug, question: e.question });
    }
  }
}

const answerHits = all.filter((h) => h.field === "A");
writeFileSync(path.join(outDir, "chat-pool-hits.json"), JSON.stringify(all, null, 2), "utf8");

const byCls = {};
for (const h of answerHits) byCls[h.cls] = (byCls[h.cls] || 0) + 1;
console.log("ANSWER_HITS=" + answerHits.length, JSON.stringify(byCls));
console.log("QUESTION_ONLY_HITS=" + (all.length - answerHits.length));
console.log("");
for (const h of answerHits) {
  console.log(`[${h.cls}/${h.rule}] ${h.label}`);
  console.log(`    match: ${JSON.stringify(h.match)}`);
  console.log(`    ctx:   ...${h.ctx}...`);
}
