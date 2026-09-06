/* QA 09a-R3 — dump the painted text of the routes C3 changed, so the DOM
 * assertions are written against what the page actually paints rather than
 * against what the source implies. Network sealed; nothing is submitted.
 */
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = resolve(ROOT, "reports/qa/phase-09a-r3");
mkdirSync(OUT, { recursive: true });
const BASE = process.env.QA_BASE ?? "http://127.0.0.1:4175";

const candidates = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].filter((p) => p && existsSync(p));

const browser = await chromium.launch(candidates.length ? { executablePath: candidates[0] } : {});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const blocked = [];
await page.route("**/*", async (route, request) => {
  const url = request.url();
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  })();
  if (["localhost", "127.0.0.1", "[::1]"].includes(host) || url.startsWith("data:") || url.startsWith("blob:")) {
    await route.fallback();
    return;
  }
  if (["fonts.googleapis.com", "fonts.gstatic.com"].includes(host) && request.method() === "GET") {
    await route.fallback();
    return;
  }
  blocked.push(`${request.method()} ${url}`);
  await route.abort("blockedbyclient");
});

const ROUTES = [
  "/sss",
  "/hizmetler/cnc-frezeleme",
  "/kabiliyetler/tasarim-rehberi-dfm",
  "/hizmetler/cnc-tornalama",
  "/hizmetler/enjeksiyon-kalibi",
  "/endustriyel/prototip-uretim",
];

const dump = {};
for (const r of ROUTES) {
  await page.goto(BASE + r, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForTimeout(1200);
  const before = await page.evaluate(() => document.body.innerText);
  /* Expand every accordion/details so collapsed FAQ answers are painted. */
  const expanded = await page.evaluate(() => {
    /* The FAQ is native `<details>` (ServiceDetail.tsx:514, SSS.tsx:231), so
       opening it is an attribute, not a click. Clicking the `<summary>` as
       well would toggle it straight back shut — which is what hid every FAQ
       answer from the first dump. */
    const details = [...document.querySelectorAll("details:not([open])")];
    for (const d of details) d.setAttribute("open", "");
    return details.length;
  });
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => document.body.innerText);
  const meta = await page.evaluate(
    () => document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
  );
  dump[r] = { expandedTriggers: expanded, meta, lenBefore: before.length, lenAfter: after.length, text: after };
  console.log(`${r}  triggers=${expanded}  innerText ${before.length} -> ${after.length}`);
}

writeFileSync(resolve(OUT, "dom-dump.json"), `${JSON.stringify({ blocked, dump }, null, 2)}\n`, "utf8");
await browser.close();
console.log(`\noff-origin requests blocked: ${blocked.length}`);
