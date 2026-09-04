import { expect, test, type Page } from "@playwright/test";
import { gotoAndSettle } from "../helpers";
import { awaitRealFaces, installFontRetry } from "./fonts";
import { hideForeignOverlays } from "./overlays";

/* ══════════════════════════════════════════════════════════════════════════
   INNER-PAGE GOLDEN SCREENSHOTS — Phase 07

   WHAT WAS AND WAS NOT PINNED BEFORE
   ----------------------------------
   `landing-golden.spec.ts` pins the whole landing. `navigation-golden.spec.ts`
   pins the header and the open menu. `shell-golden.spec.ts` pins the header
   and the footer on one representative of each page family — and says, in its
   own header, that page BODIES are deliberately not captured because "Phases
   07 and 08 own them and will rewrite them".

   Phase 07 has now rewritten them, and its acceptance criteria are visual in
   two specific ways that a DOM assertion cannot reach:

     · "Core pages visually and structurally belong to the landing family."
     · "Each service/sector page has a meaningful next-step/RFQ path."
     · "Desktop/tablet/mobile golden snapshots exist for representative routes."

   So this file captures exactly two elements per route: the page's opening
   band, which is where family membership is decided (rail index, mono eyebrow,
   editorial title, hairline rule, the measured metadata run, the 12/6/4 master
   columns), and the closing RFQ band on the routes whose criterion names it.

   WHY ELEMENTS AND NOT FULL PAGES
   -------------------------------
   Two reasons, both measured rather than aesthetic.

   1. `/malzemeler` mounts `MaterialMorphScroll`, a 300vh scroll-driven canvas
      backed by an 80-frame image sequence. A full-page capture there means
      driving the whole sequence and waiting on 80 network images, which is the
      exact class of nondeterminism `helpers.freezeVisualState` was written to
      contain — and containing it costs a full-document scroll pass per
      capture, per viewport.

   2. A golden that fails on every copy edit teaches people to run
      `--update-snapshots` without looking, which `IMPLEMENTATION.md` §12
      forbids by name. These two bands change when the SYSTEM changes.

   The captured elements contain no `<img>` at all, so the freeze below does
   not need `freezeVisualState`'s lazy-image sweep: pausing animation, stopping
   video, and waiting for fonts plus two paint frames is the whole
   determinism requirement for text and rules.

   TABLET
   ------
   The visual matrix was `[375, 1280, 1440]`. There was no tablet width in it,
   so "desktop/tablet/mobile golden snapshots exist" could not be satisfied at
   all. `playwright.config.ts` now carries 768 as well, at 768×1024 with touch
   emulation — the same shape the `tablet-768` regression project uses, so the
   two lanes describe the same device rather than two different ones.
   ══════════════════════════════════════════════════════════════════════════ */

const ROUTES = [
  { slug: "about", path: "/hakkimizda" },
  { slug: "contact", path: "/iletisim" },
  { slug: "materials", path: "/malzemeler" },
  { slug: "material-family", path: "/malzemeler/aluminyum" },
  { slug: "service-category", path: "/hizmetler/kategori/talasli-imalat" },
  { slug: "service-detail", path: "/hizmetler/cnc-frezeleme" },
  { slug: "sector-detail", path: "/endustriyel/havacilik-uzay" },
] as const;

/** The routes whose acceptance criterion is about the next step itself. */
const NEXT_STEP = new Set(["service-category", "service-detail", "sector-detail"]);

async function freezeForCapture(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-play-state: paused !important;
        transition-duration: 0s !important;
        scroll-behavior: auto !important;
        caret-color: transparent !important;
      }
    `,
  });
  await page.evaluate(() => {
    document.querySelectorAll("video").forEach((video) => { video.pause(); video.currentTime = 0; });
  });
  /* Not `document.fonts.ready` alone — see `./fonts.ts` for the measured race
     it does not cover. */
  await awaitRealFaces(page);
  /* A2: every route in this spec mounts the chat launcher, so `require`
     stays on — a count of zero here means the selector drifted. */
  await hideForeignOverlays(page);
}

test.describe("inner-page golden screenshots", () => {
  for (const route of ROUTES) {
    test(`${route.slug} opens and closes in the landing's language`, async ({ page }) => {
      await installFontRetry(page);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await gotoAndSettle(page, route.path);
      await expect(page.locator(".shell-root")).toBeVisible({ timeout: 20_000 });
      await freezeForCapture(page);

      /* The opening band. It is also the assertion that closes blocker I4 at
         the picture level: on the two detail routes this element carries the
         `<h1>`, and at 375 the previous hero clipped that `<h1>` away
         entirely. A golden of an empty band would be visible at a glance. */
      const hero = page.locator(".shell-hero");
      await expect(hero).toHaveCount(1);
      await expect(hero).toBeVisible();
      await expect(hero).toHaveScreenshot(`inner-hero-${route.slug}.png`, {
        animations: "disabled",
        caret: "hide",
        maxDiffPixels: 120,
        timeout: 30_000,
      });

      if (!NEXT_STEP.has(route.slug)) return;

      const next = page.locator(".shell-next");
      await expect(next).toHaveCount(1);
      await next.scrollIntoViewIfNeeded();
      await expect(next).toBeVisible();
      await expect(next).toHaveScreenshot(`inner-next-${route.slug}.png`, {
        animations: "disabled",
        caret: "hide",
        maxDiffPixels: 120,
        timeout: 30_000,
      });
    });
  }
});
