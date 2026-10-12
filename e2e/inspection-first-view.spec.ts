import { expect, test, type Page } from "@playwright/test";
import { gotoAndSettle } from "./helpers";

async function annotationReadability(page: Page) {
  const result = await page.locator(".tl-part-window").evaluate(window => {
    const bounds = window.getBoundingClientRect();
    const labels = [...window.querySelectorAll(".tl-part-label")].map(node => ({ text: node.textContent, rect: node.getBoundingClientRect() }));
    const clipped = labels.filter(({ rect: r }) => r.top < bounds.top - 1 || r.bottom > bounds.bottom + 1 || r.left < bounds.left - 1 || r.right > bounds.right + 1).map(label => label.text);
    const overlaps: string[] = [];
    labels.forEach((a, index) => labels.slice(index + 1).forEach(b => {
      if (Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left) > 1
        && Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top) > 1) overlaps.push(`${a.text} / ${b.text}`);
    }));
    const bore = window.querySelector(".tl-print--bore")!.getBoundingClientRect();
    const arrow = window.querySelector<SVGPathElement>(".tl-dim--bore")!;
    const marker = window.querySelector<SVGMarkerElement>("#tl-arrow")!;
    const svg = arrow.ownerSVGElement!, svgBounds = svg.getBoundingClientRect();
    const arrowDisplay = getComputedStyle(svg).display;
    const arrowRendered = arrowDisplay !== "none" && svgBounds.width > 0 && svgBounds.height > 0;
    let arrowHeadGap: number | null = null;
    if (arrowRendered) {
      const head = arrow.getPointAtLength(arrow.getTotalLength() - Number(marker.getAttribute("markerWidth")));
      arrowHeadGap = head.matrixTransform(arrow.getScreenCTM()!).y - bore.bottom;
    }
    return { count: labels.length, clipped, overlaps, arrowHeadGap, arrowRendered, arrowDisplay, viewportWidth: innerWidth };
  });
  expect(result.count).toBe(5);
  expect(result.clipped, "all printed measurements stay inside the aperture").toEqual([]);
  expect(result.overlaps, "printed measurement boxes do not overlap").toEqual([]);
  if (result.viewportWidth <= 767) expect(result.arrowDisplay).toBe("none");
  else expect(result.arrowRendered, "desktop arrow must remain rendered").toBe(true);
  if (result.arrowRendered) expect(result.arrowHeadGap, "bore value does not cover its arrowhead").toBeGreaterThanOrEqual(1);
}

test("actual initial hero viewport keeps the complete title below the fixed header", async ({ page, context }, info) => {
  await context.route("**/*", route => ["localhost", "127.0.0.1", "[::1]"].includes(new URL(route.request().url()).hostname)
    ? route.continue() : route.abort("blockedbyclient"));
  await gotoAndSettle(page, "/");
  const geometry = await page.evaluate(() => {
    const title = document.querySelector("main h1")!.getBoundingClientRect();
    const header = document.querySelector("#main-header")!.getBoundingClientRect();
    return { scrollY, titleTop: title.top, headerBottom: header.bottom, titleRight: title.right, width: innerWidth };
  });
  expect(geometry.scrollY, "capture is the genuine initial viewport, not a scrolled band").toBe(0);
  expect(geometry.titleTop).toBeGreaterThanOrEqual(geometry.headerBottom - 1);
  expect(geometry.titleRight).toBeLessThanOrEqual(geometry.width + 1);
  await expect(page.locator("main h1")).toBeVisible();
  await annotationReadability(page);
  await info.attach("actual-first-viewport", { body: await page.screenshot(), contentType: "image/png" });
  await info.attach("initial-header-title-geometry", { body: JSON.stringify(geometry), contentType: "application/json" });
});

test("printed labels stay inside their aperture through fine-pointer forward and reverse drift", async ({ page, context }) => {
  test.skip(!await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches), "fine-pointer drift only");
  await context.route("**/*", route => ["localhost", "127.0.0.1", "[::1]"].includes(new URL(route.request().url()).hostname)
    ? route.continue() : route.abort("blockedbyclient"));
  for (const [width, height] of [[769, 390], [769, 900], [1024, 768], [1440, 900]]) {
    await page.setViewportSize({ width, height });
    await gotoAndSettle(page, "/");
    for (const fraction of [.8, .15, .8]) {
      await page.evaluate(fraction => {
        const anchor = document.querySelector(".tl-part-stage")!.getBoundingClientRect();
        const y = scrollY + anchor.top - innerHeight * fraction;
        const lenis = (window as Window & { __lenis?: { scrollTo: (y: number, options: object) => void } }).__lenis;
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
      }, fraction);
      await page.waitForTimeout(250);
      await annotationReadability(page);
    }
  }
});
