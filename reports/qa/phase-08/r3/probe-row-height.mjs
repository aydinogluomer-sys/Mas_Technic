/** QA round 3 — the polish question. C4 reports the madde 02 rows are very tall
 *  at <=390 with blank space in the visible strip, because the third column
 *  wraps inside the scroll port while only the first column is on screen.
 *  Measure it: per-row height, per-cell height, how much of each row's height
 *  the VISIBLE first column actually uses, and what the same rows measure at
 *  768 where the whole table fits. */
import { chromium } from "playwright";

const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4205";
const WIDTHS = [320, 375, 390, 768, 1280];

const b = await chromium.launch({ executablePath: EXE });
const out = [];

for (const w of WIDTHS) {
  const ctx = await b.newContext({
    viewport: { width: w, height: w < 768 ? 812 : 900 },
    hasTouch: w < 768, isMobile: w < 768, deviceScaleFactor: w < 768 ? 2 : 1,
  });
  const p = await ctx.newPage();
  await p.goto(BASE + "/cerez-politikasi", { waitUntil: "networkidle" });
  await p.waitForTimeout(1000);

  out.push(await p.evaluate(() => {
    const table = document.querySelector("main table");
    const rows = [...table.querySelectorAll("tbody tr")].map((tr) => {
      const cells = [...tr.querySelectorAll("th,td")];
      const rowRect = tr.getBoundingClientRect();
      const cellInfo = cells.map((c) => {
        const r = c.getBoundingClientRect();
        const cs = getComputedStyle(c);
        const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
        const inner = r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        return {
          text: c.textContent.trim().slice(0, 34),
          chars: c.textContent.trim().length,
          height: Number(r.height.toFixed(1)),
          width: Number(r.width.toFixed(1)),
          lines: Math.round(inner / lineHeight),
        };
      });
      const first = cellInfo[0];
      return {
        key: first.text,
        rowHeight: Number(rowRect.height.toFixed(1)),
        firstColumnUsedLines: first.lines,
        tallestCell: cellInfo.reduce((a, c) => (c.lines > a.lines ? c : a)),
        cells: cellInfo,
        blankBelowFirstColumn: Number((rowRect.height - (first.lines * (rowRect.height / Math.max(1, cellInfo.reduce((m, c) => Math.max(m, c.lines), 1)))) ).toFixed(1)),
      };
    });
    return {
      viewport: window.innerWidth,
      tableHeight: Number(table.getBoundingClientRect().height.toFixed(1)),
      documentHeight: Math.round(document.documentElement.scrollHeight),
      rows,
    };
  }));
  await ctx.close();
}

await b.close();
console.log(JSON.stringify(out, null, 2));
