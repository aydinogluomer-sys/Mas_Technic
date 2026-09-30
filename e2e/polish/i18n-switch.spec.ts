import { expect, test, type Page } from "@playwright/test";
import { gotoAndSettle } from "../helpers";

/* Round 2, item 14: one tap switches the interface chrome (header, menu,
   footer, forms) and the landing between TR · EN · DE · RU · ZH, in place,
   and the choice is remembered. The audit mode (`mas_i18n_debug`) collects
   every key rendered without a dictionary entry, so an untranslated string
   on a covered surface fails here rather than slipping through. */

const EXPECT = {
  en: { lang: "en", quote: "Get a quote" },
  de: { lang: "de", quote: "Angebot anfordern" },
  ru: { lang: "ru", quote: "Получить предложение" },
  zh: { lang: "zh-Hans", quote: "获取报价" },
} as const;

async function walkLanding(page: Page) {
  /* Lazy bands only render (and only call `t`) once they are near the
     viewport, so the audit walks the whole page. */
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 700) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(300);
}

async function missingKeys(page: Page) {
  return page.evaluate(() => [...((window as unknown as { __i18nMissing?: Set<string> }).__i18nMissing ?? [])]);
}

test.describe("language switch", () => {
  test.skip(({ isMobile }) => isMobile, "header switch is a desktop control; mobile is covered below");

  test("one tap switches the header in place and is remembered", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoAndSettle(page, "/");
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");

    const header = page.locator(".lang-switch--header");
    await expect(header).toBeVisible();

    for (const [code, expected] of Object.entries(EXPECT)) {
      await header.locator(`button[lang="${code}"]`).click();
      await expect(page.locator("html")).toHaveAttribute("lang", expected.lang);
      await expect(header.locator(`button[lang="${code}"]`)).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByText(new RegExp(`^\s*${expected.quote}\s*$`, "i")).first()).toBeAttached();
    }

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hans");
    await expect(page.locator("#mas-font-noto-sc")).toHaveCount(1);

    await page.locator('.lang-switch--header button[lang="tr"]').click();
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.getByText(/TEKLİF AL|Teklif al/).first()).toBeAttached();
  });

  for (const code of Object.keys(EXPECT) as (keyof typeof EXPECT)[]) {
    test(`landing, menu and footer have no untranslated keys — ${code}`, async ({ page }) => {
      await page.addInitScript((language) => {
        localStorage.setItem("mas_lang", language);
        localStorage.setItem("mas_i18n_debug", "1");
      }, code);
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoAndSettle(page, "/");
      await expect(page.locator("html")).toHaveAttribute("lang", EXPECT[code].lang);
      await walkLanding(page);

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.locator("[data-menu-trigger]").first().click();
      await expect(page.locator("[data-fullscreen-menu]")).toBeVisible();

      expect(await missingKeys(page)).toEqual([]);
    });
  }

  test("quote and contact studios have no untranslated keys — en", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("mas_lang", "en");
      localStorage.setItem("mas_i18n_debug", "1");
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoAndSettle(page, "/teklif-al");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const quoteMissing = await missingKeys(page);
    await gotoAndSettle(page, "/iletisim");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect([...quoteMissing, ...(await missingKeys(page))]).toEqual([]);
  });
});

test.describe("language switch — mobile menu", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("the menu carries the switch and it works", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await page.locator("[data-menu-trigger]").first().click();
    const menuSwitch = page.locator(".lang-switch--menu");
    await expect(menuSwitch).toBeVisible();
    await menuSwitch.locator('button[lang="de"]').click();
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await expect(menuSwitch.locator('button[lang="de"]')).toHaveAttribute("aria-pressed", "true");
  });
});
