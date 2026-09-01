import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { categoryPages } from "../src/data/categoryPages";
import { materialCategories } from "../src/data/materialsData";
import { servicePages } from "../src/data/servicePages";
import {
  expectLocatorUnobscured,
  fullScrollToBottom,
  gotoAndSettle,
  isReducedMotionAuditViewport,
} from "./helpers";

const SHELL_MATRIX = new Set([
  "mobile-320",
  "mobile-375",
  "mobile-390",
  "tablet-768",
  "landscape-844",
  "desktop-1280",
  "desktop-1440-short",
  "desktop-1440",
]);

/**
 * Paylaşılan kabuğu (`[data-fullscreen-header]` + paylaşılan `Footer`) basan
 * rotalar.
 *
 * `/` ARTIK BU LİSTEDE. Faz 01 bu satırı bilerek `OWN_SHELL_ROUTES` istisnası
 * olarak yazmıştı: üretim ana sayfası paylaşılan header'ı hiç mount etmiyordu,
 * bu yüzden `/`'ın header sayısı 0'dı ve istisna "Faz 03 bunu düzelttiğinde
 * kırmızıya dönsün" diye konmuştu (`reports/baseline/known-blockers.md` B14).
 * Faz 03 tek bir global navigasyon kurdu ve `/` de onu basıyor, dolayısıyla
 * istisna amacına ulaşıp kalktı.
 *
 * SAYIM DEĞİŞİMİ — kaydedilmiştir: tam kabuk 88 → 89 (yalnız `/` eklendi),
 * toplam halka açık yüzey 94 → 94 (`/` istisna kümesinden tam kabuk kümesine
 * TAŞINDI, yeni bir rota eklenmedi). Landing'in footer'ı hâlâ kendi antet
 * bloğudur; sözleşme header sahipliğini ölçer, footer tasarımını değil.
 *
 * `/test` listede değil: dev-only rotalar üretim derlemesinde yayınlanmaz.
 */
const STATIC_FULL_SHELL_ROUTES = [
  "/",
  "/sss",
  "/gizlilik-politikasi",
  "/kvkk",
  "/cerez-politikasi",
  "/hakkimizda",
  "/iletisim",
  "/malzemeler",
  "/blog",
  /* FAZ 04 — `/teklif-al` TAM KABUĞA KATILDI.
     `src/pages/TeklifAl.tsx:54` `Footer`'ı import ediyor ama HİÇBİR yerde
     render etmiyordu; sitenin birincil dönüşüm sayfasının footer'ı, yasal
     bağlantısı ve ikincil navigasyonu yoktu — görsel olarak da doğrulanmıştı
     (`reports/baseline/visual/teklif-al-1440.png`). `PageShell` ile artık her
     rota gibi tek kabuğu basıyor, dolayısıyla istisna değil sözleşme. */
  "/teklif-al",
] as const;

/**
 * Paylaşılan header'ı VE footer'ı basmayan halka açık yüzeyler.
 *
 * `/` Faz 03'te, `/teklif-al` Faz 04'te bu kümeden çıktı. Geriye yalnızca
 * kimlik akışı ve onun yönlendirme takma adı kaldı. Onlar da Faz 04'te
 * `PageShell` İÇİNDE render ediliyor — kök, sayfa tabakası, token'lar, odak
 * halkası ve `<main id="main-content">` (ki hiçbirinde yoktu, bu yüzden global
 * atlama bağlantısının hedefi de yoktu) — fakat `navigation={false}
 * footer={false}` ile: bir kimlik doğrulama adımı görevin ortasında menü ve
 * çıkış listesi sunmamalı. Bu küme TOPLAM sayımın 94'te kalmasını kanıtlar.
 */
const NON_SHELL_PUBLIC_ROUTES = [
  "/giris",
  "/sifremi-unuttum",
  "/reset-password",
  "/cad-dashboard",
] as const;

const APP_SOURCE = readFileSync(resolve(process.cwd(), "src/App.tsx"), "utf8");
const PANEL_ROUTES_SOURCE = APP_SOURCE.slice(
  APP_SOURCE.indexOf("const panelRoutes ="),
  APP_SOURCE.indexOf("const publicRoutes ="),
);
const RAW_PUBLIC_ROUTES_SOURCE = APP_SOURCE.slice(
  APP_SOURCE.indexOf("const publicRoutes ="),
  APP_SOURCE.indexOf("return isPanel ? panelRoutes : publicRoutes;"),
);
// Dev-only blok üretim rota sayımından ayrı tutulur: `import.meta.env.DEV`
// yanlışken `DevRoute` null olur ve bu üç <Route> hiç oluşturulmaz.
const DEV_ROUTES_SOURCE = RAW_PUBLIC_ROUTES_SOURCE.slice(
  RAW_PUBLIC_ROUTES_SOURCE.indexOf("DEV_ONLY_ROUTES:START"),
  RAW_PUBLIC_ROUTES_SOURCE.indexOf("DEV_ONLY_ROUTES:END"),
);
const PUBLIC_ROUTES_SOURCE = RAW_PUBLIC_ROUTES_SOURCE.replace(DEV_ROUTES_SOURCE, "");
const APP_PANEL_ROUTE_PATTERNS = [...PANEL_ROUTES_SOURCE.matchAll(/<Route\s+path="([^"]+)"/g)]
  .map((match) => match[1]);
const APP_PUBLIC_ROUTE_PATTERNS = [...PUBLIC_ROUTES_SOURCE.matchAll(/<Route\s+path="([^"]+)"/g)]
  .map((match) => match[1]);
const APP_DEV_ROUTE_PATTERNS = [...DEV_ROUTES_SOURCE.matchAll(/<Route\s+path="([^"]+)"/g)]
  .map((match) => match[1]);
const EXPECTED_DEV_ROUTE_PATTERNS = ["/technical-preview", "/legacy-landing", "/test"] as const;
const EXPECTED_PANEL_ROUTE_PATTERNS = ["/admin/login", "/admin", "/musteri-paneli", "*"] as const;
const EXPECTED_PUBLIC_ROUTE_PATTERNS = [
  "/",
  "/sss",
  "/gizlilik-politikasi",
  "/kvkk",
  "/cerez-politikasi",
  "/hakkimizda",
  "/iletisim",
  "/malzemeler",
  "/malzemeler/:slug",
  "/blog",
  "/blog/:slug",
  "/hizmetler/kategori/:slug",
  "/kabiliyetler/kategori/:slug",
  "/endustriyel/kategori/:slug",
  "/hizmetler/:slug",
  "/kabiliyetler/:slug",
  "/endustriyel/:slug",
  "/giris",
  "/sifremi-unuttum",
  "/reset-password",
  "/teklif-al",
  "/cad-dashboard",
  "*",
] as const;

const blogSource = readFileSync(resolve(process.cwd(), "src/data/blogData.ts"), "utf8");
const BLOG_SLUGS = [...blogSource.matchAll(/\bslug\s*:\s*["']([^"']+)["']/g)].map((match) => match[1]);
const CATEGORY_ROUTES = categoryPages.map((item) => `/${item.prefix}/kategori/${item.slug}`);
const SERVICE_ROUTES = servicePages.map((item) => `/${item.category}/${item.slug}`);
const MATERIAL_ROUTES = materialCategories.map((item) => `/malzemeler/${item.slug}`);
const BLOG_ROUTES = BLOG_SLUGS.map((slug) => `/blog/${slug}`);
const FULL_SHELL_ROUTES = [
  ...STATIC_FULL_SHELL_ROUTES,
  ...CATEGORY_ROUTES,
  ...SERVICE_ROUTES,
  ...MATERIAL_ROUTES,
  ...BLOG_ROUTES,
];

const FOOTER_SEQUENTIAL_SELECTOR = [
  'a[href]:visible',
  'button:not([disabled]):not([aria-label="YukarÄ± Ã§Ä±k"]):visible',
  '[tabindex]:not([tabindex="-1"]):visible',
].join(",");

const LOCAL_ORIGIN = new URL(
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${process.env.PLAYWRIGHT_PORT ?? "4173"}`,
).origin;
const FONT_STYLESHEET_URL = "https://fonts.googleapis.com/css2";
const FAQ_ANALYTICS_URL = "https://zdqiujpeewtyhtcqhdcj.supabase.co/rest/v1/faq_analytics";

function isKnownExternalTestRequest(rawUrl: string) {
  const url = new URL(rawUrl);
  return (url.origin + url.pathname === FONT_STYLESHEET_URL)
    || (url.origin + url.pathname === FAQ_ANALYTICS_URL);
}

async function expandFooterDisclosures(page: Page) {
  const disclosures = page.getByRole("contentinfo").locator('h2 > button[aria-controls]:visible');
  for (const disclosure of await disclosures.all()) {
    if (await disclosure.getAttribute("aria-expanded") === "false") await disclosure.click();
  }
}

async function footerLayoutAudit(page: Page) {
  return page.getByRole("contentinfo").evaluate((footer) => {
    const candidates = [...footer.querySelectorAll<HTMLElement>("a[href],button,h2,h3,p,address")]
      .filter((element) => {
        const style = getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
      });
    const clipped = candidates.flatMap((element) => {
      const rect = element.getBoundingClientRect();
      let ancestor = element.parentElement;
      while (ancestor && ancestor !== footer.parentElement) {
        const style = getComputedStyle(ancestor);
        const ancestorRect = ancestor.getBoundingClientRect();
        const clipsX = ["hidden", "clip"].includes(style.overflowX)
          && (rect.left < ancestorRect.left - 1 || rect.right > ancestorRect.right + 1);
        const clipsY = ["hidden", "clip"].includes(style.overflowY)
          && (rect.top < ancestorRect.top - 1 || rect.bottom > ancestorRect.bottom + 1);
        if (clipsX || clipsY) return [`${element.tagName}:${element.textContent?.trim().slice(0, 48)}`];
        ancestor = ancestor.parentElement;
      }
      return [];
    });
    return {
      documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      footerOverflow: footer.scrollWidth - footer.clientWidth,
      zeroSized: candidates.filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width <= 0 || rect.height <= 0;
      }).length,
      clipped,
    };
  });
}

async function assertNaturalFooterKeyboardPath(page: Page) {
  const footer = page.getByRole("contentinfo");
  await footer.evaluate((element) => {
    const makeSentinel = (id: string) => {
      const sentinel = document.createElement("button");
      sentinel.id = id;
      sentinel.type = "button";
      sentinel.textContent = id;
      sentinel.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;";
      return sentinel;
    };
    element.before(makeSentinel("shell-footer-before"));
    element.after(makeSentinel("shell-footer-after"));
  });

  const controls = footer.locator(FOOTER_SEQUENTIAL_SELECTOR);
  const count = await controls.count();
  expect(count).toBeGreaterThan(0);

  await page.locator("#shell-footer-before").focus();
  for (let index = 0; index < count; index += 1) {
    await page.keyboard.press("Tab");
    const control = controls.nth(index);
    await expect(control, `forward footer control ${index + 1}/${count}`).toBeFocused();
    await expectLocatorUnobscured(control, `forward footer control ${index + 1}/${count}`);
  }

  const afterFooter = page.locator("#shell-footer-after");
  const chatLauncher = page.locator("[data-chat-launcher]");
  await expect(chatLauncher).toHaveCSS("opacity", "0");
  await expect(chatLauncher).toHaveCSS("pointer-events", "none");
  await page.keyboard.press("Tab");
  await expect(afterFooter).toBeFocused();
  await expect(chatLauncher).toHaveCSS("opacity", "1");
  await expect(chatLauncher).toHaveCSS("pointer-events", "auto");
  await page.keyboard.press("Tab");
  await expect(chatLauncher).toBeFocused();
  await expectLocatorUnobscured(chatLauncher, "chat launcher after the footer keyboard path");

  await afterFooter.focus();
  for (let index = count - 1; index >= 0; index -= 1) {
    await page.keyboard.press("Shift+Tab");
    const control = controls.nth(index);
    await expect(control, `reverse footer control ${index + 1}/${count}`).toBeFocused();
    await expectLocatorUnobscured(control, `reverse footer control ${index + 1}/${count}`);
  }
}

test.describe("Shared public shell accessibility", () => {
  test("keeps the skip link above the closed header and below the modal", async ({ page }, testInfo) => {
    test.skip(!["mobile-320", "desktop-1280"].includes(testInfo.project.name), "canonical skip-link lanes");
    await gotoAndSettle(page, "/sss");
    const header = page.locator("[data-fullscreen-header]");
    await expect(header).toBeVisible({ timeout: 15_000 });
    const skipLink = page.getByRole("link", { name: "Ana içeriğe geç" });
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await expectLocatorUnobscured(skipLink, "focused skip link");
    const layers = {
      skip: Number(await skipLink.evaluate((element) => getComputedStyle(element).zIndex)),
      header: Number(await header.evaluate((element) => getComputedStyle(element).zIndex)),
    };
    expect(layers.skip).toBeGreaterThan(layers.header);
  });

  test("derives an exhaustive 94-path public route and shell ownership contract", async ({ browserName }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1280", "one canonical route-inventory lane");
    expect(browserName).toBe("chromium");
    expect(categoryPages).toHaveLength(15);
    expect(servicePages).toHaveLength(48);
    expect(materialCategories).toHaveLength(11);
    expect(BLOG_SLUGS).toHaveLength(6);
    expect([...APP_PANEL_ROUTE_PATTERNS].sort()).toEqual([...EXPECTED_PANEL_ROUTE_PATTERNS].sort());
    expect([...APP_PUBLIC_ROUTE_PATTERNS].sort()).toEqual([...EXPECTED_PUBLIC_ROUTE_PATTERNS].sort());
    // Üç dev rotası yalnız dev bloğunda yaşar ve orada `DevRoute &&` koruması
    // altındadır; üretim rota tablosunda hiç görünmez.
    expect([...APP_DEV_ROUTE_PATTERNS].sort()).toEqual([...EXPECTED_DEV_ROUTE_PATTERNS].sort());
    for (const pattern of EXPECTED_DEV_ROUTE_PATTERNS) {
      expect(
        DEV_ROUTES_SOURCE,
        `${pattern} must stay behind the import.meta.env.DEV guard`,
      ).toContain(`{DevRoute && <Route path="${pattern}"`);
    }
    expect(APP_SOURCE).toMatch(
      /import\.meta\.env\.DEV\s*\?\s*lazy\(\(\)\s*=>\s*import\("\.\/routes\/DevRoutes"\)\)\s*:\s*null;/,
    );
    expect(new Set([...CATEGORY_ROUTES, ...SERVICE_ROUTES, ...MATERIAL_ROUTES, ...BLOG_ROUTES]).size).toBe(80);
    // 88 → 89 → 90: `/` Faz 03'te (B14), `/teklif-al` Faz 04'te katıldı.
    expect(new Set(FULL_SHELL_ROUTES).size).toBe(90);
    expect(FULL_SHELL_ROUTES).toContain("/");
    expect(FULL_SHELL_ROUTES).toContain("/teklif-al");
    // Toplam DEĞİŞMEDİ: her iki rota da istisna kümesinden tam kabuk kümesine
    // TAŞINDI; yeni rota eklenmedi, hiçbiri kaldırılmadı.
    expect(new Set([...FULL_SHELL_ROUTES, ...NON_SHELL_PUBLIC_ROUTES]).size).toBe(94);
  });

  test("keeps all 90 canonical full-shell routes on one header/footer contract", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1280", "one canonical all-route shell lane");
    test.setTimeout(600_000);
    const runtimeErrors: string[] = [];
    const unexpectedExternalRequests: string[] = [];
    const pendingLocalCriticalRequests = new Set<unknown>();

    await page.route("https://fonts.googleapis.com/**", (route) => route.fulfill({
      status: 200,
      contentType: "text/css",
      body: "",
    }));
    await page.route("https://zdqiujpeewtyhtcqhdcj.supabase.co/rest/v1/faq_analytics**", (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    }));

    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.origin !== LOCAL_ORIGIN && !isKnownExternalTestRequest(request.url())) {
        unexpectedExternalRequests.push(request.url());
      }
      if (url.origin === LOCAL_ORIGIN && ["document", "script", "stylesheet"].includes(request.resourceType())) {
        pendingLocalCriticalRequests.add(request);
      }
    });
    const settleCriticalRequest = (request: unknown) => pendingLocalCriticalRequests.delete(request);
    page.on("requestfinished", settleCriticalRequest);
    page.on("requestfailed", (request) => {
      settleCriticalRequest(request);
      const url = new URL(request.url());
      if (url.origin === LOCAL_ORIGIN && ["document", "script", "stylesheet"].includes(request.resourceType())) {
        runtimeErrors.push(`${decodeURIComponent(url.pathname)}: request failed: ${request.failure()?.errorText}`);
      }
    });
    page.on("response", (response) => {
      const url = new URL(response.url());
      if (url.origin === LOCAL_ORIGIN && response.status() >= 400) {
        runtimeErrors.push(`${decodeURIComponent(url.pathname)}: HTTP ${response.status()}`);
      }
    });
    page.on("pageerror", (error) => runtimeErrors.push(`${new URL(page.url()).pathname}: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const resourceUrl = message.location().url || "no URL";
      runtimeErrors.push(`${new URL(page.url()).pathname}: console: ${message.text()} (${resourceUrl})`);
    });

    for (const route of FULL_SHELL_ROUTES) {
      await gotoAndSettle(page, route);
      await expect.poll(
        () => decodeURIComponent(new URL(page.url()).pathname),
        `${route} must resolve without redirect`,
      ).toBe(route);
      const headerHost = page.locator("#shared-header-host");
      await expect(headerHost, `${route} must own one header host`).toHaveCount(1);
      await expect(headerHost.locator("[data-fullscreen-header]"), `${route} header must stay inside its host`).toHaveCount(1);
      await expect(page.locator("[data-fullscreen-header]"), `${route} must not own a stray second header`).toHaveCount(1);
      await expect(page.locator("[data-menu-trigger]"), `${route} must own one closed trigger`).toHaveCount(1);
      const footer = page.getByRole("contentinfo");
      await expect(footer, `${route} must own one footer`).toHaveCount(1);
      await expect(footer, `${route} footer must stay in normal flow`).toHaveCSS("position", "relative");
      await expect(
        page.getByRole("heading", { name: /^(Sayfa|Yaz\u0131) Bulunamad\u0131$/u }),
        `${route} must resolve canonical content rather than a local not-found shell`,
      ).toHaveCount(0);
      await expect.poll(
        () => pendingLocalCriticalRequests.size,
        { message: `${route} local document/script/stylesheet requests must settle`, timeout: 20_000 },
      ).toBe(0);
    }
    expect(runtimeErrors).toEqual([]);
    expect(unexpectedExternalRequests).toEqual([]);
  });

  test("keeps declared public and panel shell exceptions explicit", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1280", "one canonical shell-exception lane");
    const exceptions = [
      // `/` ARTIK BİR İSTİSNA DEĞİL — global navigasyonu basıyor ve yukarıdaki
      // tam kabuk sözleşmesinde ölçülüyor (B14 kapandı). Faz 01'in
      // `{ route: "/", header: 0, footer: 1 }` satırı tam da bu an için
      // yazılmıştı; amacına ulaştığı için kaldırıldı, gevşetilmedi.
      // `/teklif-al` de FAZ 04'te bu tablodan çıktı: artık header VE footer
      // basıyor, dolayısıyla 90 rotalık sözleşmede ölçülüyor.
      // Dev-only rotalar üretim derlemesinde hiç oluşturulmaz: istek `*`
      // üzerinden 404 sayfasına düşer.
      { route: "/technical-preview", finalPaths: ["/technical-preview"], header: 1, footer: 1 },
      { route: "/legacy-landing", finalPaths: ["/legacy-landing"], header: 1, footer: 1 },
      { route: "/test", finalPaths: ["/test"], header: 1, footer: 1 },
      { route: "/cad-dashboard", finalPaths: ["/teklif-al"], header: 1, footer: 1 },
      { route: "/giris", finalPaths: ["/giris"], header: 0, footer: 0 },
      { route: "/sifremi-unuttum", finalPaths: ["/sifremi-unuttum"], header: 0, footer: 0 },
      { route: "/reset-password", finalPaths: ["/reset-password"], header: 0, footer: 0 },
      /* FAZ 04 — 404 ARTIK KABUKSUZ DEĞİL.
         `header: 0, footer: 0` eski hâli tarif ediyordu: 404, kendi
         açık/teal tuval estetiğiyle, ne header ne footer içeren, dört elle
         seçilmiş bağlantıdan başka çıkışı olmayan bir çıkmazdı
         (`reports/baseline/shell-inventory.md` §4 madde 2) — ve 15 saniye
         sonra `window.location`'ı ana sayfaya yazan bir sayaç barındırıyordu.
         Faz 04 kabuk sözleşmesi (kabul ölçütü 4: hiçbir halka açık sayfa eski
         kabuğa ihtiyaç duymamalı) onu `PageShell` içine aldı; içerik ve
         kompozisyon hâlâ Faz 08'in (ID 680–687). Beklenti gevşetilmedi,
         karşı yöne çevrildi: kabuğun VARLIĞI artık zorunlu. */
      { route: "/__shell-404__", finalPaths: ["/__shell-404__"], header: 1, footer: 1 },
      { route: "/admin/login", finalPaths: ["/admin/login"], header: 0, footer: 0 },
      { route: "/admin", finalPaths: ["/admin", "/admin/login"], header: 0, footer: 0 },
      { route: "/musteri-paneli", finalPaths: ["/musteri-paneli", "/giris"], header: 0, footer: 0 },
      { route: "/admin/__shell-404__", finalPaths: ["/admin/__shell-404__"], header: 0, footer: 0 },
      { route: "/musteri-paneli/__shell-404__", finalPaths: ["/musteri-paneli/__shell-404__"], header: 0, footer: 0 },
    ] as const;

    for (const expectation of exceptions) {
      await page.goto(expectation.route, { waitUntil: "domcontentloaded" });
      await expect.poll(() => expectation.finalPaths.some((path) => path === new URL(page.url()).pathname)).toBe(true);
      await expect(page.locator("[data-fullscreen-header]"), expectation.route).toHaveCount(expectation.header);
      await expect(page.getByRole("contentinfo"), expectation.route).toHaveCount(expectation.footer);
    }
  });

  test("keeps the dialog fixed, isolated, keyboard bounded, and restorable", async ({ page }, testInfo) => {
    test.skip(!SHELL_MATRIX.has(testInfo.project.name), "representative shell viewport matrix");
    await gotoAndSettle(page, "/sss");
    const header = page.locator("[data-fullscreen-header]");
    await expect(header).toBeVisible({ timeout: 15_000 });
    await page.evaluate(() => {
      const target = Math.min(900, document.documentElement.scrollHeight / 3);
      const lenis = (window as Window & {
        __lenis?: { scrollTo: (value: number, options: { immediate: boolean; force: boolean }) => void };
      }).__lenis;
      lenis?.scrollTo(target, { immediate: true, force: true });
      window.scrollTo(0, target);
    });
    const trigger = page.locator("[data-menu-trigger]");
    await expect.poll(() => header.evaluate((element) =>
      Math.round(element.getBoundingClientRect().top)), { timeout: 15_000 }).toBe(0);
    await trigger.focus();
    const scrollY = await page.evaluate(() => window.scrollY);
    await page.keyboard.press("Enter");

    const menu = page.locator("[data-fullscreen-menu]");
    const close = menu.getByRole("button", { name: "Menüyü kapat" });
    await expect(menu).toHaveAttribute("role", "dialog");
    await expect(menu).toHaveAttribute("aria-modal", "true");
    await expect(menu).toHaveAccessibleName("Ana menü");
    await expect(close).toBeFocused();
    await expect(page.locator("#root")).toHaveAttribute("inert", "");
    await expect(page.locator("[data-fullscreen-header]")).toHaveAttribute("inert", "");

    const undersized = await menu.locator('a[href]:visible, button:not([disabled]):visible').evaluateAll((controls) =>
      controls.flatMap((control) => {
        const rect = control.getBoundingClientRect();
        return rect.width >= 43 && rect.height >= 43
          ? []
          : [`${control.tagName}:${control.textContent?.trim()}:${rect.width.toFixed(1)}x${rect.height.toFixed(1)}`];
      }));
    expect(undersized, "visible menu controls must meet the 44px shell target contract").toEqual([]);

    const focusable = menu.locator(
      'a[href]:visible, button:not([disabled]):visible, [tabindex]:not([tabindex="-1"]):visible',
    );
    const first = focusable.first();
    const last = focusable.last();
    await last.focus();
    await page.keyboard.press("Tab");
    await expect(first).toBeFocused();
    await first.focus();
    await page.keyboard.press("Shift+Tab");
    await expect(last).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect.poll(() => page.evaluate((expected) => Math.abs(window.scrollY - expected), scrollY)).toBeLessThanOrEqual(2);
    await expect(page.locator("#root")).not.toHaveAttribute("inert", "");
  });

  test("makes mobile footer disclosures semantic and removes closed links from Tab order", async ({ page }, testInfo) => {
    test.skip(!["mobile-320", "mobile-375", "mobile-390"].includes(testInfo.project.name), "mobile disclosure lanes");
    await gotoAndSettle(page, "/sss");
    const footer = page.getByRole("contentinfo");
    const disclosures = footer.locator("h2 > button[aria-controls]");
    await expect(disclosures).toHaveCount(4);

    for (const disclosure of await disclosures.all()) {
      const triggerId = await disclosure.getAttribute("id");
      const panelId = await disclosure.getAttribute("aria-controls");
      expect(triggerId).toBeTruthy();
      expect(panelId).toBeTruthy();
      await expect(disclosure).toHaveAttribute("aria-expanded", "false");
      const panel = footer.locator(`#${panelId}`);
      await expect(panel).toHaveAttribute("role", "region");
      await expect(panel).toHaveAttribute("aria-labelledby", triggerId!);
      await expect(panel).toHaveAttribute("hidden", "");
      expect(await panel.locator("a[href]").evaluateAll((links) =>
        links.filter((link) => (link as HTMLElement).tabIndex >= 0 && link.getClientRects().length > 0).length)).toBe(0);
    }

    await disclosures.first().focus();
    await page.keyboard.press("Tab");
    await expect(disclosures.nth(1)).toBeFocused();
    await disclosures.first().focus();
    await page.keyboard.press("Space");
    await expect(disclosures.first()).toHaveAttribute("aria-expanded", "true");
    const firstPanelId = await disclosures.first().getAttribute("aria-controls");
    const firstPanel = footer.locator(`#${firstPanelId}`);
    await expect(firstPanel).not.toHaveAttribute("hidden", "");
    await page.keyboard.press("Tab");
    await expect(firstPanel.locator("a[href]").first()).toBeFocused();
    await disclosures.first().focus();
    await page.keyboard.press("Space");
    await expect(firstPanel).toHaveAttribute("hidden", "");
  });

  test("keeps footer CTA and legal controls reachable, stable, and unobscured", async ({ page }, testInfo) => {
    test.skip(!SHELL_MATRIX.has(testInfo.project.name), "representative shell viewport matrix");
    await gotoAndSettle(page, "/sss");
    const footer = page.getByRole("contentinfo");
    for (const [name, label] of [
      [/Yazıları incele/i, "technical-content link"],
      [/Hemen Teklif Al/i, "quote CTA"],
      [/Bize Ulaşın/i, "contact CTA"],
    ] as const) {
      const link = footer.getByRole("link", { name });
      await link.scrollIntoViewIfNeeded();
      await expectLocatorUnobscured(link, label);
    }

    await fullScrollToBottom(page);
    for (const [name, label] of [
      [/Gizlilik Politikası/i, "privacy link"],
      [/^KVKK/i, "KVKK link"],
      [/Çerez Politikası/i, "cookie link"],
    ] as const) {
      const link = footer.getByRole("link", { name });
      await link.focus();
      await expect(link).toBeFocused();
      await expectLocatorUnobscured(link, label);
    }
    await expect(page.getByRole("button", { name: "Yukarı çık" })).toHaveCount(0);
  });

  test("keeps every footer control unobscured in natural forward and reverse keyboard order", async ({ page }, testInfo) => {
    test.skip(
      !["mobile-320", "desktop-1280", "desktop-1440-short"].includes(testInfo.project.name),
      "canonical footer keyboard-order lanes",
    );
    test.setTimeout(180_000);
    await gotoAndSettle(page, "/sss");
    await assertNaturalFooterKeyboardPath(page);
  });

  test("preserves footer reflow at a 400 percent equivalent CSS viewport", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1280", "one canonical 400%-equivalent reflow lane");
    await page.setViewportSize({ width: 320, height: 568 });
    await gotoAndSettle(page, "/sss");
    await expect.poll(() => page.evaluate(() => window.innerWidth)).toBe(320);
    await expandFooterDisclosures(page);
    const audit = await footerLayoutAudit(page);
    expect(audit.documentOverflow).toBeLessThanOrEqual(1);
    expect(audit.footerOverflow).toBeLessThanOrEqual(1);
    expect(audit.zeroSized).toBe(0);
    expect(audit.clipped).toEqual([]);
  });

  test("supports WCAG text spacing without clipping footer content", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-320", "one canonical text-spacing lane");
    await gotoAndSettle(page, "/sss");
    await expandFooterDisclosures(page);
    const footer = page.getByRole("contentinfo");
    const beforeHeight = await footer.evaluate((element) => element.getBoundingClientRect().height);
    await page.addStyleTag({
      content: `
        footer * { line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important; }
        footer p { margin-block-end:2em !important; }
      `,
    });
    await page.evaluate(() => new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    const afterHeight = await footer.evaluate((element) => element.getBoundingClientRect().height);
    expect(afterHeight).toBeGreaterThanOrEqual(beforeHeight);
    const audit = await footerLayoutAudit(page);
    expect(audit.documentOverflow).toBeLessThanOrEqual(1);
    expect(audit.footerOverflow).toBeLessThanOrEqual(1);
    expect(audit.zeroSized).toBe(0);
    expect(audit.clipped).toEqual([]);
  });

  test("retains visible footer focus indicators in forced-colors mode", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1280", "one canonical forced-colors lane");
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.setViewportSize({ width: 320, height: 568 });
    await gotoAndSettle(page, "/sss");
    expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);

    const footer = page.getByRole("contentinfo");
    const targets = [
      footer.locator('h2 > button[aria-controls]').first(),
      footer.getByRole("link", { name: "+90 (536) 564 51 94" }),
      footer.getByRole("link", { name: "sales@mastechnic.com" }),
      footer.getByRole("link", { name: /Yazıları incele/i }),
      footer.getByRole("link", { name: /Hemen Teklif Al/i }),
      footer.getByRole("link", { name: /Bize Ulaşın/i }),
      footer.getByRole("link", { name: /Gizlilik Politikası/i }),
    ];
    for (const [index, target] of targets.entries()) {
      await target.focus();
      await expect(target, `forced-colors target ${index + 1}`).toBeFocused();
      const focus = await target.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          forcedColorAdjust: style.forcedColorAdjust,
          outlineStyle: style.outlineStyle,
          outlineWidth: Number.parseFloat(style.outlineWidth),
          outlineColor: style.outlineColor,
          focusVisible: element.matches(":focus-visible"),
        };
      });
      expect(focus.forcedColorAdjust).toBe("auto");
      expect(focus.focusVisible).toBe(true);
      expect(focus.outlineStyle).not.toBe("none");
      expect(focus.outlineWidth).toBeGreaterThanOrEqual(2);
      expect(focus.outlineColor).not.toBe("transparent");
      await expectLocatorUnobscured(target, `forced-colors target ${index + 1}`);
    }
    const axe = await new AxeBuilder({ page }).include("footer").analyze();
    expect(axe.violations.filter((violation) =>
      violation.impact === "serious" || violation.impact === "critical")).toEqual([]);
  });

  test("honors four-edge safe-area tokens in the closed header, modal and footer", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-320", "one canonical four-edge safe-area lane");
    await gotoAndSettle(page, "/sss");
    const insets = { top: 17, right: 29, bottom: 37, left: 23 };
    await page.evaluate((values) => {
      const root = document.documentElement.style;
      root.setProperty("--shell-safe-top", `${values.top}px`);
      root.setProperty("--shell-safe-right", `${values.right}px`);
      root.setProperty("--shell-safe-bottom", `${values.bottom}px`);
      root.setProperty("--shell-safe-left", `${values.left}px`);
    }, insets);

    const header = page.locator("[data-fullscreen-header]");
    const logo = header.getByRole("link", { name: "MAS Technic ana sayfa" });
    const trigger = page.locator("[data-menu-trigger]");
    // The safe-area properties are applied by the test itself, so the header's
    // padding changes AFTER the assertion's first paint. The old code measured
    // immediately and raced whatever transition was still in flight: the logo's
    // x was recorded at 12.89 / 15.36 / 19.64 in different runs and settled at
    // exactly 23 in all of them ~2s later (`reports/qa/phase-02.md` §21.8).
    // This waits for the animation to be over rather than sleeping for a
    // guessed duration — if a future header animates its padding again, the
    // wait still holds and the measurement is still honest.
    await expect.poll(() => header.evaluate((element) =>
      element.getAnimations({ subtree: true }).filter((animation) =>
        animation.playState === "running").length)).toBe(0);
    const closed = await Promise.all([logo, trigger].map((locator) => locator.boundingBox()));
    expect(closed[0]!.x).toBeGreaterThanOrEqual(insets.left);
    expect(closed[0]!.y).toBeGreaterThanOrEqual(insets.top);
    expect(closed[1]!.x + closed[1]!.width).toBeLessThanOrEqual(320 - insets.right + 1);
    expect(closed[1]!.y).toBeGreaterThanOrEqual(insets.top);

    await trigger.click();
    const menu = page.locator("[data-fullscreen-menu]");
    const close = menu.getByRole("button", { name: "Menüyü kapat" });
    const menuLogo = menu.getByRole("link", { name: "MAS Technic ana sayfa" });
    const conversion = menu.getByRole("link", { name: "Projeni Yükle" });
    const open = await Promise.all([close, menuLogo, conversion].map((locator) => locator.boundingBox()));
    expect(open[0]!.x + open[0]!.width).toBeLessThanOrEqual(320 - insets.right + 1);
    expect(open[0]!.y).toBeGreaterThanOrEqual(insets.top);
    expect(open[1]!.x).toBeGreaterThanOrEqual(insets.left);
    expect(open[1]!.y).toBeGreaterThanOrEqual(insets.top);
    expect(open[2]!.y + open[2]!.height).toBeLessThanOrEqual(568 - insets.bottom + 1);
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);

    await fullScrollToBottom(page);
    const footer = page.getByRole("contentinfo");
    /* FAZ 04 — SEÇİCİ DEĞİŞTİ, İDDİA DEĞİŞMEDİ.
       Ölçüm `footer .container-industrial` üzerindeydi, çünkü mega footer
       safe-area boşluğunu o Tailwind kabına veriyordu
       (`.footer-industrial .container-industrial`, `src/index.css`). Faz 04 o
       footer'ı sildi; hayatta kalan antet bloğu boşluğu BANDIN KENDİSİNE
       veriyor (`src/styles/shell.css`), böylece sayfanın kılcal yan çizgileri
       tabaka kenarında kalıp yalnızca İÇERİK içeri çekiliyor. Ölçülen şey
       aynı: dört kenarın hiçbirinde içerik güvenli alanın dışına taşmıyor. */
    const containerPadding = await footer.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        left: Number.parseFloat(style.paddingLeft),
        right: Number.parseFloat(style.paddingRight),
        bottom: Number.parseFloat(style.paddingBottom),
      };
    });
    expect(containerPadding.left).toBeGreaterThanOrEqual(insets.left);
    expect(containerPadding.right).toBeGreaterThanOrEqual(insets.right);
    expect(containerPadding.bottom).toBeGreaterThanOrEqual(insets.bottom);
    const legal = footer.getByRole("link", { name: /Gizlilik Politikası/i });
    const legalBounds = await legal.boundingBox();
    expect(legalBounds!.x).toBeGreaterThanOrEqual(insets.left);
    expect(legalBounds!.x + legalBounds!.width).toBeLessThanOrEqual(320 - insets.right + 1);
    expect(legalBounds!.y + legalBounds!.height).toBeLessThanOrEqual(568 - insets.bottom + 1);

    /* ── B23 — the floating scroll-top control below 768px ────────────────
       This block used to assert that `.floating-scroll-top` is VISIBLE at 320
       with safe-area offsets, while `src/index.css` deliberately sets
       `display:none` on it below 768px. Product decision and test have been
       asserting opposite things since before this run: QA reproduced the same
       failure at base commit `9133415` with both files byte-identical
       (`reports/qa/phase-02.md` §21.8).

       DECISION (Phase 03): (a) — the control genuinely should not exist below
       768px, so the SPEC was wrong.
         · The global header is fixed at the top of every viewport at every
           width, and its brand link ("MAS Technic ana sayfa" → `/`) is always
           on screen. A second, floating "back to top" affordance duplicates a
           control the user can already reach without scrolling.
         · At 320 a 44px floating button overlays footer card text — the
           measured reason the rule was written in the first place.
         · The landing has no such control at all, so hiding it on small
           screens is also what keeps the two shells consistent.

       The assertion is not deleted, and it is not weakened into a no-op: it
       now pins the decision from both sides — the control must be absent from
       the accessibility tree, and the named CSS rule must be the reason. If
       someone re-exposes it at 320 without also updating the rule and the
       comment, this fails. */
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.4));
    await expect(page.getByRole("button", { name: "Yukarı çık" })).toHaveCount(0);
    expect(await page.locator(".floating-scroll-top").evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).display)))
      .toEqual(["none"]);
  });

  test("renders footer content immediately and uses non-smooth scroll under reduced motion", async ({ page }) => {
    test.skip(!isReducedMotionAuditViewport(page), "canonical reduced-motion lanes");
    // Same B23 decision as the 320 lane. This test runs at 375 AND 1440, and
    // at 375 it asserted the scroll-top control was visible — the same
    // contradiction with `src/index.css`'s `@media (max-width:767px)` rule, at
    // a second width, and equally pre-existing. Below 768 the control does not
    // exist by product decision; above it, the reduced-motion contract is
    // unchanged and still asserts a non-smooth `window.scrollTo`.
    const desktopWidth = (page.viewportSize()?.width ?? 0) >= 768;
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => {
      const original = window.scrollTo.bind(window);
      const calls: string[] = [];
      (window as Window & { __shellScrollBehaviors?: string[] }).__shellScrollBehaviors = calls;
      window.scrollTo = ((first: number | ScrollToOptions, second?: number) => {
        if (typeof first === "object") calls.push(first.behavior ?? "auto");
        if (typeof first === "object") return original(first);
        return original(first, second ?? 0);
      }) as typeof window.scrollTo;
    });
    await gotoAndSettle(page, "/sss");

    for (const selector of ["[data-footer-newsletter]", "[data-footer-cta]"]) {
      const state = await page.locator(selector).evaluate((element) => {
        const style = getComputedStyle(element);
        return { opacity: style.opacity, transform: style.transform };
      });
      expect(state.opacity).toBe("1");
      expect(state.transform).toBe("none");
    }
    /* FAZ 04 — DAHA DAR DEĞİL, DAHA GENİŞ.
       Bu satır tek bir elemanı ölçüyordu: `[data-footer-information-band]`,
       yani mega footer'ın kayan marka şeridi (`src/components/MarqueeBand.tsx`).
       O şerit silindi — landing zaten 03 bandında bir marquee basıyor ve aynı
       sayfada iki tanesi gürültü. Ölçülen GARANTİ ("azaltılmış hareket altında
       footer'da hiçbir şey oynamaz") korunuyor, ama artık tek bir banda değil
       BÜTÜN footer'a uygulanıyor; yani bu iddia eskisinin üst kümesi. */
    expect(await page.getByRole("contentinfo").evaluate((element) =>
      element.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length)).toBe(0);

    await page.evaluate(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, max * 0.4);
      const calls = (window as Window & { __shellScrollBehaviors?: string[] }).__shellScrollBehaviors;
      if (calls) calls.length = 0;
    });
    const scrollTop = page.getByRole("button", { name: "Yukarı çık" });
    if (desktopWidth) {
      await expect(scrollTop).toBeVisible();
      await scrollTop.click();
      await expect.poll(() => page.evaluate(() =>
        (window as Window & { __shellScrollBehaviors?: string[] }).__shellScrollBehaviors ?? [])).toContain("auto");
    } else {
      await expect(scrollTop).toHaveCount(0);
      expect(await page.locator(".floating-scroll-top").evaluateAll((elements) =>
        elements.map((element) => getComputedStyle(element).display)))
        .toEqual(["none"]);
    }

    const footerText = await page.getByRole("contentinfo").innerText();
    expect(footerText).toContain("sales@mastechnic.com");
    expect(footerText).not.toMatch(/±0\.002|PPAP|AEROSPACE GRADE|Kapasite/i);
  });

  test("has no serious or critical axe violations in the closed shared shell", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1280", "one canonical closed-shell axe lane");
    await gotoAndSettle(page, "/sss");
    await expect(page.locator("[data-fullscreen-header]")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeAttached();
    const results = [
      await new AxeBuilder({ page }).include("[data-fullscreen-header]").analyze(),
      await new AxeBuilder({ page }).include("footer").analyze(),
    ];
    const blocking = results.flatMap((result) => result.violations).filter((violation) =>
      violation.impact === "serious" || violation.impact === "critical");
    expect(blocking).toEqual([]);
  });

  test("records whole-page axe evidence and isolates documented non-shell debt", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1280", "one canonical whole-page evidence lane");
    await gotoAndSettle(page, "/sss");
    await expect(page.locator('span[class~="text-primary/30"]').first()).toBeVisible();
    const result = await new AxeBuilder({ page }).analyze();
    const blocking = result.violations.filter((violation) =>
      violation.impact === "serious" || violation.impact === "critical");
    await testInfo.attach("whole-page-axe-blockers.json", {
      body: JSON.stringify(blocking, null, 2),
      contentType: "application/json",
    });

    // The shared header/footer are asserted independently above. The only
    // currently documented whole-page debt belongs to the out-of-scope SSS
    // numeric labels; depending on their reveal frame, axe may report it or no
    // blocking issue. Any different serious/critical node fails this contract.
    expect(blocking.every((violation) => violation.id === "color-contrast")).toBe(true);
    expect(blocking.flatMap((violation) => violation.nodes).every((node) =>
      node.html.includes("text-primary/30"))).toBe(true);
  });

  test("preserves shell reflow and focus access at 200 percent text size", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1280", "one canonical 200% text lane");
    await gotoAndSettle(page, "/sss");
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });

    const footer = page.getByRole("contentinfo");
    for (const link of [
      footer.getByRole("link", { name: /Yazıları incele/i }),
      footer.getByRole("link", { name: /Hemen Teklif Al/i }),
      footer.getByRole("link", { name: /Gizlilik Politikası/i }),
    ]) {
      await link.scrollIntoViewIfNeeded();
      await link.focus();
      await expect(link).toBeFocused();
      await expectLocatorUnobscured(link, "200% text shell link");
    }

    await page.locator("[data-menu-trigger]").click();
    const menu = page.locator("[data-fullscreen-menu]");
    await expect(menu.getByRole("button", { name: "Menüyü kapat" })).toBeFocused();
    expect(await menu.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    await page.keyboard.press("Escape");
  });
});
