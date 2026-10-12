import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.route("**/*", route => ["localhost", "127.0.0.1", "[::1]"].includes(new URL(route.request().url()).hostname)
    ? route.continue() : route.abort("blockedbyclient"));
});

test("landing bootstrap adopts once and all four dimension controls work", async ({ page }) => {
  for (const path of ["/", "/en"]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("data-app-ready", "", { timeout: 15000 });
    await expect(page.locator("head > script[data-inspection-entry]")).toHaveCount(1);
    await expect(page.locator("head > script[src*='/assets/index-']")).toHaveCount(1);
    await expect(page.locator("#inspection-startup")).toHaveCount(0);
    for (const button of await page.locator(".tl-part-controls button").all()) {
      await button.click(); await expect(button).toHaveAttribute("aria-pressed", "true");
      await button.click(); await expect(button).toHaveAttribute("aria-pressed", "false");
    }
  }
});

test("a stalled decode cannot prevent bounded startup", async ({ page }) => {
  await page.addInitScript(() => { HTMLImageElement.prototype.decode = () => new Promise(() => undefined); });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "", { timeout: 10000 });
  await expect(page.locator("#inspection-startup")).toHaveCount(0);
  await expect(page.getByTestId("technical-hero-cta")).toHaveAttribute("href", "/teklif-al");
});

test("failed hero media still allows client startup and native RFQ navigation", async ({ page }) => {
  await page.route("**/*hero-manifold*", route => route.abort("failed"));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "", { timeout: 10000 });
  await expect(page.locator("main h1")).toBeVisible();
  await page.getByTestId("technical-hero-cta").click();
  await expect(page).toHaveURL(/\/teklif-al$/);
  await expect(page.locator("main h1")).toBeVisible();
});

test("inner and authentication pages retain direct entry startup", async ({ page }) => {
  for (const path of ["/teklif-al", "/hakkimizda", "/nexus-login"]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("data-app-ready", "", { timeout: 15000 });
    await expect(page.locator("script[data-inspection-entry], #inspection-startup")).toHaveCount(0);
    await expect(page.locator("main h1")).toBeVisible();
  }
});
