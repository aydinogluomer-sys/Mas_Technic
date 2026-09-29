import { expect, test } from "@playwright/test";
import { gotoAndSettle } from "../helpers";

/* Polish run, item 1: the replacement cursor vanished over the fixed header
   and the fullscreen menu, because its layers (z 101, inside #root) painted
   below both while the native cursor stayed hidden. The layers now live in
   <body> at Z.cursor and arm on the first pointermove. */
test.describe("cursor stays visible over header and menu", () => {
  test.skip(({ isMobile }) => isMobile, "fine-pointer desktops only");

  test("the cursor is above the header and the open menu", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndSettle(page, "/hakkimizda");

    const dot = page.locator('[data-custom-cursor="dot"]');
    await expect(dot).toHaveCount(1);
    await expect(dot).toHaveAttribute("data-armed", "false");
    expect(await dot.evaluate((node) => node.parentElement === document.body)).toBe(true);

    await page.mouse.move(640, 36);
    await expect(dot).toHaveAttribute("data-armed", "true");
    await expect.poll(() => dot.evaluate((node) => getComputedStyle(node).opacity)).toBe("1");

    const layers = await page.evaluate(() => {
      const z = (el: Element | null) => (el ? Number(getComputedStyle(el).zIndex) || 0 : 0);
      return {
        cursor: z(document.querySelector('[data-custom-cursor="dot"]')),
        header: z(document.querySelector(".tl-header-band")),
      };
    });
    expect(layers.cursor).toBeGreaterThan(layers.header);

    await page.locator("[data-menu-trigger]").click();
    const menu = page.locator("[data-fullscreen-menu]");
    await expect(menu).toBeVisible();
    await page.mouse.move(400, 400);
    const overMenu = await page.evaluate(() => {
      const dotEl = document.querySelector('[data-custom-cursor="dot"]')!;
      const menuEl = document.querySelector("[data-fullscreen-menu]")!;
      return {
        cursor: Number(getComputedStyle(dotEl).zIndex),
        menu: Number(getComputedStyle(menuEl).zIndex),
        armed: (dotEl as HTMLElement).dataset.armed,
        opacity: getComputedStyle(dotEl).opacity,
      };
    });
    expect(overMenu.cursor).toBeGreaterThan(overMenu.menu);
    expect(overMenu.armed).toBe("true");
    expect(overMenu.opacity).toBe("1");
  });
});
