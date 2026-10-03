import { defineConfig, devices } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Playwright sözleşmesi — dört ayrı görev, dört ayrı proje ailesi.
 *
 *   critical    Chromium, iki temel genişlik. PR'ı bloke eden hızlı kapı.
 *               Yalnızca gerçek üretim landing'i (`/`) ve onun sözleşmeleri.
 *   regression  Sekiz Chromium görünüm penceresi. Geniş kapsam, kapı değil.
 *   smoke       WebKit + Firefox. Tarayıcı-arası temel akış.
 *   visual      Altın (golden) ekran görüntüsü farkı.
 *
 * `e2e/legacy/**` yalnız `PLAYWRIGHT_LEGACY=1` ile açılan ayrı bir projeye
 * bağlıdır ve hiçbir kapının parçası değildir: oradaki testler dev-only
 * `/legacy-landing` rotasını sınar, o rota ise üretim derlemesinde hiç
 * yayınlanmaz (bkz. `src/App.tsx` DEV_ONLY_ROUTES). Bu bir hata gizleme
 * değil, ölçülebilir bir olgu: üretim önizlemesinde o URL 404 döner.
 */
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 4173);
const MANAGED_PREVIEW_URL = process.env.PLAYWRIGHT_BASE_URL;
const BASE_URL = MANAGED_PREVIEW_URL ?? `http://localhost:${PORT}`;
const baseUrlHost = new URL(BASE_URL).hostname;
if (!["localhost", "127.0.0.1", "[::1]"].includes(baseUrlHost)
  && process.env.PLAYWRIGHT_ALLOW_REMOTE !== "1") {
  throw new Error("Playwright runs require a loopback base URL unless PLAYWRIGHT_ALLOW_REMOTE=1 is explicit.");
}
const REUSE_EXISTING_SERVER = process.env.PLAYWRIGHT_REUSE_SERVER
  ? process.env.PLAYWRIGHT_REUSE_SERVER === "1"
  : !process.env.CI;
// Yerelde tek worker. Playwright'in varsayilani cekirdek sayisinin yarisidir
// (bu makinede 4) ve her worker kendi Chromium'unu acar; bellek yetmedigi icin
// testler kod hatasi olmadan timeout'a dusuyordu. Gecici olarak artirmak icin:
// PLAYWRIGHT_WORKERS=4 npx playwright test
const WORKERS = process.env.PLAYWRIGHT_WORKERS
  ? Number(process.env.PLAYWRIGHT_WORKERS)
  : process.env.CI ? 2 : 1;
const RETRIES = process.env.PLAYWRIGHT_RETRIES
  ? Number(process.env.PLAYWRIGHT_RETRIES)
  : process.env.CI ? 2 : 0;
const CAPTURE_ARTIFACTS = process.env.PLAYWRIGHT_ARTIFACTS !== "0";
// CI'da derleme ayri bir isde bir kez yapilip `dist/` paylasilir; test isleri
// yalnizca `preview` calistirir. Yerelde varsayilan hâlâ build + preview.
const PREVIEW_ONLY = process.env.PLAYWRIGHT_PREVIEW_ONLY === "1";

const executableCandidates = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  "/bin/chromium",
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"]!, "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
];
const CHROMIUM_EXECUTABLE_PATH = executableCandidates
  .find((candidate): candidate is string => !!candidate && existsSync(candidate));
// Playwright 1.59'un sabitledigi Chromium revizyonu bu makinede kurulu degil
// (bkz. reports/baseline/known-blockers.md B08). Yerel Chrome/Edge'e dusen bu
// yedek olmadan hicbir Chromium projesi acilamaz; korunmasi zorunlu.
const chromiumLaunch = CHROMIUM_EXECUTABLE_PATH
  ? { launchOptions: { executablePath: CHROMIUM_EXECUTABLE_PATH } }
  : {};

/**
 * Ayni sorunun Firefox/WebKit karsiligi: bu makinede Playwright'in sabitledigi
 * `firefox-1511` / `webkit-2272` revizyonlari yok; kurulu olanlar daha yeni
 * (`firefox-1532`, `firefox-1538`, `webkit-2311`, `webkit-2336` — olculdu:
 * `ls ~/AppData/Local/ms-playwright`). Tarayici KURULUMU yapilmaz; yalnizca
 * ZATEN kurulu olan en yuksek revizyon isaret edilir.
 *
 * Kapsam bilerek dar: bu yedek yalnizca CI DISINDA devreye girer. CI'da
 * `npx playwright install` sabitlenen revizyonu getirir, bu yuzden orada
 * Playwright kendi ikilisini kullanir ve determinizm korunur. Yereldeki bu
 * sapma B08'in ayni sinifindan bilinen bir determinizm bosluguddur, gizlenmez.
 */
const BROWSERS_ROOT = process.env.PLAYWRIGHT_BROWSERS_PATH
  ?? (process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, "ms-playwright") : undefined);

function installedBrowserExecutable(prefix: string, ...relative: string[]): string | undefined {
  if (process.env.CI || !BROWSERS_ROOT || !existsSync(BROWSERS_ROOT)) return undefined;
  return readdirSync(BROWSERS_ROOT)
    .filter((entry) => entry.startsWith(`${prefix}-`))
    .map((entry) => ({ entry, revision: Number(entry.slice(prefix.length + 1)) }))
    .filter(({ revision }) => Number.isFinite(revision))
    .sort((a, b) => b.revision - a.revision)
    .map(({ entry }) => join(BROWSERS_ROOT, entry, ...relative))
    .find((candidate) => existsSync(candidate));
}

function launchOverride(envVar: string, prefix: string, ...relative: string[]) {
  const explicit = process.env[envVar];
  const executablePath = explicit && existsSync(explicit)
    ? explicit
    : installedBrowserExecutable(prefix, ...relative);
  return executablePath ? { launchOptions: { executablePath } } : {};
}

const firefoxLaunch = launchOverride(
  "PLAYWRIGHT_FIREFOX_EXECUTABLE_PATH",
  "firefox",
  "firefox",
  process.platform === "win32" ? "firefox.exe" : "firefox",
);
const webkitLaunch = launchOverride(
  "PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH",
  "webkit",
  process.platform === "win32" ? "Playwright.exe" : "pw_run.sh",
);

/** Kritik kapi: gercek `/` landing sozlesmeleri. */
const CRITICAL_MATCH = ["landing/**/*.spec.ts", "technical-landing.spec.ts"];
const VISUAL_MATCH = ["visual/**/*.spec.ts"];
const SMOKE_MATCH = ["smoke/**/*.spec.ts"];
/** F1 — WebKit/Firefox acceptance of the critical flows (separate from smoke). */
const INTEROP_MATCH = ["interop/**/*.spec.ts"];
const LEGACY_MATCH = ["legacy/**/*.spec.ts"];
/** Regresyon aileleri kendi ozel projeleri olan paketleri tekrar calistirmaz. */
const REGRESSION_IGNORE = [...VISUAL_MATCH, ...SMOKE_MATCH, ...INTEROP_MATCH, ...LEGACY_MATCH];

const criticalProjects = [
  {
    name: "critical-1280",
    testMatch: CRITICAL_MATCH,
    use: { ...devices["Desktop Chrome"], ...chromiumLaunch, viewport: { width: 1280, height: 800 } },
  },
  {
    name: "critical-375",
    testMatch: CRITICAL_MATCH,
    use: {
      ...devices["Desktop Chrome"],
      ...chromiumLaunch,
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
    },
  },
];

const regressionViewports = [
  { name: "mobile-320", viewport: { width: 320, height: 568 }, mobile: true },
  { name: "mobile-375", viewport: { width: 375, height: 812 }, mobile: true },
  { name: "mobile-390", viewport: { width: 390, height: 844 }, mobile: true },
  { name: "tablet-768", viewport: { width: 768, height: 1024 }, mobile: true },
  { name: "landscape-844", viewport: { width: 844, height: 390 }, mobile: true },
  { name: "desktop-1280", viewport: { width: 1280, height: 800 }, mobile: false },
  { name: "desktop-1440-short", viewport: { width: 1440, height: 650 }, mobile: false },
  { name: "desktop-1440", viewport: { width: 1440, height: 900 }, mobile: false },
];

const regressionProjects = regressionViewports.map(({ name, viewport, mobile }) => ({
  name,
  testIgnore: REGRESSION_IGNORE,
  use: {
    ...devices["Desktop Chrome"],
    ...chromiumLaunch,
    viewport,
    ...(mobile ? { isMobile: true, hasTouch: true } : {}),
  },
}));

const smokeProjects = [
  {
    name: "smoke-firefox-390",
    testMatch: SMOKE_MATCH,
    use: { ...devices["Desktop Firefox"], ...firefoxLaunch, viewport: { width: 390, height: 844 } },
  },
  {
    name: "smoke-firefox-1440",
    testMatch: SMOKE_MATCH,
    use: { ...devices["Desktop Firefox"], ...firefoxLaunch, viewport: { width: 1440, height: 900 } },
  },
  {
    name: "smoke-webkit-390",
    testMatch: SMOKE_MATCH,
    use: { ...devices["Desktop Safari"], ...webkitLaunch, viewport: { width: 390, height: 844 }, hasTouch: true },
  },
  {
    name: "smoke-webkit-1440",
    testMatch: SMOKE_MATCH,
    use: { ...devices["Desktop Safari"], ...webkitLaunch, viewport: { width: 1440, height: 900 } },
  },
];

const interopProjects = [
  {
    name: "interop-firefox-1440",
    testMatch: INTEROP_MATCH,
    use: { ...devices["Desktop Firefox"], ...firefoxLaunch, viewport: { width: 1440, height: 900 } },
  },
  {
    name: "interop-webkit-390",
    testMatch: INTEROP_MATCH,
    use: { ...devices["Desktop Safari"], ...webkitLaunch, viewport: { width: 390, height: 844 }, hasTouch: true },
  },
  {
    name: "interop-webkit-1440",
    testMatch: INTEROP_MATCH,
    use: { ...devices["Desktop Safari"], ...webkitLaunch, viewport: { width: 1440, height: 900 } },
  },
];

// Altin goruntuler `prefers-reduced-motion: reduce` altinda uretilir: landing
// hareket katmani o modda tamamen kapanir, dolayisiyla fark deterministiktir.
//
// FAZ 07 — 768 EKLENDI. Matris `[375, 1280, 1440]` idi: iclerinde tablet
// genisligi YOKTU, dolayisiyla Faz 07'nin "masaustu/tablet/mobil altin
// goruntuler bulunmali" kabul kriteri matrisin kendisi yuzunden
// karsilanamiyordu. 768 artik `tablet-768` regresyon projesiyle AYNI cihazi
// tarif eder — 768x1024, dokunmatik — boylece iki serit ayni tabletten
// bahseder, birbirine yakin iki farklı tabletten degil.
const VISUAL_VIEWPORTS = [
  { width: 375, height: 812, mobile: true },
  { width: 768, height: 1024, mobile: true },
  { width: 1280, height: 900, mobile: false },
  { width: 1440, height: 900, mobile: false },
] as const;

const visualProjects = VISUAL_VIEWPORTS.map(({ width, height, mobile }) => ({
  name: `visual-${width}`,
  testMatch: VISUAL_MATCH,
  use: {
    ...devices["Desktop Chrome"],
    ...chromiumLaunch,
    viewport: { width, height },
    ...(mobile ? { isMobile: true, hasTouch: true } : {}),
    reducedMotion: "reduce" as const,
  },
}));

// Opt-in: dev-only `/legacy-landing` sozlesmeleri. Uretim onizlemesine karsi
// calistirilamaz (rota `dist/` icinde yok); yalnizca `npm run dev` sunucusuna
// PLAYWRIGHT_BASE_URL ile baglanarak anlamlidir.
const legacyProjects = process.env.PLAYWRIGHT_LEGACY === "1"
  ? [{
      name: "legacy-dev-route",
      testMatch: LEGACY_MATCH,
      use: { ...devices["Desktop Chrome"], ...chromiumLaunch, viewport: { width: 1280, height: 800 } },
    }]
  : [];

export default defineConfig({
  testDir: "./e2e",
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR ?? "test-results",
  // {platform} sart: yazi tipi rasterizasyonu isletim sistemine gore degisir,
  // platform-kor bir altin goruntu sahte fark uretir.
  snapshotPathTemplate: "{testDir}/__golden__/{platform}/{projectName}/{arg}{ext}",
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: RETRIES,
  workers: WORKERS,
  reporter: process.env.CI
    ? [["html", { open: "never" }], ["github"], ["list"]]
    : [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: BASE_URL,
    /* Off by default and never set in CI. A sandbox whose outbound HTTPS goes
       through a TLS-inspecting proxy makes every third-party request fail with
       ERR_CERT_AUTHORITY_INVALID, so specs that need the real network (fonts,
       hCaptcha) could only report FAIL_INFRA there. PLAYWRIGHT_IGNORE_HTTPS_ERRORS=1
       lets those runs reach the network instead of skipping the measurement. */
    ignoreHTTPSErrors: process.env.PLAYWRIGHT_IGNORE_HTTPS_ERRORS === "1",
    /* Round 2: inner-page prose waits dimmed below the fold until scrolled to
       (src/hooks/useProseReveal.ts). Audits and goldens measure text at its
       resting contrast, so every lane starts with the reveal off;
       e2e/polish/prose-reveal.spec.ts switches it back on and measures it. */
    storageState: {
      cookies: [],
      origins: [{ origin: new URL(BASE_URL).origin, localStorage: [{ name: "mas_prose_reveal", value: "off" }] }],
    },
    trace: CAPTURE_ARTIFACTS ? "retain-on-failure" : "off",
    screenshot: CAPTURE_ARTIFACTS ? "only-on-failure" : "off",
    video: CAPTURE_ARTIFACTS ? "retain-on-failure" : "off",
  },
  projects: [
    ...criticalProjects,
    ...regressionProjects,
    ...smokeProjects,
    ...interopProjects,
    ...visualProjects,
    ...legacyProjects,
  ],
  webServer: MANAGED_PREVIEW_URL ? undefined : {
      command: PREVIEW_ONLY
        ? `npm run preview -- --port ${PORT} --strictPort`
        : `npm run build && npm run preview -- --port ${PORT} --strictPort`,
      url: BASE_URL,
      /* The suite covers the English surface, so a local build publishes it;
         production decides with its own VITE_SITE_ENGLISH (release.md). */
      env: { VITE_SITE_ENGLISH: process.env.VITE_SITE_ENGLISH ?? "live" },
      reuseExistingServer: REUSE_EXISTING_SERVER,
      // Soguk `npm run build` bu makinede 4 dk 05 sn olculdu
      // (reports/baseline/build-test-baseline.md §1). Eski 180 sn deger
      // olculen sureden kisaydi; 600 sn ~2.4x pay birakir.
      timeout: PREVIEW_ONLY ? 120_000 : 600_000,
      stdout: "ignore",
      stderr: "pipe",
    },
});
