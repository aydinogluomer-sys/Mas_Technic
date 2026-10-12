import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { gotoAndSettle } from "./helpers";

type Route = { path: string; access: string; enPath: string | null };
const manifest = JSON.parse(readFileSync("docs/quality/mas-technic-awwwards/routes.json", "utf8")) as { routes: Route[] };
const canonical = manifest.routes.filter(route => route.access === "public");
const paths = canonical.flatMap(route => [route.path, ...(route.enPath ? [route.enPath] : [])]);

test.beforeEach(async ({ context, page }) => {
  await context.route("**/*", route => {
    const url = new URL(route.request().url());
    return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || ["blob:", "data:"].includes(url.protocol) ? route.continue() : route.abort("blockedbyclient");
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (let start = 0; start < paths.length; start += 25) {
  const group = paths.slice(start, start + 25);
  test(`public route coverage ${start + 1}–${start + group.length}: canonical titles, locale, media and viewport`, async ({ page }, info) => {
    test.setTimeout(180_000);
    const records = [];
    for (const path of group) {
      const errors: string[] = [];
      const listener = (error: Error) => errors.push(error.message);
      page.on("pageerror", listener);
      await gotoAndSettle(page, path);
      await expect(page.locator("main h1")).toHaveCount(1);
      await expect(page.locator("main h1")).toBeVisible();
      await expect(page.locator('[data-shell-state="error"]')).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => [...document.querySelectorAll<HTMLImageElement>("main img")]
        .filter(image => { const rect = image.getBoundingClientRect(); return rect.top < innerHeight && rect.bottom > 0; })
        .every(image => image.complete && image.naturalWidth > 0))).toBe(true);
      const state = await page.evaluate(() => ({ title: document.querySelector("main h1")?.textContent?.trim(),
        documentTitle: document.title, lang: document.documentElement.lang,
        overflow: document.documentElement.scrollWidth - innerWidth, canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href }));
      expect(errors, path).toEqual([]);
      expect(state.title, path).toBeTruthy(); expect(state.documentTitle, path).toBeTruthy();
      expect(state.lang, path).toBe(path === "/en" || path.startsWith("/en/") ? "en" : "tr");
      expect(state.overflow, path).toBeLessThanOrEqual(1);
      records.push({ path, ...state });
      page.off("pageerror", listener);
    }
    await info.attach("canonical-route-evidence", { body: JSON.stringify({ canonicalCount: canonical.length, localizedPaths: paths.length, records }), contentType: "application/json" });
  });
}
