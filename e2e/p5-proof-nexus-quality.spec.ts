import { readFileSync, statSync } from "node:fs";
import { expect, test } from "@playwright/test";
import {
  MEASURED_EVIDENCE,
  MEASURED_EVIDENCE_ENABLED,
  evidenceProblems,
  publishMeasuredEvidence,
  withinLimits,
  type MeasuredEvidence,
} from "../src/content/measured-evidence";
import { REFERENCE_LOGOS } from "../src/content/claims";
import { gotoAndSettle } from "./helpers";

/* Package 5 — PROOF01 (hero, measured-evidence contract, signature module),
   NEXUS01 (five-step demo) and UX03 (real quality documents, references).
   Reads source files only; writes nothing. */

/* A test-only fixture. It lives here so that no production module carries one. */
const FIXTURE: MeasuredEvidence = {
  sampleId: "TEST-COUPON-1",
  drawingRevision: "TEST-DWG rev A",
  featureId: "F1",
  feature: "Bore",
  nominal: 10,
  lowerLimit: 9.99,
  upperLimit: 10.01,
  unit: "mm",
  measuredValue: 10.004,
  method: "Bore gauge",
  device: "TEST-DEVICE-1",
  measurementDate: "2026-01-01",
  sourceDocument: "TEST-REPORT-1",
  permissionRef: "TEST-PERMISSION",
  technicalReviewer: "TEST-REVIEWER",
  verified: true,
};

const QUALITY_PDFS = [
  "kalite-politikasi.pdf",
  "olcum-ekipmanlari.pdf",
  "paketleme-kilavuzu.pdf",
  "tedarikci-davranis-kurallari.pdf",
];

test.describe("package 5 contracts (pure)", () => {
  test.skip(({ browserName }) => browserName !== "chromium" || test.info().project.name !== "desktop-1280", "data-only checks run in desktop-1280");

  test("PROOF01: measured panel is off and carries no record in production source", () => {
    expect(MEASURED_EVIDENCE_ENABLED).toBe(false);
    expect(MEASURED_EVIDENCE).toHaveLength(0);
    expect(publishMeasuredEvidence([FIXTURE])).toEqual([]);
  });

  test("PROOF01: the publish gate takes only complete, verified records and fills nothing", () => {
    expect(evidenceProblems(FIXTURE)).toEqual([]);
    expect(publishMeasuredEvidence([FIXTURE], true)).toEqual([FIXTURE]);
    for (const broken of [
      { ...FIXTURE, verified: false },
      { ...FIXTURE, permissionRef: "" },
      { ...FIXTURE, technicalReviewer: " " },
      { ...FIXTURE, drawingRevision: "" },
      { ...FIXTURE, measuredValue: Number.NaN },
      { ...FIXTURE, lowerLimit: 10.02 },
      { ...FIXTURE, measurementDate: "Ağustos 2026" },
      // E1: a date that does not exist, and one that has not happened yet.
      { ...FIXTURE, measurementDate: "2026-02-31" },
      { ...FIXTURE, measurementDate: "2999-01-01" },
      { ...FIXTURE, unit: "inch" as unknown as "mm" },
    ]) {
      expect(publishMeasuredEvidence([broken], true), JSON.stringify(broken)).toEqual([]);
    }
    expect(withinLimits(FIXTURE)).toBe(true);
    expect(withinLimits({ ...FIXTURE, measuredValue: 10.02 })).toBe(false);
  });

  test("PROOF01: capability profiles cannot hold measurements; no stored verdict anywhere", () => {
    const schema = readFileSync("src/content/caseStudies.ts", "utf8");
    expect(schema).toMatch(/kind: "capability";[\s\S]*?measuredResults\?: never;/);
    expect(schema).not.toMatch(/verdict/);
    for (const file of ["src/components/technical-landing/SignatureControl.tsx", "src/components/technical-landing/ProcessNexusProjects.tsx"]) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/["']UYGUN/);
    }
  });

  test("PROOF01: the hero lost the Ø 0.010 frame and the 1:2 scale label", () => {
    const hero = readFileSync("src/components/technical-landing/TechnicalHero.tsx", "utf8");
    expect(hero).not.toContain("tl-fcf-top");
    expect(hero).not.toContain("tl-dim--tol");
    expect(hero).not.toContain("ÖLÇEK 1:2");
    expect(hero).toContain("ŞEMATİK ÖN / YAN GÖRÜNÜŞ");
  });

  test("NEXUS01: no masked order, KPI or rate is left in the band's data", () => {
    const data = readFileSync("src/data/technicalLandingData.ts", "utf8");
    expect(data, "a masked value in a string literal").not.toMatch(/"[^"\n]*••/);
    expect(data).not.toMatch(/nexusKpis|nexusOrders/);
    expect(data).toMatch(/GERÇEK SİPARİŞ DEĞİLDİR/);
  });

  test("UX03: four real PDFs — magic bytes, measured size matches the ledger, one thumbnail each", () => {
    const ledger = readFileSync("src/content/claims.ts", "utf8");
    const manifest = readFileSync("src/content/quality-documents.ts", "utf8");
    for (const file of QUALITY_PDFS) {
      const bytes = readFileSync(`public/belgeler/${file}`);
      expect(bytes.subarray(0, 5).toString("latin1"), file).toBe("%PDF-");
      const kb = Math.round(bytes.length / 1024);
      expect(ledger, `${file} printed size`).toContain(`href: "/belgeler/${file}", size: "PDF · ${kb} KB"`);
      const thumb = `src/assets/belgeler/${file.replace(".pdf", ".webp")}`;
      expect(statSync(thumb).size, thumb).toBeGreaterThan(5000);
      expect(manifest).toContain(`"/belgeler/${file}"`);
    }
  });

  test("UX03: references stay names only — no logo files, no project claims", () => {
    for (const reference of REFERENCE_LOGOS) {
      expect(Object.keys(reference).filter((key) => key !== "name" && key !== "brand"), reference.name).toEqual([]);
    }
    const band = readFileSync("src/components/technical-landing/FinalSections.tsx", "utf8");
    const referenceBand = band.slice(band.indexOf("export function ReferenceBand"), band.indexOf("export function FaqSection"));
    expect(referenceBand).not.toMatch(/<img|\.svg|\.png|\.webp/);
  });
});

test.describe("package 5 render", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "render checks run in chromium");

  test("signature module: native toggle buttons change drawing and panel together", async ({ page }) => {
    await gotoAndSettle(page, "/");
    const controls = page.locator(".tl-signature-controls button");
    await expect(controls).toHaveCount(3);
    await expect(controls.nth(0)).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("Temsili geometri ve kontrol yaklaşımı; gerçek ölçüm sonucu değildir.")).toBeVisible();
    // All three panels are in the DOM before any choice.
    await expect(page.locator(".tl-signature-panels dl")).toHaveCount(3);
    await controls.nth(1).focus();
    await page.keyboard.press("Enter");
    await expect(controls.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(controls.nth(0)).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("#tl-signature-bore")).toBeVisible();
    await expect(page.locator("#tl-signature-datum")).toHaveClass(/tl-visually-hidden/);
    await expect(page.locator(".tl-signature-drawing circle.sch-accent")).toHaveCount(1);
    await expect(page.locator(".tl-signature")).not.toContainText(/\d+[.,]\d+\s*(mm|µm)/);
  });

  test("NEXUS demo: five steps, labels on every view, real RFQ and sign-in links", async ({ page }) => {
    await gotoAndSettle(page, "/");
    const steps = page.locator(".tl-nexus-rail button");
    await expect(steps).toHaveCount(5);
    await expect(page.getByTestId("nexus-demo-stamp")).toContainText("GERÇEK SİPARİŞ DEĞİLDİR");
    for (let index = 0; index < 5; index += 1) {
      await steps.nth(index).click();
      await expect(steps.nth(index)).toHaveAttribute("aria-pressed", "true");
      const visible = page.locator(".tl-nexus-step:not(.tl-visually-hidden)");
      await expect(visible).toHaveCount(1);
      await expect(visible).toContainText("DEMO");
      await expect(visible).toContainText("GERÇEK SİPARİŞ DEĞİLDİR");
    }
    await expect(page.locator(".tl-nexus a[download], .tl-nexus table")).toHaveCount(0);
    await expect(page.getByTestId("nexus-rfq")).toHaveAttribute("href", "/teklif-al");
    await expect(page.getByTestId("nexus-login")).toHaveAttribute("href", "/giris");
  });

  test("hero: no Ø 0.010 frame; passport drawing says schematic", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await expect(page.locator(".tl-fcf-top")).toHaveCount(0);
    await expect(page.locator(".tl-part-passport")).toContainText("ŞEMATİK ÖN / YAN GÖRÜNÜŞ");
  });

  test("quality file: four PDFs open as real PDFs; EN page labels them Turkish", async ({ page, request }) => {
    await gotoAndSettle(page, "/kalite-dosyasi");
    const cards = page.locator(".shell-qdoc");
    await expect(cards).toHaveCount(4);
    for (const file of QUALITY_PDFS) {
      const response = await request.get(`/belgeler/${file}`);
      expect(response.status(), file).toBe(200);
      expect((await response.body()).subarray(0, 5).toString("latin1"), file).toBe("%PDF-");
      await expect(page.locator(`.shell-qdoc a[href="/belgeler/${file}"][download]`)).toHaveCount(1);
    }
    await gotoAndSettle(page, "/en/kalite-dosyasi");
    await expect(page.locator(".shell-qdoc").first()).toContainText("Turkish");
    await expect(page.locator(".shell-qdoc img").first()).toHaveAttribute("alt", /first page/);
  });
});
