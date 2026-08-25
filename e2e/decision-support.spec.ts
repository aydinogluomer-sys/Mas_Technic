import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  gotoAndSettle,
  hydrateLanding,
  isReducedMotionAuditViewport,
  usesNaturalLandingFlow,
} from "./helpers";

test.describe("CNC decision support matrix", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndSettle(page, "/");
    await hydrateLanding(page);
    await page.locator("#sss").scrollIntoViewIfNeeded();
    await expect(page.locator(".lf-decision-card")).toHaveCount(4);
  });

  test("keeps one accessible answer active through rapid selection", async ({ page }) => {
    const cards = page.locator(".lf-decision-card");
    await expect(cards.nth(0).locator("button")).toHaveAttribute("aria-expanded", "true");
    await expect(cards.locator('[aria-expanded="true"]')).toHaveCount(1);

    await cards.nth(3).locator("button").click();
    await cards.nth(1).locator("button").click();

    await expect(cards.nth(1).locator("button")).toHaveAttribute("aria-expanded", "true");
    await expect(cards.locator('[aria-expanded="true"]')).toHaveCount(1);
    await expect(cards.nth(1).getByRole("region")).toBeVisible();
    const inactiveRegion = cards.nth(0).locator('[role="region"]');
    await expect(inactiveRegion).toHaveCount(1);
    await expect(inactiveRegion).toBeHidden();
  });

  test("focus and keyboard input preserve one active answer and technical routes", async ({ page }) => {
    const thirdButton = page.locator(".lf-decision-card").nth(2).locator("button");
    await thirdButton.focus();
    await expect(thirdButton).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Enter");
    await expect(thirdButton).toHaveAttribute("aria-expanded", "true");

    const fourthButton = page.locator(".lf-decision-card").nth(3).locator("button");
    await fourthButton.focus();
    await expect(fourthButton).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Space");
    await expect(fourthButton).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator('.lf-decision-card [aria-expanded="true"]')).toHaveCount(1);

    const controlledButtons = page.locator(".lf-decision-card button[aria-controls]");
    await expect(controlledButtons).toHaveCount(4);
    for (const button of await controlledButtons.all()) {
      const controls = await button.getAttribute("aria-controls");
      const labelledBy = await button.getAttribute("id");
      expect(controls).toBeTruthy();
      expect(labelledBy).toBeTruthy();
      await expect(page.locator(`#${controls}`)).toHaveAttribute("aria-labelledby", labelledBy!);
    }

    const routes = await page.locator(".lf-decision-dossier .lf-editorial-list > a:not(.lf-inline-link)")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(routes).toEqual([
      "/blog/5-eksen-cnc-isleme-avantajlari",
      "/blog/havacilik-parcalarinda-malzeme-secimi",
      "/blog/dfm-tasarimdan-uretime-gecis",
    ]);
  });

  test("has no serious or critical accessibility violations in every answer state", async ({ page }, testInfo) => {
    test.skip(!["mobile-375", "desktop-1280"].includes(testInfo.project.name), "canonical touch and desktop axe lanes");
    test.setTimeout(120_000);
    const buttons = page.locator(".lf-decision-card button[aria-controls]");
    for (let index = 0; index < 4; index += 1) {
      await buttons.nth(index).click();
      await expect(buttons.nth(index)).toHaveAttribute("aria-expanded", "true");
      const results = await new AxeBuilder({ page }).include("#sss").analyze();
      expect(
        results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? "")),
        `decision-support state ${index + 1} must be free of serious/critical violations`,
      ).toEqual([]);
    }
  });

  test("uses natural accordion mode on compact layouts", async ({ page }) => {
    test.skip(!(await usesNaturalLandingFlow(page)), "natural-flow profile only");
    await expect(page.locator(".lf-decision-pixels")).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test("reduced motion renders no pixel grid", async ({ page }) => {
  test.skip(!isReducedMotionAuditViewport(page), "V2/V8 reduced-motion audit lanes only");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoAndSettle(page, "/");
  await hydrateLanding(page);
  await page.locator("#sss").scrollIntoViewIfNeeded();
  await expect(page.locator(".lf-decision-pixels")).toHaveCount(0);
  await expect(page.locator('.lf-decision-card [aria-expanded="true"]')).toHaveCount(1);
});
