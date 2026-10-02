/* The one control the sweep still reports under 3:1, measured properly before
   it is reported — because "it fails" and "its box fails but its glyph does
   not" are different findings and only one of them is a defect.

   `.tl-menu-trigger` lives in `src/styles/navigation.css`, which this packet's
   WRITE_ALLOWLIST does not include, so this probe exists to describe it
   accurately rather than to justify touching it. */
import { writeFileSync } from "node:fs";
import { launch, guard, canary, BASE } from "./probe-lib.mjs";

const browser = await launch();
const out = [];
let canaryResult = null;

for (const vp of [{ width: 1280, height: 900, mobile: false }, { width: 375, height: 812, mobile: true }]) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    reducedMotion: "reduce",
  });
  const watched = await guard(context, []);
  const page = await context.newPage();
  await page.goto(`${BASE}/iletisim`, { waitUntil: "load" });
  await page.waitForSelector(".tl-menu-trigger", { timeout: 30_000 });
  await page.waitForTimeout(800);
  if (canaryResult === null) canaryResult = await canary(page, (m) => console.log(m));

  const row = await page.evaluate(() => {
    const srgb = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    const parse = (s) => { const n = String(s).match(/[-\d.]+/g); return n && n.length >= 3 ? n.slice(0, 3).map(Number) : null; };
    const lum = ([r, g, b]) => 0.2126 * srgb(r / 255) + 0.7152 * srgb(g / 255) + 0.0722 * srgb(b / 255);
    const ratio = (a, b) => {
      const x = parse(a); const y = parse(b);
      if (!x || !y) return null;
      const [hi, lo] = [lum(x), lum(y)].sort((p, q) => q - p);
      return Number(((hi + 0.05) / (lo + 0.05)).toFixed(2));
    };
    const trigger = document.querySelector(".tl-menu-trigger");
    const bar = document.querySelector(".tl-menu-trigger-rules > span");
    const label = document.querySelector(".tl-menu-trigger-label");
    const header = trigger.closest(".tl-header-band") ?? trigger.parentElement;
    const ground = getComputedStyle(header).backgroundColor;
    const barBox = bar ? bar.getBoundingClientRect() : null;
    return {
      ground,
      borderColor: getComputedStyle(trigger).borderTopColor,
      barBackground: bar ? getComputedStyle(bar).backgroundColor : null,
      barHeight: barBox ? Number(barBox.height.toFixed(2)) : null,
      barCount: document.querySelectorAll(".tl-menu-trigger-rules > span").length,
      glyphRatio: bar ? ratio(getComputedStyle(bar).backgroundColor, ground) : null,
      labelDisplay: label ? getComputedStyle(label).display : "absent",
      labelText: label ? label.textContent.trim() : null,
      accessibleName: trigger.getAttribute("aria-label") ?? trigger.textContent.trim(),
    };
  });
  out.push({ viewport: vp.width, ...row });
  console.log(`${vp.width}  ${JSON.stringify(row)}`);
  await page.close();
  console.log(`  traffic blocked ${watched.blocked.length} ALLOWED ${watched.allowed.length}`);
  await context.close();
}
await browser.close();
writeFileSync("reports/09b1c1/menu-trigger.json", JSON.stringify({ canary: canaryResult, rows: out }, null, 2));
