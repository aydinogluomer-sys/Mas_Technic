/**
 * QA 09a-R5 item 1, part 4 — WHAT HAPPENS WHEN `typescript` IS ABSENT?
 *
 * `importTypeScriptModule` does `await import("typescript")`. The packet asks
 * what the gate does when that package is not there. Uninstalling it would be a
 * production write, so instead a `resolve` hook makes exactly that one specifier
 * throw the error Node throws when a package is missing. Nothing else changes,
 * and `node_modules` is not touched.
 *
 * Usage: P09A5_HIDE_TS=1 node --import=./scripts/qa-probes/p09a5-ts-dependency.mjs scripts/claims-gate.mjs
 */
export async function resolve(specifier, context, nextResolve) {
  if (process.env.P09A5_HIDE_TS === "1" && (specifier === "typescript" || specifier.startsWith("typescript/"))) {
    const err = new Error(`Cannot find package 'typescript' imported from ${context.parentURL}`);
    err.code = "ERR_MODULE_NOT_FOUND";
    throw err;
  }
  return nextResolve(specifier, context);
}
