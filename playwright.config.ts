import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Playwright contract for the current public site and the Slice 0 baseline.
 * All eight Chromium viewport projects own the full regression contract. The
 * optional cross-browser projects run the reciprocal V3/V8 smoke contract.
 */
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 4173);
const MANAGED_PREVIEW_URL = process.env.PLAYWRIGHT_BASE_URL;
const BASE_URL = MANAGED_PREVIEW_URL ?? `http://localhost:${PORT}`;
const baseUrlHost = new URL(BASE_URL).hostname;
if (!["localhost", "127.0.0.1", "[::1]"].includes(baseUrlHost)
  && process.env.PLAYWRIGHT_ALLOW_REMOTE !== "1") {
  throw new Error("Slice 0 Playwright runs require a loopback base URL unless PLAYWRIGHT_ALLOW_REMOTE=1 is explicit.");
}
const REUSE_EXISTING_SERVER = process.env.PLAYWRIGHT_REUSE_SERVER
  ? process.env.PLAYWRIGHT_REUSE_SERVER === "1"
  : !process.env.CI;
const WORKERS = process.env.PLAYWRIGHT_WORKERS
  ? Number(process.env.PLAYWRIGHT_WORKERS)
  : process.env.CI ? 2 : undefined;
const RETRIES = process.env.PLAYWRIGHT_RETRIES
  ? Number(process.env.PLAYWRIGHT_RETRIES)
  : process.env.CI ? 2 : 0;
const CAPTURE_ARTIFACTS = process.env.PLAYWRIGHT_ARTIFACTS !== "0";

const executableCandidates = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  "/bin/chromium",
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"]!, "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
];
const CHROMIUM_EXECUTABLE_PATH = executableCandidates
  .find((candidate): candidate is string => !!candidate && existsSync(candidate));
const chromiumLaunch = CHROMIUM_EXECUTABLE_PATH
  ? { launchOptions: { executablePath: CHROMIUM_EXECUTABLE_PATH } }
  : {};

const fullSuiteProjects = [
  {
    name: "mobile-375",
    use: {
      ...devices["Desktop Chrome"],
      ...chromiumLaunch,
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
    },
  },
  {
    name: "tablet-768",
    use: {
      ...devices["Desktop Chrome"],
      ...chromiumLaunch,
      viewport: { width: 768, height: 1024 },
      isMobile: true,
      hasTouch: true,
    },
  },
  {
    name: "desktop-1280",
    use: {
      ...devices["Desktop Chrome"],
      ...chromiumLaunch,
      viewport: { width: 1280, height: 800 },
    },
  },
];

const additionalViewportProjects = [
  {
    name: "mobile-320",
    use: {
      ...devices["Desktop Chrome"],
      ...chromiumLaunch,
      viewport: { width: 320, height: 568 },
      isMobile: true,
      hasTouch: true,
    },
  },
  {
    name: "mobile-390",
    use: {
      ...devices["Desktop Chrome"],
      ...chromiumLaunch,
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    },
  },
  {
    name: "landscape-844",
    use: {
      ...devices["Desktop Chrome"],
      ...chromiumLaunch,
      viewport: { width: 844, height: 390 },
      isMobile: true,
      hasTouch: true,
    },
  },
  {
    name: "desktop-1440-short",
    use: {
      ...devices["Desktop Chrome"],
      ...chromiumLaunch,
      viewport: { width: 1440, height: 650 },
    },
  },
  {
    name: "desktop-1440",
    use: {
      ...devices["Desktop Chrome"],
      ...chromiumLaunch,
      viewport: { width: 1440, height: 900 },
    },
  },
];

// Browser installation is outside Slice 0. These projects are opt-in and remain
// BLOCKED until compatible Firefox/WebKit binaries are explicitly provisioned.
const crossBrowserProjects = process.env.PLAYWRIGHT_CROSS_BROWSER === "1"
  ? [
      {
        name: "firefox-smoke-390",
        testMatch: /(?:section-integrity|fullscreen-menu)\.spec\.ts/,
        use: {
          ...devices["Desktop Firefox"],
          viewport: { width: 390, height: 844 },
          hasTouch: true,
        },
      },
      {
        name: "firefox-smoke-1440",
        testMatch: /(?:section-integrity|fullscreen-menu)\.spec\.ts/,
        use: {
          ...devices["Desktop Firefox"],
          viewport: { width: 1440, height: 900 },
        },
      },
      {
        name: "webkit-smoke-390",
        testMatch: /(?:section-integrity|fullscreen-menu)\.spec\.ts/,
        use: {
          ...devices["Desktop Safari"],
          viewport: { width: 390, height: 844 },
          hasTouch: true,
        },
      },
      {
        name: "webkit-smoke-1440",
        testMatch: /(?:section-integrity|fullscreen-menu)\.spec\.ts/,
        use: {
          ...devices["Desktop Safari"],
          viewport: { width: 1440, height: 900 },
        },
      },
    ]
  : [];

export default defineConfig({
  testDir: "./e2e",
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR ?? "test-results",
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
    trace: CAPTURE_ARTIFACTS ? "retain-on-failure" : "off",
    screenshot: CAPTURE_ARTIFACTS ? "only-on-failure" : "off",
    video: CAPTURE_ARTIFACTS ? "retain-on-failure" : "off",
  },
  projects: [...fullSuiteProjects, ...additionalViewportProjects, ...crossBrowserProjects],
  webServer: MANAGED_PREVIEW_URL ? undefined : {
      command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
      url: BASE_URL,
      reuseExistingServer: REUSE_EXISTING_SERVER,
      timeout: 180_000,
      stdout: "ignore",
      stderr: "pipe",
    },
});
