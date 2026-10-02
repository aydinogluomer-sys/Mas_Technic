/**
 * QA PROBE — 404 catch-all branches.
 * Finds a path that reaches the global NotFound with a POPULATED
 * "YAKIN KAYITLAR" block, and verifies every suggested link resolves to a
 * page that is NOT a not-found body.
 */
import { chromium } from "file:///C:/Users/Trade%20Bilisim/precision-dynamics-hub-main/node_modules/playwright/index.mjs";
const BASE = "http://localhost:4173";
const CANDIDATES = [
  "/kalite-dosyas",
  "/kabiliyet-profileri",
  "/teknik-gunluk",
  "/blog-yazilari",
  "/malzemelerr",
  "/zzzz",
  "/iletisim-formu",
];

const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });

async function inspect(path) {
  const p = await ctx.newPage();
  await p.goto(BASE + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  const out = await p.evaluate(() => {
    const h1 = document.querySelector("h1")?.innerText.replace(/\s+/g, " ").trim() ?? "";
    const near = document.querySelector("#notfound-near");
    const sec = near?.closest("section");
    const links = sec ? [...sec.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")) : [];
    const meta = [...document.querySelectorAll(".shell-notfound-meta *")].map((n) => n.textContent).join("|");
    return { h1, hasNear: !!near, links, meta };
  });
  await p.close();
  return { path, ...out };
}

const results = [];
for (const c of CANDIDATES) results.push(await inspect(c));
for (const r of results) {
  console.log(`${r.path.padEnd(22)} h1="${r.h1}" near=${r.hasNear} links=${JSON.stringify(r.links)}`);
}

// Resolve every suggestion of the first populated case.
const populated = results.find((r) => r.hasNear && r.links.length > 0);
if (populated) {
  console.log("\n--- resolving suggestions from", populated.path, "---");
  for (const href of populated.links) {
    const p = await ctx.newPage();
    const resp = await p.goto(BASE + href, { waitUntil: "networkidle" });
    await p.waitForTimeout(300);
    const h1 = await p.evaluate(() => document.querySelector("h1")?.innerText.replace(/\s+/g, " ").trim() ?? "(no h1)");
    console.log(`${href.padEnd(48)} http=${resp.status()} h1="${h1}"`);
    await p.close();
  }
} else {
  console.log("\nNO POPULATED NEAREST-RECORD CASE FOUND among candidates");
}
await b.close();
