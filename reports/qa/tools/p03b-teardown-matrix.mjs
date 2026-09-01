/* QA-owned. Phase 03 RE-VERIFICATION, R1 + R2.
   The full product: viewport x route x motion mode x close mechanism.
   Every cell must end with the page genuinely usable again. Read-only. */
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.PROBE_BASE_URL ?? "http://localhost:4271";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((p) => p && existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});

const snapshot = (p) => p.evaluate(() => {
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
  };
});

const focusIsTrigger = (p) => p.evaluate(() => {
  const a = document.activeElement;
  return !!a && a.matches("[data-menu-trigger]") && !a.closest("[data-fullscreen-menu]");
});

async function settle(p, path) {
  await p.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("[data-fullscreen-header]", { state: "attached" });
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.waitForFunction(() => !document.getElementById("hero-shell"), null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(500);
}

async function open(p) {
  await p.locator("[data-fullscreen-header] [data-menu-trigger]").first().click();
  await p.waitForSelector("[data-fullscreen-menu]", { state: "visible", timeout: 8000 });
  await p.waitForTimeout(250);
  const s = await snapshot(p);
  if (s.htmlOverflow !== "hidden" || s.rootInert !== true || s.rootAriaHidden !== "true") {
    return { ok: false, why: `latches never engaged: ${JSON.stringify(s)}` };
  }
  return { ok: true };
}

/* Poll rather than sample: release may take an animation's worth of time. */
async function released(p, before, { expectPath = null } = {}) {
  const deadline = Date.now() + 12000;
  let last;
  for (;;) {
    last = await snapshot(p);
    const same = last.menuCount === 0
      && last.bodyOverflow === before.bodyOverflow
      && last.htmlOverflow === before.htmlOverflow
      && last.rootInert === false
      && last.rootAriaHidden === null
      && last.headerInert === false
      && last.headerAriaHidden === null;
    if (same) break;
    if (Date.now() > deadline) return { ok: false, why: `latched: ${JSON.stringify(last)}` };
    await p.waitForTimeout(150);
  }
  if (expectPath && last.path !== expectPath) return { ok: false, why: `path ${last.path} != ${expectPath}` };

  // The reader's own wheel must move the page again.
  const tallDeadline = Date.now() + 15000;
  for (;;) {
    const tall = await p.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 8);
    if (tall) break;
    if (Date.now() > tallDeadline) return { ok: false, why: "route never became scrollable-tall" };
    await p.waitForTimeout(200);
  }
  const wheelDeadline = Date.now() + 8000;
  for (;;) {
    await p.mouse.wheel(0, 700);
    await p.waitForTimeout(250);
    const y = await p.evaluate(() => Math.round(window.scrollY));
    if (y > 0) return { ok: true, scrollY: y };
    if (Date.now() > wheelDeadline) return { ok: false, why: "wheel absorbed; page did not move" };
  }
}

const VIEWPORTS = [
  { w: 320, h: 568, mobile: true },
  { w: 375, h: 812, mobile: true },
  { w: 1280, h: 800, mobile: false },
];
const ROUTES = ["/", "/hakkimizda"];
const MOTION = ["reduce", "no-preference"];
const MECHS = ["escape", "closeButton", "link"];

const results = [];
for (const vp of VIEWPORTS) {
  for (const rm of MOTION) {
    const ctx = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      isMobile: vp.mobile, hasTouch: vp.mobile, reducedMotion: rm,
    });
    for (const route of ROUTES) {
      for (const mech of MECHS) {
        const id = `${vp.w} ${rm} ${route} ${mech}`;
        const p = await ctx.newPage();
        let verdict;
        try {
          await settle(p, route);
          const before = await snapshot(p);
          if (before.menuCount !== 0 || before.rootInert !== false || before.rootAriaHidden !== null) {
            verdict = { ok: false, why: `pre-open state already latched: ${JSON.stringify(before)}` };
          } else {
            const o = await open(p);
            if (!o.ok) verdict = o;
            else if (mech === "escape") {
              await p.keyboard.press("Escape");
              verdict = await released(p, before, { expectPath: route });
              if (verdict.ok) verdict.focusRestored = await focusIsTrigger(p);
              if (verdict.ok && !verdict.focusRestored) verdict = { ok: false, why: "focus not restored to trigger" };
            } else if (mech === "closeButton") {
              await p.locator("[data-fullscreen-menu] [data-menu-trigger]").first().click();
              verdict = await released(p, before, { expectPath: route });
              if (verdict.ok) verdict.focusRestored = await focusIsTrigger(p);
              if (verdict.ok && !verdict.focusRestored) verdict = { ok: false, why: "focus not restored to trigger" };
            } else {
              await p.locator("[data-fullscreen-menu]").getByRole("link", { name: "Sık Sorulanlar", exact: true }).first().click();
              await p.waitForFunction(() => location.pathname === "/sss", null, { timeout: 12000 })
                .catch(() => {});
              verdict = await released(p, before, { expectPath: "/sss" });
            }
          }
        } catch (err) {
          verdict = { ok: false, why: `threw: ${String(err).slice(0, 160)}` };
        }
        results.push({ id, ...verdict });
        console.log(`${verdict.ok ? "PASS" : "FAIL"}  ${id}  ${verdict.ok ? `scrollY=${verdict.scrollY}${verdict.focusRestored !== undefined ? ` focus=${verdict.focusRestored}` : ""}` : verdict.why}`);
        await p.close();
      }
    }
    await ctx.close();
  }
}
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\nTOTAL ${results.length}  PASS ${results.length - failed.length}  FAIL ${failed.length}`);
process.exit(failed.length ? 1 : 0);
