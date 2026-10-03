import { expect, test } from "@playwright/test";
import {
  expectLocatorUnobscured,
  fullScrollToBottom,
  gotoAndSettle,
  landingReady,
  measureHorizontalOverflow,
  waitForHeroShellTeardown,
} from "../helpers";

/**
 * Üretim ana sayfasının (`/` → `TechnicalLanding`) yapısal sözleşmesi.
 *
 * Bu paket, `helpers.ts` içindeki `/` → `/legacy-landing` yeniden yazımının
 * kaldırılmasıyla mümkün oldu: buradaki her iddia gerçekten `/` adresinde
 * ölçülür. Hiçbir tolerans listesi yoktur; gerçek bir kusur varsa test kırmızı
 * kalır ve raporlanır.
 */

/** Referans pafta 01–14 arası bantlardan oluşur; sıra ve numaralandırma sözleşmedir. */
const BAND_INDICES = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

/** Ölçüm genişlikleri: iki mobil/tablet, üç masaüstü kırılımı. */
const OVERFLOW_WIDTHS = [375, 768, 1280, 1440, 1600];

test.describe("production landing structure", () => {
  test("serves TechnicalLanding on / and numbers all 12 bands in order", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await landingReady(page);

    await expect(page.getByTestId("technical-landing-root")).toHaveCount(1);
    // Rakip bir landing ağacı `/` üzerinde render edilmemeli.
    await expect(page.getByTestId("landing-version-root")).toHaveCount(0);
    await expect(page.locator(".lf-root")).toHaveCount(0);
    await expect(page.locator("main#main-content")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);

    expect(await page.locator(".tl-band-index span").allTextContents()).toEqual(BAND_INDICES);
  });

  test("hands the intro shell off and leaves no stale intro state", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    // Sekans tavanı + devir payı; `src/lib/hero-shell.ts` güvenlik ağı 7000 ms.
    await waitForHeroShellTeardown(page);
    await page.waitForTimeout(3_000);

    const residue = await page.evaluate(() => ({
      shell: document.getElementById("hero-shell") !== null,
      introActive: document.documentElement.hasAttribute("data-intro-active"),
      headings: document.querySelectorAll("h1").length,
    }));
    expect(residue.shell, "#hero-shell must be removed after the hand-off").toBe(false);
    expect(residue.introActive, "documentElement must not keep data-intro-active").toBe(false);
    expect(residue.headings, "exactly one h1 survives the hand-off").toBe(1);

    await expect(page.getByTestId("technical-hero-title")).toBeVisible();
    await expect(page.locator(".tl-part-frame img")).toBeVisible();
  });

  test("preloads exactly one image and it is the hero the page actually renders", async ({ page, request }) => {
    const response = await request.get("/");
    // Yorumlar ayıklanır: bir yorum içindeki örnek etiket metni gerçek bir
    // preload sayılmamalı.
    const html = (await response.text()).replace(/<!--[\s\S]*?-->/g, "");
    const preloads = [...html.matchAll(/<link[^>]+rel="preload"[^>]*>/g)].map((match) => match[0]);
    const imagePreloads = preloads.filter((tag) => /as="image"/.test(tag));
    expect(imagePreloads, "the landing declares exactly one image preload").toHaveLength(1);

    const href = imagePreloads[0].match(/href="([^"]+)"/)?.[1];
    expect(href, "the image preload must carry an href").toBeTruthy();

    const asset = await request.get(href!);
    expect(asset.status(), `${href} must resolve`).toBe(200);
    expect(asset.headers()["content-type"], `${href} must be served as an image`).toMatch(/^image\//);

    await gotoAndSettle(page, "/");
    await landingReady(page);
    const renderedHero = await page.locator(".tl-part-frame img").getAttribute("src");
    expect(renderedHero, "the preloaded URL must be the rendered hero source").toBe(href);
  });

  test("never creates document-level horizontal overflow", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await landingReady(page);
    const height = page.viewportSize()?.height ?? 900;

    for (const width of OVERFLOW_WIDTHS) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(200);
      expect(await measureHorizontalOverflow(page), `${width}px must not overflow horizontally`)
        .toBeLessThanOrEqual(1);
    }
  });

  test("loads without console errors or failed local requests", async ({ page }) => {
    const consoleErrors: string[] = [];
    const failures: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));
    page.on("response", (response) => {
      const url = new URL(response.url());
      if (url.hostname === "localhost" && response.status() >= 400) {
        failures.push(`${url.pathname}: HTTP ${response.status()}`);
      }
    });

    await gotoAndSettle(page, "/");
    await landingReady(page);
    expect(consoleErrors).toEqual([]);
    expect(failures).toEqual([]);
  });

  test("an End-key journey reaches the landing footer legal links", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await landingReady(page);
    await fullScrollToBottom(page);

    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();
    for (const name of [/^KVKK$/, /Gizlilik Politikası/]) {
      const link = footer.getByRole("link", { name });
      await expect(link).toHaveCount(1);
      await link.focus();
      await expect(link).toBeFocused();
      await expectLocatorUnobscured(link, `landing footer link ${name}`);
    }
  });
});
