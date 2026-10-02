import { expect, test } from "@playwright/test";
import { freezeVisualState, gotoAndSettle } from "../helpers";
import { awaitRealFaces, installFontRetry } from "./fonts";
import { hideForeignOverlays } from "./overlays";

/* ══════════════════════════════════════════════════════════════════════════
   WAVE B GOLDEN SCREENSHOTS — the four surfaces Phase 08 is judged on

   `shell-golden.spec.ts` pins the CHROME (header + footer) on one page of each
   family and deliberately captures no page body: Phases 07 and 08 were going
   to rewrite those bodies, and a golden that fails on every content edit
   teaches people to run `--update-snapshots` without looking, which
   `IMPLEMENTATION.md` §12 forbids by name. `inner-pages-golden.spec.ts` pins
   the Wave A bodies for the same reason, now that they are settled.

   This file is the Wave B equivalent, and it is deliberately FOUR crops rather
   than one per route. Each is the region an acceptance criterion or a
   content-truth rule actually turns on:

     404 BODY            "404 is unmistakably MAS TECHNIC, usable and linked
                         back into the site." The crop contains the status
                         readout, the nearest-record correction and the
                         directory — the three things that make it usable.
     JOURNAL LEAD        "Blog index is a technical editorial publication
                         rather than a generic card grid." The lead band is
                         what makes it a publication; if it regresses to a card
                         grid this fails.
     QUALITY DOCUMENTS   "Quality/Resources are real technical-document
                         surfaces." The band is the four §H PDFs as a register
                         with their measured sizes.
     PROFILE SCOPE       The band that states, on the page, that these are not
                         customer projects. `USER_INPUTS.md` §G is the reason
                         that sentence exists, and a golden is the cheapest
                         thing that notices if it is ever quietly dropped.

   NOT captured: whole pages. `/sss` renders ~120 `<details>` and grows with
   `servicePages.ts`; the legal routes are text that will be revised by
   somebody who is not looking at a screenshot suite. Pinning those would
   manufacture exactly the failure mode §12 warns about.

   THE 404 PATH IS FIXED AND CHOSEN, not arbitrary. `/olmayan-sayfa/cnc-frezelme`
   matches no route pattern, so it reaches the catch-all; and its tokens score
   against the real IA, so the capture contains a populated `YAKIN KAYITLAR`
   block rather than the empty branch. The requested path is printed in the
   status readout, so it has to be a constant.
   ══════════════════════════════════════════════════════════════════════════ */

const NOT_A_ROUTE = "/olmayan-sayfa/cnc-frezelme";

const SURFACES = [
  { slug: "notfound-body", path: NOT_A_ROUTE, selector: ".shell-notfound" },
  { slug: "journal-lead", path: "/blog", selector: ".tl-band.shell-surface-band >> nth=0" },
  { slug: "quality-documents", path: "/kalite-dosyasi", selector: ".tl-band.shell-surface-band >> nth=0" },
  { slug: "profile-scope", path: "/kabiliyet-profilleri", selector: ".tl-band.shell-surface-band >> nth=0" },
] as const;

test.describe("wave B golden screenshots", () => {
  for (const surface of SURFACES) {
    test(`${surface.slug} holds its baseline`, async ({ page }) => {
      test.setTimeout(120_000);
      await installFontRetry(page);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await gotoAndSettle(page, surface.path);
      await expect(page.locator(".shell-root")).toBeVisible({ timeout: 20_000 });
      await freezeVisualState(page);
      await awaitRealFaces(page);
      /* The chat launcher is `position: fixed` and mounts on every route
         except `/`. It is page content on none of them, and it is how it got
         baked into 25 goldens once already (`e2e/visual/overlays.ts`). */
      await hideForeignOverlays(page);

      /* THE GLOBAL BAR IS HIDDEN TOO, and for the same reason — measured, not
         assumed. `.shell-notfound` begins at the top of the sheet, so the
         element screenshot's first ~70 rows were the fixed header painted over
         the page's own eyebrow: the first baseline written for this crop had
         `ERR::PAGE_NOT_FOUND` covered, i.e. a content golden that could not see
         a change in the content it exists to watch. The bar is `position:
         fixed` and its space is reserved separately by `.tl-header-spacer`, so
         `display: none` removes the paint without moving anything — the same
         property that makes hiding the launcher safe. The header has its own
         goldens in `navigation-golden.spec.ts` and `shell-golden.spec.ts`;
         this file is page content only. */
      /* THE SKIP LINK USED TO BE HIDDEN ON THIS LINE TOO, and no longer is —
         because `hideForeignOverlays()` above now hides it for EVERY visual
         spec. `.shared-skip-link` is a foreign fixed overlay whose `shadow-lg`
         lands at the top-left of any crop taken with `captureBeyondViewport`;
         the measurement that found it, and the reason it is a separate list
         from the launcher rather than a second entry beside it, are recorded
         in `e2e/visual/overlays.ts` (Phase 08 correction C4). Keeping the fix
         local would have left every other visual spec still baking it — which
         is why this spec reported it upward instead of only fixing itself.

         The header stays local: `navigation-golden.spec.ts` and
         `shell-golden.spec.ts` exist to photograph it. It is hidden HERE only
         because `.shell-notfound` starts at the top of the sheet, so the bar
         painted over this file's own subject. */
      await page.addStyleTag({
        content: "[data-fullscreen-header]{display:none !important}",
      });
      await expect(page.locator("[data-fullscreen-header]")).toBeHidden();
      await expect(page.locator(".shared-skip-link")).toBeHidden();

      /* No explicit scroll: `toHaveScreenshot` on a locator scrolls the
         element into view itself. The first version called
         `scrollIntoViewIfNeeded()` first, which pinned the element's top to
         the viewport top — i.e. under the bar. */
      const target = page.locator(surface.selector);
      await expect(target).toBeVisible();
      await expect(target).toHaveScreenshot(`waveb-${surface.slug}.png`, {
        animations: "disabled",
        caret: "hide",
        maxDiffPixels: 200,
        timeout: 30_000,
      });
    });
  }
});
