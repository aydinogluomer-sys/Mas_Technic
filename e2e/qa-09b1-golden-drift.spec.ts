import { expect, test } from "@playwright/test";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { gotoAndSettle, freezeVisualState } from "./helpers";
import { awaitRealFaces, installFontRetry } from "./visual/fonts";
import { hideForeignOverlays } from "./visual/overlays";

/* ══════════════════════════════════════════════════════════════════════════
   QA 09b-1 — "IT PASSED" AND "IT DID NOT CHANGE" ARE NOT THE SAME SENTENCE

   `reports/09b1c1/golden-adjudication.txt` establishes the crops that changed
   without failing by walking the DOM for the ten declarations this phase
   touched. That is an INFERENCE: it shows a repainted element is inside the
   crop, not that the crop's pixels differ from the baseline on disk.

   This spec measures it. It re-captures the same crops with the same helpers
   and the same viewport as `visual-1280`, then compares the capture to the
   COMMITTED baseline twice:

       at pixelmatch's default cutoff (threshold 0.2 → YIQ delta 1408.6),
         which is what the visual suite actually asks; and
       at an EXACT cutoff (any non-identical pixel counts),
         which is what "did not change" would mean.

   A crop where the first count is 0 and the second is ~the perimeter of a
   repainted control is a baseline that has drifted while its gate stayed
   green. Nothing here writes a baseline; the goldens are read-only inputs.

   The comparison is done in the page rather than in Node because neither
   `pngjs` nor `pixelmatch` is a top-level dependency of this repository, and
   adding one is not QA's to add. A canvas decodes both PNGs; the YIQ formula
   below is pixelmatch's own (`pixelmatch/index.js`, `colorDelta`).
   ══════════════════════════════════════════════════════════════════════════ */

/* WRITTEN BEHIND A FLAG, SINCE 09b-1 R2. This spec rewrote the committed
   evidence under `reports/qa/phase-09b1/` on every ordinary run, and the
   evidence-write guard (`qa-p09a4-evidence-write-guard.spec.ts`) did not see it,
   because it recognised a destination only as `path.join(process.cwd(), …)`
   and this file spelt it as a bare literal. Committed evidence is a record of
   what was true on a date; a regression run must not overwrite it. Scratch by
   default under `test-results/`, the committed path only when asked for. */
const OUT = process.env.QA_09B1_WRITE_EVIDENCE === "1"
  ? "reports/qa/phase-09b1"
  : "test-results/qa-09b1-golden-drift";
const GOLDEN_DIR = "e2e/__golden__/win32/visual-1280";

/* The crops the Coder's adjudication names as changed-but-passing, plus two it
   names as untouched — a control group, so a bug in THIS spec that reports
   drift everywhere is visible rather than believed. */
const CASES = [
  { golden: "shell-footer-home", path: "/", selector: "footer.tl-footer", expectChanged: true },
  { golden: "shell-footer-about", path: "/hakkimizda", selector: "footer.tl-footer", expectChanged: true },
  { golden: "shell-footer-notfound", path: "/__phase04-not-a-route__", selector: "footer.tl-footer", expectChanged: true },
  { golden: "inner-hero-contact", path: "/iletisim", selector: ".shell-hero", expectChanged: true },
  { golden: "inner-hero-about", path: "/hakkimizda", selector: ".shell-hero", expectChanged: true },
  { golden: "inner-next-service-detail", path: "/hizmetler/cnc-frezeleme", selector: ".shell-next", expectChanged: true },
  /* CONTROL GROUP — zero hits in the Coder's walk. If this spec reported
     drift here too, its drift findings above would mean nothing. */
  { golden: "shell-header-home", path: "/", selector: "[data-fullscreen-header]", expectChanged: false },
  { golden: "shell-header-about", path: "/hakkimizda", selector: "[data-fullscreen-header]", expectChanged: false },
  /* POSITIVE CONTROL — the ONE baseline this phase regenerated. It must now
     be pixel-identical to what the shipped build paints; if it is not, the
     regeneration captured something other than the build under review. */
  { golden: "waveb-notfound-body", path: "/olmayan-sayfa/cnc-frezelme", selector: ".shell-notfound", expectChanged: false },
  /* A SECOND ZERO-HIT CROP, on the ground where the delta WOULD have counted.
     `waveb-quality-documents` photographs a paper band; had a control
     boundary been inside it, the repaint would have crossed the comparator's
     cutoff there the way it did on the 404. The Coder's walk reports zero
     hits — this checks that claim against pixels rather than against the DOM. */
  { golden: "waveb-quality-documents", path: "/kalite-dosyasi", selector: ".tl-band.shell-surface-band", expectChanged: false },
] as const;

/* SUPERSEDED NOTE, KEPT BECAUSE IT IS THE MEASUREMENT THAT FOUND THE BUG.
   `waveb-quality-documents`, `waveb-journal-lead` and `waveb-profile-scope`
   photograph a `.tl-band.shell-surface-band` whose top edge this spec cannot
   reproduce: re-captured here, the crop's first FOUR rows come back
   `rgb(12,16,17)` against a paper `rgb(238,233,222)` baseline — 5112 pixels,
   a whole-row wholesale replacement at y=0..3 and a byte-perfect match on the
   remaining 828 rows. A vertical-shift search over ±8 rows makes it worse,
   so it is an overlay at capture time rather than an offset. The overlay was
   the fixed global bar, which `wave-b-golden.spec.ts:100` hides and this spec
   originally did not; it is hidden above now and both crops compare clean.
   The lesson is the finding: a re-capture is only comparable to a baseline if
   it reproduces the OWNING spec's preparation, and a diff harness that does
   not is measuring its own setup. */

type Verdict = {
  golden: string;
  ok: boolean;
  note?: string;
  w?: number; h?: number; shift?: number;
  atDefaultThreshold?: number;
  exact?: number;
  bbox?: { x0: number; y0: number; x1: number; y1: number } | null;
  sampleOld?: string;
  sampleNew?: string;
};

const verdicts: Verdict[] = [];

test.describe("QA 09b-1 — golden drift under the comparator's threshold", () => {
  /* `reducedMotion` is a CONTEXT option, not a test-fixture option, in
     Playwright 1.59: it appears nowhere in `playwright/lib/**` and is not in
     `PlaywrightTestOptions`. At the top level of `test.use()` it was a type
     error AND a no-op — the intent never reached the browser. Passing it
     through `contextOptions` puts it where `_combinedContextOptions` reads it
     (`playwright/lib/index.js:215`, `{ ...contextOptions, ...options }`), so
     this restores the reduced-motion capture condition rather than removing
     it. Same viewport, same intent, now actually applied. */
  test.use({ viewport: { width: 1280, height: 900 }, contextOptions: { reducedMotion: "reduce" } });
  test.describe.configure({ mode: "serial" });

  for (const c of CASES) {
    test(`${c.golden} — changed pixels at threshold 0 vs at 0.2`, async ({ page }) => {
      test.skip(test.info().project.name !== "desktop-1280", "one project is enough; this is a measurement, not a matrix");
      const goldenPath = `${GOLDEN_DIR}/${c.golden}.png`;
      if (!existsSync(goldenPath)) {
        verdicts.push({ golden: c.golden, ok: false, note: `baseline missing at ${goldenPath}` });
        test.fail(true, "baseline missing");
        return;
      }

      await installFontRetry(page);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await gotoAndSettle(page, c.path);
      await expect(page.locator(".shell-root")).toBeVisible({ timeout: 20_000 });
      await freezeVisualState(page);
      await awaitRealFaces(page);
      await hideForeignOverlays(page, { require: c.path !== "/" });
      /* THE OWNING SPEC'S PREPARATION IS PART OF THE BASELINE.
         `e2e/visual/wave-b-golden.spec.ts:100` hides `[data-fullscreen-header]`
         before every `waveb-*` capture, because `.shell-notfound` and the
         surface bands start at the top of the sheet and the fixed bar
         otherwise paints over the crop's own first rows. Re-capturing without
         that step is not a stricter comparison, it is a different picture:
         measured here, `waveb-notfound-body` came back with rows 0..239
         replaced by `rgb(12,16,18)` and every one of the remaining 1387 rows
         byte-identical. Reproduce the preparation, then compare. */
      if (c.golden.startsWith("waveb-")) {
        await page.addStyleTag({ content: "[data-fullscreen-header]{display:none !important}" });
        await expect(page.locator("[data-fullscreen-header]")).toBeHidden();
      }

      const target = page.locator(c.selector).first();
      await expect(target).toBeVisible({ timeout: 20_000 });
      /* `toHaveScreenshot` DOES NOT JUST TAKE A PICTURE. It repeats the
         capture until two consecutive frames are byte-identical, which is why
         the visual suite is stable and why a single `locator.screenshot()` is
         not: measured here, one-shot captures of `waveb-notfound-body` and
         `waveb-quality-documents` came back with their first 240 / 4 rows
         painted `rgb(12,16,18)` over a paper baseline while every remaining
         row matched byte for byte — a frame caught mid-composite, not a
         change in the build. Do what the comparator does. */
      let shot = await target.screenshot({ animations: "disabled", caret: "hide" });
      let stable = false;
      for (let attempt = 0; attempt < 8 && !stable; attempt++) {
        await page.waitForTimeout(300);
        const again = await target.screenshot({ animations: "disabled", caret: "hide" });
        stable = again.equals(shot);
        shot = again;
      }
      expect(stable, `${c.golden}: capture never reached two identical frames`).toBe(true);

      const result = await page.evaluate(
        async ({ goldenB64, shotB64 }) => {
          const load = async (b64: string) => {
            const img = new Image();
            img.src = "data:image/png;base64," + b64;
            await img.decode();
            const cv = document.createElement("canvas");
            cv.width = img.width; cv.height = img.height;
            const cx = cv.getContext("2d")!;
            cx.drawImage(img, 0, 0);
            return cx.getImageData(0, 0, img.width, img.height);
          };
          const a = await load(goldenB64);
          const b = await load(shotB64);
          if (a.width !== b.width || a.height !== b.height) {
            return { sizeMismatch: true, aw: a.width, ah: a.height, bw: b.width, bh: b.height } as const;
          }
          /* pixelmatch's own colour distance, verbatim. */
          const rgb2y = (r: number, g: number, bl: number) => r * 0.29889531 + g * 0.58662247 + bl * 0.11448223;
          const rgb2i = (r: number, g: number, bl: number) => r * 0.59597799 - g * 0.27417610 - bl * 0.32180189;
          const rgb2q = (r: number, g: number, bl: number) => r * 0.21147017 - g * 0.52261711 + bl * 0.31114694;
          const cutoff = 35215 * 0.2 * 0.2;
          /* ROW ALIGNMENT, and why it is not a tolerance.
             An element screenshot clips at integer device pixels, so a crop
             whose box sits at a fractional y can start one or more rows
             earlier than the baseline did — which paints the top rows with
             whatever is above the element and reports the whole crop as
             changed. That is an artefact of THIS re-capture, not of the
             build: the visual suite compares its own capture to its own
             baseline and never sees it. So find the vertical shift that
             actually minimises the difference, REPORT it, and measure at
             that shift. Nothing is excluded and no threshold is moved; only
             the origin is corrected, and a shift of 0 leaves the measurement
             identical. */
          const countAt = (shift: number) => {
            let n = 0;
            for (let y = Math.max(0, -shift); y < a.height - Math.max(0, shift); y++) {
              for (let x = 0; x < a.width; x++) {
                const ia = (y * a.width + x) * 4;
                const ib = ((y + shift) * a.width + x) * 4;
                if (a.data[ia] !== b.data[ib] || a.data[ia + 1] !== b.data[ib + 1] || a.data[ia + 2] !== b.data[ib + 2]) n++;
              }
            }
            return n;
          };
          let shift = 0, bestN = countAt(0);
          for (let k = -8; k <= 8; k++) { if (k === 0) continue; const n = countAt(k); if (n < bestN) { bestN = n; shift = k; } }
          let atDefault = 0, exact = 0;
          let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
          let sampleOld = "", sampleNew = "";
          for (let y = Math.max(0, -shift); y < a.height - Math.max(0, shift); y++)
          for (let x = 0; x < a.width; x++) {
            const i = (y * a.width + x) * 4;
            const j = ((y + shift) * a.width + x) * 4;
            const ar = a.data[i], ag = a.data[i + 1], ab = a.data[i + 2];
            const br = b.data[j], bg = b.data[j + 1], bb = b.data[j + 2];
            if (ar === br && ag === bg && ab === bb) continue;
            exact++;
            if (x < x0) x0 = x; if (y < y0) y0 = y;
            if (x > x1) x1 = x; if (y > y1) y1 = y;
            const dy = rgb2y(ar, ag, ab) - rgb2y(br, bg, bb);
            const di = rgb2i(ar, ag, ab) - rgb2i(br, bg, bb);
            const dq = rgb2q(ar, ag, ab) - rgb2q(br, bg, bb);
            const delta = 0.5053 * dy * dy + 0.299 * di * di + 0.1957 * dq * dq;
            if (delta > cutoff) atDefault++;
            if (!sampleOld) {
              sampleOld = `rgb(${ar},${ag},${ab})`;
              sampleNew = `rgb(${br},${bg},${bb})`;
            }
          }
          return {
            sizeMismatch: false, w: a.width, h: a.height, atDefault, exact, shift,
            bbox: x1 < 0 ? null : { x0, y0, x1, y1 }, sampleOld, sampleNew,
          } as const;
        },
        { goldenB64: readFileSync(goldenPath).toString("base64"), shotB64: shot.toString("base64") },
      );

      if (result.sizeMismatch) {
        verdicts.push({ golden: c.golden, ok: false, note: `size mismatch golden ${result.aw}x${result.ah} vs capture ${result.bw}x${result.bh}` });
        return;
      }

      verdicts.push({
        golden: c.golden, ok: true, w: result.w, h: result.h,
        atDefaultThreshold: result.atDefault, exact: result.exact, bbox: result.bbox, shift: result.shift,
        sampleOld: result.sampleOld, sampleNew: result.sampleNew,
      });

      /* THE ASSERTION IS THE GATE'S OWN, NOT A LOOSER ONE. Every one of these
         baselines is currently green in the visual suite, so the count the
         comparator would see must be within the crop's own `maxDiffPixels`.
         If this ever fires, the visual suite and this measurement disagree
         and one of them is wrong. */
      expect(result.atDefault, `${c.golden}: pixels the comparator would count`).toBeLessThanOrEqual(200);
    });
  }

  test.afterAll(() => {
    if (!verdicts.length) return;
    mkdirSync(OUT, { recursive: true });
    const lines = [
      "QA 09b-1 — GOLDEN DRIFT: what the comparator counts vs what actually changed",
      "",
      "golden                          size        rowShift  counted@0.2   changed@exact  bbox                    first differing pixel",
    ];
    for (const v of verdicts) {
      if (!v.ok) { lines.push(`${v.golden.padEnd(31)} ${v.note}`); continue; }
      const bb = v.bbox ? `${v.bbox.x0},${v.bbox.y0}..${v.bbox.x1},${v.bbox.y1}` : "-";
      lines.push(
        `${v.golden.padEnd(31)} ${`${v.w}x${v.h}`.padEnd(11)} ${String(v.shift).padStart(8)} ${String(v.atDefaultThreshold).padStart(12)} ${String(v.exact).padStart(14)}  ${bb.padEnd(23)} ${v.sampleOld} -> ${v.sampleNew}`,
      );
    }
    writeFileSync(`${OUT}/golden-drift.txt`, lines.join("\n") + "\n");
    writeFileSync(`${OUT}/golden-drift.json`, JSON.stringify(verdicts, null, 1));
  });
});
