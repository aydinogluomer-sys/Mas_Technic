import { expect, test } from "@playwright/test";
import { gotoAndSettle } from "../helpers";

/* Round 2, item 8 — long text on inner pages waits dimmed below the fold and
   reaches full strength as it is scrolled into the reading zone. The global
   config turns the reveal off for audits; this spec turns it back on. */
test.describe("prose reveal on inner pages", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("below-the-fold prose is dim, then full once reached; nothing on screen starts dim", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await gotoAndSettle(page, "/hakkimizda");
    await expect(page.locator("html")).toHaveAttribute("data-prose-reveal", "on");

    // Above the fold: the hero lede is readable immediately.
    await expect.poll(() => page.locator(".shell-hero .shell-lede").evaluate((el) => getComputedStyle(el).opacity)).toBe("1");

    const far = page.locator(".shell-title-block > p").last();
    await expect.poll(() => far.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeLessThan(0.5);

    await far.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 200);
    await expect(far).toHaveAttribute("data-read", "");
    await expect.poll(() => far.evaluate((el) => getComputedStyle(el).opacity), { timeout: 5000 }).toBe("1");
  });

  test("reduced motion never dims", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoAndSettle(page, "/hakkimizda");
    const far = page.locator(".shell-title-block > p").last();
    await expect.poll(() => far.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });

  test("technical image plates reveal as the reader reaches them", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 240 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await gotoAndSettle(page, "/hizmetler/cnc-frezeleme");
    const plate = page.locator("figure.shell-plate").first();
    await expect(plate).toBeAttached();
    await expect(page.locator("html")).toHaveAttribute("data-prose-reveal", "on");
    await expect.poll(() => plate.locator(".shell-plate-frame").evaluate((frame) =>
      getComputedStyle(frame, "::after").transform,
    )).toBe("matrix(1, 0, 0, 1, 0, 0)");

    await plate.scrollIntoViewIfNeeded();
    await expect(plate).toHaveAttribute("data-read", "");
    await expect.poll(() => plate.locator(".shell-plate-frame").evaluate((frame) =>
      getComputedStyle(frame, "::after").transform,
    )).toBe("matrix(0, 0, 0, 1, 0, 0)");
  });

  test("image plates stay fully visible under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoAndSettle(page, "/hizmetler/cnc-frezeleme");
    const frame = page.locator("figure.shell-plate .shell-plate-frame").first();
    await expect(frame).toBeAttached();
    await expect.poll(() => frame.evaluate((element) =>
      getComputedStyle(element, "::after").transform,
    )).toBe("matrix(0, 0, 0, 1, 0, 0)");
  });

  test("the landing is untouched", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await expect(page.locator("html")).not.toHaveAttribute("data-prose-reveal", "on");
  });
});
