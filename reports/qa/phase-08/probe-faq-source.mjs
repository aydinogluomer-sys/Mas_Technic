/**
 * QA PROBE — adjudicate the two contrast candidates reported by the Phase 07
 * glyph-free instrument on Phase 08 surfaces:
 *   (a) `/sss` `.shell-faq-source > a` at 10px  — one row measured 2.583:1
 *   (b) `/zzzz` `.shell-notfound-code` "404"     — measured 1.0:1
 */
import { chromium } from "playwright";
const BASE = "http://localhost:4173";
const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });

const lum = ([r, g, b2]) => {
  const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b2);
};
const ratio = (a, c) => { const l1 = lum(a), l2 = lum(c); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
const rgb = (s) => String(s).match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);

// ---- (a) /sss ----
const p = await ctx.newPage();
await p.goto(BASE + "/sss", { waitUntil: "networkidle" });
await p.waitForTimeout(600);
const a = await p.evaluate(() => {
  const out = [];
  const all = [...document.querySelectorAll("details.shell-faq-item")];
  // open every details so the answer body is genuinely painted
  all.forEach((d) => d.setAttribute("open", ""));
  const seen = new Set();
  for (const d of all) {
    const link = d.querySelector(".shell-faq-answer .shell-faq-source a");
    if (!link) continue;
    const cs = getComputedStyle(link);
    // walk up for the first non-transparent painted background
    let n = link, bg = null;
    while (n && n !== document.documentElement) {
      const c = getComputedStyle(n).backgroundColor;
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (m) { const parts = m[1].split(/[,\s/]+/).filter(Boolean).map(Number); if ((parts[3] ?? 1) > 0.99) { bg = c; break; } }
      n = n.parentElement;
    }
    const key = cs.color + "|" + bg + "|" + cs.fontSize;
    if (seen.has(key)) continue;
    seen.add(key);
    const r = link.getBoundingClientRect();
    out.push({ text: link.textContent.trim().slice(0, 40), color: cs.color, fontSize: cs.fontSize, fontWeight: cs.fontWeight, bg, rect: { w: +r.width.toFixed(1), h: +r.height.toFixed(1) } });
  }
  return out;
});
console.log("=== /sss .shell-faq-source a (all details forced open) ===");
for (const r of a) {
  console.log(`  ${r.fontSize}/${r.fontWeight}  color=${r.color}  bg=${r.bg}  ratio=${ratio(rgb(r.color), rgb(r.bg)).toFixed(3)}  "${r.text}"`);
}
await p.close();

// ---- (b) /zzzz ----
const p2 = await ctx.newPage();
await p2.goto(BASE + "/zzzz", { waitUntil: "networkidle" });
await p2.waitForTimeout(600);
const c404 = await p2.evaluate(() => {
  const el = document.querySelector(".shell-notfound-code");
  if (!el) return null;
  const cs = getComputedStyle(el);
  return {
    text: el.textContent, ariaHidden: el.getAttribute("aria-hidden"),
    color: cs.color, webkitTextFillColor: cs.webkitTextFillColor,
    webkitTextStrokeColor: cs.webkitTextStrokeColor, webkitTextStrokeWidth: cs.webkitTextStrokeWidth,
    backgroundImage: cs.backgroundImage.slice(0, 120), backgroundClip: cs.backgroundClip || cs.webkitBackgroundClip,
    fontSize: cs.fontSize,
  };
});
console.log("\n=== /zzzz .shell-notfound-code ===");
console.log(JSON.stringify(c404, null, 1));
await p2.close();
await b.close();
