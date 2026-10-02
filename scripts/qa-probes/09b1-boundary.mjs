/* QA 09b-1 — CONTROL BOUNDARY, MEASURED FROM PAINTED PIXELS
   ==========================================================================
   Deliberately NOT the Coder's method.

   `reports/09b1c1/probe-control-boundary.mjs` discovers controls by walking
   bordered boxes and composites alpha in JS from `getComputedStyle`. Both
   halves of that can be wrong in the same direction: a control with no border
   is never discovered, and a compositing bug in the maths is invisible because
   the maths is also the oracle.

   This probe:
     · discovers controls from the ACCESSIBILITY-relevant tag/role list, so a
       control the box-walk misses is still measured (and reported as such);
     · reads the actual painted RGB off a screenshot, so the browser's own
       compositor is the oracle and alpha maths never enters;
     · reaches the two grounds the app cannot currently produce — a paper band
       nested in a paper root, and a graphite band nested in a paper root — by
       injecting the band markup at runtime. That mutates the DOM of a running
       page; it does not touch a production file.

   Network posture: `guard()` at allowHosts=[] and a live canary before any
   control is touched. Reused verbatim from `reports/09b1c1/probe-lib.mjs`.
   ========================================================================== */
import { writeFileSync, mkdirSync } from "node:fs";
import { guard, canary, launch, BASE } from "../../reports/09b1c1/probe-lib.mjs";

const OUT = "reports/qa/phase-09b1";
mkdirSync(OUT, { recursive: true });

const lines = [];
const log = (s) => { lines.push(s); console.log(s); };

/* ── colour ─────────────────────────────────────────────────────────────── */
const lin = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const L = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
const hex = (c) => "#" + c.slice(0, 3).map((v) => v.toString(16).padStart(2, "0")).join("");

/* ── the control census: by TAG AND ROLE, not by "has a border" ─────────── */
const CONTROL_SELECTOR = [
  "input:not([type=hidden])", "select", "textarea", "button",
  "[role=button]", "[role=checkbox]", "[role=switch]", "[role=radio]",
  "[role=tab]", "[role=combobox]", "[role=slider]", "[role=spinbutton]",
  "[role=textbox]", "[role=searchbox]", "summary", "[contenteditable=true]",
].join(",");

const ROUTES = [
  ["/giris", "graphite root — auth"],
  ["/sifremi-unuttum", "graphite root — auth"],
  ["/reset-password", "graphite root — auth"],
  ["/iletisim", "graphite root + paper band"],
  ["/malzemeler", "graphite root — register controls"],
  ["/sss", "graphite root + paper band w/ toggles"],
  ["/teklif-al", "graphite root — RFQ form"],
  ["/kalite-dosyasi", "graphite root + paper bands"],
  ["/bu-sayfa-yok-09b1qa", "PAPER ROOT (404)"],
  ["/", "landing — footer controls"],
];

/* Markup injected to reach the grounds the app cannot currently produce.
   Every class here is a shipped class; nothing new is invented. */
const INJECT = (tone) => `
  <section class="tl-band qa09b1-probe-band" data-band-tone="${tone}" style="padding:24px">
    <div class="shell-field" style="max-width:320px">
      <label for="qa09b1-in-${tone}">QA SONDA</label>
      <input id="qa09b1-in-${tone}" type="text" />
    </div>
    <div style="height:16px"></div>
    <button class="shell-action shell-action--ghost" type="button">QA GHOST ${tone}</button>
    <div style="height:16px"></div>
    <button class="shell-segment" type="button" aria-pressed="false">QA SEGMENT</button>
    <div style="height:16px"></div>
    <div class="shell-auth-social" style="max-width:320px"><button type="button">QA SOCIAL</button><button type="button">QA SOCIAL 2</button></div>
  </section>`;

/* ── the sampler: one viewport screenshot, decoded in a scratch page ─────── */
async function makeSampler(context, page) {
  const shot = await page.screenshot({ type: "png", fullPage: true });
  const b64 = shot.toString("base64");
  const scratch = await context.newPage();
  await scratch.goto("about:blank");
  await scratch.evaluate(async (data) => {
    const img = new Image();
    img.src = "data:image/png;base64," + data;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    c.getContext("2d").drawImage(img, 0, 0);
    window.__px = c.getContext("2d").getImageData(0, 0, img.width, img.height);
  }, b64);
  const read = async (pts) => scratch.evaluate((points) => {
    const d = window.__px;
    return points.map(([x, y]) => {
      if (x < 0 || y < 0 || x >= d.width || y >= d.height) return null;
      const i = (Math.round(y) * d.width + Math.round(x)) * 4;
      return [d.data[i], d.data[i + 1], d.data[i + 2]];
    });
  }, pts);
  return { read, close: () => scratch.close() };
}

/* Sample a perpendicular run across one edge and pick the pixel that is
   actually the boundary: the one most different from the outside colour. */
function adjudicate(run) {
  // run[0..2] = outside (3,2,1 px out), run[3..5] = the edge band, run[6..8] = inside
  const outside = run[0], inside = run[8];
  if (!outside || !inside) return null;
  const band = run.slice(3, 6).filter(Boolean);
  if (!band.length) return null;
  let border = band[0];
  for (const p of band) if (dist(p, outside) > dist(border, outside)) border = p;
  /* THE RULE, and it is not the Coder's.
     WCAG 1.4.11 asks for 3:1 between the component and the ADJACENT colours —
     the ground it sits on. A filled button whose border and fill are the same
     colour is identified by its fill and passes; requiring border-vs-fill as
     well (the Coder's "against BOTH adjacent colours") is stricter than the
     criterion. So the identifying figure is whichever of the two edges of the
     control actually separates it from the page:
        identify = max( border vs ground , fill vs ground )
     border-vs-fill is still reported, because it is what tells you whether the
     BORDER is doing the identifying — the case the auth fields are in. */
  return {
    outside, inside, border,
    borderVsGround: ratio(border, outside),
    fillVsGround: ratio(inside, outside),
    borderVsFill: ratio(border, inside),
    identify: Math.max(ratio(border, outside), ratio(inside, outside)),
  };
}

function edgePoints(box, side) {
  const x = box.x, y = box.y, w = box.width, h = box.height;
  const pts = [];
  if (side === "left") {
    const cy = Math.round(y + h / 2);
    for (let d = -3; d <= 5; d++) pts.push([Math.round(x) + d, cy]);
  } else if (side === "top") {
    const cx = Math.round(x + w / 2);
    for (let d = -3; d <= 5; d++) pts.push([cx, Math.round(y) + d]);
  } else if (side === "__unused") {
    const cy = Math.round(y + h / 2);
    for (let d = 3; d >= -5; d--) pts.push([Math.round(x + w) - 1 - d + 3, cy]);
  }
  return pts;
}

async function measurePage(context, page, routeLabel, tag, results) {
  const controls = await page.evaluate((sel) => {
    const out = [];
    document.querySelectorAll(sel).forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (r.width < 4 || r.height < 4) return;
      if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) return;
      if (r.width > innerWidth * 1.5) return;
      const bw = parseFloat(cs.borderLeftWidth) || 0;
      el.setAttribute("data-qa09b1", String(i));
      out.push({
        idx: i,
        tag: el.tagName.toLowerCase(),
        cls: el.className && typeof el.className === "string" ? el.className.slice(0, 60) : "",
        text: (el.textContent || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 28),
        box: { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height },
        fixed: cs.position === "fixed",
        borderWidth: bw,
        borderColor: cs.borderLeftColor,
        bg: cs.backgroundColor,
        disabled: el.disabled === true,
        inPaperBand: !!el.closest('.tl-band[data-band-tone="paper"]'),
        inGraphiteBand: !!el.closest('.tl-band[data-band-tone="graphite"]'),
        rootSurface: (el.closest("[data-shell-surface]") || {}).dataset?.shellSurface ?? "none",
        // does the COder's discovery method (walk bordered boxes) find it?
        boxWalkFinds: bw > 0,
      });
    });
    return out;
  }, CONTROL_SELECTOR);

  const sampler = await makeSampler(context, page);
  /* INSTRUMENT SELF-CHECK. If nine widely-spread pixels are all the same
     colour, the sampler is reading a curtain, not the page. Refuse the
     measurement rather than report 1:1 for everything. */
  const vp = await page.evaluate(() => ({ w: innerWidth, h: document.documentElement.scrollHeight }));
  const spread = [];
  for (const fx of [0.1, 0.5, 0.9]) for (const fy of [0.15, 0.5, 0.85]) spread.push([Math.round(vp.w * fx), Math.round(vp.h * fy)]);
  const sp = (await sampler.read(spread)).filter(Boolean).map((p) => p.join(","));
  if (new Set(sp).size <= 1) {
    log(`!! CURTAIN DETECTED on ${routeLabel} [${tag}] — every sample ${sp[0]}; measurement REFUSED`);
    await sampler.close();
    return;
  }
  for (const c of controls) {
    const runs = {};
    for (const side of ["left", "top"]) {
      const pts = edgePoints(c.box, side);
      const px = await sampler.read(pts);
      runs[side] = adjudicate(px);
    }
    const best = ["left", "top"].map((s) => runs[s]).filter(Boolean);
    if (!best.length) continue;
    const ident = Math.min(...best.map((b) => b.identify));
    const pick = best.find((b) => b.identify === ident);
    results.push({
      route: routeLabel, ...c, state: tag,
      identify: +ident.toFixed(2),
      borderVsGround: +pick.borderVsGround.toFixed(2),
      fillVsGround: +pick.fillVsGround.toFixed(2),
      borderVsFill: +pick.borderVsFill.toFixed(2),
      painted: { border: hex(pick.border), outside: hex(pick.outside), inside: hex(pick.inside) },
    });
  }
  await sampler.close();
}

/* ── run ─────────────────────────────────────────────────────────────────── */
const browser = await launch();
const results = [];
const missedByBoxWalk = [];

for (const forced of [false, true]) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    ...(forced ? { forcedColors: "active" } : {}),
  });
  const t = await guard(context, []);
  const probe = await context.newPage();
  await probe.goto(`${BASE}/`, { waitUntil: "load" });
  await canary(probe, log);
  await probe.close();

  for (const [route, label] of ROUTES) {
    const page = await context.newPage();
    await page.goto(`${BASE}${route}`, { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});
    /* The page-transition curtain paints over the whole document for the
       first beat. Sampling through it reports every control at 1:1 — which is
       exactly the kind of instrument error that would have made this probe
       agree with anything. Wait it out, then prove it is gone. */
    await page.waitForTimeout(2600);
    await measurePage(context, page, `${route} (${label})`, forced ? "forced-colors" : "default", results);

    /* THE GROUNDS THE APP CANNOT PRODUCE. Inject a paper band and a graphite
       band into whatever root this route has, and measure the same controls
       inside them. */
    if (!forced && (route === "/bu-sayfa-yok-09b1qa" || route === "/giris")) {
      for (const tone of ["paper", "graphite"]) {
        await page.evaluate(({ html }) => {
          document.querySelectorAll(".qa09b1-probe-band").forEach((n) => n.remove());
          const host = document.querySelector("main") || document.querySelector(".shell-root") || document.body;
          host.insertAdjacentHTML("afterbegin", html);
          window.scrollTo(0, 0);
        }, { html: INJECT(tone) });
        await page.waitForTimeout(500);
        await measurePage(context, page, `${route} :: INJECTED ${tone} band`, `nested-${tone}`, results);
      }
      await page.evaluate(() => document.querySelectorAll(".qa09b1-probe-band").forEach((n) => n.remove()));
    }
    await page.close();
  }
  log(`traffic (${forced ? "forced-colors" : "default"}): blocked ${t.blocked.length}, ALLOWED ${t.allowed.length}`);
  if (t.allowed.length) log(`  ALLOWED URLS: ${t.allowed.join(" | ")}`);
  await context.close();
}
await browser.close();

/* ── report ──────────────────────────────────────────────────────────────── */
const FLOOR = 3.0;
const fails = results.filter((r) => r.state !== "forced-colors" && !r.disabled && r.identify < FLOOR);
const boxWalkMisses = results.filter((r) => r.state === "default" && !r.boxWalkFinds);
const borderCarried = results.filter((r) => r.state !== "forced-colors" && !r.disabled && r.fillVsGround < 1.2);

log("");
log("── EVERY CONTROL, PAINTED-PIXEL BOUNDARY CONTRAST ─────────────────────");
log("state        route                                        ctrl                          ident brd/gnd fil/gnd brd/fil  border  ground  fill");
for (const r of results) {
  log(
    `${r.state.padEnd(12)} ${r.route.slice(0, 44).padEnd(44)} ${(r.cls || r.tag).slice(0, 28).padEnd(28)} ` +
    `${String(r.identify).padStart(5)} ${String(r.borderVsGround).padStart(7)} ${String(r.fillVsGround).padStart(7)} ${String(r.borderVsFill).padStart(7)}  ` +
    `${r.painted.border} ${r.painted.outside} ${r.painted.inside}${r.disabled ? "  [disabled]" : ""}${r.boxWalkFinds ? "" : "  [NO BORDER]"}`,
  );
}
log("");
log(`controls measured: ${results.length}`);
log(`below 3:1 (excluding disabled/forced-colors): ${fails.length}`);
for (const f of fails) log(`  FAIL ident=${f.identify}:1 (border/ground ${f.borderVsGround}, fill/ground ${f.fillVsGround})  ${f.state}  ${f.route}  ${f.cls || f.tag}  "${f.text}"`);
log("");
log(`controls whose FILL is <1.2:1 from their ground — the border is the whole control: ${borderCarried.length}`);
for (const b of borderCarried) log(`  border-carried  ${b.borderVsGround.toFixed ? b.borderVsGround : b.borderVsGround}:1  ${b.state}  ${b.route}  ${b.cls || b.tag}  "${b.text}"`);
log("");
log(`controls with NO css border — invisible to a bordered-box discovery: ${boxWalkMisses.length}`);
for (const m of boxWalkMisses) log(`  MISS  ${m.route}  <${m.tag}> ${m.cls}  "${m.text}"`);

writeFileSync(`${OUT}/boundary.txt`, lines.join("\n") + "\n");
writeFileSync(`${OUT}/boundary.json`, JSON.stringify(results, null, 1));
