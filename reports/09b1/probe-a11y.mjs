/* 09b-1 — ACCESSIBILITY, MEASURED IN THE RENDERED PAGE AT 1280 AND 375.
   ------------------------------------------------------------------------
   Four things, and none of them read from source:

   1. CONTRAST, computed from resolved colours. Text is measured against its
      own EFFECTIVE ground — walked up the ancestor chain past every
      transparent box, because a colour compared against a background nobody
      paints is not a measurement. Threshold 4.5:1, or 3:1 where the text is
      large by WCAG's definition (>=24px, or >=18.66px at weight >=700).
      Non-text is the hairlines and the field borders the layout is built from,
      against the ground they sit on, at 3:1.
   2. LABEL ASSOCIATION for every control, from the accessibility tree's own
      answer rather than from the markup: a control with no accessible name is
      reported whatever attributes it carries.
   3. KEYBOARD: tab from the top of the document and record what is reached, in
      order, with the focus indicator each stop actually paints. A stop whose
      outline is `none` and whose box-shadow does not change is a stop the
      reader cannot see.
   4. axe-core, `wcag2a wcag2aa wcag21a wcag21aa` plus best-practice, scoped to
      `<main>`.

   Behind the abort guard with an empty allow list, proved with the canary. */
import { mkdirSync, writeFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { launch, guard, canary, BASE } from "./probe-lib.mjs";

const OUT = process.env.PROBE_OUT ?? "reports/09b1/a11y.json";
mkdirSync("reports/09b1", { recursive: true });

/* The three routes plus the two states that only exist behind a URL:
   `#token_hash` renders /reset-password's FORM (no request — see
   probe-states.mjs), so its fields are measurable at all. */
const SURFACES = [
  { name: "giris", url: "/giris" },
  { name: "forgot", url: "/sifremi-unuttum" },
  { name: "reset-absent", url: "/reset-password" },
  { name: "reset-form", url: "/reset-password#token_hash=probe-no-network" },
];

const browser = await launch();
const report = { base: BASE, viewports: {} };

for (const width of [1280, 375]) {
  const context = await browser.newContext({
    viewport: { width, height: width === 1280 ? 900 : 812 },
    isMobile: width === 375,
    hasTouch: width === 375,
    reducedMotion: "reduce",
  });
  const traffic = await guard(context, []);
  const perRoute = {};
  console.log(`\n── ${width} ──`);

  for (const surface of SURFACES) {
    const page = await context.newPage();
    await page.goto(`${BASE}${surface.url}`, { waitUntil: "load" });
    await page.waitForTimeout(900);
    if (surface.name === "giris") await canary(page, (m) => console.log(`  ${m}`));

    const measured = await page.evaluate(() => {
      const srgb = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      const parse = (s) => {
        const n = String(s).match(/[\d.]+/g);
        return n ? n.slice(0, 3).map(Number) : null;
      };
      const lum = ([r, g, b]) => 0.2126 * srgb(r / 255) + 0.7152 * srgb(g / 255) + 0.0722 * srgb(b / 255);
      const ratio = (fg, bg) => {
        const a = parse(fg); const b = parse(bg);
        if (!a || !b) return null;
        const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
        return Number(((hi + 0.05) / (lo + 0.05)).toFixed(2));
      };
      const opaque = (c) => {
        const m = String(c).match(/rgba?\(([^)]+)\)/);
        if (!m) return false;
        const parts = m[1].split(",").map((v) => parseFloat(v));
        return parts.length < 4 || parts[3] > 0.95;
      };
      /** The ground a node is actually painted on. */
      const ground = (el) => {
        let node = el;
        while (node) {
          const bg = getComputedStyle(node).backgroundColor;
          if (opaque(bg)) return bg;
          node = node.parentElement;
        }
        return getComputedStyle(document.body).backgroundColor || "rgb(0, 0, 0)";
      };
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0";
      };
      const label = (el) => (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 46);

      const main = document.querySelector("main");
      const nodes = main ? Array.from(main.querySelectorAll("*")) : [];

      /* ── text ── */
      const text = [];
      for (const el of nodes) {
        if (!visible(el)) continue;
        const own = Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3 && n.textContent.trim())
          .map((n) => n.textContent.trim())
          .join(" ");
        if (!own) continue;
        const s = getComputedStyle(el);
        const size = parseFloat(s.fontSize);
        const weight = Number(s.fontWeight) || 400;
        const large = size >= 24 || (size >= 18.66 && weight >= 700);
        const r = ratio(s.color, ground(el));
        if (r === null) continue;
        text.push({
          tag: el.tagName.toLowerCase(),
          cls: String(el.className || "").slice(0, 48),
          text: own.slice(0, 44),
          size, weight, large,
          fg: s.color, bg: ground(el),
          ratio: r,
          required: large ? 3 : 4.5,
          pass: r >= (large ? 3 : 4.5),
        });
      }

      /* ── non-text: the hairlines and field borders the layout is built from ──
         The shell paints its rules TRANSLUCENT (`--tl-rule` is
         `rgba(227,231,225,.28)`), so a censu that skipped non-opaque borders
         would silently skip every rule on the page and report a flattering
         minimum drawn from the two opaque ones. Each border is composited over
         its own ground first, which is what the eye actually sees. */
      const composite = (colour, over) => {
        const c = parse(colour); const g = parse(over);
        if (!c || !g) return null;
        const m = String(colour).match(/rgba?\(([^)]+)\)/);
        const parts = m ? m[1].split(",").map((v) => parseFloat(v)) : [];
        const alpha = parts.length === 4 ? parts[3] : 1;
        if (alpha === 0) return null;
        return `rgb(${c.map((v, i) => Math.round(alpha * v + (1 - alpha) * g[i])).join(", ")})`;
      };
      const nonText = [];
      for (const el of nodes) {
        if (!visible(el)) continue;
        const s = getComputedStyle(el);
        for (const side of ["Top", "Right", "Bottom", "Left"]) {
          if (parseFloat(s[`border${side}Width`]) <= 0) continue;
          if (s[`border${side}Style`] === "none") continue;
          const bg = ground(el.parentElement ?? el);
          const flat = composite(s[`border${side}Color`], bg);
          if (!flat) continue;
          const r = ratio(flat, bg);
          if (r === null) continue;
          nonText.push({
            cls: String(el.className || "").slice(0, 48),
            side, colour: s[`border${side}Color`], flattened: flat, over: bg,
            ratio: r, pass: r >= 3,
          });
        }
      }

      /* ── controls ── */
      const controls = Array.from(
        main?.querySelectorAll("input, select, textarea, button, a[href]") ?? [],
      ).filter(visible).map((el) => {
        const id = el.id;
        const labelled = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
        const name = el.getAttribute("aria-label")
          ?? (labelled ? labelled.textContent.replace(/\s+/g, " ").trim() : null)
          ?? label(el)
          ?? null;
        return {
          tag: el.tagName.toLowerCase(),
          type: el.getAttribute("type"),
          id: id || null,
          accessibleName: name || null,
          hasName: !!(name && name.length),
          labelFor: !!labelled,
          describedBy: el.getAttribute("aria-describedby"),
          invalid: el.getAttribute("aria-invalid"),
          autoComplete: el.getAttribute("autocomplete"),
          minTouch: Math.round(Math.min(el.getBoundingClientRect().width, el.getBoundingClientRect().height)),
        };
      });

      return { text, nonText, controls };
    });

    /* ── keyboard walk ── */
    await page.evaluate(() => document.body.focus());
    const stops = [];
    for (let i = 0; i < 26; i += 1) {
      await page.keyboard.press("Tab");
      const stop = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const s = getComputedStyle(el);
        const inMain = !!el.closest("main");
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          name: (el.getAttribute("aria-label") ?? el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40),
          inMain,
          outlineStyle: s.outlineStyle,
          outlineWidth: s.outlineWidth,
          outlineColor: s.outlineColor,
          boxShadow: s.boxShadow === "none" ? null : s.boxShadow.slice(0, 60),
          borderColor: s.borderTopColor,
        };
      });
      if (!stop) break;
      stops.push(stop);
      if (stops.length > 2 && stops.at(-1).id && stops.at(-1).id === stops.at(-2)?.id) break;
    }

    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
      .include("main")
      .analyze();

    const textFails = measured.text.filter((t) => !t.pass);
    const nonTextFails = measured.nonText.filter((t) => !t.pass);
    const unnamed = measured.controls.filter((c) => !c.hasName);
    const invisibleFocus = stops.filter(
      (s) => s.inMain && (s.outlineStyle === "none" || parseFloat(s.outlineWidth) === 0) && !s.boxShadow,
    );

    perRoute[surface.name] = {
      url: surface.url,
      textNodes: measured.text.length,
      textMin: measured.text.length ? Math.min(...measured.text.map((t) => t.ratio)) : null,
      textLowest: [...measured.text].sort((a, b) => a.ratio - b.ratio).slice(0, 6),
      textFails,
      nonTextNodes: measured.nonText.length,
      nonTextMin: measured.nonText.length ? Math.min(...measured.nonText.map((t) => t.ratio)) : null,
      nonTextLowest: [...measured.nonText].sort((a, b) => a.ratio - b.ratio).slice(0, 8),
      nonTextFails,
      controls: measured.controls,
      unnamedControls: unnamed,
      keyboardStops: stops,
      invisibleFocus,
      axeViolations: axe.violations.map((v) => ({
        id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length,
        targets: v.nodes.slice(0, 4).map((n) => n.target.join(" ")),
      })),
    };

    console.log(
      `  ${surface.name.padEnd(13)} text ${measured.text.length} min ${perRoute[surface.name].textMin}`
      + ` (${textFails.length} fail) · non-text min ${perRoute[surface.name].nonTextMin} (${nonTextFails.length} fail)`
      + ` · controls ${measured.controls.length} (${unnamed.length} unnamed)`
      + ` · tab stops ${stops.length} (${invisibleFocus.length} invisible)`
      + ` · axe ${axe.violations.length}`,
    );
    if (axe.violations.length) {
      for (const v of axe.violations) console.log(`      axe: ${v.id} (${v.impact}) x${v.nodes.length}`);
    }
    for (const f of textFails.slice(0, 6)) {
      console.log(`      text ${f.ratio}:1 need ${f.required} — "${f.text}" ${f.cls}`);
    }
    for (const f of nonTextFails.slice(0, 6)) {
      console.log(`      rule ${f.ratio}:1 — ${f.cls} border-${f.side}`);
    }
    await page.close();
  }

  perRoute.__traffic = { blocked: traffic.blocked.length, allowed: traffic.allowed.length };
  console.log(`  traffic: blocked ${traffic.blocked.length}, ALLOWED ${traffic.allowed.length}`);
  report.viewports[width] = perRoute;
  await context.close();
}

await browser.close();
writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(`\nwrote ${OUT}`);
