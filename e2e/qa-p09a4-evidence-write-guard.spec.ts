import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

/* ═══════════════════════════════════════════════════════════════════════════
   QA 09a-R4 ITEM 3 — the evidence-overwrite class, closed by a control rather
   than by a promise.

   Three specs in this phase wrote outside `test-results/` on an ordinary run:

     e2e/landing/claims-gate.spec.ts   wrote a fabricated AS9100D claim into
                                       `src/content/` and removed it in
                                       `finally`, which does not survive a kill
     e2e/qa-p09a2-claims-sweep.spec.ts rewrote round 2's committed evidence
     e2e/qa-p09a3-cad-dom.spec.ts      rewrote round 3's committed evidence

   Each was found separately, and each time it was "the last one". 09a-C4 fixed
   all three; a grep of `e2e/**` in round 4 found no fourth. But a grep is a
   fact about one afternoon, and the reason this defect recurred is that
   nothing stopped it recurring.

   THIS IS A CENSUS CONTROL, not a pattern matcher. It records every write
   destination that exists in `e2e/**` today, together with whether that
   destination is reached only behind an environment flag. A NEW destination,
   or an existing one losing its flag, fails this test and forces the decision
   to be made deliberately instead of noticed three rounds later.

   It reads files. It starts no browser, visits no route and writes nothing.
   ══════════════════════════════════════════════════════════════════════════ */

const E2E_DIR = path.join(process.cwd(), "e2e");

/** Anything that can put bytes on disk. `attach` is excluded on purpose: it is
 *  Playwright's own API and always lands under `outputDir`, which is
 *  `test-results/` and is gitignored. */
const WRITE_CALL = /\b(writeFileSync|appendFileSync|createWriteStream|renameSync|cpSync|copyFileSync|mkdtempSync|writeFile)\s*\(/;

/** A first path segment that is inside the repository and NOT scratch. */
const REPO_ROOTS = ["reports", "src", "public", "e2e", "docs", "scripts", "supabase"];

type Site = { file: string; destination: string; guarded: boolean };

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) {
      if (entry === "__golden__") continue; // binary baselines, no code
      walk(abs, out);
      continue;
    }
    if (abs.endsWith(".ts")) out.push(abs);
  }
  return out;
}

/**
 * Every destination root a file names, and whether the file gates its writes.
 *
 * "Guarded" is deliberately coarse — the file mentions `process.env.<X>` in the
 * same statement region as the repo-rooted destination. A coarse check that
 * FAILS LOUD on any new site is worth more here than a precise one that has to
 * be argued about, because the failure mode being prevented is a site nobody
 * looked at.
 */
function census(): Site[] {
  const sites: Site[] = [];
  for (const abs of walk(E2E_DIR)) {
    const source = readFileSync(abs, "utf8");
    if (!WRITE_CALL.test(source)) continue;
    const rel = path.relative(process.cwd(), abs).replace(/\\/g, "/");

    // `tmpdir()` is outside the repository entirely — the shape 09a-C4 moved
    // the claims-gate probe to. Recorded as its own destination.
    if (/\btmpdir\s*\(\s*\)/.test(source)) {
      sites.push({ file: rel, destination: "<os-tmpdir>", guarded: true });
    }

    for (const m of source.matchAll(/path\.join\(\s*process\.cwd\(\)\s*,\s*"([^"]+)"/g)) {
      const root = m[1];
      /* A READ of a path is not a write of it. Three specs load
         `reports/qa/phase-09a-r2/routes.json` as INPUT, and counting those as
         write sites made this control fire on files that write nothing there —
         a guard whose first act is a false positive is a guard people switch
         off. Only `path.join` calls that are not the argument of a read are
         censused. */
      if (/read(?:File|dir)Sync\s*\(\s*$/.test(source.slice(0, m.index))) continue;
      if (!REPO_ROOTS.includes(root)) {
        // `test-results` and anything else outside the repo-tracked roots is
        // scratch; gitignored, and destroying it destroys nothing.
        sites.push({ file: rel, destination: root, guarded: true });
        continue;
      }
      // Look back over the enclosing expression for an environment gate.
      const region = source.slice(Math.max(0, m.index - 400), m.index);
      sites.push({ file: rel, destination: root, guarded: /process\.env\.[A-Z0-9_]+/.test(region) });
    }
  }
  return sites.sort((a, b) => `${a.file}${a.destination}`.localeCompare(`${b.file}${b.destination}`));
}

/**
 * THE RECORD. Every write site in `e2e/**` as of 09a-C4 (`184abf2`), each with
 * the reason it is allowed to exist. Adding a spec that writes anywhere else,
 * or removing a flag from one of these, fails the test below.
 */
const EXPECTED: Site[] = [
  // The gate's own failure probe. Outside the repository since 09a-C4 / R3-5.1,
  // because `finally` did not survive the two process kills this phase had.
  { file: "e2e/landing/claims-gate.spec.ts", destination: "<os-tmpdir>", guarded: true },
  // Round 2's sweep: scratch by default, committed evidence behind
  // QA_SWEEP_WRITE_EVIDENCE.
  { file: "e2e/qa-p09a2-claims-sweep.spec.ts", destination: "reports", guarded: true },
  { file: "e2e/qa-p09a2-claims-sweep.spec.ts", destination: "test-results", guarded: true },
  // Round 3's DOM spec: same shape, QA_P09A3_WRITE_EVIDENCE.
  { file: "e2e/qa-p09a3-cad-dom.spec.ts", destination: "reports", guarded: true },
  { file: "e2e/qa-p09a3-cad-dom.spec.ts", destination: "test-results", guarded: true },
  // Round 4's two specs, written to the same rule they are checking.
  { file: "e2e/qa-p09a4-sla-wobble.spec.ts", destination: "reports", guarded: true },
  { file: "e2e/qa-p09a4-sla-wobble.spec.ts", destination: "test-results", guarded: true },
  { file: "e2e/qa-p09a4-stabilised-sweep.spec.ts", destination: "reports", guarded: true },
  { file: "e2e/qa-p09a4-stabilised-sweep.spec.ts", destination: "test-results", guarded: true },
].sort((a, b) => `${a.file}${a.destination}`.localeCompare(`${b.file}${b.destination}`));

test.describe("09a-R4 — evidence writes", () => {
  test("no spec in e2e/** writes into the repository without an explicit flag", () => {
    const actual = census();
    const unguarded = actual.filter((s) => !s.guarded);
    expect(
      unguarded,
      "a spec writes into a tracked directory on every ordinary run; committed evidence " +
        "is a record of what was true on a date and must not be overwritten by a regression run",
    ).toEqual([]);
  });

  test("the set of write destinations is exactly the one that was reviewed", () => {
    // A new destination is not necessarily wrong — it is un-reviewed, and this
    // defect was found three times precisely because nobody reviewed it.
    expect(census(), "a write site appeared or lost its flag; review it and update EXPECTED").toEqual(
      EXPECTED,
    );
  });
});
