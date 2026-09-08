/* QA 09b-1 R2 — WHERE DOES `reducedMotion` ACTUALLY REACH THE BROWSER?
 *
 * A self-contained Playwright config that runs ONE probe spec against
 * `about:blank`. No web server, no repo fixtures, no dependence on the
 * project config. Four placements, four projects, one answer each:
 *
 *   A  project `use: { reducedMotion }`                  <- playwright.config.ts:203 does this
 *   B  project `use: { contextOptions: { reducedMotion } }`
 *   C  neither  (control — must be false)
 *   D  neither, but the spec calls page.emulateMedia()   (control — must be true)
 *
 * Placement via `test.use()` at file level is measured inside the spec by a
 * separate file, because `test.use({ reducedMotion })` does not COMPILE — that
 * is itself the finding, and it is proved by `npx tsc -b` rather than at
 * runtime.
 *
 * Run:
 *   npx playwright test -c scripts/qa-probes/09b1r2-reducedmotion.config.mjs
 */
import { defineConfig } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/* Same local-Chromium fallback the repo config uses (B08); without it no
   Chromium project can launch on this machine. Copied, not imported, so this
   probe does not depend on the config it is auditing. */
const candidates = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  "/bin/chromium",
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
];
const exe = candidates.find((c) => !!c && existsSync(c));
const launch = exe ? { launchOptions: { executablePath: exe } } : {};

export default defineConfig({
  testDir: ".",
  testMatch: ["09b1r2-reducedmotion.probe.mjs"],
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR ?? "../../test-results",
  timeout: 30_000,
  workers: 1,
  reporter: [["list"]],
  projects: [
    /* A — EXACTLY what playwright.config.ts:203 writes. */
    { name: "A-project-use-reducedMotion", use: { ...launch, reducedMotion: "reduce" } },
    /* B — the form the 1.59.1 types document (types/test.d.ts:7465-7477). */
    { name: "B-project-use-contextOptions", use: { ...launch, contextOptions: { reducedMotion: "reduce" } } },
    /* C — nothing at all. Must be false, or the whole probe is measuring the
       machine's own OS setting rather than Playwright. */
    { name: "C-control-nothing", use: { ...launch } },
    /* D — nothing at project level; the spec calls emulateMedia itself. */
    { name: "D-control-emulateMedia", use: { ...launch } },
  ],
});
