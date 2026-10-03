/**
 * C2 — PRERENDER THE PUBLIC ROUTES TO STATIC HTML.
 *
 *   vite build && node scripts/prerender/prerender.mjs      (= npm run build)
 *
 * Every public route in the route table (`scripts/quality/route-table.ts`, the
 * same table QA's routes.json is written from — no second list) is opened in
 * headless Chromium against the fresh `dist/`, and what the app renders is
 * written back as that route's HTML:
 *
 *   /                        → dist/index.html
 *   /hizmetler/cnc-frezeleme → dist/hizmetler/cnc-frezeleme.html   (cleanUrls)
 *   /en/sss                  → dist/en/sss.html
 *   unknown paths            → dist/404.html   (served with HTTP 404)
 *   panel + auth paths       → dist/shell.html (the empty app shell)
 *
 * Each file is the built index.html with the page's own <html lang>, title,
 * description, robots, canonical, Open Graph/Twitter tags and hreflang links
 * (what `usePageMeta` set at runtime) and the rendered body inside
 * `<div id="root" data-prerendered>`. `src/main.tsx` adopts that markup
 * instead of hydrating it (see the note there).
 *
 * Capture conditions: reduced motion (no element is caught mid-animation),
 * prose reveal off, 1440×900, every off-origin request aborted (Supabase,
 * hCaptcha, calendar) so nothing user-specific or third-party can be baked
 * in. Iframes and custom-cursor nodes are stripped. A route that does not
 * reach a rendered <main> fails the build.
 *
 * Needs Chromium: PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, or the browser
 * Playwright installs (`npx playwright install chromium`). No package added.
 */
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize, relative, resolve, sep } from "node:path";
import { chromium } from "playwright";
import { loadEnv } from "vite";
import { loadRouteTable } from "../lib/route-table.mjs";

const root = resolve(import.meta.dirname, "..", "..");
const distArg = process.argv.indexOf("--dist");
const DIST = resolve(root, distArg > -1 ? process.argv[distArg + 1] : "dist");
const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY ?? 4);
const TEMPLATE_PATH = join(DIST, "index.html");

if (!existsSync(TEMPLATE_PATH)) throw new Error("[prerender] dist/index.html missing — run vite build first");
const template = readFileSync(TEMPLATE_PATH, "utf8");
if (!template.includes('<div id="root"></div>')) {
  throw new Error("[prerender] dist/index.html is already prerendered (or its root changed); rebuild first");
}

/* Same rule as src/lib/site-origin.ts (kept inline: CI runs Node 20, which
   cannot import TypeScript). */
function normalizeOrigin(value) {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if ((url.pathname && url.pathname !== "/") || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

/* The same build-time switches the app read (src/lib/site-config.ts). */
const env = { ...loadEnv("production", root, "VITE_"), ...Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith("VITE_"))) };
const ENGLISH_LIVE = env.VITE_SITE_ENGLISH === "live";
const ORIGIN = normalizeOrigin(env.VITE_SITE_ORIGIN);
const INDEXABLE = env.VITE_SITE_INDEXING === "public" && Boolean(ORIGIN);

const table = await loadRouteTable();
const publicRoutes = table.reportRoutes.filter((route) => route.access === "public");
/* Unpublished English is not prerendered: /en paths then have no file and the
   host answers 404 — the surface does not exist, rather than half-existing. */
const paths = [...new Set(publicRoutes.flatMap((route) => [route.path, ENGLISH_LIVE ? route.enPath : null].filter(Boolean)))];

/* ── a static server over the untouched build (SPA fallback) ───────────── */
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon",
  ".pdf": "application/pdf", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml",
};
const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  let file = normalize(join(DIST, decodeURIComponent(url.pathname)));
  if (!file.startsWith(DIST)) { response.writeHead(403).end(); return; }
  const isAsset = extname(file) !== "" && existsSync(file);
  if (!isAsset) {
    response.writeHead(200, { "content-type": TYPES[".html"] });
    response.end(template);
    return;
  }
  response.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  response.end(readFileSync(file));
});
await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
const origin = `http://127.0.0.1:${server.address().port}`;

/* ── capture ───────────────────────────────────────────────────────────── */
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {},
);
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
await context.addInitScript(() => {
  try { window.localStorage.setItem("mas_prose_reveal", "off"); } catch { /* storage blocked */ }
});
await context.route((url) => !url.href.startsWith(origin), (route) => route.abort());

async function capture(path) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error.message).slice(0, 200)));
  await page.goto(origin + path, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForFunction(
    () => !document.querySelector('[data-shell-state="loading"]') && !!document.querySelector("main"),
    undefined,
    { timeout: 30_000 },
  ).catch(async () => {
    const seen = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 160)).catch(() => "?");
    throw new Error(`[prerender] ${path}: no rendered <main> within 30 s — page shows "${seen}"${errors.length ? `, error: ${errors[0]}` : ""}`);
  });
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);
  await page.evaluate(async () => {
    await document.fonts?.ready;
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
  });
  const result = await page.evaluate(() => {
    const rootNode = document.getElementById("root").cloneNode(true);
    rootNode.querySelectorAll("iframe, [data-custom-cursor], [data-route-curtain]").forEach((node) => node.remove());
    const pick = (selector) => [...document.head.querySelectorAll(selector)].map((node) => node.outerHTML);
    /* The route's own stylesheets (Vite links them when the route chunk
       loads). Without them the snapshot painted unstyled bits and the page
       shifted 74–80 px when the CSS arrived (CLS 0.05–0.09 in the lab). */
    const stylesheets = [...document.head.querySelectorAll('link[rel="stylesheet"]')]
      .map((node) => node.getAttribute("href"))
      .filter((href) => href && href.startsWith("/assets/"));
    return {
      stylesheets,
      html: rootNode.innerHTML,
      lang: document.documentElement.lang || "tr",
      title: document.title,
      head: [
        ...pick('meta[name="description"]'),
        ...pick('meta[name="robots"]'),
        ...pick('link[rel="canonical"]'),
        ...pick('link[rel="alternate"][hreflang]'),
        ...pick('meta[property^="og:"]'),
        ...pick('meta[name^="twitter:"]'),
        ...pick('script[type="application/ld+json"]'),
      ],
      notFound: !!document.querySelector(".shell-notfound"),
      hasMain: !!document.querySelector("main"),
    };
  });
  await page.close();
  if (errors.length) throw new Error(`[prerender] ${path}: page error — ${errors[0]}`);
  return result;
}

const escapeHtml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function compose({ html, lang, title, head, stylesheets = [] }) {
  let out = template
    // data-first-view: entrance animations wait for a client navigation (polish.css).
    .replace(/<html lang="[^"]*"/, `<html lang="${lang}" data-first-view`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    // Head tags the page sets itself replace the template's generic ones.
    .replace(/\s*<meta\s+name="description"[\s\S]*?\/?>/g, "")
    .replace(/\s*<meta\s+name="robots"[\s\S]*?\/?>/g, "")
    .replace(/\s*<link\s+rel="canonical"[^>]*>/g, "")
    .replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]*"[^>]*>/g, "")
    .replace(/\s*<meta\s+property="og:[\s\S]*?\/?>/g, "")
    .replace(/\s*<meta\s+name="twitter:[\s\S]*?\/?>/g, "")
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
  /* The build preloads the landing hero on every page (vite.config.ts,
     heroPreloadPlugin): right for the SPA shell, 64 KB of wasted bandwidth on
     a prerendered inner page. A snapshot keeps an image preload only when its
     own markup uses that image. (Moving it ahead of the module script was
     measured too and changed nothing — C4 notes.) */
  out = out.replace(/\s*<link rel="preload" as="image"[^>]*href="([^"]+)"[^>]*>/g, (tag, href) =>
    (html.includes(`src="${href}"`) ? tag : ""));
  const styles = stylesheets
    .filter((href) => !out.includes(`href="${href}"`))
    .map((href) => `<link rel="stylesheet" crossorigin href="${href}">`);
  out = out.replace("</head>", `    ${[...styles, ...head].join("\n    ")}\n  </head>`);
  return out.replace('<div id="root"></div>', `<div id="root" data-prerendered>${html}</div>`);
}

const outFile = (path) => (path === "/" ? join(DIST, "index.html") : join(DIST, `${path.slice(1)}.html`));

const queue = [...paths];
let done = 0;
const started = Date.now();
async function worker() {
  while (queue.length) {
    const path = queue.shift();
    const page = await capture(path);
    if (!page.hasMain) throw new Error(`[prerender] ${path}: no <main>`);
    if (page.notFound) throw new Error(`[prerender] ${path}: rendered the not-found page — the route table and the app disagree`);
    const file = outFile(path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, compose(page));
    done += 1;
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

/* 404: rendered once from a path no route claims, served with HTTP 404. */
const notFound = await capture("/__mas-prerender-not-found__");
if (!notFound.notFound) throw new Error("[prerender] the not-found capture did not render the not-found page");
writeFileSync(join(DIST, "404.html"), compose(notFound));

/* The empty shell for panel and auth routes: never prerendered content. */
writeFileSync(join(DIST, "shell.html"), template);

await browser.close();
server.close();

/* robots.txt and sitemap.xml follow the indexing decision. A preview build
   (no origin, or VITE_SITE_INDEXING not `public`) asks crawlers to stay out
   and has no sitemap; a public build lists exactly the prerendered routes,
   with language pairs only when English ships. */
if (INDEXABLE) {
  const xmlEscape = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const absolute = (path) => `${ORIGIN}${encodeURI(path === "/" ? "/" : path)}`;
  const entries = publicRoutes.map((route) => {
    const alternates = ENGLISH_LIVE && route.enPath
      ? [
        `    <xhtml:link rel="alternate" hreflang="tr" href="${xmlEscape(absolute(route.path))}"/>`,
        `    <xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(absolute(route.enPath))}"/>`,
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(absolute(route.path))}"/>`,
      ]
      : [];
    const urls = [route.path, ...(ENGLISH_LIVE && route.enPath ? [route.enPath] : [])];
    return urls.map((path) => [`  <url>`, `    <loc>${xmlEscape(absolute(path))}</loc>`, ...alternates, `  </url>`].join("\n")).join("\n");
  });
  writeFileSync(join(DIST, "sitemap.xml"), [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n"));
  writeFileSync(join(DIST, "robots.txt"), [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /musteri-paneli",
    "",
    `Sitemap: ${ORIGIN}/sitemap.xml`,
    "",
  ].join("\n"));
} else {
  writeFileSync(join(DIST, "robots.txt"), "User-agent: *\nDisallow: /\n");
}

/* RELEASE01 — release.json listed the files as Vite wrote them; the HTML
   changed and new files exist now, so the file map is recomputed (commit and
   build time are kept: this is the same build). */
const releasePath = join(DIST, "release.json");
const release = JSON.parse(readFileSync(releasePath, "utf8"));
const files = {};
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    const name = relative(DIST, full).split(sep).join("/");
    if (name === "release.json" || name.startsWith(".vite/")) continue;
    const data = readFileSync(full);
    files[name] = { sha256: createHash("sha256").update(data).digest("hex"), bytes: data.byteLength };
  }
};
walk(DIST);
writeFileSync(releasePath, `${JSON.stringify({ ...release, files, prerendered: done + 1 }, null, 2)}\n`);
console.log(`[prerender] ${done} routes + 404 + shell in ${((Date.now() - started) / 1000).toFixed(1)} s · english ${ENGLISH_LIVE ? "live" : "off"} · ${INDEXABLE ? `public (${ORIGIN}), sitemap written` : "preview (robots: Disallow /)"}`);
