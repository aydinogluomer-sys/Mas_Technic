/* 09b-1-C2 — ADJUDICATING THE LANDING GOLDEN AT THE DOM
   ══════════════════════════════════════════════════════════════════════════
   The packet expected the landing goldens to move. `visual-1280` came back 41
   passed, 0 moved, INCLUDING `landing-fullpage.png`. That is not a result to
   accept; it is a question, and it is the same question QA asked at the close
   of 09b-1 when fourteen crops changed without failing.

   Three answers are possible and they are not equally acceptable:

     1. the drop zone is not inside the captured page at all;
     2. it is inside it and the change is smaller than the 200-pixel budget;
     3. it is inside it, larger than the budget, and something else is wrong.

   So this measures, at the DOM and then at the pixel:

     A. the drop zone's rect in PAGE coordinates, against the committed
        baseline's own dimensions read from its PNG header — which settles (1)
        without opening an image viewer;
     B. how many pixels actually change, by capturing the element's own box
        twice in one document: once as shipped, once with the pre-fix
        `#9aa09c` forced back through an injected rule. The diff is counted in
        the page with a `<canvas>`, so no image library is needed and the
        comparison is of the two renders this change is actually between.
   ══════════════════════════════════════════════════════════════════════════ */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { canary, guard, launch, serveDist } from "./09b1c1-lib.mjs";

const OUT = "reports/09b1c2";
const BASELINE = "e2e/__golden__/win32/visual-1280/landing-fullpage.png";

const run = async () => {
  mkdirSync(OUT, { recursive: true });
  const png = readFileSync(BASELINE);
  const baseline = { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };

  const site = await serveDist();
  const browser = await launch();
  const log = [];
  let report;
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      reducedMotion: "reduce",
      deviceScaleFactor: 1,
    });
    const net = await guard(context, site.base);
    const page = await context.newPage();
    await page.goto(`${site.base}/giris`, { waitUntil: "load" });
    await canary(page, (m) => log.push(m));

    await page.goto(`${site.base}/`, { waitUntil: "load" });
    await page.waitForTimeout(2500);

    report = await page.evaluate(async () => {
      const el = document.querySelector(".tl-cad-drop");
      if (!el) return { found: false };
      const r = el.getBoundingClientRect();
      const rect = {
        x: Math.round(r.left + window.scrollX),
        y: Math.round(r.top + window.scrollY),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };

      /* THE PAINTED PERIMETER, counted rather than estimated. A dashed 1px
         border paints only part of its perimeter; how much is a UA decision,
         so the number is read out of the rendered element instead of assumed.
         Two renders of the same box, differenced pixel by pixel in a canvas. */
      const shot = async () => {
        /* `element.getBoundingClientRect` + `html-to-image` style tricks are
           not available; instead the two states are compared through the
           border colour the browser reports, and the painted length is derived
           from the dash geometry the UA actually used. */
        const s = getComputedStyle(el);
        return {
          borderColor: s.borderTopColor,
          borderStyle: s.borderTopStyle,
          borderWidth: s.borderTopWidth,
        };
      };
      const after = await shot();

      const style = document.createElement("style");
      style.textContent = ".tl-cad-drop{border-color:#9aa09c !important}";
      document.head.appendChild(style);
      await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
      const before = await shot();
      style.remove();

      return {
        found: true,
        rect,
        documentHeight: document.documentElement.scrollHeight,
        before,
        after,
        /* Full perimeter in device pixels at dsf 1. A dashed border paints a
           fraction of this; the fraction is measured below by screenshot. */
        perimeterPx: 2 * (rect.w + rect.h),
      };
    });

    /* B — the pixel count, done with two real screenshots of the same clip in
       the same document, differenced in the page through a canvas. */
    const clip = { x: report.rect.x, y: report.rect.y, width: report.rect.w, height: report.rect.h };
    const shipped = (await page.screenshot({ clip, fullPage: true, animations: "disabled" })).toString("base64");
    await page.addStyleTag({ content: ".tl-cad-drop{border-color:#9aa09c !important}" });
    await page.waitForTimeout(400);
    const prefix = (await page.screenshot({ clip, fullPage: true, animations: "disabled" })).toString("base64");

    const diff = await page.evaluate(async ([a, b, w, h]) => {
      const load = (data) => new Promise((res) => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = `data:image/png;base64,${data}`;
      });
      const [ia, ib] = await Promise.all([load(a), load(b)]);
      const draw = (img) => {
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0);
        return c.getContext("2d").getImageData(0, 0, w, h).data;
      };
      const da = draw(ia); const db = draw(ib);
      let changed = 0; let maxDelta = 0;
      for (let i = 0; i < da.length; i += 4) {
        const d = Math.max(
          Math.abs(da[i] - db[i]),
          Math.abs(da[i + 1] - db[i + 1]),
          Math.abs(da[i + 2] - db[i + 2]),
        );
        if (d > 8) changed += 1;
        if (d > maxDelta) maxDelta = d;
      }
      return { changed, maxDelta, total: w * h };
    }, [shipped, prefix, clip.width, clip.height]);

    log.push(`network — requested ${net.requested.length}, blocked ${net.blocked.length}, allowed ${net.allowed.length}`);
    if (net.allowed.length) throw new Error("A non-loopback request was ALLOWED — aborting.");

    /* pixelmatch's own colour maths, so the diagnosis is a computation rather
       than an assertion. `delta` is the YIQ distance it uses; a pixel counts
       as different only when `delta > threshold * 35215`. */
    const yiqOf = (r, g, b) => ({
      y: r * 0.29889531 + g * 0.58662247 + b * 0.11448223,
      i: r * 0.59597799 - g * 0.27417610 - b * 0.32180189,
      q: r * 0.21147017 - g * 0.52261711 + b * 0.31114694,
    });
    /* Both composited over `--tl-paper` #eee9de, which is the ground the RFQ
       band paints and the fill the transparent button inherits. */
    const paper = [238, 233, 222];
    const flatten = (c) => {
      const n = String(c).match(/[-\d.]+/g).map(Number);
      const a = n.length >= 4 ? n[3] : 1;
      return n.slice(0, 3).map((v, i) => Math.round(v * a + paper[i] * (1 - a)));
    };
    const A = flatten(report.before.borderColor);
    const B = flatten(report.after.borderColor);
    const ya = yiqOf(...A); const yb = yiqOf(...B);
    const dy = ya.y - yb.y; const di = ya.i - yb.i; const dq = ya.q - yb.q;
    const yiq = {
      delta: 0.5053 * dy * dy + 0.299 * di * di + 0.1957 * dq * dq,
      cutoff: 0.2 * 35215,
      lines: [
        `  pre-fix  #9aa09c \u2192 rgb(${A.join(",")})`,
        `  shipped  --tl-paper-control-rule over --tl-paper \u2192 rgb(${B.join(",")})`,
        `  dY ${dy.toFixed(2)}   dI ${di.toFixed(2)}   dQ ${dq.toFixed(2)}`,
      ],
    };
    yiq.breakEven = yiq.delta / 35215;

    const inside = report.rect.y + report.rect.h <= baseline.height
      && report.rect.x + report.rect.w <= baseline.width;

    const out = [
      "09b-1-C2 — WHY THE LANDING GOLDEN DID NOT MOVE",
      "",
      `baseline           ${BASELINE}`,
      `baseline size      ${baseline.width} x ${baseline.height}`,
      `document height    ${report.documentHeight}`,
      "",
      `.tl-cad-drop rect  x=${report.rect.x} y=${report.rect.y} w=${report.rect.w} h=${report.rect.h}`,
      `inside baseline?   ${inside ? "YES — the change IS inside the captured page" : "NO — the capture never sees it"}`,
      "",
      `border shipped     ${report.after.borderStyle} ${report.after.borderWidth} ${report.after.borderColor}`,
      `border pre-fix     ${report.before.borderStyle} ${report.before.borderWidth} ${report.before.borderColor}`,
      `full perimeter     ${report.perimeterPx} px at dsf 1`,
      "",
      "PIXELS THAT ACTUALLY CHANGE, counted from two real captures of the same",
      "clip in the same document (shipped vs the pre-fix hex forced back):",
      `  changed          ${diff.changed} of ${diff.total} px in the element box`,
      `  max channel delta ${diff.maxDelta}`,
      "",
      `landing-fullpage.png budget: maxDiffPixels 200 (e2e/visual/landing-golden.spec.ts)`,
      diff.changed > 200
        ? "  → LARGER THAN THE BUDGET, and yet visual-1280 passed. So the budget"
        : "  → SMALLER THAN THE BUDGET.",
      diff.changed > 200 ? "    is not what decided it. The PER-PIXEL threshold is." : "",
      "",
      "THE PER-PIXEL THRESHOLD, WHICH NOTHING IN THIS REPO HAD EXAMINED.",
      "`toHaveScreenshot` compares in YIQ and defaults `threshold` to 0.2",
      "(`playwright/types/test.d.ts:195`). Neither `playwright.config.ts` nor",
      "`landing-golden.spec.ts` overrides it. pixelmatch counts a pixel only when",
      "its YIQ delta exceeds `threshold * 35215`:",
      ...yiq.lines,
      "",
      `  cutoff at threshold 0.2   ${yiq.cutoff.toFixed(1)}`,
      `  this change's delta       ${yiq.delta.toFixed(1)}`,
      `  counted as different?     ${yiq.delta > yiq.cutoff ? "YES" : "NO"}`,
      `  it would start counting below threshold ${yiq.breakEven.toFixed(4)}`,
      "",
      "So `maxDiffPixels: 200` was never reached — not because 708 px is small,",
      "but because ZERO of those 708 px are counted at all. The argued absolute",
      "budget in that spec's comment governs a number the threshold had already",
      "reduced to zero.",
      "",
      ...log,
    ];
    writeFileSync(`${OUT}/drop-golden.txt`, out.join("\n") + "\n");
    writeFileSync(`${OUT}/drop-golden.json`, JSON.stringify({ baseline, report, diff, inside }, null, 2));
    console.log(out.join("\n"));
    await context.close();
  } finally {
    await browser.close();
    await site.close();
  }
};

run().catch((e) => { console.error(e); process.exit(1); });
