import { expect, test } from "@playwright/test";
import { materialCategories, materialsData, type Material } from "../src/data/materialsData";
import { compareFigure, familyRanges, figure, hardness, isSourced, UNVERIFIED_FIGURE } from "../src/components/pages/material-figures";
import { gotoAndSettle } from "./helpers";

/* T03 — material data sourcing.
   A record without `source` publishes no numeric property: the reader sees
   "Veri doğrulanmadı", sorts put it last, ranges ignore it. The undocumented
   1–5 scores and the price band are not rendered anywhere public. */

test.describe("material data contract (pure)", () => {
  test.skip(({ browserName }) => browserName !== "chromium" || test.info().project.name !== "desktop-1280",
    "data-only checks run in desktop-1280");

  test("every record carries grade/temper, product form, source and conditions", () => {
    expect(materialsData.length).toBeGreaterThan(0);
    for (const material of materialsData) {
      expect(material, material.id).toHaveProperty("gradeTemper");
      expect(material, material.id).toHaveProperty("productForm");
      expect(material, material.id).toHaveProperty("source");
      expect(material.propertyConditions.length, material.id).toBeGreaterThan(10);
    }
    for (const family of materialCategories) {
      expect(materialsData.some((m) => m.subcategory === family.subcategoryKey), family.slug).toBe(true);
    }
  });

  test("E1: sourced properties carry a complete, checkable provenance", () => {
    const sourced = materialsData.filter((m) => m.propertySources);
    // The priority set: the 11 records marked popular on /malzemeler.
    expect(sourced.map((m) => m.id).sort()).toEqual(materialsData.filter((m) => m.isPopular).map((m) => m.id).sort());
    for (const material of sourced) {
      for (const [key, item] of Object.entries(material.propertySources!)) {
        const at = `${material.id}.${key}`;
        expect(item!.document.length, at).toBeGreaterThan(5);
        expect(item!.publisher.length, at).toBeGreaterThan(2);
        expect(item!.url, at).toMatch(/^https:\/\//);
        expect(item!.locator.length, at).toBeGreaterThan(3);
        expect(item!.condition.length, at).toBeGreaterThan(3);
        expect(item!.checkedAt, at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  test("E1: a record can publish some properties and leave others unverified", () => {
    const ss304 = materialsData.find((m) => m.id === "ss-304")!;
    expect(figure(ss304, "density", "g/cm³")).toBe("7.9 g/cm³");
    expect(figure(ss304, "tensileStrength", "MPa")).toBe("540–750 MPa"); // a range reads as a range
    expect(hardness(ss304)).toBe(UNVERIFIED_FIGURE); // the datasheet gives no hardness
    expect(figure(ss304, "maxTemperature")).toBe(UNVERIFIED_FIGURE);
    expect(isSourced(ss304, "density")).toBe(true);
    expect(isSourced(ss304, "hardness")).toBe(false);
    const ti = materialsData.find((m) => m.id === "ti-grade5")!;
    expect(figure(ti, "tensileStrength")).toBe("≥ 895 (min.)"); // a minimum is not shown as typical
    // Ranges are per property: stainless has a sourced density but no sourced temperature.
    const stainless = materialsData.filter((m) => m.subcategory === "stainless");
    const ranges = Object.fromEntries(familyRanges(stainless).map((row) => [row.label, row.value]));
    expect(ranges["Yoğunluk"]).not.toBe(UNVERIFIED_FIGURE);
    expect(ranges["Maks. sıcaklık"]).toBe(UNVERIFIED_FIGURE);
  });

  test("composites state fibre direction, polymers state conditioning", () => {
    for (const material of materialsData.filter((m) => m.subcategory === "composite")) {
      expect(material.propertyConditions, material.id).toMatch(/[Ee]lyaf doğrultusunda/);
    }
    for (const material of materialsData.filter((m) => m.category === "plastic")) {
      expect(material.propertyConditions, material.id).toMatch(/23 °C/);
    }
  });

  test("an unsourced figure prints the label, sorts last and never enters a range", () => {
    /* Test-only fixture: one invented source so the ordering can be observed.
       It never reaches a build. The base rows are records with NO sourced
       property (E1 sourced the popular ones per property). */
    const base = materialsData.filter((m) => !isSourced(m)).slice(0, 3);
    const sourced: Material = {
      ...base[1],
      id: "fixture-sourced",
      density: 99,
      source: { document: "TEST FIXTURE", checkedAt: "2026-10-02", reviewedBy: "test" },
      propertySources: undefined,
    };
    const set = [base[0], sourced, base[2]];
    expect(figure(base[0], "density")).toBe(UNVERIFIED_FIGURE);
    expect(figure(sourced, "density", "g/cm³")).toBe("99 g/cm³");
    expect([...set].sort(compareFigure("density", "asc"))[0].id).toBe("fixture-sourced");
    expect([...set].sort(compareFigure("density", "desc"))[0].id).toBe("fixture-sourced");
    expect(familyRanges([base[0], base[2]]).every((row) => row.value === UNVERIFIED_FIGURE)).toBe(true);
    expect(familyRanges(set)[0].value).toBe("99.00 g/cm³");
  });
});

test.describe("material pages (browser)", () => {
  test("/malzemeler register shows no score or price column and labels unsourced figures", async ({ page }) => {
    await gotoAndSettle(page, "/malzemeler");
    const register = page.locator("#kayit figure.shell-register");
    const headers = (await register.locator("thead th").allInnerTexts()).map((text) => text.trim());
    expect(headers.join("|")).not.toMatch(/İşlenebilirlik|Fiyat/i);
    await expect(register.locator("tbody td[data-unverified]").first()).toHaveText(UNVERIFIED_FIGURE);
    // E1: a sourced row's detail names its datasheet as a link, per property.
    const row = register.locator("tbody tr", { hasText: "Alüminyum 6061-T6" }).first();
    await row.getByRole("button", { name: "Ayrıntı" }).click();
    const sources = page.locator(".shell-detail-sources");
    await expect(sources.getByRole("link", { name: /Kaiser Aluminum — Rod & Bar Alloy 6061/ }).first()).toHaveAttribute("href", /kaiseraluminum\.com/);
    await row.getByRole("button", { name: "Kapat" }).click();
    await expect(page.locator(".shell-gauge")).toHaveCount(0);
    const body = await page.locator("main").innerText();
    expect(body).not.toMatch(/EKONOMİK|PREMİUM|\b[1-5]\/5\b/);

    const sortLabels = await page.locator("#malzeme-sirala option").allInnerTexts();
    expect(sortLabels.join("|")).not.toMatch(/İşlenebilirlik|Fiyat/i);

    const selectors = register.getByRole("checkbox");
    test.skip((await selectors.count()) < 2, "no selection checkboxes at this viewport");
    await selectors.nth(0).check();
    await selectors.nth(1).check();
    const compare = page.locator(".shell-compare");
    await expect(compare.getByRole("rowheader", { name: "Değer koşulu" })).toBeVisible();
    await expect(compare.getByRole("rowheader", { name: "Kaynak" })).toBeVisible();
    await expect(compare.getByRole("rowheader", { name: /İşlenebilirlik|Korozyon|Fiyat/ })).toHaveCount(0);
  });

  test("family pages read ranges only from sourced rows and state conditions", async ({ page }) => {
    await gotoAndSettle(page, "/malzemeler/aluminyum");
    const hero = await page.locator("main").innerText();
    expect(hero).toContain(UNVERIFIED_FIGURE);
    expect(hero).not.toMatch(/\/ 5\b/);
    await gotoAndSettle(page, "/malzemeler/kompozitler");
    await expect(page.getByText(/Elyaf doğrultusunda/).first()).toBeVisible();
  });
});
