/** QA round 3 — the polish question, looked at rather than only computed.
 *  Screenshots the madde 02 table as a reader meets it (scroll position 0 in
 *  the region), and counts REAL rendered text lines per cell using Range
 *  client rects, so "how much of this row is blank in the visible strip" is a
 *  measurement and not an inference from box heights. */
import { chromium } from "playwright";

const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4205";
const WIDTHS = [320, 375, 390, 768];

const b = await chromium.launch({ executablePath: EXE });
const out = [];

for (const w of WIDTHS) {
  const ctx = await b.newContext({
    viewport: { width: w, height: w < 768 ? 812 : 900 },
    hasTouch: w < 768, isMobile: w < 768, deviceScaleFactor: 2,
  });
  const p = await ctx.newPage();
  await p.goto(BASE + "/cerez-politikasi", { waitUntil: "networkidle" });
  await p.waitForTimeout(1000);
  await p.locator("main table").first().scrollIntoViewIfNeeded();
  await p.waitForTimeout(500);
  await p.evaluate(() => { document.querySelector(".shell-table-scroll").scrollLeft = 0; });

  const data = await p.evaluate(() => {
    const lineBoxes = (cell) => {
      const range = document.createRange();
      range.selectNodeContents(cell);
      const rects = [...range.getClientRects()].filter((r) => r.height > 0 && r.width > 0);
      const tops = [...new Set(rects.map((r) => Math.round(r.top)))];
      return { lines: tops.length, textHeight: rects.length ? Math.max(...rects.map((r) => r.bottom)) - Math.min(...rects.map((r) => r.top)) : 0 };
    };
    const table = document.querySelector("main table");
    const port = table.closest(".shell-table-scroll");
    const portRect = port.getBoundingClientRect();
    return {
      viewport: window.innerWidth,
      portWidth: Number(portRect.width.toFixed(1)),
      visibleColumns: [...table.querySelectorAll("thead th")]
        .filter((th) => { const r = th.getBoundingClientRect(); return r.left >= portRect.left - 0.5 && r.right <= portRect.right + 0.5; })
        .map((th) => th.textContent.trim()),
      rows: [...table.querySelectorAll("tbody tr")].map((tr) => {
        const cells = [...tr.querySelectorAll("th,td")];
        const h = tr.getBoundingClientRect().height;
        const per = cells.map((c) => ({ text: c.textContent.trim().slice(0, 26), chars: c.textContent.trim().length, ...lineBoxes(c) }));
        return {
          key: per[0].text,
          rowHeight: Number(h.toFixed(1)),
          textLines: per.map((x) => x.lines),
          firstColumnTextHeight: Number(per[0].textHeight.toFixed(1)),
          blankInVisibleStrip: Number((h - per[0].textHeight).toFixed(1)),
          drivenBy: per.reduce((a, c, i) => (c.lines > per[a].lines ? i : a), 0),
        };
      }),
      tableHeight: Number(table.getBoundingClientRect().height.toFixed(1)),
    };
  });

  const box = await p.locator("figure.shell-table").first().boundingBox();
  await p.screenshot({
    path: `reports/qa/phase-08/r3/shots/table-${w}.png`,
    clip: { x: Math.max(0, box.x - 4), y: Math.max(0, box.y - 4), width: Math.min(w, box.width + 8), height: Math.min(box.height + 8, w < 768 ? 812 : 900) },
  });

  out.push(data);
  await ctx.close();
}

await b.close();
console.log(JSON.stringify(out, null, 2));
