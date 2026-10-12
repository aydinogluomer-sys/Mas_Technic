import { expect, test } from "@playwright/test";
import { gotoAndSettle, landingReady, revealFooterCopyright } from "../helpers";

/* A paired capture harness, not a golden update or an award score.
   Run unchanged against the frozen v6 source and the candidate. All
   non-loopback traffic is blocked before any buyer journey begins. */
const bands = ["tl-hero", "tl-proof", "tl-marquee", "tl-process", "tl-projects", "tl-sectors", "tl-manifesto", "tl-quality", "tl-references", "tl-nexus", "tl-faq-band", "tl-rfq"];
const families = [
  "/hizmetler/cnc-frezeleme", "/kabiliyetler/tolerans-hassasiyet",
  "/endustriyel/havacilik-uzay", "/hizmetler/kategori/talasli-imalat",
  "/malzemeler", "/malzemeler/aluminyum", "/kabiliyet-profilleri",
  "/kabiliyet-profilleri/ince-cidarli-govde", "/hakkimizda", "/kalite-dosyasi",
  "/blog", "/sss", "/iletisim", "/teklif-al", "/gizlilik-politikasi", "/en",
];

test.use({ video: "on", trace: "on" });

test.describe("Inspection story paired evidence", () => {
  test.beforeEach(async ({ context, page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await context.route("**/*", route => {
      const url = new URL(route.request().url());
      if (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || ["data:", "blob:"].includes(url.protocol)) return route.continue();
      return route.abort("blockedbyclient");
    });
    await page.addInitScript(() => localStorage.setItem("mas_prose_reveal", "on"));
  });

  test("12 bands, five NEXUS states, native scroll and RFQ path", async ({ page }, info) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await gotoAndSettle(page, "/");
    await landingReady(page);
    const order = await page.locator("main > .tl-band").evaluateAll((nodes, names) => nodes.map(node => [...node.classList].find(name => names.includes(name))), bands);
    expect(order).toEqual(bands);
    for (const name of bands) {
      const band = page.locator(`main > .${name}`);
      await band.scrollIntoViewIfNeeded();
      await page.waitForTimeout(320);
      await info.attach(`band-${name}`, { body: await band.screenshot({ animations: "allow" }), contentType: "image/png" });
    }
    const nexusStates: { index: number; text: string }[] = [];
    for (let index = 0; index < 5; index++) {
      const button = page.locator(".tl-nexus-rail button").nth(index);
      await button.focus();
      await page.keyboard.press("Enter");
      await expect(button).toHaveAttribute("aria-pressed", "true");
      const panel = page.locator('.tl-nexus-step[data-active="true"]');
      await expect(panel).toBeVisible();
      nexusStates.push({ index, text: await panel.innerText() });
      await page.waitForTimeout(350);
      await info.attach(`nexus-${index + 1}`, { body: await page.locator(".tl-nexus-app").screenshot({ animations: "allow" }), contentType: "image/png" });
    }
    expect(new Set(nexusStates.map(state => state.text)).size).toBe(5);
    await info.attach("nexus-states", { body: JSON.stringify(nexusStates), contentType: "application/json" });
    await revealFooterCopyright(page);
    await page.keyboard.press("Home");
    await page.waitForTimeout(400);
    await info.attach("full-page", { body: await page.screenshot({ fullPage: true, animations: "allow" }), contentType: "image/png" });
    await page.locator('[data-testid="nexus-rfq"]').click();
    await expect(page).toHaveURL(/\/teklif-al(?:\?|$)/);
    await expect(page.locator("main h1")).toBeVisible();
    await info.attach("rfq-entry", { body: await page.screenshot({ animations: "allow" }), contentType: "image/png" });
    expect(errors).toEqual([]);
  });

  test("public families render, images settle and viewport remains contained", async ({ page }, info) => {
    test.setTimeout(180_000);
    const records = [];
    for (const path of families) {
      const errors: string[] = [];
      const onError = (error: Error) => errors.push(error.message);
      page.on("pageerror", onError);
      await gotoAndSettle(page, path);
      await expect(page.locator("main h1")).toBeVisible();
      await page.waitForTimeout(500);
      const state = await page.evaluate(() => ({
        title: document.querySelector("main h1")?.textContent,
        lang: document.documentElement.lang,
        overflow: document.documentElement.scrollWidth - innerWidth,
        images: [...document.querySelectorAll<HTMLImageElement>("main img")].filter(image => image.getBoundingClientRect().top < innerHeight).map(image => ({ src: image.currentSrc, loaded: image.complete && image.naturalWidth > 0 })),
      }));
      expect(errors, path).toEqual([]);
      expect(state.overflow, path).toBeLessThanOrEqual(1);
      expect(state.images.every(image => image.loaded), path).toBe(true);
      records.push({ path, ...state });
      await info.attach(`family-${path.replace(/\//g, "_")}`, { body: await page.screenshot({ animations: "allow" }), contentType: "image/png" });
      page.off("pageerror", onError);
    }
    await info.attach("family-evidence", { body: JSON.stringify(records), contentType: "application/json" });
  });
});
