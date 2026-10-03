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
 * Production build only (`npm run preview`): chunk names are hashed there.
 *
 * TWO ENTRY PATHS, since C2 prerendered every public route:
 *   · a DIRECT load gets the route's HTML first — content is on screen
 *     before any script, so there is no loader at all; the cases assert the
 *     content stays readable whatever the scripts do;
 *   · a CLIENT navigation is the SPA path — the route chunk loads on demand,
 *     and the loader, timeout and recovery cases live there.
 */

const LOADER = '[data-shell-state="loading"]';
const ERROR = '[data-shell-state="error"]';
const STALL_MS = 12_000;

const chunk = (name: string) => new RegExp(`/assets/${name}-[\\w-]+\\.js(\\?.*)?$`);

/** The app owns the document (it adopted the prerendered HTML). */
async function appReady(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "", { timeout: 15_000 });
}

/** A client-side navigation, the way a link click reaches react-router. */
async function clientNavigate(page: Page, path: string) {
  await page.evaluate((target) => {
    window.history.pushState({}, "", target);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, path);
}

/** Full document requests — `framenavigated` also fires on pushState, and
    `load` misses a reload that starts before the first load event. */
async function countDocumentLoads(page: Page) {
  let count = 0;
  page.on("request", (request) => {
    if (request.resourceType() === "document" && request.frame() === page.mainFrame()) count += 1;
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
    expect(trace?.marks.map((mark) => mark.phase)).toEqual(
      expect.arrayContaining(["boot:start", "prerender:adopt", "chunk:start", "chunk:ready", "prerender:render"]),
    );
  });

  test("a slow route chunk on a direct load keeps the prerendered page on screen — no loader", async ({ page }) => {
    await page.route(chunk("SSS"), async (route: Route) => {
      await new Promise((resolve) => setTimeout(resolve, 2_500));
      await route.continue();
    });
    await page.goto("/sss");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 2_000 });
    await expect(page.locator(LOADER)).toHaveCount(0);
    await page.waitForTimeout(3_000);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator(LOADER)).toHaveCount(0);
    await expect(page.locator(ERROR)).toHaveCount(0);
  });

  test("a slow route chunk on a client navigation shows the loader, then the page", async ({ page }) => {
    await page.goto("/");
    await appReady(page);
    await page.route(chunk("SSS"), async (route: Route) => {
      await new Promise((resolve) => setTimeout(resolve, 2_500));
      await route.continue();
    });
    await clientNavigate(page, "/sss");
    await expect(page.locator(LOADER)).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(LOADER)).toHaveCount(0);
    await expect(page.locator(ERROR)).toHaveCount(0);
  });

  test("a missing route chunk on a direct load reloads once, then keeps the readable page — no loop", async ({ page }) => {
    const loads = await countDocumentLoads(page);
    await page.route(chunk("SSS"), (route) => route.fulfill({ status: 404, body: "gone" }));
    await page.goto("/sss");
    await page.waitForTimeout(4_000);
    // One reload for a possibly newer HTML, then no more; the static page stays.
    expect(loads()).toBe(2);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator(ERROR)).toHaveCount(0);
    await page.waitForTimeout(2_000);
    expect(loads()).toBe(2);
  });

  test("a missing route chunk on a client navigation reloads once into the readable page", async ({ page }) => {
    await page.goto("/");
    await appReady(page);
    const loads = await countDocumentLoads(page);
    await page.route(chunk("SSS"), (route) => route.fulfill({ status: 404, body: "gone" }));
    await clientNavigate(page, "/sss");
    // One reload for a possibly newer HTML; /sss is prerendered, so even with
    // its code still missing the reader lands on the page, not on an error.
    await expect.poll(loads, { timeout: 15_000 }).toBe(1);
    await expect(page.locator("h1").first()).toBeVisible();
    await page.waitForTimeout(2_000);
    expect(loads()).toBe(1);
    await expect(page.locator(ERROR)).toHaveCount(0);
  });

  test("when a reload already happened, a missing chunk shows a real reload button — no loop", async ({ page }) => {
    await page.goto("/");
    await appReady(page);
    // As if this tab reloaded for a chunk failure seconds ago (lazy-route.ts guard).
    await page.evaluate(() => window.sessionStorage.setItem("mas_chunk_reload", String(Date.now())));
    const loads = await countDocumentLoads(page);
    await page.route(chunk("SSS"), (route) => route.fulfill({ status: 404, body: "gone" }));
    await clientNavigate(page, "/sss");
    const error = page.locator(ERROR);
    await expect(error).toBeVisible({ timeout: 15_000 });
    await expect(error).toContainText("ERR::CHUNK_LOAD_FAILED");
    expect(loads()).toBe(0);
    // The deploy is healthy again: the reload button fetches the page for real.
    await page.unroute(chunk("SSS"));
    await error.getByRole("button", { name: /Yeniden dene/ }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(ERROR)).toHaveCount(0);
  });

  test("a landing chunk that never arrives on a direct load leaves the prerendered page readable", async ({ page }) => {
    test.setTimeout(45_000);
    await page.route(chunk("Index"), () => undefined); // never answered
    await page.goto("/");
    await expect(page.getByTestId("technical-hero-title")).toBeVisible({ timeout: 2_000 });
    await page.waitForTimeout(STALL_MS + 3_000);
    // Still the page, not a blank sheet — and its links are real addresses.
    await expect(page.getByTestId("technical-hero-title")).toBeVisible();
    await expect(page.getByTestId("technical-hero-cta")).toHaveAttribute("href", "/teklif-al");
  });

  test("a landing chunk that never arrives on a client navigation ends on a recovery state", async ({ page }) => {
    test.setTimeout(45_000);
    await page.goto("/sss");
    await appReady(page);
    await page.route(chunk("Index"), () => undefined); // never answered
    await clientNavigate(page, "/");
    await expect(page.locator(ERROR)).toBeVisible({ timeout: STALL_MS + 8_000 });
    await expect(page.locator(ERROR)).toContainText("ERR::ROUTE_LOAD_TIMEOUT");
    await expect(page.getByRole("button", { name: /Yeniden dene/ })).toBeVisible();
  });

  test("going offline mid-navigation says so and does not reload by itself", async ({ page, context }) => {
    await page.goto("/");
    await appReady(page);
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
