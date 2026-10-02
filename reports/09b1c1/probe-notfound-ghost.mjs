/* WHY THAT ONE GOLDEN AND NOT THE OTHER FOURTEEN?
   ------------------------------------------------------------------------
   `waveb-notfound-body` failed at all four viewports with 392 differing
   pixels, and its crop contains exactly one changed control — a 148x44
   `.shell-action--ghost`, perimeter 380. But `inner-hero-contact` contains a
   194x44 one, perimeter 472, with a TIGHTER tolerance (120 against 200), and
   it passed. Two crops, the same component, the same change, opposite
   verdicts. One of those two results is telling me something I have not
   understood, and updating a baseline before understanding it is exactly the
   move `IMPLEMENTATION.md` §12 forbids.

   The obvious candidate is the ground: pixelmatch scores a colour difference
   in YIQ and counts it only above `threshold² * 35215` (0.04 * 35215 = 1408
   at Playwright's default 0.2). The same border alpha over two different
   grounds produces two different deltas. So this measures the ground under
   each of the two buttons and computes the delta the comparator would see. */
import { writeFileSync } from "node:fs";
import { launch, guard, canary, BASE } from "./probe-lib.mjs";

const CASES = [
  { name: "notfound-ghost", path: "/olmayan-sayfa/cnc-frezelme", selector: ".shell-notfound .shell-action--ghost" },
  { name: "hero-contact-ghost", path: "/iletisim", selector: ".shell-hero .shell-action--ghost" },
  { name: "next-service-ghost", path: "/hizmetler/cnc-frezeleme", selector: ".shell-next .shell-action--ghost" },
  { name: "footer-secondary", path: "/hakkimizda", selector: "footer.tl-footer .shell-footer-secondary" },
  { name: "footer-social", path: "/hakkimizda", selector: "footer.tl-footer .tl-social a" },
];

const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const traffic = await guard(context, []);
const rows = [];
let canaryResult = null;

for (const c of CASES) {
  const page = await context.newPage();
  await page.goto(`${BASE}${c.path}`, { waitUntil: "load", timeout: 45_000 });
  await page.waitForSelector(".shell-root", { timeout: 30_000 });
  await page.waitForTimeout(1200);
  if (canaryResult === null) canaryResult = await canary(page, (m) => console.log(m));

  const row = await page.evaluate((selector) => {
    const parse = (s) => { const n = String(s).match(/[-\d.]+/g); return n && n.length >= 3 ? n.slice(0, 3).map(Number) : null; };
    const alphaOf = (col) => {
      const m = String(col).match(/rgba?\(([^)]+)\)/);
      const parts = m ? m[1].split(",").map((v) => parseFloat(v)) : [];
      return parts.length === 4 ? parts[3] : (String(col) === "transparent" ? 0 : 1);
    };
    const over = (col, ground) => {
      const a = alphaOf(col); const x = parse(col); const y = parse(ground);
      if (!x || !y) return null;
      return x.map((v, i) => Math.round(a * v + (1 - a) * y[i]));
    };
    const groundOf = (el) => {
      const stack = [];
      let node = el.parentElement;
      let base = null;
      while (node) {
        const bg = getComputedStyle(node).backgroundColor;
        if (alphaOf(bg) > 0.999 && parse(bg)) { base = bg; break; }
        if (alphaOf(bg) > 0) stack.push(bg);
        node = node.parentElement;
      }
      if (!base) base = "rgb(0, 0, 0)";
      let flat = parse(base);
      for (let i = stack.length - 1; i >= 0; i -= 1) flat = over(stack[i], `rgb(${flat.join(",")})`) ?? flat;
      return flat;
    };
    const el = document.querySelector(selector);
    if (!el) return { found: false };
    const s = getComputedStyle(el);
    const ground = groundOf(el);
    const box = el.getBoundingClientRect();
    return {
      found: true,
      tone: (el.closest("[data-band-tone]") ?? el.closest("[data-shell-surface]"))?.getAttribute("data-band-tone")
        ?? el.closest("[data-shell-surface]")?.getAttribute("data-shell-surface") ?? "unknown",
      borderRaw: s.borderTopColor,
      ground: `rgb(${ground.join(", ")})`,
      newFlat: over(s.borderTopColor, `rgb(${ground.join(",")})`),
      width: Number(box.width.toFixed(3)),
      height: Number(box.height.toFixed(3)),
      left: Number(box.left.toFixed(3)),
      top: Number(box.top.toFixed(3)),
    };
  }, c.selector);

  /* The OLD value for each role, so the delta the comparator saw can be
     recomputed rather than guessed. */
  const OLD = { "rgba(227, 231, 225, 0.44)": [227, 231, 225, 0.28], "rgba(18, 23, 25, 0.54)": [18, 23, 25, 0.3] };
  let oldFlat = null;
  if (row.found && OLD[row.borderRaw]) {
    const [r, g, b, a] = OLD[row.borderRaw];
    const gr = row.ground.match(/[\d.]+/g).map(Number);
    oldFlat = [r, g, b].map((v, i) => Math.round(a * v + (1 - a) * gr[i]));
  }
  const yiq = ([r, g, b]) => [
    0.29889531 * r + 0.58662247 * g + 0.11448223 * b,
    0.59597799 * r - 0.27417610 * g - 0.32180189 * b,
    0.21147017 * r - 0.52261711 * g + 0.31114694 * b,
  ];
  let delta = null;
  if (oldFlat && row.newFlat) {
    const [y1, i1, q1] = yiq(oldFlat);
    const [y2, i2, q2] = yiq(row.newFlat);
    delta = 0.5053 * (y1 - y2) ** 2 + 0.299 * (i1 - i2) ** 2 + 0.1957 * (q1 - q2) ** 2;
  }
  const CUTOFF = 35215.04 * 0.2 ** 2;
  rows.push({ ...c, ...row, oldFlat, pixelmatchDelta: delta, cutoff: CUTOFF, counted: delta !== null ? delta > CUTOFF : null });
  console.log(
    `${c.name.padEnd(20)} tone ${String(row.tone).padEnd(10)} ground ${String(row.ground).padEnd(18)}`
    + ` old ${JSON.stringify(oldFlat)} -> new ${JSON.stringify(row.newFlat)}  delta ${delta === null ? "n/a" : delta.toFixed(0)}`
    + ` cutoff ${CUTOFF.toFixed(0)}  counted ${delta !== null ? delta > CUTOFF : "n/a"}`
    + `  box ${row.width}x${row.height} @ ${row.left},${row.top}`,
  );
  await page.close();
}

console.log(`\ncanary: ${canaryResult}`);
console.log(`traffic: blocked ${traffic.blocked.length}, ALLOWED ${traffic.allowed.length}`);
writeFileSync("reports/09b1c1/notfound-ghost.json", JSON.stringify({ canary: canaryResult, rows }, null, 2));
await context.close();
await browser.close();
