#!/usr/bin/env node
/**
 * QA PHASE 02 — builds a PERTURBED COPY of dist/ for the probe negative
 * control. The real dist/ and all of src/ are never touched: this copies
 * dist/ into a scratch directory and injects one <style> block into the copy's
 * index.html, after every built stylesheet link so the override wins.
 *
 *   node reports/qa/tools/make-negcontrol-dist.mjs <css-file> <dest-dir>
 */
import { cpSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const [cssFile, dest] = process.argv.slice(2);
if (!cssFile || !dest) {
  console.error("usage: make-negcontrol-dist.mjs <css-file> <dest-dir>");
  process.exit(1);
}
if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
cpSync("dist", dest, { recursive: true });

const indexPath = join(dest, "index.html");
const html = readFileSync(indexPath, "utf8");
const css = readFileSync(cssFile, "utf8");
if (!html.includes("</head>")) {
  console.error("no </head> in dist/index.html");
  process.exit(1);
}
writeFileSync(
  indexPath,
  html.replace("</head>", `<style id="qa-negative-control">\n${css}\n</style>\n</head>`),
  "utf8",
);
console.log(`negative control written: ${dest} (<style> injected from ${cssFile})`);
