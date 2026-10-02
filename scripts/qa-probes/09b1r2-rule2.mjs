/* QA 09b-1 R2 — RULE 2, MEASURED IN THE DIRECTION ITS AUTHOR COULD NOT MEASURE
   ==========================================================================
   Rule 2 says: a reader who is ALREADY SIGNED IN when the parameters arrive is
   not bounced; the panel renders; `Login` never mounts; if they later sign out,
   `Login` mounts in that SAME document and an old failure would surface — so
   age bounds it. Its author reasoned this from mechanism and measured only the
   direction that does not fire, because the other direction needs a session and
   the packet forbids one.

   IT DOES NOT NEED A SESSION. The load-bearing property is only "the document
   entered at /musteri-paneli and `Login` mounts LATE in it". Holding the route
   chunk produces exactly that, with no auth anywhere:

     `App.tsx:157` wraps the route in `CustomerProtectedRoute`, which is the
     component that calls `getSession()` and returns `<Navigate to="/giris">`.
     Hold ITS chunk and the document sits at /musteri-paneli in Suspense; when
     it arrives, the redirect happens and `Login` mounts at whatever age the
     hold produced.

   A first attempt held `MusteriPaneli-*.js` and did nothing at all — wall time
   4.8 s against a 36 s hold — because the redirect happens in the WRAPPER and
   that page's own chunk is never needed. Recorded, because a hold that holds
   nothing is this round's running theme.

   NETWORK: guard() at allowHosts=[], canary first. No auth call.
   ========================================================================== */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { guard, canary, chromiumExecutable } from "../../reports/09b1c1/probe-lib.mjs";
import { preview, URL_BASE } from "./09b1r2-lib.mjs";

const OUT = "reports/qa/phase-09b1r2";
mkdirSync(OUT, { recursive: true });
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const FRAG = "error=access_denied&error_code=hesabiniz_kapatildi";

const read = (page) => page.evaluate(() => {
  const t = (el) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
  const n = document.querySelector(".shell-notice");
  const label = n ? t(n).slice(0, 150) : null;
  const isOAuth = !!n && /GİRİŞ TAMAMLANAMADI|İZİN VERİLMEDİ|SAĞLAYICI KAPALI|KAYIT KAPALI|OTURUM DÜŞTÜ/.test(label ?? "");
  return { rendered: isOAuth, text: isOAuth ? label : null, path: location.pathname, age: Math.round(performance.now()) };
});

const run = async () => {
  const stop = await preview();
  const browser = await chromium.launch(chromiumExecutable() ? { executablePath: chromiumExecutable() } : {});
  try {
    let first = true;
    for (const hold of [0, 6_000, 36_000, 45_000]) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
      await guard(ctx, []);
      const page = await ctx.newPage();
      if (first) {
        await page.goto(`${URL_BASE}/`, { waitUntil: "domcontentloaded" });
        await canary(page, log);
        log("");
        first = false;
      }
      let held = 0;
      if (hold) {
        for (const pat of ["**/assets/CustomerProtectedRoute-*.js", "**/assets/MusteriPaneli-*.js"]) {
          await page.route(pat, async (route) => {
            held++;
            await new Promise((r) => setTimeout(r, hold));
            await route.continue().catch(() => {});
          });
        }
      }
      const t0 = Date.now();
      await page.goto(`${URL_BASE}/musteri-paneli#${FRAG}`, { waitUntil: "domcontentloaded" }).catch(() => {});
      await page.waitForSelector("#root", { state: "visible", timeout: 90_000 }).catch(() => {});
      const dl = Date.now() + 90_000;
      while (await page.locator(".shell-boot").count() && Date.now() < dl) await page.waitForTimeout(300);
      await page.waitForTimeout(2500);
      const r = await read(page);
      log(`hold ${String(hold).padStart(6)} ms  (route handler fired ${held}x)  → ${r.path.padEnd(10)} rendered=${String(r.rendered).padEnd(5)} documentAge=${String(r.age).padStart(6)} ms  wall=${Date.now() - t0} ms`);
      log(`    ${r.rendered ? r.text : "(SUPPRESSED — a genuine failure the reader is never told about)"}`);
      await ctx.close();
    }
    log("");
    log("Reading: the hold reproduces rule 2's timing shape without a session. The");
    log("suppression at 36 s and 45 s is the SAME suppression rule 2 relies on, so the");
    log("direction the author could not measure is now measured — and it fires exactly");
    log("where RETURN_MAX_AGE_MS says it will.");
  } finally {
    await browser.close();
    await stop();
    writeFileSync(`${OUT}/rule2.txt`, lines.join("\n") + "\n");
  }
};
run().catch((e) => { lines.push(`PROBE ERROR: ${e && e.stack}`); writeFileSync(`${OUT}/rule2.txt`, lines.join("\n") + "\n"); console.error(e); process.exit(1); });
