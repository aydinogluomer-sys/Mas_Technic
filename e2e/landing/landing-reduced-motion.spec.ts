import { expect, test } from "@playwright/test";
import { gotoAndSettle, landingReady, measureHorizontalOverflow, waitForHeroShellTeardown } from "../helpers";

/**
 * `prefers-reduced-motion: reduce` altında landing eksiksiz ve statik olmalı.
 * Giriş sekansı bu modda hiç kurulmaz — dolayısıyla `#hero-shell` React
 * render'dan önce kaldırılır (`src/lib/hero-shell.ts`).
 */
test.describe("production landing under reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("renders a complete, static landing and removes the intro shell at once", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await landingReady(page);
    await waitForHeroShellTeardown(page);

    await expect(page.getByTestId("technical-landing-root")).toHaveAttribute("data-motion", "reduced");
    await expect(page.getByTestId("technical-hero-title")).toBeVisible();
    // R1 (5 Oct): 14 sheets — the reference marquee and manifesto bands are back.
    await expect(page.locator(".tl-band-index span")).toHaveCount(14);
    await expect(page.getByRole("contentinfo")).toBeVisible();

    const running = await page.locator(".tl-root *").evaluateAll((elements) =>
      elements.filter((element) => getComputedStyle(element).animationName !== "none").length);
    expect(running, "no CSS animation may run under reduced motion").toBe(0);

    expect(await measureHorizontalOverflow(page)).toBeLessThanOrEqual(1);
  });

  test("keeps every band measurable — nothing collapses to zero height", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await landingReady(page);

    const collapsed = await page.locator(".tl-band").evaluateAll((bands) =>
      bands
        .filter((band) => band.getBoundingClientRect().height <= 0)
        .map((band) => band.className));
    expect(collapsed).toEqual([]);
  });
});
