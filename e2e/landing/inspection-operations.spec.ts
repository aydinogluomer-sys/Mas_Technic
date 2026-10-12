import { expect, test } from "@playwright/test";
import { gotoAndSettle, landingReady } from "../helpers";

test.beforeEach(async ({ context, page }) => {
  await context.route("**/*", route => {
    const url = new URL(route.request().url());
    return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || ["data:", "blob:"].includes(url.protocol) ? route.continue() : route.abort("blockedbyclient");
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
});

test("five NEXUS operations have distinct geometry and preserve native source documents", async ({ page }, info) => {
  await gotoAndSettle(page, "/"); await landingReady(page);
  const controls = page.locator(".tl-nexus-rail button");
  await expect(controls).toHaveCount(5);
  const geometry = [];
  for (let i = 0; i < 5; i++) {
    const button = controls.nth(i); await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    const panel = page.locator('.tl-nexus-step[data-active="true"]');
    await expect(panel.locator("h3")).toHaveCount(1);
    await expect(panel.locator("dl > div")).toHaveCount(2);
    await expect(panel).toContainText("DEMO");
    await expect(panel).toContainText("GERÇEK SİPARİŞ DEĞİLDİR");
    await expect(panel.locator("figcaption")).toContainText("Temsilî operasyon şeması");
    const box = await button.boundingBox(); expect(box!.height).toBeGreaterThanOrEqual(44);
    geometry.push(await panel.locator("svg").evaluate(svg => [...svg.querySelectorAll("path,rect,circle,ellipse,line,polyline,polygon")].map(node =>
      [node.tagName, ...["d", "cx", "cy", "r", "rx", "ry", "x", "y", "width", "height", "points", "transform"].map(name => node.getAttribute(name) ?? "")])));
    await info.attach(`operation-${i + 1}`, { body: await page.locator(".tl-nexus-app").screenshot(), contentType: "image/png" });
  }
  expect(new Set(geometry.map(item => JSON.stringify(item))).size, "uniqueness must come from actual geometry, not ids or classes").toBe(5);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await controls.nth(1).click(); await controls.nth(4).click();
  await expect(page.locator('.tl-nexus-step[data-active="true"] h3')).toHaveText("SEVKİYAT");
  await expect(page.locator('.tl-nexus-rail button[aria-pressed="true"]')).toHaveCount(1);
});

test("all thirteen sectors remain selectable and linked to their exact detail route", async ({ page }) => {
  await gotoAndSettle(page, "/"); await landingReady(page);
  const options = page.locator(".tl-sector-option"); await expect(options).toHaveCount(13);
  const hrefs = [];
  for (const option of await options.all()) {
    const button = option.locator("button"), link = option.locator("a");
    const href = await link.getAttribute("href"); hrefs.push(href);
    await button.focus(); await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#tl-sector-detail")).toHaveAttribute("data-sector", href!);
    await expect(page.locator("#tl-sector-title")).toHaveText((await button.innerText()).replace(/^\d+\s*/, ""));
    const box = await button.boundingBox(); expect(box!.height).toBeGreaterThanOrEqual(44);
    await expect(page.locator('#tl-sector-detail a[href="/teklif-al"]')).toHaveCount(1);
  }
  expect(new Set(hrefs).size).toBe(13);
  expect(hrefs.every(href => href?.startsWith("/endustriyel/"))).toBe(true);
  await options.first().locator("button").click(); await expect(page.locator(".tl-sector-source")).toBeVisible();
});

test("four genuine quality PDFs stay accessible through native preview selection and thumbnail failure", async ({ page }) => {
  await gotoAndSettle(page, "/"); await landingReady(page);
  const documents = page.locator(".tl-quality-document"); await expect(documents).toHaveCount(4);
  for (const document of await documents.all()) {
    const link = document.locator("a"), href = await link.getAttribute("href");
    const response = await page.request.get(href!);
    expect(response.ok()).toBe(true); expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
    await document.locator("button").click();
    await expect(page.locator("#tl-quality-preview a")).toHaveAttribute("href", href!);
    await expect(page.locator("#tl-quality-selected-title")).toHaveText(await document.locator("strong").innerText());
  }
  await page.route("**/*qdoc*.webp", route => route.abort("failed"));
  await page.route("**/*quality-doc*.webp", route => route.abort("failed"));
  const thumb = await page.locator("#tl-quality-preview img").getAttribute("src");
  await page.route(`**/${thumb!.split("/").pop()}`, route => route.abort("failed"));
  await page.reload(); await landingReady(page);
  await page.locator(".tl-quality-document button").last().click();
  await expect(page.locator("#tl-quality-preview")).toContainText("Önizleme yüklenemedi");
  await expect(page.locator(".tl-quality-document a")).toHaveCount(4);
  await expect(page.locator("#tl-quality-preview a")).toBeVisible();
});

test("category search has an honest empty state and preserves its complete native index", async ({ page }) => {
  await gotoAndSettle(page, "/hizmetler/kategori/talasli-imalat");
  const choices = page.locator(".inspection-catalogue-choices button");
  const initial = await choices.count(); expect(initial).toBeGreaterThan(0);
  const routeLinks = await page.locator('main a[href^="/hizmetler/"]').evaluateAll(nodes => nodes.map(node => node.getAttribute("href")));
  await page.locator(".inspection-atlas input[type=search]").fill("__no_matching_record__");
  await expect(choices).toHaveCount(0); await expect(page.locator(".inspection-atlas")).toContainText("Sonuç bulunamadı");
  for (const href of new Set(routeLinks)) await expect(page.locator(`main a[href="${href}"]`).first()).toBeAttached();
  await page.locator(".inspection-atlas").getByRole("button", { name: "Sıfırla" }).click();
  await expect(choices).toHaveCount(initial);
  await choices.last().focus(); await page.keyboard.press("Enter"); await expect(choices.last()).toHaveAttribute("aria-pressed", "true");
});
