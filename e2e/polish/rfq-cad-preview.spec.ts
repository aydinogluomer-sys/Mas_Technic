import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import { gotoAndSettle } from "../helpers";

/* Round 2, items 6 + 19 — the quote studio's upload step and its 3D preview,
   exercised in a real browser. No request leaves the machine: every
   non-loopback request is aborted, so nothing reaches Supabase. The full
   submit pipeline (upload → function → reference) is covered with a sealed
   network by e2e/qa-p09a-rfq-form.spec.ts. */

const CUBE_STL = Buffer.from(`solid cube
${[
  [[0,0,0],[10,0,0],[10,10,0]],[[0,0,0],[10,10,0],[0,10,0]],
  [[0,0,20],[10,10,20],[10,0,20]],[[0,0,20],[0,10,20],[10,10,20]],
  [[0,0,0],[0,0,20],[10,0,20]],[[0,0,0],[10,0,20],[10,0,0]],
  [[0,10,0],[10,10,20],[0,10,20]],[[0,10,0],[10,10,0],[10,10,20]],
  [[0,0,0],[0,10,20],[0,0,20]],[[0,0,0],[0,10,0],[0,10,20]],
  [[10,0,0],[10,0,20],[10,10,20]],[[10,0,0],[10,10,20],[10,10,0]],
].map((t) => `facet normal 0 0 0\n outer loop\n${t.map((v) => `  vertex ${v.join(" ")}`).join("\n")}\n endloop\nendfacet`).join("\n")}
endsolid cube
`);

const CUBE_OBJ = Buffer.from(`v 0 0 0
v 30 0 0
v 30 30 0
v 0 30 0
v 0 0 5
v 30 0 5
v 30 30 5
v 0 30 5
f 1 2 3 4
f 5 8 7 6
f 1 5 6 2
f 2 6 7 3
f 3 7 8 4
f 4 8 5 1
`);

const STEP = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "fixtures", "cad", "sample-cube.stp"));

async function seal(page: Page) {
  await page.route("**/*", (route) => {
    const host = new URL(route.request().url()).hostname;
    if (["localhost", "127.0.0.1"].includes(host) || route.request().url().startsWith("data:")) return route.continue();
    // fonts may load from Google; everything else (Supabase) is refused
    if (host.endsWith("googleapis.com") || host.endsWith("gstatic.com")) return route.continue();
    return route.abort();
  });
}

async function openPreview(page: Page, name: string, mimeType: string, buffer: Buffer) {
  await page.locator("#rfq-cad").setInputFiles({ name, mimeType, buffer });
  await page.getByRole("button", { name: "3B önizlemeyi aç" }).click();
  const plate = page.locator(".shell-plate").filter({ hasText: "PLAKA 3B" });
  await expect(plate.locator("canvas")).toBeVisible({ timeout: 30_000 });
  await expect(plate).toContainText(/X [\d.,]+ · Y [\d.,]+ · Z [\d.,]+ mm/, { timeout: 60_000 });
  return plate;
}

test.describe("quote studio — upload step and 3D preview", () => {
  test.skip(({ isMobile }) => isMobile, "WebGL preview measured on desktop");
  test.setTimeout(180_000);

  test.beforeEach(async ({ page }) => {
    await seal(page);
    await gotoAndSettle(page, "/teklif-al");
  });

  test("the studio has no site footer and keeps its three steps", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Üretim Teklifi İsteyin" })).toBeVisible();
    await expect(page.locator("footer.tl-footer")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Teklif adımları" }).getByRole("button")).toHaveCount(3);
  });

  test("a wrong file type is refused with a persistent error", async ({ page }) => {
    await page.locator("#rfq-cad").setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("x") });
    await expect(page.locator("div.shell-notice[data-tone='error']")).toBeVisible();
  });

  test("next without a file asks for one, and stays on step 1", async ({ page }) => {
    await page.locator("form button[type='submit']").click();
    await expect(page.locator("div.shell-notice[data-tone='error']")).toBeVisible();
    await expect(page.getByRole("button", { name: /01 DOSYALAR/ })).toHaveAttribute("aria-current", "step");
  });

  test("STL renders and reports its bounding box", async ({ page }) => {
    const plate = await openPreview(page, "cube.stl", "model/stl", CUBE_STL);
    await expect(plate).toContainText("X 10");
  });

  test("OBJ renders and reports its bounding box", async ({ page }) => {
    const plate = await openPreview(page, "plate.obj", "model/obj", CUBE_OBJ);
    await expect(plate).toContainText("X 30");
  });

  test("STEP is tessellated in the browser and renders", async ({ page }) => {
    await openPreview(page, "cube.stp", "model/step", STEP);
  });

  test("IGES is accepted for quoting but says it has no browser preview", async ({ page }) => {
    await page.locator("#rfq-cad").setInputFiles({ name: "part.igs", mimeType: "model/iges", buffer: Buffer.from("S      1\n") });
    await expect(page.getByText("ÖNİZLEME YOK")).toBeVisible();
  });

  test("step 2 validates required fields and step 3 shows the review", async ({ page }) => {
    await page.locator("#rfq-cad").setInputFiles({ name: "cube.stl", mimeType: "model/stl", buffer: CUBE_STL });
    await page.locator("form button[type='submit']").click();
    await expect(page.locator("#rfq-name")).toBeVisible();
    await page.locator("form button[type='submit']").click();
    await expect(page.locator("#rfq-email-error")).toBeVisible();
    await page.locator("#rfq-name").fill("Test Kullanıcı");
    await page.locator("#rfq-company").fill("Test Makina");
    await page.locator("#rfq-email").fill("test@example.com");
    // RFQ03: quantity starts empty — nothing is pre-chosen.
    await page.locator("#rfq-quantity").fill("10");
    await page.locator("form button[type='submit']").click();
    await expect(page.locator("form button[type='submit']")).toHaveText(/Teklif talebini gönder/);
  });
});
