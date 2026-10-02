/** QA round 3 — the footer band and its four columns, in the browser, at the
 *  four widths, plus the boundary C4 corrected round 2 on (1181, not 1024). */
import { chromium } from "playwright";

const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4205";
const WIDTHS = [375, 768, 1024, 1100, 1180, 1181, 1200, 1280, 1440];

const b = await chromium.launch({ executablePath: EXE });
const out = [];

for (const w of WIDTHS) {
  const ctx = await b.newContext({ viewport: { width: w, height: w < 768 ? 812 : 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(900);
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(900);

  out.push(await p.evaluate(() => {
    const footer = document.querySelector(".tl-footer");
    const nav = footer?.querySelector("nav");
    const h = footer ? footer.getBoundingClientRect().height : null;
    const columns = nav ? [...nav.querySelectorAll(":scope > *")].map((col) => ({
      title: col.querySelector("h3")?.textContent?.trim() ?? null,
      links: [...col.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
    })) : [];
    const anchors = footer ? [...footer.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")) : [];
    return {
      viewport: window.innerWidth,
      footerHeight: h === null ? null : Number(h.toFixed(4)),
      bantOrani: h === null ? null : Number((h / window.innerWidth).toFixed(8)),
      navDisplay: nav ? getComputedStyle(nav).display : null,
      gridTemplateRows: nav ? getComputedStyle(nav).gridTemplateRows : null,
      tlCols: getComputedStyle(document.documentElement).getPropertyValue("--tl-cols").trim(),
      columns: columns.map((c) => `${c.title}:${c.links.length}`),
      resourceOccurrences: Object.fromEntries(
        ["/malzemeler", "/kabiliyet-profilleri", "/kalite-dosyasi", "/blog", "/sss"]
          .map((path) => [path, anchors.filter((a) => a === path).length]),
      ),
      homeHrefCount: anchors.filter((a) => a === "/").length,
      totalFooterAnchors: anchors.length,
    };
  }));
  await ctx.close();
}

await b.close();
console.log(JSON.stringify(out, null, 2));
