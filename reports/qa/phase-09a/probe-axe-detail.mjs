/**
 * QA PHASE 09a — dump the axe violations behind the summary, with the numbers
 * needed to adjudicate a contrast failure rather than restate it.
 *
 * Reaches step 02 with live field errors, which is the state the spec found a
 * serious violation in. No network write: the page is never submitted, and
 * every off-origin request except the font CDN is aborted.
 */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const BASE = "http://localhost:4173";
const FONT_HOSTS = new Set(["fonts.googleapis.com", "fonts.gstatic.com"]);
const blocked = [];

const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});

for (const width of [1280, 375]) {
  const ctx = await b.newContext({ viewport: { width, height: width === 1280 ? 900 : 812 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.route("**/*", async (route, request) => {
    const url = request.url();
    let host = "";
    try { host = new URL(url).hostname; } catch { /* data: */ }
    if (["localhost", "127.0.0.1", "[::1]"].includes(host) || FONT_HOSTS.has(host) || !host) {
      await route.fallback();
      return;
    }
    blocked.push(`${request.method()} ${url}`);
    await route.abort("blockedbyclient");
  });

  await page.goto(BASE + "/teklif-al", { waitUntil: "networkidle" });
  await page.locator("#rfq-cad").setInputFiles({
    name: "qa-part.stl",
    mimeType: "model/stl",
    buffer: Buffer.from("solid qa\nendsolid qa\n"),
  });
  await page.locator("form button[type='submit']").click();
  await page.locator("form button[type='submit']").click();
  await page.waitForTimeout(400);

  const result = await new AxeBuilder({ page }).include("main").analyze();
  console.log(`\n══ ${width} — step 02 with live field errors ══`);
  for (const v of result.violations) {
    console.log(`\n${v.id}  impact=${v.impact}  nodes=${v.nodes.length}`);
    console.log(`  ${v.help}`);
    for (const n of v.nodes) {
      console.log(`  target: ${JSON.stringify(n.target)}`);
      console.log(`  html:   ${n.html.slice(0, 200)}`);
      for (const c of [...n.any, ...n.all, ...n.none]) {
        console.log(`  check ${c.id}: ${c.message}`);
        if (c.data) console.log(`  data:  ${JSON.stringify(c.data)}`);
      }
      const info = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          text: el.textContent?.trim().slice(0, 60),
          color: cs.color,
          background: cs.backgroundColor,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          opacity: cs.opacity,
          disabled: el.disabled ?? null,
          ariaDisabled: el.getAttribute("aria-disabled"),
          rect: { w: Math.round(r.width), h: Math.round(r.height) },
        };
      }, Array.isArray(n.target[0]) ? n.target[0][0] : n.target[0]);
      console.log(`  computed: ${JSON.stringify(info)}`);
    }
  }
  await ctx.close();
}

console.log(`\nblocked off-origin requests: ${blocked.length}`);
for (const entry of new Set(blocked)) console.log(`  ${entry}`);
await b.close();
