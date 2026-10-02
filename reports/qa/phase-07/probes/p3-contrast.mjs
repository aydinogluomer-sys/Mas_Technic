/* PROBE 3 — measure the real contrast of the nodes axe DECLINED to judge.
 *
 * Two instruments, deliberately, because the Coder's report rests on which one
 * you believe:
 *
 *   A. SPECIFIED-COLOUR RATIO (what WCAG SC 1.4.3 actually asks for).
 *      Foreground = the element's computed `color`. Background = the modal
 *      pixel of the element's own box captured with the GLYPHS REMOVED
 *      (`color: transparent`), so it is the real composited stack — every
 *      ancestor background, image, gradient and overlay — not a guess.
 *
 *   B. PIXEL-EXTRACTION RATIO (the Coder's "pixel method").
 *      Foreground = the extreme pixel that changed between the with-glyphs and
 *      without-glyphs captures. This is the instrument whose caveat the packet
 *      asks me to test.
 *
 * `--selftest` runs both instruments over a synthetic page with KNOWN colours
 * at 8/9/10/11/12/16/24px, which is the negative control: if B under-reports
 * on a page whose true ratio is known by construction, B is unsound and any
 * finding that rests on B is an instrument artefact.
 */
import { launch, ctx, goto, BASE } from "./lib.mjs";

/* ── WCAG 2.x relative luminance and contrast ratio ─────────────────────── */
function lum([r, g, b]) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
function parseColor(css) {
  const m = css.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
  return [p[0], p[1], p[2], p[3] ?? 1];
}

/* ── pixel helpers ──────────────────────────────────────────────────────── */
/* No PNG library is installed and `npm install` is out of bounds for QA, so the
   PNG is decoded by the browser itself: base64 -> Image -> canvas -> pixels.
   The decode is lossless; the numbers below are the screenshot's own bytes. */
async function decode(page, buf) {
  const b64 = buf.toString("base64");
  const flat = await page.evaluate(async (data) => {
    const img = new Image();
    img.src = "data:image/png;base64," + data;
    await img.decode();
    const cv = document.createElement("canvas");
    cv.width = img.naturalWidth;
    cv.height = img.naturalHeight;
    const g = cv.getContext("2d", { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    return { w: cv.width, h: cv.height, bytes: Array.from(d) };
  }, b64);
  const px = [];
  for (let i = 0; i < flat.bytes.length; i += 4) px.push([flat.bytes[i], flat.bytes[i + 1], flat.bytes[i + 2]]);
  return { w: flat.w, h: flat.h, px };
}
function modal(px) {
  const counts = new Map();
  for (const p of px) {
    const k = p.join(",");
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  let best = null, bestN = -1;
  for (const [k, n] of counts) if (n > bestN) { bestN = n; best = k; }
  return { rgb: best.split(",").map(Number), share: bestN / px.length, distinct: counts.size };
}

/* Capture one element twice — with glyphs and with `color: transparent` — and
   return both pixel arrays over the identical clip. */
async function capturePair(page, handle) {
  const box = await handle.boundingBox();
  if (!box || box.width < 1 || box.height < 1) return null;
  const clip = {
    x: Math.floor(box.x),
    y: Math.floor(box.y),
    width: Math.max(2, Math.ceil(box.width)),
    height: Math.max(2, Math.ceil(box.height)),
  };
  const withTextBuf = await page.screenshot({ clip });
  await handle.evaluate((el) => {
    el.dataset.qaPrevColor = el.style.color;
    el.style.setProperty("color", "transparent", "important");
    el.style.setProperty("text-shadow", "none", "important");
    el.style.setProperty("-webkit-text-stroke", "0", "important");
  });
  await page.waitForTimeout(80);
  const noTextBuf = await page.screenshot({ clip });
  await handle.evaluate((el) => {
    el.style.removeProperty("color");
    el.style.removeProperty("text-shadow");
    el.style.removeProperty("-webkit-text-stroke");
    if (el.dataset.qaPrevColor) el.style.color = el.dataset.qaPrevColor;
    delete el.dataset.qaPrevColor;
  });
  return {
    withText: await decode(page, withTextBuf),
    noText: await decode(page, noTextBuf),
    clip,
  };
}

async function measureNode(page, selector, label) {
  const handle = await page.$(selector);
  if (!handle) return { selector, label, error: "not found" };

  const meta = await handle.evaluate((el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const top = document.elementFromPoint(cx, cy);
    const chain = [];
    let n = el;
    while (n && chain.length < 8) {
      const s = getComputedStyle(n);
      chain.push({
        tag: n.tagName.toLowerCase(),
        cls: (n.getAttribute("class") || "").slice(0, 60),
        bg: s.backgroundColor,
        bgImage: s.backgroundImage === "none" ? null : s.backgroundImage.slice(0, 60),
        opacity: s.opacity,
      });
      n = n.parentElement;
    }
    return {
      text: (el.textContent || "").trim().slice(0, 60),
      color: cs.color,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      opacity: cs.opacity,
      ariaHidden: el.closest("[aria-hidden='true']") ? true : false,
      topElementAtCentre: top
        ? { tag: top.tagName.toLowerCase(), cls: (top.getAttribute("class") || "").slice(0, 60), isSelf: top === el }
        : null,
      ancestry: chain,
      box: [Math.round(r.width), Math.round(r.height)],
    };
  });

  const pair = await capturePair(page, handle);
  if (!pair) return { selector, label, meta, error: "no box" };

  const bg = modal(pair.noText.px);
  const fgSpec = parseColor(meta.color);

  // instrument B: the extreme changed pixel
  let extreme = null, extremeDist = -1;
  for (let i = 0; i < pair.withText.px.length; i++) {
    const w = pair.withText.px[i], n = pair.noText.px[i];
    const d = Math.abs(w[0] - n[0]) + Math.abs(w[1] - n[1]) + Math.abs(w[2] - n[2]);
    if (d > extremeDist) { extremeDist = d; extreme = w; }
  }
  const changed = pair.withText.px.filter((w, i) => {
    const n = pair.noText.px[i];
    return Math.abs(w[0] - n[0]) + Math.abs(w[1] - n[1]) + Math.abs(w[2] - n[2]) > 6;
  }).length;

  return {
    selector,
    label,
    meta,
    clip: pair.clip,
    background: { modal: bg.rgb, share: +bg.share.toFixed(3), distinct: bg.distinct },
    specifiedForeground: fgSpec,
    /** A — the WCAG figure. */
    ratioSpecified: fgSpec ? +ratio(fgSpec.slice(0, 3), bg.rgb).toFixed(3) : null,
    /** B — the Coder's "pixel method" figure. */
    pixelForeground: extreme,
    ratioPixel: extreme ? +ratio(extreme, bg.rgb).toFixed(3) : null,
    glyphPixels: changed,
    glyphPixelShare: +(changed / pair.withText.px.length).toFixed(4),
    required: (() => {
      const px = parseFloat(meta.fontSize);
      const w = Number(meta.fontWeight) || (meta.fontWeight === "bold" ? 700 : 400);
      const large = px >= 24 || (px >= 18.66 && w >= 700);
      return large ? 3.0 : 4.5;
    })(),
  };
}

/* ── self-test: known colours, known ratios ─────────────────────────────── */
const SELFTEST_HTML = `<!doctype html><html><head><meta charset="utf-8"><style>
  body { margin:0; background:#ffffff; font-family: Arial, Helvetica, sans-serif; }
  .row { background:#ffffff; color:#767676; padding:0; margin:0; }
</style></head><body>
  <div id="wrap"></div>
  <script>
    const sizes=[8,9,10,11,12,16,24,32];
    const wrap=document.getElementById('wrap');
    for (const s of sizes) {
      const d=document.createElement('div');
      d.className='row'; d.id='s'+s;
      d.style.fontSize=s+'px'; d.style.lineHeight='2';
      d.textContent='KARSILASTIRMA 0123';
      wrap.appendChild(d);
    }
  </script>
</body></html>`;

const browser = await launch();
const c = await ctx(browser, { width: 1280, height: 900, reduce: true });
const page = await c.newPage();
const out = { base: BASE, selftest: [], nodes: [] };

/* SELF-TEST — #767676 on #ffffff is 4.54:1 by construction. */
await page.setContent(SELFTEST_HTML);
await page.waitForTimeout(200);
for (const s of [8, 9, 10, 11, 12, 16, 24, 32]) {
  out.selftest.push({ size: s, ...(await measureNode(page, `#s${s}`, `selftest ${s}px`)) });
}

/* THE FOUR NODES AXE DECLINED, plus the declared known risk. */
const TARGETS = [
  { route: "/hizmetler/cnc-frezeleme", sel: ".shell-plate-no", label: "plate number" },
  { route: "/hizmetler/cnc-frezeleme", sel: ".shell-plate-caption", label: "plate caption" },
  { route: "/hizmetler/cnc-frezeleme", sel: ".shell-span-note > .shell-eyebrow", label: "span-note eyebrow" },
  {
    route: "/hizmetler/cnc-frezeleme",
    sel: 'section[aria-labelledby="detay-karsilastirma"] > .tl-band-index[aria-hidden="true"] > small',
    label: "band index rail caption (paper band) — declared known risk",
  },
  {
    route: "/endustriyel/havacilik-uzay",
    sel: 'section[aria-labelledby="detay-karsilastirma"] > .tl-band-index[aria-hidden="true"] > small',
    label: "band index rail caption (paper band) — sector page",
  },
  { route: "/", sel: ".tl-band-index small", label: "band index rail caption on the LANDING (control)" },
  { route: "/hakkimizda", sel: ".tl-band-index small", label: "band index rail caption on /hakkimizda" },
];

let current = null;
for (const t of TARGETS) {
  if (current !== t.route) {
    await goto(page, t.route);
    await page.waitForTimeout(500);
    current = t.route;
  }
  await page.$eval(t.sel, (el) => el.scrollIntoView({ block: "center", behavior: "instant" })).catch(() => {});
  await page.waitForTimeout(400);
  out.nodes.push({ route: t.route, ...(await measureNode(page, t.sel, t.label)) });
}

await c.close();
await browser.close();
process.stdout.write(JSON.stringify(out, null, 1) + "\n");
