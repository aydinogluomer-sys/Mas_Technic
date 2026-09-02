#!/usr/bin/env node
/**
 * QA-owned runtime confirmation for the Phase 06 re-verification findings.
 *
 * A string in `dist/` is delivered bytes; a string in the DOM is a claim a
 * buyer reads. Static analysis said these three survive on public service
 * routes — this loads the built site in a real browser and reads them off the
 * rendered page, so the finding does not rest on a grep.
 *
 * Assumes a preview server is already serving the built `dist/`.
 *
 * Usage: node reports/qa/tools/p06b-runtime-claims.mjs [baseURL]
 */
import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? "http://127.0.0.1:4173";

const CHECKS = [
  {
    route: "/hizmetler/malzeme-kutuphanesi",
    label: 'certificate matrix — column "Sertifika" vs the same page\'s spec row',
    needles: ["EN 10204 3.1", "EN 10204 3.2", "Tedarik Süresi ve Sertifika Matrisi", "Talebe bağlı"],
  },
  {
    route: "/hizmetler/kimyasal-islemler",
    label: "unqualified conformity to a standards BODY (no designation, so no token for the gate to key on)",
    needles: ["ASTM standartlarına tam uyum"],
  },
  {
    route: "/hizmetler/qr-datamatrix-kodlari",
    label: "same shape, second page",
    needles: ["ISO/IEC standartlarına tam uyum"],
  },
  {
    route: "/hizmetler/petrol-gaz",
    label: "control — the body copy that WAS swept (these must be absent)",
    needles: ["NACE MR0175", "API 6A", "sour service sertifikalı"],
    expectAbsent: true,
  },
];

// This script's `@playwright/test` resolution asks for browser build 1217;
// the machine carries 1223/1228/1234, which is what `npx playwright test`
// actually drives. Installing a browser is not a QA-owned change, so point at
// an installed build instead. Override with PW_CHROMIUM if the path differs.
const CHROMIUM =
  process.env.PW_CHROMIUM ??
  `${process.env.LOCALAPPDATA}\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe`;
const browser = await chromium.launch({ executablePath: CHROMIUM });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

let found = 0;
console.log("# RUNTIME CLAIM CONFIRMATION — Phase 06 re-verification");
console.log(`# base: ${BASE}`);
console.log("");

for (const check of CHECKS) {
  const res = await page.goto(BASE + check.route, { waitUntil: "networkidle" });
  const status = res?.status();
  // Service pages render their tables below the fold; the text is in the DOM
  // regardless of scroll, so innerText of <main> is the right surface.
  const text = await page.evaluate(() => (document.querySelector("main") ?? document.body).innerText);
  console.log(`## ${check.route}  [HTTP ${status}]  ${check.label}`);
  for (const needle of check.needles) {
    const present = text.includes(needle);
    if (present && !check.expectAbsent) found += 1;
    const mark = check.expectAbsent ? (present ? "PRESENT (unexpected)" : "absent (as expected)") : present ? "PRESENT IN DOM" : "absent";
    console.log(`   ${mark.padEnd(22)} "${needle}"`);
  }
  console.log("");
}

await browser.close();
console.log(`# rendered claim strings confirmed in the DOM: ${found}`);
