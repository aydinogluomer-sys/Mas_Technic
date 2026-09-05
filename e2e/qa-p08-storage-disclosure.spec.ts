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

   The first one is false RIGHT NOW, and this file is how that was found:
   `/giris` mounts `@hcaptcha/react-hcaptcha` (`src/pages/Login.tsx:230`) on
   page load, which contacts four `hcaptcha.com` hosts and leaves a
   `__cf_bm` cookie on `.hcaptcha.com` with a 30-minute lifetime. `/giris` is
   a public route by the repository's own contract — it is named in
   `NON_SHELL_PUBLIC_ROUTES` in `e2e/shared-shell-accessibility.spec.ts`.

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
   3. No cookie is created on any public route — the madde 01 claim, read
      literally, on the routes the document says it covers.
   4. `mas_intro_seen` is written on `/` and NOT under
      `prefers-reduced-motion: reduce`, because the table's fifth row says so
      in a sentence a reader can check.

   THE NEGATIVE CONTROLS
   ---------------------
   A checker that passes everything is indistinguishable from a working one
   until you show it failing. So each of the two set comparisons is run a
   second time against a deliberately poisoned input — an extra observed key
   that no row covers, and a published list with a row removed — and the same
   comparison function must reject both. If a control stops failing, the
   comparison has been hollowed out and this file says so instead of going
   green.

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

  test("no cookie is created on any public route", async ({ page, context }) => {
    test.setTimeout(SWEEP_BUDGET_MS);
    const observed = await sweep(context, page);

    // A sweep that reached no third party cannot prove a negative about third
    // parties. This is the positive control for the assertion below.
    const thirdParty = observed.hosts.filter((h) => !h.startsWith("localhost") && !h.startsWith("127."));
    expect(
      thirdParty.length,
      `the sweep contacted no third-party host at all (${JSON.stringify(observed.hosts)}), so a clean ` +
      "cookie jar proves nothing. The network was blocked or the routes did not load.",
    ).toBeGreaterThan(0);

    const names = observed.cookies.map((c) => `${c.name}@${c.domain}`).sort();
    expect(
      names,
      'madde 01: "Herkese açık sayfalarda hiçbir çerez oluşturulmuyor." A cookie in this list ' +
      "falsifies that sentence, whoever set it — an embedded third party is still something the " +
      `reader's browser stored because they opened a page of this site. Hosts contacted: ${JSON.stringify(thirdParty)}.`,
    ).toEqual([]);
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

  test("the coverage check is red on an observed key nobody published", () => {
    const published = sourceKeys();
    expect(published.length, "the source constant parsed to nothing").toBeGreaterThan(0);
    expect(uncovered(published, published), "sanity: a list covers itself").toEqual([]);
    expect(
      uncovered([...published, "mas_qa_control_key"], published),
      "an unpublished key slipped through the coverage check",
    ).toEqual(["mas_qa_control_key"]);
  });

  test("the coverage check is red on a published list that lost a row", () => {
    const published = sourceKeys();
    const short = published.slice(0, -1);
    const dropped = published[published.length - 1];
    expect(
      uncovered(published, short),
      "dropping a row from the published list did not make the check fail",
    ).toEqual([dropped]);
  });
});
