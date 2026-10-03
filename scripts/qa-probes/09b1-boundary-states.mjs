/* QA 09b-1 — THE CONTROLS THE BOX-WALK CANNOT SEE, AND THE STATES NOBODY NAMED
   ==========================================================================
   `reports/09b1c1/probe-control-boundary.mjs:143` is `if (!edge) continue;`.
   Every element with no drawn border is dropped BEFORE the interactive test
   runs, so the file header's "keeps every element that is interactive ... and
   reports the two sets separately" describes a probe that does not exist: the
   interactive set is a strict subset of the bordered set. A control with no
   border cannot appear in `control-boundary-after.json` at all — which is not
   a small class, because "no border" is the shape a 1.4.11 failure takes when
   it is total rather than merely faint.

   Its route list is also seven routes, and `/` and the 404 are not among them.

   This probe measures, by painted pixel:
     A `.tl-cad-drop`      — enclosing DASHED boundary, hardcoded `#9aa09c`,
                             transparent fill, on the landing. Never measured.
     B `[data-chat-launcher]` — no border; identified by its fill; on EVERY
                             route including both auth routes, and it crosses
                             a paper band.
     C `.shell-auth-reveal`  — no border; identified by a glyph.
     D `.shell-check`        — the unreachability claim, verified as a claim.
     E `.tl-menu-trigger` at 375 — is the word there or not.
     F hover / focus-visible / disabled on every control C1 repainted.
   ========================================================================== */
import { writeFileSync, mkdirSync } from "node:fs";
import { guard, canary, launch, BASE } from "./probe-lib.mjs";

const OUT = "reports/qa/phase-09b1";
mkdirSync(OUT, { recursive: true });
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };

const lin = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const L = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const x = L(a), y = L(b); return +(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05))).toFixed(2); };
const hex = (c) => "#" + c.slice(0, 3).map((v) => v.toString(16).padStart(2, "0")).join("");

async function sampler(context, page) {
  const b64 = (await page.screenshot({ type: "png", fullPage: true })).toString("base64");
  const scratch = await context.newPage();
  await scratch.goto("about:blank");
  await scratch.evaluate(async (d) => {
    const img = new Image(); img.src = "data:image/png;base64," + d; await img.decode();
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    c.getContext("2d").drawImage(img, 0, 0);
    window.__px = c.getContext("2d").getImageData(0, 0, img.width, img.height);
  }, b64);
  return {
    read: (pts) => scratch.evaluate((points) => {
      const d = window.__px;
      return points.map(([x, y]) => {
        if (x < 0 || y < 0 || x >= d.width || y >= d.height) return null;
        const i = (Math.round(y) * d.width + Math.round(x)) * 4;
        return [d.data[i], d.data[i + 1], d.data[i + 2]];
      });
    }, pts),
    close: () => scratch.close(),
  };
}

const box = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return {
    x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height,
    border: cs.borderTopWidth + " " + cs.borderTopStyle + " " + cs.borderTopColor,
    borderW: parseFloat(cs.borderTopWidth) || 0,
    bg: cs.backgroundColor, color: cs.color, appearance: cs.appearance,
    accent: cs.accentColor, opacity: cs.opacity, text: (el.textContent || "").trim().slice(0, 40),
  };
}, sel);

async function settle(page, route) {
  await page.goto(`${BASE}${route}`, { waitUntil: "load" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(2600);
}

/* Walk ALONG an edge and take the extreme — the only way to read a DASHED
   border, where a single perpendicular sample lands in a gap half the time. */
async function edgeAlong(s, b, side) {
  const pts = [];
  const N = 60;
  if (side === "top") for (let i = 1; i < N; i++) pts.push([Math.round(b.x + (b.width * i) / N), Math.round(b.y)]);
  else for (let i = 1; i < N; i++) pts.push([Math.round(b.x), Math.round(b.y + (b.height * i) / N)]);
  const outPts = pts.map(([x, y]) => (side === "top" ? [x, y - 4] : [x - 4, y]));
  const inPts = pts.map(([x, y]) => (side === "top" ? [x, y + 6] : [x + 6, y]));
  const [edge, outs, ins] = [await s.read(pts), await s.read(outPts), await s.read(inPts)];
  const ground = outs.filter(Boolean)[Math.floor(outs.length / 2)];
  const fill = ins.filter(Boolean)[Math.floor(ins.length / 2)];
  let best = null, bestR = 0;
  for (const p of edge) { if (!p) continue; const r = ratio(p, ground); if (r > bestR) { bestR = r; best = p; } }
  return { border: best, ground, fill, borderVsGround: bestR, fillVsGround: ratio(fill, ground) };
}

const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
const t = await guard(context, []);
let page = await context.newPage();
await page.goto(`${BASE}/`, { waitUntil: "load" });
await canary(page, log);

/* ── A. .tl-cad-drop ─────────────────────────────────────────────────────── */
log("");
log("── A. `.tl-cad-drop` — the landing's own drop zone, never in the Coder's route list ──");
await settle(page, "/");
const cad = await box(page, ".tl-cad-drop");
if (!cad) log("  .tl-cad-drop NOT FOUND on / — check the route");
else {
  log(`  computed border: ${cad.border}   background: ${cad.bg}`);
  const s1 = await sampler(context, page);
  for (const side of ["top", "left"]) {
    const m = await edgeAlong(s1, cad, side);
    log(`  ${side.padEnd(5)} painted border ${hex(m.border)} on ground ${hex(m.ground)} → border/ground ${m.borderVsGround}:1   fill/ground ${m.fillVsGround}:1`);
  }
  await s1.close();
}

/* ── B. the chat launcher ────────────────────────────────────────────────── */
log("");
log("── B. `[data-chat-launcher]` — no border, on every route, crosses grounds ──");
for (const route of ["/", "/iletisim", "/giris", "/bu-sayfa-yok-09b1qa"]) {
  await settle(page, route);
  const cl = await box(page, "[data-chat-launcher]");
  if (!cl) { log(`  ${route.padEnd(24)} launcher not present`); continue; }
  const s2 = await sampler(context, page);
  const m = await edgeAlong(s2, cl, "top");
  const inner = (await s2.read([[Math.round(cl.x + cl.width / 2), Math.round(cl.y + cl.height / 2)]]))[0];
  const out = (await s2.read([[Math.round(cl.x + cl.width / 2), Math.round(cl.y - 6)]]))[0];
  log(`  ${route.padEnd(24)} borderW ${cl.borderW}  fill ${hex(inner)} on ground ${hex(out)} → fill/ground ${ratio(inner, out)}:1`);
  await s2.close();
}

/* ── C. the reveal toggle's glyph ────────────────────────────────────────── */
log("");
log("── C. `.shell-auth-reveal` — no border; identified by a glyph, not a box ──");
await settle(page, "/giris");
const rev = await box(page, ".shell-auth-reveal");
if (!rev) log("  not found");
else {
  const s3 = await sampler(context, page);
  const pts = [];
  for (let dx = -8; dx <= 8; dx++) for (let dy = -6; dy <= 6; dy++) pts.push([Math.round(rev.x + rev.width / 2 + dx), Math.round(rev.y + rev.height / 2 + dy)]);
  const px = (await s3.read(pts)).filter(Boolean);
  const ground = (await s3.read([[Math.round(rev.x + rev.width / 2), Math.round(rev.y + rev.height / 2 + 18)]]))[0];
  let glyph = ground, r = 0;
  for (const p of px) { const q = ratio(p, ground); if (q > r) { r = q; glyph = p; } }
  log(`  borderW ${rev.borderW}  background ${rev.bg}  colour ${rev.color}`);
  log(`  brightest glyph pixel ${hex(glyph)} vs field ${hex(ground)} → ${r}:1  (1.4.11 is met by the GRAPHICAL OBJECT, not a boundary)`);
  await s3.close();
}

/* ── D. .shell-check — verify the UNREACHABILITY claim, not the number ───── */
log("");
log("── D. `.shell-check` — is the boundary genuinely unreachable from CSS? ──");
await settle(page, "/malzemeler");
const chk = await page.evaluate(() => {
  const el = document.querySelector(".shell-check");
  if (!el) return null;
  const cs = getComputedStyle(el);
  const before = { bw: cs.borderTopWidth, ap: cs.appearance, bg: cs.backgroundColor };
  /* THE CLAIM UNDER TEST: "not reachable from CSS without rebuilding the
     control". Test it the only way that settles it — apply a border and an
     appearance reset at runtime and see whether the UA honours them. */
  el.style.setProperty("border", "1px solid rgb(255,0,0)", "important");
  const withBorder = getComputedStyle(el).borderTopWidth;
  el.style.setProperty("appearance", "none", "important");
  const withReset = { bw: getComputedStyle(el).borderTopWidth, ap: getComputedStyle(el).appearance };
  el.style.removeProperty("border"); el.style.removeProperty("appearance");
  return { before, withBorder, withReset, outline: cs.outlineWidth, accent: cs.accentColor, colorScheme: getComputedStyle(document.documentElement).colorScheme };
});
if (!chk) log("  .shell-check not found on /malzemeler");
else {
  log(`  default: appearance=${chk.before.ap} border-width=${chk.before.bw} background=${chk.before.bg}`);
  log(`  after a forced 1px border, appearance still auto: border-width computes to ${chk.withBorder}`);
  log(`  after appearance:none as well:                     border-width ${chk.withReset.bw}, appearance ${chk.withReset.ap}`);
  log(`  VERDICT: a border DOES compute either way; what is unreachable is whether the UA PAINTS it while`);
  log(`           appearance is auto. That is a paint question, so it is answered below by pixels.`);
  const s4 = await sampler(context, page);
  const cb = await box(page, ".shell-check");
  const m = await edgeAlong(s4, cb, "top");
  log(`  painted: outer edge ${hex(m.border)} vs page ground ${hex(m.ground)} → ${m.borderVsGround}:1 ; fill ${hex(m.fill)} → ${m.fillVsGround}:1`);
  await s4.close();
}

/* ── F. states ───────────────────────────────────────────────────────────── */
log("");
log("── F. hover / focus-visible / disabled on every control C1 repainted ──");
const STATE_TARGETS = [
  ["/giris", ".shell-field input", "auth text input"],
  ["/giris", ".shell-auth-social > button", "social button"],
  ["/giris", ".shell-action--ghost, .shell-action--primary", "auth action"],
  ["/malzemeler", ".shell-field input", "register input"],
  ["/malzemeler", ".shell-segment:not([aria-pressed=true])", "unpressed segment"],
  ["/malzemeler", ".shell-row-toggle", "row toggle"],
  ["/teklif-al", ".shell-file", "file drop"],
];
for (const [route, sel, name] of STATE_TARGETS) {
  await settle(page, route);
  for (const state of ["default", "hover", "focus"]) {
    const b = await box(page, sel);
    if (!b) { log(`  ${route} ${name}: not found`); break; }
    if (state === "hover") await page.hover(sel).catch(() => {});
    if (state === "focus") {
      await page.evaluate((s) => {
        const el = document.querySelector(s);
        /* Chromium applies :focus-visible to a programmatically focused text
           input; for a button it does not, so drive the button from the
           keyboard instead. */
        el.focus();
      }, sel);
      await page.keyboard.press("Shift+Tab").catch(() => {});
      await page.keyboard.press("Tab").catch(() => {});
    }
    await page.waitForTimeout(400);
    const b2 = await box(page, sel);
    const s5 = await sampler(context, page);
    const m = await edgeAlong(s5, b2, "top");
    log(`  ${route.padEnd(12)} ${name.padEnd(18)} ${state.padEnd(8)} border ${hex(m.border)} ground ${hex(m.ground)} → brd/gnd ${String(m.borderVsGround).padStart(5)}:1  fill/gnd ${m.fillVsGround}:1`);
    await s5.close();
    if (state !== "default") { await settle(page, route); }
  }
}
/* disabled: the social buttons carry `opacity:.55` while a redirect is in
   flight. `:disabled` is a 1.4.11 EXCEPTION ("inactive user interface
   component"), so this is reported, not judged. */
await settle(page, "/giris");
await page.evaluate(() => document.querySelectorAll(".shell-auth-social > button").forEach((b) => { b.disabled = true; }));
await page.waitForTimeout(300);
const dis = await box(page, ".shell-auth-social > button");
const s6 = await sampler(context, page);
const dm = await edgeAlong(s6, dis, "top");
log(`  /giris       social button      disabled border ${hex(dm.border)} ground ${hex(dm.ground)} → brd/gnd ${dm.borderVsGround}:1  (opacity ${dis.opacity}; 1.4.11 exempts inactive components)`);
await s6.close();

/* ── E. the menu trigger at 375 ──────────────────────────────────────────── */
log("");
log("── E. `.tl-menu-trigger` at 375 — is the word actually there? ──");
await page.close();
await context.close();
for (const w of [1280, 768, 375, 320]) {
  const c2 = await browser.newContext({ viewport: { width: w, height: 812 }, deviceScaleFactor: 1, reducedMotion: "reduce", isMobile: w <= 768, hasTouch: w <= 768 });
  const t2 = await guard(c2, []);
  const p2 = await c2.newPage();
  await p2.goto(`${BASE}/`, { waitUntil: "load" });
  await canary(p2);
  await p2.waitForLoadState("networkidle").catch(() => {});
  await p2.waitForTimeout(2600);
  const info = await p2.evaluate(() => {
    const el = document.querySelector(".tl-menu-trigger");
    if (!el) return null;
    const lab = el.querySelector(".tl-menu-trigger-label");
    const labCs = lab ? getComputedStyle(lab) : null;
    const r = el.getBoundingClientRect();
    const bars = Array.from(el.querySelectorAll(".tl-menu-trigger-rules > span")).map((b) => {
      const br = b.getBoundingClientRect();
      return { w: +br.width.toFixed(1), h: +br.height.toFixed(1) };
    });
    return {
      name: el.getAttribute("aria-label") || el.textContent.trim(),
      labelText: lab ? lab.textContent.trim() : null,
      labelVisible: !!lab && labCs.display !== "none" && labCs.visibility !== "hidden" && lab.getBoundingClientRect().width > 0,
      labelDisplay: labCs ? labCs.display : null,
      box: { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height },
      bars,
      colour: getComputedStyle(el).color,
      border: getComputedStyle(el).borderTopColor,
    };
  });
  if (!info) { log(`  ${w}: trigger not found`); await c2.close(); continue; }
  const s7 = await sampler(c2, p2);
  const m = await edgeAlong(s7, info.box, "top");
  // the bars themselves
  const barPts = [];
  for (let dx = -14; dx <= 14; dx++) for (let dy = -10; dy <= 10; dy++) barPts.push([Math.round(info.box.x + info.box.width / 2 + dx), Math.round(info.box.y + info.box.height / 2 + dy)]);
  const bpx = (await s7.read(barPts)).filter(Boolean);
  let bar = m.ground, br = 0;
  for (const p of bpx) { const q = ratio(p, m.ground); if (q > br) { br = q; bar = p; } }
  log(`  ${String(w).padStart(4)}  accessible name "${info.name}"  |  label element ${info.labelText === null ? "ABSENT" : `"${info.labelText}"`} display=${info.labelDisplay} visible=${info.labelVisible}`);
  log(`        box ${Math.round(info.box.width)}x${Math.round(info.box.height)}  bars ${JSON.stringify(info.bars)}`);
  log(`        BORDER ${hex(m.border)} vs ground ${hex(m.ground)} → ${m.borderVsGround}:1    brightest inner mark ${hex(bar)} → ${br}:1`);
  await s7.close();
  log(`        traffic: blocked ${t2.blocked.length}, ALLOWED ${t2.allowed.length}`);
  await c2.close();
}

log("");
log(`traffic (main context): blocked ${t.blocked.length}, ALLOWED ${t.allowed.length}`);
if (t.allowed.length) log(`  ALLOWED: ${t.allowed.join(" | ")}`);
await browser.close();
writeFileSync(`${OUT}/boundary-states.txt`, lines.join("\n") + "\n");
