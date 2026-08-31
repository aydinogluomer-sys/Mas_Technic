import { expect, test } from "@playwright/test";

/**
 * `/technical-preview`, `/legacy-landing` ve `/test` yayınlanabilir yüzeyler
 * değildir (`reports/baseline/known-blockers.md` B15). Üretim derlemesinde
 * `src/App.tsx` bu üç `<Route>`'u `import.meta.env.DEV` yanlış olduğu için hiç
 * oluşturmaz; istek `*` üzerinden 404 sayfasına düşer.
 *
 * Bu paket üretim önizlemesine (`npm run preview`) karşı koşar. `npm run dev`
 * altında aynı URL'ler bilerek erişilebilir kalır.
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
