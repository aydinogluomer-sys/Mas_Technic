/* QA 09b-1 R2 — `button.tl-menu-trigger`, MY OWN PAINTED MEASUREMENT on `/`
   ==========================================================================
   The Coder discloses this control's boundary at 2.16-2.20:1 on ten
   route×viewport rows. One independent painted measurement on `/` at 1280 and
   375, rest and hover, using the same in-page canvas method as the drop-zone
   probe — but the rule here is LIGHTER than its ground (a `--tl-rule` line on
   the dark header), so the rule row is the row of maximum luminance DEVIATION
   from the ground, not the darkest row.
   ========================================================================== */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { guard, canary, chromiumExecutable } from "../../reports/09b1c1/probe-lib.mjs";
import { preview, URL_BASE } from "./09b1r2-lib.mjs";

const OUT = "reports/qa/phase-09b1r2";
mkdirSync(OUT, { recursive: true });
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const SEL = "button.tl-menu-trigger";
const M = 12;

const ANALYSE = `async ({ b64, margin }) => {
  const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
  const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height;
  const cx = cv.getContext("2d"); cx.drawImage(img, 0, 0);
  const d = cx.getImageData(0, 0, img.width, img.height).data;
  const px = (x, y) => { const i = (y * img.width + x) * 4; return [d[i], d[i+1], d[i+2]]; };
  const lum = ([r,g,b]) => { const f = (c) => { c/=255; return c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); }; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
  const cr = (a,b) => { const l1=lum(a), l2=lum(b); const [h,l] = l1>l2?[l1,l2]:[l2,l1]; return (h+0.05)/(l+0.05); };
  const ground = px(2, 2); const gl = lum(ground);
  let ruleY = -1, best = null, dev = -1;
  for (let y = 0; y < margin + 6; y++) {
    for (let x = margin + 4; x < img.width - margin - 4; x++) {
      const c = px(x, y); const v = Math.abs(lum(c) - gl);
      if (v > dev) { dev = v; best = c; ruleY = y; }
    }
  }
  const fill = px(margin + 6, ruleY + 5);
  const outside = px(margin + 6, Math.max(0, ruleY - 3));
  return { ruleY, ground: outside, fill, rule: best, crGround: +cr(best, outside).toFixed(3), crFill: +cr(best, fill).toFixed(3) };
}`;

const run = async () => {
  const stop = await preview();
  const browser = await chromium.launch(chromiumExecutable() ? { executablePath: chromiumExecutable() } : {});
  try {
    for (const vp of [{ width: 1280, height: 900 }, { width: 375, height: 812, mobile: true }]) {
      const ctx = await browser.newContext({ viewport: vp, isMobile: !!vp.mobile, hasTouch: !!vp.mobile, reducedMotion: "reduce" });
      await guard(ctx, []);
      const page = await ctx.newPage();
      await page.goto(`${URL_BASE}/`, { waitUntil: "domcontentloaded" });
      if (vp.width === 1280) { await canary(page, log); log(""); }
      await page.waitForSelector("#root", { state: "visible", timeout: 30_000 });
      const dl = Date.now() + 30_000;
      while (await page.locator(".shell-boot").count() && Date.now() < dl) await page.waitForTimeout(250);
      await page.waitForTimeout(2500);
      for (const state of ["rest", "hover"]) {
        const el = page.locator(SEL).first();
        if (state === "hover") { await el.hover(); await page.waitForTimeout(500); }
        const box = await el.boundingBox();
        const clip = { x: Math.round(box.x) - M, y: Math.round(box.y) - M, width: Math.round(box.width) + 2 * M, height: Math.min(60, Math.round(box.height) + 2 * M) };
        const shot = await page.screenshot({ clip, animations: "disabled" });
        const declared = await el.evaluate((e) => { const s = getComputedStyle(e); return `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor} on bg ${s.backgroundColor}`; });
        const m = await page.evaluate(new Function("a", `return (${ANALYSE})(a)`), { b64: shot.toString("base64"), margin: M });
        log(`${vp.width} ${state.padEnd(6)} declared ${declared}`);
        log(`     painted ground rgb(${m.ground}) fill rgb(${m.fill}) rule rgb(${m.rule}) @y=${m.ruleY}   rule vs ground ${m.crGround}:1   rule vs fill ${m.crFill}:1   ${Math.min(m.crGround, m.crFill) >= 3 ? "PASS" : "BELOW 3:1"}`);
      }
      await ctx.close();
    }
  } finally {
    await browser.close(); await stop();
    writeFileSync(`${OUT}/menu-trigger.txt`, lines.join("\n") + "\n");
  }
};
run().catch((e) => { lines.push(`PROBE ERROR: ${e && e.stack}`); writeFileSync(`${OUT}/menu-trigger.txt`, lines.join("\n") + "\n"); console.error(e); process.exit(1); });
