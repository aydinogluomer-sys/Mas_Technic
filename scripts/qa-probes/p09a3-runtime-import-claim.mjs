/* QA 09a-R3 — the load-bearing justification for the whole C3 design.
 *
 * C3 falsified the packet's central instruction with this claim: a RUNTIME
 * import from `servicePages.ts` to `@/utils/cadUpload` reaches
 * `integrations/supabase/env.ts`, which reads `import.meta.env` at module
 * scope, and two specs import `servicePages.ts` into the Playwright NODE
 * runtime — so the edge takes down spec COLLECTION for all of `critical-1280`.
 *
 * That is a testable claim, and if it is false the type pin is unnecessary
 * complexity. This restores exactly the runtime edge `8e5472b` had, runs
 * `playwright test --project=critical-1280 --list`, restores the file, and
 * asserts the tree is clean. `--list` collects; it starts no browser and no
 * server, so nothing is navigated and nothing is submitted.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = resolve(ROOT, "reports/qa/phase-09a-r3");
mkdirSync(OUT, { recursive: true });
const SP = resolve(ROOT, "src/data/servicePages.ts");

const sh = (cmd) => {
  try {
    return { code: 0, out: execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
};
const requireClean = (l) => {
  if (sh("git diff --quiet").code !== 0) throw new Error(`ABORT: dirty at ${l}`);
};

const NOW = 'import {\r\n  CAD_UPLOAD_EXTENSIONS,\r\n  CAD_UPLOAD_FORMATS,\r\n  LEAD_TIME_SHORT,\r\n  LEAD_TIME_STATEMENT,\r\n  QUOTE_RESPONSE_TIME,\r\n} from "@/content/claims";';
const NOW_LF = NOW.replace(/\r\n/g, "\n");

requireClean("start");
const original = readFileSync(SP, "utf8");
const anchor = original.includes(NOW) ? NOW : NOW_LF;
if (original.split(anchor).length - 1 !== 1) throw new Error("import anchor not found exactly once");

const results = {};

/* Baseline: collection at HEAD, with the type pin and no runtime edge. */
const before = sh("npx playwright test --project=critical-1280 --list");
results.headOfBranch = {
  exit: before.code,
  tests: (before.out.match(/Total: (\d+) tests?/) || [null, "?"])[1],
  firstError: (before.out.match(/^.*Error.*$/m) || ["(none)"])[0].trim(),
};

try {
  /* Exactly the edge 8e5472b had: a VALUE import of the validator constant. */
  writeFileSync(SP, original.replace(anchor, `${anchor}\nimport { CAD_ACCEPTED_EXTENSIONS } from "@/utils/cadUpload";\nvoid CAD_ACCEPTED_EXTENSIONS;`), "utf8");
  const after = sh("npx playwright test --project=critical-1280 --list");
  results.withRuntimeImport = {
    exit: after.code,
    tests: (after.out.match(/Total: (\d+) tests?/) || [null, "?"])[1],
    firstError: (after.out.match(/^.*(Error|error)[^\n]*$/m) || ["(none)"])[0].trim(),
    mentionsSupabaseEnv: /VITE_SUPABASE_URL|supabase[\\/]env/i.test(after.out),
    excerpt: after.out.split("\n").slice(0, 30).join("\n"),
  };
} finally {
  writeFileSync(SP, original, "utf8");
}
requireClean("end");

results.verdict =
  results.headOfBranch.exit === 0 && results.withRuntimeImport.exit !== 0
    ? "CLAIM HOLDS — the runtime edge breaks critical-1280 collection; the type pin is load-bearing"
    : results.headOfBranch.exit === 0 && results.withRuntimeImport.exit === 0
      ? "*** CLAIM FALSIFIED — collection survives the runtime edge ***"
      : "inconclusive: collection is already broken at HEAD";

writeFileSync(resolve(OUT, "runtime-import-claim.json"), `${JSON.stringify(results, null, 2)}\n`, "utf8");
console.log(JSON.stringify(results, null, 2));
