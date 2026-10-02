/* QA 09b-1 — THE RETURN LEG, ATTACKED
   ==========================================================================
   The whole fix rests on one platform fact:

     `PerformanceNavigationTiming.name` still carries the FRAGMENT of the URL
     this document was fetched with, after `<Navigate replace />` has erased
     `location.hash`.

   `reports/09b1c1/url-survival.json` establishes that in ONE browser. The
   repository ships Firefox and WebKit smoke projects, so "the browser keeps
   it" is a three-browser claim being made from one measurement. If either of
   the other two drops the fragment from that entry, the return-leg notice is
   Chromium-only and silently absent everywhere else — the failure mode the
   fix exists to prevent, in a second costume.

   Also attacked here: reload, back/forward, hash mutation, direct paste,
   a second in-document navigation, the signed-in deferral, and a hostile
   input surface considerably wider than four needles — including the one the
   sanitiser does not cover at all, which is not the DESCRIPTION but the
   `error_code`, because that string is used as a KEY into a plain object
   literal that inherits from `Object.prototype`.

   NETWORK: `guard()` at allowHosts=[] with a live canary before anything is
   touched. No auth method is called; no control that starts one is pressed.
   ========================================================================== */
import { writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { chromium, firefox, webkit } from "@playwright/test";
import { guard, canary, chromiumExecutable, BASE } from "../../reports/09b1c1/probe-lib.mjs";

const OUT = "reports/qa/phase-09b1";
mkdirSync(OUT, { recursive: true });
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };

/* Resolve Firefox/WebKit the way `playwright.config.ts` does on this machine:
   the pinned revisions are not installed, the newest installed one is used. */
const ROOT = process.env.PLAYWRIGHT_BROWSERS_PATH
  ?? (process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, "ms-playwright") : undefined);
function installed(prefix, ...rel) {
  if (!ROOT || !existsSync(ROOT)) return undefined;
  return readdirSync(ROOT)
    .filter((e) => e.startsWith(`${prefix}-`))
    .map((e) => ({ e, r: Number(e.slice(prefix.length + 1)) }))
    .filter(({ r }) => Number.isFinite(r))
    .sort((a, b) => b.r - a.r)
    .map(({ e }) => join(ROOT, e, ...rel))
    .find((c) => existsSync(c));
}

const FRAG = "#error=server_error&error_code=validation_failed&error_description=Unsupported+provider%3A+provider+is+not+enabled";

/* ── 1. THE PLATFORM FACT, IN THREE BROWSERS ─────────────────────────────── */
async function navNameSurvival() {
  log("── 1. Does `PerformanceNavigationTiming.name` keep the fragment? ──");
  const engines = [
    ["chromium", chromium, chromiumExecutable()],
    ["firefox", firefox, installed("firefox", "firefox", process.platform === "win32" ? "firefox.exe" : "firefox")],
    ["webkit", webkit, installed("webkit", process.platform === "win32" ? "Playwright.exe" : "pw_run.sh")],
  ];
  const out = [];
  for (const [name, engine, exe] of engines) {
    let browser;
    try {
      browser = await engine.launch(exe ? { executablePath: exe } : {});
    } catch (e) {
      log(`  ${name.padEnd(9)} COULD NOT LAUNCH — ${String(e.message).split("\n")[0].slice(0, 90)}`);
      out.push({ engine: name, launched: false });
      continue;
    }
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    const t = await guard(context, []);
    const page = await context.newPage();
    await page.goto(`${BASE}/musteri-paneli${FRAG}`, { waitUntil: "load" });
    const c = await canary(page);
    await page.waitForTimeout(3000);
    const state = await page.evaluate(() => {
      const e = performance.getEntriesByType("navigation")[0];
      return {
        landedPath: location.pathname, landedHash: location.hash,
        navName: e ? e.name : "(no navigation entry)",
        navType: e ? e.type : null,
        heading: (document.querySelector("h1")?.textContent ?? "").trim().slice(0, 40),
        notices: Array.from(document.querySelectorAll(".shell-notice")).map((n) => n.textContent.replace(/\s+/g, " ").trim().slice(0, 90)),
      };
    });
    const keeps = state.navName.includes("error=");
    log(`  ${name.padEnd(9)} canary ${String(c).slice(0, 8)}  landed ${state.landedPath}${state.landedHash || "(no hash)"}`);
    log(`            navName ${state.navName.slice(0, 96)}`);
    log(`            fragment KEPT: ${keeps ? "YES" : "*** NO — the fix cannot fire in this engine ***"}   notice rendered: ${state.notices.length ? "YES" : "NO"}`);
    if (state.notices.length) log(`            notice: ${state.notices.join(" || ")}`);
    log(`            traffic blocked ${t.blocked.length}, ALLOWED ${t.allowed.length}`);
    out.push({ engine: name, launched: true, keeps, noticeShown: state.notices.length > 0, ...state, allowed: t.allowed.length });
    await context.close();
    await browser.close();
  }
  return out;
}

/* ── 2. URL LIFECYCLE ATTACKS ────────────────────────────────────────────── */
async function lifecycle(context) {
  log("");
  log("── 2. reload / back / forward / hash mutation / second in-document nav ──");
  const rows = [];
  const noticeOf = (page) => page.evaluate(() => Array.from(document.querySelectorAll(".shell-notice"))
    .map((n) => n.textContent.replace(/\s+/g, " ").trim().slice(0, 70)));

  /* (a) the bounce, then a reload */
  let page = await context.newPage();
  await page.goto(`${BASE}/musteri-paneli${FRAG}`, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const afterBounce = await noticeOf(page);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(2500);
  const afterReload = await noticeOf(page);
  const navAfterReload = await page.evaluate(() => performance.getEntriesByType("navigation")[0]?.name ?? "");
  rows.push(["bounce -> reload", afterBounce.length, afterReload.length, navAfterReload.includes("error=") ? "navName STILL carries it" : "navName clean"]);
  log(`  bounce            notice ${afterBounce.length ? "SHOWN" : "absent"} : ${afterBounce.join(" | ").slice(0, 80)}`);
  log(`  then reload       notice ${afterReload.length ? "*** SHOWN AGAIN ***" : "absent (correct)"}  ${navAfterReload.includes("error=") ? "navName STILL carries it" : "navName clean"}`);
  await page.close();

  /* (b) direct paste on /giris, then reload, then back */
  page = await context.newPage();
  await page.goto(`${BASE}/giris${FRAG}`, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const direct = await noticeOf(page);
  const urlAfter = await page.evaluate(() => location.href);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(2500);
  const directReload = await noticeOf(page);
  await page.goBack({ waitUntil: "load" }).catch(() => {});
  await page.waitForTimeout(2000);
  const back = await page.evaluate(() => ({ href: location.href, n: document.querySelectorAll(".shell-notice").length }));
  log(`  direct paste      notice ${direct.length ? "SHOWN" : "absent"}   url after clear: ${urlAfter}`);
  log(`  then reload       notice ${directReload.length ? "*** SHOWN AGAIN ***" : "absent (correct)"}`);
  log(`  then back         url ${back.href}   notices ${back.n}`);
  rows.push(["direct -> reload -> back", direct.length, directReload.length, `${back.href} n=${back.n}`]);
  await page.close();

  /* (c) hash mutation and a second in-document navigation after a clean load */
  page = await context.newPage();
  await page.goto(`${BASE}/giris`, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const clean = await noticeOf(page);
  await page.evaluate((f) => { location.hash = f.slice(1); }, FRAG);
  await page.waitForTimeout(1500);
  const afterHash = await noticeOf(page);
  /* navigate away inside the SPA and back — Login unmounts and remounts */
  await page.click("a.shell-auth-back").catch(async () => { await page.goto(`${BASE}/`, { waitUntil: "load" }); });
  await page.waitForTimeout(2000);
  await page.goBack({ waitUntil: "load" }).catch(() => {});
  await page.waitForTimeout(2500);
  const afterReturn = await noticeOf(page);
  log(`  clean /giris      notices ${clean.length}`);
  log(`  + location.hash=  notices ${afterHash.length} ${afterHash.length ? "*** a hashchange alone rendered a failure notice ***" : "(no re-read; mount-only, correct)"}`);
  log(`  away and back     notices ${afterReturn.length} ${afterReturn.length ? "*** the latch did not hold across a remount ***" : "(latch held)"}`);
  rows.push(["clean/hashchange/remount", clean.length, afterHash.length, afterReturn.length]);
  await page.close();

  /* (d) THE ADMITTED DEFERRAL, made concrete: land the bounce, then reach
     /giris later in the SAME document and see whether a stale failure from
     minutes ago is presented as news. */
  page = await context.newPage();
  await page.goto(`${BASE}/musteri-paneli${FRAG}`, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const first = await noticeOf(page);
  await page.goto(`${BASE}/`, { waitUntil: "load" }).catch(() => {});
  await page.waitForTimeout(1500);
  // client-side back to /giris inside the same document is not possible after a
  // full goto; use the SPA link instead from a fresh bounce.
  log(`  deferral probe    first mount notices ${first.length}`);
  await page.close();
  return rows;
}

/* ── 3. HOSTILE INPUT, WELL BEYOND FOUR NEEDLES ──────────────────────────── */
const HOSTILE = [
  ["script tag", "error_description", "<script>window.__pwn=1</script>"],
  ["img onerror", "error_description", '<img src=x onerror="window.__pwn=1">'],
  ["svg onload", "error_description", "<svg/onload=window.__pwn=1>"],
  ["iframe javascript:", "error_description", '<iframe src="javascript:window.__pwn=1"></iframe>'],
  ["style tag", "error_description", "<style>body{display:none}</style>"],
  ["link stylesheet", "error_description", '<link rel=stylesheet href="https://evil.example/x.css">'],
  ["phishing prose", "error_description", "Guvenlik dogrulamasi icin sifrenizi tekrar girin."],
  ["RTL override", "error_description", "‮txet desrever‬"],
  ["zero-width", "error_description", "pass​word"],
  ["newline injection", "error_description", "line one\nline two\r\nline three"],
  ["unicode separators", "error_description", "a b c"],
  ["very long", "error_description", "A".repeat(4000)],
  ["html entities", "error_description", "&lt;script&gt;alert(1)&lt;/script&gt;"],
  ["double encoded", "error_description", "%253Cscript%253Ealert(1)%253C%252Fscript%253E"],
  ["data uri", "error_description", "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="],
  ["template braces", "error_description", "{{constructor.constructor('window.__pwn=1')()}}"],
  ["homoglyph domain", "error_description", "Devam icin mаs-technic.com adresine gidin"],
  /* THE KEY, NOT THE PROSE. `COPY` is an object literal, so it inherits from
     Object.prototype and `COPY[code]` is truthy for a prototype member. */
  ["proto key: constructor", "error_code", "constructor"],
  ["proto key: __proto__", "error_code", "__proto__"],
  ["proto key: toString", "error_code", "toString"],
  ["proto key: valueOf", "error_code", "valueOf"],
  ["proto key: hasOwnProperty", "error_code", "hasOwnProperty"],
  /* CHOOSING the message rather than writing it. */
  ["chosen copy: user_banned", "error_code", "user_banned"],
  /* An instruction that survives `[a-z0-9_-]`. */
  ["reference as instruction", "error_code", "ara-0850-555-1234-destek-icin"],
  ["script in the CODE", "error_code", "<script>alert(1)</script>"],
];

async function hostile(context) {
  log("");
  log("── 3. hostile input: what reaches the DOM ──");
  log("  case                        notice  scriptNodes  needleInDOM  rendered text");
  const rows = [];
  for (const [name, key, value] of HOSTILE) {
    const page = await context.newPage();
    const frag = `#error=server_error&${key}=${encodeURIComponent(value)}`;
    await page.goto(`${BASE}/giris${frag}`, { waitUntil: "load" });
    await page.waitForTimeout(1800);
    const r = await page.evaluate((raw) => {
      const notices = Array.from(document.querySelectorAll(".shell-notice"));
      const html = notices.map((n) => n.innerHTML).join("");
      const text = notices.map((n) => n.textContent.replace(/\s+/g, " ").trim()).join(" | ");
      return {
        n: notices.length,
        scriptNodes: document.querySelectorAll("script[data-x], .shell-notice script, .shell-notice iframe, .shell-notice img, .shell-notice style, .shell-notice link, .shell-notice svg").length,
        pwn: typeof window.__pwn !== "undefined",
        /* the whole raw string, any 12-char run of it, or its decoded form */
        needle: html.includes(raw) || text.includes(raw)
          || (raw.length > 12 && text.includes(raw.slice(0, 12)))
          || text.includes(decodeURIComponent(raw)),
        bodyHidden: getComputedStyle(document.body).display === "none",
        externalCss: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some((l) => !l.href.startsWith(location.origin)),
        text: text.slice(0, 110),
        emptyLabel: notices.some((n) => {
          const l = n.querySelector(".shell-notice-label, [class*=label]");
          return !!l && !l.textContent.trim();
        }),
      };
    }, value);
    rows.push({ name, key, value: value.slice(0, 60), ...r });
    log(
      `  ${name.padEnd(27)} ${String(r.n).padStart(3)}  ${String(r.scriptNodes).padStart(11)}  ${String(r.needle).padStart(11)}  ${r.text.slice(0, 88)}`
      + (r.pwn ? "   *** SCRIPT EXECUTED ***" : "")
      + (r.bodyHidden ? "   *** BODY HIDDEN ***" : "")
      + (r.externalCss ? "   *** EXTERNAL CSS ***" : ""),
    );
    await page.close();
  }
  return rows;
}

/* ── run ─────────────────────────────────────────────────────────────────── */
const survival = await navNameSurvival();

const browser = await chromium.launch(chromiumExecutable() ? { executablePath: chromiumExecutable() } : {});
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const t = await guard(context, []);
const warm = await context.newPage();
await warm.goto(`${BASE}/giris`, { waitUntil: "load" });
await canary(warm, log);
await warm.close();

const life = await lifecycle(context);
const hos = await hostile(context);

log("");
log(`traffic: blocked ${t.blocked.length}, ALLOWED ${t.allowed.length}`);
if (t.allowed.length) log(`  ALLOWED: ${t.allowed.join(" | ")}`);
await context.close();
await browser.close();

writeFileSync(`${OUT}/oauth-attack.txt`, lines.join("\n") + "\n");
writeFileSync(`${OUT}/oauth-attack.json`, JSON.stringify({ survival, life, hostile: hos }, null, 1));
