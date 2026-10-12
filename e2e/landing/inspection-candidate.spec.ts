import { createHash } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { gotoAndSettle, landingReady, settleRendering } from "../helpers";

test.beforeEach(async ({ context, page }) => {
  await context.route("**/*", route => {
    const url = new URL(route.request().url());
    return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || ["data:", "blob:"].includes(url.protocol)
      ? route.continue() : route.abort("blockedbyclient");
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
});

test("genuine public logo, paper title geometry and fixed inspection controls", async ({ page }, info) => {
  await gotoAndSettle(page, "/");
  await landingReady(page);
  const logo = page.locator(".tl-inspection-header .tl-brand-logo");
  await expect(logo).toBeVisible();
  const src = await logo.getAttribute("src");
  const response = await page.request.get(src!);
  expect(createHash("sha256").update(await response.body()).digest("hex")).toBe("43f9874c75264c1288debd405885343e86d9bc7b1e72ab91d4cd13269f2b0cfe");
  expect(await logo.evaluate((node: HTMLImageElement) => [node.naturalWidth, node.naturalHeight])).toEqual([1536, 187]);
  const geometry = await page.locator(".tl-hero-copy").evaluate(node => {
    const paper = node.getBoundingClientRect();
    const lines = [...node.querySelectorAll("h1 .inspection-line > span")].map(span => {
      const range = document.createRange(); range.selectNodeContents(span);
      return [...range.getClientRects()].filter(rect => rect.width > 1).map(rect => ({
        inside: rect.left >= paper.left && rect.right <= paper.right && rect.top >= paper.top && rect.bottom <= paper.bottom,
        y: rect.top, font: parseFloat(getComputedStyle(span).fontSize),
      }));
    });
    return { paper: getComputedStyle(node).backgroundColor, lines, overflow: document.documentElement.scrollWidth - innerWidth };
  });
  expect(geometry.paper).toBe("rgb(244, 245, 241)");
  expect(geometry.lines.flat().every(line => line.inside)).toBe(true);
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  if ((page.viewportSize()?.width ?? 0) > 1180) {
    expect(geometry.lines.every(line => line.length === 1 && line[0].font >= 56)).toBe(true);
    expect(new Set(geometry.lines.flat().map(line => Math.round(line.y))).size).toBe(3);
  }
  const controls = page.locator(".tl-part-controls button");
  await expect(controls).toHaveCount(4);
  for (const control of await controls.all()) {
    const box = await control.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44); expect(box!.height).toBeGreaterThanOrEqual(44);
    await control.click(); await expect(control).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#tl-inspection-hint output")).not.toBeEmpty();
    await control.click(); await expect(control).toHaveAttribute("aria-pressed", "false");
  }
  expect(await page.locator(".tl-part-plane").evaluate(node => !!node.querySelector("img") && !!node.querySelector(".tl-dimension-lines") && node.querySelectorAll(".tl-part-label").length === 5)).toBe(true);
  await info.attach("hero-current", { body: await page.locator(".tl-hero").screenshot(), contentType: "image/png" });
});

test("all landing bands have readable resting contrast and retained claims", async ({ page }, info) => {
  test.setTimeout(120_000);
  await gotoAndSettle(page, "/");
  await landingReady(page);
  const bands = page.locator("main > .tl-band");
  await expect(bands).toHaveCount(12);
  for (const band of await bands.all()) { await band.scrollIntoViewIfNeeded(); await page.waitForTimeout(220); }
  await expect.poll(() => page.locator(".tl-rfq-body > ol > li").evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === "1"))).toBe(true);
  expect(await page.locator(".tl-proof article").evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === "1"))).toBe(true);
  await expect(page.locator(".tl-proof article")).toHaveCount(6);
  const axe = await new AxeBuilder({ page }).analyze();
  const blockers = axe.violations.filter(item => ["serious", "critical"].includes(item.impact ?? ""));
  await info.attach("axe-current", { body: JSON.stringify(axe), contentType: "application/json" });
  expect(blockers.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target: node.target, failure: node.failureSummary })) }))).toEqual([]);
});

test("actual body glyphs use Plex, font failure remains readable", async ({ page }, info) => {
  await gotoAndSettle(page, "/"); await landingReady(page);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument");
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: ".tl-hero-support p" });
  const sample = "ĞğİıŞşÇçÖöÜü0123456789±µØ";
  await page.locator(".tl-hero-support p").evaluate((node, text) => { node.textContent = text; }, sample);
  await settleRendering(page);
  const painted = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
  expect(painted.fonts.reduce((sum, font) => sum + font.glyphCount, 0)).toBe(sample.length);
  expect(painted.fonts.every(font => font.isCustomFont && /PlexSans/i.test(font.postScriptName))).toBe(true);
  await info.attach("painted-glyphs", { body: JSON.stringify(painted), contentType: "application/json" });
  await cdp.detach();
  await page.route("**/*ibm-plex-sans*.woff2", route => route.abort("failed"));
  await page.reload(); await landingReady(page);
  await expect(page.locator(".tl-hero-support p")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.getByTestId("technical-hero-cta").focus(); await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/teklif-al$/); await expect(page.locator("main h1")).toBeVisible();
});

test("live reduced/native mode releases every scene consumer to its static end", async ({ page }) => {
  await gotoAndSettle(page, "/"); await landingReady(page);
  await page.locator(".tl-process-photo").scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByTestId("technical-landing-root")).toHaveAttribute("data-inspection-motion", "native");
  expect(await page.locator(".tl-part-plane").evaluate(node => [getComputedStyle(node).translate, getComputedStyle(node).scale])).toEqual(["none", "none"]);
  expect(await page.locator("[data-reverse-scroll-content]").evaluateAll(nodes => nodes.map(node => getComputedStyle(node).transform))).toEqual(["none", "none"]);
  expect(await page.locator(".tl-marquee-viewport").evaluate(node => getComputedStyle(node).transform)).toBe("none");
  await expect(page.locator(".tl-marquee-primary a")).toHaveCount(6);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByTestId("technical-landing-root")).toHaveAttribute("data-inspection-motion", "native");
  expect(await page.locator("[data-reverse-scroll-content]").evaluateAll(nodes => nodes.map(node => getComputedStyle(node).transform))).toEqual(["none", "none"]);
});

test("auth keeps its original shell and textual compact footer", async ({ page }) => {
  for (const path of ["/giris", "/sifremi-unuttum", "/reset-password"]) {
    await gotoAndSettle(page, path);
    await expect(page.locator(".shell-root.shell-auth")).toHaveCount(1);
    await expect(page.locator(".shell-auth.shell-inspection")).toHaveCount(0);
    await expect(page.locator(".shell-footer-compact img")).toHaveCount(0);
    await expect(page.locator(".shell-footer-compact")).toContainText("MAS TECHNIC");
  }
});

test("mobile hero RFQ arrow receives its own pointer while support remains keyboard-accessible", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await gotoAndSettle(page, "/"); await landingReady(page);
  const cta = page.getByTestId("technical-hero-cta");
  const launcher = page.locator("[data-chat-launcher]");
  expect(await cta.evaluate(link => {
    const rect = link.querySelector("svg")!.getBoundingClientRect();
    return link.contains(document.elementFromPoint(rect.right - 2, rect.top + rect.height / 2));
  }), "primary hero RFQ arrow must not be covered by support").toBe(true);
  await launcher.focus();
  await expect(launcher).toBeFocused();
  await expect.poll(() => launcher.evaluate(node => getComputedStyle(node).opacity)).toBe("1");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "MAS Technic sohbet asistanı" })).toBeVisible();
});
