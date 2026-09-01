/* QA P04-C / R5 — settle the B24 contradiction with ONE instrument applied to
 * BOTH builds.
 *
 * The prior QA FAIL computed the Phase-03 side against an ASSUMED #ffffff
 * ground rather than measuring it. This tool measures. For each chip it walks
 * the ancestor chain upward, records EVERY background it meets, stops at the
 * first fully opaque one, then composites back down to get the real ground
 * behind the glyphs — and prints the whole chain so the arithmetic is auditable.
 *
 *   QA_BASE=http://127.0.0.1:4300 node p04c-r5-chip-contrast.mjs   # Phase 03
 *   QA_BASE=http://127.0.0.1:4200 node p04c-r5-chip-contrast.mjs   # Phase 04 fixed
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:4200";
const ROUTE = "/hizmetler/cnc-frezeleme";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(`${BASE}${ROUTE}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const data = await page.evaluate(() => {
  const parse = (s) => {
    const m = /rgba?\(([^)]+)\)/.exec(s);
    if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  /* src over dst */
  const over = (src, dst) => ({
    r: src.r * src.a + dst.r * (1 - src.a),
    g: src.g * src.a + dst.g * (1 - src.a),
    b: src.b * src.a + dst.b * (1 - src.a),
    a: 1,
  });

  const chips = [...document.querySelectorAll(".w-7.h-7")];
  return chips.slice(0, 6).map((chip) => {
    const cs = getComputedStyle(chip);
    const rect = chip.getBoundingClientRect();
    const chain = [];
    let node = chip;
    let opaqueFound = null;
    while (node) {
      const s = getComputedStyle(node);
      const bg = parse(s.backgroundColor);
      const hasImage = s.backgroundImage && s.backgroundImage !== "none";
      if (bg && bg.a > 0) {
        chain.push({
          tag: node.tagName.toLowerCase(),
          cls: String(node.className).slice(0, 60),
          bg: s.backgroundColor,
          alpha: bg.a,
          bgImage: hasImage ? s.backgroundImage.slice(0, 60) : null,
          opacity: s.opacity,
        });
        if (bg.a >= 1) { opaqueFound = bg; break; }
      } else if (hasImage) {
        chain.push({ tag: node.tagName.toLowerCase(), cls: String(node.className).slice(0, 60), bg: "(transparent)", alpha: 0, bgImage: s.backgroundImage.slice(0, 60), opacity: s.opacity });
      }
      node = node.parentElement;
    }
    /* composite from the opaque layer downward to the chip's own background */
    let ground = opaqueFound ?? { r: 255, g: 255, b: 255, a: 1 };
    const layers = chain.slice(0, chain.length - (opaqueFound ? 1 : 0)).reverse();
    for (const l of layers) {
      const c = parse(l.bg);
      if (c && c.a > 0) ground = over(c, ground);
    }
    /* the chip's OWN background is the last layer; the glyph sits on it */
    return {
      text: chip.textContent.trim().slice(0, 24),
      color: cs.color,
      ownBg: cs.backgroundColor,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      visible: rect.width > 0 && rect.height > 0 && cs.visibility !== "hidden" && cs.display !== "none",
      opacity: cs.opacity,
      chain,
      opaqueAncestor: opaqueFound ? `rgb(${opaqueFound.r},${opaqueFound.g},${opaqueFound.b})` : "NONE FOUND (assumed white)",
      ground: `rgb(${Math.round(ground.r)},${Math.round(ground.g)},${Math.round(ground.b)})`,
      groupRaw: ground,
    };
  });
});

/* WCAG relative luminance + contrast, computed here in Node so it is auditable */
const lin = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const parse = (s) => { const m = /rgba?\(([^)]+)\)/.exec(s); const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
const contrast = (fg, bg) => { const a = lum(fg), b = lum(bg); const [hi, lo] = a > b ? [a, b] : [b, a]; return (hi + 0.05) / (lo + 0.05); };

console.log(`\n############ ${BASE}${ROUTE} @1280 — ${data.length} chip(s) ############`);
for (const [i, c] of data.entries()) {
  console.log(`\n--- chip ${i + 1} "${c.text}" ---`);
  console.log(`   color=${c.color}  ownBg=${c.ownBg}  ${c.fontSize}/${c.fontWeight}  visible=${c.visible} opacity=${c.opacity}`);
  console.log(`   ancestor background chain (chip -> up, stops at first opaque):`);
  for (const l of c.chain) {
    console.log(`      <${l.tag} class="${l.cls}">  bg=${l.bg}  alpha=${l.alpha}  opacity=${l.opacity}${l.bgImage ? `  IMAGE=${l.bgImage}` : ""}`);
  }
  console.log(`   first OPAQUE ancestor : ${c.opaqueAncestor}`);
  console.log(`   COMPOSITE GROUND      : ${c.ground}`);
  const fg = parse(c.color);
  console.log(`   contrast ${c.color} on ${c.ground} = ${contrast(fg, c.groupRaw).toFixed(3)} : 1`);
}
await browser.close();
