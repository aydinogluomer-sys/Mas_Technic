import { expect, test, type Page } from "@playwright/test";
import { gotoAndSettle, measureHorizontalOverflow } from "./helpers";

/* M01 — /malzemeler carries no image sequence. The register comes before a
   single static reference plate, the plate is height-capped, an image failure
   leaves an explanatory note instead of an empty frame, and filter / compare /
   no-results still work. */

const CAPTION = "Temsili malzeme görünümü; teknik seçim aşağıdaki kayıt ve çalışma koşullarına göre yapılır.";

async function openMaterials(page: Page) {
  const frameRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/sequence-material/")) frameRequests.push(request.url());
  });
  await gotoAndSettle(page, "/malzemeler");
  return frameRequests;
}

for (const motion of ["no-preference", "reduce"] as const) {
  test.describe(`/malzemeler static plate (${motion})`, () => {
    test.use({ contextOptions: { reducedMotion: motion } });

    test("no sequence frames, no canvas, plate after the register", async ({ page }) => {
      const frameRequests = await openMaterials(page);
      await page.waitForTimeout(1500);
      expect(frameRequests, "no /sequence-material/ request on first open").toEqual([]);
      await expect(page.locator("canvas")).toHaveCount(0);

      const plate = page.locator('figure.shell-plate[data-size="reference"]');
      await expect(plate).toHaveCount(1);
      await expect(plate.locator("figcaption")).toContainText(CAPTION);

      const order = await page.evaluate(() => {
        const top = (selector: string) => {
          const element = document.querySelector(selector);
          return element ? element.getBoundingClientRect().top + scrollY : -1;
        };
        return { register: top("#kayit"), plate: top('figure.shell-plate[data-size="reference"]') };
      });
      expect(order.register).toBeGreaterThan(0);
      expect(order.plate).toBeGreaterThan(order.register);

      await plate.scrollIntoViewIfNeeded();
      const frameHeight = await plate.locator(".shell-plate-frame").evaluate((element) => element.getBoundingClientRect().height);
      const width = page.viewportSize()!.width;
      expect(frameHeight).toBeLessThanOrEqual(width < 768 ? 280 : 480);
      expect(frameHeight).toBeGreaterThan(100);
      await expect(plate.locator("img")).toHaveJSProperty("complete", true);
      expect(await plate.locator("img").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

      expect(await measureHorizontalOverflow(page)).toBeLessThanOrEqual(0);
    });
  });
}

test.describe("/malzemeler static plate failure + register behaviour", () => {
  test("a failed image shows a note, not an empty frame", async ({ page }) => {
    await page.route(/hero-malzeme-kutuphanesi.*\.webp/, (route) => route.abort());
    await gotoAndSettle(page, "/malzemeler");
    const band = page.getByRole("region", { name: "Referans görünüm" });
    await band.scrollIntoViewIfNeeded();
    await expect(band.getByText("Referans görsel yüklenemedi")).toBeVisible();
    await expect(band.getByText(CAPTION)).toBeVisible();
    await expect(page.locator('figure.shell-plate[data-size="reference"]')).toHaveCount(0);
  });

  test("search, no-results, clear and compare still work", async ({ page }) => {
    await gotoAndSettle(page, "/malzemeler");
    const search = page.getByLabel("Ara");
    await search.fill("zzzz-yok");
    await expect(page.getByText("Bu filtreyle kayıt bulunamadı")).toBeVisible();
    await page.getByRole("button", { name: "Filtreleri temizle" }).click();
    await expect(search).toHaveValue("");

    await search.fill("7075");
    await expect(page.getByRole("status").filter({ hasText: "7075" })).toBeVisible();
    await search.fill("");

    const selectors = page.locator("#kayit").getByRole("checkbox");
    const count = await selectors.count();
    test.skip(count < 2, "register exposes no selection checkboxes at this viewport");
    await selectors.nth(0).check();
    await selectors.nth(1).check();
    await expect(page.getByText("Karşılaştırma", { exact: true }).first()).toBeVisible();
  });
});
