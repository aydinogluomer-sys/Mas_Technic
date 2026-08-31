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

  test("every navigation hash link targets a real section anchor", async ({ page }) => {
    // The six hash items used to live in the landing-only `.tl-header .tl-nav`
    // strip, which was ALL the navigation `/` had (B14). They are now the
    // section block of the one global menu, addressed as `/#id` so the same
    // control works from an inner page. The contract is unchanged and one
    // anchor wider: every hash a user can click must land on a real band.
    await page.locator("[data-menu-trigger]").click();
    const menu = page.locator("[data-fullscreen-menu]");
    await expect(menu).toBeVisible();
    const hrefs = await menu.locator("[data-nav-sections] a[href*='#']").evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")!.split("#")[1]));
    expect(hrefs).toHaveLength(LANDING_SCENE_IDS.length);

    for (const id of hrefs) {
      expect(LANDING_SCENE_IDS as readonly string[], `#${id} must be a declared landing anchor`)
        .toContain(id);
      await expect(page.locator(`#${id}`), `#${id} must exist exactly once`).toHaveCount(1);
    }
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
  });

  test("a section link scrolls its band clear of the fixed header", async ({ page }) => {
    // Anchor navigation and route navigation are two different objects in one
    // menu. This proves the anchor half actually moves the page AND that the
    // fixed bar does not cover the band it just navigated to.
    await page.locator("[data-menu-trigger]").click();
    const menu = page.locator("[data-fullscreen-menu]");
    await expect(menu).toBeVisible();
    await menu.locator('[data-nav-sections] a[href$="#kalite"]').click();
    await expect(menu).toHaveCount(0);
    const headerHeight = await page.locator("[data-fullscreen-header]")
      .evaluate((element) => element.getBoundingClientRect().height);
    await expect.poll(async () => {
      await settleRendering(page);
      const top = await page.locator("#kalite").evaluate((element) => element.getBoundingClientRect().top);
      return top >= headerHeight - 4 && top <= headerHeight + 32;
    }, { timeout: 15_000, intervals: [200, 400, 800] }).toBe(true);
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
