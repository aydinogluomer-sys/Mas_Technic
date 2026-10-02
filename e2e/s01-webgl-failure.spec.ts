import { expect, test, type Page } from "@playwright/test";
import { gotoAndSettle } from "./helpers";

/* S01 — WebGL failure probe on the only production WebGL surface: the RFQ CAD
   preview on /teklif-al (loaded on user request; MaterialMorphScroll was
   Canvas2D and is no longer mounted). Two failures:

     A. no WebGL at all (getContext returns null for every WebGL flavour)
     B. the context is lost after the model has rendered

   Contract checked: the page never blanks, the file stays in the form and the
   request can still move to step 2. What the preview itself shows is recorded
   as an attachment — that is evidence, not a design judgement. */

const CUBE_STL = Buffer.from(`solid cube
facet normal 0 0 0
 outer loop
  vertex 0 0 0
  vertex 10 0 0
  vertex 10 10 0
 endloop
endfacet
facet normal 0 0 0
 outer loop
  vertex 0 0 0
  vertex 10 10 0
  vertex 0 0 10
 endloop
endfacet
endsolid cube
`);

async function seal(page: Page) {
  await page.route("**/*", (route) => {
    const host = new URL(route.request().url()).hostname;
    if (["localhost", "127.0.0.1"].includes(host) || route.request().url().startsWith("data:")) return route.continue();
    if (host.endsWith("googleapis.com") || host.endsWith("gstatic.com")) return route.continue();
    return route.abort();
  });
}

async function expectFormSurvives(page: Page) {
  await expect(page.locator("#root")).not.toBeEmpty();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.locator("form button[type='submit']").click();
  await expect(page.getByRole("button", { name: /02/ }).first()).toHaveAttribute("aria-current", "step");
}

test.describe("S01 WebGL failure probe — /teklif-al CAD preview", () => {
  test.skip(({ isMobile }) => isMobile, "probe runs on desktop");
  test.skip(({ browserName }) => browserName !== "chromium" || test.info().project.name !== "desktop-1280", "probe runs once, in desktop-1280");
  test.setTimeout(120_000);

  test("A: WebGL unavailable — form keeps working", async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function patched(this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (/webgl/i.test(type)) return null;
        return (original as (...args: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof HTMLCanvasElement.prototype.getContext;
    });
    await seal(page);
    await gotoAndSettle(page, "/teklif-al");
    await page.locator("#rfq-cad").setInputFiles({ name: "cube.stl", mimeType: "model/stl", buffer: CUBE_STL });
    await page.getByRole("button", { name: "3B önizlemeyi aç" }).click();
    await page.waitForTimeout(5000);
    const shown = await page.locator("main").innerText();
    await testInfo.attach("webgl-unavailable.txt", {
      body: JSON.stringify({ pageErrors, noticeExcerpt: shown.slice(0, 1500) }, null, 2),
      contentType: "text/plain",
    });
    await testInfo.attach("webgl-unavailable.png", { body: await page.screenshot(), contentType: "image/png" });
    await expectFormSurvives(page);
  });

  test("B: context lost after render — form keeps working", async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));
    await seal(page);
    await gotoAndSettle(page, "/teklif-al");
    await page.locator("#rfq-cad").setInputFiles({ name: "cube.stl", mimeType: "model/stl", buffer: CUBE_STL });
    await page.getByRole("button", { name: "3B önizlemeyi aç" }).click();
    const canvas = page.locator(".shell-plate canvas");
    const rendered = await canvas.waitFor({ state: "visible", timeout: 30_000 }).then(() => true, () => false);
    test.skip(!rendered, "this browser build could not create a WebGL context; scenario A covers it");
    const lost = await canvas.evaluate((element: HTMLCanvasElement) => {
      const gl = (element.getContext("webgl2") ?? element.getContext("webgl")) as WebGLRenderingContext | null;
      const extension = gl?.getExtension("WEBGL_lose_context");
      extension?.loseContext();
      return Boolean(extension);
    });
    await page.waitForTimeout(2000);
    await testInfo.attach("webgl-context-lost.txt", {
      body: JSON.stringify({ loseContextExtension: lost, pageErrors, mainExcerpt: (await page.locator("main").innerText()).slice(0, 1500) }, null, 2),
      contentType: "text/plain",
    });
    await testInfo.attach("webgl-context-lost.png", { body: await page.screenshot(), contentType: "image/png" });
    await expectFormSurvives(page);
  });
});
