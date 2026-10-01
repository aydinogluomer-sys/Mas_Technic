import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { categoryPages } from "../../src/data/categoryPages";
import { materialCategories } from "../../src/data/materialsData";
import { servicePages } from "../../src/data/servicePages";
import {
  EXCLUDED_FROM_PRIMARY_NAV,
  INDEX_ROUTES,
  landingSections,
  navigationTargets,
} from "../../src/components/navigation/ia";
import { gotoAndSettle, landingReady, LANDING_SCENE_IDS } from "../helpers";

/**
 * LINK-REACHABILITY CONTRACT — no orphan public pages.
 *
 * Before Phase 03 the home page reached exactly two routes through its header
 * (`/` and `/teklif-al`) and the real information architecture, ~40
 * destinations, was mounted only on inner pages
 * (`reports/baseline/known-blockers.md` B14).
 *
 * This spec closes that hole from two directions:
 *
 *   1. STATICALLY — every public URL surface in the route inventory must be
 *      either a navigation target, or a child of a declared index page, or an
 *      explicitly excluded route with a recorded reason. A new page that
 *      belongs to none of the three fails here.
 *   2. IN THE BROWSER — the menu rendered on `/` must really publish those
 *      hrefs, and every one of them must resolve without a redirect and
 *      without landing on a not-found shell.
 */

/**
 * The route inventory is read out of `src/App.tsx` by slicing between two
 * string literals. That is deliberate — the router IS the inventory, and a
 * second hand-maintained list would drift — but it has a failure mode worth
 * naming: if either literal is renamed, `indexOf` returns -1, the slice
 * silently yields an empty or nonsense string, `ROUTE_PATTERNS` becomes `[]`,
 * `orphans` stays empty because there is nothing to iterate, and the static
 * half of this spec PASSES VACUOUSLY while asserting nothing about anything.
 * The dev-route markers and the data files behind `CONCRETE` have the same
 * shape of hole.
 *
 * The markers are therefore named here and verified in the first test below
 * BEFORE any orphan comparison runs. An empty extraction is a failure, not a
 * pass.
 */
const PUBLIC_ROUTES_START_MARKER = "const publicRoutes =";
const PUBLIC_ROUTES_END_MARKER = "return isPanel ? panelRoutes : publicRoutes;";
const DEV_ROUTES_START_MARKER = "DEV_ONLY_ROUTES:START";
const DEV_ROUTES_END_MARKER = "DEV_ONLY_ROUTES:END";

const APP_SOURCE = readFileSync(resolve(process.cwd(), "src/App.tsx"), "utf8");
const PUBLIC_ROUTES_SOURCE = APP_SOURCE.slice(
  APP_SOURCE.indexOf(PUBLIC_ROUTES_START_MARKER),
  APP_SOURCE.indexOf(PUBLIC_ROUTES_END_MARKER),
);
const DEV_ROUTES_SOURCE = PUBLIC_ROUTES_SOURCE.slice(
  PUBLIC_ROUTES_SOURCE.indexOf(DEV_ROUTES_START_MARKER),
  PUBLIC_ROUTES_SOURCE.indexOf(DEV_ROUTES_END_MARKER),
);
const ROUTE_PATTERNS = [...PUBLIC_ROUTES_SOURCE.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);
const DEV_ROUTE_PATTERNS = [...DEV_ROUTES_SOURCE.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);

const blogSource = readFileSync(resolve(process.cwd(), "src/data/blogData.ts"), "utf8");
const BLOG_SLUGS = [...blogSource.matchAll(/\bslug\s*:\s*["']([^"']+)["']/g)].map((m) => m[1]);

/** Concrete URLs behind each parametrised pattern. */
const CONCRETE: Record<string, string[]> = {
  "/hizmetler/kategori/:slug": categoryPages.filter((p) => p.prefix === "hizmetler").map((p) => `/hizmetler/kategori/${p.slug}`),
  "/kabiliyetler/kategori/:slug": categoryPages.filter((p) => p.prefix === "kabiliyetler").map((p) => `/kabiliyetler/kategori/${p.slug}`),
  "/endustriyel/kategori/:slug": categoryPages.filter((p) => p.prefix === "endustriyel").map((p) => `/endustriyel/kategori/${p.slug}`),
  "/hizmetler/:slug": servicePages.filter((p) => p.category === "hizmetler").map((p) => `/hizmetler/${p.slug}`),
  "/kabiliyetler/:slug": servicePages.filter((p) => p.category === "kabiliyetler").map((p) => `/kabiliyetler/${p.slug}`),
  "/endustriyel/:slug": servicePages.filter((p) => p.category === "endustriyel").map((p) => `/endustriyel/${p.slug}`),
  "/malzemeler/:slug": materialCategories.map((c) => `/malzemeler/${c.slug}`),
  "/blog/:slug": BLOG_SLUGS.map((slug) => `/blog/${slug}`),
};

const EXCLUDED = new Set(EXCLUDED_FROM_PRIMARY_NAV.map((entry) => entry.path));
const INDEX_COVERED = new Set(INDEX_ROUTES.map((entry) => entry.covers));

test.describe("public navigation reachability", () => {
  /* Nothing below this point means anything if the extraction came back empty,
     so the extraction is the first thing measured. Every one of these guards
     is a way this spec could otherwise report "0 orphans" about 0 routes. */
  test("extracts a real route inventory before it claims anything about it", () => {
    expect(APP_SOURCE.indexOf(PUBLIC_ROUTES_START_MARKER),
      `"${PUBLIC_ROUTES_START_MARKER}" no longer exists in src/App.tsx — this spec is slicing nothing`)
      .toBeGreaterThanOrEqual(0);
    expect(APP_SOURCE.indexOf(PUBLIC_ROUTES_END_MARKER),
      `"${PUBLIC_ROUTES_END_MARKER}" no longer exists in src/App.tsx — this spec is slicing nothing`)
      .toBeGreaterThan(APP_SOURCE.indexOf(PUBLIC_ROUTES_START_MARKER));
    expect(PUBLIC_ROUTES_SOURCE.indexOf(DEV_ROUTES_START_MARKER),
      `"${DEV_ROUTES_START_MARKER}" is not inside the public route block any more`)
      .toBeGreaterThanOrEqual(0);
    expect(PUBLIC_ROUTES_SOURCE.indexOf(DEV_ROUTES_END_MARKER),
      `"${DEV_ROUTES_END_MARKER}" is not inside the public route block any more`)
      .toBeGreaterThan(PUBLIC_ROUTES_SOURCE.indexOf(DEV_ROUTES_START_MARKER));

    expect(ROUTE_PATTERNS.length, "no <Route path> was extracted from src/App.tsx").toBeGreaterThan(0);
    expect(DEV_ROUTE_PATTERNS.length, "no dev-only <Route path> was extracted").toBeGreaterThan(0);
    expect(ROUTE_PATTERNS.length,
      "the dev-only block cannot be the whole public route inventory")
      .toBeGreaterThan(DEV_ROUTE_PATTERNS.length);
    expect(new Set(ROUTE_PATTERNS).size, "duplicate <Route path> in the inventory")
      .toBe(ROUTE_PATTERNS.length);

    // `CONCRETE` expands the parametrised patterns. An empty expansion would
    // check zero URLs for that whole family and still report no orphans.
    expect(BLOG_SLUGS.length, "no blog slug was extracted from src/data/blogData.ts").toBeGreaterThan(0);
    for (const [pattern, urls] of Object.entries(CONCRETE)) {
      expect(ROUTE_PATTERNS, `${pattern} is expanded here but is not a route any more`).toContain(pattern);
      expect(urls.length, `${pattern} expanded to zero concrete URLs`).toBeGreaterThan(0);
    }
    // Every parametrised route must be expanded, excluded, or index-covered —
    // otherwise it is compared as the literal ":slug" string and always "found".
    const unexpanded = ROUTE_PATTERNS.filter((pattern) => pattern.includes(":"))
      .filter((pattern) => !CONCRETE[pattern] && !EXCLUDED.has(pattern) && !INDEX_COVERED.has(pattern));
    expect(unexpanded, "a parametrised route with no concrete expansion is untested, not covered").toEqual([]);
  });

  test("covers every public route surface by navigation, index page or a recorded exclusion", () => {
    const targets = new Set(navigationTargets());
    const orphans: string[] = [];

    expect(ROUTE_PATTERNS.length, "no <Route path> was extracted from src/App.tsx").toBeGreaterThan(0);
    expect(DEV_ROUTE_PATTERNS.length, "no dev-only <Route path> was extracted").toBeGreaterThan(0);

    for (const pattern of ROUTE_PATTERNS) {
      if (EXCLUDED.has(pattern)) continue;
      if (INDEX_COVERED.has(pattern)) {
        // The family's index page must itself be a navigation target.
        const index = INDEX_ROUTES.find((entry) => entry.covers === pattern)!;
        if (!targets.has(index.path)) orphans.push(`${pattern} (index ${index.path} is not linked)`);
        continue;
      }
      const concrete = CONCRETE[pattern];
      if (concrete) {
        for (const url of concrete) if (!targets.has(url)) orphans.push(url);
        continue;
      }
      if (!targets.has(pattern)) orphans.push(pattern);
    }

    expect(orphans, "every public route must be reachable or deliberately excluded").toEqual([]);

    // The exclusion table is the permission, so it must stay honest.
    for (const entry of EXCLUDED_FROM_PRIMARY_NAV) {
      expect(entry.reason.length, `${entry.path} needs a recorded reason`).toBeGreaterThan(20);
    }
    // Dev-only surfaces must be excluded AND must not be navigation targets.
    for (const pattern of DEV_ROUTE_PATTERNS) {
      expect(EXCLUDED.has(pattern), `${pattern} must be recorded as excluded`).toBe(true);
      expect(targets.has(pattern), `${pattern} must never appear in production navigation`).toBe(false);
    }
    expect([...targets].filter((path) => DEV_ROUTE_PATTERNS.includes(path))).toEqual([]);

    // The landing anchor set is the one in `e2e/helpers.ts`, not a second list.
    expect(landingSections.map((section) => section.id)).toEqual([...LANDING_SCENE_IDS]);
  });

  test("the menu on / really publishes the whole route set", async ({ page }) => {
    test.setTimeout(180_000);
    await gotoAndSettle(page, "/");
    await landingReady(page);
    await page.locator("[data-menu-trigger]").click();
    const menu = page.locator("[data-fullscreen-menu]");
    await expect(menu).toBeVisible();

    // Open every family and every category so the whole tree is in the DOM.
    const families = menu.locator("button[aria-pressed]:not([lang])");
    const published = new Set<string>();
    const collect = async () => {
      for (const href of await menu.locator("a[href]").evaluateAll((links) =>
        links.map((link) => link.getAttribute("href")!))) published.add(href);
    };
    for (let familyIndex = 0; familyIndex < await families.count(); familyIndex += 1) {
      await families.nth(familyIndex).click();
      // A flat family (04 Kurumsal) has no categories: its pages are rows.
      await collect();
      const categories = menu.locator("[data-nav-category]");
      for (let index = 0; index < await categories.count(); index += 1) {
        await categories.nth(index).click();
        await expect(categories.nth(index)).toHaveAttribute("aria-expanded", "true");
        await collect();
      }
    }

    const routeTargets = navigationTargets();
    const missing = routeTargets.filter((path) => !published.has(path));
    expect(missing, "every IA target must be a real href in the rendered menu").toEqual([]);

    // And no dev/legacy/test surface may appear.
    const leaked = [...published].filter((href) =>
      ["/technical-preview", "/legacy-landing", "/test"].some((dev) => href === dev));
    expect(leaked, "dev routes must not appear in production navigation").toEqual([]);
  });

  test("keeps deep links and history navigation correct", async ({ page }) => {
    // 1) A typed/shared deep link must land on its band, not at the top.
    await gotoAndSettle(page, "/#sektorler");
    await landingReady(page);
    const headerHeight = await page.locator("[data-fullscreen-header]")
      .evaluate((element) => element.getBoundingClientRect().height);
    await expect.poll(async () => {
      const top = await page.locator("#sektorler").evaluate((element) => element.getBoundingClientRect().top);
      return top >= headerHeight - 4 && top <= headerHeight + 32;
    }, { timeout: 15_000, intervals: [200, 400, 800] }).toBe(true);

    // 2) Navigating from the menu pushes history; Back returns to the landing.
    await page.locator("[data-menu-trigger]").click();
    // Revision 4: company pages live in the flat 04 Kurumsal family.
    await page.locator("[data-fullscreen-menu] button[aria-pressed]:not([lang])").nth(3).click();
    await page.locator("[data-fullscreen-menu]").getByRole("link", { name: "Hakkımızda" }).click();
    await expect(page).toHaveURL(/\/hakkimizda$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/#sektorler$/);
    await expect(page.getByTestId("technical-landing-root")).toBeVisible();
    // Every page module renders its own <Header/> into one shared host, so a
    // route change can have two mounted at once while the curtain runs. It did:
    // `[data-menu-trigger]` resolved to 2 elements right after this goBack.
    await expect(page.locator("[data-fullscreen-header]")).toHaveCount(1);
    await expect(page.locator("[data-menu-trigger]")).toHaveCount(1);
    await expect(page.getByRole("banner")).toHaveCount(1);

    // 3) A history move with the menu open closes it instead of stranding a
    //    modal over a page the user did not open it from.
    //    `landingReady` first: the landing remounts on Back and re-runs its
    //    deep-link scroll ladder, and clicking into that transition made the
    //    step flaky (1 failure in 2 repeats) for reasons that had nothing to do
    //    with the behaviour under test.
    await landingReady(page);
    await page.locator("[data-menu-trigger]").click();
    await expect(page.locator("[data-fullscreen-menu]")).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/hakkimizda$/);
    await expect(page.locator("[data-fullscreen-menu]")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
    await expect(page.locator("#root")).not.toHaveAttribute("inert", "");
  });

  test("every route the menu links to resolves without a redirect or a not-found shell", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "critical-1280", "one canonical resolution lane");
    test.setTimeout(600_000);
    const failures: string[] = [];
    for (const path of navigationTargets()) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect.poll(() => decodeURIComponent(new URL(page.url()).pathname), { timeout: 20_000 })
        .toBe(path);
      const notFound = await page.getByRole("heading", { name: /^(Sayfa|Yazı) Bulunamadı$/u }).count();
      if (notFound > 0) failures.push(path);
    }
    expect(failures, "no navigation target may resolve to a not-found shell").toEqual([]);
  });
});
