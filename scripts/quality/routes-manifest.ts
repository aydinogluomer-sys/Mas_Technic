/**
 * Builds `docs/quality/mas-technic-awwwards/routes.json` from the route data
 * the app actually renders (S00). Run:
 *
 *   npx esbuild scripts/quality/routes-manifest.ts --bundle --platform=node \
 *     --format=esm --alias:@=./src --outfile=/tmp/routes-manifest.mjs \
 *     --loader:.webp=empty --loader:.png=empty --loader:.jpg=empty --loader:.svg=empty \
 *     && node /tmp/routes-manifest.mjs
 *
 * The routes themselves come from `route-table.ts`, shared with the prerender.
 */
import { writeFileSync } from "node:fs";
import { DETAIL_FAMILIES } from "@/lib/detail-route";
import { buildRouteTable } from "./route-table";

const { STATIC, categories, details, materials, blog, profiles, wrongFamilyRedirects, reportRoutes } = buildRouteTable();

const manifest = {
  generatedAt: new Date().toISOString(),
  generator: "scripts/quality/routes-manifest.ts",
  counts: {
    reportScope: reportRoutes.length,
    static: STATIC.length,
    categories: categories.length,
    details: details.length,
    detailsByFamily: Object.fromEntries(DETAIL_FAMILIES.map((family) => [family, details.filter((item) => item.kind === `detail:${family}`).length])),
    materialFamilies: materials.length,
    blogPosts: blog.length,
    capabilityProfiles: profiles.length,
    wrongFamilyRedirects: wrongFamilyRedirects.length,
  },
  localeRule: "TR keeps current paths; EN uses the /en prefix with the same slugs (L01). Panel/auth-panel routes get no EN prefix.",
  routes: reportRoutes,
  wrongFamilyRedirects,
};

writeFileSync("docs/quality/mas-technic-awwwards/routes.json", `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest.counts));
