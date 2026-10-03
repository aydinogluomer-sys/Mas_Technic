/* QA 09b-1 — A SECOND OPINION ON THE TWO JUDGEMENT CALLS
   ==========================================================================
   `probe-control-boundary.mjs` classifies a bordered element three ways:
   `control` (enclosing border on an interactive element), `control-edge`
   (one- or two-sided border on an interactive element), and `decor`. Only
   `control` is judged against 3:1. Two elements land in `control-edge` and
   the Coder names both as judgement calls:

     `a.tl-brand`         — called a header grid divider, 2.20:1
     `.shell-faq-source a`— called a link underline,      1.92:1, x107

   If either is really a control BOUNDARY, that is a live 1.4.11 failure this
   correction walked past. WCAG 1.4.11 settles it, and the deciding fact is
   not the border but the LABEL: the criterion's own exception is that "the
   visual information required to identify a component" need not meet 3:1
   when the component is identified by TEXT, which is governed by 1.4.3
   instead. So the question to ask each element is not "does its border
   enclose it" but "would a reader still know a control is here with the
   border removed" — and for a labelled link the answer is the label.

   This probe therefore measures, for both:
     · the accessible name and whether it is rendered as visible text;
     · that text's own contrast against its ground (1.4.3, 4.5:1 for body,
       3:1 for large), because if the call is right THAT is the number the
       control depends on and it had better pass;
     · whether the element has any other identifying graphic;
     · and, for `a.tl-brand`, whether its border-right runs the height of the
       header row (a grid divider) or the height of the link (a boundary).
   ========================================================================== */
import { writeFileSync, mkdirSync } from "node:fs";
import { guard, canary, launch, BASE } from "./probe-lib.mjs";

const OUT = "reports/qa/phase-09b1";
mkdirSync(OUT, { recursive: true });
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };

const lin = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const L = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const x = L(a), y = L(b); return +(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05))).toFixed(2); };
const parse = (s) => { const n = String(s).match(/[-\d.]+/g); return n ? n.slice(0, 3).map(Number) : null; };

const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
const t = await guard(context, []);
const page = await context.newPage();
await page.goto(`${BASE}/sss`, { waitUntil: "load" });
await canary(page, log);
await page.waitForLoadState("networkidle").catch(() => {});
await page.waitForTimeout(2600);

const probe = async (sel, label) => {
  const r = await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    const parent = el.parentElement;
    const pbox = parent.getBoundingClientRect();
    const pcs = getComputedStyle(parent);
    /* the nearest ancestor that paints an opaque background */
    let g = el.parentElement, ground = "rgb(255,255,255)";
    while (g) {
      const b = getComputedStyle(g).backgroundColor;
      if (b && b !== "rgba(0, 0, 0, 0)" && b !== "transparent") { ground = b; break; }
      g = g.parentElement;
    }
    return {
      name: (el.getAttribute("aria-label") ?? el.textContent ?? "").replace(/\s+/g, " ").trim(),
      visibleText: (el.innerText ?? "").replace(/\s+/g, " ").trim(),
      color: cs.color,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      textDecoration: cs.textDecorationLine,
      borderSides: ["Top", "Right", "Bottom", "Left"]
        .filter((k) => parseFloat(cs[`border${k}Width`]) > 0 && cs[`border${k}Style`] !== "none")
        .join(","),
      borderColor: cs.borderRightColor !== "rgba(0, 0, 0, 0)" ? cs.borderRightColor : cs.borderBottomColor,
      ground,
      box: { w: +box.width.toFixed(1), h: +box.height.toFixed(1) },
      parentBox: { w: +pbox.width.toFixed(1), h: +pbox.height.toFixed(1) },
      parentTag: parent.tagName.toLowerCase() + "." + [...parent.classList].join("."),
      /* is the border the height of the ROW (a divider) or of the LINK? */
      spansParentHeight: Math.abs(box.height - pbox.height) < 2,
      svgKids: el.querySelectorAll("svg, img").length,
      alignSelf: cs.alignSelf, display: cs.display, height: cs.height,
      parentDisplay: pcs.display,
    };
  }, sel);
  if (!r) { log(`  ${label}: NOT FOUND`); return null; }
  const textVsGround = ratio(parse(r.color), parse(r.ground));
  const px = parseFloat(r.fontSize);
  const large = px >= 24 || (px >= 18.66 && Number(r.fontWeight) >= 700);
  const need = large ? 3 : 4.5;
  log(`  ${label}`);
  log(`    accessible name       ${JSON.stringify(r.name.slice(0, 60))}`);
  log(`    rendered as text      ${r.visibleText ? "YES" : "NO"}  ${JSON.stringify(r.visibleText.slice(0, 60))}`);
  log(`    other identifying art ${r.svgKids} svg/img child(ren)`);
  log(`    border sides drawn    ${r.borderSides || "(none)"}   colour ${r.borderColor}`);
  log(`    element ${r.box.w}x${r.box.h}  inside ${r.parentTag} ${r.parentBox.w}x${r.parentBox.h}  (border spans the parent's full height: ${r.spansParentHeight})`);
  log(`    TEXT contrast         ${textVsGround}:1 at ${r.fontSize}/${r.fontWeight} on ${r.ground} — 1.4.3 needs ${need}:1 → ${textVsGround >= need ? "PASS" : "*** FAIL ***"}`);
  return { ...r, textVsGround, need, textPasses: textVsGround >= need };
};

log("");
log("── `.shell-faq-source a` — called a link underline ──");
const faq = await probe(".shell-faq-source a", ".shell-faq-source a  (/sss, paper band in a graphite root)");

await page.goto(`${BASE}/iletisim`, { waitUntil: "load" });
await page.waitForLoadState("networkidle").catch(() => {});
await page.waitForTimeout(2600);
log("");
log("── `a.tl-brand` — called a header grid divider ──");
const brand = await probe("a.tl-brand", "a.tl-brand  (/iletisim, header band)");

/* THE DECIDING QUESTION, ASKED DIRECTLY: remove the border and see whether a
   reader can still tell a control is there. If the only identification was
   the border, the visible text goes to zero. */
log("");
log("── the border removed at runtime: what identification remains? ──");
for (const [sel, where] of [["a.tl-brand", "/iletisim"], [".shell-faq-source a", "/sss"]]) {
  await page.goto(`${BASE}${where}`, { waitUntil: "load" });
  await page.waitForTimeout(2200);
  const r = await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    el.style.setProperty("border", "0", "important");
    const cs = getComputedStyle(el);
    return {
      textStillVisible: (el.innerText ?? "").trim().length > 0,
      text: (el.innerText ?? "").replace(/\s+/g, " ").trim().slice(0, 40),
      underlineStillDrawn: cs.textDecorationLine !== "none",
      svg: el.querySelectorAll("svg,img").length,
    };
  }, sel);
  log(`  ${sel.padEnd(24)} border:0 → text visible ${r.textStillVisible} ${JSON.stringify(r.text)}   text-decoration ${r.underlineStillDrawn ? "still drawn" : "none"}   graphics ${r.svg}`);
}

log("");
log(`traffic: blocked ${t.blocked.length}, ALLOWED ${t.allowed.length}`);
await context.close();
await browser.close();
writeFileSync(`${OUT}/decor-calls.txt`, lines.join("\n") + "\n");
