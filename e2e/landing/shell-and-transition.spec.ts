import { expect, test, type Page } from "@playwright/test";
import { gotoAndSettle, landingReady } from "../helpers";

/* ══════════════════════════════════════════════════════════════════════════
   PHASE 04 — THE GLOBAL PUBLIC SHELL AND THE ROUTE TRANSITION

   WHY THIS FILE LIVES IN `e2e/landing/`
   -------------------------------------
   `playwright.config.ts` (out of this phase's write scope) defines the
   blocking gate as the `landing` directory plus `technical-landing.spec.ts`.
   A shell contract that only ran in the wider regression family would not
   block anything, and the shell is the one thing every route depends on. Every
   journey below starts on `/`.

   WHAT IT PROVES
   --------------
   1. one shell on every public page family, at both critical widths;
   2. the transition survives direct load, client navigation, Back and Forward;
   3. blocker B25 — a history move with the menu open cannot strand the modal
      lock — including the `--repeat-each` shape that used to fail 7 of 8;
   4. no stuck transition state is reachable by rapid repeated clicks;
   5. `/teklif-al` — a footerless quote studio since round 2 (item 5, the
      owner's call) — still carries legal links that actually navigate;
   6. the 404 is a shell state, not a chrome-less dead end.
   ══════════════════════════════════════════════════════════════════════════ */

/** One representative of every public page family the shell serves. */
const SHELL_ROUTES = [
  { path: "/", name: "landing" },
  { path: "/hakkimizda", name: "company" },
  { path: "/hizmetler/cnc-frezeleme", name: "service detail" },
  { path: "/hizmetler/kategori/talasli-imalat", name: "service category" },
  { path: "/malzemeler", name: "material index" },
  { path: "/blog", name: "journal index" },
  { path: "/sss", name: "faq" },
  /* UX04 (package 7): legal texts and the quote studio carry the COMPACT
     footer — one contentinfo, but not the master-grid footer band. */
  { path: "/kvkk", name: "legal", footer: "compact" },
  { path: "/teklif-al", name: "rfq", footer: "compact" },
  { path: "/__phase04-not-a-route__", name: "404" },
] as { path: string; name: string; footer?: false | "compact" }[];

async function shellShape(page: Page) {
  return page.evaluate(() => {
    const main = document.querySelector("main#main-content");
    const shell = document.querySelector(".shell-root");
    const sheet = document.querySelector(".shell-sheet");
    const footer = document.querySelector("footer.tl-footer");
    return {
      shellRoots: document.querySelectorAll(".shell-root").length,
      headers: document.querySelectorAll("[data-fullscreen-header]").length,
      triggers: document.querySelectorAll("[data-menu-trigger]").length,
      contentinfo: document.querySelectorAll("footer").length,
      mains: document.querySelectorAll("main").length,
      mainIsShell: !!main && main.classList.contains("shell-main"),
      transitionNodes: document.querySelectorAll("[data-route-transition]").length,
      /* The grid contract, read from what the browser actually resolved rather
         than from the stylesheet: the rail plus `--tl-cols` equal columns. */
      sheetMax: getComputedStyle(document.documentElement).getPropertyValue("--tl-sheet-max").trim(),
      /* `.tl-sheet` is `width: min(100%, --tl-sheet-max)`, so the used width is
         the viewport below 1600 — the contract is that the sheet never exceeds
         the token, and that it is centred. */
      sheetWidth: sheet ? Math.round(sheet.getBoundingClientRect().width) : null,
      bandTracks: footer ? getComputedStyle(footer).gridTemplateColumns.split(" ").length : 0,
      railWidth: Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tl-rail")),
      cols: Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tl-cols"), 10),
      shellSurface: shell?.getAttribute("data-shell-surface") ?? null,
      lockedScroll: getComputedStyle(document.documentElement).overflow === "hidden",
      rootInert: document.getElementById("root")?.hasAttribute("inert") ?? null,
    };
  });
}

test.describe("global public page shell", () => {
  for (const route of SHELL_ROUTES) {
    test(`${route.name} (${route.path}) renders inside the one shell`, async ({ page }) => {
      await gotoAndSettle(page, route.path);
      await expect(page.locator(".shell-root")).toBeVisible({ timeout: 20_000 });
      const shape = await shellShape(page);

      expect(shape.shellRoots, "exactly one shell root").toBe(1);
      expect(shape.headers, "one global navigation").toBe(1);
      expect(shape.triggers, "one menu trigger").toBe(1);
      expect(shape.contentinfo, route.footer === false ? "the quote studio has no footer" : "one footer")
        .toBe(route.footer === false ? 0 : 1);
      expect(shape.mains, "one main landmark").toBe(1);
      expect(shape.mainIsShell, "main is the shell's main, not a page-local one").toBe(true);
      expect(shape.transitionNodes, "one route-transition node").toBe(1);

      // The same rail/grid contract is AVAILABLE to every page: the footer band
      // resolves to rail + `--tl-cols` tracks at every width, from the same
      // tokens the landing uses.
      if (route.footer === undefined) {
        expect(shape.bandTracks, "rail + --tl-cols master tracks").toBe(shape.cols + 1);
      }
      expect(shape.sheetMax, "one sheet token").toBe("1600px");
      expect(shape.sheetWidth, "sheet never exceeds the token")
        .toBeLessThanOrEqual(Math.min(1600, page.viewportSize()!.width));
      expect([64, 56, 42]).toContain(shape.railWidth);

      // Nothing left a modal lock behind on a plain page load.
      expect(shape.lockedScroll).toBe(false);
      expect(shape.rootInert).toBe(false);
    });
  }

  test("the 404 is a shell state with a way out, not a dead end", async ({ page }) => {
    await gotoAndSettle(page, "/__phase04-not-a-route__");
    await expect(page.getByText("ERR::PAGE_NOT_FOUND")).toBeVisible();
    // The header and the footer are the way out; before Phase 04 the page had
    // neither and its own four links were the only navigation on it.
    await expect(page.locator("[data-fullscreen-header]")).toHaveCount(1);
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: /^KVKK/i })).toHaveCount(1);
    // The 15-second `window.location` hijack is gone: the URL must still be
    // the one the reader typed well past when the old timer fired.
    await page.waitForTimeout(2_000);
    expect(new URL(page.url()).pathname).toBe("/__phase04-not-a-route__");
    await expect(page.locator("main#main-content")).toBeVisible();
  });

  test("/teklif-al keeps legal links that navigate, with the compact footer", async ({ page }) => {
    // Before Phase 04 the page had no legal links and no exit path at all. The
    // round-2 quote studio dropped the long footer; UX04 gives it the compact
    // one (brand, direct line, legal links, copyright). Its rail still carries
    // the legal links too.
    await gotoAndSettle(page, "/teklif-al");
    await expect(page.getByRole("contentinfo")).toHaveAttribute("data-footer-variant", "compact");
    const legal = page.locator(".rfq-legal");
    for (const name of [/^KVKK/i, /Gizlilik Politikası/i, /Çerez Politikası/i]) {
      await expect(legal.getByRole("link", { name })).toHaveCount(1);
    }
    await legal.getByRole("link", { name: /^KVKK/i }).click();
    await expect(page).toHaveURL(/\/kvkk$/);
    await expect(page.getByRole("heading", { level: 1, name: "KVKK Aydınlatma Metni" })).toBeVisible();
  });
});

test.describe("route transition", () => {
  test("survives direct load, client navigation, Back and Forward", async ({ page }) => {
    // 1) Direct load.
    await gotoAndSettle(page, "/hakkimizda");
    await expect(page.getByRole("heading", { level: 1, name: "Hakkımızda" })).toBeVisible();
    expect((await shellShape(page)).transitionNodes).toBe(1);

    /* 2) Client navigation through the footer's conversion rule.
          `Bize Ulaşın` rather than a link column: the columns collapse into
          disclosures below 768px, and this journey must mean the same thing at
          375 as at 1280. */
    await page.getByRole("contentinfo").getByRole("link", { name: "Bize Ulaşın" }).click();
    await expect(page).toHaveURL(/\/iletisim$/);
    await expect(page.locator("main#main-content")).toBeVisible();
    expect((await shellShape(page)).transitionNodes).toBe(1);

    // 3) Back.
    await page.goBack();
    await expect(page).toHaveURL(/\/hakkimizda$/);
    await expect(page.getByRole("heading", { level: 1, name: "Hakkımızda" })).toBeVisible();

    // 4) Forward.
    await page.goForward();
    await expect(page).toHaveURL(/\/iletisim$/);
    await expect(page.locator("main#main-content")).toBeVisible();

    /* 5) A hard refresh on the destination is still the destination.
          `domcontentloaded` fires before the route module resolves, so the
          shell is measured only once the bar has actually mounted — otherwise
          this reads the Suspense frame and reports zero headers for a reason
          that has nothing to do with the contract. */
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/iletisim$/);
    await expect(page.locator("[data-fullscreen-header]")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("footer.tl-footer")).toBeAttached({ timeout: 20_000 });
    const shape = await shellShape(page);
    expect(shape.transitionNodes).toBe(1);
    expect(shape.headers).toBe(1);
    expect(shape.contentinfo).toBe(1);
  });

  test("B25 — a history move with the menu open never strands the modal lock", async ({ page }) => {
    /* THE MEASUREMENT THIS ENCODES.

       Before Phase 04, `PageTransition` kept the outgoing page mounted through
       an `AnimatePresence` exit, so two route subtrees — and therefore two
       `<Header/>` instances — were alive for ~480ms of every navigation. The
       open menu is a modal that puts `overflow:hidden` on `<html>`/`<body>`
       and `inert` + `aria-hidden` on `#root`, and releases all of it from one
       effect cleanup owned by a component INSIDE the routed subtree.

       Measured against the production preview at 1280x800: 8 runs out of 8 of
       this journey ended on `/hakkimizda`, with one page tree and one header —
       and an open `[data-fullscreen-menu]`, `#root[inert]` and
       `html{overflow:hidden}` that never cleared, polled for 8 seconds. After
       the fix (exactly one route subtree at any time, so the outgoing page's
       cleanup runs as part of the same commit as the location change): 0/8.

       Both directions are exercised. Back was already covered elsewhere for
       header COUNT; what is asserted here is the lock. */
    await gotoAndSettle(page, "/");
    await landingReady(page);

    await page.locator("[data-menu-trigger]").click();
    // Revision 4: company pages are the flat 04 Kurumsal family.
    await page.locator("[data-fullscreen-menu] button[aria-pressed]:not([lang])").nth(3).click();
    await page.locator("[data-fullscreen-menu]").getByRole("link", { name: "Hakkımızda" }).click();
    await expect(page).toHaveURL(/\/hakkimizda$/);
    await expect(page.locator("[data-fullscreen-header]")).toHaveCount(1);

    // Forward is the direction that used to fail.
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await landingReady(page);
    await expect(page.locator("[data-menu-trigger]")).toHaveCount(1);

    await page.locator("[data-menu-trigger]").click();
    await expect(page.locator("[data-fullscreen-menu]")).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/hakkimizda$/);
    await expect(page.locator("[data-fullscreen-menu]")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await expect(page.locator("#root")).not.toHaveAttribute("inert", "");
    await expect(page.locator("#root")).not.toHaveAttribute("aria-hidden", "true");
    // And the page underneath is usable again, not merely un-locked.
    await expect(page.locator("[data-menu-trigger]")).toHaveCount(1);
    await page.locator("[data-menu-trigger]").click();
    await expect(page.locator("[data-fullscreen-menu]")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-fullscreen-menu]")).toHaveCount(0);

    // Back, with the menu open, is held to the same contract.
    await page.locator("[data-menu-trigger]").click();
    await expect(page.locator("[data-fullscreen-menu]")).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("[data-fullscreen-menu]")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
    await expect(page.locator("#root")).not.toHaveAttribute("inert", "");
  });

  test("rapid repeated navigation cannot strand the site in a transition state", async ({ page }) => {
    /* The curtain is a fixed, `pointer-events:none` CSS layer outside the
       routed subtree; it gates nothing. This proves that empirically rather
       than from the stylesheet: hammer the footer's navigation, then require
       the page to be readable, interactive and unlocked. */
    await gotoAndSettle(page, "/hakkimizda");
    const footer = page.getByRole("contentinfo");

    /* These four are visible at EVERY width — the conversion rule and the
       legal run — so the stress is the same at 375 as at 1280. The link
       columns are not used here: they collapse into disclosures below 768px
       and the journey would quietly become a no-op there. */
    /* Every target keeps the footer: the footerless quote studio would turn
       the rest of the round into clicks on nothing. */
    const hammer = [/Gizlilik Politikası/i, /Bize Ulaşın/i, /Yazıları incele/i, /^KVKK/i];
    for (let round = 0; round < 3; round += 1) {
      for (const name of hammer) {
        // No `await expect(page).toHaveURL()` between clicks on purpose: the
        // point is to interrupt each navigation with the next one.
        await footer.getByRole("link", { name }).first()
          .click({ noWaitAfter: true, force: true, timeout: 5_000 })
          .catch(() => { /* the node may be replaced mid-click; that IS the stress */ });
        await page.waitForTimeout(90);
      }
    }

    // Whatever route it settled on, the site must be alive.
    await expect(page.locator("main#main-content")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("[data-fullscreen-header]")).toHaveCount(1);
    await expect(page.locator("[data-route-transition]")).toHaveCount(1);
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
    await expect(page.locator("#root")).not.toHaveAttribute("inert", "");

    // The curtain must have finished and must never have been able to swallow
    // a click: it is `pointer-events: none` and it ends fully retracted.
    await expect.poll(() => page.locator("[data-route-curtain-panel]").evaluateAll((panels) =>
      panels.filter((panel) => panel.getAnimations().some((animation) =>
        animation.playState === "running")).length), { timeout: 15_000 }).toBe(0);
    expect(await page.locator("[data-route-curtain-panel]").evaluateAll((panels) =>
      panels.map((panel) => getComputedStyle(panel).pointerEvents)))
      .toEqual(["none", "none", "none", "none", "none"]);

    // And a real click still navigates.
    await page.locator("[data-menu-trigger]").click();
    await expect(page.locator("[data-fullscreen-menu]")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-fullscreen-menu]")).toHaveCount(0);
  });

  test("reduced motion renders no curtain at all and still navigates", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoAndSettle(page, "/hakkimizda");
    await expect(page.locator("[data-route-curtain-panel]")).toHaveCount(0);
    await expect(page.locator("[data-route-transition]")).toHaveCount(1);
    await page.getByRole("contentinfo").getByRole("link", { name: "Bize Ulaşın" }).click();
    await expect(page).toHaveURL(/\/iletisim$/);
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator("[data-route-curtain-panel]")).toHaveCount(0);
  });
});
