/**
 * Phase 00 — throwaway landing initial-payload measurement.
 *
 * Loads `/` from the running preview server and reports every JS/CSS/font/image
 * asset the browser actually fetched, with transfer sizes, so the bundle
 * baseline can state which specialist chunks (three/R3F/drei/OCCT/xlsx) do or
 * do not reach the landing route.
 *
 * Requires an already-running preview server (default http://localhost:4173).
 * Usage: node reports/baseline/tools/measure-landing-bundle.mjs [url]
 */
import { existsSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const url = process.argv[2] ?? "http://localhost:4173/";

const executablePath = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => !!c && existsSync(c));

const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

const requested = [];
page.on("response", (response) => {
  const u = new URL(response.url());
  if (u.origin !== new URL(url).origin) return;
  requested.push({ path: u.pathname, status: response.status() });
});

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

const seen = new Map();
for (const entry of requested) {
  if (seen.has(entry.path)) continue;
  const diskPath = join(REPO_ROOT, "dist", entry.path);
  seen.set(entry.path, {
    ...entry,
    bytes: existsSync(diskPath) ? statSync(diskPath).size : null,
  });
}

const rows = [...seen.values()];
const js = rows.filter((r) => r.path.endsWith(".js"));
const css = rows.filter((r) => r.path.endsWith(".css"));
const media = rows.filter((r) => /\.(webp|png|jpe?g|svg|avif|woff2?)$/.test(r.path));

const sum = (list) => list.reduce((total, r) => total + (r.bytes ?? 0), 0);

console.log(`URL: ${url}`);
console.log(`TOTAL_REQUESTS_SAME_ORIGIN: ${rows.length}`);
console.log(`INITIAL_JS_CHUNKS: ${js.length}   INITIAL_JS_RAW_BYTES: ${sum(js)} (${(sum(js) / 1024).toFixed(1)} kB)`);
console.log(`INITIAL_CSS: ${css.length}   RAW_BYTES: ${sum(css)} (${(sum(css) / 1024).toFixed(1)} kB)`);
console.log(`INITIAL_MEDIA/FONT: ${media.length}   RAW_BYTES: ${sum(media)} (${(sum(media) / 1024).toFixed(1)} kB)`);
console.log("");
console.log("## JS actually fetched by the landing route (raw kB, descending)");
for (const r of js.sort((a, b) => (b.bytes ?? 0) - (a.bytes ?? 0))) {
  console.log(`${String(((r.bytes ?? 0) / 1024).toFixed(2)).padStart(9)} kB  ${String(r.status).padStart(3)}  ${r.path}`);
}
console.log("");
console.log("## CSS / media / font");
for (const r of [...css, ...media].sort((a, b) => (b.bytes ?? 0) - (a.bytes ?? 0))) {
  console.log(`${String(((r.bytes ?? 0) / 1024).toFixed(2)).padStart(9)} kB  ${String(r.status).padStart(3)}  ${r.path}`);
}
console.log("");
console.log("## Specialist-bundle presence check on the landing route");
for (const needle of ["three", "OBJLoader", "drei", "occt", "xlsx", "AdminDashboard", "MusteriPaneli", "ChatBot", "servicePages", "materialsData", "LegacyLanding"]) {
  const hit = rows.filter((r) => r.path.toLowerCase().includes(needle.toLowerCase()));
  console.log(`${needle.padEnd(16)} ${hit.length ? `LOADED (${hit.map((h) => h.path).join(", ")})` : "not loaded"}`);
}
console.log("");
console.log("## Non-200 same-origin responses");
const bad = rows.filter((r) => r.status >= 400);
console.log(bad.length ? bad.map((r) => `${r.status} ${r.path}`).join("\n") : "(none)");

await browser.close();
