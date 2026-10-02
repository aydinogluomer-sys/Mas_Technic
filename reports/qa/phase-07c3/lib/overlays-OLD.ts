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

   NOT INCLUDED, and deliberately: the custom cursor. It is fixed too, but it
   paints nothing until a real pointer moves, and Playwright never moves one,
   so it is absent from the captures already. Removing it here would be
   scope the advisory did not ask for and a change with no measurable effect.
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
 */
export async function hideForeignOverlays(
  page: Page,
  { require = true }: { require?: boolean } = {},
): Promise<number> {
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
