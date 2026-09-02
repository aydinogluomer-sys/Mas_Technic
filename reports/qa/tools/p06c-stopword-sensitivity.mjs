#!/usr/bin/env node
/**
 * R5 — verifying the Coder's disclosure that it SHRANK an earlier, larger
 * stopword list because the larger one turned QA's own
 * "hatalı parça gelirse ne olur" from NO MATCH into a confident WRONG answer.
 *
 * The shipped list drops fourteen words. A larger list would additionally strip
 * the residual verb/adverb tail of that query, reducing it to its noun core.
 * The matcher scores `matchCount / inputWords.length` with a SUBSTRING rule
 * (`tw.includes(iw) || iw.includes(tw)`), so shortening a query mechanically
 * RAISES its best score — the denominator shrinks and a single loose substring
 * hit can carry it past the 0.6 threshold.
 *
 * This probe feeds the same query at successively shorter word counts, which
 * is exactly what a longer stopword list would produce, and prints what the
 * live matcher answers at each length. No source file is modified.
 */
import { build } from "esbuild";
import { join, resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL, fileURLToPath } from "node:url";
import { rmSync } from "node:fs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const out = join(tmpdir(), `stopword-sens-${process.pid}.mjs`);
await build({
  entryPoints: [resolve(REPO, "src/data/chatFaqData.ts")],
  bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "silent",
  alias: { "@": resolve(REPO, "src") },
  nodePaths: [resolve(REPO, "node_modules")],
  define: {
    "import.meta.env": JSON.stringify({
      VITE_SUPABASE_URL: "http://qa.invalid", VITE_SUPABASE_PUBLISHABLE_KEY: "qa",
      VITE_SUPABASE_ANON_KEY: "qa", MODE: "test", DEV: false, PROD: false,
    }),
  },
});
const { findBestFaqMatch } = await import(pathToFileURL(out).href);

const LADDER = [
  { q: "hatalı parça gelirse ne olur", note: "SHIPPED — the query as QA types it, with the shipped 14-word list" },
  { q: "hatalı parça gelirse olur", note: "as a slightly larger list would leave it" },
  { q: "hatalı parça gelirse", note: "larger still" },
  { q: "hatalı parça", note: "the noun core — what an aggressive list reduces it to" },
  { q: "ölçü tutmazsa ne yapıyorsunuz", note: "SHIPPED — the second fall-through" },
  { q: "ölçü tutmazsa", note: "the same query with the verb stripped" },
];

console.log("# STOPWORD SENSITIVITY — why the list had to stay small");
console.log("# threshold: score >= 0.6");
console.log("");
for (const { q, note } of LADDER) {
  const r = findBestFaqMatch(q);
  console.log(`"${q}"  (${q.split(/\s+/).length} words)`);
  console.log(`   ${note}`);
  console.log(r ? `   → "${r.entry.question}"  score ${r.score.toFixed(2)}` : "   → NO MATCH (falls through to the AI-consent prompt)");
  console.log("");
}
rmSync(out, { force: true });
