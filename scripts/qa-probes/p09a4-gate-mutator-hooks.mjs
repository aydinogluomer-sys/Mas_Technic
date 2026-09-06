/**
 * QA 09a-R4 — the `load` hook half of `p09a4-gate-mutator.mjs`.
 *
 * Each mutation is a [search, replace] pair applied to the gate's source text.
 * If the search text is absent, or the replacement leaves the source unchanged,
 * the hook THROWS. A probe that quietly failed to mutate would report "the gate
 * still passes" while having changed nothing at all — which is precisely the
 * vacuous-control failure mode being investigated.
 */

/** @type {Record<string, [string, string][]>} */
const MUTATIONS = {
  // 1 — drop the derived-copy result from the `clean` conjunction.
  //     (Written without the line ending: the file is CRLF on disk.)
  "drop-derived-from-clean": [["derivedProblems.length === 0 &&", "true &&"]],

  // 2 — neuter `checkDerivedCadCopy` itself: it now finds nothing, ever.
  "neuter-derived-check": [
    ["async function checkDerivedCadCopy() {", "async function checkDerivedCadCopy() {\n  return [];"],
  ],

  // 3 — drop the quality-resource result from the `clean` conjunction.
  "drop-resources-from-clean": [["resourceProblems.length === 0 &&", "true &&"]],

  // 4 — neuter `checkQualityResources` itself.
  "neuter-resources-check": [["function checkQualityResources() {", "function checkQualityResources() {\n  return [];"]],

  // 5 — CONTROL FOR THE PROBE. Neuter a check that IS covered by `runControls`
  //     so the probe is shown able to turn something red. `named-enterprise-system`
  //     has both a positive and a negative control since 09a-C4.
  "neuter-a-covered-rule": [
    [
      String.raw`pattern: /SAP\s?(MES|ERP)|\bFastems\b|\bVericut\b|\b3DCS\b|\bMastercam\b/gi,`,
      "pattern: /\\u0000NEVER_MATCHES\\u0000/gi,",
    ],
  ],

  /* 6 — ADVERSARIAL CONTROLS, injected from `P09A4_PROBES`.
     `--also-scan=` can only add a file whose repo-relative path is outside
     `src/`, so it cannot exercise the file-scoped halves of the CAD rule
     (detector (A) runs on `src/data/**` and on pinned files; the pins are keyed
     by exact path). The gate's own control harness CAN: a control carries a
     `file`, and `fires()` runs the real `rule.scan` against it.

     So each candidate string is appended to the target rule's `fires` list. A
     candidate that does NOT fire is reported by the gate itself as
     "POSITIVE CONTROL DID NOT FIRE", and one that fires is silent in the
     output. That gives a clean fire/silent classification per string, through
     the gate's real matching path, with nothing on disk changed and no
     assertion anywhere weakened. */
  "inject-probe-controls": [
    [
      "function runControls() {",
      `function runControls() {
  if (process.env.P09A4_PROBES) {
    for (const p of JSON.parse(process.env.P09A4_PROBES)) {
      const r = RULES.find((x) => x.id === p.rule);
      if (!r) throw new Error("p09a4: no such rule: " + p.rule);
      if (!r.controls) r.controls = {};
      const c = p.file ? { file: p.file, text: p.text } : p.text;
      const list = process.env.P09A4_PROBE_AS === "silent" ? "silent" : "fires";
      r.controls[list] = [...(r.controls[list] ?? []), c];
    }
  }`,
    ],
  ],

  none: [],
};

export async function initialize(data) {
  process.env.P09A4_MUTATION = data?.mutation ?? "none";
}

export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (!url.replace(/\\/g, "/").endsWith("/scripts/claims-gate.mjs")) return result;

  const key = process.env.P09A4_MUTATION ?? "none";
  const edits = MUTATIONS[key];
  if (edits === undefined) throw new Error(`p09a4: unknown mutation "${key}"`);
  if (edits.length === 0) return result;

  let source = result.source.toString();
  for (const [search, replace] of edits) {
    if (!source.includes(search)) {
      throw new Error(`p09a4: mutation "${key}" — search text NOT FOUND in claims-gate.mjs:\n${search}`);
    }
    const next = source.replace(search, replace);
    if (next === source) throw new Error(`p09a4: mutation "${key}" changed nothing`);
    source = next;
  }
  process.stderr.write(`p09a4: mutation "${key}" applied in memory (disk untouched)\n`);
  return { ...result, source };
}
