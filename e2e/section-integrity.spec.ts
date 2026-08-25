import { expect, test } from "@playwright/test";
import {
  gotoAndSettle,
  hydrateLanding,
  LANDING_SCENE_IDS,
  usesNaturalLandingFlow,
} from "./helpers";

const currentPhysicalSectionSelector = "main#main-content > .lf-root > section";

test.describe("Landing page section integrity", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndSettle(page, "/");
    await hydrateLanding(page);
  });

  test("current physical sections stay in flow without horizontal overflow", async ({ page }) => {
    const physicalSections = page.locator(currentPhysicalSectionSelector);

    const layout = await physicalSections.evaluateAll((sections) => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      sections: sections.map((section) => {
        const rect = section.getBoundingClientRect();
        return {
          tag: section.tagName,
          position: getComputedStyle(section).position,
          width: rect.width,
          height: rect.height,
        };
      }),
    }));

    expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
    expect(layout.sections.length).toBeGreaterThan(0);
    expect(layout.sections.every(({ tag }) => tag === "SECTION")).toBe(true);
    expect(layout.sections.every(({ position }) => position !== "fixed")).toBe(true);
    expect(layout.sections.every(({ width, height }) => width > 0 && height > 0)).toBe(true);
  });

  test("preserves exactly nine public anchors in immutable order", async ({ page }) => {
    const anchors = await page.evaluate((ids) => ids.map((id) => {
      const matches = document.querySelectorAll(`#${CSS.escape(id)}`);
      const element = matches.item(0) as HTMLElement | null;
      const rect = element?.getBoundingClientRect();
      return {
        id,
        count: matches.length,
        top: element ? rect!.top + window.scrollY : null,
      };
    }), LANDING_SCENE_IDS);

    expect(anchors.map(({ count }) => count)).toEqual(LANDING_SCENE_IDS.map(() => 1));
    const actualDomOrder = await page.evaluate((ids) => {
      const accepted = new Set(ids);
      const root = document.querySelector("main#main-content > .lf-root");
      return root
        ? [...root.querySelectorAll<HTMLElement>("[id]")]
          .map((element) => element.id)
          .filter((id) => accepted.has(id as typeof ids[number]))
        : [];
    }, LANDING_SCENE_IDS);
    expect(actualDomOrder).toEqual([...LANDING_SCENE_IDS]);
    const tops = anchors.map(({ top }) => top as number);
    for (let index = 1; index < tops.length; index += 1) {
      expect(tops[index]).toBeGreaterThan(tops[index - 1]);
    }
  });

  test("industry selection never leaves an inaccessible active destination", async ({ page }) => {
    const section = page.locator("#endustriler");
    const allControls = section.locator('button[aria-label$="kartını göster"]');
    const cards = section.locator("a.lf-industry-card");
    await expect(allControls).toHaveCount(5);
    await expect(cards).toHaveCount(5);
    await section.scrollIntoViewIfNeeded();

    if (await usesNaturalLandingFlow(page)) {
      await expect(allControls.first()).toBeHidden();
      await expect(section.locator('a.lf-industry-card[aria-hidden="true"]')).toHaveCount(0);
      for (let index = 0; index < 5; index += 1) {
        await expect(cards.nth(index)).toBeVisible();
        await expect(cards.nth(index)).not.toHaveAttribute("tabindex", "-1");
      }
      return;
    }

    const controls = section.getByRole("button", { name: /kartını göster/i });
    await expect(controls).toHaveCount(5);
    await controls.nth(2).click();
    await expect(controls.nth(2)).toHaveAttribute("aria-current", "step");
    await expect(cards.nth(2)).not.toHaveAttribute("aria-hidden", "true");
    await expect(cards.nth(2)).not.toHaveAttribute("tabindex", "-1");
    await expect(section.locator('a.lf-industry-card[aria-hidden="true"][tabindex="-1"]')).toHaveCount(4);
  });

  test("internal hash links always resolve to a unique real target", async ({ page }) => {
    const links = page.locator('a[href^="#"]:not([href="#"])');
    expect(await links.count()).toBeGreaterThan(0);

    const brokenHashes = await links.evaluateAll((nodes) => nodes
      .map((node) => node.getAttribute("href"))
      .filter((href): href is string => Boolean(href))
      .map((href) => ({ href, count: document.querySelectorAll(`#${CSS.escape(href.slice(1))}`).length }))
      .filter(({ count }) => count !== 1));

    expect(brokenHashes).toEqual([]);
  });
});
