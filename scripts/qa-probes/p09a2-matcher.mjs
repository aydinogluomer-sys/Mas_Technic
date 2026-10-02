/**
 * QA 09a-R2 item 3 — drive the REAL findBestFaqMatch() over visitor phrasings.
 *
 * Enumerating the pool proves what CAN be said. This proves what IS said: it
 * calls the shipped matcher and prints the answer ChatBot.tsx:261 would render.
 */
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = process.cwd();
const outfile = path.join(root, "scripts", "qa-probes", ".p09a2-match.mjs");

const SAFE_ENV = {
  VITE_SUPABASE_URL: "http://127.0.0.1:9",
  VITE_SUPABASE_PUBLISHABLE_KEY: "qa-probe-not-a-real-key",
  VITE_SUPABASE_PROJECT_ID: "qa-probe",
  MODE: "test",
  DEV: false,
  PROD: false,
};

await build({
  entryPoints: [path.join(root, "src", "data", "chatFaqData.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile,
  alias: { "@": path.join(root, "src") },
  define: { "import.meta.env": JSON.stringify(SAFE_ENV) },
  logLevel: "error",
});

const { findBestFaqMatch } = await import(pathToFileURL(outfile).href);

const PROBES = [
  // CAD format question -- the one the ledger says must derive from validateCadFile
  "Hangi dosya formatlarını kabul ediyorsunuz?",
  "hangi dosya formatlarini kabul ediyorsunuz",
  "Hangi CAD dosya formatlarını kabul ediyorsunuz?",
  "dosya formatı",
  "solidworks dosyası gönderebilir miyim",
  "dwg kabul ediyor musunuz",
  "pdf teknik resim yükleyebilir miyim",
  "catia dosyası",
  // the three prohibited classes
  "teslimat süreniz ne kadar",
  "kaç günde teslim edersiniz",
  "acil işim var aynı gün olur mu",
  "hafta sonu çalışıyor musunuz",
  "ödeme koşullarınız nedir",
  "vadeli ödeme yapabilir miyim",
  "peşin ödeme zorunlu mu",
  "garanti veriyor musunuz",
  "iade edebilir miyim",
  "ücretsiz mi",
  // SLA
  "teklif ne kadar sürede gelir",
  "çalışma saatleriniz nedir",
];

for (const q of PROBES) {
  const m = findBestFaqMatch(q);
  console.log("──────────────────────────────────────────────");
  console.log("INPUT : " + q);
  if (!m) {
    console.log("MATCH : <none, falls to default response>");
    continue;
  }
  console.log("SCORE : " + m.score.toFixed(3));
  console.log("Q     : " + m.entry.question);
  console.log("ANSWER: " + m.entry.answer);
}
