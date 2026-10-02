/* QA-owned. Independent IA reachability audit for Phase 03.
   Written by mas-qa; deliberately re-derives the union rather than reusing
   e2e/landing/navigation-reachability.spec.ts's helper logic. */
import { readFileSync } from "node:fs";

const ia = await import("../../../src/components/navigation/ia.ts");
const { categoryPages } = await import("../../../src/data/categoryPages.ts");
const { servicePages } = await import("../../../src/data/servicePages.ts");
const { materialCategories } = await import("../../../src/data/materialsData.ts");

const app = readFileSync("src/App.tsx", "utf8");
const publicBlock = app.slice(app.indexOf("const publicRoutes ="), app.indexOf("return isPanel"));
const publicRoutes = [...publicBlock.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);

const blogSrc = readFileSync("src/data/blogData.ts", "utf8");
const blogSlugs = [...blogSrc.matchAll(/\bslug\s*:\s*["']([^"']+)["']/g)].map((m) => m[1]);

const concrete = {
  "/hizmetler/kategori/:slug": categoryPages.filter((p) => p.prefix === "hizmetler").map((p) => `/hizmetler/kategori/${p.slug}`),
  "/kabiliyetler/kategori/:slug": categoryPages.filter((p) => p.prefix === "kabiliyetler").map((p) => `/kabiliyetler/kategori/${p.slug}`),
  "/endustriyel/kategori/:slug": categoryPages.filter((p) => p.prefix === "endustriyel").map((p) => `/endustriyel/kategori/${p.slug}`),
  "/hizmetler/:slug": servicePages.filter((p) => p.category === "hizmetler").map((p) => `/hizmetler/${p.slug}`),
  "/kabiliyetler/:slug": servicePages.filter((p) => p.category === "kabiliyetler").map((p) => `/kabiliyetler/${p.slug}`),
  "/endustriyel/:slug": servicePages.filter((p) => p.category === "endustriyel").map((p) => `/endustriyel/${p.slug}`),
  "/malzemeler/:slug": materialCategories.map((c) => `/malzemeler/${c.slug}`),
  "/blog/:slug": blogSlugs.map((s) => `/blog/${s}`),
};

const targets = new Set(ia.navigationTargets());
const excluded = new Map(ia.EXCLUDED_FROM_PRIMARY_NAV.map((e) => [e.path, e.reason]));
const indexCovers = new Map(ia.INDEX_ROUTES.map((e) => [e.covers, e.path]));

console.log("=== COUNTS ===");
console.log("public route decls:", publicRoutes.length);
console.log("nav targets:", targets.size);
console.log("categoryPages:", categoryPages.length,
  "hizmetler", categoryPages.filter((p) => p.prefix === "hizmetler").length,
  "kabiliyetler", categoryPages.filter((p) => p.prefix === "kabiliyetler").length,
  "endustriyel", categoryPages.filter((p) => p.prefix === "endustriyel").length);
console.log("servicePages:", servicePages.length,
  "hizmetler", servicePages.filter((p) => p.category === "hizmetler").length,
  "kabiliyetler", servicePages.filter((p) => p.category === "kabiliyetler").length,
  "endustriyel", servicePages.filter((p) => p.category === "endustriyel").length);
console.log("materialCategories:", materialCategories.length, "blogSlugs:", blogSlugs.length);

console.log("\n=== PER-ROUTE VERDICT ===");
const orphans = [];
for (const pattern of publicRoutes) {
  if (excluded.has(pattern)) { console.log(`EXCLUDED  ${pattern}  :: ${excluded.get(pattern)}`); continue; }
  if (indexCovers.has(pattern)) {
    const idx = indexCovers.get(pattern);
    const ok = targets.has(idx);
    console.log(`${ok ? "INDEX-OK " : "ORPHAN   "} ${pattern} via ${idx}`);
    if (!ok) orphans.push(`${pattern} (index ${idx} unlinked)`);
    continue;
  }
  if (concrete[pattern]) {
    const miss = concrete[pattern].filter((u) => !targets.has(u));
    console.log(`${miss.length === 0 ? "LINKED   " : "ORPHAN   "} ${pattern} (${concrete[pattern].length} urls, ${miss.length} unlinked)`);
    orphans.push(...miss);
    continue;
  }
  const ok = targets.has(pattern);
  console.log(`${ok ? "LINKED   " : "ORPHAN   "} ${pattern}`);
  if (!ok) orphans.push(pattern);
}
console.log("\nORPHANS:", JSON.stringify(orphans));

// Reverse direction: does the IA link to anything that has no matching route?
const routeRe = publicRoutes.map((p) => new RegExp("^" + p.replace(/:[^/]+/g, "[^/]+").replace(/\*/g, ".*") + "$"));
const dangling = [...targets].filter((t) => !routeRe.some((re) => re.test(t)));
console.log("IA TARGETS WITH NO ROUTE (excluding catch-all match):",
  JSON.stringify([...targets].filter((t) => {
    const m = publicRoutes.filter((p) => p !== "*")
      .some((p) => new RegExp("^" + p.replace(/:[^/]+/g, "[^/]+") + "$").test(t));
    return !m;
  })));

// Do IA leaf targets actually exist in the data (not just pattern-shaped)?
const knownConcrete = new Set(Object.values(concrete).flat());
const staticRoutes = new Set(publicRoutes.filter((p) => !p.includes(":") && p !== "*"));
const unbacked = [...targets].filter((t) => !knownConcrete.has(t) && !staticRoutes.has(t));
console.log("IA TARGETS NOT BACKED BY DATA OR A STATIC ROUTE:", JSON.stringify(unbacked));

// Also: dev routes must not be targets
console.log("DEV LEAK:", JSON.stringify(["/technical-preview", "/legacy-landing", "/test"].filter((d) => targets.has(d))));
