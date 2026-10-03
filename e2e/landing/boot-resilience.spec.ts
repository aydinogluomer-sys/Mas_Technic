import { expect, test, type Page, type Route } from "@playwright/test";

/**
 * B1 — THE PAGE NEVER STAYS ON "YÜKLENİYOR".
 *
 * A reader's session once stopped on the route loader and could not be
 * reproduced. These cases drive every way the boot can stall or fail that the
 * code can meet — slow or failed route chunks, a stale-deploy 404, a stalled
 * landing chunk, a failed dictionary, a failed hero image, blocked fonts, an
 * unreachable Supabase, going offline mid-navigation — and assert the reader
 * always ends on content or on a recovery state with a working reload, never
 * on an endless loader and never in a reload loop.
 *
 * Production build only (`vite preview`): chunk names are hashed there.
 */

const LOADER = '[data-shell-state="loading"]';
const ERROR = '[data-shell-state="error"]';
const STALL_MS = 12_000;

const chunk = (name: string) => new RegExp(`/assets/${name}-[\\w-]+\\.js(\\?.*)?$`);

/** Full document loads only — `framenavigated` also fires on pushState. */
async function countDocumentLoads(page: Page) {
  let count = 0;
  page.on("load", () => {
    count += 1;
  });
  return () => count;
}

test.describe("boot resilience", () => {
  test("a healthy load reaches content without a stall report", async ({ page }) => {
    const reports: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && message.text().startsWith("[boot]")) reports.push(message.text());
    });
    await page.goto("/sss");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator(LOADER)).toHaveCount(0);
    expect(reports).toEqual([]);
    const trace = await page.evaluate(() => (window as unknown as { __masBoot?: { marks: { phase: string }[] } }).__masBoot);
    expect(trace?.marks.map((mark) => mark.phase)).toEqual(expect.arrayContaining(["boot:start", "chunk:start", "chunk:ready"]));
  });

  test("a slow route chunk shows the loader, then the page", async ({ page }) => {
    await page.route(chunk("SSS"), async (route: Route) => {
      await new Promise((resolve) => setTimeout(resolve, 2_500));
      await route.continue();
    });
    await page.goto("/sss");
    await expect(page.locator(LOADER)).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(LOADER)).toHaveCount(0);
    await expect(page.locator(ERROR)).toHaveCount(0);
  });

  test("a missing route chunk (stale deploy) reloads once, then offers a real reload — no loop", async ({ page }) => {
    const loads = await countDocumentLoads(page);
    await page.route(chunk("SSS"), (route) => route.fulfill({ status: 404, body: "gone" }));
    await page.goto("/sss");
    const error = page.locator(ERROR);
    await expect(error).toBeVisible({ timeout: 15_000 });
    await expect(error).toContainText("ERR::CHUNK_LOAD_FAILED");
    // The first failure reloaded the page once; the second did not reload again.
    await page.waitForTimeout(1_500);
    expect(loads()).toBe(2);
    // The deploy is healthy again: the reload button fetches the page for real.
    await page.unroute(chunk("SSS"));
    await error.getByRole("button", { name: /Yeniden dene/ }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(ERROR)).toHaveCount(0);
  });

  test("a landing chunk that never arrives ends on a recovery state, not a blank page", async ({ page }) => {
    test.setTimeout(45_000);
    await page.route(chunk("Index"), () => undefined); // never answered
    await page.goto("/");
    await expect(page.locator(ERROR)).toBeVisible({ timeout: STALL_MS + 8_000 });
    await expect(page.locator(ERROR)).toContainText("ERR::ROUTE_LOAD_TIMEOUT");
    await expect(page.getByRole("button", { name: /Yeniden dene/ })).toBeVisible();
  });

  test("going offline mid-navigation says so and does not reload by itself", async ({ page, context }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
    const loads = await countDocumentLoads(page);
    await context.setOffline(true);
    await page.evaluate(() => {
      window.history.pushState({}, "", "/hakkimizda");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    const error = page.locator(ERROR);
    await expect(error).toBeVisible({ timeout: 15_000 });
    await expect(error).toContainText("ERR::CHUNK_LOAD_FAILED");
    expect(loads()).toBe(0);
    await context.setOffline(false);
    await error.getByRole("button", { name: /Yeniden dene/ }).click();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
  });

  test("a failed English dictionary still renders the page", async ({ page }) => {
    await page.route(chunk("en"), (route) => route.abort());
    await page.goto("/en/sss");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(LOADER)).toHaveCount(0);
  });

  test("a failed hero image, blocked fonts and an unreachable Supabase do not hold the landing", async ({ page }) => {
    await page.route(/hero-manifold[^/]*\.webp/, (route) => route.abort());
    await page.route(/fonts\.(googleapis|gstatic)\.com|\/fonts\//, (route) => route.abort());
    await page.route(/supabase\.co/, (route) => route.abort());
    await page.goto("/");
    await expect(page.getByTestId("technical-hero-title")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("technical-hero-cta")).toBeVisible();
    await expect(page.locator(ERROR)).toHaveCount(0);
  });
});
