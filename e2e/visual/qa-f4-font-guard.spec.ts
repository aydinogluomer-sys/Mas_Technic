/* ══════════════════════════════════════════════════════════════════════════
   QA-OWNED NEGATIVE CONTROL — PHASE 07 CORRECTION #1, F4

   F4's original defect was a SILENT NO-OP: `installFontRetry()` registered
   `page.route("https://fonts.g*", …)`, Playwright's `*` does not cross a `/`,
   so the route matched nothing and the retry never ran — and nothing noticed,
   because a route that matches nothing behaves exactly like a route that was
   never needed.

   The correction's answer is to COUNT interceptions per host and fail at zero.
   A fix against a silent no-op is only closed if the new failure path is
   itself live. So this file does not assert that the guard passes — the visual
   suite already does that 64 times over. It asserts that the guard FAILS, on
   purpose, for the stated reason:

     1. armed              counters > 0 on BOTH hosts on a real load
     2. gstatic silenced   awaitRealFaces THROWS naming fonts.gstatic.com
     3. googleapis silenced awaitRealFaces THROWS naming fonts.googleapis.com
     4. both blackholed    awaitRealFaces THROWS naming the fallback stack

   Cases 2 and 3 reproduce the F4 defect exactly. A `page.route()` registered
   AFTER `installFontRetry()` takes precedence (Playwright matches handlers
   last-registered-first), so the retry's handler never runs for that host and
   its counter stays at 0 — precisely what a mis-globbed pattern does.

   If any of these three ever goes green, the no-op has come back and the 64
   green captures stop being evidence of anything.
   ══════════════════════════════════════════════════════════════════════════ */
import { expect, test } from "@playwright/test";
import { gotoAndSettle } from "../helpers";
import { awaitRealFaces, installFontRetry } from "./fonts";

const ROUTE = "/hizmetler/cnc-frezeleme";

test.describe("F4 — the font-retry guard is falsifiable", () => {
  test("armed: a real load intercepts on BOTH hosts", async ({ page }) => {
    const counts = await installFontRetry(page);
    // `gotoAndSettle`, the same call the four golden specs make — not a bare
    // `goto`. The face files are fetched lazily after the stylesheet is
    // parsed, so a probe that asserts straight after `load` sees gstatic at 0
    // and reports a defect that is its own. Mine did, on the first run of this
    // file; corrected rather than tolerated.
    await gotoAndSettle(page, ROUTE);
    await awaitRealFaces(page);
    expect(counts.googleapis, "the stylesheet host must be intercepted").toBeGreaterThan(0);
    expect(counts.gstatic, "the face-file host must be intercepted").toBeGreaterThan(0);
  });

  test("red: silencing fonts.gstatic.com fails with the gstatic reason", async ({ page }) => {
    const counts = await installFontRetry(page);
    // Registered second, so it wins: the retry handler never sees this host.
    // This is what the broken `https://fonts.g*` glob did to BOTH hosts.
    await page.route("https://fonts.gstatic.com/**", (route) => route.continue());
    await gotoAndSettle(page, ROUTE);

    expect(counts.gstatic, "the simulation must actually silence the host").toBe(0);
    const err = await awaitRealFaces(page).then(
      () => null,
      (e: Error) => e.message,
    );
    expect(err, "awaitRealFaces must THROW when a host was never intercepted").not.toBeNull();
    expect(err).toContain("intercepted 0 requests on fonts.gstatic.com");
  });

  test("red: silencing fonts.googleapis.com fails with the googleapis reason", async ({ page }) => {
    const counts = await installFontRetry(page);
    await page.route("https://fonts.googleapis.com/**", (route) => route.continue());
    await gotoAndSettle(page, ROUTE);

    expect(counts.googleapis, "the simulation must actually silence the host").toBe(0);
    const err = await awaitRealFaces(page).then(
      () => null,
      (e: Error) => e.message,
    );
    expect(err, "awaitRealFaces must THROW when a host was never intercepted").not.toBeNull();
    expect(err).toContain("intercepted 0 requests on fonts.googleapis.com");
  });

  test("red: blackholing both hosts fails with the fallback-stack reason", async ({ page }) => {
    // PART 2 in isolation. `installFontRetry()` is deliberately NOT called, so
    // `awaitRealFaces()` skips the counter block (`if (counts)`) and the
    // FontFaceSet proof is the only thing left standing. Without it, a capture
    // of the fallback stack would be compared — or banked — as if it were the
    // site's typefaces, and both `document.fonts.ready` and `.check()` say yes
    // to a fallback, which is why the proof enumerates the face set instead.
    await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
    await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
    await page.goto(ROUTE, { waitUntil: "domcontentloaded" });

    const err = await awaitRealFaces(page).then(
      () => null,
      (e: Error) => e.message,
    );
    expect(err, "awaitRealFaces must THROW when the real faces never loaded").not.toBeNull();
    expect(err).toContain("the web fonts never loaded");
  });
});
