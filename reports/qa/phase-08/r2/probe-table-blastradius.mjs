/**
 * QA round 2 — how many `ShellSpecTable` surfaces lose columns at 375, and
 * whether the defect is Phase 08's or was inherited from Wave A.
 *
 * For each route: every `.shell-table-scroll` region — its width, whether it
 * can actually scroll, whether the hook granted it a tabindex, and which
 * header cells fall outside the viewport.
 */
import { chromium } from "playwright";
const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4173";

const ROUTES = [
  ["/cerez-politikasi", "PHASE 08"],
  ["/kalite-dosyasi", "PHASE 08"],
  ["/blog/havacilik-parcalarinda-malzeme-secimi", "PHASE 08"],
  ["/kabiliyet-profilleri/ince-cidarli-aluminyum-govde", "PHASE 08"],
  ["/malzemeler", "WAVE A control"],
  ["/hizmetler/cnc-frezeleme", "WAVE A control"],
];

const browser = await chromium.launch({ executablePath: EXE });
const out = {};
const WIDTHS = (process.env.QA_WIDTHS || "375,768").split(",").map(Number);
for (const vpW of WIDTHS) {
  out[vpW] = {};
  const ctx = await browser.newContext({ viewport: { width: vpW, height: 812 } });
  const page = await ctx.newPage();
  for (const [route, owner] of ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1100);
    out[vpW][route] = {
      owner,
      ...(await page.evaluate(() => {
        const regions = [...document.querySelectorAll(".shell-table-scroll")].map((wrap) => {
          const t = wrap.querySelector("table");
          const r = wrap.getBoundingClientRect();
          const heads = t ? [...t.querySelectorAll("thead th")].map((th) => {
            const hr = th.getBoundingClientRect();
            return { text: th.textContent.trim(), right: +hr.right.toFixed(1), offscreen: hr.right > window.innerWidth + 0.5 };
          }) : [];
          return {
            label: t?.getAttribute("aria-label") || "",
            wrapW: +r.width.toFixed(1), wrapX: +r.x.toFixed(1),
            clientW: wrap.clientWidth, scrollW: wrap.scrollWidth,
            canScrollX: wrap.scrollWidth > wrap.clientWidth + 1,
            tabindex: wrap.getAttribute("tabindex"),
            role: wrap.getAttribute("role"),
            columns: heads.length,
            offscreenColumns: heads.filter((h) => h.offscreen).map((h) => h.text),
            rightEdge: +r.right.toFixed(1),
          };
        });
        return {
          viewportW: window.innerWidth,
          docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          regions,
        };
      })),
    };
  }
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
