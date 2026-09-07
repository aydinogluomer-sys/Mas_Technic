/**
 * QA 09a-R5 item 2 — THE SABOTAGE SUITE, AGAINST THE NEW SHAPES.
 *
 * Same technique and same discipline as `p09a4-gate-mutator-hooks.mjs`: an ESM
 * `load` hook rewrites `scripts/claims-gate.mjs` on the way into the VM, the file
 * on disk is never opened for writing, and a mutation whose search text is absent
 * THROWS rather than producing a vacuous "still passes".
 *
 * The p09a4 mutations no longer apply — C5 changed every one of their anchors,
 * which the verbatim re-run in `evidence/03-` records. These are the same four
 * sabotage IDEAS re-aimed at the new code, plus the ones C5 did not try:
 *
 *   NEUTER      the whole function returns [] — round 4's original sabotage
 *   DROP        the check is removed from NON_RULE_CHECKS while its function
 *               survives intact  (the packet's "silently dropped from the
 *               registry while its function still exists")
 *   VERDICT     verdict() ignores one specific check
 *   PRODUCTION  <-- THE ONE NEITHER ROUND TRIED. C5's answer to R4-5 was to
 *               PARAMETERISE the path each check reads so a control can hand it
 *               a fixture. That makes the production call distinguishable from
 *               the control call by its arguments, so a one-line guard can go
 *               silent on the REAL ledger while every fixture control still
 *               passes. This is the "silently pass" the packet asks for, in its
 *               sharpest form: one line, no deletion, all 280 controls green.
 *   CONTROLS    runCheckControls() returns [] — the controls layer itself has
 *               no control on it.
 *   DIAGNOSTIC  the reportDiagnostics branch is deleted, which C5 claims the
 *               unparseable-ledger control catches by asserting the MESSAGE.
 */

/** @type {Record<string, [string, string][]>} */
const MUTATIONS = {
  /* ── NEUTER: round 4's sabotage, re-aimed ─────────────────────────────── */
  "neuter-derived": [
    [
      "async function checkDerivedCadCopy(ledgerFile = CAD_LEDGER_FILE, expected = EXPECTED_CAD_COPY) {",
      "async function checkDerivedCadCopy(ledgerFile = CAD_LEDGER_FILE, expected = EXPECTED_CAD_COPY) { return [];",
    ],
  ],
  "neuter-resources": [
    [
      'function checkQualityResources(ledgerFile = CAD_LEDGER_FILE, publicDir = "public") {',
      'function checkQualityResources(ledgerFile = CAD_LEDGER_FILE, publicDir = "public") { return [];',
    ],
  ],
  "neuter-register": [
    [
      "function checkDeferredClassRegister(register = DEFERRED_09B_SOFTWARE_INVENTORY) {",
      "function checkDeferredClassRegister(register = DEFERRED_09B_SOFTWARE_INVENTORY) { return [];",
    ],
  ],

  /* ── DROP: out of the registry, function untouched ────────────────────── */
  "drop-derived-from-registry": [["  { id: \"derived-cad-copy\", run: () => checkDerivedCadCopy() },", ""]],
  "drop-resources-from-registry": [["  { id: \"quality-resources\", run: () => checkQualityResources() },", ""]],
  "drop-register-from-registry": [
    ['  { id: "deferred-class-register", run: () => checkDeferredClassRegister() },', ""],
  ],

  /* ── VERDICT: the conjunction ignores one check ───────────────────────── */
  "verdict-ignores-derived": [
    [
      "    if (problems.length > 0) failing.push(check.id);",
      '    if (problems.length > 0 && check.id !== "derived-cad-copy") failing.push(check.id);',
    ],
  ],
  "verdict-ignores-resources": [
    [
      "    if (problems.length > 0) failing.push(check.id);",
      '    if (problems.length > 0 && check.id !== "quality-resources") failing.push(check.id);',
    ],
  ],
  "verdict-ignores-register": [
    [
      "    if (problems.length > 0) failing.push(check.id);",
      '    if (problems.length > 0 && check.id !== "deferred-class-register") failing.push(check.id);',
    ],
  ],
  "verdict-ignores-everything": [
    ["  return { clean: failing.length === 0, failing };", "  return { clean: true, failing };"],
  ],

  /* ── PRODUCTION-PATH-ONLY: silent on the real thing, honest on fixtures ─
     ONE LINE EACH. The guard is on the argument, and the controls all pass
     arguments that are not the production ones. */
  "silent-on-production-derived": [
    [
      "async function checkDerivedCadCopy(ledgerFile = CAD_LEDGER_FILE, expected = EXPECTED_CAD_COPY) {",
      "async function checkDerivedCadCopy(ledgerFile = CAD_LEDGER_FILE, expected = EXPECTED_CAD_COPY) { if (ledgerFile === CAD_LEDGER_FILE) return [];",
    ],
  ],
  "silent-on-production-resources": [
    [
      'function checkQualityResources(ledgerFile = CAD_LEDGER_FILE, publicDir = "public") {',
      'function checkQualityResources(ledgerFile = CAD_LEDGER_FILE, publicDir = "public") { if (publicDir === "public") return [];',
    ],
  ],
  "silent-on-production-register": [
    [
      "function checkDeferredClassRegister(register = DEFERRED_09B_SOFTWARE_INVENTORY) {",
      "function checkDeferredClassRegister(register = DEFERRED_09B_SOFTWARE_INVENTORY) { if (register === DEFERRED_09B_SOFTWARE_INVENTORY) return [];",
    ],
  ],

  /* ── THE CONTROLS LAYER ITSELF ────────────────────────────────────────── */
  "neuter-check-controls": [["async function runCheckControls() {", "async function runCheckControls() { return [];"]],
  "neuter-check-controls-and-derived": [
    ["async function runCheckControls() {", "async function runCheckControls() { return [];"],
    [
      "async function checkDerivedCadCopy(ledgerFile = CAD_LEDGER_FILE, expected = EXPECTED_CAD_COPY) {",
      "async function checkDerivedCadCopy(ledgerFile = CAD_LEDGER_FILE, expected = EXPECTED_CAD_COPY) { return [];",
    ],
  ],

  /* ── THE TRANSPILE DIAGNOSTIC ─────────────────────────────────────────── */
  "drop-reportDiagnostics": [["  if (errors.length > 0) {", "  if (false) {"]],

  /* ── THE PROPOSED REMEDY, MEASURED ───────────────────────────────────────
     Three controls that exercise the PRODUCTION call — no arguments, real tree
     — asserting only things that are true of the repository as committed and
     that no legitimate edit can break without the maintainer knowing:

       the real ledger LOADS (kind "load" is a failure; drift is a different
       control's business, so this stays quiet on a copy change);
       the real public/ has at least one measured resource row;
       the real register resolves all six of its sites.

     `PRODUCTION_CONTROLS` is spliced into CHECK_CONTROLS. Combined below with
     each silent-on-production sabotage: if the gate goes red, the remedy works
     and the correction packet is one paragraph rather than a research task. */
  "add-production-controls": [["const CHECK_CONTROLS = [", "const CHECK_CONTROLS = [\r\n  ...PRODUCTION_CONTROLS,"]],

  /* ── PROBE POSITIVE CONTROL: this must go red, or nothing above means anything ─ */
  "neuter-a-covered-rule": [
    [
      String.raw`pattern: /SAP\s?(MES|ERP)|\bFastems\b|\bVericut\b|\b3DCS\b|\bMastercam\b/gi,`,
      "pattern: /\\u0000NEVER_MATCHES\\u0000/gi,",
    ],
  ],

  none: [],
};

/** The remedy's source, injected ahead of `CHECK_CONTROLS`. */
const PRODUCTION_CONTROLS_SRC = `
const PRODUCTION_CONTROLS = [
  {
    id: "derived-cad-copy: the REAL ledger loads (production path, no fixture)",
    async run() {
      const problems = await checkDerivedCadCopy();
      return problems.some((p) => p.kind === "load")
        ? \`the real ledger did not load: \${problems[0].message}\`
        : null;
    },
  },
  {
    id: "quality-resources: the REAL public/ is measured (production path, no fixture)",
    run() {
      const src = readFileSync(resolve(REPO_ROOT, CAD_LEDGER_FILE), "utf8");
      const rows = [...src.matchAll(/href:\\s*"(\\/belgeler\\/[^"]+)"\\s*,\\s*size:\\s*"PDF · (\\\\d+) KB"/g)];
      if (rows.length === 0) return null;
      const problems = checkQualityResources();
      return problems.length === 0 ? null : \`the real resource rows do not measure: \${problems[0].message}\`;
    },
  },
  {
    id: "deferred-class-register: the REAL register resolves (production path, no fixture)",
    run() {
      const problems = checkDeferredClassRegister();
      if (problems.length > 0) return \`the real register does not resolve: \${problems[0].message}\`;
      return DEFERRED_09B_SOFTWARE_INVENTORY.sites.length > 0 ? null : "the real register is empty";
    },
  },
];
`;

/* Compose each silent-on-production sabotage WITH the remedy. */
for (const id of ["derived", "resources", "register"]) {
  MUTATIONS[`remedy-vs-silent-on-production-${id}`] = [
    ["const CHECK_CONTROLS = [", `${PRODUCTION_CONTROLS_SRC}const CHECK_CONTROLS = [\r\n  ...PRODUCTION_CONTROLS,`],
    ...MUTATIONS[`silent-on-production-${id}`],
  ];
}
MUTATIONS["add-production-controls"] = [
  ["const CHECK_CONTROLS = [", `${PRODUCTION_CONTROLS_SRC}const CHECK_CONTROLS = [\r\n  ...PRODUCTION_CONTROLS,`],
];

/* REMEDY 2 — and this one works, for the reason remedy 1 does not.
   Remedy 1 asserts the ABSENCE of a problem on the production path, which is
   exactly what `return []` provides. A control over a check that is silent when
   the tree is healthy has to demand a POSITIVE result, and the only way to get
   one on the production path is to make the production path disagree: call it
   with the real ledger file and a deliberately impossible expectation. A guard
   keyed on `ledgerFile === CAD_LEDGER_FILE` cannot tell this call from the real
   one, so it has to answer honestly or fail. */
const REMEDY2_SRC = `
const PRODUCTION_CONTROLS_2 = [
  {
    id: "derived-cad-copy: the PRODUCTION path still compares (impossible expectation)",
    async run() {
      const problems = await checkDerivedCadCopy(CAD_LEDGER_FILE, { CAD_UPLOAD_FORMATS: "\\u0000 no ledger publishes this" });
      return problems.some((p) => p.kind === "drift")
        ? null
        : "checkDerivedCadCopy() read the REAL ledger and did not disagree with an impossible expectation, so it is not reading it at all";
    },
  },
];
`;
MUTATIONS["remedy2-vs-silent-on-production-derived"] = [
  ["const CHECK_CONTROLS = [", `${REMEDY2_SRC}const CHECK_CONTROLS = [\r\n  ...PRODUCTION_CONTROLS_2,`],
  ...MUTATIONS["silent-on-production-derived"],
];
MUTATIONS["remedy2-alone"] = [
  ["const CHECK_CONTROLS = [", `${REMEDY2_SRC}const CHECK_CONTROLS = [\r\n  ...PRODUCTION_CONTROLS_2,`],
];
MUTATIONS["remedy2-vs-neuter-derived"] = [
  ["const CHECK_CONTROLS = [", `${REMEDY2_SRC}const CHECK_CONTROLS = [\r\n  ...PRODUCTION_CONTROLS_2,`],
  ...MUTATIONS["neuter-derived"],
];

export const MUTATION_IDS = Object.keys(MUTATIONS).filter((k) => k !== "none");

export async function initialize(data) {
  process.env.P09A5_MUTATION = data?.mutation ?? process.env.P09A5_MUTATION ?? "none";
}

export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (!url.replace(/\\/g, "/").endsWith("/scripts/claims-gate.mjs")) return result;

  const key = process.env.P09A5_MUTATION ?? "none";
  const edits = MUTATIONS[key];
  if (edits === undefined) throw new Error(`p09a5: unknown mutation "${key}"`);
  if (edits.length === 0) return result;

  let source = result.source.toString();
  for (const [search, replace] of edits) {
    if (!source.includes(search)) {
      throw new Error(`p09a5: mutation "${key}" — search text NOT FOUND in claims-gate.mjs:\n${search}`);
    }
    const next = source.replace(search, replace);
    if (next === source) throw new Error(`p09a5: mutation "${key}" changed nothing`);
    source = next;
  }
  process.stderr.write(`p09a5: mutation "${key}" applied in memory (disk untouched)\n`);
  return { ...result, source };
}
