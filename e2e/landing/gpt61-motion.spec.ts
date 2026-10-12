import { expect, test, type Locator, type Page } from "@playwright/test";
import { gotoAndSettle, landingReady, settleRendering } from "../helpers";

async function translation(photo: Locator) {
  return photo.evaluate((element) => {
    const translate = getComputedStyle(element).translate;
    return translate === "none" ? 0 : Number.parseFloat(translate.split(/\s+/)[1] ?? "0");
  });
}

async function openAboutFromFooter(page: Page) {
  const group = page.locator(".shell-footer-disclosure").filter({
    has: page.locator('a[href="/hakkimizda"]'),
  });
  const disclosure = group.locator("h2 > button");
  if (await disclosure.isVisible()) {
    if (await disclosure.getAttribute("aria-expanded") === "false") await disclosure.click();
    await expect(disclosure).toHaveAttribute("aria-expanded", "true");
    await group.locator('a[href="/hakkimizda"]').click();
  } else await page.locator('.tl-footer nav a[href="/hakkimizda"]').first().click();
}

/* Runtime contracts: actual keyboard/touch selection and paired geometry,
   motion ownership/fallback, client-navigation timing, and reviewable output.
   These do not replace or update existing visual goldens. */
test.describe("GPT-6.1 inspection motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() => localStorage.setItem("mas_prose_reveal", "on"));
  });

  test("dimensions persist after keyboard or touch selection and clear on repeat", async ({ page }, testInfo) => {
    await gotoAndSettle(page, "/");
    await landingReady(page);
    const bore = page.locator('button[data-dim="bore"]');
    const height = page.locator('button[data-dim="height"]');
    await bore.focus();
    await page.keyboard.press("Space");
    await expect(bore).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Tab");
    await expect(height).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(height).toHaveAttribute("aria-pressed", "true");
    await expect(bore).toHaveAttribute("aria-pressed", "false");
    await page.mouse.move(2, 2);
    await expect.poll(() => page.locator(".tl-pp-dim").evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
    await expect.poll(() => page.locator(".tl-pp-bore").evaluate((el) => Number(getComputedStyle(el).opacity))).toBeLessThan(.5);
    await expect.poll(async () => (await height.evaluate((el) => getComputedStyle(el).color)) ===
      (await page.locator(".tl-pp-dim").evaluate((el) => getComputedStyle(el).stroke))).toBe(true);
    await testInfo.attach("persistent-keyboard-dimension", { body: await page.screenshot(), contentType: "image/png" });
    await page.keyboard.press("Enter");
    await expect(height).toHaveAttribute("aria-pressed", "false");
    await expect.poll(() => page.locator(".tl-pp-bore").evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);

    // The narrow critical project has a real touch context, not an emulated click.
    if (testInfo.project.use.hasTouch) await bore.tap();
    else await bore.click();
    await page.mouse.move(2, 2);
    await expect(bore).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => page.locator(".tl-pp-bore").evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(bore).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("h1")).toBeVisible();
    await expect.poll(() => page.locator(".inspection-line > span").first().evaluate((el) => getComputedStyle(el).transform)).toBe("none");
    if (testInfo.project.use.hasTouch) await bore.tap();
    else await bore.click();
    await expect(bore).toHaveAttribute("aria-pressed", "false");
    if (testInfo.project.use.hasTouch) {
      await page.setViewportSize({ width: 320, height: 812 });
      await page.locator(".tl-part-frame .tl-image-link").focus();
      await page.keyboard.press("Tab");
      for (const [name, control] of [["bore", bore], ["height", height]] as const) {
        await expect(control).toBeFocused();
        const perimeter = await control.evaluate((element) => {
          const style = getComputedStyle(element);
          const reach = Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset);
          const rect = element.getBoundingClientRect();
          let visible = style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) > 0;
          const clippedBy: string[] = [];
          for (let parent = element.parentElement; parent; parent = parent.parentElement) {
            const parentStyle = getComputedStyle(parent);
            const box = parent.getBoundingClientRect();
            const clipsX = /hidden|clip|scroll|auto/.test(parentStyle.overflowX);
            const clipsY = /hidden|clip|scroll|auto/.test(parentStyle.overflowY);
            if ((clipsX && (rect.left - reach < box.left - 1 || rect.right + reach > box.right + 1)) ||
                (clipsY && (rect.top - reach < box.top - 1 || rect.bottom + reach > box.bottom + 1))) {
              visible = false;
              clippedBy.push(parent.className);
            }
          }
          return { visible, clippedBy };
        });
        expect(perimeter, `${name} keyboard focus perimeter must fit all clipping ancestors at 320px`).toEqual({ visible: true, clippedBy: [] });
        const geometry = await control.evaluate((element) => {
          const target = element.getBoundingClientRect();
          const frame = element.closest(".tl-part-controls")!.getBoundingClientRect();
          return { width: target.width, height: target.height,
            leftClearance: target.left - frame.left, rightClearance: frame.right - target.right };
        });
        expect(geometry.width).toBeGreaterThanOrEqual(44);
        expect(geometry.height).toBeGreaterThanOrEqual(44);
        expect(geometry.leftClearance).toBeGreaterThanOrEqual(0);
        expect(geometry.rightClearance).toBeGreaterThanOrEqual(0);
        await testInfo.attach(`mobile-320-${name}-target-geometry`, { body: JSON.stringify(geometry), contentType: "application/json" });
        await testInfo.attach(`mobile-320-${name}-keyboard-focus-perimeter`, { body: await page.screenshot(), contentType: "image/png" });
        if (name === "bore") await page.keyboard.press("Tab");
      }
    }
  });

  test("NEXUS keyboard step selection prints the intended document inside the same frame", async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    await gotoAndSettle(page, "/");
    const button = page.locator(".tl-nexus-rail button").nth(3);
    await button.scrollIntoViewIfNeeded();
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    const target = await button.getAttribute("aria-controls");
    const panel = page.locator(`#${target}`);
    await expect(panel.getByRole("heading", { level: 3 })).toHaveText("ÖLÇÜM");
    await expect(panel.locator("dl")).toContainText("Ölçüm");
    await expect(page.locator('.tl-nexus-rail button[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator(".tl-nexus-app")).toHaveCount(1);
    await page.waitForTimeout(600);
    await testInfo.attach("nexus-selected-measurement-step", { body: await page.locator("#nexus").screenshot(), contentType: "image/png" });
    if (testInfo.project.use.hasTouch) {
      // Touch tablets also run this suite; yielding is a <=767px contract.
      await page.setViewportSize({ width: 375, height: 812 });
      const launcher = page.locator("[data-chat-launcher]");
      const rfq = page.getByTestId("nexus-rfq");
      const placeCtaAtLauncher = async () => {
        await rfq.scrollIntoViewIfNeeded();
        await page.evaluate(() => {
          const arrow = document.querySelector(".tl-nexus-rfq svg")!.getBoundingClientRect();
          const support = document.querySelector("[data-chat-launcher]")!.getBoundingClientRect();
          window.scrollBy(0, arrow.top + arrow.height / 2 - support.top - support.height / 2);
        });
      };
      const assertCtaHit = async () => {
        expect(await rfq.evaluate((link) => {
          const arrow = link.querySelector("svg")!.getBoundingClientRect();
          return link.contains(document.elementFromPoint(arrow.right - 2, arrow.top + arrow.height / 2));
        }), "the primary RFQ arrow must receive its own pointer hit").toBe(true);
      };
      await placeCtaAtLauncher();
      await expect(launcher).toHaveAttribute("data-yield", "true");
      await expect.poll(() => launcher.evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
      await expect.poll(() => launcher.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
      await assertCtaHit();
      await testInfo.attach("mobile-nexus-rfq-unobscured", { body: await page.screenshot(), contentType: "image/png" });

      // Crossing the breakpoint must release yielding without a new IO entry.
      await page.setViewportSize({ width: 1280, height: 812 });
      await expect(launcher).not.toHaveAttribute("data-yield", "true");
      await expect.poll(() => launcher.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
      await page.setViewportSize({ width: 375, height: 812 });
      await placeCtaAtLauncher();
      await expect(launcher).toHaveAttribute("data-yield", "true");

      // Follow native sequential focus to support, then keep it focused while
      // the NEXUS target intersects: yielding must never hide keyboard focus.
      await page.getByTestId("nexus-login").focus();
      for (let steps = 0; steps < 80 && !(await launcher.evaluate((el) => el === document.activeElement)); steps++) {
        await page.keyboard.press("Tab");
      }
      await expect(launcher).toBeFocused();
      await placeCtaAtLauncher();
      await expect(launcher).toHaveAttribute("data-yield", "true");
      await expect.poll(() => launcher.evaluate((el) => el.matches(":focus-visible"))).toBe(true);
      await expect.poll(() => launcher.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
      await page.keyboard.press("Enter");
      const dialog = page.getByRole("dialog", { name: "MAS Technic sohbet asistanı" });
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "Sohbeti kapat" }).click();
      await expect(dialog).toHaveCount(0);
      await expect(launcher).toHaveAttribute("data-yield", "true");
      await expect.poll(() => launcher.evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
      await assertCtaHit();
      await testInfo.attach("mobile-nexus-rfq-loaded-chat-unobscured", { body: await page.screenshot(), contentType: "image/png" });
      // The hero CTA is also protected now; release support in a genuinely
      // unprotected reading band, without weakening CTA pointer protection.
      await page.locator(".tl-proof").scrollIntoViewIfNeeded();
      await expect(launcher).not.toHaveAttribute("data-yield", "true");
      await expect.poll(() => launcher.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator(".tl-nexus-rail button").nth(4).click();
    await expect(page.locator('#tl-nexus-step-sevkiyat h3')).toHaveText("SEVKİYAT");
    expect(await page.locator('#tl-nexus-step-sevkiyat h3').evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  });

  test("photo counter-drift is bounded, covers the frame, resets at mobile and live reduced motion", async ({ page }, testInfo) => {
    await gotoAndSettle(page, "/hizmetler/cnc-frezeleme");
    const photo = page.locator(".shell-plate-frame > img").first();
    const frame = photo.locator("..");
    await frame.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const fine = await page.evaluate(() => matchMedia("(min-width: 769px) and (hover: hover) and (pointer: fine)").matches);
    const titleBefore = await page.locator("h1").evaluate((el) => getComputedStyle(el).opacity);
    const before = await translation(photo);
    await page.evaluate(() => window.scrollBy(0, 160));
    await page.waitForTimeout(400);
    const after = await translation(photo);
    if (fine) {
      expect(Math.abs(after - before)).toBeGreaterThan(3);
      expect(Math.abs(after)).toBeLessThanOrEqual(36);
      const coverage = await photo.evaluate((el) => {
        const image = el.getBoundingClientRect();
        const box = el.parentElement!.getBoundingClientRect();
        return { top: image.top <= box.top, bottom: image.bottom >= box.bottom };
      });
      expect(coverage).toEqual({ top: true, bottom: true });
    } else expect(after).toBe(0);
    expect(await page.locator("h1").evaluate((el) => getComputedStyle(el).opacity)).toBe(titleBefore);
    await testInfo.attach("service-photo-counter-drift", { body: await frame.screenshot(), contentType: "image/png" });
    // Move it off screen first: responsive cleanup must include inactive photos.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.setViewportSize({ width: 375, height: 812 });
    await expect.poll(() => translation(photo)).toBe(0);
    expect(await photo.evaluate((el) => el.style.willChange)).toBe("");
    await page.setViewportSize({ width: 1280, height: 800 });
    await frame.scrollIntoViewIfNeeded();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(() => translation(photo)).toBe(0);
    expect(await photo.evaluate((el) => el.style.willChange)).toBe("");
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.locator(".inspection-title > span").evaluate((el) => getComputedStyle(el).clipPath)).toBe("none");
    await gotoAndSettle(page, "/hizmetler/mekanik-montaj");
    await expect(page.locator(".shell-schema-media")).toBeVisible();
    expect(await page.locator(".shell-schema-media").evaluate((el) => getComputedStyle(el).translate)).toBe("none");
    await gotoAndSettle(page, "/malzemeler");
    const still = page.locator('.shell-plate[data-size="reference"] img');
    await still.scrollIntoViewIfNeeded();
    expect(await translation(still)).toBe(0);
  });

  test("client navigation keeps quiet editorial titles readable immediately and at rest", async ({ page }, testInfo) => {
    await gotoAndSettle(page, "/");
    await openAboutFromFooter(page);
    await expect(page).toHaveURL(/\/hakkimizda$/);
    const title = page.locator("h1.inspection-title > span");
    await expect(title).toHaveText("Hakkımızda");
    const initial = await title.evaluate((el) => {
      const style = getComputedStyle(el);
      return { name: style.animationName, opacity: Number(style.opacity), clip: style.clipPath, transform: style.transform };
    });
    expect(initial).toEqual({ name: "none", opacity: 1, clip: "none", transform: "none" });
    await expect(page.locator("#hero-shell, [data-intro-active]")).toHaveCount(0);
    await page.waitForTimeout(250);
    expect(await title.evaluate((el) => getComputedStyle(el).clipPath)).toBe("none");
    expect(await title.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
    await expect(page.locator("h1")).toHaveCount(1);
    await testInfo.attach("client-navigation-title-ink", { body: await page.screenshot(), contentType: "image/png" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await title.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  });

  test("missing intersection observation keeps landing and inner content readable", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => { Reflect.deleteProperty(window, "IntersectionObserver"); });
    await gotoAndSettle(page, "/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".tl-root")).toHaveAttribute("data-motion", "reduced");
    await page.locator("#iletisim").scrollIntoViewIfNeeded();
    await expect(page.locator("#iletisim h2")).toBeVisible();
    await gotoAndSettle(page, "/blog");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".shell-plate-frame img").first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("repeated route teardown leaves no detached observation targets", async ({ page }, testInfo) => {
    await page.addInitScript(() => {
      const Native = window.IntersectionObserver;
      const targets: Set<Element>[] = [];
      class Observed extends Native {
        private watched = new Set<Element>();
        constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
          super(callback, options);
          targets.push(this.watched);
        }
        override observe(target: Element) { this.watched.add(target); super.observe(target); }
        override unobserve(target: Element) { this.watched.delete(target); super.unobserve(target); }
        override disconnect() { this.watched.clear(); super.disconnect(); }
      }
      window.IntersectionObserver = Observed;
      Object.defineProperty(window, "__gpt61Observation", { value: () => ({
        active: targets.filter((set) => set.size > 0).length,
        detached: targets.flatMap((set) => [...set]).filter((target) => !target.isConnected).length,
      }) });
    });
    await gotoAndSettle(page, "/hizmetler/cnc-frezeleme");
    const readings: Array<{ active: number; detached: number }> = [];
    for (let cycle = 0; cycle < 3; cycle++) {
      await openAboutFromFooter(page);
      await expect(page.locator("h1")).toHaveText("Hakkımızda");
      await page.goBack();
      await expect(page.locator("h1")).toHaveText("CNC Frezeleme");
      await page.waitForTimeout(1500);
      readings.push(await page.evaluate(() => Reflect.get(window, "__gpt61Observation")()));
    }
    expect(readings.map((reading) => reading.detached)).toEqual([0, 0, 0]);
    expect(readings[2].active).toBeLessThanOrEqual(readings[0].active);
    await expect(page.locator("main#main-content")).toHaveCount(1);
    await testInfo.attach("route-observation-cleanup", { body: JSON.stringify(readings), contentType: "application/json" });
  });

  test("enabled-motion review captures every public page family without rewriting goldens", async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    const routes = [
      ["landing", "/"], ["category", "/hizmetler/kategori/talasli-imalat"],
      ["service", "/hizmetler/cnc-frezeleme"], ["sector", "/endustriyel/robotik"],
      ["capability", "/kabiliyetler/tolerans-hassasiyet"], ["materials", "/malzemeler"],
      ["material-category", "/malzemeler/aluminyum"], ["profiles", "/kabiliyet-profilleri"],
      ["profile-detail", "/kabiliyet-profilleri/ince-cidarli-govde"], ["about", "/hakkimizda"],
      ["quality", "/kalite-dosyasi"], ["blog", "/blog"],
      ["article", "/blog/5-eksen-cnc-isleme-avantajlari"], ["faq", "/sss"],
      ["contact", "/iletisim"], ["rfq", "/teklif-al"],
      ["legal", "/kvkk"], ["auth", "/giris"], ["error", "/this-route-is-not-real"],
      ["locale", "/en/hakkimizda"],
    ];
    const titles: Record<string, string> = {
      landing: "HAM GEOMETRİDEN", category: "Talaşlı İmalat", service: "CNC Frezeleme",
      sector: "Robotik", capability: "Tolerans", materials: "Malzeme kütüphanesi",
      "material-category": "Alüminyum", profiles: "Kabiliyet Profilleri",
      "profile-detail": "İNCE CİDARLI GÖVDE", about: "Hakkımızda", quality: "Kalite Dosyası",
      blog: "Teknik Günlük", article: "5 Eksen CNC İşleme Avantajları", faq: "Sıkça Sorulan Sorular",
      contact: "Bize ulaşın", rfq: "Üretim Teklifi İsteyin", legal: "KVKK",
      auth: "Giriş Yapın", error: "Bu koordinatta", locale: "About",
    };
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const [family, path] of routes) {
      await gotoAndSettle(page, path);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h1")).toContainText(titles[family]);
      await settleRendering(page);
      await page.waitForTimeout(1400);
      await testInfo.attach(`enabled-${family}`, { body: await page.screenshot(), contentType: "image/png" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${family} horizontal overflow`).toBe(true);
    }
    expect(errors).toEqual([]);
  });
});
