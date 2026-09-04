/* QA round 4 — H4 confirmation, probe 2.
 *
 * Three independent questions the Coder's guard asserts, measured my own way:
 *
 *  A. Is the cursor REALLY invisible in the top-left corner at 1280/1440 with a
 *     fine pointer — and is the guard's ARMED equality falsifiable? I capture
 *     the corner with the cursor, without it, and with the occluder removed,
 *     and count DIFFERING PIXELS rather than trusting a boolean.
 *
 *  B. Does the COMMITTED artefact on disk agree? The Coder's test measures a
 *     live page; the thing that ships is the banked
 *     `landing-fullpage.png` under `e2e/__golden__/win32/<project>/`.
 *     I decode those two PNGs in a canvas and count
 *     primary-teal pixels in the same corner. A guard that is green while the
 *     banked file is dirty would be worthless.
 *
 *  C. §2.5 — what is on top at the corner, and how. `elementsFromPoint` is HIT
 *     testing, and both cursor layers are `pointer-events: none`, so they are
 *     invisible to it by construction. Paint order has to be established from
 *     z-index + opacity of the occluder instead.
 */
import { readFileSync } from "node:fs";
import { launch, log } from "./lib.mjs";

const BASE = process.env.QA_BASE ?? "http://localhost:4917";
const ROOT = "C:/Users/Trade Bilisim/pdh-wt/qa-p07c3";
const CLIP = { x: 0, y: 0, width: 64, height: 64 };
const out = { A: {}, B: {}, C: {} };

const browser = await launch();

/* ── A + C ───────────────────────────────────────────────────────────── */
for (const [width, height] of [[1280, 900], [1440, 900]]) {
  for (const route of ["/", "/hakkimizda"]) {
    const c = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
    const page = await c.newPage();
    await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForFunction(() => document.querySelectorAll("[data-custom-cursor]").length === 2, null, { timeout: 8000 }).catch(() => {});
    await page.evaluate(async () => {
      await document.fonts.ready.catch(() => {});
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    });

    const key = `${width}${route}`;
    out.C[key] = await page.evaluate(() => {
      const layers = Array.from(document.querySelectorAll("[data-custom-cursor]")).map((el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          which: el.getAttribute("data-custom-cursor"),
          zIndex: cs.zIndex, opacity: cs.opacity, pointerEvents: cs.pointerEvents,
          rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
        };
      });
      const band = document.querySelector(".tl-header-band") ?? document.querySelector("header");
      const bs = band ? getComputedStyle(band) : null;
      const br = band ? band.getBoundingClientRect() : null;
      return {
        bodyCursor: getComputedStyle(document.body).cursor,
        layers,
        /* HIT test — cursor layers are pointer-events:none so they never appear
           here. Recorded to show the packet's stated method cannot see them. */
        hitTestAtCorner: Array.from(document.elementsFromPoint(2, 2)).slice(0, 5)
          .map((el) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/)[0] : ""}[z=${getComputedStyle(el).zIndex}]`),
        cursorInHitTest: document.elementsFromPoint(2, 2).some((el) => el.hasAttribute("data-custom-cursor")),
        occluder: band ? {
          selector: band.className || band.tagName,
          zIndex: bs.zIndex, opacity: bs.opacity,
          background: bs.backgroundColor, backdropFilter: bs.backdropFilter,
          coversCorner: br.top <= 0 && br.left <= 0 && br.bottom >= 22 && br.right >= 22,
          rect: [Math.round(br.x), Math.round(br.y), Math.round(br.width), Math.round(br.height)],
        } : null,
        /* Is anything painted over the header itself at the corner? */
        interactiveUnderPointerBand: (() => {
          const els = document.elementsFromPoint(2, 2);
          return els.length ? els[0].tagName.toLowerCase() : null;
        })(),
      };
    });

    const shot = () => page.screenshot({ clip: CLIP, animations: "disabled", caret: "hide" });
    const diffPixels = async (a, b) => {
      const A = a.toString("base64"), B = b.toString("base64");
      return page.evaluate(async ([a64, b64]) => {
        const load = (b64) => new Promise((res) => {
          const img = new Image();
          img.onload = () => res(img);
          img.src = "data:image/png;base64," + b64;
        });
        const [ia, ib] = await Promise.all([load(a64), load(b64)]);
        const cv = document.createElement("canvas");
        cv.width = ia.width; cv.height = ia.height;
        const cx = cv.getContext("2d", { willReadFrequently: true });
        cx.drawImage(ia, 0, 0);
        const da = cx.getImageData(0, 0, cv.width, cv.height).data;
        cx.clearRect(0, 0, cv.width, cv.height);
        cx.drawImage(ib, 0, 0);
        const db = cx.getImageData(0, 0, cv.width, cv.height).data;
        let n = 0;
        for (let i = 0; i < da.length; i += 4) {
          if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) n += 1;
        }
        return n;
      }, [A, B]);
    };

    const withCursor = await shot();
    const determinism = await diffPixels(withCursor, await shot());
    await page.addStyleTag({ content: "[data-custom-cursor]{display:none !important}" });
    const cursorHidden = await shot();
    const armedDiff = await diffPixels(withCursor, cursorHidden);

    /* THE FALSIFICATION. Remove the only thing holding the assertion up. If the
       ARMED equality survives this, it is measuring nothing. */
    await page.addStyleTag({ content: "header{display:none !important} .tl-header-band{display:none !important} [data-custom-cursor]{display:revert !important}" });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const unoccluded = await shot();
    await page.addStyleTag({ content: "[data-custom-cursor]{display:none !important}" });
    const unoccludedNoCursor = await shot();
    const controlDiff = await diffPixels(unoccluded, unoccludedNoCursor);

    out.A[key] = {
      determinismDiff: determinism,
      armedDiff_withVsWithoutCursor: armedDiff,
      controlDiff_headerRemoved: controlDiff,
      armedHolds: armedDiff === 0,
      controlProvesVisibility: controlDiff > 0,
    };
    await c.close();
  }
}

/* ── B. the committed goldens on disk ─────────────────────────────────── */
{
  const c = await browser.newContext({ viewport: { width: 800, height: 600 } });
  const page = await c.newPage();
  await page.goto("about:blank");
  for (const project of ["visual-1280", "visual-1440", "visual-375", "visual-768"]) {
    const path = `${ROOT}/e2e/__golden__/win32/${project}/landing-fullpage.png`;
    let b64;
    try { b64 = readFileSync(path).toString("base64"); }
    catch { out.B[project] = "MISSING"; continue; }
    out.B[project] = await page.evaluate(async (b64) => {
      const img = await new Promise((res, rej) => {
        const i = new Image(); i.onload = () => res(i); i.onerror = rej;
        i.src = "data:image/png;base64," + b64;
      });
      const cv = document.createElement("canvas");
      cv.width = img.width; cv.height = img.height;
      const cx = cv.getContext("2d", { willReadFrequently: true });
      cx.drawImage(img, 0, 0);
      const w = Math.min(64, img.width), h = Math.min(64, img.height);
      const d = cx.getImageData(0, 0, w, h).data;
      /* hsl(var(--primary)) resolves to the same teal the launcher paints; the
         tolerance is the one the packet states. */
      const TARGET = [10, 125, 138], TOL = 10;
      let teal = 0;
      const near = [];
      for (let i = 0; i < d.length; i += 4) {
        const px = [d[i], d[i + 1], d[i + 2]];
        if (px.every((v, k) => Math.abs(v - TARGET[k]) <= TOL)) {
          teal += 1;
          if (near.length < 5) near.push([(i / 4) % w, Math.floor((i / 4) / w), px.join(",")]);
        }
      }
      return { imageSize: [img.width, img.height], tealPixelsInCorner64: teal, samples: near };
    }, b64);
  }
  await c.close();
}

await browser.close();
log(out);
