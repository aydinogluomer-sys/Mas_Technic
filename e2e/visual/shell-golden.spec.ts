import { expect, test } from "@playwright/test";
import { freezeVisualState, gotoAndSettle } from "../helpers";
import { awaitRealFaces, installFontRetry } from "./fonts";

/* ══════════════════════════════════════════════════════════════════════════
   SHELL GOLDEN SCREENSHOTS — one shell, proved by pictures

   `landing-golden.spec.ts` pins the whole landing page and
   `navigation-golden.spec.ts` pins the header and the open menu on `/`. Until
   Phase 04 there was nothing at all pinning what an INNER page looks like, and
   that is precisely where the three parallel shells lived
   (`reports/baseline/shell-inventory.md` §5).

   WHAT IS CAPTURED, AND WHAT IS DELIBERATELY NOT
   ----------------------------------------------
   The two shell surfaces every public page shares — the global bar and the
   footer — on one representative of each page family. Page BODIES are not
   captured: Phases 07 and 08 own them and will rewrite them, and a golden that
   fails on every content edit teaches people to run `--update-snapshots`
   without looking, which is exactly what `IMPLEMENTATION.md` §12 forbids.

   These captures do fail if a page reintroduces its own header, its own
   footer, its own type scale, its own rail or its own accent — the failure
   mode this phase exists to prevent.

   Deterministic by construction: `visual-*` projects declare
   `reducedMotion: "reduce"`, so the route curtain is not rendered at all and
   the footer has no entrance to race.
   ══════════════════════════════════════════════════════════════════════════ */

const SURFACES = [
  { slug: "home", path: "/" },
  { slug: "service", path: "/hizmetler/cnc-frezeleme" },
  { slug: "about", path: "/hakkimizda" },
  { slug: "journal", path: "/blog" },
  { slug: "rfq", path: "/teklif-al" },
  { slug: "notfound", path: "/__phase04-not-a-route__" },
] as const;

test.describe("shell golden screenshots", () => {
  for (const surface of SURFACES) {
    test(`${surface.slug} carries the same shell chrome`, async ({ page }) => {
      await installFontRetry(page);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await gotoAndSettle(page, surface.path);
      await expect(page.locator(".shell-root")).toBeVisible({ timeout: 20_000 });
      await freezeVisualState(page);
      await awaitRealFaces(page);

      const header = page.locator("[data-fullscreen-header]");
      await expect(header).toBeVisible();
      await expect(header).toHaveScreenshot(`shell-header-${surface.slug}.png`, {
        animations: "disabled",
        caret: "hide",
        maxDiffPixels: 200,
        timeout: 30_000,
      });

      const footer = page.locator("footer.tl-footer");
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toBeVisible();
      await expect(footer).toHaveScreenshot(`shell-footer-${surface.slug}.png`, {
        animations: "disabled",
        caret: "hide",
        maxDiffPixels: 200,
        timeout: 30_000,
      });
    });
  }
});
