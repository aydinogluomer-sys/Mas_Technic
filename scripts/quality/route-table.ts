/**
 * THE ROUTE TABLE — one source for every tool that needs the site's routes.
 *
 * `routes-manifest.ts` writes it to docs/quality/mas-technic-awwwards/routes.json
 * for QA, and `scripts/prerender/prerender.mjs` renders its public routes to
 * static HTML. Static routes are listed from `src/App.tsx`; everything with a
 * `:slug` comes from its data module, so a record added or removed there shows
 * up in both without editing this file.
 */
import { servicePages } from "@/data/servicePages";
import { categoryPages } from "@/data/categoryPages";
import { materialCategories } from "@/data/materialsData";
import { blogPosts } from "@/data/blogData";
import { caseStudies } from "@/content/caseStudies";
import { DETAIL_FAMILIES } from "@/lib/detail-route";

export type Access = "public" | "auth" | "protected" | "redirect" | "not-found" | "dev-only";
export interface RouteEntry {
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

/* Retired URLs that must keep working. `basinçli-dokum` was the one non-ASCII
   slug on the site (half-Turkish spelling); it became `basincli-dokum` in C3
   because hosts disagree on matching percent-encoded file names. */
const legacyRedirects = [
  { from: "/hizmetler/basinçli-dokum", to: "/hizmetler/basincli-dokum" },
];

const reportRoutes = [...STATIC, ...categories, ...details, ...materials, ...blog, ...profiles];

export function buildRouteTable() {
  return { STATIC, categories, details, materials, blog, profiles, wrongFamilyRedirects, legacyRedirects, reportRoutes };
}
