/**
 * Phase 10-2b DOM adjudication probe.
 *
 * Against a `vite preview` of the production build (PROBE_BASE_URL, default
 * http://localhost:4194), at 375×812 (mobile) and 1280×800, reads for the
 * picture each changed surface renders: `currentSrc` (basename), the natural
 * size of the chosen candidate, the computed `object-position`, and the
 * rendered box. This is what the goldens moved on, read from the DOM rather
 * than from the pixels.
 *
 * Usage: node reports/10/probes/art-direction.probe.mjs > reports/10/probes/art-direction.probe.json
 */
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.PROBE_BASE_URL ?? "http://localhost:4194";
const executablePath = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

/** [route, selector, label] */
const SURFACES = [
  ["/", ".tl-manifesto-body img", "manifesto"],
  ["/", ".tl-sector-card:nth-child(4) img", "sector-card-hydraulic"],
  ["/kabiliyetler/makine-parkuru", ".shell-plate-frame img", "plate"],
  ["/endustriyel/medikal", ".shell-plate-frame img", "plate (sector fallback)"],
  ["/endustriyel/madencilik-ekipmanlari", ".shell-plate-frame img", "plate (sector fallback)"],
  ["/hizmetler/mekanik-montaj", ".shell-plate-frame img", "plate"],
  ["/kabiliyetler/operasyonel-verimlilik", ".shell-plate-frame img", "plate"],
  ["/kabiliyetler/kalite-kontrol", ".shell-plate-frame img", "plate"],
  ["/kabiliyetler/tasarim-rehberi-dfm", ".shell-plate-frame img", "plate"],
  ["/hizmetler/kimyasal-islemler", ".shell-plate-frame img", "plate"],
  ["/kabiliyetler/tolerans-hassasiyet", ".shell-plate-frame img", "plate (object-position)"],
  ["/endustriyel/havacilik-uzay", ".shell-plate-frame img", "plate (object-position)"],
  ["/hizmetler/kitting-paketleme", ".shell-plate-frame img", "plate (object-position)"],
  ["/hizmetler/cnc-frezeleme", ".shell-plate-frame img", "plate (control, unchanged)"],
  ["/blog/cnc-torna-frezeleme-farki", ".shell-plate-frame img", "blog plate"],
  ["/blog/endustriyel-yuzey-islemleri-rehberi", ".shell-plate-frame img", "blog plate"],
];

const VIEWPORTS = [
  { name: "375", viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
  { name: "1280", viewport: { width: 1280, height: 800 } },
];

const browser = await chromium.launch(executablePath ? { executablePath } : {});
const rows = [];
for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ ...vp, reducedMotion: "reduce" });
  const page = await context.newPage();
  for (const [route, selector, label] of SURFACES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    const img = page.locator(selector).first();
    await img.scrollIntoViewIfNeeded();
    await page.waitForFunction((sel) => { const el = document.querySelector(sel); return el && el.complete && el.naturalWidth > 0; }, selector, { timeout: 20_000 });
    const data = await img.evaluate((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const picture = el.parentElement?.tagName === "PICTURE" ? el.parentElement : null;
      return {
        currentSrc: el.currentSrc.split("/").pop(),
        natural: [el.naturalWidth, el.naturalHeight],
        attrs: [el.getAttribute("width"), el.getAttribute("height")],
        objectFit: cs.objectFit,
        objectPosition: cs.objectPosition,
        box: [Math.round(r.width), Math.round(r.height)],
        picture: picture ? { display: getComputedStyle(picture).display, sources: [...picture.querySelectorAll("source")].map((s) => s.getAttribute("media")) } : null,
      };
    });
    rows.push({ viewport: vp.name, route, label, ...data });
  }
  await context.close();
}
await browser.close();
console.log(JSON.stringify(rows, null, 1));
