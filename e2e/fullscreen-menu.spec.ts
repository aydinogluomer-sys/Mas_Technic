import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { gotoAndSettle, isReducedMotionAuditViewport } from "./helpers";
import { navigationItems } from "../src/components/navigation/ia";

/**
 * Tam ekran menü sözleşmesi ÜRETİM ANA SAYFASINDA koşar.
 *
 * Tarihçe: bu paket bir zamanlar `gotoAndSettle(page, "/")` çağırıyor ve
 * `helpers.ts` tarafından sessizce dev-only `/legacy-landing`'e
 * yönlendiriliyordu (`reports/baseline/known-blockers.md` B02). Faz 01
 * yönlendirmeyi kaldırınca `/` rotasının menüyü hiç mount etmediği açığa çıktı
 * (B14) ve paket geçici olarak `/sss`'e taşındı. Faz 03 tek global
 * navigasyonu kurdu; `/` artık aynı tetikleyiciyi basıyor, paket asıl evine
 * döndü.
 *
 * Aynı sözleşmenin iç sayfalarda da geçerli olduğunu
 * `e2e/shared-shell-accessibility.spec.ts` (89 rotanın tamamı) ve
 * `e2e/landing/navigation-reachability.spec.ts` ölçer.
 */
const MENU_HOST_ROUTE = "/";
/** İç sayfa karşılığı: aynı menü, farklı kabuk. */
/* Revision 4: `/sss` now belongs to the 04 Kurumsal family, so the menu opens
   on that family there. The parity lane uses a page outside every family. */
const INNER_HOST_ROUTE = "/kvkk";

test.describe("Fullscreen machining navigation", () => {
  test("uses one three-line trigger and a viewport-bound takeover", async ({ page }) => {
    await gotoAndSettle(page, MENU_HOST_ROUTE);
    const trigger = page.locator("[data-menu-trigger]");
    await expect(trigger).toBeVisible();
    await expect(trigger.locator("span[aria-hidden] > span")).toHaveCount(3);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6));
    await expect.poll(() => page.locator("[data-fullscreen-header]").evaluate((header) =>
      Math.round(header.getBoundingClientRect().top))).toBe(0);
    await trigger.click();
    const menu = page.locator("[data-fullscreen-menu]");
    await expect(menu).toBeVisible();
    await expect(menu).toHaveAttribute("role", "dialog");
    await expect(menu).toHaveAttribute("aria-modal", "true");
    const bounds = await menu.boundingBox();
    const viewport = page.viewportSize();
    expect(Math.abs(bounds!.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(bounds!.y)).toBeLessThanOrEqual(1);
    expect(bounds!.width).toBeGreaterThanOrEqual(viewport!.width - 1);
    expect(bounds!.height).toBeGreaterThanOrEqual(viewport!.height - 1);
    await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  });

  test("places the primary menu trigger before main-page controls", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1280", "one canonical keyboard baseline");
    await gotoAndSettle(page, MENU_HOST_ROUTE);
    const trigger = page.locator("[data-menu-trigger]");
    await expect(trigger).toBeVisible();
    await page.evaluate(() => {
      document.body.tabIndex = -1;
      document.body.focus();
    });

    let tabCount = 0;
    while (tabCount < 12 && !(await trigger.evaluate((element) => element === document.activeElement))) {
      await page.keyboard.press("Tab");
      tabCount += 1;
    }

    await expect(trigger).toBeFocused();
    /* Revision 4 puts the trigger last in the header's action row (language ▾ ·
       NEXUS · quote · menu), and the Tab order follows what is seen: skip link,
       brand, the three actions, then the trigger. The contract that matters is
       below — it still comes before every control in <main>. */
    expect(tabCount, "primary menu trigger should be reached within the header").toBeLessThanOrEqual(6);

    const order = await page.evaluate(() => {
      const selector = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';
      const visible = [...document.querySelectorAll<HTMLElement>(selector)].filter((element) => {
        if (element.tabIndex < 0 || element.closest("[hidden],[inert]")) return false;
        const style = getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
      });
      return {
        trigger: visible.findIndex((element) => element.hasAttribute("data-menu-trigger")),
        main: visible.findIndex((element) => element.closest("main")),
      };
    });
    expect(order.trigger).toBeGreaterThanOrEqual(0);
    expect(order.main).toBeGreaterThan(order.trigger);
  });

  test("exposes three category families of five and the flat 04 Kurumsal family", async ({ page }) => {
    await gotoAndSettle(page, MENU_HOST_ROUTE);
    await page.locator("[data-menu-trigger]").click();
    const menu = page.locator("[data-fullscreen-menu]");
    // `:not([lang])`: the language switch (round 2) also uses aria-pressed toggles.
    const families = menu.locator("button[aria-pressed]:not([lang])");
    await expect(families).toHaveCount(4);
    for (const family of (await families.all()).slice(0, 3)) {
      await family.click();
      await expect(menu.locator("[data-menu-group] section")).toHaveCount(5);
    }
    /* Revision 4: Kurumsal is a family of plain pages, listed flat; the old
       directory columns ("Ana sayfa bölümleri", "Kaynaklar") are gone. */
    await families.nth(3).click();
    const pages = menu.locator("[data-nav-page-list] a");
    await expect(pages).toHaveCount(7);
    await expect(pages).toHaveText([
      "01Hakkımızda↗", "02İletişim↗", "03CNC İşleme Malzemeleri↗", "04Kalite Dosyası↗",
      "05Teknik Günlük↗", "06Sık Sorulan Sorular↗", "07Kabiliyet Profilleri↗",
    ]);
    await expect(menu.locator("[data-nav-sections]")).toHaveCount(0);
    await expect(menu.getByRole("link", { name: "Projeni Yükle" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Hakkımızda" })).toHaveCount(1);
  });

  test("traps focus, closes on Escape, and restores trigger focus", async ({ page }) => {
    await gotoAndSettle(page, MENU_HOST_ROUTE);
    const trigger = page.locator("[data-menu-trigger]");
    await trigger.focus();
    await page.keyboard.press("Enter");
    const menu = page.locator("[data-fullscreen-menu]");
    await expect(menu).toBeVisible();
    await expect(menu.locator(":focus")).toHaveCount(1);
    await expect(page.locator("#root")).toHaveAttribute("inert", "");
    await expect(page.locator("[data-fullscreen-header]")).toHaveAttribute("inert", "");
    const focusable = menu.locator(
      'a[href]:visible, button:not([disabled]):visible, [tabindex]:not([tabindex="-1"]):visible',
    );
    const first = focusable.first();
    const last = focusable.last();
    await last.focus();
    await page.keyboard.press("Tab");
    await expect(first).toBeFocused();
    await first.focus();
    await page.keyboard.press("Shift+Tab");
    await expect(last).toBeFocused();
    for (let index = 0; index < 55; index += 1) await page.keyboard.press("Tab");
    await expect(menu.locator(":focus")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("closes before internal navigation and releases scroll lock", async ({ page }) => {
    await gotoAndSettle(page, MENU_HOST_ROUTE);
    await page.locator("[data-menu-trigger]").click();
    // Revision 4: company pages are the flat 04 Kurumsal family.
    await page.locator("[data-fullscreen-menu] button[aria-pressed]:not([lang])").nth(3).click();
    await page.locator("[data-fullscreen-menu]").getByRole("link", { name: "Hakkımızda" }).click();
    await expect(page).toHaveURL(/\/hakkimizda$/);
    await expect(page.locator("[data-fullscreen-menu]")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
  });

  test("preserves a pre-existing stopped Lenis state after closing", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1280", "one canonical Lenis ownership lane");
    await gotoAndSettle(page, MENU_HOST_ROUTE);
    await expect.poll(() => page.evaluate(() => Boolean((window as Window & {
      __lenis?: { isStopped: boolean };
    }).__lenis)), { timeout: 15_000 }).toBe(true);
    await page.evaluate(() => {
      (window as Window & { __lenis?: { stop: () => void } }).__lenis?.stop();
    });

    await page.locator("[data-menu-trigger]").click();
    const menu = page.locator("[data-fullscreen-menu]");
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => (window as Window & {
      __lenis?: { isStopped: boolean };
    }).__lenis?.isStopped)).toBe(true);
  });

  /**
   * This test used to stop at "opens". That one word was the whole gap: the
   * file held an open-AND-close test (full motion) and an open-ONLY test
   * (reduced motion), so the reduced-motion CLOSE path — where the menu was in
   * fact a permanent modal trap, WCAG 2.1 SC 2.1.2 — was never exercised by
   * any spec in the suite. Opening is half a contract; a menu you cannot leave
   * is worse than no menu.
   *
   * The exhaustive matrix (three close mechanisms x two shells x every project
   * viewport) lives in `e2e/landing/navigation-teardown.spec.ts`. This keeps
   * the two halves joined here, where they were split.
   */
  test("reduced motion opens without a delayed hidden state, and still closes", async ({ page }) => {
    test.skip(!isReducedMotionAuditViewport(page), "V2/V8 reduced-motion audit lanes only");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoAndSettle(page, MENU_HOST_ROUTE);
    const trigger = page.locator("[data-menu-trigger]");
    await trigger.click();
    await expect(page.locator("[data-menu-group]")).toBeVisible();
    await expect(page.locator("html")).toHaveCSS("overflow", "hidden");

    await page.keyboard.press("Escape");
    await expect(page.locator("[data-fullscreen-menu]")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
    await expect(page.locator("#root")).not.toHaveAttribute("inert", "");
    await expect(page.locator("#root")).not.toHaveAttribute("aria-hidden", "true");
    await expect(trigger).toBeFocused();
  });

  test("preserves 3 category families, 15 categories and 48 unique detail routes", async () => {
    const families = navigationItems.filter((item) => item.children?.length);
    const categories = families.flatMap((item) => item.children ?? []);
    const details = categories.flatMap((category) => category.links);
    expect(families).toHaveLength(3);
    expect(categories).toHaveLength(15);
    expect(new Set(details.map((link) => link.path)).size).toBe(48);
    expect(new Set(details.map((link) => `${link.label}|${link.path}`)).size).toBe(48);
  });

  test("keyboard-only reaches all 48 detail links without hover or programmatic focus", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-320", "one canonical compact traversal lane");
    test.setTimeout(120_000);
    await gotoAndSettle(page, MENU_HOST_ROUTE);
    const trigger = page.locator("[data-menu-trigger]");
    for (let tabIndex = 0; tabIndex < 10 && !await trigger.evaluate((element) =>
      element === document.activeElement); tabIndex += 1) {
      await page.keyboard.press("Tab");
    }
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Enter");

    const menu = page.locator("[data-fullscreen-menu]");
    const families = menu.locator("button[aria-pressed]:not([lang])");
    await expect(menu.getByRole("button", { name: "Menüyü kapat" })).toBeFocused();
    for (let tabIndex = 0; tabIndex < 10 && !await families
      .evaluateAll((elements) => elements.some((element) => element === document.activeElement)); tabIndex += 1) {
      await page.keyboard.press("Tab");
    }

    const familyData = navigationItems.filter((item) => item.children?.length);
    const visitedFamilies = new Set<string>();
    const visitedCategories = new Set<string>();
    const visitedCategoryRoutes = new Set<string>();
    const visitedDetailRoutes = new Set<string>();

    for (let familyIndex = 0; familyIndex < familyData.length; familyIndex += 1) {
      const family = familyData[familyIndex];
      const familyControl = families.nth(familyIndex);
      await expect(familyControl).toBeFocused();
      await expect(familyControl).toHaveAttribute("aria-pressed", "true");
      visitedFamilies.add(family.label);

      const group = menu.locator("[data-menu-group]");
      await expect(group).toHaveAttribute("data-menu-group", family.label);
      const categories = group.locator("[data-nav-category]");
      await expect(categories).toHaveCount(family.children!.length);
      await page.keyboard.press("Tab");

      for (let categoryIndex = 0; categoryIndex < family.children!.length; categoryIndex += 1) {
        const category = family.children![categoryIndex];
        const categoryToggle = categories.nth(categoryIndex);
        await expect(categoryToggle).toBeFocused();
        visitedCategories.add(`${family.label}|${category.label}`);
        await page.keyboard.press(categoryIndex % 2 === 0 ? "Enter" : "Space");
        await expect(categoryToggle).toHaveAttribute("aria-expanded", "true");
        const panelId = await categoryToggle.getAttribute("aria-controls");
        expect(panelId).toBeTruthy();
        const panel = group.locator(`#${panelId}`);
        const categoryLanding = panel.locator("[data-nav-category-landing]");
        const details = panel.locator("[data-nav-detail-list] a[href]");
        await expect(details).toHaveCount(category.links.length);

        await page.keyboard.press("Tab");
        await expect(categoryLanding).toBeFocused();
        visitedCategoryRoutes.add((await categoryLanding.getAttribute("href"))!);
        for (let detailIndex = 0; detailIndex < category.links.length; detailIndex += 1) {
          await page.keyboard.press("Tab");
          const detail = details.nth(detailIndex);
          await expect(detail).toBeFocused();
          await expect(detail).toBeVisible();
          visitedDetailRoutes.add((await detail.getAttribute("href"))!);
        }

        if (categoryIndex < family.children!.length - 1) {
          await page.keyboard.press("Tab");
          await expect(categories.nth(categoryIndex + 1)).toBeFocused();
        }
      }

      for (let reverseIndex = 0; reverseIndex < 16 && !await familyControl.evaluate((element) =>
        element === document.activeElement); reverseIndex += 1) {
        await page.keyboard.press("Shift+Tab");
      }
      await expect(familyControl).toBeFocused();
      if (familyIndex < familyData.length - 1) {
        await page.keyboard.press("ArrowRight");
        await expect(families.nth(familyIndex + 1)).toBeFocused();
        await expect(menu.locator("[data-menu-group]")).toHaveAttribute(
          "data-menu-group",
          familyData[familyIndex + 1].label,
        );
      }
    }

    expect(visitedFamilies.size).toBe(3);
    expect(visitedCategories.size).toBe(15);
    expect(visitedCategoryRoutes.size).toBe(15);
    expect(visitedDetailRoutes.size).toBe(48);
    expect(new URL(page.url()).pathname).toBe(MENU_HOST_ROUTE);
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("supports roving keys and valid single-open accordion IDREFs", async ({ page }) => {
    await gotoAndSettle(page, MENU_HOST_ROUTE);
    await page.locator("[data-menu-trigger]").click();
    const menu = page.locator("[data-fullscreen-menu]");
    const families = menu.locator("button[aria-pressed]:not([lang])");
    await families.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(families.nth(1)).toBeFocused();
    await expect(families.nth(1)).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("ArrowLeft");
    await expect(families.first()).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(families.last()).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(families.first()).toBeFocused();
    await page.keyboard.press("End");
    await expect(families.last()).toBeFocused();
    await expect(families.last()).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Home");
    await expect(families.first()).toBeFocused();
    const categories = menu.locator("[data-nav-category]");
    await categories.nth(2).click();
    expect((await categories.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("aria-expanded")))).filter((value) => value === "true")).toHaveLength(1);
    for (const category of await categories.all()) {
      const id = await category.getAttribute("aria-controls");
      await expect(menu.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test("has no axe violations inside the open dialog", async ({ page }) => {
    test.setTimeout(120_000);
    await gotoAndSettle(page, MENU_HOST_ROUTE);
    await page.locator("[data-menu-trigger]").click();
    /* QA01: axe used to run while the sheet was still wiping in, and measured
       mid-transition colours (3.67:1 on the family index, settling at 5.8:1).
       Measure the settled dialog. */
    await expect.poll(() => page.locator("[data-fullscreen-menu]").evaluate((menu) =>
      menu.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length
      + [...menu.querySelectorAll("*")].filter((node) => getComputedStyle(node).opacity !== "1" && node.getBoundingClientRect().width > 0).length * 0), { timeout: 10_000 }).toBe(0);
    await page.waitForTimeout(700);
    const results = await new AxeBuilder({ page }).include("[data-fullscreen-menu]").analyze();
    expect(results.violations).toEqual([]);
  });

  test("publishes the identical menu on an inner page shell", async ({ page }, testInfo) => {
    test.skip(!["desktop-1280", "mobile-320"].includes(testInfo.project.name), "one wide and one narrow inner-page lane");
    // The point of Phase 03 is that `/` and an inner page get the SAME
    // navigation, not two that merely look alike. This measures the structure
    // on both and compares — a divergence in families, categories, detail
    // routes or the conversion set fails here rather than in a screenshot.
    const read = async (route: string) => {
      await gotoAndSettle(page, route);
      await page.locator("[data-menu-trigger]").click();
      const menu = page.locator("[data-fullscreen-menu]");
      await expect(menu).toBeVisible();
      const shape = await menu.evaluate((element) => ({
        families: [...element.querySelectorAll("button[aria-pressed]:not([lang])")].map((node) => node.getAttribute("aria-label")),
        categories: [...element.querySelectorAll("[data-nav-category]")].map((node) => node.getAttribute("data-nav-category")),
        directory: [...element.querySelectorAll("nav[aria-labelledby] a[href]")].map((node) => node.getAttribute("href")),
        cta: element.querySelector(".tl-menu-cta")?.getAttribute("href") ?? null,
      }));
      await page.keyboard.press("Escape");
      await expect(menu).toHaveCount(0);
      return shape;
    };
    const landing = await read(MENU_HOST_ROUTE);
    const inner = await read(INNER_HOST_ROUTE);
    expect(landing.families).toHaveLength(4);
    expect(landing.categories).toHaveLength(5);
    expect(landing.cta).toBe("/teklif-al");
    expect(inner).toEqual(landing);
  });

  test("has no serious or critical axe violations with the menu open on an inner page", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1280", "one canonical inner-page dialog axe lane");
    test.setTimeout(120_000);
    await gotoAndSettle(page, INNER_HOST_ROUTE);
    await page.locator("[data-menu-trigger]").click();
    await expect(page.locator("[data-fullscreen-menu]")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    // Whole page, not just the dialog: with the overlay open the rest of the
    // document is `inert` + `aria-hidden`, so this also proves the isolation is
    // real rather than visual.
    expect(results.violations.filter((violation) =>
      violation.impact === "serious" || violation.impact === "critical")).toEqual([]);
  });

  test("remains deterministic through repeated toggle input", async ({ page }) => {
    await gotoAndSettle(page, MENU_HOST_ROUTE);
    const trigger = page.locator("[data-menu-trigger]");
    await trigger.click();
    const menu = page.locator("[data-fullscreen-menu]");
    await expect(menu).toBeVisible();
    await menu.getByRole("button", { name: "Menüyü kapat" }).click();
    await expect(page.locator("[data-fullscreen-menu]")).toHaveCount(0);
    await trigger.click();
    await expect(page.locator("[data-fullscreen-menu]")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-fullscreen-menu]")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
  });
});
