import { expect, test } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { assertNoSupabaseContact, assertSealed, sealNetwork } from "./fixtures/qa-p09a2-seal";

/* ═══════════════════════════════════════════════════════════════════════════
   QA 09a-R2 ITEMS 2 & 5 — the sweep, in the RENDERED DOM, not by grep.

   A grep over `servicePages.ts` cannot see what a route actually paints: text
   can come from `claims.ts`, from a component default, from a template, or
   from a table the page builds at runtime. This visits every public route and
   reads `document.body.innerText`.

   The patterns are deliberately WIDER than `scripts/claims-gate.mjs`, which is
   the artefact under test — reusing its regexes would only prove it agrees
   with itself. In particular the WORDED, digit-free forms are carried
   explicitly: `aynı gün`, `ekspres`, `acil`, `gece-gündüz`, `hafta sonu`,
   `24/7`. Those are the ones a numeric sweep misses.

   Item 5 rides along: every route that renders QUOTE_RESPONSE_TIME
   ("1-3 iş günü") is recorded, because that is the one duration WITH an
   authority and the sweep must not have taken it with the rest.

   Read-only. No form is submitted, no control that could write is touched.
   ══════════════════════════════════════════════════════════════════════════ */

const ROUTES: string[] = JSON.parse(
  readFileSync(path.join(process.cwd(), "reports", "qa", "phase-09a-r2", "routes.json"), "utf8"),
);

/* Both published forms of the one authorised duration. The proof strip uses
   the uppercase DISPLAY form (`technicalLandingData.ts:35`), so a
   case-sensitive check would wrongly report the landing as having lost it. */
const QUOTE_SLA = "1-3 iş günü";
const QUOTE_SLA_FORMS = [/1-3\s*iş\s*günü/iu, /1-3\s*İŞ\s*GÜNÜ/u];
const rendersSla = (t: string) => QUOTE_SLA_FORMS.some((r) => r.test(t));

/* ── ADJUDICATED FALSE POSITIVES ──────────────────────────────────────────
   The scanner above is deliberately over-wide, so it hits Turkish phrases
   that are not claims of the prohibited kind. Each exemption names the
   substring that must be present in the surrounding context AND the reason.
   None of them weakens a real class: every one is a different WORD SENSE, not
   a softened threshold. If the surrounding text ever changes, the exemption
   stops matching and the finding comes back. */
const EXEMPT: { rule: string; needle: RegExp; why: string }[] = [
  { rule: "w-taahhut", needle: /taahh[üu]t\s*(etmez|etmiyoruz)/iu,
    why: "negated: the legal texts explicitly DISCLAIM a commitment" },
  { rule: "w-kesintisiz", needle: /kesintisiz\s*i[şs]leme/iu,
    why: "machine capability (automatic tool change / bar feed), not a shift or hours claim" },
  { rule: "dur-numeric", needle: /Gun\s*Drilling/i,
    why: "English 'Gun Drilling', not Turkish 'gün'" },
  { rule: "dur-numeric", needle: /saat\s*fiber\s*lazer\s*[öo]mr[üu]|Saat\s*Lazer\s*[ÖO]mr[üu]/iu,
    why: "component service life of the laser source, not a delivery window" },
  { rule: "p-vade", needle: /uzun\s*vadeli/iu,
    why: "'uzun vadeli' = long-term (reliability), not a credit term" },
  { rule: "w-vardiya", needle: /[Vv]ardiya\s*ba[şs][ıi]nda/u,
    why: "describes when an accuracy check happens, not a shift offered to a customer" },
];
const isExempt = (rule: string, ctx: string) =>
  EXEMPT.find((e) => e.rule === rule && e.needle.test(ctx));

type Rule = { id: string; cls: string; re: RegExp };
const RULES: Rule[] = [
  // production / delivery duration, numeric
  { id: "dur-numeric", cls: "LEAD_TIME", re: /\b\d+\s*[-–—]?\s*\d*\s*(iş\s*g[üu]n[üu]|g[üu]n|saat|hafta)\b/giu },
  { id: "dur-247", cls: "LEAD_TIME", re: /\b24\s*[/x]\s*7\b/gi },
  // production / delivery duration, WORDED (no digits) -- the missed class
  { id: "w-ayni-gun", cls: "LEAD_TIME", re: /ayn[ıi]\s*g[üu]n/giu },
  { id: "w-ertesi-gun", cls: "LEAD_TIME", re: /ertesi\s*g[üu]n/giu },
  { id: "w-ekspres", cls: "LEAD_TIME", re: /ekspres/giu },
  { id: "w-acil", cls: "LEAD_TIME", re: /\bacil\b/giu },
  { id: "w-gece-gunduz", cls: "LEAD_TIME", re: /gece\s*[-–]?\s*g[üu]nd[üu]z/giu },
  { id: "w-hafta-sonu", cls: "LEAD_TIME", re: /hafta\s*sonu/giu },
  { id: "w-kesintisiz", cls: "LEAD_TIME", re: /kesintisiz/giu },
  { id: "w-vardiya", cls: "LEAD_TIME", re: /vardiya/giu },
  { id: "w-mesai", cls: "LEAD_TIME", re: /mesai/giu },
  { id: "w-clock", cls: "LEAD_TIME", re: /\b\d{2}[:.]\d{2}\s*[-–]\s*\d{2}[:.]\d{2}\b/g },
  // payment / credit
  { id: "p-vade", cls: "PAYMENT", re: /\bvade(li|si)?\b/giu },
  { id: "p-pesin", cls: "PAYMENT", re: /pe[şs]in/giu },
  { id: "p-onodeme", cls: "PAYMENT", re: /[öo]n\s*[öo]deme|avans/giu },
  { id: "p-acikhesap", cls: "PAYMENT", re: /a[çc][ıi]k\s*hesap/giu },
  { id: "p-taksit", cls: "PAYMENT", re: /taksit/giu },
  // return / warranty
  { id: "w-garanti", cls: "WARRANTY", re: /garanti/giu },
  { id: "w-iade", cls: "WARRANTY", re: /\biade\b/giu },
  { id: "w-degisim", cls: "WARRANTY", re: /de[ğg]i[şs]im\s*(yap|hakk|taahh)/giu },
  { id: "w-taahhut", cls: "WARRANTY", re: /taahh[üu]t/giu },
];

/* ── WAITING FOR THE PAGE, NOT FOR THE SHELL ── 09a-C5 / R4-4 ────────────
   This spec used to wait for `main, .shell-root, #root > *` to be ATTACHED and
   then sleep a fixed 350 ms. On a lazily-imported route that selector is
   satisfied by the app SHELL, so 350 ms was the entire budget for the route
   chunk to arrive and mount.

   QA measured the consequence in round 4: 41 of the 63 routes settle more than
   350 ms after the fastest, the slowest at 4018 ms, and two routes were caught
   mid-flight with an `innerText` of 88 characters against 5753 and 4891 once
   settled. The sweep scanned those 88 characters, found nothing, and recorded
   the route as clean. So `FINDINGS=0 across 63 routes` has always meant
   "across the routes that happened to have rendered" — in rounds 2 and 3 as
   well, since both rest on this spec. Which routes those were changed from run
   to run, which is also why `SLA_ROUTES` wobbled between 56 and 57.

   THE FINDINGS SURVIVE THE BETTER INSTRUMENT. `e2e/qa-p09a4-stabilised-sweep.spec.ts`
   re-ran the same rules on settled pages and reached `neverSettled=0`,
   `SLA_ROUTES=57`, `FINDINGS=0` at both desktop-1280 and mobile-375. 57 was
   right; 56 was the instrument. This spec now waits the same way, so the two
   agree by construction rather than by luck.

   The RULES, the EXEMPT list and the assertions above and below are untouched.
   Only the moment of reading changes — and a route that never renders is now a
   loud failure instead of a silent clean row, which is the whole point: a
   sweep that cannot tell "no violations here" from "nothing here" reports the
   same number for both. */

/**
 * The shell alone. Measured, not chosen: the two routes caught mid-flight both
 * read exactly 88 characters, and the SHORTEST route that has actually rendered
 * reads 1889. Anything at or below this is the shell, not a page.
 */
const SHELL_ONLY_MAX = 400;

/** Poll until `document.body.innerText` stops growing, or give up loudly. */
async function settledText(
  page: import("@playwright/test").Page,
): Promise<{ text: string; ms: number }> {
  const started = Date.now();
  let previous = -1;
  let stable = 0;
  let text = "";
  for (let i = 0; i < 60; i += 1) {
    text = await page.evaluate(() => document.body.innerText || "");
    if (text.length === previous && text.length > SHELL_ONLY_MAX) {
      stable += 1;
      if (stable >= 3) break;
    } else {
      stable = 0;
      previous = text.length;
    }
    await page.waitForTimeout(150);
  }
  return { text, ms: Date.now() - started };
}

type Finding = { route: string; rule: string; cls: string; match: string; ctx: string };
type Exempted = Finding & { why: string };

const findings: Finding[] = [];
const exempted: Exempted[] = [];
const slaRoutes: string[] = [];
const visited: string[] = [];
const failedRoutes: { route: string; reason: string }[] = [];
const settleTimes: { route: string; len: number; settleMs: number }[] = [];

test.describe.configure({ mode: "serial" });

test("public routes carry no unauthorised duration, payment term or warranty", async ({ page }) => {
  test.setTimeout(20 * 60 * 1000);
  const seal = await sealNetwork(page);

  await page.goto(ROUTES[0], { waitUntil: "domcontentloaded" });
  await assertSealed(page, seal); // proven before anything else

  for (const route of ROUTES) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const settled = await settledText(page);
    settleTimes.push({ route, len: settled.text.length, settleMs: settled.ms });
    if (settled.text.length <= SHELL_ONLY_MAX) {
      // Loudly. A route that never rendered is not a route with no violations.
      failedRoutes.push({
        route,
        reason: `never settled: ${settled.text.length} characters after ${settled.ms} ms — the shell, not the page`,
      });
      continue;
    }

    /* U+00A0 written as an escape, not as the character. The literal was the
       file's one `no-irregular-whitespace` error, and an invisible character
       that lint objects to is a poor thing to leave on the line that decides
       what gets scanned. Same regex, same behaviour. */
    const text = settled.text.replace(/\u00a0/g, " ");

    // An error boundary would make every route look clean. Catch that.
    if (/bir (şeyler )?ters gitti|something went wrong|error boundary/i.test(text)) {
      failedRoutes.push({ route, reason: "error boundary rendered" });
      continue;
    }
    visited.push(route);

    if (rendersSla(text)) slaRoutes.push(route);

    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = rule.re.exec(text)) !== null) {
        const start = Math.max(0, m.index - 80);
        const ctx = text.slice(start, Math.min(text.length, m.index + m[0].length + 80)).replace(/\s+/g, " ");
        if (m[0].length === 0) rule.re.lastIndex++;
        // The authorised quote SLA is not a violation.
        if (rule.cls === "LEAD_TIME" && /1-3\s*iş\s*günü/iu.test(ctx) && /iş\s*gün/iu.test(m[0])) continue;
        const ex = isExempt(rule.id, ctx);
        if (ex) {
          exempted.push({ route, rule: rule.id, cls: rule.cls, match: m[0], ctx, why: ex.why });
          continue;
        }
        findings.push({ route, rule: rule.id, cls: rule.cls, match: m[0], ctx });
      }
    }
  }

  /* WHERE THIS RUN'S EVIDENCE GOES — 09a-C4 / R3-5.2.
     This used to write `reports/qa/phase-09a-r2/sweep.json` unconditionally on
     every run, so re-running round 2's spec — for a regression check, or by a
     later round that simply names the file — overwrote round 2's COMMITTED
     evidence with a different run's numbers. QA reproduced it and had to
     restore the files.

     Committed evidence is a record of what was true on a date. Writing it is
     now an explicit act: set `QA_SWEEP_WRITE_EVIDENCE=1` to refresh the
     round-2 artefact on purpose. Every ordinary run drops its output in
     `test-results/`, which is scratch and is not committed, so a regression
     run is still fully inspectable and cannot destroy anything. */
  const writesEvidence = process.env.QA_SWEEP_WRITE_EVIDENCE === "1";
  const outDir = writesEvidence
    ? path.join(process.cwd(), "reports", "qa", "phase-09a-r2")
    : path.join(process.cwd(), "test-results", "qa-p09a2-claims-sweep");
  mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "sweep.json");
  writeFileSync(
    outFile,
    JSON.stringify({ routesRequested: ROUTES.length, routesVisited: visited.length, failedRoutes,
      slaRouteCount: slaRoutes.length, slaRoutes, findings, exempted,
      // 09a-C5 / R4-4: so a reader can see nothing was scanned half-rendered.
      slowestToSettle: [...settleTimes].sort((a, b) => b.settleMs - a.settleMs).slice(0, 5),
      shortestSettled: [...settleTimes].sort((a, b) => a.len - b.len).slice(0, 5) }, null, 2),
    "utf8",
  );
  console.log(`SWEEP_JSON=${path.relative(process.cwd(), outFile).replace(/\\/g, "/")}` +
    `${writesEvidence ? " (committed evidence, QA_SWEEP_WRITE_EVIDENCE=1)" : " (scratch)"}`);

  console.log(`ROUTES_REQUESTED=${ROUTES.length} ROUTES_VISITED=${visited.length} ` +
    `FAILED=${failedRoutes.length} SLA_ROUTES=${slaRoutes.length} FINDINGS=${findings.length} ` +
    `EXEMPTED=${exempted.length}`);
  for (const e of exempted) console.log(`  (exempt: ${e.why}) [${e.cls}/${e.rule}] ${e.route} :: ${JSON.stringify(e.match)}`);
  for (const f of findings) {
    console.log(`  [${f.cls}/${f.rule}] ${f.route} :: ${JSON.stringify(f.match)} … ${f.ctx}`);
  }
  const slowest = [...settleTimes].sort((a, b) => b.settleMs - a.settleMs)[0];
  const shortest = [...settleTimes].sort((a, b) => a.len - b.len)[0];
  console.log(
    `SETTLED slowest=${slowest?.route ?? "-"}@${slowest?.settleMs ?? 0}ms ` +
      `shortest=${shortest?.route ?? "-"}@${shortest?.len ?? 0}chars neverSettled=${failedRoutes.length}`,
  );

  const noSla = visited.filter((r) => !slaRoutes.includes(r));
  console.log(`ROUTES_WITHOUT_SLA (${noSla.length}): ${noSla.join(", ")}`);

  assertNoSupabaseContact(seal);

  expect(failedRoutes, "every public route must SETTLE and render — an unrendered route is not a clean route").toEqual([]);
  expect(findings, "no unauthorised duration / payment term / warranty on any public route").toEqual([]);
});
