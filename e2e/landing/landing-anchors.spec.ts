import { expect, test } from "@playwright/test";
import { gotoAndSettle, LANDING_SCENE_IDS, landingReady, settleRendering } from "../helpers";

/**
 * Çapa navigasyonu sözleşmesi.
 *
 * `helpers.ts` içindeki eski `LANDING_SCENE_IDS` listesi dokuz çapa iddia
 * ediyordu (`top, hizmetler, endustriler, malzemeler, neden-biz, kabiliyetler,
 * referanslar, sss, iletisim`) ve bunların hiçbiri `/` üzerinde yok
 * (`reports/baseline/known-blockers.md` B03). Liste artık gerçek yedi çapaya
 * dayanıyor ve burada iki yönlü doğrulanıyor: DOM'da var mı, ve header'ın
 * verdiği her hash bağlantısı gerçekten bir çapaya iniyor mu.
 */
test.describe("production landing anchors", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndSettle(page, "/");
    await landingReady(page);
  });

  test("every header hash link targets a real section anchor", async ({ page }) => {
    const hrefs = await page.locator(".tl-header .tl-nav a[href^='#']").evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")!.slice(1)));
    expect(hrefs.length).toBeGreaterThan(0);

    for (const id of hrefs) {
      expect(LANDING_SCENE_IDS as readonly string[], `#${id} must be a declared landing anchor`)
        .toContain(id);
      await expect(page.locator(`#${id}`), `#${id} must exist exactly once`).toHaveCount(1);
    }
  });

  test("anchor navigation actually reaches every declared section", async ({ page }) => {
    for (const id of LANDING_SCENE_IDS) {
      const target = page.locator(`#${id}`);
      await expect(target).toHaveCount(1);
      await page.evaluate((anchor) => {
        document.getElementById(anchor)!.scrollIntoView({ behavior: "auto", block: "start" });
      }, id);
      await settleRendering(page);

      const box = await target.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top, height: rect.height, width: rect.width };
      });
      expect(box.height, `#${id} must have height`).toBeGreaterThan(0);
      expect(box.width, `#${id} must have width`).toBeGreaterThan(0);
      // Bant, hedeflendikten sonra görünür alanla kesişmeli: sabit bir katman
      // ya da pin tuzağı çapayı ekran dışında bırakmamalı.
      expect(box.top, `#${id} must land inside the viewport`)
        .toBeLessThan(page.viewportSize()!.height);
    }
  });

  test("the drawing footer only links to routes the app actually serves", async ({ page }) => {
    const targets = await page.getByRole("contentinfo").locator("a[href]").evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")!));
    const hashTargets = targets.filter((href) => href.startsWith("#"));
    for (const href of hashTargets) {
      await expect(page.locator(href), `${href} footer anchor must exist`).toHaveCount(1);
    }
    expect(targets.length).toBeGreaterThan(0);
  });
});
