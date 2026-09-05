import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { gotoAndSettle } from "./helpers";

/* ══════════════════════════════════════════════════════════════════════════
   QA-OWNED — WHAT THE BROWSER ACTUALLY STORES vs WHAT /cerez-politikasi SAYS

   WHY THIS FILE EXISTS
   --------------------
   `/cerez-politikasi` makes two ABSOLUTE, falsifiable claims about the
   reader's own browser, and until this file nothing in the repository tested
   either of them:

     madde 01  "Herkese açık sayfalarda hiçbir çerez oluşturulmuyor."
     madde 01  "Sakladığı şeyler … hepsi 02. maddede listelenmiştir."

   The second one shipped FALSE and stayed false for the life of the clause.
   `mas_intro_seen` is written by the inline entry script at `index.html:314`,
   which is not a module and therefore never appeared in any grep over
   `src/`; the table listed four records and the browser held five. It was
   found by opening devtools, which is not a test.

   The first one was false when this file was written, and this file is how
   that was found: `/giris` mounts `@hcaptcha/react-hcaptcha`
   (`src/pages/Login.tsx:230`) on page load, which contacts four
   `hcaptcha.com` hosts and leaves a `__cf_bm` cookie on `.hcaptcha.com` with a
   30-minute lifetime. `/giris` is a public route by the repository's own
   contract — it is named in `NON_SHELL_PUBLIC_ROUTES` in
   `e2e/shared-shell-accessibility.spec.ts`.

   ── TEST 3 WAS RE-AIMED IN ROUND 3, AND HERE IS WHY ──────────────────────
   It used to assert `cookies.toEqual([])` — "no cookie is created on any
   public route". That was the right assertion for as long as the document said
   so, and it did its job: it held `/cerez-politikasi` to its own word, and it
   is how defect R2-2 surfaced at all.

   The claim it encoded has since been RETIRED, BECAUSE IT WAS FALSE. Madde 01
   no longer says no cookie is created; it discloses one, by name, domain,
   flags and lifetime. So the old assertion no longer corresponds to anything
   the site asserts. Left as it was, it goes red on a CORRECTLY DISCLOSED
   cookie — a green document and a red gate, which teaches the next person to
   delete the gate.

   THIS IS A RE-AIMING, NOT A WEAKENING, and it is strictly stronger for what a
   gate is for:

     · the old assertion could not tell a disclosed cookie from an undisclosed
       one. Both were simply "a cookie", and both were red. The new one goes
       red the day an UNDISCLOSED cookie appears and stays green while the
       document keeps up with the browser — which is the property that actually
       protects a reader;
     · it is checked in BOTH directions of coverage: the name must be published
       AND the domain must be one the document names, so a cookie called
       `__cf_bm` arriving from a host nobody disclosed is still red;
     · it is immune to a variance that would have made any count-based
       assertion flake. `.w.hcaptcha.com` is an EPHEMERAL worker hostname:
       measured twice, one run produced two `__cf_bm` entries and the other
       produced one. A set-coverage assertion does not care; `toEqual([...])`
       against a fixed list would have flaked forever.

   What it does NOT do is make itself green by any other route. hCaptcha still
   loads on `/giris`, unchanged; whether the login form should carry it is a
   security question and belongs to Phase 09. This file's job is only to keep
   the published sentence and the browser's behaviour in agreement, whichever
   of the two moves.

   Recorded as decision A24 in `PROGRESS.md`.

   WHAT IT ASSERTS
   ---------------
   1. Every localStorage / sessionStorage key the browser ends up holding
      after a sweep of every public route has a row in the rendered table.
      Not "the table has five rows" — a count is not a contract. The set of
      OBSERVED keys must be covered by the set of PUBLISHED keys.
   2. The published table and the `STORAGE_ROWS` constant in
      `src/pages/CerezPolitikasi.tsx` are the same list, so the page cannot
      quietly stop rendering the constant that the rest of this file reasons
      about.
   3. Every cookie the browser ends up holding after that sweep is COVERED BY
      THE PUBLISHED DISCLOSURE — its name is published on `/cerez-politikasi`
      and its domain is one the document names. See the block below for why
      this replaced "no cookie is created on any public route".
   4. `mas_intro_seen` is written on `/` and NOT under
      `prefers-reduced-motion: reduce`, because the table's fifth row says so
      in a sentence a reader can check.

   THE NEGATIVE CONTROLS
   ---------------------
   A checker that passes everything is indistinguishable from a working one
   until you show it failing. So each set comparison is run a second time
   against a deliberately poisoned input — an extra observed key that no row
   covers, a published list with a row removed, an observed cookie nobody
   published, a disclosure that lost the cookie it published, and a cookie with
   a published NAME arriving from an unpublished DOMAIN — and the same
   comparison function must reject every one. If a control stops failing, the
   comparison has been hollowed out and this file says so instead of going
   green.

   Both cookie controls are also run INLINE, inside test 3, against the live
   observed set. A standalone control proves the function can fail; an inline
   one proves it could still fail on the data the real assertion just passed —
   which is the gap that let the first version of this file report six greens
   over a page that demonstrably violated the claim.

   SCOPE
   -----
   Public routes only. `/admin/*` and `/musteri-paneli/*` are out of scope
   (§N) and are not visited. One lane, at `desktop-1280`, because the answer
   is viewport-independent — except the reduced-motion check, which is about
   a media query and not about a width.
   ══════════════════════════════════════════════════════════════════════════ */

const HERE = dirname(fileURLToPath(import.meta.url));
const COOKIE_PAGE = resolve(HERE, "../src/pages/CerezPolitikasi.tsx");

/** Every public route template in `src/App.tsx`, one concrete URL each. */
const PUBLIC_ROUTES = [
  "/",
  "/sss",
  "/gizlilik-politikasi",
  "/kvkk",
  "/cerez-politikasi",
  "/hakkimizda",
  "/iletisim",
  "/malzemeler",
  "/malzemeler/aluminyum",
  "/blog",
  "/blog/havacilik-parcalarinda-malzeme-secimi",
  "/kabiliyet-profilleri",
  "/kalite-dosyasi",
  "/hizmetler/kategori/talasli-imalat",
  "/hizmetler/cnc-frezeleme",
  "/kabiliyetler/kalite-kontrol",
  "/endustriyel/havacilik",
  "/giris",
  "/sifremi-unuttum",
  "/reset-password",
  "/teklif-al",
  "/cad-dashboard",
  "/qa-storage-no-such-route",
] as const;

/** The one comparison both the real assertions and the controls go through. */
function uncovered(observed: readonly string[], published: readonly string[]) {
  return observed.filter((key) => !published.includes(key)).sort();
}

/** What `/cerez-politikasi` publishes about cookies, read out of the rendered page. */
type Disclosure = { codes: string[]; domains: string[] };

/** One observed cookie, reduced to what the disclosure has to cover. */
type ObservedCookie = { name: string; domain: string };

/**
 * THE COOKIE COMPARISON — the one test 3 and both cookie controls go through.
 *
 * A cookie is covered when the document publishes BOTH halves of it:
 *
 *   the NAME, as a `<code>` token in the rendered page. `<code>` rather than
 *   raw text because that is how this document types every storage key and
 *   every host, and because a bare substring search would let the word
 *   "session" in a sentence cover a cookie called `session`;
 *
 *   the DOMAIN, as a hostname the document names — the cookie's own host, or
 *   a parent of it. The parent rule is not a loophole, it is the measurement:
 *   `.w.hcaptcha.com` is an EPHEMERAL per-worker hostname that changes run to
 *   run, and the document discloses the registrable domain `hcaptcha.com`,
 *   which is the honest thing to publish about it. A cookie from
 *   `evil.example.com` is not covered by anything this document says.
 */
function undisclosedCookies(observed: readonly ObservedCookie[], disclosure: Disclosure) {
  return observed
    .filter((cookie) => {
      const host = cookie.domain.replace(/^\./, "").toLowerCase();
      const nameDisclosed = disclosure.codes.includes(cookie.name);
      const domainDisclosed = disclosure.domains.some((d) => host === d || host.endsWith(`.${d}`));
      return !(nameDisclosed && domainDisclosed);
    })
    .map((cookie) => `${cookie.name}@${cookie.domain}`)
    .sort();
}

async function readStorage(page: Page) {
  return page.evaluate(() => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
  }));
}

/** The keys the document PUBLISHES, read out of the rendered table. */
async function publishedKeys(page: Page) {
  await gotoAndSettle(page, "/cerez-politikasi");
  const rows = await page.locator("main table tbody tr").evaluateAll((trs) =>
    trs.map((tr) => (tr.querySelector("th,td")?.textContent ?? "").trim()));
  expect(rows.length, "the storage table renders no rows at all").toBeGreaterThan(0);
  return rows;
}

/**
 * What the document publishes about cookies, from the rendered DOM — never
 * from the source file, because what a reader is owed is what the page says.
 */
async function publishedDisclosure(page: Page): Promise<Disclosure> {
  await gotoAndSettle(page, "/cerez-politikasi");
  const found = await page.evaluate(() => {
    const main = document.querySelector("main");
    const codes = [...(main?.querySelectorAll("code") ?? [])]
      .map((c) => (c.textContent ?? "").trim())
      .filter(Boolean);
    /* `innerText`, NOT `textContent`. `textContent` concatenates block
       elements with no separator, so a paragraph ending "…yoktur." followed by
       one starting "Tek istisna…" reads as `yoktur.Tek` and matches the
       hostname pattern. Measured: textContent produced twelve "domains", eight
       of them sentence joins — `tir.belge`, `yok.tek`, `yor.bu`, `r.form`.
       None of them could cover a real cookie, but a coverage rule fed junk is
       not a coverage rule. `innerText` respects block boundaries. */
    const text = (main as HTMLElement | null)?.innerText ?? "";
    // Turkish prose writes `hcaptcha.com'a`; the apostrophe is not part of the
    // host. "02. maddede" cannot match: a space follows the dot.
    const domains = [...text.matchAll(/\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b/gi)]
      .map((m) => m[0].toLowerCase())
      /* Every label at least two characters. The clause's contact line renders
         `SALES@MASTECHNİC.COM`, and the uppercase Turkish dotted İ is outside
         the ASCII class above, so the tail `C.COM` matches on its own. It could
         not cover any plausible cookie — the NAME half has to match too — but a
         coverage rule fed a token nobody wrote is not a coverage rule. */
      .filter((d) => d.split(".").every((label) => label.length >= 2));
    return { codes, domains };
  });
  expect(found.codes.length, "the cookie policy renders no <code> tokens at all — nothing is published")
    .toBeGreaterThan(0);
  return { codes: [...new Set(found.codes)], domains: [...new Set(found.domains)] };
}

/** The same list as the page's source constant, so the two cannot drift. */
function sourceKeys() {
  const source = readFileSync(COOKIE_PAGE, "utf8");
  const block = source.match(/const STORAGE_ROWS[^=]*=\s*\[([\s\S]*?)\n\];/);
  expect(block, "STORAGE_ROWS no longer exists in src/pages/CerezPolitikasi.tsx").not.toBeNull();
  return [...block![1].matchAll(/\[\s*\n?\s*"([^"]+)"/g)].map((m) => m[1]);
}

/**
 * `gotoAndSettle` is `domcontentloaded` plus two paint frames. That is the
 * right readiness contract for layout and it is the WRONG one here: a
 * third-party widget that mounts after hydration — `@hcaptcha/react-hcaptcha`
 * on `/giris` is the live example — has not made a request yet, so a cookie
 * sweep built on it passes vacuously. It did, on the first run of this file.
 * So this sweep waits for the network to go quiet, bounded, per route, and
 * records the hosts it saw so a run that measured nothing cannot look clean.
 */
async function sweep(context: BrowserContext, page: Page) {
  const hosts = new Set<string>();
  const onResponse = (response: { url: () => string }) => {
    try { hosts.add(new URL(response.url()).host); } catch { /* opaque url */ }
  };
  page.on("response", onResponse);
  for (const route of PUBLIC_ROUTES) {
    await gotoAndSettle(page, route);
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => { /* long-poll route */ });
    await page.waitForTimeout(1_000);
  }
  page.off("response", onResponse);
  const storage = await readStorage(page);
  const cookies = await context.cookies();
  return { ...storage, cookies, hosts: [...hosts].sort() };
}

test.describe("QA — what the browser stores vs what /cerez-politikasi publishes", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1280", "one canonical storage lane");
  });

  /* The sweep walks 23 routes and waits for each one's network to go quiet.
     Measured at ~2.5 min on this machine. That is a BUDGET, not a tolerance —
     no assertion below is loosened by it, and a shorter budget was what made
     the first version of this file report a timeout instead of a defect. */
  const SWEEP_BUDGET_MS = 360_000;

  test("every stored key over every public route has a row in the published table", async ({ page, context }) => {
    test.setTimeout(SWEEP_BUDGET_MS);
    const observed = await sweep(context, page);
    const published = await publishedKeys(page);

    const keys = [...new Set([...observed.local, ...observed.session])].sort();
    expect(keys.length, "no storage key was observed at all — the sweep measured nothing").toBeGreaterThan(0);

    expect(
      uncovered(keys, published),
      `the browser holds a key with no row in madde 02. Observed: ${JSON.stringify(keys)}. ` +
      `Published: ${JSON.stringify(published)}. Madde 01 says "hepsi 02. maddede listelenmiştir", ` +
      "so either the row is missing or that sentence is now false.",
    ).toEqual([]);
  });

  test("the rendered table and the STORAGE_ROWS constant are the same list", async ({ page }) => {
    const published = await publishedKeys(page);
    expect(published, "the page stopped rendering STORAGE_ROWS, so every other assertion here is measuring the wrong thing")
      .toEqual(sourceKeys());
  });

  test("every cookie created on a public route is covered by the published disclosure", async ({ page, context }) => {
    test.setTimeout(SWEEP_BUDGET_MS);
    const observed = await sweep(context, page);

    // A sweep that reached no third party measured nothing about third
    // parties, and a clean cookie jar would then prove nothing. Positive
    // control, kept from the assertion this one replaced.
    const thirdParty = observed.hosts.filter((h) => !h.startsWith("localhost") && !h.startsWith("127."));
    expect(
      thirdParty.length,
      `the sweep contacted no third-party host at all (${JSON.stringify(observed.hosts)}), so this ` +
      "test measured nothing. The network was blocked or the routes did not load.",
    ).toBeGreaterThan(0);

    const disclosure = await publishedDisclosure(page);
    const cookies: ObservedCookie[] = observed.cookies.map((c) => ({ name: c.name, domain: c.domain }));

    /* Printed, not asserted. A run that observed ZERO cookies passes this test
       for a reason worth knowing about — the widget did not load, or Phase 09
       removed it — and that is a different fact from "every cookie is
       disclosed". The count is deliberately not asserted: `.w.hcaptcha.com`'s
       ephemeral worker hostname produced two entries in one measured run and
       one in another, so a count is not a contract here either. */
    console.log(`[qa-p08 cookies] observed ${JSON.stringify(cookies.map((c) => `${c.name}@${c.domain}`).sort())} `
      + `| disclosed codes ${JSON.stringify(disclosure.codes)} `
      + `| disclosed hosts ${JSON.stringify(disclosure.domains)}`);

    expect(
      undisclosedCookies(cookies, disclosure),
      "a cookie the reader's browser holds is not published on /cerez-politikasi. Observed: " +
      `${JSON.stringify(cookies.map((c) => `${c.name}@${c.domain}`).sort())}. Published <code> tokens: ` +
      `${JSON.stringify(disclosure.codes)}. Hostnames the document names: ${JSON.stringify(disclosure.domains)}. ` +
      "Either the cookie is new and the document has to say so, or it should not be there. Whoever set " +
      "it, an embedded third party is still something the reader's browser stored because they opened " +
      "a page of this site.",
    ).toEqual([]);

    /* ── the same two controls, INLINE, on the data that just passed ──────
       A standalone control proves the comparison CAN fail. These prove it
       could still fail on this run's live input — which is the gap that let
       the first version of this file report six greens over a page that
       demonstrably violated its own claim. */
    expect(
      undisclosedCookies([...cookies, { name: "mas_qa_control_cookie", domain: ".qa-control.invalid" }], disclosure),
      "INLINE CONTROL: an obviously undisclosed cookie passed the check that just went green above. " +
      "The comparison is hollow and this run's pass means nothing.",
    ).toEqual(["mas_qa_control_cookie@.qa-control.invalid"]);

    if (cookies.length > 0) {
      const first = cookies[0];
      expect(
        undisclosedCookies([{ name: first.name, domain: ".qa-control.invalid" }], disclosure),
        "INLINE CONTROL: a published cookie NAME arriving from a host nobody published passed the " +
        "check. The domain half of the coverage rule is not being applied.",
      ).toEqual([`${first.name}@.qa-control.invalid`]);
      expect(
        undisclosedCookies([first], { codes: [], domains: disclosure.domains }),
        "INLINE CONTROL: a cookie stayed covered after the disclosure lost every published name.",
      ).toEqual([`${first.name}@${first.domain}`]);
    }
  });

  test("mas_intro_seen is written on the landing and not under reduced motion", async ({ browser, baseURL }) => {
    const plain = await browser.newContext();
    const plainPage = await plain.newPage();
    await gotoAndSettle(plainPage, "/");
    const withMotion = await readStorage(plainPage);
    await plain.close();

    const reduced = await browser.newContext({ reducedMotion: "reduce" });
    const reducedPage = await reduced.newPage();
    await gotoAndSettle(reducedPage, "/");
    const withoutMotion = await readStorage(reducedPage);
    await reduced.close();

    expect(baseURL, "no baseURL — the two contexts above measured nothing").toBeTruthy();
    expect(withMotion.session, "the entry sequence did not record itself on `/`").toContain("mas_intro_seen");
    expect(
      withoutMotion.session,
      'madde 02 row 4: "hareket azaltma açıksa hiç yazılmaz". It was written.',
    ).not.toContain("mas_intro_seen");
  });

  /* ── the controls ───────────────────────────────────────────────────────
     These do not touch the browser. They feed the same comparison function
     the assertions above use a case it MUST reject. If they ever pass, the
     comparison has been weakened and the three tests above are decoration. */

  /** The disclosure shape a healthy `/cerez-politikasi` produces, for the controls. */
  const CONTROL_DISCLOSURE: Disclosure = {
    codes: ["__cf_bm", "localStorage", "sessionStorage"],
    domains: ["hcaptcha.com", "mas-technic.com"],
  };

  test("the coverage check is red on an observed key nobody published", () => {
    const published = sourceKeys();
    expect(published.length, "the source constant parsed to nothing").toBeGreaterThan(0);
    expect(uncovered(published, published), "sanity: a list covers itself").toEqual([]);
    expect(
      uncovered([...published, "mas_qa_control_key"], published),
      "an unpublished key slipped through the coverage check",
    ).toEqual(["mas_qa_control_key"]);

    /* THE SAME CONTROL, EXTENDED TO THE RE-AIMED TEST 3. A cookie coverage
       check that passes everything is exactly as useless as a storage one. */
    expect(
      undisclosedCookies([{ name: "__cf_bm", domain: ".hcaptcha.com" }], CONTROL_DISCLOSURE),
      "sanity: a disclosed cookie must be covered, or this checker rejects everything and its " +
      "reds mean nothing either",
    ).toEqual([]);
    expect(
      undisclosedCookies([{ name: "__cf_bm", domain: ".a1b2c3.w.hcaptcha.com" }], CONTROL_DISCLOSURE),
      "sanity: the ephemeral worker subdomain is covered by the registrable domain the document " +
      "publishes — this is the variance that would flake any count-based assertion",
    ).toEqual([]);
    expect(
      undisclosedCookies([{ name: "_ga", domain: ".google-analytics.com" }], CONTROL_DISCLOSURE),
      "an undisclosed cookie slipped through the cookie coverage check",
    ).toEqual(["_ga@.google-analytics.com"]);
    expect(
      undisclosedCookies([{ name: "__cf_bm", domain: ".evil.example" }], CONTROL_DISCLOSURE),
      "a PUBLISHED cookie name arriving from an unpublished domain slipped through. The old " +
      "assertion could not have told these two apart; this one has to.",
    ).toEqual(["__cf_bm@.evil.example"]);
  });

  test("the coverage check is red on a published list that lost a row", () => {
    const published = sourceKeys();
    const short = published.slice(0, -1);
    const dropped = published[published.length - 1];
    expect(
      uncovered(published, short),
      "dropping a row from the published list did not make the check fail",
    ).toEqual([dropped]);

    /* THE SAME CONTROL, EXTENDED TO THE RE-AIMED TEST 3: a document that
       stops publishing a cookie it used to publish must not stay green while
       the browser still sets it. This is the direction that matters if
       somebody "simplifies" madde 01 back to an absolute. */
    expect(
      undisclosedCookies(
        [{ name: "__cf_bm", domain: ".hcaptcha.com" }],
        { codes: CONTROL_DISCLOSURE.codes.filter((c) => c !== "__cf_bm"), domains: CONTROL_DISCLOSURE.domains },
      ),
      "the cookie stayed covered after the document stopped naming it",
    ).toEqual(["__cf_bm@.hcaptcha.com"]);
    expect(
      undisclosedCookies(
        [{ name: "__cf_bm", domain: ".hcaptcha.com" }],
        { codes: CONTROL_DISCLOSURE.codes, domains: CONTROL_DISCLOSURE.domains.filter((d) => d !== "hcaptcha.com") },
      ),
      "the cookie stayed covered after the document stopped naming its domain",
    ).toEqual(["__cf_bm@.hcaptcha.com"]);
  });
});
