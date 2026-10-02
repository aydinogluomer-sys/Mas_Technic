/** QA round 3 — re-adjudicate the one /sss contrast hit at 1280 rather than
 *  inheriting round 1's adjudication. The probe reports
 *  `p.shell-faq-source > a` at 2.583 against rgb(7,11,13). That background is
 *  not the one the link is painted on: the `<details>` is CLOSED, so the
 *  element is not rendered and the sampler reads through to whatever is behind
 *  the collapsed row. Open every `<details>` and measure again. */
import { chromium } from "playwright";

const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4205";

const lum = ([r, g, b]) => {
  const f = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };

const b = await chromium.launch({ executablePath: EXE });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
await p.goto(BASE + "/sss", { waitUntil: "networkidle" });
await p.waitForTimeout(900);

const closed = await p.evaluate(() =>
  [...document.querySelectorAll(".shell-faq-source a")].map((a) => {
    const r = a.getBoundingClientRect();
    return { text: a.textContent.trim(), width: r.width, height: r.height, rendered: r.width > 0 && r.height > 0 };
  }));

await p.evaluate(() => { for (const d of document.querySelectorAll("details")) d.open = true; });
await p.waitForTimeout(600);

const open = await p.evaluate(() =>
  [...document.querySelectorAll(".shell-faq-source a")].map((a) => {
    a.scrollIntoView({ block: "center" });
    const cs = getComputedStyle(a);
    let bg = "rgba(0, 0, 0, 0)";
    let el = a;
    while (el && (bg === "rgba(0, 0, 0, 0)" || bg === "transparent")) { bg = getComputedStyle(el).backgroundColor; el = el.parentElement; }
    const r = a.getBoundingClientRect();
    return {
      text: a.textContent.trim(), color: cs.color, bg, fontSize: cs.fontSize, fontWeight: cs.fontWeight,
      rendered: r.width > 0 && r.height > 0,
    };
  }));

const parse = (s) => s.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
const measured = open.map((o) => ({ ...o, ratio: Number(ratio(parse(o.color), parse(o.bg)).toFixed(3)) }));

await b.close();
console.log(JSON.stringify({
  whenClosed: { total: closed.length, rendered: closed.filter((c) => c.rendered).length },
  whenOpen: measured,
  worst: Math.min(...measured.map((m) => m.ratio)),
}, null, 2));
