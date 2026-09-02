#!/usr/bin/env node
/**
 * R5 — did the chatbot matcher change break anything else?
 *
 * `35ef1ec` added two keywords to the returns entry and dropped fourteen
 * content-free question-form words from `normalize()` on BOTH sides of the
 * score. Dropping words from a TF-IDF-shaped matcher is exactly the kind of
 * change that fixes one query and silently re-routes twenty others, and the
 * Coder disclosed that a LARGER version of that list turned
 * "hatalı parça gelirse ne olur" from NO MATCH into a confident WRONG answer.
 *
 * So this does not spot-check queries. It builds BOTH versions of the real
 * module with the project's own esbuild and routes the same corpus through
 * both: every FAQ question in the shipped corpus, used as its own query, plus
 * an unrelated-intent set. Any query whose answer or match/no-match status
 * differs is printed.
 *
 * Usage:
 *   node p06c-chat-routing-ab.mjs --prev <dir containing src/> [--verbose]
 */
import { build } from "esbuild";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const argv = process.argv.slice(2);
const prevArg = argv.indexOf("--prev");
const PREV_ROOT = prevArg === -1 ? null : resolve(argv[prevArg + 1]);
const VERBOSE = argv.includes("--verbose");
const OUT = join(tmpdir(), `chatfaq-ab-${process.pid}`);
mkdirSync(OUT, { recursive: true });

const ENV = JSON.stringify({
  VITE_SUPABASE_URL: "http://qa.invalid",
  VITE_SUPABASE_PUBLISHABLE_KEY: "qa",
  VITE_SUPABASE_ANON_KEY: "qa",
  MODE: "test", DEV: false, PROD: false,
});

async function load(root, tag) {
  const outfile = join(OUT, `${tag}.mjs`);
  await build({
    entryPoints: [resolve(root, "src/data/chatFaqData.ts")],
    bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent",
    alias: { "@": resolve(root, "src") },
    define: { "import.meta.env": ENV },
    // The previous tree is a bare `src/` export with no `node_modules`, and
    // `chatFaqData` transitively reaches the Supabase client. Resolve bare
    // imports from the repo that owns the toolchain; nothing here calls out.
    nodePaths: [resolve(REPO, "node_modules"), resolve(REPO, "../../precision-dynamics-hub-main/node_modules")],
  });
  return import(pathToFileURL(outfile).href);
}

const cur = await load(REPO, "cur");
const prev = PREV_ROOT ? await load(PREV_ROOT, "prev") : null;

/** Unrelated intents — none of them is about guarantees or returns. */
const UNRELATED = [
  "teklif ne kadar sürede gelir",
  "hangi malzemeleri işliyorsunuz",
  "minimum sipariş adediniz nedir",
  "cad dosyası hangi formatta göndermeliyim",
  "tolerans ne kadar hassas",
  "yüzey kaplama yapıyor musunuz",
  "nerede bulunuyorsunuz",
  "titanyum işleyebiliyor musunuz",
  "kalite sertifikalarınız nelerdir",
  "ödeme koşullarınız nedir",
  "kargo ve teslimat nasıl",
  "prototip üretimi yapıyor musunuz",
  "5 eksen tezgahınız var mı",
  "kaynak yapıyor musunuz",
  "ölçüm raporu veriyor musunuz",
  "yurt dışına gönderiyor musunuz",
];

/** Guarantee/returns queries — the ones this change targets. */
const TARGETED = [
  "garanti",
  "garanti veriyor musunuz",
  "garantiniz var mı",
  "güvence veriyor musunuz",
  "warranty",
  "sorumluluk",
  "iade",
  "hatalı parça gelirse ne olur",
  "ölçü tutmazsa ne yapıyorsunuz",
];

const questions = cur.allFaqEntries.map((e) => e.question);
const corpus = [
  ...TARGETED.map((q) => ({ q, kind: "targeted" })),
  ...UNRELATED.map((q) => ({ q, kind: "unrelated" })),
  ...questions.map((q) => ({ q, kind: "own-question" })),
];

const label = (r) => (r ? r.entry.question : "NO MATCH");

console.log("# CHATBOT ROUTING A/B — previous tree vs corrected tree");
console.log(`# prev corpus: ${prev ? prev.allFaqEntries.length : "n/a"} entries`);
console.log(`# new  corpus: ${cur.allFaqEntries.length} entries`);
console.log(`# queries:     ${corpus.length}`);
console.log("");

let changed = 0;
let noMatchNew = 0;
const changes = [];
for (const { q, kind } of corpus) {
  const b = cur.findBestFaqMatch(q);
  if (!b) noMatchNew += 1;
  if (!prev) continue;
  const a = prev.findBestFaqMatch(q);
  if (label(a) !== label(b)) {
    changed += 1;
    changes.push({ q, kind, from: label(a), to: label(b) });
  }
}

console.log(`## routing differences — ${changed} of ${corpus.length}`);
for (const c of changes) {
  console.log(`  [${c.kind}] "${c.q}"`);
  console.log(`      was: ${c.from}`);
  console.log(`      now: ${c.to}`);
}
console.log("");
const byKind = new Map();
for (const c of changes) byKind.set(c.kind, (byKind.get(c.kind) ?? 0) + 1);
console.log("## differences by query kind");
for (const k of ["targeted", "unrelated", "own-question"]) console.log(`  ${k.padEnd(14)} ${byKind.get(k) ?? 0}`);
console.log("");
console.log(`## queries with no match under the corrected matcher — ${noMatchNew}`);
if (VERBOSE) for (const { q } of corpus) if (!cur.findBestFaqMatch(q)) console.log(`  NO MATCH  "${q}"`);
rmSync(OUT, { recursive: true, force: true });
