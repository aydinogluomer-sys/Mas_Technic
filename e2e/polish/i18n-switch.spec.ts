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

  test("the header language dropdown switches in place and is remembered", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoAndSettle(page, "/");
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");

    const header = page.locator(".lang-switch--header");
    const button = header.locator(".lang-dropdown-button");
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("aria-expanded", "false");

    for (const [code, expected] of Object.entries(EXPECT)) {
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await header.locator(`[role="option"][lang="${code}"]`).click();
      await expect(header.locator('[role="listbox"]')).toHaveCount(0);
      await expect(page.locator("html")).toHaveAttribute("lang", expected.lang);
      await expect(button).toContainText(code.toUpperCase());
      await expect(page.getByText(new RegExp(`^\s*${expected.quote}\s*$`, "i")).first()).toBeAttached();
    }

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hans");
    await expect(page.locator("#mas-font-noto-sc")).toHaveCount(1);

    /* Keyboard: open with ArrowDown, move with ArrowUp, choose with Enter
       (zh is current, so one step up is ru); Escape closes without choosing. */
    await button.focus();
    await page.keyboard.press("ArrowDown");
    await expect(header.locator('[role="listbox"]')).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(button).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Escape");
    await expect(header.locator('[role="listbox"]')).toHaveCount(0);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");

    await button.click();
    await header.locator('[role="option"][lang="tr"]').click();
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.getByText(/TEKLİF AL|Teklif al/).first()).toBeAttached();
  });

  test("header actions read language ▾ · NEXUS · quote · menu on one axis", async ({ page }) => {
    for (const width of [1440, 1024, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoAndSettle(page, "/hakkimizda");
      const boxes = await page.evaluate(() =>
        [".lang-switch--header", ".tl-nexus-header-link", ".tl-quote-button", "[data-menu-trigger]"].map((selector) => {
          const box = document.querySelector(selector)!.getBoundingClientRect();
          return { left: box.left, right: box.right, middle: box.top + box.height / 2 };
        }));
      for (let index = 1; index < boxes.length; index += 1) {
        expect(boxes[index].left, `order at ${width}`).toBeGreaterThan(boxes[index - 1].right - 1);
        expect(Math.abs(boxes[index].middle - boxes[0].middle), `vertical centre at ${width}`).toBeLessThan(1.5);
      }
    }
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
