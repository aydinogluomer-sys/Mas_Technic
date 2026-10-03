/**
 * PERF01 — a minimal static server for lab runs: serves a `dist/` directory
 * with gzip (as any production host would) and an SPA fallback to index.html.
 * `vite preview` sends every asset uncompressed, which inflates transfer time
 * under a throttled network profile and makes the lab LCP unrepresentative.
 *
 *   node scripts/quality/serve-gzip.mjs --dir dist --port 4190
 */
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { gzipSync } from "node:zlib";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, value, index, all) => {
    if (value.startsWith("--")) pairs.push([value.slice(2), all[index + 1]]);
    return pairs;
  }, []),
);
const ROOT = args.dir ?? "dist";
const PORT = Number(args.port ?? 4190);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon",
  ".pdf": "application/pdf", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml", ".wasm": "application/wasm",
};
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".svg", ".txt", ".xml", ".wasm"]);
const cache = new Map();

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  let path = normalize(join(ROOT, decodeURIComponent(url.pathname)));
  if (!path.startsWith(normalize(ROOT))) { response.writeHead(403).end(); return; }
  if (!existsSync(path) || statSync(path).isDirectory()) path = join(ROOT, "index.html");
  const extension = extname(path);
  const body = readFileSync(path);
  const headers = { "content-type": TYPES[extension] ?? "application/octet-stream", "cache-control": "no-store" };
  if (COMPRESSIBLE.has(extension) && /\bgzip\b/.test(String(request.headers["accept-encoding"] ?? ""))) {
    if (!cache.has(path)) cache.set(path, gzipSync(body, { level: 9 }));
    response.writeHead(200, { ...headers, "content-encoding": "gzip", vary: "accept-encoding" });
    response.end(cache.get(path));
    return;
  }
  response.writeHead(200, headers);
  response.end(body);
}).listen(PORT, "127.0.0.1", () => console.log(`serving ${ROOT} with gzip on http://127.0.0.1:${PORT}`));
