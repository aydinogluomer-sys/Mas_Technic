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
      failure mode.
   2. `awaitRealFaces()` then PROVES the three families are really loaded, and
      fails with the reason if they are not — so a run that could not get the
      fonts says so, instead of silently comparing, or banking, a fallback
      rendering.

   PART 1 DID NOT RUN — PHASE 07 CORRECTION #1, F4
   ------------------------------------------------
   This file used to register `page.route("https://fonts.g*", …)`. Playwright's
   glob `*` does not cross `/`, so that pattern matches only a URL with no
   path, and every font request went straight past it. Measured over a load
   issuing 17 font requests:

     "https://fonts.g*"                 intercepted  0 / 17
     "https://fonts.g**"                intercepted  0 / 17
     "**fonts.googleapis.com**"         intercepted  1 / 17
     "https://fonts.googleapis.com/**"  intercepted  1 / 17

   One of seventeen, because only the STYLESHEET is on `fonts.googleapis.com`;
   the sixteen face files are on `fonts.gstatic.com`, which nothing was
   watching. So both hosts are registered separately now.

   And the stability this file previously credited to part 1 cannot have come
   from part 1. Part 2 is the whole of the measured improvement: it fails a run
   that could not get the fonts, rather than banking a fallback render, and the
   suite's 56 min → under 4 min drop belongs to it and to the load path it
   forces, not to a retry that never executed. Recorded here rather than
   quietly corrected, because a silent no-op is exactly the failure mode.

   THE NO-OP CANNOT RETURN SILENTLY
   --------------------------------
   `installFontRetry()` counts what it intercepts, per host, and
   `awaitRealFaces()` FAILS if either count is zero. A route pattern that stops
   matching now turns the visual suite red instead of doing nothing. That
   assertion is the point of the fix; without it the next glob mistake is
   invisible again.

   No `maxDiffPixels` was raised anywhere to accommodate any of this. Loosening
   the tolerance would have made a typeface substitution invisible, which is
   the opposite of what a golden is for.
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

/** One pattern per host. `**` is required — `*` does not cross a `/`. */
const FONT_HOSTS = {
  googleapis: "https://fonts.googleapis.com/**",
  gstatic: "https://fonts.gstatic.com/**",
} as const;

export type FontInterceptions = { googleapis: number; gstatic: number };

/** Live counters per page, so `awaitRealFaces()` can prove the routes fired. */
const interceptions = new WeakMap<Page, FontInterceptions>();

/**
 * Must be installed BEFORE the navigation that requests the stylesheet.
 *
 * Returns the live counter it will increment, so a caller can assert on it
 * directly; `awaitRealFaces()` asserts on it for every existing call site.
 */
export async function installFontRetry(page: Page): Promise<FontInterceptions> {
  const counts: FontInterceptions = { googleapis: 0, gstatic: 0 };
  interceptions.set(page, counts);

  for (const [host, pattern] of Object.entries(FONT_HOSTS) as [keyof FontInterceptions, string][]) {
    await page.route(pattern, async (route) => {
      counts[host] += 1;
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

  return counts;
}

export async function awaitRealFaces(page: Page) {
  /* F4 — the assertion that makes the retry falsifiable.
     `installFontRetry()` was a no-op for a whole phase and nothing noticed,
     because a route that matches nothing behaves exactly like a route that
     was never needed. If it is installed, it MUST have seen traffic on both
     hosts by the time a capture is about to happen. */
  const counts = interceptions.get(page);
  if (counts) {
    expect(
      counts.googleapis,
      "installFontRetry() intercepted 0 requests on fonts.googleapis.com — the route "
        + "pattern is a no-op, which is the exact defect F4 closed (see e2e/visual/fonts.ts)",
    ).toBeGreaterThan(0);
    expect(
      counts.gstatic,
      "installFontRetry() intercepted 0 requests on fonts.gstatic.com — the face files "
        + "live on that host, so a pattern that misses it retries nothing that matters",
    ).toBeGreaterThan(0);
  }

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
