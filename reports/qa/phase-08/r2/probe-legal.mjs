/**
 * QA round 2 — the legal texts, read out of the RENDERED DOM, not the source.
 *
 * Emits, per legal route: every clause's heading and full innerText, every
 * anchor with its raw href, and for /cerez-politikasi the storage table cell
 * by cell. Layout of the five-row table is measured separately at 375/768/1280
 * (cell rects, overflow, wrapping) because no golden covers the legal routes
 * (`e2e/visual/wave-b-golden.spec.ts:37` says so deliberately).
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4173";
const SHOTS = "C:/Users/Trade Bilisim/pdh-wt/qa-p08/reports/qa/phase-08/r2/shots";
mkdirSync(SHOTS, { recursive: true });

const ROUTES = ["/kvkk", "/cerez-politikasi", "/gizlilik-politikasi"];
const browser = await chromium.launch({ executablePath: EXE });
const out = {};

for (const route of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  out[route] = await page.evaluate(() => {
    const main = document.querySelector("main");
    const clauses = [...document.querySelectorAll("main section, main article")].map((s) => ({
      heading: (s.querySelector("h2,h3")?.textContent || "").trim(),
      text: (s.innerText || "").trim(),
      anchors: [...s.querySelectorAll("a")].map((a) => ({
        text: (a.textContent || "").trim(),
        href: a.getAttribute("href"),
        resolved: a.href,
        hasHash: (a.getAttribute("href") || "").includes("#"),
      })),
    }));
    return {
      h1: [...document.querySelectorAll("main h1")].map((h) => h.textContent.trim()),
      fullText: main ? main.innerText : "",
      clauseCount: clauses.length,
      clauses,
      allAnchors: [...document.querySelectorAll("main a")].map((a) => ({
        text: (a.textContent || "").trim(), href: a.getAttribute("href"),
      })),
      tables: [...document.querySelectorAll("main table")].map((t) => ({
        caption: (t.querySelector("caption")?.textContent || "").trim(),
        head: [...t.querySelectorAll("thead th")].map((th) => th.textContent.trim()),
        rows: [...t.querySelectorAll("tbody tr")].map((tr) =>
          [...tr.querySelectorAll("th,td")].map((c) => c.textContent.trim())),
      })),
    };
  });
  await ctx.close();
}

// ── the five-row table's LAYOUT at three widths ────────────────────────────
out.tableLayout = {};
for (const vp of [{ n: "375", w: 375, h: 812 }, { n: "768", w: 768, h: 1024 }, { n: "1280", w: 1280, h: 900 }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/cerez-politikasi`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const table = page.locator("main table").first();
  await table.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  out.tableLayout[vp.n] = await page.evaluate(() => {
    const t = document.querySelector("main table");
    if (!t) return null;
    const wrap = t.parentElement;
    const tr = [...t.querySelectorAll("tbody tr")];
    const docOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    return {
      tableRect: (({ x, y, width, height }) => ({ x: +x.toFixed(1), y: +y.toFixed(1), w: +width.toFixed(1), h: +height.toFixed(1) }))(t.getBoundingClientRect()),
      wrapClass: wrap?.className,
      wrapOverflowX: wrap ? getComputedStyle(wrap).overflowX : null,
      wrapScrollW: wrap?.scrollWidth,
      wrapClientW: wrap?.clientWidth,
      tableLayoutProp: getComputedStyle(t).tableLayout,
      docHorizontalOverflow: docOverflow,
      headCells: [...t.querySelectorAll("thead th")].map((th) => {
        const r = th.getBoundingClientRect();
        return { text: th.textContent.trim(), w: +r.width.toFixed(1), align: getComputedStyle(th).textAlign };
      }),
      rows: tr.map((row) => {
        const cells = [...row.querySelectorAll("th,td")];
        return {
          key: cells[0]?.textContent.trim(),
          rowH: +row.getBoundingClientRect().height.toFixed(1),
          cells: cells.map((c) => {
            const r = c.getBoundingClientRect();
            const cs = getComputedStyle(c);
            return {
              w: +r.width.toFixed(1), h: +r.height.toFixed(1),
              align: cs.textAlign,
              font: cs.fontFamily.split(",")[0].replace(/"/g, ""),
              size: cs.fontSize,
              chars: c.textContent.trim().length,
              lines: Math.round(r.height / parseFloat(cs.lineHeight || "0") || 0),
              overflowing: c.scrollWidth > c.clientWidth + 1,
            };
          }),
        };
      }),
    };
  });
  await table.screenshot({ path: `${SHOTS}/cerez-table-${vp.n}.png` }).catch(async () => {
    await page.screenshot({ path: `${SHOTS}/cerez-table-${vp.n}.png`, fullPage: false });
  });
  // and the whole madde 02 block in context
  await page.screenshot({ path: `${SHOTS}/cerez-viewport-${vp.n}.png` });
  await ctx.close();
}

await browser.close();
writeFileSync("C:/Users/Trade Bilisim/pdh-wt/qa-p08/reports/qa/phase-08/r2/legal-rendered.json", JSON.stringify(out, null, 2));
console.log("written");
