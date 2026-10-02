/* 09b-1 — IS THE FIELD BORDER'S 2.16:1 MINE, OR THE SHELL'S?
   ------------------------------------------------------------------------
   The a11y census found every `.shell-field` input on the auth routes drawing
   its boundary at 2.16:1 — under WCAG 1.4.11's 3:1 for a user-interface
   component. That is a real finding, and before reporting it as a defect of
   THIS phase it has to be established whose defect it is.

   `.shell-field :is(input, select, textarea)` takes `border: 1px solid
   var(--sf-rule)`, and `--sf-rule` resolves to `--tl-rule`
   (`rgba(227,231,225,.28)`, `src/styles/design-tokens.css:81`) on graphite.
   That is the shell's own rule token, used by `/iletisim` and `/teklif-al`
   since Phases 07 and 09a. So this walks all five surfaces with one
   instrument and prints the same number for each.

   It also asks the second half of the question WCAG actually asks: a control
   does not need a 3:1 BORDER if it is identifiable some other way. So the
   input's FILL is measured against the ground it sits on too. If the fill
   carries the boundary the border does not have to; if neither does, nothing
   identifies the control's extent. */
import { writeFileSync } from "node:fs";
import { launch, guard, canary, BASE } from "./probe-lib.mjs";

const SURFACES = [
  ["/giris", "input#auth-email"],
  ["/sifremi-unuttum", "input#auth-email"],
  ["/reset-password#token_hash=probe-no-network", "input#auth-password"],
  ["/iletisim", "main .shell-field input"],
  ["/teklif-al", "main .shell-field input"],
];

const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const traffic = await guard(context, []);
const rows = [];

for (const [route, selector] of SURFACES) {
  const page = await context.newPage();
  await page.goto(`${BASE}${route}`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  if (rows.length === 0) await canary(page, (m) => console.log(m));

  const row = await page.evaluate((sel) => {
    const srgb = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    const parse = (s) => { const n = String(s).match(/[\d.]+/g); return n ? n.slice(0, 3).map(Number) : null; };
    const lum = ([r, g, b]) => 0.2126 * srgb(r / 255) + 0.7152 * srgb(g / 255) + 0.0722 * srgb(b / 255);
    const ratio = (a, b) => {
      const x = parse(a); const y = parse(b);
      if (!x || !y) return null;
      const [hi, lo] = [lum(x), lum(y)].sort((p, q) => q - p);
      return Number(((hi + 0.05) / (lo + 0.05)).toFixed(2));
    };
    const alphaOf = (c) => {
      const m = String(c).match(/rgba?\(([^)]+)\)/);
      const parts = m ? m[1].split(",").map((v) => parseFloat(v)) : [];
      return parts.length === 4 ? parts[3] : 1;
    };
    const flatten = (c, over) => {
      const a = alphaOf(c); const x = parse(c); const y = parse(over);
      if (!x || !y) return null;
      return `rgb(${x.map((v, i) => Math.round(a * v + (1 - a) * y[i])).join(", ")})`;
    };
    const opaqueGround = (el) => {
      let node = el.parentElement;
      while (node) {
        const bg = getComputedStyle(node).backgroundColor;
        if (alphaOf(bg) > 0.95 && parse(bg)) return bg;
        node = node.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    };

    const input = document.querySelector(sel);
    if (!input) return { found: false };
    const s = getComputedStyle(input);
    const ground = opaqueGround(input);
    const border = flatten(s.borderTopColor, ground);
    const fill = alphaOf(s.backgroundColor) > 0.95 ? s.backgroundColor : flatten(s.backgroundColor, ground);
    input.focus();
    const f = getComputedStyle(input);
    const focusRing = { outlineStyle: f.outlineStyle, outlineWidth: f.outlineWidth, outlineColor: f.outlineColor };
    const focusBorder = flatten(f.borderTopColor, ground);
    input.blur();
    return {
      found: true,
      borderRaw: s.borderTopColor,
      borderFlat: border,
      ground,
      borderRatio: ratio(border, ground),
      fill,
      fillRatio: ratio(fill, ground),
      focusRing,
      focusOutlineRatio: ratio(focusRing.outlineColor, ground),
      focusBorderRatio: ratio(focusBorder, ground),
    };
  }, selector);

  rows.push({ route, selector, ...row });
  console.log(
    `${route.padEnd(46)} border ${String(row.borderRatio).padStart(5)}:1  fill ${String(row.fillRatio).padStart(5)}:1`
    + `  focus-outline ${String(row.focusOutlineRatio).padStart(5)}:1  focus-border ${String(row.focusBorderRatio).padStart(5)}:1`,
  );
  await page.close();
}

console.log(`\ntraffic: blocked ${traffic.blocked.length}, ALLOWED ${traffic.allowed.length}`);
writeFileSync("reports/09b1/field-border.json", JSON.stringify({ rows, traffic: { blocked: traffic.blocked.length, allowed: traffic.allowed.length } }, null, 2));
await context.close();
await browser.close();
