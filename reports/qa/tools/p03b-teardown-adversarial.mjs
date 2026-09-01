/* QA-owned. Phase 03 RE-VERIFICATION, R3.
   The Coder claims the teardown is driven by state it owns, is idempotent, and
   cannot be latched by an interrupted transition. Attack that claim.

   `history.length` is the instrument for "exactly once": a React Router
   `navigate(href)` pushes one entry, so a double-fired pending navigation is
   +2 and a lost one is +0. Read-only. */
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.PROBE_BASE_URL ?? "http://localhost:4271";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((p) => p && existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});

const snap = (p) => p.evaluate(() => {
  const root = document.getElementById("root");
  const header = document.querySelector("[data-fullscreen-header]");
  return {
    menuCount: document.querySelectorAll("[data-fullscreen-menu]").length,
    bodyOverflow: getComputedStyle(document.body).overflow,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    rootInert: root ? root.hasAttribute("inert") : null,
    rootAriaHidden: root ? root.getAttribute("aria-hidden") : null,
    headerInert: header ? header.hasAttribute("inert") : null,
    headerAriaHidden: header ? header.getAttribute("aria-hidden") : null,
    path: location.pathname,
    historyLength: history.length,
  };
});

const isReleased = (s, before) => s.menuCount === 0
  && s.bodyOverflow === before.bodyOverflow && s.htmlOverflow === before.htmlOverflow
  && s.rootInert === false && s.rootAriaHidden === null
  && s.headerInert === false && s.headerAriaHidden === null;

async function waitReleased(p, before, ms = 12000) {
  const end = Date.now() + ms;
  let last;
  for (;;) {
    last = await snap(p);
    if (isReleased(last, before)) return { ok: true, last };
    if (Date.now() > end) return { ok: false, last };
    await p.waitForTimeout(150);
  }
}

async function wheelMoves(p) {
  const end = Date.now() + 8000;
  for (;;) {
    await p.mouse.wheel(0, 700);
    await p.waitForTimeout(250);
    if (await p.evaluate(() => window.scrollY > 0)) return true;
    if (Date.now() > end) return false;
  }
}

async function arrive(ctx, path) {
  const p = await ctx.newPage();
  await p.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("[data-fullscreen-header]", { state: "attached" });
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.waitForFunction(() => !document.getElementById("hero-shell"), null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(500);
  return p;
}

async function open(p) {
  await p.locator("[data-fullscreen-header] [data-menu-trigger]").first().click();
  await p.waitForSelector("[data-fullscreen-menu]", { state: "visible", timeout: 8000 });
  await p.waitForTimeout(200);
}

const results = [];
const record = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  ${detail}`);
};

for (const rm of ["reduce", "no-preference"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: rm });
  const tag = rm === "reduce" ? "RM" : "FM";

  /* A1 — ESC spam. Eight Escapes 5ms apart, all landing inside one close. */
  {
    const p = await arrive(ctx, "/");
    const before = await snap(p);
    await open(p);
    for (let i = 0; i < 8; i++) { await p.keyboard.press("Escape"); await p.waitForTimeout(5); }
    const r = await waitReleased(p, before);
    const moved = r.ok ? await wheelMoves(p) : false;
    record(`A1 ${tag} escape x8`, r.ok && moved && r.last.path === "/" && r.last.historyLength === before.historyLength,
      `released=${r.ok} wheel=${moved} path=${r.last.path} historyDelta=${r.last.historyLength - before.historyLength} ${r.ok ? "" : JSON.stringify(r.last)}`);
    await p.close();
  }

  /* A2 — a link close interrupted by Escape spam. The pending navigate must
     still happen, and EXACTLY once. */
  {
    const p = await arrive(ctx, "/");
    const before = await snap(p);
    await open(p);
    await p.locator("[data-fullscreen-menu]").getByRole("link", { name: "Sık Sorulanlar", exact: true }).first().click();
    for (let i = 0; i < 5; i++) { await p.keyboard.press("Escape"); await p.waitForTimeout(10); }
    await p.waitForFunction(() => location.pathname === "/sss", null, { timeout: 12000 }).catch(() => {});
    const r = await waitReleased(p, before);
    const moved = r.ok ? await wheelMoves(p) : false;
    const delta = r.last.historyLength - before.historyLength;
    record(`A2 ${tag} link close + escape spam`, r.ok && moved && r.last.path === "/sss" && delta === 1,
      `released=${r.ok} wheel=${moved} path=${r.last.path} historyDelta=${delta} (must be exactly 1)`);
    await p.close();
  }

  /* A3 — re-open mid-close. The close is interrupted 200ms in; the menu must
     end up OPEN and stay open past every timer the close armed, then still
     close cleanly. */
  {
    const p = await arrive(ctx, "/");
    const before = await snap(p);
    await open(p);
    await p.keyboard.press("Escape");
    await p.waitForTimeout(200);
    await p.locator("[data-fullscreen-header] [data-menu-trigger]").first()
      .click({ timeout: 4000 }).catch(async () => {
        // Under reduced motion the close settles in one task, so by 200ms the
        // sheet is already gone and the bar trigger is back — same click.
      });
    await p.waitForTimeout(2200); // past MENU_SETTLE_FALLBACK_MS (900) and NAV_MOTION.open (620)
    const mid = await snap(p);
    const stillOpen = mid.menuCount === 1 && mid.rootInert === true && mid.rootAriaHidden === "true";
    await p.keyboard.press("Escape");
    const r = await waitReleased(p, before);
    const moved = r.ok ? await wheelMoves(p) : false;
    record(`A3 ${tag} reopen mid-close`, stillOpen && r.ok && moved,
      `reopenedAndHeld=${stillOpen} thenReleased=${r.ok} wheel=${moved} ${stillOpen ? "" : JSON.stringify(mid)}`);
    await p.close();
  }

  /* A4 — history move while a close is in flight. */
  {
    const p = await arrive(ctx, "/");
    await p.goto(`${BASE}/hakkimizda`, { waitUntil: "domcontentloaded" });
    await p.waitForSelector("[data-fullscreen-header]", { state: "attached" });
    await p.waitForTimeout(600);
    const before = await snap(p);
    await open(p);
    await p.keyboard.press("Escape");
    await p.evaluate(() => history.back());
    await p.waitForTimeout(1500);
    const r = await waitReleased(p, before);
    const moved = r.ok ? await wheelMoves(p) : false;
    record(`A4 ${tag} history.back mid-close`, r.ok && moved,
      `released=${r.ok} wheel=${moved} path=${r.last.path} ${r.ok ? "" : JSON.stringify(r.last)}`);
    await p.close();
  }

  /* A5 — double link click. Two activations of the same pending navigation. */
  {
    const p = await arrive(ctx, "/");
    const before = await snap(p);
    await open(p);
    const link = p.locator("[data-fullscreen-menu]").getByRole("link", { name: "Sık Sorulanlar", exact: true }).first();
    await link.click();
    await link.click({ timeout: 1500, force: true }).catch(() => {});
    await p.waitForFunction(() => location.pathname === "/sss", null, { timeout: 12000 }).catch(() => {});
    const r = await waitReleased(p, before);
    const moved = r.ok ? await wheelMoves(p) : false;
    const delta = r.last.historyLength - before.historyLength;
    record(`A5 ${tag} double link click`, r.ok && moved && r.last.path === "/sss" && delta === 1,
      `released=${r.ok} wheel=${moved} path=${r.last.path} historyDelta=${delta} (must be exactly 1)`);
    await p.close();
  }

  /* A6 — trigger thrash: open/close/open/close as fast as the DOM allows. */
  {
    const p = await arrive(ctx, "/");
    const before = await snap(p);
    for (let i = 0; i < 4; i++) {
      await p.locator("[data-menu-trigger]").first().click({ force: true }).catch(() => {});
      await p.waitForTimeout(120);
    }
    // Guarantee the sequence ends with a close request whatever parity it hit.
    await p.keyboard.press("Escape");
    const r = await waitReleased(p, before);
    const moved = r.ok ? await wheelMoves(p) : false;
    record(`A6 ${tag} trigger thrash x4`, r.ok && moved,
      `released=${r.ok} wheel=${moved} historyDelta=${r.last.historyLength - before.historyLength} ${r.ok ? "" : JSON.stringify(r.last)}`);
    await p.close();
  }

  /* A7 — the "opening -> open" net. Open, then hold WITHOUT touching anything
     for longer than every timer, and confirm the sheet neither vanishes nor
     loses a latch on its own. A phase machine stuck mid-transition that later
     resolves the wrong way would show up here. */
  {
    const p = await arrive(ctx, "/");
    const before = await snap(p);
    await open(p);
    await p.waitForTimeout(3000);
    const held = await snap(p);
    const ok = held.menuCount === 1 && held.rootInert === true && held.rootAriaHidden === "true"
      && held.htmlOverflow === "hidden";
    await p.keyboard.press("Escape");
    const r = await waitReleased(p, before);
    record(`A7 ${tag} open holds 3s then closes`, ok && r.ok,
      `heldOpen=${ok} thenReleased=${r.ok} ${ok ? "" : JSON.stringify(held)}`);
    await p.close();
  }

  await ctx.close();
}
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\nTOTAL ${results.length}  PASS ${results.length - failed.length}  FAIL ${failed.length}`);
process.exit(failed.length ? 1 : 0);
