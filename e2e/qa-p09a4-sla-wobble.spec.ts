import { expect, test } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { assertNoSupabaseContact, assertSealed, sealNetwork } from "./fixtures/qa-p09a2-seal";

/* ═══════════════════════════════════════════════════════════════════════════
   QA 09a-R4 ITEM 5 — 57 vs 56: is the sweep's SLA count measuring the page,
   or measuring the clock?

   `e2e/qa-p09a2-claims-sweep.spec.ts` reported `SLA_ROUTES=57` twice and `56`
   once in this round's three runs, `FINDINGS=0` every time. Set-differencing
   the three `sweep.json` files names exactly one unstable route: `/teklif-al`.

   The sweep's read is:

       goto(route, { waitUntil: "domcontentloaded" })
       wait for `main, .shell-root, #root > *` to be ATTACHED
       waitForTimeout(350)                              ← a fixed sleep
       document.body.innerText

   `#root > *` attaches when the app shell paints, which on a lazily-imported
   route happens BEFORE the route's own chunk has arrived. So the 350 ms is the
   entire budget the route component has to load and render, and `/teklif-al`
   is the heaviest route in the tree (CAD preview, viewer, parser).

   THE QUESTION THIS SPEC DECIDES is which of two very different things the
   wobble is:

     (a) a measurement flake — the copy is always in the page, and the sweep
         occasionally reads the page before it exists; or
     (b) a real intermittency — the route sometimes genuinely renders without
         the authorised `1-3 iş günü`.

   They are told apart by reading the SAME route three ways:

     textContent  — present in the DOM whether or not it is laid out;
     innerText @350 ms   — exactly what the sweep sees;
     innerText @3000 ms  — what the page settles to.

   If textContent and the settled read are always present while the 350 ms read
   is not, it is (a), and the defect is in the round-2 spec — which is mine.

   This spec is READ-ONLY. It visits one route, reads text, and submits,
   uploads and clicks nothing. Its artefact goes to `test-results/` unless
   `QA_P09A4_WRITE_EVIDENCE=1` is set, for the reason three specs in this phase
   have already had to learn.
   ══════════════════════════════════════════════════════════════════════════ */

const ROUTE = "/teklif-al";
/** The sweep's own two accepted forms, transcribed. */
const SLA_FORMS = [/1-3\s*iş\s*günü/iu, /1-3\s*İŞ\s*GÜNÜ/u];
const rendersSla = (t: string) => SLA_FORMS.some((r) => r.test(t));

/** The sweep's exact wait, and a settled one. */
const SWEEP_WAIT_MS = 350;
const SETTLED_WAIT_MS = 3000;
const ATTEMPTS = 12;

type Sample = {
  attempt: number;
  /** What the sweep would have recorded. */
  innerTextAt350: boolean;
  /** Whether the route component had rendered at all by then. */
  innerTextLenAt350: number;
  /** Present in the DOM, laid out or not, at the same instant. */
  textContentAt350: boolean;
  /** After the page settles. */
  innerTextAtSettled: boolean;
  innerTextLenAtSettled: number;
  textContentAtSettled: boolean;
};

function writeArtefact(name: string, payload: unknown): void {
  const committed = process.env.QA_P09A4_WRITE_EVIDENCE === "1";
  const outDir = committed
    ? path.join(process.cwd(), "reports", "qa", "phase-09a-r4", "evidence")
    : path.join(process.cwd(), "test-results", "qa-p09a4-sla-wobble");
  mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, name);
  writeFileSync(outFile, JSON.stringify(payload, null, 2), "utf8");
  console.log(
    `P09A4_JSON=${path.relative(process.cwd(), outFile).replace(/\\/g, "/")}` +
      `${committed ? " (committed evidence, QA_P09A4_WRITE_EVIDENCE=1)" : " (scratch)"}`,
  );
}

test.describe.configure({ mode: "serial" });

/**
 * One arm of the experiment.
 *
 * `sealed` is the discriminator. The round-2 sweep installs
 * `page.route("**\/*")` before it visits anything, so EVERY request the page
 * makes — including every lazily-imported route chunk on loopback — is
 * round-tripped through a Node-side handler and re-emitted with
 * `route.fallback()`. That is latency the browser does not otherwise pay, and
 * `/teklif-al` is the heaviest chunk in the tree. If the miss appears with the
 * seal on and never with it off, the wobble belongs to the instrument.
 */
async function measure(page: import("@playwright/test").Page, sealed: boolean): Promise<Sample[]> {
  const samples: Sample[] = [];
  const seal = sealed ? await sealNetwork(page) : null;

  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    // A cold load every time: the wobble is a first-paint race and a warm
    // module cache would hide it.
    await page.goto("about:blank");
    await page.context().clearCookies();

    await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
    if (seal !== null && attempt === 1) await assertSealed(page, seal);
    await page
      .locator("main, .shell-root, #root > *")
      .first()
      .waitFor({ state: "attached", timeout: 15000 });
    await page.waitForTimeout(SWEEP_WAIT_MS);

    const early = await page.evaluate(() => ({
      innerText: document.body.innerText || "",
      textContent: document.body.textContent || "",
    }));

    await page.waitForTimeout(SETTLED_WAIT_MS);

    const settled = await page.evaluate(() => ({
      innerText: document.body.innerText || "",
      textContent: document.body.textContent || "",
    }));

    samples.push({
      attempt,
      innerTextAt350: rendersSla(early.innerText),
      innerTextLenAt350: early.innerText.length,
      textContentAt350: rendersSla(early.textContent),
      innerTextAtSettled: rendersSla(settled.innerText),
      innerTextLenAtSettled: settled.innerText.length,
      textContentAtSettled: rendersSla(settled.textContent),
    });
  }

  if (seal !== null) assertNoSupabaseContact(seal);
  return samples;
}

function report(arm: string, samples: Sample[]): { earlyMiss: number; settledMiss: number; verdict: string } {
  const earlyMisses = samples.filter((s) => !s.innerTextAt350);
  const settledMisses = samples.filter((s) => !s.innerTextAtSettled);

  const verdict =
    settledMisses.length > 0
      ? "REAL_INTERMITTENCY — the settled page sometimes lacks the authorised SLA"
      : earlyMisses.length > 0
        ? "MEASUREMENT_RACE — the copy is always in the settled page; the 350 ms read is not"
        : "NO_WOBBLE_OBSERVED — both reads were stable in this arm";

  writeArtefact(`sla-wobble-${arm}-${test.info().project.name}.json`, {
    route: ROUTE,
    arm,
    attempts: ATTEMPTS,
    sweepWaitMs: SWEEP_WAIT_MS,
    settledWaitMs: SETTLED_WAIT_MS,
    earlyMissCount: earlyMisses.length,
    settledMissCount: settledMisses.length,
    verdict,
    samples,
  });

  console.log(
    `SLA_WOBBLE arm=${arm} route=${ROUTE} attempts=${ATTEMPTS} ` +
      `earlyMiss=${earlyMisses.length} settledMiss=${settledMisses.length} verdict=${verdict}`,
  );
  return { earlyMiss: earlyMisses.length, settledMiss: settledMisses.length, verdict };
}

test("unsealed: /teklif-al carries the authorised SLA on every attempt", async ({ page }) => {
  test.setTimeout(5 * 60 * 1000);
  const samples = await measure(page, false);
  const { settledMiss } = report("unsealed", samples);
  /* THE ONLY ASSERTION THAT CAN FAIL PRODUCTION. Whatever the sweep's timing
     does, the settled page must carry the one duration `USER_INPUTS.md`
     authorises. If this goes red the finding is real and it is not mine. */
  expect(settledMiss, `${ROUTE} settled without the authorised SLA on some attempts`).toBe(0);
});

test("sealed: the round-2 harness's own interception is what moves the 350 ms read", async ({ page }) => {
  test.setTimeout(5 * 60 * 1000);
  const samples = await measure(page, true);
  const { settledMiss } = report("sealed", samples);
  // Same production assertion. The EARLY count is diagnostic, not a contract:
  // a race that reproduces one run in three cannot be asserted on.
  expect(settledMiss, `${ROUTE} settled without the authorised SLA on some attempts`).toBe(0);
});

/* ── THE FAITHFUL REPLICA ────────────────────────────────────────────────
   Twelve isolated cold loads of `/teklif-al` produced no miss at all, sealed or
   unsealed, with `document.body.innerText` byte-length IDENTICAL at 350 ms and
   at 3 s on every attempt. So the isolated route is not marginal, and the
   wobble is a property of the SWEEP'S SEQUENCE, not of the route.

   This walks all 63 routes in the sweep's order with the sweep's waits, twice,
   and — the part the sweep cannot do, because it records a boolean and moves
   on — RE-READS any route that misses, so a miss is captured with the evidence
   that decides it:

     textContent present + innerText absent  → laid out late or not laid out
     both absent at 350 ms, both present on re-read → the route had not rendered
     both absent on RE-READ                  → a real intermittency

   A pass that observes no miss is not a proof of stability and is not reported
   as one; it is reported as what it is. */
test("sweep replica: which of the 63 routes moves, and what it looks like when it does", async ({ page }) => {
  test.setTimeout(20 * 60 * 1000);
  const routes: string[] = JSON.parse(
    readFileSync(path.join(process.cwd(), "reports", "qa", "phase-09a-r2", "routes.json"), "utf8"),
  );

  const seal = await sealNetwork(page);
  await page.goto(routes[0], { waitUntil: "domcontentloaded" });
  await assertSealed(page, seal);

  const passes: { pass: number; slaCount: number; slaRoutes: string[] }[] = [];
  const misses: Record<string, unknown>[] = [];

  for (let pass = 1; pass <= 2; pass += 1) {
    const slaRoutes: string[] = [];
    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const ok = await page
        .locator("main, .shell-root, #root > *")
        .first()
        .waitFor({ state: "attached", timeout: 15000 })
        .then(() => true)
        .catch(() => false);
      if (!ok) continue;
      await page.waitForTimeout(SWEEP_WAIT_MS);
      const early = await page.evaluate(() => ({
        innerText: document.body.innerText || "",
        textContent: document.body.textContent || "",
      }));
      if (rendersSla(early.innerText)) {
        slaRoutes.push(route);
        continue;
      }
      // Not in the 350 ms read. Was it in the DOM, and is it there when the
      // page settles? THIS is the observation the sweep never makes.
      await page.waitForTimeout(SETTLED_WAIT_MS);
      const late = await page.evaluate(() => ({
        innerText: document.body.innerText || "",
        textContent: document.body.textContent || "",
      }));
      misses.push({
        pass,
        route,
        innerTextAt350: false,
        textContentAt350: rendersSla(early.textContent),
        innerTextLenAt350: early.innerText.length,
        innerTextAtSettled: rendersSla(late.innerText),
        textContentAtSettled: rendersSla(late.textContent),
        innerTextLenAtSettled: late.innerText.length,
        grewBy: late.innerText.length - early.innerText.length,
      });
    }
    passes.push({ pass, slaCount: slaRoutes.length, slaRoutes });
  }

  assertNoSupabaseContact(seal);

  const a = new Set(passes[0].slaRoutes);
  const b = new Set(passes[1].slaRoutes);
  const disagreed = [...new Set([...a, ...b])].filter((r) => !(a.has(r) && b.has(r)));
  // A route that misses the 350 ms read but carries the copy once settled is a
  // race in the instrument; one that is still missing on re-read is not.
  const racedNotAbsent = misses.filter((m) => m.innerTextAtSettled === true);
  const genuinelyAbsent = misses.filter(
    (m) => m.innerTextAtSettled === false && m.textContentAtSettled === false,
  );

  writeArtefact(`sla-sweep-replica-${test.info().project.name}.json`, {
    routes: routes.length,
    passes: passes.map((p) => ({ pass: p.pass, slaCount: p.slaCount })),
    disagreedBetweenPasses: disagreed,
    misses,
    racedNotAbsentCount: racedNotAbsent.length,
    genuinelyAbsentCount: genuinelyAbsent.length,
  });

  console.log(
    `SLA_REPLICA passes=${passes.map((p) => p.slaCount).join(",")} ` +
      `disagreed=${JSON.stringify(disagreed)} misses=${misses.length} ` +
      `racedNotAbsent=${racedNotAbsent.length} genuinelyAbsent=${genuinelyAbsent.length}`,
  );

  /* The production contract. Routes that never carry the SLA at all are the six
     legal/index routes round 3 already accounted for; what must not happen is a
     route whose settled DOM lacks copy it is supposed to render. */
  expect(
    genuinelyAbsent.filter((m) => a.has(m.route as string) || b.has(m.route as string)),
    "a route rendered the authorised SLA on one pass and lacked it entirely on another",
  ).toEqual([]);
});
