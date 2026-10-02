/**
 * QA 09a-R2 items 2 & 5 — build the public route list from the DATA, not from
 * the Coder's list. The packet says to treat its 56 routes as a floor.
 */
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import { writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const SAFE_ENV = {
  VITE_SUPABASE_URL: "http://127.0.0.1:9",
  VITE_SUPABASE_PUBLISHABLE_KEY: "qa-probe-not-a-real-key",
  VITE_SUPABASE_PROJECT_ID: "qa-probe",
  MODE: "test", DEV: false, PROD: false,
};

async function load(rel, out) {
  const outfile = path.join(root, "scripts", "qa-probes", out);
  await build({
    entryPoints: [path.join(root, rel)], bundle: true, format: "esm", platform: "node",
    outfile, alias: { "@": path.join(root, "src") },
    define: { "import.meta.env": JSON.stringify(SAFE_ENV) }, logLevel: "error",
  });
  return import(pathToFileURL(outfile).href);
}

const svc = await load("src/data/servicePages.ts", ".p09a2-routes-svc.mjs");

const STATIC_ROUTES = [
  "/", "/hakkimizda", "/iletisim", "/teklif-al", "/sss", "/blog", "/malzemeler",
  "/kalite-dosyasi", "/kabiliyet-profilleri", "/kvkk", "/gizlilik-politikasi",
  "/cerez-politikasi", "/hizmetler", "/kabiliyetler", "/endustriyel",
];

// Service detail pages, grouped by their category segment.
const byCategory = new Map();
for (const p of svc.servicePages) {
  if (!byCategory.has(p.category)) byCategory.set(p.category, []);
  byCategory.get(p.category).push(p.slug);
}

const routes = [...STATIC_ROUTES];
for (const [cat, slugs] of byCategory) {
  for (const s of slugs) routes.push(`/${cat}/${s}`);
}

const unique = [...new Set(routes)];
writeFileSync(
  path.join(root, "reports", "qa", "phase-09a-r2", "routes.json"),
  JSON.stringify(unique, null, 2),
  "utf8",
);
console.log("ROUTE_COUNT=" + unique.length);
console.log("CATEGORIES=" + JSON.stringify([...byCategory.keys()]));
console.log(unique.join("\n"));
