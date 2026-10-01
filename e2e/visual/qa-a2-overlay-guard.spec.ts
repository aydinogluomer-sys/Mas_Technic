/* ══════════════════════════════════════════════════════════════════════════
   QA-OWNED NEGATIVE CONTROL — PHASE 07 CORRECTION #1, advisory A2

   `hideForeignOverlays()` defaults to `require: true` and is supposed to FAIL
   when it finds nothing to hide. That assertion is the whole reason the fix is
   not itself a future no-op: "a no-op that looks like success is exactly how
   it got into 25 baselines" (e2e/visual/overlays.ts). So it has to be shown
   failing, not asserted to fail.

   Revision 4 (2026-10-01) mounts `ChatBot` on every route, `/` included, so
   the drifted selector is now reproduced by removing the launcher node before
   the call, and the `/` waiver described below is refused everywhere.

   Also pinned here: the three production call sites pass `require: false` only
   for `/` (landing-golden and navigation-golden visit `/` only;
   shell-golden passes `surface.path !== "/"`), and inner-pages-golden takes
   the default.

   PHASE 07 CORRECTION #2 — H5 CLOSED THE HOLE THIS HEADER USED TO NAME. It
   used to end "if a later phase adds a non-`/` route with `require: false`,
   that is a hole this file does not cover". The waiver was an honour system:
   nothing stopped a later phase from passing it on a route that DOES mount the
   launcher, which silently restores the exact defect A2 removed.
   `hideForeignOverlays` now derives the exemption from `page.url()` instead of
   trusting the caller. Measured side by side against the same build, five
   cases: the pre-correction file scored 3/5 and the corrected one 5/5, with
   `/hakkimizda` and `/malzemeler` + `require:false` going `resolved(1)` →
   THROWS (reports/qa/phase-07c3/out/overlays-control.json). The last test
   below locks it, so the honour system cannot come back unnoticed.
   ══════════════════════════════════════════════════════════════════════════ */
import { expect, test } from "@playwright/test";
import { gotoAndSettle } from "../helpers";
import { hideForeignOverlays } from "./overlays";

test.describe("A2 — the foreign-overlay guard is falsifiable", () => {
  test("armed: on a route that mounts the launcher it finds and hides it", async ({ page }) => {
    await gotoAndSettle(page, "/hizmetler/cnc-frezeleme");
    await expect(page.locator("[data-chat-launcher]")).toBeVisible();

    const found = await hideForeignOverlays(page);
    expect(found, "the guard must report what it hid").toBeGreaterThan(0);
    await expect(
      page.locator("[data-chat-launcher]"),
      "the launcher must be gone from the paint after the call",
    ).toBeHidden();
  });

  test("red: require:true throws when the selector matches nothing", async ({ page }) => {
    // Revision 4 mounts the launcher on `/` too, so there is no longer a route
    // without it. A drifted selector is reproduced by taking the node out of
    // the paint: the locator then matches nothing and the guard must go red.
    await gotoAndSettle(page, "/");
    await expect(page.locator("[data-chat-launcher]")).toHaveCount(1);
    await page.evaluate(() => document.querySelectorAll("[data-chat-launcher]").forEach((node) => node.remove()));
    await expect(page.locator("[data-chat-launcher]")).toHaveCount(0);

    const err = await hideForeignOverlays(page).then(
      () => null,
      (e: Error) => e.message,
    );
    expect(err, "hideForeignOverlays must THROW when it hides nothing").not.toBeNull();
    expect(err).toContain("no [data-chat-launcher] was found to hide");
  });

  test("red: require:false is refused on `/` as well, now that it mounts the launcher", async ({ page }) => {
    await gotoAndSettle(page, "/");
    const err = await hideForeignOverlays(page, { require: false }).then(
      () => null,
      (e: Error) => e.message,
    );
    expect(err).toContain("no longer legal on any route");
  });

  test("red: require:false is refused on a route that DOES mount the launcher", async ({ page }) => {
    // The H5 lock. `/hakkimizda` mounts the launcher, so waiving the
    // requirement there is precisely how 25 baselines acquired a foreign fixed
    // overlay. Before H5 this call resolved with 1 and said nothing.
    await gotoAndSettle(page, "/hakkimizda");
    await expect(page.locator("[data-chat-launcher]")).toHaveCount(1);

    const err = await hideForeignOverlays(page, { require: false }).then(
      () => null,
      (e: Error) => e.message,
    );
    expect(
      err,
      "require:false must be refused — otherwise the waiver is an honour system",
    ).not.toBeNull();
    expect(err).toContain("no longer legal on any route");
  });

  test("the launcher really does sit inside the captured footer element", async ({ page }) => {
    // The premise of A2. If the launcher did not overlap the crop, removing it
    // could not have changed 25 baselines, and the change would need another
    // explanation.
    await gotoAndSettle(page, "/hakkimizda");
    // The launcher is position:fixed, so its rect is viewport-relative; the
    // footer's is not. They only overlap once the footer is on screen, which
    // is the state the golden specs capture in. (My first version of this test
    // skipped the scroll and reported no overlap — the probe was wrong.)
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const overlap = await page.evaluate(() => {
      const l = document.querySelector("[data-chat-launcher]");
      const f = document.querySelector("footer.tl-footer, footer");
      if (!l || !f) return null;
      const a = l.getBoundingClientRect(), b = f.getBoundingClientRect();
      const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      return { launcher: [Math.round(a.width), Math.round(a.height)], covered: Math.round(ix * iy) };
    });
    expect(overlap, "both elements must exist").not.toBeNull();
    expect(overlap!.covered, "the launcher must overlap the footer crop").toBeGreaterThan(0);
  });
});
