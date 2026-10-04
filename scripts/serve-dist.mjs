/**
 * C3 — serve dist/ the way Vercel will, from vercel.json.
 *
 *   node scripts/serve-dist.mjs [--port 4173] [--host 127.0.0.1] [--dir dist]
 *   (= npm run preview)
 *
 * Implements the subset of Vercel's static routing this site uses, in
 * Vercel's order: redirects → filesystem (cleanUrls, trailingSlash:false) →
 * rewrites → dist/404.html with status 404. Headers are applied from the same
 * file, and text responses are gzipped like a production host (PERF01's lab
 * runs used scripts/quality/serve-gzip.mjs for the same reason).
 *
 * It exists so that the e2e suite and the lab measurements run against the
 * exact routing that ships — prerendered files, real 404 statuses, 301s —
 * instead of `vite preview`'s blanket index.html fallback. It is a local
 * stand-in, not a claim about the live host: the live check is
 * scripts/quality/verify-release.mjs against the deployed URL.
 */
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, value, index, all) => {
    if (value.startsWith("--")) pairs.push([value.slice(2), all[index + 1]]);
    return pairs;
  }, []),
);
const root = resolve(import.meta.dirname, "..");
const DIST = resolve(root, args.dir ?? "dist");
const PORT = Number(args.port ?? process.env.PORT ?? 4173);
const HOST = args.host ?? "127.0.0.1";
const config = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".avif": "image/avif", ".png": "image/png",
  ".jpg": "image/jpeg", ".ico": "image/x-icon", ".pdf": "application/pdf", ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".webmanifest": "application/manifest+json",
};
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".svg", ".txt", ".xml"]);

/** path-to-regexp subset: `:name`, `:name*`, and raw regex groups. */
function compile(source) {
  let pattern = "";
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (char === ":") {
      const name = source.slice(i + 1).match(/^\w+/)[0];
      i += name.length;
      if (source[i + 1] === "*") { pattern += "(.*)"; i += 1; } else pattern += "([^/]+)";
    } else if (char === "(") {
      let depth = 0;
      let j = i;
      for (; j < source.length; j += 1) {
        if (source[j] === "(") depth += 1;
        if (source[j] === ")" && --depth === 0) break;
      }
      pattern += source.slice(i, j + 1);
      i = j;
    } else pattern += char.replace(/[.+?^${}|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${pattern}$`);
}

const redirects = (config.redirects ?? []).map((rule) => ({ ...rule, re: compile(rule.source) }));
const rewrites = (config.rewrites ?? []).map((rule) => ({ ...rule, re: compile(rule.source) }));
const headerRules = (config.headers ?? []).map((rule) => ({ ...rule, re: compile(rule.source) }));

const fileFor = (pathname) => {
  const target = normalize(join(DIST, pathname));
  if (!target.startsWith(DIST)) return null;
  return existsSync(target) && statSync(target).isFile() ? target : null;
};

function resolveFile(pathname) {
  if (pathname === "/") return fileFor("/index.html");
  if (extname(pathname)) return fileFor(pathname);
  return fileFor(`${pathname}.html`) ?? fileFor(`${pathname}/index.html`);
}

function send(request, response, status, file, extraHeaders = {}) {
  const extension = extname(file);
  let body = readFileSync(file);
  const headers = { "content-type": TYPES[extension] ?? "application/octet-stream", ...extraHeaders };
  if (COMPRESSIBLE.has(extension) && /\bgzip\b/.test(String(request.headers["accept-encoding"] ?? ""))) {
    body = gzipSync(body, { level: 6 });
    headers["content-encoding"] = "gzip";
    headers.vary = "accept-encoding";
  }
  response.writeHead(status, headers);
  response.end(request.method === "HEAD" ? undefined : body);
}

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  let raw = url.pathname;
  let pathname;
  try { pathname = decodeURIComponent(raw); } catch { response.writeHead(400).end(); return; }

  const headersFor = (path) => Object.fromEntries(
    headerRules.filter((rule) => rule.re.test(path)).flatMap((rule) => rule.headers.map((h) => [h.key.toLowerCase(), h.value])),
  );

  // 1. redirects (matched against the path as sent and as decoded)
  for (const rule of redirects) {
    if (rule.re.test(raw) || rule.re.test(pathname)) {
      response.writeHead(rule.permanent ? 308 : 307, { location: rule.destination + url.search });
      response.end();
      return;
    }
  }
  // trailingSlash:false and cleanUrls: canonicalise before serving
  if (config.trailingSlash === false && pathname.length > 1 && pathname.endsWith("/")) {
    response.writeHead(308, { location: pathname.replace(/\/+$/, "") + url.search });
    response.end();
    return;
  }
  if (config.cleanUrls && pathname.endsWith(".html")) {
    const clean = pathname === "/index.html" ? "/" : pathname.replace(/(\/index)?\.html$/, "");
    response.writeHead(308, { location: clean + url.search });
    response.end();
    return;
  }
  // 2. filesystem
  const direct = resolveFile(pathname);
  if (direct) return send(request, response, 200, direct, headersFor(pathname));
  // 3. rewrites
  for (const rule of rewrites) {
    if (rule.re.test(pathname)) {
      // Like Vercel: with cleanUrls a rewrite to a ".html" path resolves to nothing.
      if (config.cleanUrls && rule.destination.endsWith(".html")) continue;
      const target = resolveFile(rule.destination);
      if (target) return send(request, response, 200, target, headersFor(pathname));
    }
  }
  // 4. not found
  const notFound = fileFor("/404.html");
  if (notFound) return send(request, response, 404, notFound, headersFor(pathname));
  response.writeHead(404, { "content-type": "text/plain" }).end("Not Found");
}).listen(PORT, HOST, () => console.log(`serving ${DIST} like vercel.json on http://${HOST}:${PORT}`));
