/* QA 09b-2 — THE FRAGMENT LANDING ON A COLD LOAD
   ==========================================================================
   `e2e/09b2-fragment-navigation.spec.ts` "full navigation to a pasted URL"
   FAILED on its first run and passed on its next two, at 2524 px, which is the
   defect the phase says it fixed. `ScrollToTop.tsx:53` bounds the poll at
   HASH_SETTLE_FRAMES = 90 rAF frames (~1.5 s at 60 Hz) and then scrolls to the
   TOP - so the fix holds only when the lazy route mounts inside that budget.

   This measures, for a fresh browser context each time, how long after
   navigation the clause element APPEARS, and where the reader ends up. Run
   1 is the coldest this machine gets without clearing the OS cache; runs 2-4
   are warm. A CPU throttle row approximates a slower device.
   ========================================================================== */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { guard, chromiumExecutable } from "./probe-lib.mjs";
import { preview, URL_BASE } from "./09b1r2-lib.mjs";

const OUT = "reports/qa/phase-09b1r2";
mkdirSync(OUT, { recursive: true });
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const TARGET = "/gizlilik-politikasi#sohbet-asistani";

const run = async () => {
  const stop = await preview();
  const browser = await chromium.launch(chromiumExecutable() ? { executablePath: chromiumExecutable() } : {});
  try {
    log("run  profile        element appeared at   final clause top   frames the poll had   verdict");
    const rows = [
      { name: "1 cold" }, { name: "2 warm" }, { name: "3 warm" },
      { name: "4 warm 4x CPU", cpu: 4 }, { name: "5 warm 6x CPU", cpu: 6 },
    ];
    for (const r of rows) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      await guard(ctx, []);
      const page = await ctx.newPage();
      if (r.cpu) {
        const cdp = await ctx.newCDPSession(page);
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: r.cpu });
      }
      await page.addInitScript(() => {
        window.__qaFrames = 0;
        const raf = window.requestAnimationFrame.bind(window);
        window.requestAnimationFrame = (cb) => raf((t) => { window.__qaFrames++; cb(t); });
        window.__qaAppeared = null;
        const mo = new MutationObserver(() => {
          if (window.__qaAppeared === null && document.getElementById("sohbet-asistani")) {
            window.__qaAppeared = Math.round(performance.now());
            mo.disconnect();
          }
        });
        document.addEventListener("DOMContentLoaded", () => mo.observe(document.documentElement, { childList: true, subtree: true }));
      });
      await page.goto(`${URL_BASE}${TARGET}`, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => window.__qaAppeared !== null, null, { timeout: 60_000 }).catch(() => {});
      await page.waitForTimeout(2500);
      const m = await page.evaluate(() => {
        const el = document.getElementById("sohbet-asistani");
        return { appeared: window.__qaAppeared, top: el ? Math.round(el.getBoundingClientRect().top) : null, frames: window.__qaFrames };
      });
      const landed = m.top !== null && m.top > -200 && m.top < 200;
      log(`${r.name.padEnd(16)} ${String(m.appeared).padStart(8)} ms   ${String(m.top).padStart(10)} px   ${String(m.frames).padStart(8)} frames   ${landed ? "landed on the clause" : "*** AT THE TOP — the 90-frame budget expired first ***"}`);
      await ctx.close();
    }
  } finally {
    await browser.close();
    await stop();
    writeFileSync(`${OUT}/09b2-fragment-cold.txt`, lines.join("\n") + "\n");
  }
};
run().catch((e) => { lines.push(`PROBE ERROR: ${e && e.stack}`); writeFileSync(`${OUT}/09b2-fragment-cold.txt`, lines.join("\n") + "\n"); console.error(e); process.exit(1); });
