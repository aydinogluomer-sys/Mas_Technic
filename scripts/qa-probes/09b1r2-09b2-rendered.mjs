/* QA 09b-2 — WHAT THE READER SEES, read from the rendered DOM and not the source
   ==========================================================================
   The packet's premise was that `/cerez-politikasi` publishes a host list that
   omits `sentry.hcaptcha.com`. The Coder says there is no published list — the
   list is a header comment — and the rendered clauses name the registrable
   domain `hcaptcha.com`, which covers every subdomain. That is decided by the
   text the browser renders, so that is what is read here.

   Also read: the "tek yer" sentence, D3's enumeration, the `mas-technic-theme`
   row, "iki çerçeve", Google Fonts, and the six software-inventory sites.
   NETWORK: guard() at allowHosts=[], canary first. Read-only.
   ========================================================================== */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { guard, canary, chromiumExecutable } from "./probe-lib.mjs";
import { preview, URL_BASE } from "./09b1r2-lib.mjs";

const OUT = "reports/qa/phase-09b1r2";
mkdirSync(OUT, { recursive: true });
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
let bad = 0;
const check = (label, ok, detail) => { if (!ok) bad++; log(`  ${ok ? "ok  " : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`); };

const settle = async (page) => {
  await page.waitForSelector("#root", { state: "visible", timeout: 30_000 });
  const dl = Date.now() + 30_000;
  while (await page.locator(".shell-boot").count() && Date.now() < dl) await page.waitForTimeout(250);
  await page.waitForTimeout(800);
};
/* visible text only: comments never reach the DOM, hidden nodes are excluded */
const textOf = (page) => page.evaluate(() => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const el = n.parentElement;
      if (!el) return NodeFilter.FILTER_REJECT;
      const s = getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden" || el.closest("script,style,noscript")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let out = "";
  while (walker.nextNode()) out += walker.currentNode.textContent + " ";
  return out.replace(/\s+/g, " ");
});

const run = async () => {
  const stop = await preview();
  const browser = await chromium.launch(chromiumExecutable() ? { executablePath: chromiumExecutable() } : {});
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    await guard(ctx, []);
    const page = await ctx.newPage();
    await page.goto(`${URL_BASE}/`, { waitUntil: "domcontentloaded" });
    await canary(page, log);
    log("");

    const T = {};
    for (const r of ["/cerez-politikasi", "/gizlilik-politikasi", "/kvkk", "/hizmetler/fikstur-aparat-tasarimi", "/endustriyel/ozel-projeler"]) {
      await page.goto(`${URL_BASE}${r}`, { waitUntil: "domcontentloaded" });
      await settle(page);
      T[r] = await textOf(page);
      log(`rendered ${r}: ${T[r].length} chars`);
    }
    log("");

    log("── 1. hCaptcha hosts, as RENDERED (the packet's premise)");
    for (const r of ["/cerez-politikasi", "/gizlilik-politikasi", "/kvkk"]) {
      const t = T[r];
      const subs = (t.match(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.hcaptcha\.com\b/gi) ?? []);
      check(`${r} names the registrable domain hcaptcha.com`, /\bhcaptcha\.com\b/i.test(t));
      check(`${r} enumerates NO hcaptcha subdomain`, subs.length === 0, subs.length ? `found: ${[...new Set(subs)].join(", ")}` : "none");
      check(`${r} does not name sentry.hcaptcha.com`, !/sentry\.hcaptcha/i.test(t));
    }
    const cz = T["/cerez-politikasi"];
    check("/cerez-politikasi says a FAILED widget load also produces a request to the same domain",
      /başarısız|yüklenemez|yüklenemediğinde|yüklenemezse|başarısız olduğunda/i.test(cz) && /hcaptcha\.com/i.test(cz),
      (cz.match(/[^.]*(?:başarısız|yüklenem)[^.]*\./i) ?? ["(no sentence found)"])[0].slice(0, 220));
    check("/cerez-politikasi publishes the rule (observed hosts)", /gözlem|gözlen|ölçül/i.test(cz),
      (cz.match(/[^.]*(?:gözlem|gözlen|ölçül)[^.]*\./i) ?? ["(none)"])[0].slice(0, 220));
    for (const r of ["/cerez-politikasi", "/gizlilik-politikasi", "/kvkk"]) {
      check(`${r} no longer says "iki çerçeve"`, !/iki çerçeve/i.test(T[r]));
    }
    log("");

    log("── 2. Google Fonts named, and named as Google");
    for (const r of ["/cerez-politikasi", "/gizlilik-politikasi", "/kvkk"]) {
      check(`${r} names fonts.googleapis.com or fonts.gstatic.com`, /fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(T[r]));
    }
    log("");

    log('── 3. /gizlilik-politikasi "tek yer"');
    check('"tek yer" is gone from /gizlilik-politikasi', !/tek yer/i.test(T["/gizlilik-politikasi"]));
    log("");

    log("── 4. /kvkk madde 04 — D3 holds and the clause was widened");
    const k = T["/kvkk"];
    const m04 = k.slice(k.search(/tek tek sayılan/i), k.search(/tek tek sayılan/i) + 3500);
    check("the closing sentence 'tek tek sayılan hâllerde' is present", m04.length > 100);
    check("the enumeration names the AI/chat transfer (Google/Gemini)", /Gemini|yapay zek|sohbet/i.test(m04));
    check("the enumeration names the font CDN", /fonts\.googleapis|yazı tipi/i.test(m04));
    check("the enumeration names the OAuth redirect (sağlayıcı / Google / LinkedIn)", /LinkedIn|sağlayıcı/i.test(m04));
    check("the enumeration names hCaptcha", /hcaptcha/i.test(m04));
    log("");

    log("── 5. mas-technic-theme row");
    const row = (cz.match(/[^.]*mas-technic-theme[^.]*\.[^.]*\./i) ?? [""])[0];
    check("row no longer attributes the key to the 3D viewer (it may name the viewer only to deny it)", row.length > 0 && /Arayüz/i.test(row) && !/görüntüleyicisinin/i.test(row), row.slice(0, 220));
    check("row says it is written on every page", /her sayfa|tüm sayfa|her rotada|bütün sayfa/i.test(row), "");
    log("");

    log("── 6. the six software-inventory sites, rendered");
    for (const r of ["/hizmetler/fikstur-aparat-tasarimi", "/endustriyel/ozel-projeler"]) {
      const hits = T[r].match(/CATIA|SolidWorks|\bNX\b|Mastercam/g) ?? [];
      check(`${r} renders no CAD package name`, hits.length === 0, hits.length ? `found: ${hits.join(", ")}` : "none");
      check(`${r} still describes the capability (modelleme / simülasyon / katı model)`, /modelleme|simülasyon|katı model/i.test(T[r]));
    }
    log("");

    log("── 7. the sweep classes, rendered on the three documents");
    for (const r of ["/cerez-politikasi", "/gizlilik-politikasi", "/kvkk"]) {
      const t = T[r];
      const hits = [];
      for (const re of [/\bNDA\b/, /gizlilik sözleşmesi/i, /şifreli|şifrelen|encrypt/i, /\b\d+\s*(gün|ay|yıl)\s*(boyunca|süreyle|saklan)/i, /güvenli(?:dir|ce)? (?:saklan|tutul)/i]) {
        const m = t.match(re); if (m) hits.push(m[0]);
      }
      check(`${r} carries no confidentiality/retention/encryption assurance`, hits.length === 0, hits.length ? `found: ${hits.join(" | ")}` : "");
    }
    log("");
    log(`RESULT: ${bad === 0 ? "all rendered checks hold" : `${bad} check(s) FAILED`}`);
  } finally {
    await browser.close();
    await stop();
    writeFileSync(`${OUT}/09b2-rendered.txt`, lines.join("\n") + "\n");
  }
};
run().catch((e) => { lines.push(`PROBE ERROR: ${e && e.stack}`); writeFileSync(`${OUT}/09b2-rendered.txt`, lines.join("\n") + "\n"); console.error(e); process.exit(1); });
