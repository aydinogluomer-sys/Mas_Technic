import { expect, test } from "@playwright/test";

/**
 * `/technical-preview`, `/legacy-landing` ve `/test` yayınlanabilir yüzeyler
 * değildi (`reports/baseline/known-blockers.md` B15). Faz 1a bu üç dev-only
 * yüzeyi ve rotalarını kaynaktan sildi; istek `*` üzerinden 404 sayfasına
 * düşer. Niyet aynı kalır: bu adresler hiçbir zaman bir sayfa açmaz.
 */
const DEV_ONLY_ROUTES = ["/technical-preview", "/legacy-landing", "/test"] as const;

test.describe("dev-only routes are absent from the production build", () => {
  for (const route of DEV_ONLY_ROUTES) {
    test(`${route} resolves to the 404 page`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      // 404 imzası: sayfa kendi kimliğini bildirir ve kurtarma bağlantıları verir.
      await expect(page.getByText("ERR::PAGE_NOT_FOUND")).toBeAttached({ timeout: 15_000 });
      await expect(page.getByRole("link", { name: "Ana Sayfa" }).first()).toBeVisible();

      // Dev yüzeylerin hiçbir izi kalmamalı.
      await expect(page.getByTestId("technical-landing-root")).toHaveCount(0);
      await expect(page.getByTestId("landing-version-root")).toHaveCount(0);
      await expect(page.locator(".lf-root")).toHaveCount(0);
    });
  }
});
