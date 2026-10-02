/**
 * QA 09a-R2, item 3 — dump the FULL assembled chatbot answer pool.
 *
 * This is deliberately NOT a grep. It bundles src/data/chatFaqData.ts exactly
 * as the app does (same "@" alias, same servicePages import) and dumps the
 * real runtime value of `allFaqEntries`, which is
 *   staticEntries  ++  collectServiceFaqs()
 * ChatBot.tsx:261 renders `match.entry.answer` verbatim, with no network call
 * and no moderation layer, so every string in this pool is published surface.
 *
 * Also tags each entry with its provenance (declared in chatFaqData.ts vs
 * lifted out of servicePages.ts by collectServiceFaqs), because the packet's
 * item 3 is precisely that the larger half of the pool lives in the other file.
 */
import { build } from "esbuild";
import { writeFileSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = process.cwd();
const probeDir = path.join(root, "scripts", "qa-probes");
const outDir = path.join(root, "reports", "qa", "phase-09a-r2");
mkdirSync(outDir, { recursive: true });

/*
 * PRODUCTION-WRITE PROHIBITION, enforced structurally rather than promised:
 * the transitive import of @/utils/cadUpload constructs a Supabase client.
 * We deliberately do NOT feed it the real credentials from .env. It gets an
 * unroutable loopback URL and a junk key, so even an accidental call cannot
 * reach the customer's project. The FAQ pool does not depend on these values.
 */
const SAFE_ENV = {
  VITE_SUPABASE_URL: "http://127.0.0.1:9",
  VITE_SUPABASE_PUBLISHABLE_KEY: "qa-probe-not-a-real-key",
  VITE_SUPABASE_PROJECT_ID: "qa-probe",
  MODE: "test",
  DEV: false,
  PROD: false,
};

async function loadTs(entry, outname) {
  const outfile = path.join(probeDir, outname);
  await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    alias: { "@": path.join(root, "src") },
    define: { "import.meta.env": JSON.stringify(SAFE_ENV) },
    logLevel: "error",
  });
  return import(pathToFileURL(outfile).href);
}

const chat = await loadTs(path.join(root, "src", "data", "chatFaqData.ts"), ".p09a2-pool.mjs");
const svc = await loadTs(path.join(root, "src", "data", "servicePages.ts"), ".p09a2-svc.mjs");

const pool = chat.allFaqEntries;

// Rebuild the servicePages-derived half independently so provenance is proven,
// not assumed: question+answer pairs in servicePages order.
const fromService = [];
for (const page of svc.servicePages) {
  if (!page.faq) continue;
  for (const f of page.faq) {
    fromService.push({ slug: page.slug, question: f.question, answer: f.answer });
  }
}

const staticCount = pool.length - fromService.length;

const entries = pool.map((e, i) => {
  const isService = i >= staticCount;
  const src = isService ? fromService[i - staticCount] : null;
  return {
    i,
    origin: isService ? "servicePages.ts" : "chatFaqData.ts",
    slug: src ? src.slug : null,
    question: e.question,
    answer: e.answer,
  };
});

writeFileSync(
  path.join(outDir, "chat-pool.json"),
  JSON.stringify({ total: pool.length, staticCount, serviceCount: fromService.length, entries }, null, 2),
  "utf8"
);

// Flat text form, easiest to read and to scan by eye.
const txt = entries
  .map((e) => `#${e.i} [${e.origin}${e.slug ? " :: " + e.slug : ""}]\nQ: ${e.question}\nA: ${e.answer}\n`)
  .join("\n");
writeFileSync(path.join(outDir, "chat-pool.txt"), txt, "utf8");

console.log("POOL_TOTAL=" + pool.length);
console.log("STATIC=" + staticCount);
console.log("FROM_SERVICEPAGES=" + fromService.length);
