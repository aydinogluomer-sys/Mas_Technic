#!/usr/bin/env node
/**
 * QA-owned probe for the regression the Coder disclosed against itself (R5).
 *
 * Removing the "Garanti veriyor musunuz?" FAQ took `garanti`, `garantili` and
 * `güvence` out of `src/data/chatFaqData.ts` with it, because those words
 * cannot survive there — `unconditional-guarantee` fires on any of them. The
 * English `warranty` and the Turkish `sorumluluk` were re-pointed at the
 * returns answer. The site is Turkish-only (§B TURKISH_LIVE: YES,
 * ENGLISH_LIVE_NOW: NO), so the question is whether the words a Turkish buyer
 * would actually type still reach an answer.
 *
 * This runs the REAL matcher, not a re-implementation of it: `chatFaqData.ts`
 * is bundled with the project's own esbuild and imported, so `collectServiceFaqs()`
 * contributes the live service-page FAQ corpus too.
 *
 * Usage: node reports/qa/tools/p06b-chat-routing.mjs
 */
import { build } from "esbuild";
import { writeFileSync, rmSync, mkdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const OUT = join(tmpdir(), `chatfaq-${process.pid}`);
mkdirSync(OUT, { recursive: true });
const BUNDLE = join(OUT, "chatFaq.mjs");

await build({
  entryPoints: [resolve(REPO, "src/data/chatFaqData.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: BUNDLE,
  logLevel: "silent",
  alias: { "@": resolve(REPO, "src") },
  // `chatFaqData` pulls in `servicePages`, which transitively reaches the
  // Supabase client. The client asserts on its env at module scope, so the
  // bundle needs a Vite-shaped `import.meta.env` to load at all. These values
  // are never used — nothing in this probe makes a network call.
  define: {
    "import.meta.env": JSON.stringify({
      VITE_SUPABASE_URL: "http://qa.invalid",
      VITE_SUPABASE_PUBLISHABLE_KEY: "qa",
      VITE_SUPABASE_ANON_KEY: "qa",
      MODE: "test",
      DEV: false,
      PROD: false,
    }),
  },
});

const { findBestFaqMatch, allFaqEntries } = await import(pathToFileURL(BUNDLE).href);

/** The words a Turkish buyer types when they want to know what happens if the part is wrong. */
const QUERIES = [
  { q: "garanti", note: "the single word — the disclosed regression" },
  { q: "garanti veriyor musunuz", note: "the exact question the removed entry answered" },
  { q: "garantiniz var mı", note: "natural phrasing" },
  { q: "güvence veriyor musunuz", note: "the synonym" },
  { q: "warranty", note: "English — re-pointed to returns" },
  { q: "sorumluluk", note: "Turkish — re-pointed to returns" },
  { q: "iade", note: "control: the returns answer's own first keyword" },
  { q: "hatalı parça gelirse ne olur", note: "the buyer's real underlying question, phrased naturally" },
  { q: "ölçü tutmazsa ne yapıyorsunuz", note: "same intent, technical phrasing" },
  { q: "teklif ne kadar sürede gelir", note: "control: an unrelated intent that must still match" },
];

console.log("# CHATBOT ROUTING PROBE — Phase 06 R5");
console.log(`# corpus: ${allFaqEntries.length} FAQ entries (static + service-page)`);
console.log(`# match threshold: score >= 0.6, else the ChatBot falls through to the AI-consent prompt`);
console.log("");

let fellThrough = 0;
for (const { q, note } of QUERIES) {
  const m = findBestFaqMatch(q);
  const verdict = m ? `→ "${m.entry.question}"  (score ${m.score.toFixed(2)})` : "→ NO MATCH — falls through to the AI-consent prompt";
  if (!m) fellThrough += 1;
  console.log(`"${q}"`);
  console.log(`   ${note}`);
  console.log(`   ${verdict}`);
  if (m) console.log(`   answer: ${m.entry.answer.slice(0, 160)}${m.entry.answer.length > 160 ? "…" : ""}`);
  console.log("");
}

// Does ANY entry still carry a guarantee-family keyword or question word?
const guaranteeCarriers = allFaqEntries.filter((e) =>
  [...e.keywords, e.question].some((s) => /garanti|güvence/i.test(s)),
);
console.log(`# entries whose keywords or question still contain garanti/güvence: ${guaranteeCarriers.length}`);
for (const e of guaranteeCarriers) console.log(`  - "${e.question}"`);
console.log("");
console.log(`# queries with no match: ${fellThrough}/${QUERIES.length}`);

rmSync(OUT, { recursive: true, force: true });
