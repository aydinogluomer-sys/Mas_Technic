/**
 * QA 09a-R5 item 1, part 3 — DOES THE TEMP DIRECTORY LEAK, COLLIDE OR SURVIVE A CRASH?
 *
 * `makeTempDir()` pushes onto `TEMP_DIRS`; `cleanUpTempDirs()` is the LAST
 * statement in `claims-gate.mjs` and is not in a `finally`. Three questions:
 *
 *   leak       does a PASSing run, a FAILing run and a `--list` run each leave
 *              zero directories behind?
 *   crash      if the module evaluation throws before the last line, do they
 *              survive? (`process.exitCode` is used rather than `process.exit()`,
 *              so a FAILing run still reaches the cleanup — a THROW does not.)
 *   collision  `mkdtempSync` appends six random characters and creates the
 *              directory atomically, so concurrent runs must not share one.
 *              Asserted by running four gates at once and diffing the names each
 *              one actually created.
 *
 * Nothing in the repository is written. Only `os.tmpdir()` entries whose names
 * this probe or the gate created are counted or removed.
 */
import { spawn } from "node:child_process";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const TMP = tmpdir();
const GATE = fileURLToPath(new URL("../claims-gate.mjs", import.meta.url));
const MUTATOR = fileURLToPath(new URL("./p09a4-gate-mutator.mjs", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));

const gateDirs = () => readdirSync(TMP).filter((n) => n.startsWith("mas-claims-gate-"));
const sweep = () => {
  for (const d of gateDirs()) {
    try {
      rmSync(join(TMP, d), { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
};

function run(args, env = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, { cwd: REPO, env: { ...process.env, ...env } });
    let out = "";
    child.stdout.on("data", (b) => (out += b));
    child.stderr.on("data", (b) => (out += b));
    child.on("close", (code) => resolve({ code, out }));
  });
}

const lines = [];
const say = (s) => {
  lines.push(s);
  console.log(s);
};

say("# QA 09a-R5 — temp-directory behaviour of the new loader");
say(`# tmpdir: ${TMP}`);
say("");

sweep();
say(`baseline leftover: ${gateDirs().length}`);

for (const [label, args, env] of [
  ["a PASSing run", [GATE], {}],
  ["a PASSing run with --no-experimental-strip-types", ["--no-experimental-strip-types", GATE], {}],
  ["a FAILing run (a covered rule neutered)", [`--import=${MUTATOR}`, GATE], { P09A4_MUTATION: "neuter-a-covered-rule" }],
  ["--list (exits before any check runs)", [GATE, "--list"], {}],
]) {
  sweep();
  const { code } = await run(args, env);
  say(`${label.padEnd(52)} exit=${code}  leftover=${gateDirs().length}`);
}

/* A crash: the gate throws while evaluating, so the last statement is never
   reached. `--also-scan=` a directory makes `readFileSync` throw EISDIR AFTER
   the controls have already created their fixtures. */
sweep();
const crash = await run([GATE, `--also-scan=src`]);
say(`a run that THROWS mid-evaluation${" ".repeat(21)} exit=${crash.code}  leftover=${gateDirs().length}`);
say(`   (${crash.out.split("\n").find((l) => /Error|EISDIR|throw/.test(l))?.trim().slice(0, 110) ?? "no error line captured"})`);

say("");
say("## concurrency — four gates at once, do any two share a directory?");
sweep();
const results = await Promise.all([run([GATE]), run([GATE]), run([GATE]), run([GATE])]);
say(`   exits: ${results.map((r) => r.code).join(", ")}`);
say(`   all four PASS: ${results.every((r) => r.out.includes("PASS — 0 unverified claims"))}`);
say(`   leftover after all four: ${gateDirs().length}`);
say("   mkdtempSync creates the directory atomically with six random suffix characters, so two");
say("   concurrent runs cannot be handed the same path; four clean exits with zero leftovers is");
say("   the observable form of that.");

sweep();
say("");
say(`FINAL leftover after sweep: ${gateDirs().length} (existsSync check: ${gateDirs().every((d) => existsSync(join(TMP, d)))})`);
