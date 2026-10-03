import { expect, test } from "@playwright/test";
import { servicePages } from "../src/data/servicePages";
import { DETAIL_FAMILIES, parseDetailPath, resolveDetailRoute } from "../src/lib/detail-route";
import { gotoAndSettle } from "./helpers";

/* R01 — a detail record is served at exactly one family address.
   Known slug under the wrong family → client `replace` redirect to the
   canonical family URL; unknown slug → the existing not-found view. The
   redirect is client-side, not an HTTP 301 (host redirect: RELEASE01). */

const findBySlug = (slug: string) => servicePages.find((item) => item.slug === slug);

test.describe("detail route contract (pure)", () => {
  /* Data-only: one project is enough. */
  test.skip(({ browserName }) => browserName !== "chromium" || test.info().project.name !== "desktop-1280", "data-only checks run in desktop-1280");

  test("48 records, slugs unique across all three families", () => {
    expect(servicePages).toHaveLength(48);
    const slugs = servicePages.map((item) => item.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("every record resolves at its own family and redirects from the other two", () => {
    for (const record of servicePages) {
      const own = resolveDetailRoute(`/${record.category}/${record.slug}`, findBySlug);
      expect(own.kind, `${record.category}/${record.slug}`).toBe("found");
      for (const family of DETAIL_FAMILIES.filter((item) => item !== record.category)) {
        const wrong = resolveDetailRoute(`/${family}/${record.slug}`, findBySlug);
        expect(wrong).toMatchObject({ kind: "redirect", to: `/${record.category}/${record.slug}` });
      }
    }
  });

  test("unknown slugs never resolve to a record", () => {
    for (const family of DETAIL_FAMILIES) {
      expect(resolveDetailRoute(`/${family}/audit-not-found`, findBySlug)).toEqual({ kind: "not-found", family });
    }
  });

  test("locale prefix is carried through the redirect", () => {
    expect(resolveDetailRoute("/en/hizmetler/medikal", findBySlug))
      .toMatchObject({ kind: "redirect", to: "/en/endustriyel/medikal" });
    expect(parseDetailPath("/hizmetler/kategori/talasli-imalat")).toBeNull();
  });
});

const REDIRECTS = [
  { from: "/hizmetler/medikal", to: "/endustriyel/medikal" },
  { from: "/kabiliyetler/cnc-frezeleme", to: "/hizmetler/cnc-frezeleme" },
  { from: "/endustriyel/kalite-kontrol", to: "/kabiliyetler/kalite-kontrol" },
];

test.describe("detail route contract (browser)", () => {
  for (const { from, to } of REDIRECTS) {
    test(`direct load ${from} lands on ${to}`, async ({ page }) => {
      const record = findBySlug(to.split("/").pop()!)!;
      await gotoAndSettle(page, "/sss");
      await gotoAndSettle(page, `${from}?ref=x#sss`);
      await expect(page).toHaveURL(new RegExp(`${to.replace(/\//g, "\\/")}\\?ref=x#sss$`));
      await expect(page.locator("h1")).toHaveText(record.title);
      /* `replace`: the wrong address is not left in history — one step back
         is the page before it, not the wrong-family URL. */
      await page.goBack({ waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/sss$/);
    });
  }

  test("refresh on the canonical address keeps the same record", async ({ page }) => {
    await gotoAndSettle(page, "/hizmetler/medikal");
    await expect(page).toHaveURL(/\/endustriyel\/medikal$/);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/endustriyel\/medikal$/);
    await expect(page.locator("h1")).toHaveText(findBySlug("medikal")!.title);
  });

  test("SPA navigation to a wrong-family address redirects the same way", async ({ page }) => {
    await gotoAndSettle(page, "/hizmetler/cnc-frezeleme");
    await page.evaluate(() => {
      history.pushState({}, "", "/hizmetler/medikal");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await expect(page).toHaveURL(/\/endustriyel\/medikal$/);
    await expect(page.locator("h1")).toHaveText(findBySlug("medikal")!.title);
  });

  test("unknown slug shows the not-found view for the URL's family", async ({ page }) => {
    await gotoAndSettle(page, "/endustriyel/audit-not-found");
    await expect(page).toHaveURL(/\/endustriyel\/audit-not-found$/);
    await expect(page.locator("h1")).toHaveText("Bu sayfa kaydı bulunamadı");
    const heading = (await page.locator("h1").innerText()).trim();
    expect(servicePages.map((record) => record.title)).not.toContain(heading);
  });
});

test.describe("all 48 canonical detail addresses (browser)", () => {
  test.skip(({ browserName }) => browserName !== "chromium" || test.info().project.name !== "desktop-1280", "full walk runs once, in desktop-1280");

  test("each record renders at its own family address without redirecting", async ({ page }) => {
    test.setTimeout(240_000);
    for (const record of servicePages) {
      const path = `/${record.category}/${record.slug}`;
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1"), path).toHaveText(record.title);
      expect(decodeURIComponent(new URL(page.url()).pathname), path).toBe(path);
    }
  });
});
