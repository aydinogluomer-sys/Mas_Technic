import { expect, test } from "@playwright/test";
import { freezeVisualState, gotoAndSettle, landingReady } from "../helpers";
import { awaitRealFaces, installFontRetry } from "./fonts";
import { hideForeignOverlays } from "./overlays";

/**
 * GLOBAL NAVIGATION — golden screenshots, closed and open.
 *
 * The landing golden (`landing-golden.spec.ts`) captures the closed bar only as
 * a 72px strip at the top of a 4000px page, where a 200-pixel budget cannot see
 * it. The menu is not in that capture at all, because it only exists while
 * open. These two captures are what make the navigation's appearance a
 * regression contract rather than a promise.
 *
 * Deterministic by construction: `visual-*` projects declare
 * `reducedMotion: "reduce"`, and under reduced motion the menu mounts in its
 * final state (`initial="visible"`), so there is no entrance to race.
 */
test.describe("global navigation golden screenshots", () => {
  test.beforeEach(async ({ page }) => {
    await installFontRetry(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoAndSettle(page, "/");
    await landingReady(page);
    await freezeVisualState(page);
    await awaitRealFaces(page);
    /* A2: see landing-golden — `/` mounts no launcher today. */
    await hideForeignOverlays(page, { require: false });
  });

  test("matches the closed header baseline", async ({ page }) => {
    const header = page.locator("[data-fullscreen-header]");
    await expect(header).toBeVisible();
    // The bar is fixed, so an element screenshot is the whole contract: brand
    // plate, context readout, trigger and RFQ button on their master columns.
    await expect(header).toHaveScreenshot("navigation-closed.png", {
      animations: "disabled",
      caret: "hide",
      maxDiffPixels: 200,
      timeout: 30_000,
    });
  });

  test("matches the open menu baseline", async ({ page }) => {
    await page.locator("[data-menu-trigger]").click();
    const menu = page.locator("[data-fullscreen-menu]");
    await expect(menu).toBeVisible();
    // Below 768 (and on short viewports) the accordion opens closed by design,
    // so the capture would otherwise never contain a detail list on mobile.
    // Open the first category explicitly and assert the same expanded state at
    // every width — the golden then compares like with like.
    const firstCategory = menu.locator("[data-nav-category]").first();
    if (await firstCategory.getAttribute("aria-expanded") === "false") await firstCategory.click();
    await expect(firstCategory).toHaveAttribute("aria-expanded", "true");
    await expect(menu.locator("[data-nav-detail-list] a[href]").first()).toBeVisible();
    await expect(menu).toHaveScreenshot("navigation-open.png", {
      animations: "disabled",
      caret: "hide",
      maxDiffPixels: 200,
      timeout: 30_000,
    });
  });
});
