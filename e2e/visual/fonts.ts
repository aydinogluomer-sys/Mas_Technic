import { expect, type Page } from "@playwright/test";

/* ══════════════════════════════════════════════════════════════════════════
   THE GOLDEN SUITE DEPENDED ON A THIRD-PARTY FONT HOST — measured, then closed

   THE DEFECT
   ----------
   Across five full runs of the visual suite on an otherwise unchanged build,
   one or two captures failed each time, and it was a DIFFERENT test each time:

     run A   every golden matched
     run B   `navigation-closed`  @375   and  `shell-header-notfound` @768
     run C   `shell-header-rfq`   @375
     run D   `inner-hero-sector-detail` @1280 and `navigation-open` @1440
     run E   `inner-hero-service-detail` @768 and `shell-header-notfound` @768

   The two 375 failures were byte-for-byte the same delta:

     changedPixels 1453 · ratio 0.06054 · rows 19–43 (the wordmark)
     amplitude { 1-8: 82, 9-32: 252, 33-96: 412, 97-255: 707 }
     bestOffsetX 0 · bestOffsetY 0 · residual flat across every offset

   Identical numbers from two different routes, with the best alignment offset
   at zero and the residual flat, is neither a layout change nor a shift. The
   body-copy diffs settle what it is: the text is doubled with a displacement
   that GROWS along each line, and some lines break at different words. Only a
   different TYPEFACE does that — different glyph advances, not a moved box.

   THE CAUSE
   ---------
   `index.html` loads all three families from `fonts.googleapis.com`, with the
   faces themselves on `fonts.gstatic.com`. When either request is slow or
   fails — and on this host they intermittently do — Chromium paints the
   fallback stack and the capture is of a different typeface than the baseline.

   `document.fonts.ready` cannot see it: `ready` resolves when no font load is
   PENDING, and a face that failed, or that was never declared because the
   stylesheet itself did not arrive, is not pending. `helpers.settleRendering`
   and `helpers.freezeVisualState` both await `ready`, which is why the race
   survived them. (`e2e/shared-shell-accessibility.spec.ts` avoids the same
   dependency by stubbing the host outright.)

   `document.fonts.check()` cannot see it either, and that is worth writing
   down because it is a trap: per spec `check()` answers "can this font LIST
   render the text without further downloads", and a system fallback can — so
   it returns `true` on a machine that has never heard of Space Grotesk. The
   only sound test is to enumerate the `FontFaceSet` and require a `FontFace`
   whose family is the one we asked for and whose `status` is `"loaded"`.

   THE FIX — TWO PARTS
   -------------------
   1. `installFontRetry()` retries the two font hosts a few times per request
      before letting the failure through, which removes the single-attempt
      failure mode that produced every one of the diffs above.
   2. `awaitRealFaces()` then PROVES the three families are really loaded, and
      fails with the reason if they are not — so a run that could not get the
      fonts says so, instead of silently comparing, or banking, a fallback
      rendering.

   No `maxDiffPixels` was raised anywhere to accommodate this. Loosening the
   tolerance would have made a typeface substitution invisible, which is the
   opposite of what a golden is for.
   ══════════════════════════════════════════════════════════════════════════ */

/** The three families `design-tokens.css` declares. */
const FAMILIES = ["Space Grotesk", "IBM Plex Mono", "Newsreader"] as const;

/** The weights the shell paints with — requested so they are not left lazy. */
const FACES = [
  '700 22px "Space Grotesk"',
  '600 16px "Space Grotesk"',
  '500 16px "Space Grotesk"',
  '400 16px "Space Grotesk"',
  '600 10px "IBM Plex Mono"',
  '500 11px "IBM Plex Mono"',
  '400 12px "IBM Plex Mono"',
  'italic 400 30px "Newsreader"',
] as const;

const FONT_HOSTS = "https://fonts.g*";

/** Must be installed BEFORE the navigation that requests the stylesheet. */
export async function installFontRetry(page: Page) {
  await page.route(FONT_HOSTS, async (route) => {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const response = await route.fetch({ timeout: 15_000 });
        if (response.ok()) {
          await route.fulfill({ response });
          return;
        }
      } catch {
        /* retry */
      }
    }
    await route.continue();
  });
}

export async function awaitRealFaces(page: Page) {
  await expect
    .poll(
      async () =>
        page.evaluate(async ([faces, families]: [readonly string[], readonly string[]]) => {
          await Promise.all(faces.map((face) => document.fonts.load(face).catch(() => undefined)));
          await document.fonts.ready;
          const loaded = new Set<string>();
          document.fonts.forEach((face) => {
            if (face.status === "loaded") loaded.add(face.family.replace(/["']/g, ""));
          });
          return families.filter((family) => !loaded.has(family));
        }, [FACES, FAMILIES] as [readonly string[], readonly string[]]),
      {
        message:
          "the web fonts never loaded, so this capture would have been of the fallback "
          + "stack rather than the site's typefaces (see e2e/visual/fonts.ts)",
        timeout: 25_000,
        intervals: [250, 500, 1000, 2000],
      },
    )
    .toEqual([]);

  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
}
