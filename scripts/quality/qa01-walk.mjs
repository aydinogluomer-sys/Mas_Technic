/**
 * QA01 — public route walk. Every public route in
 * `docs/quality/mas-technic-awwwards/routes.json`, in Turkish and English,
 * at 375 and 1440, with and without reduced motion:
 *
 *   · runtime exceptions (pageerror) and blank roots
 *   · document-level horizontal overflow
 *   · internal links: collected, then every distinct target resolved
 *   · locale mixing: an /en page links only to /en pages (and vice versa),
 *     apart from the language switch and shared files
 *   · axe-core serious/critical findings (normal motion, both widths)
 *
 *   PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium \
 *   node scripts/quality/qa01-walk.mjs --base http://127.0.0.1:4181 \
 *     --out docs/quality/mas-technic-awwwards/evidence/qa01-walk.json
 *
 * Third-party hosts this sandbox cannot reach (Google Fonts, the placeholder
 * Supabase project) are aborted so they are not counted as page errors; the
 * report lists them. Chromium only — Firefox and WebKit are not installed in
 * this environment (FAIL_INFRA, see status.md).
 */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync, writeFileSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, value, index, all) => {
    if (value.startsWith("--")) pairs.push([value.slice(2), all[index + 1]]);
    return pairs;
  }, []),
);
const BASE = args.base ?? "http://127.0.0.1:4181";
const manifest = JSON.parse(readFileSync("docs/quality/mas-technic-awwwards/routes.json", "utf8"));
const PUBLIC_AUTH = new Set(["/giris", "/sifremi-unuttum", "/reset-password"]);
const routes = manifest.routes
  .filter((route) => route.access === "public" || PUBLIC_AUTH.has(route.path))
  .flatMap((route) => [route.path, route.enPath].filter(Boolean));
const ROUTES = [...new Set(routes)];
const BLOCKED = /fonts\.(googleapis|gstatic)\.com|supabase\.co|calendar\.(google|app\.google)\.com/;
const COMBOS = [
  { width: 375, height: 812, motion: "no-preference", axe: true },
  { width: 1440, height: 900, motion: "no-preference", axe: true },
  { width: 375, height: 812, motion: "reduce", axe: false },
  { width: 1440, height: 900, motion: "reduce", axe: false },
];
const SHARED_FILE = /^\/(belgeler|assets)\//;

const isEn = (path) => /^\/en(\/|$)/.test(path);

async function walkRoute(context, route, axe) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error.message).slice(0, 200)));
  await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
  await page.waitForFunction(() => (document.querySelector("#root")?.textContent ?? "").trim().length > 40, undefined, { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(250);
  const facts = await page.evaluate(() => {
    const root = document.querySelector("#root");
    const links = [...document.querySelectorAll("a[href]")]
      .map((anchor) => ({
        href: anchor.getAttribute("href") ?? "",
        lang: anchor.getAttribute("hreflang") ?? anchor.closest("[data-lang-switch],.lang-dropdown,.lang-switch,[class*='lang-']") ? "switch" : "",
      }))
      .filter((link) => link.href.startsWith("/") && !link.href.startsWith("//"));
    return {
      rootText: (root?.textContent ?? "").trim().length,
      h1: document.querySelectorAll("h1").length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      notFound: /ERR::PAGE_NOT_FOUND|Sayfa Bulunamadı|Page Not Found/.test(document.body.innerText),
      htmlLang: document.documentElement.lang,
      links,
    };
  });
  let axeFindings = [];
  if (axe) {
    const result = await new AxeBuilder({ page }).analyze();
    axeFindings = result.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.slice(0, 5).map((node) => node.target.join(" ")) }));
  }
  await page.close();
  const english = isEn(route);
  const localeMix = facts.links
    .filter((link) => link.lang !== "switch" && !SHARED_FILE.test(link.href))
    .filter((link) => (english ? !isEn(link.href) : isEn(link.href)))
    .map((link) => link.href);
  return {
    route,
    errors,
    blank: facts.rootText <= 40,
    h1: facts.h1,
    overflow: facts.overflow,
    notFound: facts.notFound,
    htmlLang: facts.htmlLang,
    langMismatch: english ? facts.htmlLang !== "en" : facts.htmlLang === "en",
    localeMix: [...new Set(localeMix)],
    links: [...new Set(facts.links.map((link) => link.href.split("#")[0].split("?")[0]))],
    axe: axeFindings,
  };
}

const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {});
const runs = [];
for (const combo of COMBOS) {
  const context = await browser.newContext({ viewport: { width: combo.width, height: combo.height }, reducedMotion: combo.motion });
  await context.route(BLOCKED, (route) => route.abort());
  /* The same switch the e2e suite sets (`playwright.config.ts`): the inner
     pages' scroll reveal fades paragraphs in as they enter the viewport, and
     axe measuring a paragraph mid-fade reports a contrast failure that no
     reader sees. Reduced-motion runs never animate it anyway. */
  await context.addInitScript(() => { try { localStorage.setItem("mas_prose_reveal", "off"); } catch {} });
  const results = [];
  for (const route of ROUTES) results.push(await walkRoute(context, route, combo.axe));
  await context.close();
  runs.push({ ...combo, results });
  const bad = results.filter((r) => r.errors.length || r.blank || r.overflow > 0 || r.notFound || r.langMismatch || r.localeMix.length || r.axe.length);
  console.log(`${combo.width} ${combo.motion}: ${results.length} routes, ${bad.length} with findings`);
}

/* Dead internal links: every distinct target that is not itself a walked
   route is opened once and must not render the not-found view. */
const walked = new Set(ROUTES);
const targets = new Set(runs.flatMap((run) => run.results.flatMap((result) => result.links)));
const unknown = [...targets].filter((href) => !walked.has(href) && !SHARED_FILE.test(href));
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.route(BLOCKED, (route) => route.abort());
const deadLinks = [];
for (const href of unknown) {
  const page = await context.newPage();
  await page.goto(BASE + href, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  const notFound = await page.evaluate(() => /ERR::PAGE_NOT_FOUND|Sayfa Bulunamadı|Page Not Found/.test(document.body.innerText));
  if (notFound) deadLinks.push(href);
  await page.close();
}
const files = [...targets].filter((href) => SHARED_FILE.test(href));
for (const href of files) {
  const response = await context.request.get(BASE + href);
  if (response.status() !== 200) deadLinks.push(`${href} (${response.status()})`);
}
await context.close();
await browser.close();

const all = runs.flatMap((run) => run.results.map((result) => ({ ...result, width: run.width, motion: run.motion })));
const summary = {
  routes: ROUTES.length,
  pageLoads: all.length,
  runtimeErrors: all.filter((r) => r.errors.length).map((r) => `${r.route} @${r.width} ${r.motion}: ${r.errors[0]}`),
  blankRoots: all.filter((r) => r.blank).map((r) => `${r.route} @${r.width} ${r.motion}`),
  overflow: all.filter((r) => r.overflow > 0).map((r) => `${r.route} @${r.width} ${r.motion}: ${r.overflow}px`),
  unexpectedNotFound: all.filter((r) => r.notFound && !/yok-boyle|not-a-route/.test(r.route)).map((r) => `${r.route} @${r.width}`),
  missingH1: all.filter((r) => r.h1 !== 1).map((r) => `${r.route} @${r.width}: ${r.h1}`),
  langMismatch: all.filter((r) => r.langMismatch).map((r) => `${r.route} @${r.width}`),
  localeMix: all.filter((r) => r.localeMix.length).map((r) => `${r.route} @${r.width}: ${r.localeMix.slice(0, 3).join(", ")}`),
  axeSeriousCritical: all.filter((r) => r.axe.length).map((r) => ({ route: r.route, width: r.width, findings: r.axe })),
  internalTargets: targets.size,
  deadLinks,
};
const report = {
  capturedAt: new Date().toISOString(),
  base: BASE,
  scope: "LOCAL_FIXTURE — local vite preview, placeholder Supabase env; Google Fonts, Supabase and Google Calendar aborted. Chromium only.",
  summary,
};
if (args.out) writeFileSync(args.out, JSON.stringify(report, null, 2));
console.log(JSON.stringify(summary, null, 2).slice(0, 4000));
