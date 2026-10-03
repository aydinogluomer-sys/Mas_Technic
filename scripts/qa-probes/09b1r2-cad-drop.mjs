/* QA 09b-1 R2 — `.tl-cad-drop`, MEASURED OFF PAINTED PIXELS, IN FOUR STATES
   ==========================================================================
   Round 1 never reached this element: it was not in that round's route list,
   and it lives on `/`. The Coder reports 3.672:1 against both fill and ground
   after moving it onto `--tl-paper-control-rule`. This measures it here, at
   1280 and 375, in the four states the stylesheet defines:

     rest       border: 1px dashed var(--tl-paper-control-rule); background: transparent
     hover      border-color: var(--tl-ink); background: var(--tl-ink-tint)
     dragging   the same, plus border-style: solid          (`[data-dragging]`)
     focus      outline: 2px solid currentColor; outline-offset: 4px
                (`technical-landing.css:11`)

   NOT FROM `getComputedStyle`. A declared `rgba(18,23,25,.54)` is not what the
   eye receives; the composited pixel is. The element is photographed with a
   16 px margin, the PNG is decoded on a canvas in the page (neither `pngjs`
   nor `pixelmatch` is a dependency of this repository and adding one is not
   QA's to add — the same constraint round 1 worked under), and the rule row is
   FOUND by scanning for the darkest row rather than assumed to be at a
   particular offset, because the element's box sits at a fractional y.

   A dashed rule alternates on and off, so two numbers are reported: the
   DARKEST pixel on the rule row, which is the dash core, and the count of
   pixels on that row that are darker than the ground, which is how much of it
   is actually painted. Contrast is WCAG 2.x relative luminance.

   NETWORK: guard() at allowHosts=[], canary first. Read-only; the file input
   is never opened and no file is ever handed to `useCadHandoff`.
   ========================================================================== */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { guard, canary, chromiumExecutable } from "./probe-lib.mjs";
import { preview, URL_BASE } from "./09b1r2-lib.mjs";

const OUT = "reports/qa/phase-09b1r2";
mkdirSync(OUT, { recursive: true });
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const results = [];

const MARGIN = 16;
const SEL = "button.tl-cad-drop";

/* Runs in the page: decode the capture and read the rule off it. */
const ANALYSE = `async ({ b64, margin }) => {
  const img = new Image();
  img.src = "data:image/png;base64," + b64;
  await img.decode();
  const cv = document.createElement("canvas");
  cv.width = img.width; cv.height = img.height;
  const cx = cv.getContext("2d");
  cx.drawImage(img, 0, 0);
  const d = cx.getImageData(0, 0, img.width, img.height).data;
  const px = (x, y) => { const i = (y * img.width + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
  const lum = ([r, g, b]) => {
    const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const cr = (a, b) => { const l1 = lum(a), l2 = lum(b); const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]; return (hi + 0.05) / (lo + 0.05); };
  const key = (c) => c.join(",");

  /* the ground: a pixel well outside the element, above-left of it */
  const ground = px(2, 2);

  /* FIND the rule row rather than assume it. Scan every row in the top
     margin band plus a few px inside, and take the row whose darkest pixel is
     darkest overall. */
  let ruleY = -1, ruleDarkest = null, ruleLum = 2;
  for (let y = 0; y < margin + 6 && y < img.height; y++) {
    let darkest = null, dl = 2;
    for (let x = margin + 4; x < img.width - margin - 4; x++) {
      const c = px(x, y); const l = lum(c);
      if (l < dl) { dl = l; darkest = c; }
    }
    if (dl < ruleLum) { ruleLum = dl; ruleDarkest = darkest; ruleY = y; }
  }

  /* how much of that row is actually painted, and the histogram */
  const hist = new Map();
  let painted = 0, total = 0;
  for (let x = margin + 4; x < img.width - margin - 4; x++) {
    const c = px(x, ruleY); total++;
    hist.set(key(c), (hist.get(key(c)) ?? 0) + 1);
    if (lum(c) < lum(ground) - 0.002) painted++;
  }
  /* the fill: a few px INSIDE the rule, away from the icon and the text */
  const fill = px(margin + 6, ruleY + 6);
  /* the ground immediately OUTSIDE the rule */
  const outside = px(margin + 6, Math.max(0, ruleY - 3));

  const modal = [...hist.entries()].sort((a, b) => b[1] - a[1])[0];
  const darkestModal = [...hist.entries()]
    .map(([k, n]) => ({ c: k.split(",").map(Number), n }))
    .filter((e) => e.n >= 3)
    .sort((a, b) => lum(a.c) - lum(b.c))[0];

  return {
    w: img.width, h: img.height, ruleY,
    ground, outside, fill,
    ruleDarkest,
    rulePaintedPct: Math.round((painted / total) * 1000) / 10,
    modal: { c: modal[0].split(",").map(Number), n: modal[1], of: total },
    darkestRepeated: darkestModal ? { c: darkestModal.c, n: darkestModal.n } : null,
    crDarkestVsGround: Math.round(cr(ruleDarkest, outside) * 1000) / 1000,
    crDarkestVsFill: Math.round(cr(ruleDarkest, fill) * 1000) / 1000,
    crFillVsGround: Math.round(cr(fill, outside) * 1000) / 1000,
  };
}`;

async function measure(page, label) {
  const el = page.locator(SEL).first();
  const box = await el.boundingBox();
  if (!box) throw new Error(`${label}: no box for ${SEL}`);
  const clip = {
    x: Math.max(0, Math.round(box.x) - MARGIN),
    y: Math.max(0, Math.round(box.y) - MARGIN),
    width: Math.round(box.width) + MARGIN * 2,
    height: Math.min(90, Math.round(box.height) + MARGIN * 2),
  };
  const shot = await page.screenshot({ clip, animations: "disabled", caret: "hide" });
  const declared = await el.evaluate((e) => {
    const s = getComputedStyle(e);
    return {
      borderTop: s.borderTopColor, style: s.borderTopStyle, width: s.borderTopWidth,
      background: s.backgroundColor, outline: `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor} offset ${s.outlineOffset}`,
      focusVisible: e.matches(":focus-visible"), dragging: e.getAttribute("data-dragging"),
    };
  });
  const m = await page.evaluate(new Function("a", `return (${ANALYSE})(a)`), { b64: shot.toString("base64"), margin: MARGIN });
  results.push({ label, declared, ...m });
  log(`── ${label}`);
  log(`   declared  border ${declared.width} ${declared.style} ${declared.borderTop}   background ${declared.background}`);
  log(`   declared  outline ${declared.outline}   :focus-visible=${declared.focusVisible}  data-dragging=${declared.dragging}`);
  log(`   PAINTED   ground rgb(${m.outside})   fill rgb(${m.fill})   rule row y=${m.ruleY} darkest rgb(${m.ruleDarkest})`);
  log(`   PAINTED   rule row is ${m.rulePaintedPct}% darker-than-ground; modal pixel rgb(${m.modal.c}) ${m.modal.n}/${m.modal.of}`);
  log(`   CONTRAST  rule vs ground ${m.crDarkestVsGround}:1   rule vs fill ${m.crDarkestVsFill}:1   fill vs ground ${m.crFillVsGround}:1`);
  log(`   VERDICT   ${Math.min(m.crDarkestVsGround, m.crDarkestVsFill) >= 3 ? "PASS ≥3:1 (WCAG 1.4.11 non-text)" : "*** BELOW 3:1 ***"}`);
  log("");
  return m;
}

const run = async () => {
  const stop = await preview();
  const browser = await chromium.launch(chromiumExecutable() ? { executablePath: chromiumExecutable() } : {});
  try {
    for (const vp of [{ width: 1280, height: 900, mobile: false }, { width: 375, height: 812, mobile: true }]) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.mobile, hasTouch: vp.mobile,
        reducedMotion: "reduce",
      });
      await guard(ctx, []);
      const page = await ctx.newPage();
      await page.goto(`${URL_BASE}/`, { waitUntil: "domcontentloaded" });
      if (vp.width === 1280) { await canary(page, log); log(""); }
      await page.waitForSelector("#root", { state: "visible", timeout: 30_000 });
      const dl = Date.now() + 30_000;
      while (await page.locator(".shell-boot").count() && Date.now() < dl) await page.waitForTimeout(250);
      await page.locator(SEL).first().scrollIntoViewIfNeeded();
      /* the section's own entrance clip-path has a .12 s delay; let it finish
         so the rule is not photographed mid-reveal */
      await page.waitForTimeout(2500);
      await page.evaluate(async () => { await document.fonts?.ready; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });

      log(`══ VIEWPORT ${vp.width}x${vp.height}${vp.mobile ? " (touch)" : ""} ══`);
      await measure(page, `${vp.width} rest`);

      /* HOVER */
      await page.locator(SEL).first().hover();
      await page.waitForTimeout(600);
      await measure(page, `${vp.width} hover`);

      /* DRAG — a real bubbling dragover, which is what sets data-dragging */
      await page.mouse.move(4, 4);
      await page.waitForTimeout(500);
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        el.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true }));
      }, SEL);
      await page.waitForTimeout(700);
      await measure(page, `${vp.width} dragging`);

      /* FOCUS — a keypress first so Chromium's focus-visible heuristic treats
         the subsequent focus as keyboard-initiated; asserted, not assumed. */
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        el.removeAttribute("data-dragging");
        el.dispatchEvent(new DragEvent("dragleave", { bubbles: true }));
      }, SEL);
      await page.keyboard.press("Tab");
      await page.waitForTimeout(300);
      await page.evaluate((sel) => document.querySelector(sel).focus(), SEL);
      await page.waitForTimeout(600);
      await measure(page, `${vp.width} focus`);

      await ctx.close();
    }
    writeFileSync(`${OUT}/cad-drop.json`, JSON.stringify(results, null, 1));
    const worst = results.reduce((a, r) => Math.min(a, r.crDarkestVsGround, r.crDarkestVsFill), 99);
    log(`WORST measured boundary contrast across 8 (viewport × state) rows: ${Math.round(worst * 1000) / 1000}:1`);
  } finally {
    await browser.close();
    await stop();
    writeFileSync(`${OUT}/cad-drop.txt`, lines.join("\n") + "\n");
  }
};
run().catch((e) => { lines.push(`PROBE ERROR: ${e && e.stack}`); writeFileSync(`${OUT}/cad-drop.txt`, lines.join("\n") + "\n"); console.error(e); process.exit(1); });
