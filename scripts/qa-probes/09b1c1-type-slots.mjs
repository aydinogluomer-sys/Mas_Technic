/* 09b-1-C2 — WHICH DESIGN-SYSTEM COMPONENTS ACTUALLY HOLD THE INVARIANT
   ══════════════════════════════════════════════════════════════════════════
   The gate this packet asks for rests on one sentence:

     a component the design system defines must compute the same typography
     everywhere it appears.

   The sentence is only worth gating on where it is TRUE, and the packet warns
   against over-reach in the same breath: a component that legitimately varies
   by ground or by viewport is not a violation. So the slot list in
   `e2e/design-system-typography.spec.ts` is not written from memory — it is
   chosen from this census, which walks every element carrying a `shell-*` /
   `tl-*` class on every shell route, fingerprints its typography, and reports
   every component that resolves more than one treatment.

   THE FINGERPRINT IS TYPOGRAPHY ONLY — family, size, weight, style,
   letter-spacing, transform. COLOUR IS DELIBERATELY EXCLUDED: this system
   re-binds colour by ground through `--sf-*` on purpose, so a component that
   is `--tl-white` on graphite and `--tl-ink` on paper is working correctly. A
   component whose SIZE changes with the ground is not.

   ONE VIEWPORT PER PASS, for the same reason: the type ramp is responsive by
   design. The axis held constant is route and ground, never viewport.
   ══════════════════════════════════════════════════════════════════════════ */
import { mkdirSync, writeFileSync } from "node:fs";
import { canary, guard, launch, serveDist } from "./09b1c1-lib.mjs";

const OUT = "reports/09b1c2";
const WIDTH = Number(process.argv[2] ?? 1280);

const ROUTES = [
  /* `/` is in the list deliberately. The landing is the one surface with a
     motion layer that can mutate a computed style mid-run, so whether the
     invariant survives there is a question to MEASURE before a gate claims
     it — which is why the probe asks rather than the spec assuming. */
  "/",
  "/giris",
  "/sifremi-unuttum",
  "/reset-password",
  "/iletisim",
  "/teklif-al",
  "/malzemeler",
  "/sss",
  "/hakkimizda",
  "/blog",
  "/404-does-not-exist",
];

const CENSUS = () => {
  const out = [];
  const fingerprint = (el) => {
    const s = getComputedStyle(el);
    return [
      s.fontFamily.split(",")[0].replace(/["']/g, ""),
      s.fontSize,
      s.fontWeight,
      s.fontStyle,
      s.letterSpacing,
      s.textTransform,
    ].join(" / ");
  };
  const keyOf = (el) => {
    const classes = Array.from(el.classList).filter((c) => /^(shell-|tl-)/.test(c)).sort();
    return classes.length ? `${el.tagName.toLowerCase()}.${classes.join(".")}` : null;
  };
  const groundOf = (el) => {
    const band = el.closest(".tl-band[data-band-tone]");
    const root = el.closest("[data-shell-surface]");
    return (band?.getAttribute("data-band-tone") ?? null)
      ?? (root?.getAttribute("data-shell-surface") ?? null)
      ?? (el.closest(".tl-root") ? "tl-landing" : "none");
  };
  for (const el of Array.from(document.querySelectorAll("*"))) {
    const key = keyOf(el);
    if (!key) continue;
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 && r.height < 1) continue;
    out.push({
      key,
      style: fingerprint(el),
      ground: groundOf(el),
      sample: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 30),
    });
  }
  /* Also the one slot the historical defect lived in: a plain `<label>` that
     carries no design-system class of its own but is defined by its parent. */
  for (const root of Array.from(document.querySelectorAll(".shell-field"))) {
    for (const el of Array.from(root.querySelectorAll("label, input, select, textarea"))) {
      const r = el.getBoundingClientRect();
      if (r.width < 1 && r.height < 1) continue;
      out.push({
        key: `.shell-field ${el.tagName.toLowerCase()}`,
        style: fingerprint(el),
        ground: groundOf(el),
        sample: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 30) || el.getAttribute("name") || "",
      });
    }
  }
  return out;
};

const run = async () => {
  mkdirSync(OUT, { recursive: true });
  const site = await serveDist();
  const browser = await launch();
  const rows = [];
  const log = [];
  try {
    const context = await browser.newContext({
      viewport: { width: WIDTH, height: 900 },
      isMobile: WIDTH < 700,
      hasTouch: WIDTH < 700,
      reducedMotion: "reduce",
    });
    const net = await guard(context, site.base);
    const probe = await context.newPage();
    await probe.goto(`${site.base}/giris`, { waitUntil: "load" });
    await canary(probe, (m) => log.push(m));
    await probe.close();

    for (const route of ROUTES) {
      const page = await context.newPage();
      await page.goto(`${site.base}${route}`, { waitUntil: "load" });
      await page.waitForTimeout(900);
      for (const r of await page.evaluate(CENSUS)) rows.push({ route, ...r });
      await page.close();
    }
    log.push(`network — requested ${net.requested.length}, blocked ${net.blocked.length}, allowed ${net.allowed.length}`);
    if (net.allowed.length) throw new Error("A non-loopback request was ALLOWED — aborting.");
    await context.close();
  } finally {
    await browser.close();
    await site.close();
  }

  const groups = new Map();
  for (const r of rows) {
    if (!groups.has(r.key)) groups.set(r.key, new Map());
    const g = groups.get(r.key);
    if (!g.has(r.style)) g.set(r.style, { routes: new Set(), grounds: new Set(), n: 0, sample: r.sample });
    const e = g.get(r.style);
    e.routes.add(r.route);
    e.grounds.add(r.ground);
    e.n += 1;
  }

  const split = [...groups.entries()].filter(([, g]) => g.size > 1)
    .sort((a, b) => b[1].size - a[1].size);
  const single = [...groups.entries()].filter(([, g]) => g.size === 1);

  const out = [
    `09b-1-C2 — DESIGN-SYSTEM TYPOGRAPHY DISCOVERY @ ${WIDTH}`,
    "",
    `routes ${ROUTES.length}   components seen ${groups.size}   observations ${rows.length}`,
    `  ONE treatment   ${single.length}`,
    `  SPLIT           ${split.length}`,
    "",
    "SPLIT — every component resolving more than one typography across routes",
    "and grounds at this viewport. A split here is not automatically a defect;",
    "it is the list from which the gate's slots are chosen, with a reason for",
    "every one left out.",
    "",
  ];
  for (const [key, g] of split) {
    out.push(`${key}   — ${g.size} treatments`);
    for (const [style, e] of g) {
      out.push(`    ${String(e.n).padStart(4)}x  ${style}`);
      out.push(`          grounds ${[...e.grounds].join(", ")}`);
      out.push(`          routes  ${[...e.routes].join(", ")}`);
      out.push(`          e.g.    ${e.sample}`);
    }
    out.push("");
  }
  out.push("", "ONE TREATMENT — candidates for the gate");
  for (const [key, g] of single) {
    const [style, e] = [...g.entries()][0];
    out.push(`  ${String(e.n).padStart(4)}x  ${key.padEnd(52)} ${style}`);
    out.push(`          ${[...e.routes].length} route(s), grounds ${[...e.grounds].join(", ")}`);
  }
  out.push("", ...log);

  writeFileSync(`${OUT}/type-slots-${WIDTH}.txt`, out.join("\n") + "\n");
  writeFileSync(`${OUT}/type-slots-${WIDTH}.json`, JSON.stringify(rows, null, 2));
  console.log(out.slice(0, 12).join("\n"));
  console.log(`\nSPLIT components: ${split.length} — see ${OUT}/type-slots-${WIDTH}.txt`);
};

run().catch((e) => { console.error(e); process.exit(1); });
