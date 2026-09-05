/**
 * QA PROBE — expanded capture.
 * `<details>` bodies are excluded from innerText when closed, so the first
 * pass never read 117 of the 117 FAQ ANSWERS. This opens every <details>
 * and also captures all six blog articles.
 */
import { chromium } from "file:///C:/Users/Trade%20Bilisim/precision-dynamics-hub-main/node_modules/playwright/index.mjs";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:4173";
const ROUTES = [
  "/sss",
  "/blog/5-eksen-cnc-isleme-avantajlari",
  "/blog/havacilik-parcalarinda-malzeme-secimi",
  "/blog/dfm-tasarimdan-uretime-gecis",
  "/blog/cnc-torna-frezeleme-farki",
  "/blog/kalite-kontrol-cmm-olcum",
  "/blog/endustriyel-yuzey-islemleri-rehberi",
  "/blog/olmayan-yazi",
  "/kvkk",
  "/cerez-politikasi",
  "/gizlilik-politikasi",
];

const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const out = [];
for (const route of ROUTES) {
  const p = await ctx.newPage();
  const resp = await p.goto(BASE + route, { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  const data = await p.evaluate(() => {
    document.querySelectorAll("details").forEach((d) => d.setAttribute("open", ""));
    const h1s = [...document.querySelectorAll("h1")].map((n) => n.innerText.trim());
    const main = document.querySelector("main") ?? document.body;
    return { h1Count: h1s.length, h1s, text: main.innerText };
  });
  out.push({ route, status: resp.status(), ...data });
  console.log(route, "status=", resp.status(), "h1=", data.h1Count, "|", data.h1s[0]?.replace(/\s+/g, " "), "| chars=", data.text.length);
  await p.close();
}
writeFileSync(join(OUT, "rendered-expanded.json"), JSON.stringify(out, null, 2), "utf8");
writeFileSync(
  join(OUT, "rendered-expanded.txt"),
  out.map((r) => `\n\n======== ${r.route} (h1=${r.h1Count}) ========\n${r.text}`).join(""),
  "utf8",
);
await b.close();
