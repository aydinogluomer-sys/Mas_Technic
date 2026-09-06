/* QA 09a-R3 — dump the assembled chatbot answer pool and re-probe the six
 * CAD phrasings, from the REAL modules rather than from the Coder's account.
 *
 * `chatFaqData.ts` -> `cadUpload.ts` -> `integrations/supabase/env.ts` reads
 * `import.meta.env` at module scope, so the pool cannot simply be imported
 * into Node. It is bundled with esbuild instead, with:
 *   · `import.meta.env` DEFINED to a loopback URL and a junk key, so no code
 *     path can name the customer's project; and
 *   · `@/integrations/supabase/client` ALIASED to an inert throwing stub, so
 *     no client is constructed and no socket can be opened.
 * Nothing here submits, uploads or inserts anything.
 */
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const OUT = resolve(ROOT, "reports/qa/phase-09a-r3");
mkdirSync(OUT, { recursive: true });

const ENTRY = resolve(HERE, "p09a3-pool-entry.mjs");
writeFileSync(
  ENTRY,
  [
    'export { allFaqEntries, findBestFaqMatch } from "@/data/chatFaqData";',
    'export { servicePages } from "@/data/servicePages";',
    'export { CAD_UPLOAD_FORMATS, CAD_UPLOAD_EXTENSIONS } from "@/content/claims";',
    'export { CAD_ACCEPTED_EXTENSIONS, validateCadFile } from "@/utils/cadUpload";',
    "",
  ].join("\n"),
  "utf8",
);

const BUNDLE = resolve(HERE, "p09a3-pool.bundle.mjs");
await build({
  entryPoints: [ENTRY],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: BUNDLE,
  logLevel: "warning",
  define: {
    // Loopback + junk. Deliberately unusable; see the header.
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("http://127.0.0.1:1/qa-probe-never-reachable"),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify("qa-probe-junk-key-not-a-credential"),
    "import.meta.env.DEV": "false",
    "import.meta.env.PROD": "true",
    "import.meta.env.MODE": JSON.stringify("qa-probe"),
  },
  alias: {
    "@/integrations/supabase/client": resolve(HERE, "p09a3-supabase-client-stub.mjs"),
    "@": resolve(ROOT, "src"),
  },
});

const mod = await import(pathToFileURL(BUNDLE).href);
const { allFaqEntries, findBestFaqMatch, servicePages, CAD_UPLOAD_FORMATS, CAD_UPLOAD_EXTENSIONS, CAD_ACCEPTED_EXTENSIONS } =
  mod;

/* ── 1. the assembled pool ───────────────────────────────────────────────── */
const pool = allFaqEntries.map((e, i) => ({ i, question: e.question, answer: e.answer }));

/* ── 2. does any answer OFFER a format the validator refuses? ─────────────
   The offer predicate is the gate's, transcribed. A rejected format NAMED in
   a refusal ("… yükleme adımından geçmez", "… e-posta ile") is not an offer;
   a rejected format inside an accepting verb's sentence is. */
const REJECTED = [
  "parasolid", "x_t", "x_b", "sldprt", "sldasm", "solidworks", "catpart", "catproduct",
  "catia", "dwg", "dxf", "ipt", "iam", "inventor", "creo", "rhino", "3dm", "f3d",
  "sat", "acis", "jt", "pdf", "prt", "nx",
];
const REJ_TOKEN = new RegExp(`(?<![A-Za-z0-9_])\\.?(?:${REJECTED.join("|")})(?![A-Za-z0-9_])`, "gi");
const OFFER =
  /kabul\s+ed(?:iyoruz|iyor|er|ilir|ilen|ilmekte|ebiliyoruz|iliyor)|destekl(?:iyoruz|iyor|enen|ediğimiz|emekteyiz|enir)|işleyebiliyoruz|işleyebiliriz|yükleyebilirsiniz|yükleyebileceğiniz|yüklenebilir|yükleyebiliyorsunuz|gönderebilirsiniz|doğrudan işl/i;

const sentenceAt = (text, index) => {
  const start = Math.max(0, text.lastIndexOf(".", index) + 1, text.lastIndexOf("!", index) + 1, text.lastIndexOf("?", index) + 1, text.lastIndexOf("\n", index) + 1);
  let end = text.length;
  for (const p of [".", "!", "?", "\n"]) {
    const k = text.indexOf(p, index);
    if (k !== -1 && k < end) end = k;
  }
  return text.slice(start, end + 1);
};

const offers = [];
const mentions = [];
for (const e of pool) {
  REJ_TOKEN.lastIndex = 0;
  let m;
  while ((m = REJ_TOKEN.exec(e.answer)) !== null) {
    const s = sentenceAt(e.answer, m.index).trim();
    const rec = { i: e.i, question: e.question, token: m[0], sentence: s };
    if (OFFER.test(s)) offers.push(rec);
    else mentions.push(rec);
  }
}

/* ── 3. the six phrasings ────────────────────────────────────────────────── */
const PHRASINGS = ["catia", "catia dosyası", "catpart", "solidworks", "sldprt", "solidworks dosyası"];
const probes = PHRASINGS.map((q) => {
  const r = findBestFaqMatch(q);
  const answer = r?.entry.answer ?? null;
  return {
    input: q,
    matched: r !== null,
    score: r ? Number(r.score.toFixed(4)) : null,
    question: r?.entry.question ?? null,
    answer,
    /* TRUE means: the answer does not offer a format the validator refuses. */
    offersRejectedFormat: answer ? offers.some((o) => o.question === r.entry.question) : null,
    namesEmailRoute: answer ? /sales@mastechnic\.com/.test(answer) : null,
  };
});

/* ── 4. what the validator actually does with those extensions ───────────── */
const fakeFile = (name) => ({ name, size: 1024 });
const validatorVerdicts = ["a.step", "a.stp", "a.stl", "a.obj", "a.iges", "a.igs", "a.3mf", "a.sldprt", "a.catpart", "a.prt", "a.dwg", "a.pdf", "a.x_t"].map(
  (n) => ({ file: n, error: mod.validateCadFile(fakeFile(n)) }),
);

const report = {
  generatedAt: new Date().toISOString(),
  poolSize: pool.length,
  staticCount: pool.length - servicePages.reduce((n, p) => n + (p.faq?.length ?? 0), 0),
  serviceFaqCount: servicePages.reduce((n, p) => n + (p.faq?.length ?? 0), 0),
  CAD_ACCEPTED_EXTENSIONS: [...CAD_ACCEPTED_EXTENSIONS],
  CAD_UPLOAD_FORMATS,
  CAD_UPLOAD_EXTENSIONS,
  offersOfRejectedFormats: offers,
  refusalMentionsOfRejectedFormats: mentions,
  phrasingProbes: probes,
  validatorVerdicts,
  pool,
};
writeFileSync(resolve(OUT, "chat-pool.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`pool size                : ${report.poolSize}`);
console.log(`  static                 : ${report.staticCount}`);
console.log(`  from servicePages.faq  : ${report.serviceFaqCount}`);
console.log(`CAD_ACCEPTED_EXTENSIONS  : ${report.CAD_ACCEPTED_EXTENSIONS.join(", ")}`);
console.log(`CAD_UPLOAD_FORMATS       : ${CAD_UPLOAD_FORMATS}`);
console.log(`CAD_UPLOAD_EXTENSIONS    : ${CAD_UPLOAD_EXTENSIONS}`);
console.log(`\nOFFERS of a refused format : ${offers.length}`);
for (const o of offers) console.log(`  [${o.i}] ${o.token} :: ${o.question}\n      ${o.sentence}`);
console.log(`\nrefusal/other mentions     : ${mentions.length}`);
for (const o of mentions) console.log(`  [${o.i}] ${o.token} :: ${o.question}`);
console.log("\n── six phrasings ──");
for (const p of probes) {
  console.log(
    `"${p.input}"\n  matched=${p.matched} score=${p.score} offersRejected=${p.offersRejectedFormat} email=${p.namesEmailRoute}\n  Q: ${p.question}\n  A: ${p.answer}\n`,
  );
}
console.log("── validator ──");
for (const v of validatorVerdicts) console.log(`  ${v.file.padEnd(10)} ${v.error === null ? "ACCEPTED" : "REFUSED"}`);
