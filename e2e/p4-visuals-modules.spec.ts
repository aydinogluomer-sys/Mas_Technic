import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { JOURNAL_SCHEMAS, PILOT_SCHEMAS, PROFILE_SCHEMAS, SECTOR_SCHEMAS } from "../src/components/schemas/registry";
import { CATEGORY_MATRIX } from "../src/content/category-matrix";
import { DETAIL_VISUALS, SCHEMA_LABEL } from "../src/content/detail-visuals";
import { JOURNAL_MODULES, PROFILE_SUBJECTS } from "../src/content/journal-modules";
import { PILOT_MODULES } from "../src/content/pilot-modules";
import { RELATED } from "../src/content/related";
import { categoryPages } from "../src/data/categoryPages";
import { servicePages } from "../src/data/servicePages";
import { gotoAndSettle } from "./helpers";

/* Package 4 — IMG01 visual manifest, PAGE01 modules / related / matrix,
   UX05 journal and profile modules. Pure data checks plus a short render
   check. Reads source files only; writes nothing. */

const slugs = new Set(servicePages.map((page) => page.slug));
/* blogData imports image assets, so its slugs are read from source (the
   `slug:` key convention documented at the top of that file). */
const postSlugs = [...readFileSync("src/data/blogData.ts", "utf8").matchAll(/\bslug\s*:\s*["']([^"']+)["']/g)].map((match) => match[1]);
const PROFILES = ["ince-cidarli-govde", "titanyum-baglanti-parcasi", "hassas-mil"];

test.describe("package 4 contracts (pure)", () => {
  test.skip(({ browserName }) => browserName !== "chromium" || test.info().project.name !== "desktop-1280", "data-only checks run in desktop-1280");

  test("IMG01: every detail page has an explicit visual entry, and nothing else does", () => {
    expect(Object.keys(DETAIL_VISUALS).sort()).toEqual([...slugs].sort());
    const sectors = servicePages.filter((page) => page.category === "endustriyel");
    expect(sectors).toHaveLength(17);
    for (const page of sectors) expect(DETAIL_VISUALS[page.slug], page.slug).toBeDefined();
  });

  test("IMG01: schema keys exist, photo assets are mapped, sources are recorded", () => {
    const detail = readFileSync("src/pages/ServiceDetail.tsx", "utf8");
    const map = detail.slice(detail.indexOf("heroImageMap"), detail.indexOf("};", detail.indexOf("heroImageMap")));
    for (const [slug, visual] of Object.entries(DETAIL_VISUALS)) {
      expect(visual.subject.tr.length, slug).toBeGreaterThan(0);
      expect(visual.subject.en.length, slug).toBeGreaterThan(0);
      expect(visual.permissionRef.length, slug).toBeGreaterThan(0);
      if (visual.kind === "schema") {
        expect(SECTOR_SCHEMAS[visual.schema], slug).toBeDefined();
        expect(visual.sourceKind).toBe("code-schema");
      } else {
        expect(map, `${slug}: ${visual.asset} missing from heroImageMap`).toContain(`"${visual.asset}"`);
        expect(visual.sourceKind).toBe("repo-render");
      }
    }
  });

  test("IMG01: no photo repeats without a reason, none on more than two sector pages", () => {
    const uses = new Map<string, string[]>();
    for (const [slug, visual] of Object.entries(DETAIL_VISUALS)) {
      if (visual.kind !== "photo") continue;
      uses.set(visual.asset, [...(uses.get(visual.asset) ?? []), slug]);
    }
    for (const [asset, pages] of uses) {
      if (pages.length > 1) {
        for (const slug of pages) {
          const visual = DETAIL_VISUALS[slug];
          expect(visual.kind === "photo" && visual.shared, `${asset} on ${slug} needs a 'shared' reason`).toBeTruthy();
        }
      }
      const sectorUses = pages.filter((slug) => servicePages.find((page) => page.slug === slug)?.category === "endustriyel");
      expect(sectorUses.length, asset).toBeLessThanOrEqual(2);
    }
    const sectorSchemas = Object.entries(DETAIL_VISUALS).filter(
      ([slug, visual]) => visual.kind === "schema" && servicePages.find((page) => page.slug === slug)?.category === "endustriyel",
    );
    const keys = sectorSchemas.map(([, visual]) => (visual.kind === "schema" ? visual.schema : ""));
    expect(new Set(keys).size, "each sector schema is distinct").toBe(keys.length);
  });

  test("PAGE01: curated related links — at most four, real, never self", () => {
    expect(Object.keys(RELATED).sort()).toEqual([...slugs].sort());
    for (const [slug, list] of Object.entries(RELATED)) {
      expect(list.length, slug).toBeGreaterThan(0);
      expect(list.length, slug).toBeLessThanOrEqual(4);
      expect(new Set(list).size, slug).toBe(list.length);
      expect(list, slug).not.toContain(slug);
      for (const target of list) expect(slugs.has(target), `${slug} → ${target}`).toBe(true);
    }
  });

  test("PAGE01: seven pilot modules, each with its own drawing and three steps", () => {
    expect(Object.keys(PILOT_MODULES).sort()).toEqual(
      ["anodizasyon", "cnc-frezeleme", "cnc-tornalama", "derin-delik-raybalama", "fikstur-aparat-tasarimi", "kalite-kontrol", "tasarim-rehberi-dfm"],
    );
    const schemas = Object.values(PILOT_MODULES).map((module) => module.schema);
    expect(new Set(schemas).size).toBe(7);
    for (const [slug, module] of Object.entries(PILOT_MODULES)) {
      expect(slugs.has(slug)).toBe(true);
      expect(PILOT_SCHEMAS[module.schema], slug).toBeDefined();
      for (const part of [module.problem, module.process, module.control]) {
        expect(part.tr.length && part.en.length, slug).toBeTruthy();
      }
    }
  });

  test("PAGE01: decision matrix on all 15 category pages, no numeric threshold", () => {
    const keys = categoryPages.map((page) => `${page.prefix}/${page.slug}`).sort();
    expect(keys).toHaveLength(15);
    expect(Object.keys(CATEGORY_MATRIX).sort()).toEqual(keys);
    for (const [key, rows] of Object.entries(CATEGORY_MATRIX)) {
      expect(rows.length, key).toBeGreaterThan(1);
      for (const row of rows) {
        expect(slugs.has(row.slug), `${key} → ${row.slug}`).toBe(true);
        for (const text of [row.need.tr, row.need.en, row.next.tr, row.next.en]) {
          expect(text, `${key}: unapproved number`).not.toMatch(/\d+\s*(mm|µm|um|bar|°C|adet|pcs|%)/i);
        }
      }
    }
  });

  test("UX05: six journal modules with drawing, sources and real related records", () => {
    const posts = new Set(postSlugs);
    expect(posts.size).toBe(6);
    expect(Object.keys(JOURNAL_MODULES).sort()).toEqual([...posts].sort());
    for (const [slug, module] of Object.entries(JOURNAL_MODULES)) {
      expect(JOURNAL_SCHEMAS[slug as keyof typeof JOURNAL_SCHEMAS], slug).toBeDefined();
      expect(module.sources.length, slug).toBeGreaterThan(0);
      expect(module.table.rows.length, slug).toBeGreaterThan(0);
      for (const post of module.relatedPosts) {
        expect(posts.has(post), `${slug} → ${post}`).toBe(true);
        expect(post).not.toBe(slug);
      }
      for (const service of module.relatedServices) expect(slugs.has(service), `${slug} → ${service}`).toBe(true);
    }
    const cmm = JOURNAL_MODULES["kalite-kontrol-cmm-olcum"];
    expect(`${cmm.table.caption.tr} ${cmm.table.note?.tr ?? ""}`, "the CMM table is a demo, not a report").toMatch(/örnek|demo/i);
  });

  test("UX05: three capability profiles have three distinct drawings", () => {
    expect(Object.keys(PROFILE_SCHEMAS).sort()).toEqual([...PROFILES].sort());
    expect(Object.keys(PROFILE_SUBJECTS).sort()).toEqual([...PROFILES].sort());
    expect(new Set(Object.values(PROFILE_SCHEMAS)).size).toBe(3);
  });
});

test.describe("package 4 render", () => {
  test.skip(({ browserName }) => browserName !== "chromium" || test.info().project.name !== "desktop-1280", "render checks run in desktop-1280");

  test("sector page plate is a labelled schema, not a photo", async ({ page }) => {
    await gotoAndSettle(page, "/endustriyel/savunma-sanayi");
    const media = page.locator(".shell-schema-media svg[role='img']").first();
    await expect(media).toBeVisible();
    await expect(page.getByText(SCHEMA_LABEL.tr, { exact: false }).first()).toBeVisible();
  });

  test("pilot module sits right after the hero with problem / process / control", async ({ page }) => {
    await gotoAndSettle(page, "/hizmetler/cnc-frezeleme");
    const steps = page.locator(".shell-module-steps");
    await expect(steps).toBeVisible();
    await expect(steps.locator("dt")).toHaveCount(3);
    const related = page.getByRole("navigation", { name: "İlgili sayfalar" }).or(page.locator("[aria-label='İlgili sayfalar']")).first();
    await expect(related.locator("a")).toHaveCount(4);
  });

  test("category matrix and journal schema render; English variant is English", async ({ page }) => {
    await gotoAndSettle(page, "/hizmetler/kategori/yuzey-islemleri");
    await expect(page.locator("#kategori-karar")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "İhtiyaç" })).toBeVisible();
    await gotoAndSettle(page, "/en/blog/kalite-kontrol-cmm-olcum");
    await expect(page.locator("#yazi-sema")).toBeVisible();
    await expect(page.getByText(SCHEMA_LABEL.en, { exact: false }).first()).toBeVisible();
    await expect(page.locator(".shell-schema-figure svg").first()).toHaveAttribute("aria-label", /probing/i);
  });
});
