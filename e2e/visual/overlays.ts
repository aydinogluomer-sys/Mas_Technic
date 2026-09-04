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

   NOT INCLUDED: the custom cursor — AND THE REASON FIRST GIVEN HERE WAS WRONG
   -------------------------------------------------------------------------
   PHASE 07 CORRECTION #2 — H4.

   This file used to say the cursor "paints nothing until a real pointer moves,
   and Playwright never moves one". That is not true, and a wrong reason is
   worth less than no reason: it stops the next reader from re-deriving the
   real one. Measured on the six rebuilt routes, in a `reducedMotion: "reduce"`
   context, with NO pointer ever moved:

     375   `CustomCursor` returns null — `isMobile || !finePointer` — so
           neither layer exists. Zero matches on all six routes.
     1280  BOTH layers mount and BOTH are `opacity: 1` from the first frame.
           The dot is 6×6 at rect (-3,-3), the ring 44×44 at rect (-22,-22),
           each `translate(-50%,-50%)` about the viewport origin. So 3×3 of the
           dot and 22×22 of the ring lie INSIDE the viewport and are painted,
           on every one of the six routes. They are parked, not hidden.

   THE REASON IT NEVERTHELESS HOLDS is geometric, and it is conditional:

     1. below 901 px there is nothing to hide (the component does not mount),
        which covers the 375 and 768 goldens outright;
     2. at 1280/1440 the painted area is the top-left 22×22 px OF THE VIEWPORT,
        and every golden here is an ELEMENT-scoped crop of page content, none
        of which reaches that corner;
     3. QA's independent exact-colour scan over all 100 committed goldens finds
        zero cursor pixels, which is the same conclusion arrived at from the
        pixels rather than from the geometry.

   So the conclusion stands and the launcher is still the only entry in
   `FOREIGN_OVERLAYS` — but on a condition that a later phase can break without
   touching this file. A FULL-PAGE capture at ≥901 px, or any element crop that
   includes the viewport's top-left corner, WILL bake both layers in. If a
   golden is ever added under either shape, add `[data-custom-cursor]` here.
   The attribute already exists on both layers, so the selector is one line.
   ══════════════════════════════════════════════════════════════════════════ */

/** Foreign fixed overlays: owned by other phases, not by any page's content. */
const FOREIGN_OVERLAYS = ["[data-chat-launcher]"] as const;

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

  await page.addStyleTag({
    content: `${FOREIGN_OVERLAYS.join(", ")} { display: none !important; }`,
  });
  for (const selector of FOREIGN_OVERLAYS) {
    if (await page.locator(selector).count()) await expect(page.locator(selector)).toBeHidden();
  }
  return found;
}
