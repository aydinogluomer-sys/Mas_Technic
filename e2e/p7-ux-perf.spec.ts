import { expect, test, type Page } from "@playwright/test";
import { gotoAndSettle } from "./helpers";

/* Package 7 — UX01 (no intro, type floor, home order, height), UX02 (FAQ
   priority view, groups, search, deep links; compare limits), UX04 (booking,
   compact footer) and PERF01 (deferred chat / cursor / English content,
   landing preloads). Reads only; writes nothing. */

const chromiumOnly = ({ browserName }: { browserName: string }) => browserName !== "chromium";

/** Visible text below the floor: decorative rail/brand labels may be 10px,
    everything else ≥12px, table cells and form controls ≥14px. */
async function typeFloorViolations(page: Page) {
  return page.evaluate(() => {
    const bad: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set<Element>();
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const el = node.parentElement;
      if (!el || seen.has(el) || (node.textContent ?? "").trim().length < 2) continue;
      seen.add(el);
      if (el.closest("[aria-hidden='true'],.tl-visually-hidden,.sr-only,svg,[data-route-curtain]")) continue;
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      if (style.display === "none" || style.visibility === "hidden" || !box.width || !box.height) continue;
      const size = parseFloat(style.fontSize);
      const decorative = !!el.closest(".tl-band-index,.shell-rail,.tl-brand,.tl-menu-rail");
      /* A `<small>` hint inside a control is a caption (12px), not the control's label. */
      const control = !!el.closest("td,input,select,textarea,button") && el.tagName !== "SMALL";
      const floor = decorative ? 10 : control ? 14 : 12;
      if (size < floor) bad.push(`${size}px <${floor} ${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]} "${(node.textContent ?? "").trim().slice(0, 30)}"`);
    }
    return [...new Set(bad)];
  });
}

test.describe("UX01 landing", () => {
  test.skip(chromiumOnly, "chromium");

  test("no entry sequence: no shell, no intro flag, no intro key, labels readable from the first frame", async ({ page }) => {
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        (window as unknown as { __boot: unknown }).__boot = {
          shell: !!document.getElementById("hero-shell"),
          intro: document.documentElement.hasAttribute("data-intro-active"),
        };
      });
    });
    await gotoAndSettle(page, "/");
    expect(await page.evaluate(() => (window as unknown as { __boot: unknown }).__boot)).toEqual({ shell: false, intro: false });
    expect(await page.evaluate(() => Object.keys(sessionStorage))).not.toContain("mas_intro_seen");
    const animations = await page.locator(".tl-measure-top, .tl-measure-left, .tl-datum").evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).animationName));
    expect(animations.every((name) => name === "none")).toBe(true);
    const lineDuration = await page.locator(".tl-dimension-lines").evaluate((el) => getComputedStyle(el).animationDuration);
    expect(["0s", "0.25s"]).toContain(lineDuration);
  });

  test("reading order: hero → proof → control approach → profiles → sectors → quality → references → NEXUS → FAQ → RFQ", async ({ page }) => {
    await gotoAndSettle(page, "/");
    const order = await page.locator("main .tl-band").evaluateAll((els) =>
      els.map((el) => [...el.classList].find((name) => name.startsWith("tl-") && name !== "tl-band")));
    expect(order).toEqual(["tl-hero", "tl-proof", "tl-process", "tl-projects", "tl-sectors", "tl-quality", "tl-references", "tl-nexus", "tl-faq-band", "tl-rfq"]);
    await expect(page.locator(".tl-marquee, .tl-manifesto")).toHaveCount(0);
  });

  test("375: page at least 20% shorter than the 9828px baseline, no horizontal overflow", async ({ page }) => {
    test.skip(test.info().project.name !== "desktop-1280", "one lane");
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoAndSettle(page, "/");
    const { height, overflow } = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    expect(height, "baseline 9828px at 375 (package 6 build)").toBeLessThanOrEqual(Math.round(9828 * 0.8));
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("type floor and overflow across widths, including 200% zoom (640) and landscape", async ({ page }) => {
    test.skip(test.info().project.name !== "desktop-1280", "one lane walks every width");
    for (const [width, height] of [[320, 640], [375, 812], [390, 844], [640, 800], [768, 1024], [844, 390], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      for (const route of ["/", "/sss", "/hizmetler/cnc-frezeleme", "/kalite-dosyasi", "/en/teklif-al"]) {
        await gotoAndSettle(page, route);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${route} @${width}`).toBeLessThanOrEqual(0);
        if (width === 375 || width === 1440) expect(await typeFloorViolations(page), `${route} @${width}`).toEqual([]);
      }
    }
  });
});

test.describe("UX02 FAQ and materials", () => {
  test.skip(chromiumOnly, "chromium");

  test("first view: ten priority questions, every other topic closed but in the DOM", async ({ page }) => {
    await gotoAndSettle(page, "/sss");
    await expect(page.locator(".shell-faq-priority details")).toHaveCount(10);
    const toggles = page.locator(".shell-faq-toggle");
    expect(await toggles.count()).toBeGreaterThan(3);
    for (const state of await toggles.evaluateAll((els) => els.map((el) => el.getAttribute("aria-expanded")))) expect(state).toBe("false");
    const hiddenQuestions = await page.locator(".shell-faq-section .shell-faq[hidden] details").count();
    expect(hiddenQuestions, "closed groups keep their questions in the DOM").toBeGreaterThan(50);
    await toggles.first().click();
    await expect(toggles.first()).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".shell-faq-section").first().locator(".shell-faq")).toBeVisible();
  });

  test("search opens matching groups; clear returns to the priority start", async ({ page }) => {
    await gotoAndSettle(page, "/sss");
    await page.locator("#sss-arama").fill("anodizasyon");
    await expect(page.locator(".shell-faq-priority")).toHaveCount(0);
    const expanded = await page.locator(".shell-faq-toggle").evaluateAll((els) => els.map((el) => el.getAttribute("aria-expanded")));
    expect(expanded.length).toBeGreaterThan(0);
    expect(expanded.every((value) => value === "true")).toBe(true);
    await page.locator("#sss-arama").fill("zzqqxx-yok");
    await expect(page.getByText("Bu aramayla soru bulunamadı")).toBeVisible();
    await page.getByRole("button", { name: "Filtreleri temizle" }).click();
    await expect(page.locator(".shell-faq-priority details")).toHaveCount(10);
  });

  test("hash deep links open a group and a single question", async ({ page }) => {
    await gotoAndSettle(page, "/sss");
    const group = await page.locator(".shell-faq-section").nth(1).getAttribute("id");
    await gotoAndSettle(page, `/sss#${group}`);
    await expect(page.locator(`#${group} .shell-faq-toggle`)).toHaveAttribute("aria-expanded", "true");
    const target = await page.locator(`#${group} details`).first().getAttribute("id");
    await gotoAndSettle(page, `/sss#${target}`);
    await expect(page.locator(`#${target}`)).toHaveAttribute("open", "");
    await expect(page.locator(`#${target}`)).toBeVisible();
  });

  test("compare: one pick asks for another, four picks explain why the rest are disabled", async ({ page }) => {
    await gotoAndSettle(page, "/malzemeler");
    const boxes = page.locator("input.shell-check");
    await boxes.nth(0).check();
    await expect(page.locator("#malzeme-compare-status")).toContainText("bir malzeme daha seçin");
    for (let i = 1; i < 4; i += 1) await boxes.nth(i).check();
    await expect(page.locator("#malzeme-compare-status")).toContainText("En fazla 4 malzeme");
    await expect(boxes.nth(4)).toBeDisabled();
    await expect(boxes.nth(4)).toHaveAttribute("aria-describedby", "malzeme-compare-status");
  });
});

test.describe("UX04 booking and footers", () => {
  test.skip(chromiumOnly, "chromium");

  test("no day preview; one calendar control; the dialog traps focus, closes on Escape and gives focus back", async ({ page }) => {
    await page.route(/calendar\.(google|app\.google)/, (route) => route.abort());
    await gotoAndSettle(page, "/iletisim");
    await expect(page.locator(".booking-days, .booking-day")).toHaveCount(0);
    const trigger = page.getByTestId("booking-open");
    await expect(trigger).toContainText("Uygun saatleri takvimde görüntüle");
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Randevuyu yeni sekmede aç" }).first()).toBeVisible();
    /* Opening the dialog must move focus into it. Asserted first, because the
       Tab loop below measured the trap before focus had arrived when the
       machine was loaded (1 run in a full 8-viewport sweep). */
    await expect
      .poll(() => page.evaluate(() => !!document.activeElement?.closest("[role='dialog']")), { timeout: 5_000 })
      .toBe(true);
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => !!document.activeElement?.closest("[role='dialog']") || document.activeElement?.tagName === "IFRAME");
      expect(inside, `Tab ${i + 1} stays in the dialog`).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("a blocked calendar shows the way out (fallback or persistent hint)", async ({ page }) => {
    await page.route(/calendar\.(google|app\.google)/, (route) => route.abort());
    await gotoAndSettle(page, "/iletisim");
    await page.getByTestId("booking-open").click();
    await expect(page.locator(".booking-fallback, .booking-frame-hint").first()).toBeVisible({ timeout: 12_000 });
  });

  test("compact footer on legal, auth and the quote studio; full footer elsewhere", async ({ page }) => {
    for (const route of ["/kvkk", "/cerez-politikasi", "/giris", "/teklif-al", "/en/gizlilik-politikasi"]) {
      await gotoAndSettle(page, route);
      const footer = page.getByRole("contentinfo");
      await expect(footer, route).toHaveCount(1);
      await expect(footer, route).toHaveAttribute("data-footer-variant", "compact");
      await expect(footer.getByRole("link"), route).toHaveCount(5);
      await expect(footer.getByRole("link", { name: /Hemen Teklif Al/i })).toHaveCount(0);
    }
    await gotoAndSettle(page, "/sss");
    await expect(page.locator("[data-footer-variant='compact']")).toHaveCount(0);
    await expect(page.getByRole("contentinfo").getByRole("link", { name: /Hemen Teklif Al/i })).toHaveCount(1);
  });
});

test.describe("PERF01 deferred modules", () => {
  test.skip(chromiumOnly, "chromium");

  test("the chat renderer loads on the first open, not before", async ({ page }) => {
    const scripts: string[] = [];
    page.on("request", (request) => { if (request.resourceType() === "script") scripts.push(request.url()); });
    await gotoAndSettle(page, "/sss");
    await page.waitForTimeout(1500);
    expect(scripts.some((url) => /\/ChatBot-/.test(url)), "ChatBot chunk before any click").toBe(false);
    await page.locator("[data-chat-launcher]").click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15_000 });
    expect(scripts.some((url) => /\/ChatBot-/.test(url))).toBe(true);
  });

  test("the English content bundle is not loaded by the English landing, only by a record page", async ({ page }) => {
    const scripts: string[] = [];
    page.on("request", (request) => { if (request.resourceType() === "script") scripts.push(new URL(request.url()).pathname); });
    await gotoAndSettle(page, "/en");
    await page.waitForTimeout(1000);
    const before = new Set(scripts);
    await gotoAndSettle(page, "/en/sss");
    const added = scripts.filter((path) => !before.has(path));
    expect(added.length, "the record page brings the bundle").toBeGreaterThan(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Frequently Asked Questions");
  });

  test("landing preloads stay on the landing; one hero image preload", async ({ page }) => {
    await gotoAndSettle(page, "/");
    expect(await page.locator("link[rel='modulepreload'][href*='/Index-']").count()).toBeGreaterThan(0);
    await expect(page.locator("link[rel='preload'][as='image']")).toHaveCount(1);
    await gotoAndSettle(page, "/sss");
    await page.reload();
    expect(await page.locator("link[rel='modulepreload'][href*='/Index-']").count()).toBe(0);
  });
});
