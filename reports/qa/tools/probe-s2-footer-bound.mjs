/* QA probe — S2: is `footer.bantOrani < 0.26` still a real bound?
 *
 * 1. Reproduce the Coder's measured values at 1280 and 1440.
 * 2. Breach the bound empirically by injecting, at RUNTIME (no file on disk is
 *    touched), each of the three degradations the Coder claims 0.26 catches:
 *      a) a fifth nav column
 *      b) a link column grown past ~9 rows
 *      c) the conversion rule wrapped onto two rows
 *    A bound that none of these breaches would be toothless.
 * 3. Also check the deleted mega footer's claimed 1398px / ratio 1.09.
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://localhost:4200";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const measure = () => {
  const f = document.querySelector(".tl-footer");
  const h = f.getBoundingClientRect().height;
  return { px: Math.round(h * 100) / 100, ratio: h / window.innerWidth };
};

const browser = await chromium.launch(exe ? { executablePath: exe } : {});

for (const width of [1280, 1440]) {
  const ctx = await browser.newContext({
    viewport: { width, height: 800 },
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.evaluate(() => document.querySelector(".tl-footer").scrollIntoView());
  await page.waitForTimeout(400);

  console.log(`\n===== ${width}px =====`);

  const base = await page.evaluate(measure);
  console.log(`  AS SHIPPED                       ${String(base.px).padStart(8)} px   ratio ${base.ratio.toFixed(4)}   ${base.ratio < 0.26 ? "PASS" : "FAIL"} vs 0.26`);
  console.log(`  (old bound 0.17)                                          ${base.ratio < 0.17 ? "would PASS" : "would FAIL"}`);

  // (a) fifth nav column — clone an existing column and widen the grid to 10.
  const a = await page.evaluate((m) => {
    const nav = document.querySelector(".tl-footer nav");
    const cols = [...nav.children];
    const clone = cols[cols.length - 1].cloneNode(true);
    clone.setAttribute("data-qa-injected", "5th");
    nav.appendChild(clone);
    // Four columns span 2 master columns each over 8; five must fit the same 8,
    // so the honest simulation is to let the extra column wrap to a new row,
    // which is what the master grid does with `span 2` cells.
    const r = eval(`(${m})`)();
    return r;
  }, measure.toString());
  console.log(`  + a 5th nav column               ${String(a.px).padStart(8)} px   ratio ${a.ratio.toFixed(4)}   ${a.ratio < 0.26 ? "PASS (bound NOT breached)" : "BREACHED 0.26"}`);
  await page.evaluate(() => document.querySelector('[data-qa-injected="5th"]')?.remove());

  // (b) grow the first link column past ~9 rows.
  const b = await page.evaluate((m) => {
    const col = document.querySelector(".tl-footer nav div");
    const proto = col.querySelector("a");
    const have = col.querySelectorAll("a").length;
    for (let i = have; i < 12; i++) {
      const c = proto.cloneNode(true);
      c.setAttribute("data-qa-injected", "row");
      c.textContent = `Uzun Kategori Adı ${i}`;
      col.appendChild(c);
    }
    return eval(`(${m})`)();
  }, measure.toString());
  console.log(`  + link column grown to 12 rows   ${String(b.px).padStart(8)} px   ratio ${b.ratio.toFixed(4)}   ${b.ratio < 0.26 ? "PASS (bound NOT breached)" : "BREACHED 0.26"}`);
  await page.evaluate(() => document.querySelectorAll('[data-qa-injected="row"]').forEach((n) => n.remove()));

  // (c) conversion rule wrapped onto two rows.
  const c = await page.evaluate((m) => {
    const conv = document.querySelector(".shell-footer-conversion");
    if (!conv) return { px: -1, ratio: -1 };
    conv.style.flexWrap = "wrap";
    conv.style.display = "flex";
    const actions = conv.querySelector(".shell-footer-actions");
    if (actions) actions.style.flexBasis = "100%";
    const journal = conv.querySelector(".shell-footer-journal");
    if (journal) journal.style.flexBasis = "100%";
    return eval(`(${m})`)();
  }, measure.toString());
  console.log(`  + conversion rule wrapped to 2   ${String(c.px).padStart(8)} px   ratio ${c.ratio.toFixed(4)}   ${c.ratio < 0.26 ? "PASS (bound NOT breached)" : "BREACHED 0.26"}`);

  console.log(`  deleted mega footer 1398px       ${(1398 / width).toFixed(4)} ratio at this width  -> ${1398 / width < 0.26 ? "would PASS" : "BREACHED 0.26"}`);

  await ctx.close();
}

await browser.close();
