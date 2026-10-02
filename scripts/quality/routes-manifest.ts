/**
 * Builds `docs/quality/mas-technic-awwwards/routes.json` from the route data
 * the app actually renders (S00). Run:
 *
 *   npx esbuild scripts/quality/routes-manifest.ts --bundle --platform=node \
 *     --format=esm --alias:@=./src --outfile=/tmp/routes-manifest.mjs \
 *     --loader:.webp=empty --loader:.png=empty --loader:.jpg=empty --loader:.svg=empty \
 *     && node /tmp/routes-manifest.mjs
 *
 * Static routes are listed by hand from `src/App.tsx`; everything with a
 * `:slug` comes from its data module, so a record added or removed there shows
 * up here without editing this file.
 */
import { writeFileSync } from "node:fs";
import { servicePages } from "@/data/servicePages";
import { categoryPages } from "@/data/categoryPages";
import { materialCategories } from "@/data/materialsData";
import { blogPosts } from "@/data/blogData";
import { caseStudies } from "@/content/caseStudies";
import { DETAIL_FAMILIES } from "@/lib/detail-route";

type Access = "public" | "auth" | "protected" | "redirect" | "not-found" | "dev-only";
interface RouteEntry {
  path: string;
  kind: string;
  access: Access;
  /** EN locale pair once L01 lands. `null` = no public EN pair (panel/auth/test). */
  enPath: string | null;
  source: string;
  redirectTo?: string;
  note?: string;
}

const en = (path: string) => (path === "/" ? "/en" : `/en${path}`);

const STATIC: RouteEntry[] = [
  { path: "/", kind: "landing", access: "public", enPath: en("/"), source: "src/App.tsx → pages/Index (TechnicalLanding)" },
  { path: "/hakkimizda", kind: "page", access: "public", enPath: en("/hakkimizda"), source: "src/App.tsx" },
  { path: "/iletisim", kind: "page", access: "public", enPath: en("/iletisim"), source: "src/App.tsx" },
  { path: "/sss", kind: "page", access: "public", enPath: en("/sss"), source: "src/App.tsx" },
  { path: "/gizlilik-politikasi", kind: "legal", access: "public", enPath: en("/gizlilik-politikasi"), source: "src/App.tsx" },
  { path: "/kvkk", kind: "legal", access: "public", enPath: en("/kvkk"), source: "src/App.tsx" },
  { path: "/cerez-politikasi", kind: "legal", access: "public", enPath: en("/cerez-politikasi"), source: "src/App.tsx" },
  { path: "/malzemeler", kind: "index", access: "public", enPath: en("/malzemeler"), source: "src/App.tsx" },
  { path: "/blog", kind: "index", access: "public", enPath: en("/blog"), source: "src/App.tsx" },
  { path: "/kabiliyet-profilleri", kind: "index", access: "public", enPath: en("/kabiliyet-profilleri"), source: "src/App.tsx" },
  { path: "/kalite-dosyasi", kind: "page", access: "public", enPath: en("/kalite-dosyasi"), source: "src/App.tsx" },
  { path: "/giris", kind: "auth", access: "auth", enPath: en("/giris"), source: "src/App.tsx", note: "noindex (SEO01)" },
  { path: "/sifremi-unuttum", kind: "auth", access: "auth", enPath: en("/sifremi-unuttum"), source: "src/App.tsx", note: "noindex (SEO01)" },
  { path: "/reset-password", kind: "auth", access: "auth", enPath: en("/reset-password"), source: "src/App.tsx", note: "noindex (SEO01)" },
  { path: "/teklif-al", kind: "rfq", access: "public", enPath: en("/teklif-al"), source: "src/App.tsx" },
  { path: "/cad-dashboard", kind: "redirect", access: "redirect", enPath: null, redirectTo: "/teklif-al", source: "src/App.tsx <Navigate replace>", note: "client redirect, not HTTP 301" },
  { path: "/admin/login", kind: "panel", access: "auth", enPath: null, source: "src/App.tsx (panelRoutes)", note: "no public EN prefix" },
  { path: "/admin", kind: "panel", access: "protected", enPath: null, source: "src/App.tsx ProtectedRoute", note: "no public EN prefix" },
  { path: "/musteri-paneli", kind: "panel", access: "protected", enPath: null, source: "src/App.tsx CustomerProtectedRoute", note: "no public EN prefix" },
  { path: "/audit-not-found", kind: "test-input", access: "not-found", enPath: null, source: "src/App.tsx * → NotFound", note: "test input only; client 404, HTTP status is host-dependent (RELEASE01)" },
];

const DEV_ONLY: RouteEntry[] = ["/technical-preview", "/legacy-landing", "/test"].map((path) => ({
  path, kind: "dev", access: "dev-only", enPath: null, source: "src/App.tsx DEV_ONLY_ROUTES", note: "absent from production build",
}));

const categories: RouteEntry[] = categoryPages.map((item) => {
  const path = `/${item.prefix}/kategori/${item.slug}`;
  return { path, kind: `category:${item.prefix}`, access: "public", enPath: en(path), source: "src/data/categoryPages.ts" };
});

const details: RouteEntry[] = servicePages.map((item) => {
  const path = `/${item.category}/${item.slug}`;
  return { path, kind: `detail:${item.category}`, access: "public", enPath: en(path), source: "src/data/servicePages.ts" };
});

const materials: RouteEntry[] = materialCategories.map((item) => {
  const path = `/malzemeler/${item.slug}`;
  return { path, kind: "material-family", access: "public", enPath: en(path), source: "src/data/materialsData.ts" };
});

const blog: RouteEntry[] = blogPosts.map((item) => {
  const path = `/blog/${item.slug}`;
  return { path, kind: "blog-post", access: "public", enPath: en(path), source: "src/data/blogData.ts" };
});

const profiles: RouteEntry[] = caseStudies.map((item) => {
  const path = `/kabiliyet-profilleri/${item.slug}`;
  return { path, kind: "capability-profile", access: "public", enPath: en(path), source: "src/content/caseStudies.ts" };
});

/* R01: every known slug under a wrong family is a client redirect. Listed so
   the manifest records the redirect surface, not just the canonical one. */
const wrongFamilyRedirects = servicePages.flatMap((item) =>
  DETAIL_FAMILIES.filter((family) => family !== item.category).map((family) => ({
    from: `/${family}/${item.slug}`,
    to: `/${item.category}/${item.slug}`,
  })));

const reportRoutes = [...STATIC, ...categories, ...details, ...materials, ...blog, ...profiles];

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
    devOnly: DEV_ONLY.length,
    wrongFamilyRedirects: wrongFamilyRedirects.length,
  },
  localeRule: "TR keeps current paths; EN uses the /en prefix with the same slugs (L01, not yet implemented). Panel/auth-panel routes get no EN prefix.",
  routes: reportRoutes,
  devOnly: DEV_ONLY,
  wrongFamilyRedirects,
};

writeFileSync("docs/quality/mas-technic-awwwards/routes.json", `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest.counts));
