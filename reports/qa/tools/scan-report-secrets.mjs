#!/usr/bin/env node
/**
 * QA Phase 00 — SC7: scan every file under reports/** for credential leakage.
 *
 * Checks:
 *   1. JWT-shaped strings (eyJ... . ... . ...) — Supabase anon/publishable keys are JWTs.
 *   2. Supabase URLs (*.supabase.co / *.supabase.in).
 *   3. sb_publishable_ / sb_secret_ / service_role key prefixes.
 *   4. The literal VALUES of every VITE_* variable in the primary checkout's .env
 *      (values are read at runtime, never printed, never written anywhere).
 *
 * Prints only the variable NAME and a match location if a value is found.
 * Exits 1 on any hit.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, relative, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..", "..");
const reportsDir = resolve(root, "reports");

const ENV_PATH =
  process.env.QA_ENV_PATH ??
  "C:\\Users\\Trade Bilisim\\precision-dynamics-hub-main\\.env";

/** @type {{name:string, value:string}[]} */
const envSecrets = [];
if (existsSync(ENV_PATH)) {
  for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
    if (!m) continue;
    const value = m[2].replace(/^["']|["']$/g, "");
    if (value.length < 8) continue; // too short to be a meaningful secret
    envSecrets.push({ name: m[1], value });
  }
}

const PATTERNS = [
  { name: "JWT-shaped string", re: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { name: "Supabase URL", re: /https?:\/\/[a-z0-9-]+\.supabase\.(co|in)/i },
  { name: "sb_publishable_ key", re: /sb_publishable_[A-Za-z0-9_-]{10,}/ },
  { name: "sb_secret_ key", re: /sb_secret_[A-Za-z0-9_-]{10,}/ },
  { name: "service_role key literal", re: /service_role[^a-zA-Z0-9_]{0,4}[A-Za-z0-9._-]{30,}/ },
];

/** @param {string} dir */
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const BINARY = /\.(png|jpe?g|webp|gif|pdf|ico|woff2?|ttf|mp4|zip)$/i;

let hits = 0;
let scanned = 0;
let skippedBinary = 0;

console.log("=== QA SC7 credential-leak scan of reports/** ===");
console.log(`ENV_VARS_LOADED_FOR_VALUE_MATCHING: ${envSecrets.length} (${envSecrets.map((e) => e.name).join(", ") || "none"})`);
console.log("(values are matched in memory only and are never printed)\n");

for (const file of walk(reportsDir)) {
  if (BINARY.test(file)) {
    skippedBinary += 1;
    continue;
  }
  scanned += 1;
  const rel = relative(root, file).replace(/\\/g, "/");
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const p of PATTERNS) {
      if (p.re.test(line)) {
        hits += 1;
        console.log(`HIT [${p.name}] ${rel}:${i + 1}`);
      }
    }
    for (const s of envSecrets) {
      if (line.includes(s.value)) {
        hits += 1;
        console.log(`HIT [literal value of ${s.name}] ${rel}:${i + 1}`);
      }
    }
  });
}

console.log(`\nTEXT_FILES_SCANNED: ${scanned}`);
console.log(`BINARY_FILES_SKIPPED: ${skippedBinary}`);
console.log(`TOTAL_HITS: ${hits}`);
console.log(`VERDICT: ${hits === 0 ? "PASS — no credential material found in reports/**" : "FAIL"}`);
process.exit(hits === 0 ? 0 : 1);
