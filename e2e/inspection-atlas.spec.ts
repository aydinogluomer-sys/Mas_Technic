import { expect, test } from "@playwright/test";
import { gotoAndSettle } from "./helpers";

test.beforeEach(async ({ context, page }) => {
  await context.route("**/*", route => {
    const url = new URL(route.request().url());
    return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || ["data:", "blob:"].includes(url.protocol) ? route.continue() : route.abort("blockedbyclient");
  });
});

test("inner hero primary actions remain unobscured on mobile, including loaded support", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await gotoAndSettle(page, "/hizmetler/kategori/talasli-imalat");
  const actions = page.locator(".shell-hero-actions"), launcher = page.locator("[data-chat-launcher]");
  for (const link of await actions.locator("a").all()) {
    await link.scrollIntoViewIfNeeded();
    await expect.poll(() => launcher.getAttribute("data-yield")).toBe("true");
    expect(await link.evaluate(node => {
      const rect = node.getBoundingClientRect();
      return node.contains(document.elementFromPoint(rect.right - 3, rect.top + rect.height / 2));
    })).toBe(true);
  }
  await launcher.focus(); await expect(launcher).toBeFocused();
  await expect.poll(() => launcher.evaluate(node => getComputedStyle(node).opacity)).toBe("1");
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "MAS Technic sohbet asistanı" });
  await expect(dialog).toBeVisible(); await dialog.getByRole("button", { name: "Sohbeti kapat" }).click();
  await expect(dialog).toHaveCount(0);
  await expect.poll(() => launcher.getAttribute("data-yield")).toBe("true");
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(launcher).not.toHaveAttribute("data-yield", "true");
});

test("material and profile first-band controls retain register bands and keep title words whole", async ({ page }, info) => {
  for (const path of ["/malzemeler", "/malzemeler/aluminyum", "/kabiliyet-profilleri", "/kabiliyet-profilleri/ince-cidarli-govde"]) {
    await gotoAndSettle(page, path);
    await expect(page.locator(".inspection-family-hero--record")).toHaveCount(1);
    await expect(page.locator(".inspection-family-subject")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    const words = await page.locator("main h1").evaluate(title => {
      const bounds = title.getBoundingClientRect(), walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
      const result: { text: string; lines: number; inside: boolean }[] = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        for (const match of (node.textContent ?? "").matchAll(/\S+/g)) {
          const range = document.createRange();
          range.setStart(node, match.index!); range.setEnd(node, match.index! + match[0].length);
          const rects = [...range.getClientRects()].filter(rect => rect.width > 0);
          result.push({ text: match[0], lines: new Set(rects.map(rect => Math.round(rect.top))).size,
            inside: rects.every(rect => rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1) });
        }
      }
      return result;
    });
    expect(words.length).toBeGreaterThan(0);
    expect(words.filter(word => word.lines !== 1 || !word.inside), "no split or clipped title word").toEqual([]);
    const choices = page.locator(".inspection-family-subject select");
    if (await choices.count()) {
      const select = choices.first(), options = select.locator("option");
      const last = await options.last().getAttribute("value");
      await select.selectOption(last!); await expect(select).toHaveValue(last!);
      await expect(page.locator(".inspection-family-subject dl").first()).toBeVisible();
    }
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator("main > .tl-band")).not.toHaveCount(1);
    await info.attach(`atlas-${path.replace(/\//g, "_")}`, { body: await page.screenshot(), contentType: "image/png" });
  }
});
