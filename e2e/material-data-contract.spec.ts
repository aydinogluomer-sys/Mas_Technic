import { expect, test } from "@playwright/test";
import { materialCategories, materialsData, type Material } from "../src/data/materialsData";
import { compareFigure, familyRanges, figure, UNVERIFIED_FIGURE } from "../src/components/pages/material-figures";
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
       It never reaches a build — production records all have `source: null`. */
    const base = materialsData.slice(0, 3);
    const sourced: Material = {
      ...base[1],
      id: "fixture-sourced",
      density: 99,
      source: { document: "TEST FIXTURE", checkedAt: "2026-10-02", reviewedBy: "test" },
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
