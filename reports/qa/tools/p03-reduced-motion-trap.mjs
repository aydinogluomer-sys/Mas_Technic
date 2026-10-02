/* QA-owned. Characterise the reduced-motion modal trap fully:
   what state is the page left in, and can the user recover at all? */
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.PROBE_BASE_URL ?? "http://localhost:4307";
const exe = [process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined]
  .find((p) => p && existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});

const snapshot = (p) => p.evaluate(() => {
  const menu = document.querySelector("[data-fullscreen-menu]");
  const header = document.querySelector("[data-fullscreen-header]");
  const root = document.getElementById("root");
  return {
    menuPresent: !!menu,
    menuVisible: menu ? getComputedStyle(menu).visibility !== "hidden" && Number(getComputedStyle(menu).opacity) > 0 : false,
    bodyOverflow: getComputedStyle(document.body).overflow,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    rootInert: root ? root.hasAttribute("inert") : null,
    rootAriaHidden: root ? root.getAttribute("aria-hidden") : null,
    headerBehindModal: header ? header.className.includes("is-behind-modal") : null,
    headerInert: header ? header.hasAttribute("inert") : null,
    triggerCount: document.querySelectorAll("[data-menu-trigger]").length,
    scrollY: Math.round(window.scrollY),
  };
});

for (const cs of [{ name: "375 reduce", vp: { width: 375, height: 812 }, mobile: true },
                  { name: "1280 reduce", vp: { width: 1280, height: 800 }, mobile: false }]) {
  const c = await browser.newContext({ viewport: cs.vp, isMobile: cs.mobile, hasTouch: cs.mobile, reducedMotion: "reduce" });
  const p = await c.newPage();
  await p.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("[data-fullscreen-header]", { state: "attached" });
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.waitForFunction(() => !document.getElementById("hero-shell")).catch(() => {});
  await p.waitForTimeout(600);

  console.log(`\n===== ${cs.name} =====`);
  console.log("prefers-reduced-motion matches:", await p.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches));
  console.log("before open  :", JSON.stringify(await snapshot(p)));

  await p.locator("[data-menu-trigger]").click();
  await p.waitForSelector("[data-fullscreen-menu]", { state: "visible" });
  await p.waitForTimeout(600);
  console.log("menu open    :", JSON.stringify(await snapshot(p)));

  await p.keyboard.press("Escape");
  await p.waitForTimeout(2500);
  console.log("after ESC #1 :", JSON.stringify(await snapshot(p)));
  await p.keyboard.press("Escape");
  await p.waitForTimeout(2500);
  console.log("after ESC #2 :", JSON.stringify(await snapshot(p)));

  // close button
  await p.locator("[data-fullscreen-menu] [data-menu-trigger]").click({ timeout: 4000 }).catch((e) => console.log("close-btn click threw:", String(e).slice(0, 90)));
  await p.waitForTimeout(2500);
  console.log("after closeBt:", JSON.stringify(await snapshot(p)));

  // can the user still scroll the underlying page?
  await p.mouse.wheel(0, 900);
  await p.waitForTimeout(500);
  console.log("after wheel  :", JSON.stringify(await snapshot(p)));

  // is the trigger reachable by keyboard at all now?
  await p.keyboard.press("Tab");
  console.log("tab target   :", await p.evaluate(() => document.activeElement
    ? `${document.activeElement.tagName}:${(document.activeElement.getAttribute("aria-label") || document.activeElement.textContent || "").trim().slice(0, 30)} insideMenu=${!!document.activeElement.closest("[data-fullscreen-menu]")}` : "NONE"));

  // last resort: does a menu link still navigate away?
  await p.locator("[data-fullscreen-menu]").getByRole("link", { name: "Hakkımızda" }).click({ timeout: 5000 }).catch((e) => console.log("link click threw:", String(e).slice(0, 90)));
  await p.waitForTimeout(2500);
  console.log("after link   :", await p.evaluate(() => location.pathname), JSON.stringify(await snapshot(p)));

  await c.close();
}
await browser.close();
