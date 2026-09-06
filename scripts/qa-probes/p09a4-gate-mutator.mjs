/**
 * QA 09a-R4 — a LOADER that mutates `scripts/claims-gate.mjs` IN MEMORY.
 *
 * The packet says production code is read-only to QA and `scripts/claims-gate.mjs`
 * is named in DO_NOT_TOUCH, but item 2 asks me to verify a claim that can only be
 * verified by deleting parts of that file. So nothing is written: an ESM `load`
 * hook rewrites the module source on the way into the VM. The file on disk is
 * never opened for writing, and `import.meta.url` inside the gate is unchanged, so
 * `REPO_ROOT` still resolves to the real repository and every rule, root and
 * control behaves exactly as it does in a normal run.
 *
 * A mutation that silently fails to apply would produce a vacuous result — the
 * same shape of defect this probe is auditing — so every mutation asserts that its
 * search text was present and that the source actually changed.
 *
 * Usage:  node --import=./scripts/qa-probes/p09a4-gate-mutator.mjs scripts/claims-gate.mjs
 *         with P09A4_MUTATION=<key> in the environment.
 */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register(new URL("./p09a4-gate-mutator-hooks.mjs", import.meta.url), pathToFileURL("./"), {
  data: { mutation: process.env.P09A4_MUTATION ?? "none" },
});
