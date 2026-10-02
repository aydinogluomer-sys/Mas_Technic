/* QA 09b-1 R2 — THE OAUTH NOTICE, RE-ATTACKED AFTER CAPABILITY WAS REMOVED
   ==========================================================================
   Four reader-asserting `COPY` entries are gone (`user_banned`,
   `identity_already_exists`, `email_exists`,
   `provider_email_needs_verification`) and `COPY` is now a `Map`. The rule
   written into the file is explicit:

     a notice raised on the strength of a URL fragment may describe THE
     ATTEMPT or THE SITE. It may not assert a fact about the READER.

   This probe re-runs round 1's attacks against the shipped build and then
   asks the packet's real question: what did the removal MISS? The rule was
   applied to the prose. It was not applied to the one channel that renders a
   string the attacker wrote, verbatim, in the site's own page — the
   `KOD:` reference.

   Every case is read off the RENDERED DOM on `/giris`, not from the module.

   NETWORK: guard() at allowHosts=[] with a live canary before anything is
   navigated. No auth method is called and no control that starts one is
   pressed. U1-U7 are not attempted.
   ========================================================================== */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { guard, canary, chromiumExecutable } from "../../reports/09b1c1/probe-lib.mjs";
import { preview, URL_BASE } from "./09b1r2-lib.mjs";

const OUT = "reports/qa/phase-09b1r2";
mkdirSync(OUT, { recursive: true });
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const rows = [];

/* ── THE PAYLOADS ─────────────────────────────────────────────────────────
   `expect` says what SHOULD happen if the file's own claims are true.
     fallback  the generic notice, no borrowed prose
     copy      a whitelisted entry's prose
     noref     notice rendered, reference suppressed entirely
     ref:X     reference rendered as exactly X
   `class` groups them for the report. */
const CASES = [
  /* 1 — the five inherited names. Round 1's prototype defect. */
  ...["constructor", "__proto__", "toString", "valueOf", "hasOwnProperty"].map((c) => ({
    cls: "inherited-name", code: c, expect: "fallback",
  })),
  /* 2 — the four removed reader-asserting entries. */
  ...["user_banned", "identity_already_exists", "email_exists", "provider_email_needs_verification"].map((c) => ({
    cls: "removed-entry", code: c, expect: "fallback",
  })),
  /* 3 — the whitelist that remains. Each must still describe the ATTEMPT or
     THE SITE and never the reader; the prose is captured so that can be read. */
  ...["access_denied", "provider_disabled", "oauth_provider_not_supported", "validation_failed",
    "signup_disabled", "bad_oauth_state", "bad_oauth_callback", "flow_state_expired",
    "flow_state_not_found"].map((c) => ({ cls: "surviving-copy", code: c, expect: "copy" })),
  /* 4 — the reference filter. Round 1 rendered `sifrenizi-yeniden-girin`. */
  { cls: "reference-filter", code: "sifrenizi-yeniden-girin", expect: "noref", note: "round 1's finding — hyphens" },
  { cls: "reference-filter", code: "sifrenizi_yeniden_girin", expect: "ref", note: "DISCLOSED as still admitted" },
  { cls: "reference-filter", code: "USER_BANNED", expect: "ref", note: "capitals are lowercased, not rejected" },
  { cls: "reference-filter", code: "  user_banned  ", expect: "ref", note: "whitespace is trimmed" },
  { cls: "reference-filter", code: "şifrenizi_girin", expect: "noref", note: "non-ASCII" },
  { cls: "reference-filter", code: "_leading", expect: "noref" },
  { cls: "reference-filter", code: "trailing_", expect: "noref" },
  { cls: "reference-filter", code: "a_b_c_d_e_f", expect: "noref", note: "six segments, limit is five" },
  { cls: "reference-filter", code: "a_b_c_d_e", expect: "ref", note: "five segments, at the limit" },
  { cls: "reference-filter", code: "x".repeat(41), expect: "noref", note: "41 chars, limit is 40" },
  { cls: "reference-filter", code: "x".repeat(40), expect: "ref", note: "40 chars, at the limit" },
  { cls: "reference-filter", code: "https://evil.example.com", expect: "noref" },
  { cls: "reference-filter", code: "destek@evil.example.com", expect: "noref" },
  { cls: "reference-filter", code: "<img src=x onerror=alert(1)>", expect: "noref" },
  { cls: "reference-filter", code: "javascript:alert(1)", expect: "noref" },
  /* 5 — WHAT THE REMOVAL MISSED. The assertion rule was applied to the prose
     and not to the reference. These are the same class of claim as the four
     entries that were deleted, delivered through the channel that survived. */
  { cls: "reader-assertion-via-reference", code: "hesabiniz_kapatildi", expect: "ref",
    note: "'your account has been closed' — the deleted user_banned sentence, in the reader's language" },
  { cls: "reader-assertion-via-reference", code: "eposta_adresiniz_zaten_kayitli", expect: "ref",
    note: "'your e-mail address is already registered' — the deleted identity_already_exists sentence" },
  { cls: "reader-assertion-via-reference", code: "hesabiniz_askiya_alindi", expect: "ref",
    note: "'your account has been suspended'" },
  { cls: "reader-assertion-via-reference", code: "sifrenizi_buraya_yazin", expect: "ref",
    note: "'type your password here'" },
  /* 6 — THE COMMENT SAYS THE REFERENCE CANNOT BE A PHONE NUMBER. */
  { cls: "phone-number", code: "destek_05551234567", expect: "ref",
    note: "oauth-return.ts says the rendered reference 'cannot be a URL, an e-mail address, a PHONE NUMBER'" },
  { cls: "phone-number", code: "whatsapp_05551234567", expect: "ref" },
  { cls: "phone-number", code: "05551234567", expect: "noref", note: "a bare number: first segment must start [a-z]" },
  /* 7 — combinations. The bucket supplies plausible site prose while the
     specific code supplies the attacker's string. */
  { cls: "combination", error: "access_denied", code: "hesabiniz_kapatildi", expect: "copy+ref",
    note: "whitelisted prose + a reader-fact reference, from one crafted link" },
  { cls: "combination", error: "server_error", code: "constructor", expect: "fallback" },
  { cls: "combination", error: "access_denied", code: "", expect: "copy", note: "bucket only" },
  { cls: "combination", description: "Parolanizi dogrulamak icin buraya yazin", expect: "fallback",
    note: "description alone raises the notice; the prose itself is never rendered" },
];

const read = async (page) => page.evaluate(() => {
  const n = document.querySelector(".shell-notice, [data-shell-notice]")
    ?? Array.from(document.querySelectorAll("*")).find((e) => /GİRİŞ TAMAMLANAMADI|İZİN VERİLMEDİ|SAĞLAYICI KAPALI|KAYIT KAPALI|OTURUM DÜŞTÜ|HESAP KAPALI/.test(e.textContent ?? "") && e.children.length < 12);
  if (!n) return { rendered: false };
  const t = (el) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
  const hint = Array.from(n.querySelectorAll(".shell-field-hint")).map(t).find((s) => s.startsWith("KOD:"));
  return {
    rendered: true,
    text: t(n).slice(0, 300),
    reference: hint ? hint.replace(/^KOD:\s*/, "") : null,
    href: location.href,
  };
});

const run = async () => {
  const stop = await preview();
  const browser = await chromium.launch(chromiumExecutable() ? { executablePath: chromiumExecutable() } : {});
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    await guard(ctx, []);
    const page = await ctx.newPage();
    await page.goto(`${URL_BASE}/giris`, { waitUntil: "domcontentloaded" });
    await canary(page, log);
    log("");

    for (const c of CASES) {
      const frag = new URLSearchParams();
      if (c.error) frag.set("error", c.error);
      if (c.code !== undefined && c.code !== "") frag.set("error_code", c.code);
      if (c.description) frag.set("error_description", c.description);
      /* A FRESH DOCUMENT EACH TIME, AND THIS LINE IS LOAD-BEARING. The first
         run of this probe navigated `/giris#a` → `/giris#b` directly and every
         one of the thirty direct cases came back `rendered=false`. That was
         not the filter working: a `goto` that changes only the fragment is a
         SAME-DOCUMENT navigation, so `Login` never remounted and the
         module-level `consumed` latch was never re-armed. Thirty cases that
         had not run would have read as thirty cases that passed. The bounce
         control rendered on the same selector, which is what exposed it.
         `about:blank` in between forces a real document load. */
      await page.goto("about:blank");
      await page.goto(`${URL_BASE}/giris#${frag.toString()}`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("#root", { state: "visible", timeout: 20_000 });
      const dl = Date.now() + 20_000;
      while (await page.locator(".shell-boot").count() && Date.now() < dl) await page.waitForTimeout(200);
      await page.waitForTimeout(700);
      const got = await read(page);
      rows.push({ ...c, got });
    }

    /* ── THE BOUNCE, WHICH IS THE ONLY PATH RULE 1 ADMITS ────────────────── */
    log("── the protected-route bounce (`/musteri-paneli` → `/giris`), rule 1's one admitted shape");
    for (const code of ["user_banned", "hesabiniz_kapatildi", "access_denied"]) {
      await page.goto(`${URL_BASE}/musteri-paneli#error=access_denied&error_code=${encodeURIComponent(code)}`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("#root", { state: "visible", timeout: 20_000 });
      await page.waitForTimeout(2500);
      const got = await read(page);
      log(`  error_code=${code.padEnd(22)} url=${got.href ? new URL(got.href).pathname : "?"} rendered=${got.rendered} ref=${JSON.stringify(got.reference)}`);
      log(`      ${(got.text ?? "").slice(0, 180)}`);
      rows.push({ cls: "bounce", code, expect: "-", got });
    }
    log("");

    /* ── REPORT ──────────────────────────────────────────────────────────── */
    let lastCls = "";
    for (const r of rows) {
      if (r.cls !== lastCls) { log(""); log(`── ${r.cls}`); lastCls = r.cls; }
      const shown = JSON.stringify(r.code ?? r.description ?? r.error ?? "").slice(0, 46);
      log(`  ${shown.padEnd(48)} rendered=${String(r.got.rendered).padEnd(5)} ref=${JSON.stringify(r.got.reference)}`);
      if (r.note) log(`      note: ${r.note}`);
      if (r.got.rendered) log(`      copy: ${(r.got.text ?? "").slice(0, 190)}`);
    }
    log("");
    const banned = rows.filter((r) => (r.got.text ?? "").includes("HESAP KAPALI"));
    log(`"HESAP KAPALI" rendered in ${banned.length} of ${rows.length} cases (round 1 rendered it)`);
    const refs = rows.filter((r) => r.got.reference);
    log(`a reference was rendered in ${refs.length} cases: ${refs.map((r) => r.got.reference).join(", ")}`);
    writeFileSync(`${OUT}/oauth-attack.json`, JSON.stringify(rows, null, 1));
  } finally {
    await browser.close();
    await stop();
    writeFileSync(`${OUT}/oauth-attack.txt`, lines.join("\n") + "\n");
  }
};
run().catch((e) => { lines.push(`PROBE ERROR: ${e && e.stack}`); writeFileSync(`${OUT}/oauth-attack.txt`, lines.join("\n") + "\n"); console.error(e); process.exit(1); });
