import { expect, test } from "@playwright/test";
import { waitForApp } from "./helpers";
import { assertNoSupabaseContact, assertSealed, sealNetwork } from "./fixtures/qa-p09a2-seal";

/* ═══════════════════════════════════════════════════════════════════════════
   QA 09a-R2 ITEM 1 — the C1 contrast fix, RENDERED, on both grounds.

   C1 replaced a fixed `--tl-stamp` with a ground-bound role `--sf-danger`,
   bound to `--tl-stamp-light` on `.shell-root` and re-bound to `--tl-stamp` on
   BOTH `.shell-root[data-shell-surface="paper"]` and the descendant selector
   `.shell-root .tl-band[data-band-tone="paper"]`. The descendant half is the
   whole point: a root-level override cannot reach a paper band nested inside a
   graphite root, and shipping one would have put stamp-light on paper at
   2.23:1 — trading a serious violation for a different serious violation.

   The arithmetic is checked separately, exactly, from the token hexes, in
   `scripts/qa-probes/p09a2-contrast-math.mjs`. THIS file checks what the
   arithmetic cannot: that the CASCADE delivers those colours to the real
   elements, on both grounds, at both viewports.

   NO SUBMIT PATH IS TOUCHED. The `tone="error"` notice is reached the way a
   visitor reaches it by accident — a file `validateCadFile()` rejects — which
   is pure client-side validation with no request of any kind. /iletisim's
   submit inserts a meeting-request row on the production project and is never
   clicked. The seal is proven with a live canary before any control is
   touched.
   ══════════════════════════════════════════════════════════════════════════ */

type Measured = {
  fg: string | null;
  bg: string | null;
  ratio: number;
  borderColor: string | null;
  borderRatio: number;
  fontPx: number;
  fontWeight: string;
};

/**
 * WCAG 2.x contrast, computed in-page against the effective painted ground.
 * Self-contained: it closes over nothing, so it serialises into the page.
 */
function measure(el: Element): Measured {
  const parse = (s: string) => {
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  type C = { r: number; g: number; b: number; a: number };
  const lum = (c: C) => {
    const f = (v: number) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a: C, b: C) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  // Effective background: walk ancestors until something actually paints.
  const groundOf = (node: Element | null): C => {
    let n: Element | null = node;
    while (n) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) return c as C;
      n = n.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };
  const cs = getComputedStyle(el);
  const fg = parse(cs.color) as C | null;
  const bg = groundOf(el);
  const bc = (parse(cs.borderLeftColor) || parse(cs.borderColor)) as C | null;
  const toHex = (c: C | null) =>
    c ? "#" + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("") : null;
  return {
    fg: toHex(fg),
    bg: toHex(bg),
    ratio: fg ? ratio(fg, bg) : 0,
    borderColor: toHex(bc),
    borderRatio: bc ? ratio(bc, bg) : 0,
    fontPx: parseFloat(cs.fontSize),
    fontWeight: cs.fontWeight,
  };
}

const VIEWPORTS = [
  { name: "1280", width: 1280, height: 900 },
  { name: "375", width: 375, height: 780 },
];

/** A file `validateCadFile()` rejects. Deliberately `.sldprt`: see item 3. */
const REJECTED_FILE = {
  name: "qa-p09a2-probe.sldprt",
  mimeType: "application/octet-stream",
  buffer: Buffer.from("qa probe: not a real SolidWorks part"),
};

for (const vp of VIEWPORTS) {
  test.describe(`contrast @ ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test(`graphite: tone="error" notice label + edge @ ${vp.name}`, async ({ page }) => {
      const seal = await sealNetwork(page);
      await page.goto("/teklif-al", { waitUntil: "domcontentloaded" });
      await waitForApp(page);
      await assertSealed(page, seal); // BEFORE touching any control

      const root = page.locator(".shell-root").first();
      await expect(root).toHaveAttribute("data-shell-surface", "graphite");

      // Real error state, pure client-side validation, no request at all.
      await page.locator("#rfq-cad").setInputFiles(REJECTED_FILE);

      const notice = page.locator('.shell-notice[data-tone="error"]').first();
      await expect(notice).toBeVisible();
      await expect(notice).toHaveAttribute("role", "alert");

      const m = await notice.locator(".shell-notice-label").first().evaluate(measure);
      const edge = await notice.evaluate(measure);

      console.log(
        `[graphite/${vp.name}] notice-label fg=${m.fg} bg=${m.bg} ratio=${m.ratio.toFixed(2)} ` +
          `font=${m.fontPx}px/${m.fontWeight} | edge=${edge.borderColor} ratio=${edge.borderRatio.toFixed(2)}`,
      );
      // Record the message too: it is evidence for the CAD-format finding.
      console.log(`[graphite/${vp.name}] notice text: ${(await notice.innerText()).replace(/\s+/g, " ")}`);

      expect(m.fg, "graphite step of --sf-danger").toBe("#e18570");
      expect(m.ratio, "1.4.3 small text").toBeGreaterThanOrEqual(4.5);
      expect(m.ratio, "C1 claims 7.33:1").toBeGreaterThan(7.0);
      expect(edge.borderColor, "leading rule paints from the same role").toBe("#e18570");
      expect(edge.borderRatio, "1.4.11 non-text 3:1").toBeGreaterThanOrEqual(3.0);

      assertNoSupabaseContact(seal);
    });

    test(`graphite: .shell-form-error on /teklif-al + /iletisim @ ${vp.name}`, async ({ page }) => {
      const seal = await sealNetwork(page);

      for (const route of ["/teklif-al", "/iletisim"]) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await waitForApp(page);
        await assertSealed(page, seal);
        // React must have mounted before we can find or plant anything.
        await page.locator(".shell-root").first().waitFor({ state: "attached" });

        /* On /iletisim `.shell-form-error` is rendered unconditionally and is
           simply EMPTY until a submit fails, so the element and its cascade
           position are the page's own — we only give it text so it has a
           painted box. Where the route renders it only on error we plant it in
           the real form, and the log says which happened. Either way we never
           submit. */
        const found = await page.evaluate(() => {
          let el = document.querySelector(".shell-form-error") as HTMLElement | null;
          let planted = false;
          if (!el) {
            const host = document.querySelector("form .shell-field, form, .shell-root") as HTMLElement | null;
            if (!host) return null;
            el = document.createElement("p");
            el.className = "shell-form-error";
            host.appendChild(el);
            planted = true;
          }
          el.textContent = "QA_P09A2 hata metni";
          el.setAttribute("data-qa-p09a2", "1");
          return { planted };
        });
        expect(found, `no .shell-form-error host on ${route}`).not.toBeNull();

        const m = await page.locator('[data-qa-p09a2="1"]').first().evaluate(measure);
        console.log(
          `[${route}/${vp.name}] .shell-form-error text=${m.fg} bg=${m.bg} textRatio=${m.ratio.toFixed(2)} ` +
            `border=${m.borderColor} borderRatio=${m.borderRatio.toFixed(2)} ` +
            `font=${m.fontPx}px/${m.fontWeight} planted=${found!.planted}`,
        );

        /* NOTE, against the packet's phrasing. `.shell-form-error` never
           painted its TEXT with stamp red: `shell.css:1493` sets
           `color: var(--sf-ink)` and did so before C1 too, so the text is
           ~17.9:1 on graphite and was never the 2.69:1 case. What C1 actually
           moved to the role is the 2px `border-left` (`shell.css:1491`). A 2px
           rule is a NON-TEXT contrast object, so the governing floor is
           1.4.11's 3:1 rather than 1.4.3's 4.5:1 — and at #8a4030 on graphite
           it was 2.69:1, which fails 1.4.11. Both are asserted below at their
           own correct thresholds. */
        expect(m.borderColor, `${route}: leading rule must paint from --sf-danger`).toBe("#e18570");
        expect(m.borderRatio, `${route}: 1.4.11 non-text 3:1 for the 2px rule`).toBeGreaterThanOrEqual(3.0);
        expect(m.ratio, `${route}: 1.4.3 for the message text`).toBeGreaterThanOrEqual(4.5);
      }

      assertNoSupabaseContact(seal);
    });

    test(`paper band inside a graphite root re-binds --sf-danger @ ${vp.name}`, async ({ page }) => {
      const seal = await sealNetwork(page);
      // ROUND 2: /iletisim became the booking studio (no bands). /hakkimizda
      // carries paper ShellSurfaceBands (paper is now the default body tone)
      // inside a graphite shell root: the same descendant case.
      await page.goto("/hakkimizda", { waitUntil: "domcontentloaded" });
      await waitForApp(page);
      await assertSealed(page, seal);

      const rootSurface = await page.locator(".shell-root").first().getAttribute("data-shell-surface");
      const planted = await page.evaluate(() => {
        const band = document.querySelector('.tl-band[data-band-tone="paper"]') as HTMLElement | null;
        if (!band) return false;
        const wrap = document.createElement("div");
        wrap.className = "shell-notice";
        wrap.setAttribute("data-tone", "error");
        const lbl = document.createElement("p");
        lbl.className = "shell-notice-label";
        lbl.textContent = "QA_P09A2 PAPER";
        lbl.setAttribute("data-qa-p09a2-paper", "1");
        wrap.appendChild(lbl);
        band.appendChild(wrap);
        return true;
      });
      expect(planted, "/hakkimizda must carry a paper band for this check").toBe(true);

      const m = await page.locator('[data-qa-p09a2-paper="1"]').first().evaluate(measure);
      const edge = await page.locator('[data-qa-p09a2-paper="1"]').first()
        .evaluate((el) => getComputedStyle(el.parentElement!).borderLeftColor);
      console.log(
        `[paper-band-in-${rootSurface}/${vp.name}] fg=${m.fg} bg=${m.bg} ratio=${m.ratio.toFixed(2)} edge=${edge}`,
      );

      expect(m.fg, "a paper band must re-bind --sf-danger to --tl-stamp").toBe("#8a4030");
      expect(m.fg, "the 2.23:1 root-override trap must not ship").not.toBe("#e18570");
      expect(m.ratio, "1.4.3 small text on paper").toBeGreaterThanOrEqual(4.5);
      expect(m.ratio, "C1 claims 6.07-6.93:1 on paper").toBeGreaterThan(6.0);

      assertNoSupabaseContact(seal);
    });
  });
}
