import { expect, type Page } from "@playwright/test";

/* ══════════════════════════════════════════════════════════════════════════
   FOREIGN FIXED OVERLAYS DO NOT BELONG IN A PAGE-CONTENT BASELINE

   PHASE 07 CORRECTION #1 — advisory A2.

   THE DEFECT
   ----------
   The chat launcher (`ChatBot.tsx`) is `position: fixed`, mounts on every
   public route except `/`, and sits in the bottom-right corner — which is
   inside the footer crop at every width and inside the hero and next-step
   crops at 375. Scanning all 100 committed goldens for the launcher's teal
   (`rgb(10,125,138) ±10`) finds it baked into 25 of them: every
   `shell-footer-*` at 375/768/1280/1440 except `shell-footer-home` (the
   landing does not mount it), plus `inner-hero-{material-family,
   sector-detail,service-detail}` and `inner-next-{sector,service}-detail`
   at 375. Ten of those were banked by this phase.

   WHY THAT IS A DEFECT AND NOT A CURIOSITY
   ----------------------------------------
   Nothing is wrong with how the launcher looks. The problem is ownership:
   Phases 09 and 13 own its visual language, and the day they touch it
   TWENTY-FIVE goldens go red simultaneously. The reflex to a mass red is
   `--update-snapshots`, which `IMPLEMENTATION.md` §12 forbids by name and
   which this run has already caught pinning a live regression once. A
   baseline of a page's content should fail when that page's content changes,
   and for no other reason.

   HIDDEN, NOT MASKED — and the difference matters
   -----------------------------------------------
   Playwright's `mask` option paints an opaque box over the region. That would
   remove the launcher from the comparison, but it would also remove whatever
   the launcher is SITTING ON, permanently, in every baseline that carries it.
   The measured obstruction is not small — at 375 the launcher completely
   covers five `<td>` glyph line boxes on `/malzemeler` — so masking would
   blind the goldens to real content in exactly the region where content is
   most likely to be hidden by accident.

   `display: none` on a `position: fixed` element removes it from the paint
   without moving anything: it is out of flow, so no sibling reflows, and the
   capture then contains the page content that was underneath. That content is
   then genuinely under test.

   NO TOLERANCE WAS TOUCHED. Not one `maxDiffPixels` changed anywhere; the
   diff for this advisory adds this file and one call per spec.

   NOT INCLUDED: the custom cursor — AND THE REASON HAS BEEN WRONG TWICE
   ---------------------------------------------------------------------
   PHASE 07 CORRECTION #3 — H4. Read the retractions first; they are the only
   part of this comment that has never had to be rewritten.

   RETRACTED (#1): "the cursor paints nothing until a real pointer moves, and
   Playwright never moves one". False. Both layers are `opacity: 1` from mount.

   RETRACTED (#2): "below 901 px the component does not mount". False, and it
   is the load-bearing error, so here is where it came from: `901` is the
   breakpoint of the `cursor: none` rule at `src/index.css:786`, and that rule
   is QUOTED in a docblock inside `CustomCursor.tsx`. A comment describing a
   stylesheet was read as the component's own mount condition.

   RETRACTED (#2, second half): "every golden here is an ELEMENT-scoped crop of
   page content". False. `landing-golden.spec.ts` takes
   `expect(page).toHaveScreenshot("landing-fullpage.png", { fullPage: true })`
   — a page-scoped capture, at 1280 and 1440, with a fine pointer, whose frame
   begins at the viewport origin the layers are parked over.

   WHAT THE BROWSER DOES, measured with no pointer ever moved
   ----------------------------------------------------------
   `CustomCursor` renders when `!isMobile && finePointer`, and `useIsMobile()`
   is `width < 768` (`MOBILE_BREAKPOINT`, `src/hooks/use-mobile.tsx`). So it
   mounts from **768 px upward with a fine pointer** — 767 → no layers, 768 →
   both — and paints the dot 6×6 at rect (-3,-3) and the ring 44×44 at rect
   (-22,-22), i.e. up to 22×22 px of the viewport's top-left corner.

   WHY THE COMMITTED GOLDENS ARE NEVERTHELESS CLEAN — two reasons, neither of
   them a property of this file or of the component
   ----------------------------------------------------------------------------
     1. AT 375 AND 768 it is the TEST CONFIGURATION, not the component.
        `playwright.config.ts` marks those two visual projects `mobile: true`,
        which spreads to `{ isMobile: true, hasTouch: true }`; `hasTouch` is
        what makes `(pointer: fine)` false, so nothing mounts. `isMobile` alone
        does not — measured at 768 with `{ isMobile: true, hasTouch: false }`:
        both layers mount and paint.
     2. AT 1280 AND 1440 the pointer IS fine, both layers DO mount, and the one
        page-scoped golden DOES include their corner. Nothing of them reaches
        the image because the fixed header band paints over them: `z-index:
        10000` on an opaque graphite ground, against the layers' 101 and 100.
        That is paint order, not design — it is an accident that happens to
        hold.

   And QA's exact-colour scan over all 100 committed goldens finds zero cursor
   pixels, which is the same conclusion reached from the pixels instead of from
   the mechanism.

   SO THE LAUNCHER IS STILL THE ONLY ENTRY IN `FOREIGN_OVERLAYS`, and the
   condition is now a test rather than this paragraph. `./cursor-overlay-guard
   .spec.ts` asserts the mount matrix, re-derives the fine-pointer project list
   from `playwright.config.ts`, and measures the corner with and without the
   cursor — plus the same measurement with the occluder removed, which must
   come out different, so a scan that has gone blind fails instead of passing.

   FOR THE NEXT PHASE: the thing to check is not a width. It is whether a
   capture's frame contains the viewport origin while `(pointer: fine)` is true
   — which is any width from 768 up in a project that does not set `hasTouch`.
   If you add such a capture, or a visual project without touch emulation, the
   guard will tell you. The fix is one line: add `[data-custom-cursor]` to
   `FOREIGN_OVERLAYS` below. The attribute already exists on both layers.
   ══════════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════════
   PHASE 08 CORRECTION #1 — C4. THE SECOND FOREIGN FIXED OVERLAY.

   `.shared-skip-link` (`src/App.tsx`) is `position: fixed`, parked off the top
   of the viewport at `-translate-y-24`, and carries Tailwind's `shadow-lg`. On
   screen it paints nothing. But element crops TALLER THAN THE VIEWPORT are
   taken with `captureBeyondViewport`, and in the expanded viewport the fixed
   link's shadow lands at the crop's own top-left.

   MEASURED on `waveb-notfound-body` @375 before it was hidden: a wash from
   `rgb(235,232,226)` at row 0 back to the page ground `rgb(251,248,241)` by
   row ~12, across the crop's leftmost ~110 px — about 2.7% black shading,
   invisible at full size and quietly baked into a baseline. Two independent
   controls identified it: hiding `.shared-skip-link` removes it, and so does
   `box-shadow: none` on everything. Nothing else fixed in the document paints
   there.

   It appears ONLY on the two mobile-emulated visual projects (375 and 768) and
   not at 1280/1440 — which is exactly how it would have surfaced later as an
   unexplained two-viewport diff, the kind of mass red that teaches people to
   reach for `--update-snapshots`. That is the same failure A2 was written to
   stop, so it belongs in this file rather than in one spec's local
   `addStyleTag`.

   WHY IT IS A SEPARATE LIST AND NOT A SECOND ENTRY IN `FOREIGN_OVERLAYS`
   ----------------------------------------------------------------------
   The two overlays have DIFFERENT presence rules, and collapsing them would
   quietly destroy the guarantee `require` exists to give.

     · The launcher is route-conditional: `App.tsx` withholds it from `/`. So
       "found nothing" there is legal, and anywhere else it means the selector
       drifted.
     · The skip link is on EVERY route, `/` included — it is rendered above the
       router, outside `AnimatedRoutes`.

   If `.shared-skip-link` simply joined `FOREIGN_OVERLAYS`, the summed `found`
   would be ≥1 on `/` as well, and the launcher's drift check would be
   satisfied by a completely different element. `qa-a2-overlay-guard.spec.ts`
   measures precisely that: it requires a THROW naming `[data-chat-launcher]`
   on `/`, and `found === 0` there under `require: false`. Both would have gone
   green while meaning nothing.

   So the return value keeps its meaning — LAUNCHER nodes hidden — and the skip
   link gets its own unconditional, PER-SELECTOR requirement. Per selector
   rather than summed, because a summed count is exactly how one selector
   covers for another that has gone blind: the F4 failure in `./fonts.ts`.

   NO TOLERANCE WAS TOUCHED. Not one `maxDiffPixels` moved.
   ══════════════════════════════════════════════════════════════════════════ */

/** Foreign fixed overlays: owned by other phases, not by any page's content. */
const FOREIGN_OVERLAYS = ["[data-chat-launcher]"] as const;

/**
 * Foreign fixed overlays present on EVERY route, so their absence is always a
 * drifted selector and never a legal state. Hidden unconditionally, asserted
 * one selector at a time, and deliberately NOT counted into the return value.
 */
const UBIQUITOUS_OVERLAYS = [".shared-skip-link"] as const;

/**
 * Remove foreign fixed overlays from a capture.
 *
 * Call AFTER the page has settled and BEFORE the first `toHaveScreenshot`.
 *
 * `require` defaults to true and is the important half. `App.tsx` mounts
 * `ChatBot` on every public route EXCEPT `/`, so on any other route finding
 * nothing to hide means the selector has drifted and the goldens have quietly
 * started baking the overlay again. A no-op that looks like success is exactly
 * how it got into 25 baselines, and it is the same failure mode F4 closed in
 * `./fonts.ts` — so it is asserted, not assumed. Pass `require: false` only
 * for `/`, which legitimately has no launcher.
 *
 * PHASE 07 CORRECTION #2 — H5. `require: false` USED TO BE AN HONOUR SYSTEM.
 * All three call sites are on `/` today, so it was safe today; nothing stopped
 * a later phase from passing it on a route that DOES mount the launcher, which
 * silently restores the exact defect A2 removed — 25 baselines with a foreign
 * fixed overlay painted into them, and no failure anywhere to say so.
 *
 * The exemption is now checked against the page instead of trusted: `/` is the
 * only route `App.tsx` withholds `ChatBot` from, so `/` is the only route on
 * which the requirement may be waived. The permission is derived from the same
 * fact that motivates it. The call-site SHAPE is unchanged — same parameter,
 * same default, same behaviour on every legal call — so this closes the hole
 * without moving anything a caller or a guard spec asserts on.
 */
export async function hideForeignOverlays(
  page: Page,
  { require = true }: { require?: boolean } = {},
): Promise<number> {
  if (!require) {
    let pathname = page.url();
    try {
      pathname = new URL(page.url()).pathname;
    } catch {
      /* about:blank and friends: fall through to the assertion with the raw URL. */
    }
    expect(
      pathname.replace(/\/+$/, "") || "/",
      "hideForeignOverlays({ require: false }) is only legal on `/`, the one route "
        + "App.tsx does not mount ChatBot on. On any other route the launcher IS "
        + "there, and waiving the requirement is how it got baked into 25 goldens "
        + "(see e2e/visual/overlays.ts)",
    ).toBe("/");
  }

  let found = 0;
  for (const selector of FOREIGN_OVERLAYS) found += await page.locator(selector).count();

  if (require) {
    expect(
      found,
      "no [data-chat-launcher] was found to hide — either the selector has drifted or "
        + "ChatBot stopped mounting on this route; either way the goldens would start "
        + "baking a foreign fixed overlay again (see e2e/visual/overlays.ts)",
    ).toBeGreaterThan(0);
  }

  /* C4. Checked per selector and never waived: these exist on every route, so
     a count of zero has no legal reading — it can only mean the selector no
     longer matches, and a silent no-op is how the launcher got into 25
     baselines. Deliberately after the launcher's own check, so the failure
     message on `/` stays the one `qa-a2-overlay-guard.spec.ts` reads. */
  for (const selector of UBIQUITOUS_OVERLAYS) {
    expect(
      await page.locator(selector).count(),
      `no ${selector} was found to hide — it is rendered on every route, so a count `
        + "of zero means the selector has drifted and the goldens have started baking "
        + "a foreign fixed overlay again (see e2e/visual/overlays.ts)",
    ).toBeGreaterThan(0);
  }

  const hidden = [...FOREIGN_OVERLAYS, ...UBIQUITOUS_OVERLAYS];
  await page.addStyleTag({
    content: `${hidden.join(", ")} { display: none !important; }`,
  });
  for (const selector of hidden) {
    if (await page.locator(selector).count()) await expect(page.locator(selector)).toBeHidden();
  }
  /* Still the LAUNCHER count, not the total: `qa-a2-overlay-guard.spec.ts`
     asserts `found === 0` on `/`, where the skip link is nonetheless present. */
  return found;
}
