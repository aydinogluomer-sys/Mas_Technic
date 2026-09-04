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
      /* AND THE SKIP LINK, which is the finding this spec produced.

         `.shared-skip-link` (`src/App.tsx`) is `position: fixed`, parked at
         `-translate-y-24` off the top of the viewport, and carries Tailwind's
         `shadow-lg`. It paints nothing on screen — but these crops are TALLER
         THAN THE VIEWPORT, so Playwright captures them with
         `captureBeyondViewport`, and in the expanded viewport the fixed link's
         shadow lands at the crop's own top-left.

         Measured on `waveb-notfound-body` at 375 before this line existed: a
         wash from `rgb(235,232,226)` at row 0 back to the page ground
         `rgb(251,248,241)` by row ~12, across the crop's leftmost ~110px —
         i.e. a ~2.7% black shading, invisible to the eye at full size and
         quietly baked into the baseline. Two controls identified it: hiding
         `.shared-skip-link` removes it, and so does `box-shadow: none` on
         everything; nothing else fixed in the document paints there.

         It appears only on the two mobile-emulated projects (375, 768) and not
         at 1280/1440, which is why it would have gone unnoticed and then shown
         up as an unexplained two-viewport diff later.

         This is a LOCAL fix. `e2e/visual/overlays.ts` is the right home for it
         and is outside this phase's write allowlist; the finding is reported so
         its owner can decide. */
      await page.addStyleTag({
        content: "[data-fullscreen-header],.shared-skip-link{display:none !important}",
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
