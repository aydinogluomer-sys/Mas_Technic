import { execFileSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

/* ══════════════════════════════════════════════════════════════════════════
   THE CLAIMS GATE, WIRED INTO THE CRITICAL SUITE

   `reports/baseline/content-claims-inventory.md` catalogued 41
   `UNVERIFIED_MUST_REMOVE` rows and Phase 06 removed them. A document cannot
   stop the 42nd; a test can.

   This lives in `e2e/landing/` deliberately: that directory is
   `CRITICAL_MATCH` in `playwright.config.ts`, so `npm run test:e2e:critical`
   fails the moment a forbidden claim comes back — in a PR, in a later phase,
   or in a well-meaning copy edit. The gate itself is
   `scripts/claims-gate.mjs`; every rule there names the `USER_INPUTS.md` field
   that decides it.

   It needs no browser, so it does not call `page`.
   ══════════════════════════════════════════════════════════════════════════ */

test.describe("content truth", () => {
  test("no unverified claim exists anywhere in the public source", () => {
    let stdout = "";
    let failed = false;
    try {
      stdout = execFileSync("node", ["scripts/claims-gate.mjs"], {
        cwd: REPO_ROOT,
        encoding: "utf8",
      });
    } catch (error) {
      failed = true;
      const err = error as { stdout?: string; stderr?: string };
      stdout = `${err.stdout ?? ""}${err.stderr ?? ""}`;
    }

    // The full report is the failure message: it names the rule, the
    // USER_INPUTS.md field behind it, and every file:line that violates it.
    expect(failed ? stdout : "", stdout).toBe("");
    expect(stdout).toContain("PASS —");
  });

  test("the gate can still fail — it is not a rubber stamp", () => {
    // A gate nobody has seen fail is a gate nobody can trust. This feeds the
    // scanner a claim USER_INPUTS.md §C records as NONE and requires a
    // non-zero exit, so a future edit that neuters the rules is caught here
    // rather than in production copy.
    const probe = resolve(REPO_ROOT, "src/content/__claims-gate-probe__.ts");
    writeFileSync(probe, 'export const PROBE = "AS9100D sertifikalı üretim";\n', "utf8");
    try {
      let exitCode = 0;
      try {
        execFileSync("node", ["scripts/claims-gate.mjs"], { cwd: REPO_ROOT, encoding: "utf8" });
      } catch {
        exitCode = 1;
      }
      expect(exitCode, "the gate must reject a reintroduced AS9100D claim").toBe(1);
    } finally {
      rmSync(probe, { force: true });
    }
  });
});
