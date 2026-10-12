import { expect, test } from "@playwright/test";
import { gotoAndSettle, landingReady } from "../helpers";

test.beforeEach(async ({ context, page }) => {
  await context.route("**/*", route => {
    const url = new URL(route.request().url());
    return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || ["blob:", "data:"].includes(url.protocol) ? route.continue() : route.abort("blockedbyclient");
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
});

test("visible scenes change real media properties forward and backward, native scenes stay still", async ({ page }, info) => {
  await gotoAndSettle(page, "/"); await landingReady(page);
  const fine = await page.evaluate(() => matchMedia("(min-width: 769px) and (hover: hover) and (pointer: fine)").matches);
  const scenes = [
    { anchor: ".tl-part-stage", node: ".tl-part-plane", property: "scale" },
    { anchor: ".tl-process-photo", node: ".tl-process-photo > [data-reverse-scroll]", property: "clip-path" },
    { anchor: ".tl-manifesto-body", node: ".tl-manifesto-body > [data-reverse-scroll]", property: "clip-path" },
  ];
  const readings = [];
  for (const scene of scenes) {
    const place = async (fraction: number) => {
      await page.evaluate(({ selector, fraction }) => {
        const anchor = document.querySelector(selector)!;
        const y = scrollY + anchor.getBoundingClientRect().top - innerHeight * fraction;
        const lenis = (window as Window & { __lenis?: { scrollTo: (y: number, options: object) => void } }).__lenis;
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
      }, { selector: scene.anchor, fraction });
      await page.waitForTimeout(220);
      return page.locator(scene.node).evaluate((node, property) => getComputedStyle(node).getPropertyValue(property), scene.property);
    };
    const before = await place(.8), forward = await place(.15), backward = await place(.8);
    if (fine) { expect(forward, scene.node).not.toBe(before); expect(backward, scene.node).toBe(before); }
    else expect([before, forward, backward], scene.node).toEqual(["none", "none", "none"]);
    readings.push({ scene, before, forward, backward, fine });
    await info.attach(`motion-${scene.property}-${scene.anchor}`, { body: await page.screenshot(), contentType: "image/png" });
  }
  await info.attach("computed-scene-directions", { body: JSON.stringify(readings), contentType: "application/json" });
  await page.locator(".tl-marquee-viewport").scrollIntoViewIfNeeded();
  if (fine) {
    const impulse = await page.evaluate(async () => {
      const node = document.querySelector<HTMLElement>(".tl-marquee-viewport")!;
      const lenis = (window as Window & { __lenis?: { scrollTo: (y: number, options: object) => void } }).__lenis;
      if (lenis) lenis.scrollTo(scrollY + 85, { force: true, immediate: true }); else window.scrollBy(0, 85);
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const matrix = new DOMMatrix(getComputedStyle(node).transform);
      return Math.atan(matrix.b) * 180 / Math.PI;
    });
    expect(Math.abs(impulse)).toBeGreaterThan(.001); expect(Math.abs(impulse)).toBeLessThanOrEqual(.701);
    await expect.poll(() => page.locator(".tl-marquee-viewport").evaluate(node => {
      const matrix = new DOMMatrix(getComputedStyle(node).transform); return Math.abs(matrix.b);
    })).toBeLessThan(.00001);
  } else expect(await page.locator(".tl-marquee-viewport").evaluate(node => getComputedStyle(node).transform)).toBe("none");
});

test("lazy scroll creation respects menu locks, live preferences and DOM visibility", async ({ page }, info) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let requested = false;
  await page.route("**/*lenis*.js", async route => { requested = true; await gate; await route.continue(); });
  await gotoAndSettle(page, "/"); await landingReady(page);
  const fine = await page.evaluate(() => matchMedia("(min-width: 769px) and (prefers-reduced-motion: no-preference)").matches);
  const state = () => page.evaluate(() => {
    const runtime = window as Window & { __lenis?: { isStopped: boolean }; __lenisMenuLock?: boolean };
    return { engine: !!runtime.__lenis, stopped: runtime.__lenis?.isStopped ?? true, locked: !!runtime.__lenisMenuLock, classes: [...document.documentElement.classList].filter(name => name.startsWith("lenis")) };
  });
  await page.getByRole("button", { name: "Menüyü aç", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  release();
  await page.waitForTimeout(250);
  expect((await state()).stopped).toBe(true); expect((await state()).locked).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect.poll(state).toEqual({ engine: false, stopped: true, locked: false, classes: [] });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  if (!fine) { expect((await state()).engine).toBe(false); return; }
  await page.keyboard.press("ArrowDown");
  await expect.poll(async () => (await state()).engine).toBe(true);
  await page.getByRole("button", { name: "Menüyü aç", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.evaluate(() => {
    const runtime = window as Window & { __lenis?: object; __inspectionEngine?: object };
    runtime.__inspectionEngine = runtime.__lenis;
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(180);
  expect(await page.evaluate(() => {
    const runtime = window as Window & { __lenis?: object; __inspectionEngine?: object }; return runtime.__lenis === runtime.__inspectionEngine;
  })).toBe(true);
  expect((await state()).stopped).toBe(true);
  await page.evaluate(() => { Reflect.deleteProperty(document, "hidden"); Reflect.deleteProperty(document, "visibilityState"); document.dispatchEvent(new Event("visibilitychange")); });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect.poll(state).toEqual({ engine: false, stopped: true, locked: false, classes: [] });
  await info.attach("lenis-lifecycle", { body: JSON.stringify({ chunkRequested: requested, visibility: "DOM visibility emulation; physical tab throttling not claimed", end: await state() }), contentType: "application/json" });
});
