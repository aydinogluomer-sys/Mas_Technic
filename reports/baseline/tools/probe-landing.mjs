/**
 * Phase 00 throwaway diagnostic.
 * Loads the built preview at http://localhost:4173/ and reports whether the
 * React tree actually mounted, plus every console/page error. Used to find the
 * root cause of the failing landing e2e specs without changing any src file.
 *
 * Usage: node reports/baseline/tools/probe-landing.mjs [url]
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const url = process.argv[2] ?? "http://localhost:4173/";

// Mirrors playwright.config.ts: the bundled Playwright browser revision does
// not match what is installed under ~/AppData/Local/ms-playwright on this host,
// so the suite (and this probe) drive the locally installed Chrome/Edge binary.
const executablePath = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((candidate) => !!candidate && existsSync(candidate));

const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const messages = [];
page.on("console", (m) => messages.push(`[console:${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => messages.push(`[pageerror] ${e.message}`));
page.on("requestfailed", (r) => messages.push(`[requestfailed] ${r.url()} :: ${r.failure()?.errorText}`));

const response = await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

const rootHtmlLength = await page.locator("#root").innerHTML().then((h) => h.length).catch(() => -1);
const tlRootCount = await page.locator("[data-testid=technical-landing-root]").count();
const heroShellCount = await page.locator("#hero-shell").count();
const bodyText = await page.locator("body").innerText().catch(() => "");

console.log("URL:", url);
console.log("HTTP_STATUS:", response?.status());
console.log("ROOT_INNERHTML_LENGTH:", rootHtmlLength);
console.log("TECHNICAL_LANDING_ROOT_COUNT:", tlRootCount);
console.log("HERO_SHELL_STILL_IN_DOM:", heroShellCount);
console.log("HTML_DATA_INTRO_ACTIVE:", await page.evaluate(() => document.documentElement.hasAttribute("data-intro-active")));
console.log("BODY_TEXT_FIRST_400:", JSON.stringify(bodyText.slice(0, 400)));
console.log("--- CONSOLE / ERRORS ---");
console.log(messages.length ? messages.join("\n") : "(none)");

await browser.close();
