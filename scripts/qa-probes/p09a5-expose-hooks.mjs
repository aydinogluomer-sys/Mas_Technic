/**
 * QA 09a-R5 — expose the gate's internals WITHOUT changing them.
 *
 * `scripts/claims-gate.mjs` is a script: it runs on import and exports nothing.
 * Round 5 has to call `checkDerivedCadCopy`, `importTypeScriptModule`,
 * `checkDeferredClassRegister`, `verdict` and friends DIRECTLY, with fixtures the
 * gate's own controls do not use, in order to attack the new loader.
 *
 * `scripts/claims-gate.mjs` is DO_NOT_TOUCH, so nothing is written to it. An ESM
 * `load` hook APPENDS one `export {...}` statement to the source on the way into
 * the VM. Every byte above that line is the file as committed; the appended line
 * adds no behaviour, only visibility.
 *
 * The hook asserts each exported name is actually declared in the source, so a
 * rename cannot make this probe silently test nothing.
 */
const EXPOSED = [
  "importTypeScriptModule",
  "compareDerivedCopy",
  "checkDerivedCadCopy",
  "checkQualityResources",
  "checkDeferredClassRegister",
  "resolutionShadowsOf",
  "verdict",
  "makeTempDir",
  "cleanUpTempDirs",
  "writeFixtureLedger",
  "NON_RULE_CHECKS",
  "CHECK_CONTROLS",
  "EXPECTED_CAD_COPY",
  "CAD_LEDGER_FILE",
  "DEFERRED_09B_SOFTWARE_INVENTORY",
  "TEMP_DIRS",
  "RULES",
];

export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (!url.replace(/\\/g, "/").endsWith("/scripts/claims-gate.mjs")) return result;
  const source = result.source.toString();
  for (const name of EXPOSED) {
    const declared = new RegExp(`(?:^|\\n)\\s*(?:async\\s+)?(?:function|const|let)\\s+${name}\\b`).test(source);
    if (!declared) throw new Error(`p09a5: "${name}" is not declared in claims-gate.mjs — the probe would test nothing`);
  }
  return { ...result, source: `${source}\nexport { ${EXPOSED.join(", ")} };\n` };
}
