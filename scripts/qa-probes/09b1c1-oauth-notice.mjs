/* 09b-1-C2 — D2, D3 AND THE STALE NOTICE, MEASURED ON THE SHIPPED BUILD
   ══════════════════════════════════════════════════════════════════════════
   Four questions, none of them answerable by reading the diff.

     A. PROTOTYPE KEYS. `#error_code=constructor` used to resolve a truthy
        inherited value through `COPY[code]`, skip `|| FALLBACK` and render a
        notice with an empty label and no title — the fallback bypassed by the
        exact case it exists for. Every own-property-only fix looks right in a
        diff; this renders each of the five and reads the DOM.

     B. WHAT THE NOTICE ASSERTS. Four entries were removed because they
        asserted a fact about the READER on the strength of a fragment. The
        test is not that the key is gone from a file — it is that
        `#error_code=user_banned` no longer paints "HESAP KAPALI" on a sign-in
        page, and that the code survives underneath so support loses nothing.

     C. THE REFERENCE. QA rendered `KOD: sifrenizi-yeniden-girin` under a
        comment claiming a reference "cannot hold an instruction". Both the
        string QA rendered and the underscore variant the new shape still
        admits are rendered here, because the residue is disclosed rather than
        claimed away.

     D. THE AGE BOUND, AND THIS IS THE ONE THAT NEEDS A NUMBER. The bound has
        to sit above the slowest GENUINE return and far below anything a
        reader spends on a page. So `performance.now()` is captured at the
        instant the notice enters the DOM — by a `MutationObserver` installed
        before the first byte of the app, not by polling afterwards — for the
        real protected-route bounce and a direct return, warm and again under
        6× CPU throttling with the network held at 3G, which is the slowest
        first paint this build can be made to produce locally.

   NETWORK POSTURE. Nothing here signs in. `signInWithOAuth` is never called;
   every case is a crafted RETURN, which is a URL and a render. `guard()`
   aborts everything that is not this probe's own `dist/` server and
   `canary()` proves it before the first case.
   ══════════════════════════════════════════════════════════════════════════ */
import { mkdirSync, writeFileSync } from "node:fs";
import { canary, guard, launch, serveDist } from "./09b1c1-lib.mjs";

const OUT = "reports/09b1c2";

/* Installed before the app runs, so the timestamp is the DOM insertion and
   not the moment a poll happened to look. */
const WATCH = () => {
  window.__notices = [];
  const record = (el) => {
    window.__notices.push({
      at: +performance.now().toFixed(1),
      label: el.querySelector(".shell-notice-label")?.textContent?.trim()
        ?? el.querySelector("[class*='label']")?.textContent?.trim() ?? "",
      text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 260),
      path: location.pathname,
    });
  };
  /* `document`, not `document.documentElement`: an init script runs before the
     parser has created `<html>`, so observing the element silently observes
     nothing — which is exactly how the first run of this probe reported "NO
     NOTICE" for cases a direct DOM read shows are rendered. */
  new MutationObserver((records) => {
    for (const r of records) {
      for (const node of Array.from(r.addedNodes)) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.matches?.(".shell-notice")) record(node);
        node.querySelectorAll?.(".shell-notice").forEach(record);
      }
    }
  }).observe(document, { childList: true, subtree: true });
};

/* The observer gives the AGE; the live DOM read gives the ground truth. Both
   are reported so a silent observer can never again be read as an absent
   notice. */
const readNotices = (page) => page.evaluate(() => ({
  notices: window.__notices ?? [],
  live: Array.from(document.querySelectorAll(".shell-notice")).map((el) => ({
    label: el.querySelector(".shell-notice-label")?.textContent?.trim() ?? "",
    text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 260),
    path: location.pathname,
    at: null,
  })),
  href: location.href,
  hash: location.hash,
  now: +performance.now().toFixed(1),
  /* DID `Login` ACTUALLY MOUNT? Without this, "no notice" on a very slow
     profile is ambiguous between "the age bound suppressed it" and "the page
     never got there", and the first run of the 20x profile was exactly that
     ambiguity. `readOAuthReturn` is called from `Login`'s mount effect, so a
     rendered sign-in form means the decision was made. */
  loginMounted: /Giriş Yap/i.test(document.querySelector("h1")?.textContent ?? "")
    || !!document.querySelector("form input[type='password']"),
}));

/** The OAuth notice, preferring the timestamped record over the live read. */
const pick = (state) => {
  const not = (n) => n.label !== "SIRADA NE VAR";
  return state.notices.filter(not)[0] ?? state.live.filter(not)[0] ?? null;
};

const CASES = [
  /* A — the five inherited names. */
  { id: "proto-constructor", path: "/giris#error=server_error&error_code=constructor" },
  { id: "proto-__proto__", path: "/giris#error=server_error&error_code=__proto__" },
  { id: "proto-toString", path: "/giris#error=server_error&error_code=toString" },
  { id: "proto-valueOf", path: "/giris#error=server_error&error_code=valueOf" },
  { id: "proto-hasOwnProperty", path: "/giris#error=server_error&error_code=hasOwnProperty" },
  /* The same names in the BUCKET parameter, which is the second lookup. */
  { id: "proto-bucket-constructor", path: "/giris#error=constructor" },

  /* B — the four assertions that were withdrawn, and one that was kept. */
  { id: "assert-user_banned", path: "/giris#error=server_error&error_code=user_banned" },
  { id: "assert-identity_already_exists", path: "/giris#error=server_error&error_code=identity_already_exists" },
  { id: "assert-email_exists", path: "/giris#error=server_error&error_code=email_exists" },
  { id: "assert-provider_email_needs_verification", path: "/giris#error=server_error&error_code=provider_email_needs_verification" },
  { id: "kept-access_denied", path: "/giris#error=access_denied&error_code=access_denied" },
  { id: "kept-flow_state_expired", path: "/giris#error=server_error&error_code=flow_state_expired" },
  { id: "kept-provider_disabled", path: "/giris#error=server_error&error_code=provider_disabled" },

  /* C — the reference shape. */
  { id: "ref-qa-sentence", path: "/giris#error=server_error&error_code=sifrenizi-yeniden-girin" },
  { id: "ref-underscore-sentence", path: "/giris#error=server_error&error_code=sifrenizi_yeniden_girin" },
  { id: "ref-punctuation", path: "/giris#error=server_error&error_code=" + encodeURIComponent("bizi arayin: 0555 555 55 55") },
  { id: "ref-url", path: "/giris#error=server_error&error_code=" + encodeURIComponent("https://mas-technic.example/giris") },
  { id: "ref-uppercase", path: "/giris#error=server_error&error_code=USER_BANNED" },
  { id: "ref-too-long", path: "/giris#error=server_error&error_code=" + "a".repeat(41) },
  { id: "ref-real-longest", path: "/giris#error=server_error&error_code=provider_email_needs_verification" },
];

/* D — the age cases. `bounce` is the genuine shape: a fragment on the
   protected route, which `CustomerProtectedRoute` bounces to `/giris` inside
   the same document. */
const STALE_CASES = [
  { from: "/malzemeler", waitMs: 1500 },
  { from: "/malzemeler", waitMs: 20000 },
  { from: "/sss", waitMs: 1500 },
  { from: "/", waitMs: 1500 },
];

const AGE_CASES = [
  { id: "bounce", path: "/musteri-paneli#error=server_error&error_code=bad_oauth_state" },
  { id: "direct", path: "/giris#error=server_error&error_code=bad_oauth_state" },
];

const run = async () => {
  mkdirSync(OUT, { recursive: true });
  const site = await serveDist();
  const browser = await launch();
  const log = [];
  const results = { cases: [], ages: [], stale: [] };
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      reducedMotion: "reduce",
    });
    await context.addInitScript(WATCH);
    const net = await guard(context, site.base);
    const probe = await context.newPage();
    await probe.goto(`${site.base}/giris`, { waitUntil: "load" });
    await canary(probe, (m) => log.push(m));
    await probe.close();

    /* ── A, B, C ────────────────────────────────────────────────────────── */
    for (const c of CASES) {
      const page = await context.newPage();
      await page.goto(`${site.base}${c.path}`, { waitUntil: "load" });
      await page.waitForTimeout(1200);
      const state = await readNotices(page);
      const notice = pick(state);
      const kod = notice?.text.match(/KOD:\s*([^\s]+)/)?.[1] ?? null;
      results.cases.push({
        id: c.id,
        path: c.path,
        rendered: !!notice,
        label: notice?.label ?? null,
        emptyLabel: notice ? notice.label.length === 0 : null,
        text: notice?.text ?? null,
        reference: kod,
        hashCleared: state.hash === "",
      });
      await page.close();
    }

    /* ── D: the age of a genuine return, warm and throttled ───────────────
       The last profile is deliberately WORSE than anything a phone does. It is
       not a claim about a real device; it is the question "where does the age
       bound start silencing a genuine failure?", asked rather than assumed. */
    const PROFILES = [
      { id: "warm", cpu: 0, latency: 0, down: 0, wait: 2500 },
      { id: "6x CPU + 3G", cpu: 6, latency: 300, down: (1.6 * 1024 * 1024) / 8, wait: 25000 },
      { id: "20x CPU + 2G", cpu: 20, latency: 800, down: (280 * 1024) / 8, wait: 60000 },
    ];
    for (const p of PROFILES) {
      for (const c of AGE_CASES) {
        const page = await context.newPage();
        if (p.cpu) {
          const cdp = await context.newCDPSession(page);
          await cdp.send("Emulation.setCPUThrottlingRate", { rate: p.cpu });
          await cdp.send("Network.enable");
          await cdp.send("Network.emulateNetworkConditions", {
            offline: false,
            latency: p.latency,
            downloadThroughput: p.down,
            uploadThroughput: (750 * 1024) / 8,
          });
        }
        await page.goto(`${site.base}${c.path}`, { waitUntil: "load" });
        await page.waitForTimeout(p.wait);
        const state = await readNotices(page);
        const notice = pick(state);
        results.ages.push({
          id: c.id,
          profile: p.id,
          rendered: !!notice,
          ageMs: notice?.at ?? null,
          landedOn: notice?.path ?? null,
          label: notice?.label ?? null,
          documentAgeAtReadMs: state.now,
          loginMounted: state.loginMounted,
        });
        log.push(`age ${c.id} (${p.id}) — ${notice ? `${notice.at} ms on ${notice.path}` : `NO NOTICE (document was ${state.now} ms old at read)`}`);
        await page.close();
      }
    }

    /* ── D: the stale case QA reproduced, with no session at all ────────── */
    for (const { from, waitMs } of STALE_CASES) {
      const page = await context.newPage();
      await page.goto(`${site.base}${from}#error=server_error&error_code=access_denied`, { waitUntil: "load" });
      await page.waitForTimeout(waitMs);
      /* A CLIENT-SIDE navigation inside the SAME document — the whole point.
         React Router's history listens to `popstate`, so this is the same
         transition a link click makes, without depending on a link's copy. */
      await page.evaluate(() => {
        history.pushState({}, "", "/giris");
        window.dispatchEvent(new PopStateEvent("popstate"));
      });
      await page.waitForTimeout(1500);
      const state = await readNotices(page);
      const notice = pick(state);
      results.stale.push({
        from,
        waitedMs: waitMs,
        reachedGiris: await page.evaluate(() => location.pathname === "/giris"),
        rendered: !!notice,
        ageMs: notice?.at ?? null,
        label: notice?.label ?? null,
        hash: state.hash,
        documentAgeAtEndMs: state.now,
      });
      await page.close();
    }

    log.push(`network — requested ${net.requested.length}, blocked ${net.blocked.length}, allowed ${net.allowed.length}`);
    if (net.allowed.length) throw new Error("A non-loopback request was ALLOWED — aborting.");
    await context.close();
  } finally {
    await browser.close();
    await site.close();
  }

  const out = ["09b-1-C2 — OAUTH NOTICE: PROTOTYPE, ASSERTION, REFERENCE, AGE", ""];
  out.push("A/B/C — ONE DOCUMENT PER CASE");
  for (const c of results.cases) {
    out.push(`  ${c.id.padEnd(38)} label=${JSON.stringify(c.label)} ref=${JSON.stringify(c.reference)}`);
    if (c.text) out.push(`      ${c.text}`);
  }
  out.push("", "D — AGE OF A GENUINE RETURN (performance.now() at DOM insertion)");
  for (const a of results.ages) {
    out.push(`  ${a.id.padEnd(8)} ${a.profile.padEnd(13)} ${String(a.ageMs).padStart(9)} ms  landed=${a.landedOn}  ${a.label ?? "NO NOTICE — login mounted=" + a.loginMounted + ", doc " + a.documentAgeAtReadMs + " ms old"}`);
  }
  out.push("", "D — THE STALE CASE, NO SESSION, SAME DOCUMENT");
  for (const s of results.stale) {
    out.push(`  ${s.from.padEnd(12)} waited ${String(s.waitedMs).padStart(6)} ms → /giris=${s.reachedGiris}  notice=${s.rendered}  age=${s.ageMs}  label=${s.label}  hash=${JSON.stringify(s.hash)}  docAge=${s.documentAgeAtEndMs}`);
  }
  out.push("", ...log);

  writeFileSync(`${OUT}/oauth-notice.json`, JSON.stringify(results, null, 2));
  writeFileSync(`${OUT}/oauth-notice.txt`, out.join("\n") + "\n");
  console.log(out.join("\n"));
};

run().catch((e) => { console.error(e); process.exit(1); });
