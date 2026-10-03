import { expect, test } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { assertNoSupabaseContact, assertSealed, sealNetwork } from "./fixtures/qa-p09a2-seal";

/* ═══════════════════════════════════════════════════════════════════════════
   QA 09a-R4 ITEM 5, PART TWO — the round-2 sweep, re-run on a settled page.

   `e2e/qa-p09a4-sla-wobble.spec.ts` established what the 57-vs-56 wobble is,
   and it is worse than a count being off by one. The round-2 sweep waits for
   `main, .shell-root, #root > *` to be ATTACHED and then sleeps a fixed 350 ms.
   On a lazily-imported route that selector is satisfied by the app shell, so
   the 350 ms is the whole budget for the route chunk to arrive and mount. Two
   routes were caught mid-flight in a 126-visit replica with

       innerText length at 350 ms:   88 characters
       innerText length once settled: 5753 and 4891 characters

   The sweep would have scanned those 88 characters, found nothing, and
   recorded the route as clean. `FINDINGS=0 across 63 routes` therefore means
   `FINDINGS=0 across the routes that happened to have rendered`, and which
   routes those are changes from run to run — `/teklif-al` in one set of runs,
   `/` and `/endustriyel/prototip-uretim` in another.

   That is a defect in a QA spec, not in the product. But round 3's `SLA on 57
   of 63` and its `FINDINGS=0` both rest on it, so the finding has to be
   re-established on an instrument that cannot make that mistake.

   THIS SPEC IS THAT INSTRUMENT. It applies the round-2 rules — transcribed
   below, unchanged and unweakened — but reads each route only after
   `document.body.innerText` has stopped changing, and it RECORDS the settled
   length of every route so the reader can see that nothing was scanned
   half-rendered. A route that never settles is a FAILURE here, not a silent
   pass.

   Read-only. Network sealed, seal proved with a live canary. No form is
   submitted, no upload control touched. Artefact goes to `test-results/`
   unless `QA_P09A4_WRITE_EVIDENCE=1`.
   ══════════════════════════════════════════════════════════════════════════ */

const ROUTES: string[] = JSON.parse(
  readFileSync(path.join(process.cwd(), "e2e", "fixtures", "qa-p09a2-routes.json"), "utf8"),
);

const QUOTE_SLA_FORMS = [/1-3\s*iş\s*günü/iu, /1-3\s*İŞ\s*GÜNÜ/u];
const rendersSla = (t: string) => QUOTE_SLA_FORMS.some((r) => r.test(t));

/* ── TRANSCRIBED VERBATIM from `e2e/qa-p09a2-claims-sweep.spec.ts`. ────────
   Not imported, because that file is a spec and importing it would run it;
   not narrowed, because the point of this run is to reproduce the round-2
   result on a settled page rather than to produce a different one. If these
   ever drift apart the two specs disagree and that is visible. */
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
  { id: "dur-numeric", cls: "LEAD_TIME", re: /\b\d+\s*[-–—]?\s*\d*\s*(iş\s*g[üu]n[üu]|g[üu]n|saat|hafta)\b/giu },
  { id: "dur-247", cls: "LEAD_TIME", re: /\b24\s*[/x]\s*7\b/gi },
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
  { id: "p-vade", cls: "PAYMENT", re: /\bvade(li|si)?\b/giu },
  { id: "p-pesin", cls: "PAYMENT", re: /pe[şs]in/giu },
  { id: "p-onodeme", cls: "PAYMENT", re: /[öo]n\s*[öo]deme|avans/giu },
  { id: "p-acikhesap", cls: "PAYMENT", re: /a[çc][ıi]k\s*hesap/giu },
  { id: "p-taksit", cls: "PAYMENT", re: /taksit/giu },
  { id: "w-garanti", cls: "WARRANTY", re: /garanti/giu },
  { id: "w-iade", cls: "WARRANTY", re: /\biade\b/giu },
  { id: "w-degisim", cls: "WARRANTY", re: /de[ğg]i[şs]im\s*(yap|hakk|taahh)/giu },
  { id: "w-taahhut", cls: "WARRANTY", re: /taahh[üu]t/giu },
];

/**
 * The shell alone. Measured: two routes caught mid-flight both read exactly 88
 * characters, and the shortest route that HAS rendered reads 1889. Anything at
 * or below this is the shell, not a page, and must not be scanned.
 */
const SHELL_ONLY_MAX = 400;

/** Poll until `document.body.innerText` stops growing, or give up loudly. */
async function settledText(page: import("@playwright/test").Page): Promise<{ text: string; ms: number; stableAfter: number }> {
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
  return { text, ms: Date.now() - started, stableAfter: stable };
}

type Finding = { route: string; rule: string; cls: string; match: string; ctx: string };

test.describe.configure({ mode: "serial" });

test("the round-2 sweep, re-run on settled pages, reaches the same verdict", async ({ page }) => {
  test.setTimeout(20 * 60 * 1000);
  const seal = await sealNetwork(page);

  await page.goto(ROUTES[0], { waitUntil: "domcontentloaded" });
  await assertSealed(page, seal);

  const findings: Finding[] = [];
  const exempted: (Finding & { why: string })[] = [];
  const slaRoutes: string[] = [];
  const lengths: { route: string; len: number; settleMs: number }[] = [];
  const neverSettled: string[] = [];

  for (const route of ROUTES) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const { text, ms } = await settledText(page);
    lengths.push({ route, len: text.length, settleMs: ms });
    if (text.length <= SHELL_ONLY_MAX) {
      neverSettled.push(route);
      continue;
    }
    if (/bir (şeyler )?ters gitti|something went wrong|error boundary/i.test(text)) {
      neverSettled.push(`${route} (error boundary)`);
      continue;
    }

    if (rendersSla(text)) slaRoutes.push(route);

    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = rule.re.exec(text)) !== null) {
        const start = Math.max(0, m.index - 80);
        const ctx = text.slice(start, Math.min(text.length, m.index + m[0].length + 80)).replace(/\s+/g, " ");
        if (m[0].length === 0) rule.re.lastIndex += 1;
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

  assertNoSupabaseContact(seal);

  const committed = process.env.QA_P09A4_WRITE_EVIDENCE === "1";
  const outDir = committed
    ? path.join(process.cwd(), "reports", "qa", "phase-09a-r4", "evidence")
    : path.join(process.cwd(), "test-results", "qa-p09a4-stabilised-sweep");
  mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `stabilised-sweep-${test.info().project.name}.json`);
  writeFileSync(
    outFile,
    JSON.stringify(
      {
        routes: ROUTES.length,
        neverSettled,
        shortestRendered: lengths.filter((l) => l.len > SHELL_ONLY_MAX).sort((a, b) => a.len - b.len)[0],
        slowestToSettle: [...lengths].sort((a, b) => b.settleMs - a.settleMs).slice(0, 5),
        slaRouteCount: slaRoutes.length,
        slaRoutes,
        routesWithoutSla: ROUTES.filter((r) => !slaRoutes.includes(r)),
        findings,
        exempted,
        lengths,
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log(
    `STABILISED route s=${ROUTES.length} neverSettled=${neverSettled.length} ` +
      `SLA_ROUTES=${slaRoutes.length} FINDINGS=${findings.length} EXEMPTED=${exempted.length}\n` +
      `P09A4_JSON=${path.relative(process.cwd(), outFile).replace(/\\/g, "/")}` +
      `${committed ? " (committed evidence)" : " (scratch)"}`,
  );

  // Every route must actually have rendered — this is the property the round-2
  // spec cannot assert and the reason its clean result was weaker than it read.
  expect(neverSettled, "a route was still showing the shell when it was scanned").toEqual([]);
  // And the substantive round-2/round-3 verdict must survive the better read.
  expect(findings, "an unauthorised duration, payment term or warranty is rendered").toEqual([]);
});
