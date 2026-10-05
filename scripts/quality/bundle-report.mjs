#!/usr/bin/env node
/**
 * The JavaScript and CSS a cold visit to `/` (and `/en`) loads before any
 * interaction, read from the built `dist/` — no bundle-analyzer package.
 *
 *   node scripts/quality/bundle-report.mjs [--dist dist] [--out report.json]
 *                                          [--forbid vendor-framer,vendor-gsap]
 *
 * Initial graph = the entry script's static-import closure plus the landing
 * route chunk's closure (App adopts the prerendered page as soon as that
 * chunk is in), plus the English dictionary on `/en`. Static imports are
 * followed in the built ESM (`from"./x.js"`, `import"./x.js"`); dynamic
 * `import("./x.js")` is not initial and is listed separately. Stylesheets are
 * the ones the prerendered HTML links. `--forbid` fails (exit 1) when a chunk
 * whose name starts with a forbidden prefix is in an initial graph.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const args = Object.fromEntries(process.argv.slice(2).flatMap((v, i, all) => (v.startsWith("--") ? [[v.slice(2), all[i + 1]]] : [])));
const DIST = args.dist ?? "dist";
const FORBID = (args.forbid ?? "").split(",").filter(Boolean);
const asset = (file) => join(DIST, "assets", file);
const size = (file) => {
  const body = readFileSync(asset(file));
  return { raw: body.length, gz: gzipSync(body, { level: 9 }).length };
};
const kib = (bytes) => Math.round((bytes / 1024) * 10) / 10;

const staticImports = (file) => {
  const code = readFileSync(asset(file), "utf8");
  return [...code.matchAll(/(?:from|import)\s*"\.\/([^"]+\.js)"/g)].map((m) => m[1]);
};
const dynamicImports = (file) => [...readFileSync(asset(file), "utf8").matchAll(/import\(\s*"\.\/([^"]+\.js)"\s*\)/g)].map((m) => m[1]);
const closure = (roots) => {
  const seen = new Set();
  const visit = (file) => {
    if (seen.has(file) || !existsSync(asset(file))) return;
    seen.add(file);
    staticImports(file).forEach(visit);
  };
  roots.forEach(visit);
  return seen;
};

function report(htmlFile, path) {
  const html = readFileSync(join(DIST, htmlFile), "utf8");
  const entry = html.match(/<script type="module"[^>]*src="\/assets\/([^"]+)"/)?.[1];
  const preloadList = [...(html.match(/\[\["modulepreload".*?\]\]/)?.[0]?.matchAll(/"\/assets\/([^"]+)"/g) ?? [])].map((m) => m[1]);
  const route = preloadList.find((file) => /^Index-/.test(file));
  const dictionary = path.startsWith("/en") ? preloadList.find((file) => /^en-[\w-]+\.js$/.test(file)) : undefined;
  // A missing root would undercount the graph and let --forbid pass.
  if (!entry || !route || (path.startsWith("/en") && !dictionary)) {
    throw new Error(`${htmlFile}: initial-graph root not found (entry ${entry}, route ${route}, dictionary ${dictionary})`);
  }
  const js = [...closure([entry, route, dictionary].filter(Boolean))].map((file) => ({ file, ...size(file) })).sort((a, b) => b.gz - a.gz);
  const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="\/assets\/([^"]+\.css)"/g)].map((m) => ({ file: m[1], ...size(m[1]) }));
  const deferred = [...new Set(js.flatMap(({ file }) => dynamicImports(file)))].filter((file) => !js.some((j) => j.file === file)).sort();
  const total = (list) => ({ raw: kib(list.reduce((s, x) => s + x.raw, 0)), gz: kib(list.reduce((s, x) => s + x.gz, 0)) });
  return {
    path,
    entry,
    routeChunk: route,
    js: js.map((x) => ({ file: x.file, rawKiB: kib(x.raw), gzKiB: kib(x.gz) })),
    jsTotalKiB: total(js),
    css: css.map((x) => ({ file: x.file, rawKiB: kib(x.raw), gzKiB: kib(x.gz) })),
    cssTotalKiB: total(css),
    dynamicOnly: deferred,
  };
}

const pages = [["index.html", "/"], ["en.html", "/en"]].filter(([file]) => existsSync(join(DIST, file))).map(([file, path]) => report(file, path));
const violations = pages.flatMap((page) => page.js.filter((x) => FORBID.some((prefix) => x.file.startsWith(prefix))).map((x) => `${page.path}: ${x.file}`));

for (const page of pages) {
  console.log(`${page.path}  JS ${page.jsTotalKiB.gz} KiB gz (${page.jsTotalKiB.raw} raw, ${page.js.length} files) · CSS ${page.cssTotalKiB.gz} KiB gz (${page.css.length} blocking)`);
  for (const x of page.js.slice(0, 8)) console.log(`   ${String(x.gzKiB).padStart(6)} KiB  ${x.file}`);
}
if (args.out) writeFileSync(args.out, JSON.stringify({ capturedAt: new Date().toISOString(), dist: DIST, pages }, null, 2));
if (violations.length) {
  console.error(`forbidden chunks in an initial graph:\n  ${violations.join("\n  ")}`);
  process.exit(1);
}
