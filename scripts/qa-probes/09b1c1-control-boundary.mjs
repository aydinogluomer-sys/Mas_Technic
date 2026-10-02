/* 09b-1-C2 — D4: THE INSTRUMENT RECONCILED WITH ITS OWN HEADER
   ══════════════════════════════════════════════════════════════════════════
   `reports/09b1c1/probe-control-boundary.mjs` opens by claiming it

     "walks the whole document, keeps every element that is interactive (or is
      the visible half of a control), keeps every element that draws a border,
      and reports the two sets separately"

   and then, at line 143, does this:

       const edge = drawnSide(s);
       if (!edge) continue;              // ← before `isControlSurface` runs

   Every borderless element is dropped BEFORE the interactive test, so the
   interactive set is a strict subset of the bordered set and the two sets are
   not independent at all. QA found three controls falling through it. They
   pass — but the claim was wrong, and the next reader of that header would
   have trusted it. That report file is frozen evidence of the run that
   produced its numbers and is not retro-edited; this is the corrected
   instrument, and `reports/09b1c2/probe-erratum.txt` records the correction
   against the frozen header.

   WHAT THIS ONE ACTUALLY DOES, stated so that it matches the code below:

     A. It walks every element in the document once.
     B. `isControlSurface(el)` is evaluated for EVERY element, borders or not.
     C. `drawnSide(s)` is evaluated for EVERY element, interactive or not.
     D. The cross product is reported as FOUR classes, not two:
          control            interactive, enclosing border  → 1.4.11 applies
          control-edge       interactive, partial rule      → not a boundary
          control-borderless interactive, NO border         → the set line 143
                                                              silently dropped
          decor              non-interactive, has a border  → not a control
        A non-interactive borderless element is neither, and is not counted.
     E. For `control-borderless` the boundary question is meaningless, so what
        is reported instead is the only thing that can identify it: its FILL
        against its ground, plus its text colour against its ground.

   ROUTE LIST. `/` IS IN IT, and that is the second half of D4. C1's sweep
   listed six shell routes and no landing, which is the entire reason
   `.tl-cad-drop` — a `<button>` with a transparent fill and a dashed edge at
   2.20:1 — survived a phase whose subject was control boundaries.

   NETWORK POSTURE. `guard()` aborts everything that is not this probe's own
   `dist/` server and `canary()` proves the abort before the first measurement.
   ══════════════════════════════════════════════════════════════════════════ */
import { mkdirSync, writeFileSync } from "node:fs";
import { canary, CONTRAST_SOURCE, guard, launch, serveDist } from "./09b1c1-lib.mjs";

const LABEL = process.argv[2] ?? "after";
const OUT = "reports/09b1c2";

const ROUTES = [
  "/",
  "/giris",
  "/sifremi-unuttum",
  "/reset-password#token_hash=probe-no-network",
  "/iletisim",
  "/teklif-al",
  "/sss",
  "/malzemeler",
];

const VIEWPORTS = [
  { width: 1280, height: 900, mobile: false },
  { width: 375, height: 812, mobile: true },
];

const CENSUS = new Function(`
  ${CONTRAST_SOURCE}

  const toneOf = (el) => {
    const band = el.closest(".tl-band[data-band-tone]");
    const root = el.closest("[data-shell-surface]");
    const bandTone = band?.getAttribute("data-band-tone") ?? null;
    const rootTone = root?.getAttribute("data-shell-surface") ?? null;
    if (!band && !root) return el.closest(".tl-root") ? "tl-landing" : "no-shell-root";
    if (bandTone && root && band !== root) return bandTone + "-band-in-" + rootTone + "-root";
    return bandTone ?? rootTone ?? "no-shell-root";
  };

  const drawnSide = (s) => {
    const drawn = [];
    for (const side of ["Top", "Right", "Bottom", "Left"]) {
      const w = parseFloat(s["border" + side + "Width"]);
      const style = s["border" + side + "Style"];
      const color = s["border" + side + "Color"];
      if (w > 0 && style !== "none" && style !== "hidden" && alphaOf(color) > 0) {
        drawn.push({ side: side.toLowerCase(), width: w, color });
      }
    }
    if (!drawn.length) return null;
    return { ...drawn[0], sides: drawn.length, enclosing: drawn.length === 4 };
  };

  const INTERACTIVE = "a[href],button,input,select,textarea,summary,[role='button'],[role='link'],[role='checkbox'],[role='radio'],[role='switch'],[role='tab'],[contenteditable='true']";

  const isControlSurface = (el) => {
    if (el.matches(INTERACTIVE)) return true;
    if (el.tagName === "LABEL") {
      const id = el.getAttribute("for");
      if (id && document.getElementById(id)) return true;
      if (el.querySelector("input,select,textarea")) return true;
    }
    return false;
  };

  const keyOf = (el) => {
    const classes = Array.from(el.classList).filter((c) => /^(shell-|tl-|sf-)/.test(c));
    return el.tagName.toLowerCase() + (classes.length ? "." + classes.join(".") : "");
  };

  const seen = new Map();
  for (const el of Array.from(document.querySelectorAll("*"))) {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") continue;
    const box = el.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) continue;

    /* BOTH TESTS, INDEPENDENTLY, FOR EVERY ELEMENT. This is the line the
       predecessor got wrong: it computed \`edge\` and \`continue\`d on a falsy
       one, which meant \`isControlSurface\` never ran for a borderless
       control. */
    const control = isControlSurface(el);
    const edge = drawnSide(s);
    if (!control && !edge) continue;

    const cls = control
      ? (edge ? (edge.enclosing ? "control" : "control-edge") : "control-borderless")
      : "decor";
    const key = cls + "|" + keyOf(el) + "|" + toneOf(el);
    const existing = seen.get(key);
    if (existing) { existing.count += 1; continue; }

    const ground = groundOf(el);
    const fill = over(s.backgroundColor, ground) ?? ground;
    const ink = over(s.color, fill);
    const border = edge ? over(edge.color, fill) : null;
    const vsFill = border ? ratio(border, fill) : null;
    const vsGround = border ? ratio(border, ground) : null;
    const fillVsGround = ratio(fill, ground);
    const inkVsFill = ratio(ink, fill);
    /* Perceivability of the CONTROL'S EXTENT is a maximum, not a minimum:
       going outward the edge is fill → border → ground, so any one of those
       transitions clearing 3:1 makes the extent visible. A filled control
       whose border matches its own fill reads 1:1 against itself and is
       plainly not invisible. */
    const binding = Math.max(...[vsFill, vsGround, fillVsGround].filter((v) => v !== null));

    seen.set(key, {
      kind: cls,
      component: keyOf(el),
      within: [el.parentElement, el.parentElement?.parentElement]
        .filter(Boolean).map(keyOf).join(" < "),
      tone: toneOf(el),
      count: 1,
      side: edge?.side ?? null,
      sides: edge?.sides ?? 0,
      enclosing: !!edge?.enclosing,
      width: edge?.width ?? 0,
      borderRaw: edge?.color ?? null,
      borderFlat: border,
      fill,
      ground,
      ink,
      vsFill,
      vsGround,
      fillVsGround,
      inkVsFill,
      binding,
      disabled: !!el.disabled || el.getAttribute("aria-disabled") === "true",
      text: (el.textContent ?? "").replace(/\\s+/g, " ").trim().slice(0, 26),
    });
  }
  return Array.from(seen.values());
`);

const run = async () => {
  mkdirSync(OUT, { recursive: true });
  const site = await serveDist();
  const browser = await launch();
  const log = [];
  const rows = [];
  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.mobile,
        hasTouch: vp.mobile,
        deviceScaleFactor: 1,
        reducedMotion: "reduce",
      });
      const net = await guard(context, site.base);
      const probe = await context.newPage();
      await probe.goto(`${site.base}/giris`, { waitUntil: "load" });
      await canary(probe, (m) => log.push(`[${vp.width}] ${m}`));
      await probe.close();

      for (const route of ROUTES) {
        const page = await context.newPage();
        await page.goto(`${site.base}${route}`, { waitUntil: "load" });
        await page.waitForTimeout(900);
        const found = await page.evaluate(CENSUS);
        for (const r of found) rows.push({ route, viewport: vp.width, ...r });
        log.push(`[${vp.width}] ${route.padEnd(46)} ${found.length} rows`);
        await page.close();
      }
      log.push(`[${vp.width}] network — requested ${net.requested.length}, blocked ${net.blocked.length}, allowed ${net.allowed.length}`);
      if (net.allowed.length) throw new Error("A non-loopback request was ALLOWED — aborting.");
      await context.close();
    }
  } finally {
    await browser.close();
    await site.close();
  }

  const by = (kind) => rows.filter((r) => r.kind === kind);
  const boundaries = by("control");
  const failing = boundaries.filter((r) => r.binding < 3 && !r.disabled);
  const borderless = by("control-borderless");
  const drops = rows.filter((r) => r.component.includes("tl-cad-drop"));

  const out = [
    `09b-1-C2 — CONTROL BOUNDARY CENSUS (${LABEL})`,
    "",
    "DISCOVERY, stated to match the code and not the intention:",
    "  every element is tested for BOTH interactivity and a drawn border, and",
    "  the four resulting classes are reported separately. The predecessor",
    "  dropped borderless elements before the interactive test; this does not.",
    "",
    `routes    ${ROUTES.length} (including /, which C1's list did not have)`,
    `viewports ${VIEWPORTS.map((v) => v.width).join(", ")}`,
    "",
    "CLASS COUNTS (component × tone × route × viewport rows)",
    `  control             ${String(boundaries.length).padStart(4)}   interactive, enclosing border — 1.4.11 applies`,
    `  control-edge        ${String(by("control-edge").length).padStart(4)}   interactive, partial rule — not a boundary`,
    `  control-borderless  ${String(borderless.length).padStart(4)}   interactive, NO border — the set line 143 dropped`,
    `  decor               ${String(by("decor").length).padStart(4)}   non-interactive border — not subject to 1.4.11`,
    "",
    `ENCLOSING CONTROL BOUNDARIES UNDER 3:1 — ${failing.length}`,
  ];
  for (const r of failing) {
    out.push(`  ${String(r.binding).padStart(6)}  ${r.component}  @${r.viewport}  ${r.route}  tone=${r.tone}`);
  }
  out.push("", "THE BORDERLESS INTERACTIVE SET, reported separately as D4 requires.");
  out.push("A control with no border is not measured by 1.4.11 at its edge; what is");
  out.push("reported is what CAN identify it — its fill against its ground and its");
  out.push("ink against its fill.");
  const seenBorderless = new Set();
  for (const r of borderless) {
    const k = `${r.component}|${r.tone}`;
    if (seenBorderless.has(k)) continue;
    seenBorderless.add(k);
    out.push(`  fill/ground ${String(r.fillVsGround).padStart(7)}   ink/fill ${String(r.inkVsFill).padStart(7)}   ${r.component}  tone=${r.tone}  "${r.text}"`);
  }

  out.push("", "THE LANDING DROP ZONE — the control C1's route list could not see.");
  for (const r of drops) {
    out.push(`  @${r.viewport}  ${r.route}  ${r.component}`);
    out.push(`     border ${r.borderRaw} → ${JSON.stringify(r.borderFlat)}`);
    out.push(`     fill ${JSON.stringify(r.fill)}   ground ${JSON.stringify(r.ground)}`);
    out.push(`     vsFill ${r.vsFill}   vsGround ${r.vsGround}   BINDING ${r.binding}   ${r.binding >= 3 ? "PASS" : "FAIL"}`);
  }
  out.push("", ...log);

  writeFileSync(`${OUT}/control-boundary-${LABEL}.json`, JSON.stringify(rows, null, 2));
  writeFileSync(`${OUT}/control-boundary-${LABEL}.txt`, out.join("\n") + "\n");
  console.log(out.join("\n"));
};

run().catch((e) => { console.error(e); process.exit(1); });
