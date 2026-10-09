import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { localizePath, normalizeLocale, stripLocale, switchLocalePath } from "../src/i18n/locale";
import { routeLinks } from "../src/lib/route-links";
import { normalizeOrigin } from "../src/lib/site-origin";
import { gotoAndSettle } from "./helpers";

/* L01 + SEO01 — the TR / EN public surface.

   Pure checks (desktop-1280 only): the English content overlays are complete
   and keep every number, the locale helpers map routes both ways, and the
   SEO address helpers never invent an origin.
   Browser checks: English routes render English, internal links stay in the
   locale, the switch opens the same record, and the language survives a hard
   refresh, back/forward, blocked storage, an old DE preference and a new tab. */

const pureOnly = ({ browserName }: { browserName: string }) =>
  browserName !== "chromium" || test.info().project.name !== "desktop-1280";

/* Turkish-only letters, minus proper names that legitimately keep them. */
const TURKISH = /[ğĞşŞıİçÇöÖüÜ]/;
const PROPER_NAMES = /(Çiğli|İzmir|İZMİR|Ataşehir|ÇİĞLİ|Mas Technic Makine Sanayi Ltd\. Şti\.|Türkçe|TEKNİK BALANS|AKON HİDROLİK|5\/2-ç)/g;

async function turkishText(page: Page): Promise<string[]> {
  const texts = await page.evaluate(() => {
    const out: string[] = [document.title];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|CODE)$/.test(parent.tagName)) continue;
      const text = node.textContent?.trim();
      if (text) out.push(text);
    }
    for (const element of document.querySelectorAll("[placeholder],[aria-label],img[alt]")) {
      for (const name of ["placeholder", "aria-label", "alt"]) {
        const value = element.getAttribute(name);
        if (value) out.push(value);
      }
    }
    return out;
  });
  return texts.filter((text) => TURKISH.test(text.replace(PROPER_NAMES, "")));
}

test.describe("L01 locale helpers and content (pure)", () => {
  test.skip(pureOnly, "data-only checks run in desktop-1280");

  test("English overlays are complete, shaped like the Turkish records and keep every number", () => {
    const out = join(mkdtempSync(join(tmpdir(), "l01-")), "locale-check.mjs");
    execFileSync("npx", [
      "esbuild", "scripts/quality/locale-check.ts", "--bundle", "--platform=node", "--format=esm",
      "--alias:@=./src", `--outfile=${out}`, "--loader:.webp=empty", "--loader:.png=empty",
      "--loader:.jpg=empty", "--loader:.svg=empty", "--log-level=error",
    ], { stdio: "pipe" });
    const report = execFileSync("node", [out], { encoding: "utf8" });
    expect(report).toContain("OK — overlays complete, numbers identical");
    // L3: the German bundle passes the same check, every section.
    const german = execFileSync("node", [out, "de"], { encoding: "utf8" });
    expect(german).toContain("services: 48/48 overlays");
    expect(german).toContain("materials: 87/87 overlays");
    expect(german).toContain("OK — overlays complete, numbers identical");
    // L4: and the Russian bundle.
    const russian = execFileSync("node", [out, "ru"], { encoding: "utf8" });
    expect(russian).toContain("services: 48/48 overlays");
    expect(russian).toContain("materials: 87/87 overlays");
    expect(russian).toContain("OK — overlays complete, numbers identical");
  });

  test("the German, Russian and Chinese interface dictionaries cover every key with the same placeholders and numbers", () => {
    const out = join(mkdtempSync(join(tmpdir(), "l3-")), "dictionary-check.mjs");
    execFileSync("npx", [
      "esbuild", "scripts/quality/dictionary-check.ts", "--bundle", "--platform=node", "--format=esm",
      "--alias:@=./src", `--outfile=${out}`, "--log-level=error",
    ], { stdio: "pipe" });
    for (const locale of ["de", "ru", "zh"]) {
      expect(execFileSync("node", [out, locale], { encoding: "utf8" })).toMatch(new RegExp(`^${locale}: \\d+ reference keys, 0 problem\\(s\\)`, "m"));
    }
  });

  test("locale paths map both ways and leave panel, files and externals alone", () => {
    expect(localizePath("/hizmetler/cnc-frezeleme", "en")).toBe("/en/hizmetler/cnc-frezeleme");
    expect(localizePath("/en/hizmetler/cnc-frezeleme", "tr")).toBe("/hizmetler/cnc-frezeleme");
    expect(localizePath("/", "en")).toBe("/en");
    expect(localizePath("/teklif-al?randevu#toplanti", "en")).toBe("/en/teklif-al?randevu#toplanti");
    expect(localizePath("/admin", "en")).toBe("/admin");
    expect(localizePath("/musteri-paneli/teklifler", "en")).toBe("/musteri-paneli/teklifler");
    expect(localizePath("/belgeler/kalite-politikasi.pdf", "en")).toBe("/belgeler/kalite-politikasi.pdf");
    expect(localizePath("https://example.com/x", "en")).toBe("https://example.com/x");
    expect(stripLocale("/en")).toBe("/");
    expect(switchLocalePath("/en/blog/dfm-tasarimdan-uretime-gecis", "?a=1", "#x", "tr")).toBe("/blog/dfm-tasarimdan-uretime-gecis?a=1#x");
    expect(normalizeLocale("de")).toBe("tr");
    expect(normalizeLocale("en")).toBe("en");
    expect(normalizeLocale(null)).toBe("tr");
  });

  test("canonical and hreflang follow the localised route; an origin is never guessed", () => {
    expect(normalizeOrigin(undefined)).toBeNull();
    expect(normalizeOrigin("http://example.com")).toBeNull();
    expect(normalizeOrigin("https://example.com/path")).toBeNull();
    expect(normalizeOrigin("https://example.com/")).toBe("https://example.com");
    const origin = "https://example.com";
    expect(routeLinks("/en/hizmetler/cnc-frezeleme/", origin)).toEqual({
      canonical: "https://example.com/en/hizmetler/cnc-frezeleme",
      tr: "https://example.com/hizmetler/cnc-frezeleme",
      en: "https://example.com/en/hizmetler/cnc-frezeleme",
    });
    expect(routeLinks("/", origin)).toEqual({
      canonical: "https://example.com/",
      tr: "https://example.com/",
      en: "https://example.com/en",
    });
  });

  test("a public build without an origin fails before bundling", () => {
    let failure = "";
    try {
      execFileSync("npx", ["vite", "build", "--outDir", mkdtempSync(join(tmpdir(), "seo01-"))], {
        env: { ...process.env, VITE_SITE_INDEXING: "public", VITE_SITE_ORIGIN: "" },
        stdio: "pipe",
        encoding: "utf8",
      });
    } catch (error) {
      failure = String((error as { stderr?: string }).stderr ?? error);
    }
    expect(failure).toContain("VITE_SITE_INDEXING=public requires VITE_SITE_ORIGIN");
  });
});

const EN_ROUTES = [
  "/en",
  "/en/hizmetler/cnc-frezeleme",
  "/en/kabiliyetler/malzeme-kutuphanesi",
  "/en/endustriyel/havacilik-uzay",
  "/en/hizmetler/kategori/talasli-imalat",
  "/en/endustriyel/kategori/enerji-altyapi",
  "/en/malzemeler",
  "/en/malzemeler/titanyum",
  "/en/blog",
  "/en/blog/havacilik-parcalarinda-malzeme-secimi",
  "/en/kabiliyet-profilleri",
  "/en/kabiliyet-profilleri/hassas-mil",
  "/en/kalite-dosyasi",
  "/en/sss",
  "/en/hakkimizda",
  "/en/iletisim",
  "/en/kvkk",
  "/en/gizlilik-politikasi",
  "/en/cerez-politikasi",
  "/en/teklif-al",
  "/en/giris",
  "/en/sifremi-unuttum",
  "/en/hizmetler/yok-boyle-bir-sayfa",
  "/en/yok-boyle-bir-adres",
];

test.describe("L01 English surface", () => {
  test.skip(({ browserName }) => browserName !== "chromium" || test.info().project.name !== "desktop-1280",
    "one desktop project walks the routes");
  test.setTimeout(240_000);

  test("English routes render no Turkish text and keep internal links in /en", async ({ page }) => {
    const problems: string[] = [];
    for (const route of EN_ROUTES) {
      await gotoAndSettle(page, route);
      /* The route loader is English too, but it is not the page: wait it out. */
      await expect(page.locator('.shell-boot [data-shell-state="loading"]'), route).toHaveCount(0, { timeout: 20_000 });
      await expect(page.locator("html"), route).toHaveAttribute("lang", "en");
      for (const text of await turkishText(page)) problems.push(`${route} · ${text.slice(0, 90)}`);
      const stray = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLAnchorElement>("a[href^='/']")]
          .map((a) => a.getAttribute("href") ?? "")
          .filter((href) => !href.startsWith("/en") && !/^\/(admin|musteri-paneli|belgeler)\b/.test(href)
            && !/\.[a-z0-9]{2,5}$/i.test(href.split(/[?#]/)[0])));
      for (const href of stray) problems.push(`${route} · link leaves /en: ${href}`);
    }
    expect(problems).toEqual([]);
  });
});

test.describe("L01 language switch and persistence", () => {
  test.skip(({ browserName, isMobile }) => browserName !== "chromium" || isMobile, "desktop chromium");

  test("direct EN, hard refresh, switch to the same record, back and forward", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoAndSettle(page, "/en/hizmetler/cnc-frezeleme");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toContainText("CNC Milling");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toContainText("CNC Milling");

    const header = page.locator(".lang-switch--header");
    await header.locator(".lang-dropdown-button").click();
    await header.locator('[role="option"][lang="tr"]').click();
    await expect(page).toHaveURL(/\/hizmetler\/cnc-frezeleme$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.locator("h1")).toContainText("CNC Frezeleme");

    await page.goBack();
    await expect(page).toHaveURL(/\/en\/hizmetler\/cnc-frezeleme$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toContainText("CNC Milling");

    await page.goForward();
    await expect(page).toHaveURL(/\/hizmetler\/cnc-frezeleme$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  });

  test("the address decides: an old DE preference, a new tab and a stored EN choice on a TR address", async ({ context, page }) => {
    await page.addInitScript(() => {
      try { if (!sessionStorage.getItem("seeded")) { localStorage.setItem("mas_lang", "de"); sessionStorage.setItem("seeded", "1"); } } catch { /* blocked */ }
    });
    await gotoAndSettle(page, "/");
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");

    await page.evaluate(() => localStorage.setItem("mas_lang", "en"));
    const tab = await context.newPage();
    await gotoAndSettle(tab, "/hakkimizda");
    await expect(tab.locator("html")).toHaveAttribute("lang", "tr");
    await expect(tab.locator("h1")).toContainText("Hakkımızda");
    await gotoAndSettle(tab, "/en/hakkimizda");
    await expect(tab.locator("html")).toHaveAttribute("lang", "en");
    await expect(tab.locator("h1")).toContainText("About Us");
    await tab.close();
  });

  test("storage blocked: English still renders and the switch still navigates", async ({ page }) => {
    await page.addInitScript(() => {
      const deny = () => { throw new DOMException("blocked", "SecurityError"); };
      Object.defineProperty(window, "localStorage", { get: deny, configurable: true });
      Object.defineProperty(window, "sessionStorage", { get: deny, configurable: true });
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoAndSettle(page, "/en/sss");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toContainText("Frequently Asked Questions");
    const header = page.locator(".lang-switch--header");
    await header.locator(".lang-dropdown-button").click();
    await header.locator('[role="option"][lang="tr"]').click();
    await expect(page).toHaveURL(/\/sss$/);
    await expect(page.locator("h1")).toContainText("Sıkça Sorulan Sorular");
  });
});

test.describe("SEO01 route metadata (preview build)", () => {
  test.skip(({ browserName }) => browserName !== "chromium" || test.info().project.name !== "desktop-1280",
    "one desktop project");

  test("title and description come from the route, in its language; preview is noindex without a canonical", async ({ page }) => {
    await gotoAndSettle(page, "/en/hizmetler/cnc-tornalama");
    await expect(page).toHaveTitle("CNC Turning | Mas Technic");
    const head = await page.evaluate(() => ({
      description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "",
      canonical: document.querySelectorAll('link[rel="canonical"]').length,
      alternates: document.querySelectorAll('link[rel="alternate"][hreflang]').length,
      ogLocale: document.querySelector('meta[property="og:locale"]')?.getAttribute("content"),
    }));
    expect(head.description).toMatch(/^Multi-axis turning centres/);
    expect(head.robots).toBe("noindex, nofollow");
    expect(head.canonical).toBe(0);
    expect(head.alternates).toBe(0);
    expect(head.ogLocale).toBe("en_GB");

    /* After SPA navigation the head follows the new route. */
    await page.locator('a[href="/en/hizmetler/cnc-frezeleme"]').first().click();
    await expect(page).toHaveURL(/\/en\/hizmetler\/cnc-frezeleme$/);
    await expect(page).toHaveTitle("CNC Milling | Mas Technic");

    /* After a wrong-family redirect the head is the destination's. */
    await gotoAndSettle(page, "/en/kabiliyetler/cnc-tornalama");
    await expect(page).toHaveURL(/\/en\/hizmetler\/cnc-tornalama$/);
    await expect(page).toHaveTitle("CNC Turning | Mas Technic");

    await gotoAndSettle(page, "/en/yok-boyle-bir-adres");
    await expect(page).toHaveTitle("Page not found | Mas Technic");
  });
});
