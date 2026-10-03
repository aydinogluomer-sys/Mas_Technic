import { expect, test } from "@playwright/test";
import {
  gotoAndSettle,
  landingReady,
  measureHorizontalOverflow,
  waitForHeroShellTeardown,
} from "../helpers";

/**
 * WebKit + Firefox duman testi.
 *
 * Dar ve hızlı tutulur: hangi motorda olursa olsun ana sayfa eksiksiz boyanmalı,
 * giriş kabuğu devredilmeli, yatay taşma olmamalı ve paylaşılan kabuklu bir iç
 * sayfa açılmalı. Derin sözleşmeler Chromium kritik/regresyon kapılarındadır.
 */
test.describe("cross-browser smoke", () => {
  test("renders the complete landing and hands off the intro shell", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await landingReady(page);
    await waitForHeroShellTeardown(page);

    await expect(page.getByTestId("technical-hero-title")).toBeVisible();
    // UX01 (package 7): 12 sheets — marquee and manifesto bands removed.
    await expect(page.locator(".tl-band-index span")).toHaveCount(12);
    await expect(page.getByRole("contentinfo")).toBeVisible();
    expect(await measureHorizontalOverflow(page)).toBeLessThanOrEqual(1);
  });

  test("serves an inner page with the shared shell", async ({ page }) => {
    await gotoAndSettle(page, "/sss");
    await expect(page.locator("[data-fullscreen-header]")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    expect(await measureHorizontalOverflow(page)).toBeLessThanOrEqual(1);
  });

  test("keeps the primary conversion route reachable", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await landingReady(page);
    const cta = page.getByTestId("technical-hero-cta");
    await expect(cta).toHaveAttribute("href", "/teklif-al");
    await cta.click();
    await expect(page).toHaveURL(/\/teklif-al$/);
  });
});
