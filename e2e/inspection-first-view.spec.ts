import { expect, test } from "@playwright/test";
import { gotoAndSettle } from "./helpers";

test("actual initial hero viewport keeps the complete title below the fixed header", async ({ page, context }, info) => {
  await context.route("**/*", route => ["localhost", "127.0.0.1", "[::1]"].includes(new URL(route.request().url()).hostname)
    ? route.continue() : route.abort("blockedbyclient"));
  await gotoAndSettle(page, "/");
  const geometry = await page.evaluate(() => {
    const title = document.querySelector("main h1")!.getBoundingClientRect();
    const header = document.querySelector("#main-header")!.getBoundingClientRect();
    return { scrollY, titleTop: title.top, headerBottom: header.bottom, titleRight: title.right, width: innerWidth };
  });
  expect(geometry.scrollY, "capture is the genuine initial viewport, not a scrolled band").toBe(0);
  expect(geometry.titleTop).toBeGreaterThanOrEqual(geometry.headerBottom - 1);
  expect(geometry.titleRight).toBeLessThanOrEqual(geometry.width + 1);
  await expect(page.locator("main h1")).toBeVisible();
  const clippedLabels = await page.locator(".tl-part-window").evaluate(window => {
    const bounds = window.getBoundingClientRect();
    return [...window.querySelectorAll(".tl-part-label")].filter(label => {
      const rect = label.getBoundingClientRect();
      return rect.top < bounds.top - 1 || rect.bottom > bounds.bottom + 1 || rect.left < bounds.left - 1 || rect.right > bounds.right + 1;
    }).map(label => label.textContent);
  });
  expect(clippedLabels, "printed measurements remain inside their registered photo aperture").toEqual([]);
  await info.attach("actual-first-viewport", { body: await page.screenshot(), contentType: "image/png" });
  await info.attach("initial-header-title-geometry", { body: JSON.stringify(geometry), contentType: "application/json" });
});

test("printed labels stay inside their aperture through fine-pointer forward and reverse drift", async ({ page, context }) => {
  test.skip(!await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches), "fine-pointer drift only");
  await context.route("**/*", route => ["localhost", "127.0.0.1", "[::1]"].includes(new URL(route.request().url()).hostname)
    ? route.continue() : route.abort("blockedbyclient"));
  for (const width of [769, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await gotoAndSettle(page, "/");
    for (const fraction of [.8, .15, .8]) {
      await page.evaluate(fraction => {
        const anchor = document.querySelector(".tl-part-stage")!.getBoundingClientRect();
        const y = scrollY + anchor.top - innerHeight * fraction;
        const lenis = (window as Window & { __lenis?: { scrollTo: (y: number, options: object) => void } }).__lenis;
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
      }, fraction);
      await page.waitForTimeout(250);
      const labels = await page.locator(".tl-part-window").evaluate(window => {
        const bounds = window.getBoundingClientRect();
        return [...window.querySelectorAll(".tl-part-label")].filter(label => {
          const r = label.getBoundingClientRect();
          return r.top < bounds.top - 1 || r.bottom > bounds.bottom + 1 || r.left < bounds.left - 1 || r.right > bounds.right + 1;
        }).map(label => label.textContent);
      });
      expect(labels, `all printed labels inside at width ${width}, anchor fraction ${fraction}`).toEqual([]);
    }
  }
});
