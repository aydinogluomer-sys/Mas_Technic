/* QA 09b-1 R2 — THE THREE "ZERO" CLAIMS IN STEP 2, RE-MADE WITH A POSITIVE CONTROL
   ==========================================================================
   Step 2 reported, in the typography gate's favour, that the shipped CSS has
   ZERO typography rules scoped to a ground, ZERO scoped to a state, and ONE
   font-size in `em`. Those numbers came from ad-hoc regexes run once in a
   shell, and an ad-hoc regex that returns zero has proved nothing until it is
   shown returning non-zero. The rule this run now carries applies to my own
   instruments first: AN INSTRUMENT THAT CAN RETURN AN EMPTY RESULT MUST PROVE
   IT CAN RETURN A NON-EMPTY ONE.

   So each scan is run twice: once over the shipped CSS, and once over the
   shipped CSS with ONE synthetic rule of the class appended. The second run
   must find exactly one more, or the first run's zero is not a finding.
   ========================================================================== */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";

const OUT = "reports/qa/phase-09b1r2";
mkdirSync(OUT, { recursive: true });
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };

const files = readdirSync("dist/assets").filter((f) => f.endsWith(".css"));
const shipped = files.map((f) => readFileSync(`dist/assets/${f}`, "utf8")).join("\n");
const TYPO = /font-size:|font-weight:|font-family:|letter-spacing:|text-transform:|font:/;
const DS = /(shell-|tl-)/;

const SCANS = [
  {
    name: "typography rules scoped to a GROUND",
    sel: /data-band-tone|data-shell-surface|\.paper\b|\.graphite\b/,
    control: `.tl-band[data-band-tone="paper"] .shell-qa-control{font-size:99px}`,
  },
  {
    name: "typography rules scoped to a STATE",
    sel: /:hover|:focus|:active|\[aria-expanded|\[data-state|\.is-|--open|\[data-open/,
    control: `.shell-qa-control:hover{font-weight:900}`,
  },
  {
    name: "typography rules scoped to a POSITION",
    sel: /:first-child|:last-child|:nth-child|:nth-of-type|:first-of-type|:last-of-type|:only-child/,
    control: `.shell-qa-control>p:first-child{letter-spacing:9px}`,
  },
];

function count(css, sel) {
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m, n = 0;
  const hits = [];
  while ((m = re.exec(css))) {
    const s = m[1].trim(), b = m[2];
    if (TYPO.test(b) && DS.test(s) && sel.test(s)) { n++; hits.push(s); }
  }
  return { n, hits };
}

log(`shipped css: ${files.join(", ")}  (${shipped.length} bytes)`);
log("");
let allProved = true;
for (const sc of SCANS) {
  const real = count(shipped, sc.sel);
  const withControl = count(shipped + "\n" + sc.control, sc.sel);
  const proved = withControl.n === real.n + 1;
  allProved &&= proved;
  log(`── ${sc.name}`);
  log(`   shipped: ${real.n}`);
  for (const h of real.hits.slice(0, 6)) log(`     ${h}`);
  log(`   shipped + one synthetic rule: ${withControl.n}   → scan ${proved ? "PROVED able to find one" : "*** DID NOT FIND THE CONTROL — its zero means nothing ***"}`);
  log("");
}

/* the `em` count, same treatment */
const emRe = /font-size:\s*[0-9.]+em\b/g;
const emReal = (shipped.match(emRe) ?? []).length;
const emCtl = ((shipped + "\n.shell-qa-control{font-size:1.5em}").match(emRe) ?? []).length;
log(`── font-size declarations in em`);
log(`   shipped: ${emReal}   shipped + one synthetic: ${emCtl}   → ${emCtl === emReal + 1 ? "PROVED" : "*** NOT PROVED ***"}`);
allProved &&= emCtl === emReal + 1;
log("");
log(`RESULT: ${allProved ? "every zero in step 2 is a zero from a scan that can return non-zero" : "at least one step-2 zero is unproved"}`);
writeFileSync(`${OUT}/css-scope-controls.txt`, lines.join("\n") + "\n");
process.exit(allProved ? 0 : 1);
