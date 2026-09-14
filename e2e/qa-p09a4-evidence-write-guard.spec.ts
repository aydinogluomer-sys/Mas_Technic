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
 *
 * ── 09b-1 R2: THE WALK WAS COMPLETE AND THE CLASSIFIER WAS NOT ─────────────
 * This guard passed, 2/2, on a tree where `qa-09b1-golden-drift.spec.ts` and
 * `qa-09b1-type-slot-census.spec.ts` wrote into `reports/qa/phase-09b1/` on
 * every ordinary run. It walked both files. It saw the `writeFileSync`. It
 * then recognised a destination ONLY as `path.join(process.cwd(), "…")`, and
 * those two specs spell theirs `const OUT = "reports/qa/phase-09b1"` with a
 * template literal — so each contributed ZERO sites, and both assertions
 * passed on the empty set. The comment above promised to fail loud on any new
 * site; it went silent on two. Fourth instance of the class in this phase.
 *
 * The classifier now starts from the WRITE CALL and resolves its destination
 * argument, rather than starting from one spelling of a path and hoping the
 * write uses it:
 *
 *   1. the first argument of every write call is read;
 *   2. a literal or template head rooted in the repository classifies it;
 *      `path.join(process.cwd(), "root", …)` classifies it;
 *   3. otherwise every identifier in the argument is resolved through its
 *      `const` declaration, transitively, to a depth of three — which is the
 *      `outFile → outDir → path.join(…)` shape the 09a-R4 specs use;
 *   4. a write call whose destination cannot be classified by 1–3 is recorded
 *      as `<unclassified write>`, UNGUARDED, and fails the first assertion.
 *
 * (4) is the half that was missing: an instrument that can return an empty
 * result must be able to return a non-empty one, and a write it does not
 * understand is not "no site" — it is the site nobody has looked at, which is
 * the one this control exists to refuse. The third test below proves each
 * branch on a fixture string, so the classifier cannot quietly lose a shape
 * again.
 */
const ROOT_LITERAL = /["'`]((?:reports|src|public|e2e|docs|scripts|supabase|test-results))\//g;
const CWD_JOIN = /path\.join\(\s*process\.cwd\(\)\s*,\s*"([^"]+)"/g;
const WRITE_HEAD = /\b(?:writeFileSync|appendFileSync|createWriteStream|renameSync|cpSync|copyFileSync|mkdtempSync|writeFile)\s*\(/g;

/** The FIRST argument of a call whose "(" is at `open`, read with balanced
 *  brackets and quotes so `path.join(process.cwd(), "reports", …)` comes back whole
 *  instead of being cut at its first comma. Returns the text and its index. */
function firstArg(src: string, open: number): { text: string; at: number } {
  let depth = 0;
  let quote: string | null = null;
  for (let i = open + 1; i < src.length; i++) {
    const c = src[i];
    if (quote) { if (c === "\\") i++; else if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'" || c === "`") { quote = c; continue; }
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") { if (depth === 0) return { text: src.slice(open + 1, i), at: open + 1 }; depth--; }
    else if (c === "," && depth === 0) return { text: src.slice(open + 1, i), at: open + 1 };
  }
  return { text: src.slice(open + 1), at: open + 1 };
}

function censusOf(source: string, rel: string): Site[] {
  const sites: Site[] = [];
  if (!WRITE_CALL.test(source)) return sites;
  const seen = new Set<string>();
  const push = (destination: string, guarded: boolean) => {
    const key = `${destination}|${guarded}`;
    if (seen.has(key)) return;
    seen.add(key);
    sites.push({ file: rel, destination, guarded });
  };
  const guardedAt = (index: number) =>
    /process\.env\.[A-Z0-9_]+/.test(source.slice(Math.max(0, index - 400), index));

  /* Roots named by an expression TEXT, with the source index the expression
     was found at (for the environment-gate lookback). */
  const rootsIn = (expr: string, at: number): { root: string; at: number }[] => {
    const out: { root: string; at: number }[] = [];
    for (const m of expr.matchAll(ROOT_LITERAL)) out.push({ root: m[1], at: at + (m.index ?? 0) });
    for (const m of expr.matchAll(CWD_JOIN)) out.push({ root: m[1], at: at + (m.index ?? 0) });
    if (/\btmpdir\s*\(/.test(expr)) out.push({ root: "<os-tmpdir>", at });
    return out;
  };

  /* `const NAME = <expr>;` — the declaration text and where it sits. */
  const declOf = (name: string): { expr: string; at: number } | null => {
    const m = new RegExp(String.raw`\bconst\s+${name}\s*=\s*([\s\S]*?);\s*\n`).exec(source);
    return m ? { expr: m[1], at: m.index } : null;
  };

  const resolve = (expr: string, at: number, depth: number): { root: string; at: number }[] => {
    const direct = rootsIn(expr, at);
    if (direct.length || depth === 0) return direct;
    const out: { root: string; at: number }[] = [];
    for (const id of new Set(expr.match(/[A-Za-z_$][\w$]*/g) ?? [])) {
      const d = declOf(id);
      if (d) out.push(...resolve(d.expr, d.at, depth - 1));
    }
    return out;
  };

  for (const call of source.matchAll(WRITE_HEAD)) {
    const { text, at } = firstArg(source, (call.index ?? 0) + call[0].length - 1);
    const found = resolve(text, at, 3);
    if (found.length === 0) { push("<unclassified write>", false); continue; }
    for (const { root, at: where } of found) {
      if (root === "<os-tmpdir>") { push(root, true); continue; }
      if (!REPO_ROOTS.includes(root)) {
        // `test-results` and anything else outside the repo-tracked roots is
        // scratch; gitignored, and destroying it destroys nothing.
        push(root, true);
        continue;
      }
      push(root, guardedAt(where));
    }
  }
  return sites;
}

/** This file. It reads and writes nothing, and its third test carries write
 *  calls as FIXTURE STRINGS — which the classifier, correctly, would census as
 *  writes. That it does so is the proof the third test exists to give; it is
 *  not a site, and so this one file is excluded from the walk by name. */
const SELF = "e2e/qa-p09a4-evidence-write-guard.spec.ts";

function census(): Site[] {
  const sites: Site[] = [];
  for (const abs of walk(E2E_DIR)) {
    const rel = path.relative(process.cwd(), abs).replace(/\\/g, "/");
    if (rel === SELF) continue;
    const source = readFileSync(abs, "utf8");
    sites.push(...censusOf(source, rel));
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
  // 09b-1's two measurement specs, gated in 09b-1 R2 behind
  // QA_09B1_WRITE_EVIDENCE after this guard was found to be scoring them zero.
  { file: "e2e/qa-09b1-golden-drift.spec.ts", destination: "reports", guarded: true },
  { file: "e2e/qa-09b1-golden-drift.spec.ts", destination: "test-results", guarded: true },
  { file: "e2e/qa-09b1-type-slot-census.spec.ts", destination: "reports", guarded: true },
  { file: "e2e/qa-09b1-type-slot-census.spec.ts", destination: "test-results", guarded: true },
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
  /* ────────────────────────────────────────────────────────────────────────
     THE CLASSIFIER PROVES IT CAN RETURN A NON-EMPTY RESULT. Both assertions
     above pass on an empty census, and an empty census is exactly what this
     guard produced for two files it had walked. So each shape the classifier
     claims to see is fed to it as a fixture string and must come back as a
     site — and a write it cannot place must come back as an UNGUARDED site,
     not as nothing. A guard that has never been seen to fire is a comment.
     ──────────────────────────────────────────────────────────────────────── */
  test("the classifier returns a site for every shape it claims to see, and an unguarded one for a shape it does not", () => {
    const T = "`";
    const cases: { name: string; src: string; want: Site[] }[] = [
      {
        name: "path.join(process.cwd(), …) direct, unguarded",
        src: 'writeFileSync(path.join(process.cwd(), "reports", "x.txt"), "");\n',
        want: [{ file: "fixture", destination: "reports", guarded: false }],
      },
      {
        name: "path.join(process.cwd(), …) via two consts, guarded by an env flag — the 09a-R4 shape",
        src: [
          'const committed = process.env.QA_X === "1";',
          'const outDir = committed ? path.join(process.cwd(), "reports", "a") : path.join(process.cwd(), "test-results", "a");',
          'const outFile = path.join(outDir, "b.json");',
          'writeFileSync(outFile, "");',
          "",
        ].join("\n"),
        want: [
          { file: "fixture", destination: "reports", guarded: true },
          { file: "fixture", destination: "test-results", guarded: true },
        ],
      },
      {
        name: "bare literal via a const and a template — the 09b-1 shape — UNGUARDED",
        src: `const OUT = "reports/qa/phase-x";\nwriteFileSync(${T}\${OUT}/a.txt${T}, "");\n`,
        want: [{ file: "fixture", destination: "reports", guarded: false }],
      },
      {
        name: "the same shape, gated",
        src: `const OUT = process.env.QA_X === "1" ? "reports/qa/phase-x" : "test-results/x";\nwriteFileSync(${T}\${OUT}/a.txt${T}, "");\n`,
        want: [
          { file: "fixture", destination: "reports", guarded: true },
          { file: "fixture", destination: "test-results", guarded: true },
        ],
      },
      {
        name: "os tmpdir through mkdtempSync — the claims-gate probe's shape",
        src: 'const dir = mkdtempSync(join(tmpdir(), "probe-"));\nwriteFileSync(join(dir, "p.ts"), "");\n',
        want: [{ file: "fixture", destination: "<os-tmpdir>", guarded: true }],
      },
      {
        name: "a write whose destination the classifier cannot place is NOT zero sites",
        src: 'writeFileSync(somethingComputedElsewhere(), "");\n',
        want: [{ file: "fixture", destination: "<unclassified write>", guarded: false }],
      },
      {
        name: "no write call at all is genuinely no site",
        src: 'const x = readFileSync("reports/qa/in.json", "utf8");\n',
        want: [],
      },
    ];
    for (const c of cases) {
      const got = censusOf(c.src, "fixture").sort((a, b) => a.destination.localeCompare(b.destination));
      const want = [...c.want].sort((a, b) => a.destination.localeCompare(b.destination));
      expect(got, c.name).toEqual(want);
    }
  });
});
