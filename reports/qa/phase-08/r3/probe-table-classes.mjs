/** QA round 3 — which routes have tables, and what actually wraps them.
 *  Coverage check for the new guard: `.shell-table-scroll` is the shell
 *  primitive's class, but a table with a different wrapper falls outside a walk
 *  keyed on it. Round 2 measured an overflowing region on `/malzemeler`; the
 *  guard's walk reports zero regions there, so one of the two is wrong. */
import { chromium } from "playwright";

const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4205";
const ROUTES = ["/", "/sss", "/gizlilik-politikasi", "/kvkk", "/cerez-politikasi", "/hakkimizda",
  "/iletisim", "/malzemeler", "/malzemeler/aluminyum", "/blog",
  "/blog/havacilik-parcalarinda-malzeme-secimi", "/kabiliyet-profilleri",
  "/kabiliyet-profilleri/ince-cidarli-aluminyum-govde", "/kalite-dosyasi",
  "/hizmetler/kategori/talasli-imalat", "/hizmetler/cnc-frezeleme", "/kabiliyetler/kalite-kontrol",
  "/endustriyel/havacilik", "/giris", "/sifremi-unuttum", "/reset-password", "/teklif-al"];

const b = await chromium.launch({ executablePath: EXE });
const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const out = {};

for (const route of ROUTES) {
  await p.goto(BASE + route, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(900);
  out[route] = await p.evaluate(() => [...document.querySelectorAll("table")].map((t) => {
    let el = t.parentElement;
    let container = null;
    while (el) {
      const ox = getComputedStyle(el).overflowX;
      if (ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip") { container = el; break; }
      el = el.parentElement;
    }
    const r = t.getBoundingClientRect();
    const before = container ? container.scrollLeft : 0;
    let forced = null;
    if (container) { container.scrollLeft = 9999; forced = container.scrollLeft; container.scrollLeft = before; }
    return {
      caption: t.querySelector("caption")?.textContent?.trim().slice(0, 40) || null,
      tableW: +r.width.toFixed(1),
      tableRight: +r.right.toFixed(1),
      container: container ? container.tagName.toLowerCase() + "." + String(container.className).trim().split(/\s+/).join(".") : null,
      containerOverflowX: container ? getComputedStyle(container).overflowX : null,
      containerClient: container ? container.clientWidth : null,
      containerScroll: container ? container.scrollWidth : null,
      containerRight: container ? +container.getBoundingClientRect().right.toFixed(1) : null,
      forcedScrollLeft: forced,
      isShellTableScroll: container ? container.classList.contains("shell-table-scroll") : false,
      tabindex: container ? container.getAttribute("tabindex") : null,
    };
  }));
}

await b.close();
console.log(JSON.stringify(out, null, 2));
