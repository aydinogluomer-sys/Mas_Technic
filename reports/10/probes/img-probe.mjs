// Measures every <img> on a set of routes at several viewports against a running
// `vite preview`. Output: JSON rows {route, vw, src, cw, ch, natW, natH, dpr, srcset, sizes, currentSrc}.
import { chromium } from "file:///C:/Users/Trade%20Bilisim/precision-dynamics-hub-main/node_modules/@playwright/test/index.mjs";
import { writeFileSync } from "node:fs";

const base = process.env.PROBE_BASE ?? "http://localhost:4190";
const routes = (process.env.PROBE_ROUTES ?? "/,/blog,/blog/5-eksen-cnc-isleme-avantajlari,/blog/cnc-torna-frezeleme-farki,/blog/kalite-kontrol-cmm-olcum,/hizmetler/cnc-frezeleme,/hizmetler/cnc-tornalama,/kabiliyetler/tolerans-hassasiyet,/endustriyel/medikal,/kabiliyet-profilleri/hassas-mil,/kabiliyet-profilleri/ince-cidarli-govde,/malzemeler").split(",");
const viewports = [375, 768, 1280, 1440];
const dprs = (process.env.PROBE_DPR ?? "1").split(",").map(Number);
const out = process.env.PROBE_OUT ?? "img-probe.json";

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const rows = [];
for (const dpr of dprs) for (const vw of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: 900 }, deviceScaleFactor: dpr, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    // scroll through to trigger lazy loads
    await page.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 900));
    });
    await page.waitForLoadState("networkidle");
    const imgs = await page.evaluate(() => Array.from(document.querySelectorAll("img")).map((img) => {
      const r = img.getBoundingClientRect();
      const cs = getComputedStyle(img);
      return {
        src: (img.getAttribute("src") ?? img.getAttribute("data-src") ?? "").split("/").pop(),
        currentSrc: (img.currentSrc || "").split("/").pop(),
        srcset: img.getAttribute("srcset") ? img.getAttribute("srcset").split(",").length : 0,
        sizes: img.getAttribute("sizes"),
        attrW: img.getAttribute("width"), attrH: img.getAttribute("height"),
        cw: Math.round(r.width), ch: Math.round(r.height),
        natW: img.naturalWidth, natH: img.naturalHeight,
        loading: img.getAttribute("loading"), decoding: img.getAttribute("decoding"),
        fit: cs.objectFit, pos: cs.objectPosition,
        top: Math.round(r.top + window.scrollY),
        alt: img.alt.slice(0, 40),
        cls: img.className.slice(0, 40),
        parent: img.parentElement?.className?.toString().slice(0, 40),
      };
    }));
    for (const i of imgs) rows.push({ route, vw, dpr, ...i });
  }
  await ctx.close();
}
await browser.close();
writeFileSync(out, JSON.stringify(rows, null, 1));
console.log(`${rows.length} rows -> ${out}`);
