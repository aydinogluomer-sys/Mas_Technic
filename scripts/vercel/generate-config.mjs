/**
 * C3 — vercel.json, generated from the route table.
 *
 *   node scripts/vercel/generate-config.mjs           write vercel.json
 *   node scripts/vercel/generate-config.mjs --check   exit 1 if it is stale (CI)
 *
 * HTTP behaviour the SPA cannot give itself:
 *
 *   cleanUrls        /hizmetler/cnc-frezeleme serves the prerendered
 *                    dist/hizmetler/cnc-frezeleme.html (scripts/prerender)
 *   404              no blanket rewrite to index.html: a path with no file,
 *                    no redirect and no rewrite gets dist/404.html with HTTP 404
 *   redirects (301)  every known detail slug under a wrong family (R01; the
 *                    app used to do this as a client `replace`), retired URLs
 *                    and /cad-dashboard — TR and EN
 *   rewrites         only the panel and auth routes, to the empty app shell
 *                    (dist/shell.html); they are never prerendered
 *   headers          hashed assets immutable; HTML and release.json revalidate
 *                    on every request so a deploy is seen at once; a few
 *                    safe security headers (no CSP: the booking iframe, the
 *                    hCaptcha and the Supabase calls need a measured policy,
 *                    not a guessed one — see release.md)
 *
 * `scripts/serve-dist.mjs` reads the same file, so local tests exercise these
 * rules before any deploy.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadRouteTable } from "../lib/route-table.mjs";

const root = resolve(import.meta.dirname, "..", "..");
const OUT = join(root, "vercel.json");

const table = await loadRouteTable();
const en = (path) => (path === "/" ? "/en" : `/en${path}`);

/* A redirect source must match the path as requested. A browser sends a
   non-ASCII path percent-encoded, so both spellings are listed. */
const spellings = (path) => [...new Set([path, encodeURI(path)])];

const pairs = [
  ...table.wrongFamilyRedirects.map(({ from, to }) => [from, to]),
  ...table.legacyRedirects.map(({ from, to }) => [from, to]),
];
const redirects = [
  ...pairs.flatMap(([from, to]) => [
    ...spellings(from).map((source) => ({ source, destination: to, permanent: true })),
    ...spellings(en(from)).map((source) => ({ source, destination: en(to), permanent: true })),
  ]),
  { source: "/cad-dashboard", destination: "/teklif-al", permanent: true },
];

const SHELL_ROUTES = ["/admin", "/admin/:path*", "/musteri-paneli", "/musteri-paneli/:path*"];
const AUTH_ROUTES = table.STATIC.filter((route) => route.access === "auth" && !route.path.startsWith("/admin"))
  .flatMap((route) => [route.path, route.enPath].filter(Boolean));
const rewrites = [...SHELL_ROUTES, ...AUTH_ROUTES].map((source) => ({ source, destination: "/shell.html" }));

const config = {
  $schema: "https://openapi.vercel.sh/vercel.json",
  framework: null,
  installCommand: "npm ci",
  buildCommand: "npm run build",
  outputDirectory: "dist",
  cleanUrls: true,
  trailingSlash: false,
  redirects,
  rewrites,
  headers: [
    {
      source: "/assets/(.*)",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    },
    {
      source: "/release.json",
      headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
    },
    {
      source: "/((?!assets/).*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      ],
    },
  ],
};

const text = `${JSON.stringify(config, null, 2)}\n`;
if (process.argv.includes("--check")) {
  const current = (() => { try { return readFileSync(OUT, "utf8"); } catch { return ""; } })();
  if (current !== text) {
    console.error("vercel.json is out of date with the route table — run: node scripts/vercel/generate-config.mjs");
    process.exit(1);
  }
  console.log(`vercel.json is current (${redirects.length} redirects, ${rewrites.length} rewrites)`);
} else {
  writeFileSync(OUT, text);
  console.log(`vercel.json written (${redirects.length} redirects, ${rewrites.length} rewrites)`);
}
