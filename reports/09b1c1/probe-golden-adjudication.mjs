/* ADJUDICATING THE ONE GOLDEN THAT MOVED, AT THE DOM.
   ══════════════════════════════════════════════════════════════════════════
   Four of the sixteen visual runs failed and all four are the same baseline:
   `waveb-notfound-body`, at 375, 768, 1280 and 1440, each reporting exactly
   392 differing pixels. `--update-snapshots` without knowing WHY is what
   `IMPLEMENTATION.md` §12 forbids by name, so this establishes three things
   before a single PNG is rewritten:

     1. WHICH elements inside the captured crop take a boundary this phase
        changed. If the answer is more than one, the diff has more than one
        cause and one of them is unexplained.
     2. That the pixel count the comparison reported is the PERIMETER of that
        element's 1px border, and nothing else.
     3. That no other element in the crop is affected — measured by walking
        the crop for every one of the eight declarations this phase touched.

   It also asks the same question of every OTHER golden's crop, because a
   baseline that passes is not the same as a baseline that did not change:
   Playwright's default per-pixel threshold (0.2, i.e. a YIQ delta of 1408 out
   of 35215) is larger than the delta between the old and new hairline on
   graphite, so a crop can contain changed pixels and still compare equal. Any
   such crop is named here rather than left to be discovered later. */
import { writeFileSync } from "node:fs";
import { launch, guard, canary, BASE } from "./probe-lib.mjs";

/* The eight declarations this phase changed, as selectors. */
const CHANGED = [
  ".shell-field input",
  ".shell-field select",
  ".shell-field textarea",
  ".shell-dropzone-area",
  ".shell-segment",
  ".shell-row-toggle",
  ".shell-auth-social > button",
  ".shell-action--ghost",
  ".shell-footer-secondary",
  ".tl-social a",
];

/* Every element a golden in this repository photographs, with the route it
   lives on — read off the four visual specs. */
const CROPS = [
  { golden: "waveb-notfound-body", path: "/olmayan-sayfa/cnc-frezelme", selector: ".shell-notfound" },
  { golden: "waveb-journal-lead", path: "/blog", selector: ".tl-band.shell-surface-band" },
  { golden: "waveb-quality-documents", path: "/kalite-dosyasi", selector: ".tl-band.shell-surface-band" },
  { golden: "waveb-profile-scope", path: "/kabiliyet-profilleri", selector: ".tl-band.shell-surface-band" },
  { golden: "inner-hero-about", path: "/hakkimizda", selector: ".shell-hero" },
  { golden: "inner-hero-contact", path: "/iletisim", selector: ".shell-hero" },
  { golden: "inner-hero-materials", path: "/malzemeler", selector: ".shell-hero" },
  { golden: "inner-hero-material-family", path: "/malzemeler/aluminyum", selector: ".shell-hero" },
  { golden: "inner-hero-service-category", path: "/hizmetler/kategori/talasli-imalat", selector: ".shell-hero" },
  { golden: "inner-hero-service-detail", path: "/hizmetler/cnc-frezeleme", selector: ".shell-hero" },
  { golden: "inner-hero-sector-detail", path: "/endustriyel/havacilik-uzay", selector: ".shell-hero" },
  { golden: "inner-next-service-category", path: "/hizmetler/kategori/talasli-imalat", selector: ".shell-next" },
  { golden: "inner-next-service-detail", path: "/hizmetler/cnc-frezeleme", selector: ".shell-next" },
  { golden: "inner-next-sector-detail", path: "/endustriyel/havacilik-uzay", selector: ".shell-next" },
  { golden: "shell-footer-home", path: "/", selector: "footer.tl-footer" },
  { golden: "shell-footer-about", path: "/hakkimizda", selector: "footer.tl-footer" },
  { golden: "shell-footer-journal", path: "/blog", selector: "footer.tl-footer" },
  { golden: "shell-footer-rfq", path: "/teklif-al", selector: "footer.tl-footer" },
  { golden: "shell-footer-service", path: "/hizmetler/cnc-frezeleme", selector: "footer.tl-footer" },
  { golden: "shell-footer-notfound", path: "/olmayan-sayfa/cnc-frezelme", selector: "footer.tl-footer" },
  { golden: "shell-header-home", path: "/", selector: "[data-fullscreen-header]" },
  { golden: "shell-header-about", path: "/hakkimizda", selector: "[data-fullscreen-header]" },
  { golden: "navigation-closed", path: "/", selector: "[data-fullscreen-header]" },
  { golden: "landing-fullpage", path: "/", selector: "body" },
];

const browser = await launch();
const rows = [];
let canaryResult = null;

for (const vp of [{ width: 1280, height: 900 }, { width: 375, height: 812, mobile: true }]) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: !!vp.mobile,
    hasTouch: !!vp.mobile,
    reducedMotion: "reduce",
  });
  const traffic = await guard(context, []);

  for (const crop of CROPS) {
    const page = await context.newPage();
    try {
      await page.goto(`${BASE}${crop.path}`, { waitUntil: "load", timeout: 45_000 });
      await page.waitForSelector(".shell-root, .tl-root", { timeout: 30_000 });
      await page.waitForTimeout(1200);
    } catch {
      rows.push({ viewport: vp.width, golden: crop.golden, error: "did-not-settle" });
      await page.close();
      continue;
    }
    if (canaryResult === null) canaryResult = await canary(page, (m) => console.log(m));

    const found = await page.evaluate(({ selector, changed }) => {
      const root = document.querySelector(selector);
      if (!root) return { present: false, hits: [] };
      const hits = [];
      for (const sel of changed) {
        for (const el of Array.from(root.querySelectorAll(sel))) {
          const s = getComputedStyle(el);
          const box = el.getBoundingClientRect();
          if (box.width < 2 || box.height < 2) continue;
          const w = Math.round(box.width);
          const h = Math.round(box.height);
          hits.push({
            sel,
            w,
            h,
            borderColor: s.borderTopColor,
            borderWidth: parseFloat(s.borderTopWidth),
            /* A 1px rectangular outline: two full rows plus two columns minus
               the four corners counted twice. */
            perimeterPixels: 2 * w + 2 * h - 4,
            text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 30),
          });
        }
      }
      return { present: true, hits };
    }, { selector: crop.selector, changed: CHANGED });

    const total = found.hits.reduce((n, h) => n + h.perimeterPixels, 0);
    rows.push({ viewport: vp.width, golden: crop.golden, path: crop.path, selector: crop.selector, ...found, totalPerimeter: total });
    console.log(
      `${String(vp.width).padStart(4)}  ${crop.golden.padEnd(30)} ${found.present ? "" : "(CROP NOT FOUND) "}`
      + `hits ${String(found.hits.length).padStart(2)}  perimeter ${String(total).padStart(5)}`
      + (found.hits.length ? `  ${found.hits.map((h) => `${h.sel} ${h.w}x${h.h}=${h.perimeterPixels} "${h.text}"`).join(" ; ")}` : ""),
    );
    await page.close();
  }
  console.log(`traffic at ${vp.width}: blocked ${traffic.blocked.length}, ALLOWED ${traffic.allowed.length}`);
  await context.close();
}
await browser.close();

console.log(`\ncanary: ${canaryResult}`);
writeFileSync("reports/09b1c1/golden-adjudication.json", JSON.stringify({ canary: canaryResult, rows }, null, 2));
