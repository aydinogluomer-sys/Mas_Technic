/**
 * RELEASE01 — does a served site match a build?
 *
 *   node scripts/quality/verify-release.mjs --base https://candidate.example \
 *     [--dist dist] [--out report.json]
 *
 * 1. Fetches `/release.json` from the host and compares it with
 *    `<dist>/release.json` (commit, build time, file set).
 * 2. Fetches every file the release lists and checks its sha256 against the
 *    release, plus its content-type and cache-control.
 * 3. Checks HTTP behaviour the SPA cannot fix on its own: an unknown path
 *    (HTTP status vs the client 404), `/robots.txt`, a deep route served as
 *    `index.html`, and `index.html`'s build meta.
 *
 * A host behind Vercel deployment protection is reached with the project's
 * "Protection Bypass for Automation" secret in VERCEL_AUTOMATION_BYPASS_SECRET
 * (sent as `x-vercel-protection-bypass` to the checked host only).
 *
 * It prints and returns findings; it never deploys, publishes or merges.
 * Run against the candidate URL only when one exists (owner input O01).
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, value, index, all) => {
    if (value.startsWith("--")) pairs.push([value.slice(2), all[index + 1]]);
    return pairs;
  }, []),
);
if (!args.base) {
  console.error("usage: verify-release.mjs --base <url> [--dist dist] [--out file]");
  process.exit(2);
}
const BASE = args.base.replace(/\/$/, "");
const DIST = args.dist ?? "dist";
const local = JSON.parse(readFileSync(`${DIST}/release.json`, "utf8"));
const findings = [];
const note = (level, message) => findings.push({ level, message });
const sha = (buffer) => createHash("sha256").update(buffer).digest("hex");
const EXPECTED_TYPE = { ".js": "javascript", ".css": "text/css", ".html": "text/html", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".json": "application/json", ".woff2": "font/woff2", ".ico": "image" };

const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const fetch = (url, init = {}) =>
  globalThis.fetch(url, { ...init, headers: { ...init.headers, ...(BYPASS ? { "x-vercel-protection-bypass": BYPASS } : {}) } });

const fetchFile = async (path) => {
  const response = await fetch(`${BASE}/${path.replace(/^\//, "")}`, { headers: { "accept-encoding": "gzip, br" } });
  return { status: response.status, type: response.headers.get("content-type") ?? "", cache: response.headers.get("cache-control") ?? "", body: Buffer.from(await response.arrayBuffer()) };
};

const served = await fetchFile("release.json");
if (served.status !== 200) note("fail", `/release.json answered ${served.status}`);
else {
  const remote = JSON.parse(served.body.toString("utf8"));
  if (remote.commit !== local.commit) note("fail", `commit differs: served ${remote.commit}, local ${local.commit}`);
  if (remote.builtAt !== local.builtAt) note("fail", `build time differs: served ${remote.builtAt}, local ${local.builtAt}`);
  const missing = Object.keys(local.files).filter((name) => !(name in remote.files));
  if (missing.length) note("fail", `served release lacks ${missing.length} files, e.g. ${missing.slice(0, 3).join(", ")}`);
}

/* C2/C3 — prerendered pages are served at clean URLs (vercel.json
   cleanUrls): `hizmetler/x.html` is requested as `/hizmetler/x`. Two files
   are not routes of their own: 404.html is what an unknown path answers
   (with status 404) and shell.html is what panel/auth paths answer. */
const SPECIAL = { "404.html": { path: "__release-check-not-a-route__", status: 404 }, "shell.html": { path: "admin", status: 200 } };
const servedAt = (name) => {
  if (SPECIAL[name]) return SPECIAL[name];
  if (name === "index.html") return { path: "", status: 200 };
  if (name.endsWith(".html")) return { path: name.replace(/\.html$/, ""), status: 200 };
  return { path: name, status: 200 };
};

let checked = 0;
for (const [name, facts] of Object.entries(local.files)) {
  const target = servedAt(name);
  const file = await fetchFile(target.path);
  checked += 1;
  if (file.status !== target.status) { note("fail", `${name}: HTTP ${file.status} at /${target.path} (expected ${target.status})`); continue; }
  if (sha(file.body) !== facts.sha256) note("fail", `${name}: sha256 differs from the build`);
  const extension = name.slice(name.lastIndexOf("."));
  if (EXPECTED_TYPE[extension] && !file.type.includes(EXPECTED_TYPE[extension])) note("fail", `${name}: content-type "${file.type}"`);
  if (name.startsWith("assets/") && !/max-age=\d{6,}|immutable/.test(file.cache)) note("warn", `${name}: hashed asset without long cache ("${file.cache}")`);
  if (name === "index.html" && /immutable|max-age=[1-9]\d{4,}/.test(file.cache)) note("fail", `index.html cached long ("${file.cache}") — a deploy would not be seen`);
}

const unknown = await fetch(`${BASE}/__release-check-not-a-route__`);
if (unknown.status !== 404) note("fail", `unknown path answers HTTP ${unknown.status}; vercel.json serves 404.html with 404`);
const redirect = await fetch(`${BASE}/kabiliyetler/cnc-frezeleme`, { redirect: "manual" });
if (![301, 308].includes(redirect.status) || !(redirect.headers.get("location") ?? "").endsWith("/hizmetler/cnc-frezeleme")) {
  note("fail", `wrong-family address answered ${redirect.status} → ${redirect.headers.get("location")} (expected a permanent redirect to /hizmetler/cnc-frezeleme)`);
}
const deep = await fetch(`${BASE}/hizmetler/cnc-frezeleme`);
if (deep.status !== 200 || !(deep.headers.get("content-type") ?? "").includes("text/html")) note("fail", `deep route answered ${deep.status} ${deep.headers.get("content-type")}`);
const robots = await fetch(`${BASE}/robots.txt`);
if (robots.status !== 200) note("fail", `/robots.txt answered ${robots.status}`);
const html = (await (await fetch(`${BASE}/`)).text());
if (!html.includes(`name="mas-build" content="${local.commit} ${local.builtAt}"`)) note("fail", "index.html build meta does not match release.json");

const report = { checkedAt: new Date().toISOString(), base: BASE, commit: local.commit, builtAt: local.builtAt, filesChecked: checked, findings };
if (args.out) writeFileSync(args.out, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(findings.some((finding) => finding.level === "fail") ? 1 : 0);
