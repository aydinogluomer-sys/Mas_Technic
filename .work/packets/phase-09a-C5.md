# CODER TASK PACKET — PHASE 09a, CORRECTION 5

PHASE_ID: 09a-C5
PHASE_TITLE: The gate this phase built cannot run where it blocks
BASE_COMMIT: `ffe3c0b`
WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\coder-p09a`, already on **`wt/coder-p09a5`** at `ffe3c0b`, clean,
`.env` present, `node_modules` junctioned. Nothing to provision.

## ⚠ THE PRODUCTION-WRITE PROHIBITION STILL APPLIES

**Nothing submitted, invoked, uploaded, inserted, or deployed.** The four `public.rfqs` rows and three
`cad-uploads` objects are untouched evidence of an unresolved user decision. Nothing here needs the network.

## R4-1 — BLOCKING. The check you built cannot run on CI.

`checkDerivedCadCopy` (`scripts/claims-gate.mjs:813`) `await import()`s a `.ts` file and its own message says
**"Node >= 22.18 is required"**. `.github/workflows/playwright.yml:29` pins **`NODE_VERSION: "20"`**, used by
all six jobs — and Node 20 has no type stripping at all; `--experimental-strip-types` first appears in 22.6.0.

The chain is entirely inside the repo: `e2e/landing/claims-gate.spec.ts` runs the gate, it is a
`CRITICAL_MATCH` (`playwright.config.ts:108`), and the blocking `e2e-critical` job runs
`npm run test:e2e:critical` on push and PR to `main`. **I verified it myself** —
`node --no-experimental-strip-types scripts/claims-gate.mjs` exits 1 with
`Unknown file extension ".ts"`, reported as a *derived-copy problem*. So the first PR to `main` gets a red
critical suite whose message is about CAD copy drift.

It fails **closed**, which is the right direction. But a gate that cannot run where it blocks is not a gate.

**Choose the fix and state your reasoning.** Two routes, and I am not picking for you — I have picked twice
this phase and been wrong both times:

- **Raise CI's Node** to a version with unflagged type stripping (≥ 22.18). Smallest diff, but it moves all
  six jobs to a new major, so the other five have to be reasoned about. If you take this, also consider
  whether `package.json` should declare an `engines.node` — it currently declares none, which is why nothing
  caught the mismatch locally.
- **Remove the type-stripping dependency** so the gate runs on any supported Node. Larger diff in the gate,
  no change to CI, and it keeps the check's own property — that the ledger stays loadable in a bare Node
  process is exactly what proves it free of runtime imports, so do not trade that away to get here.

Whichever you choose, **prove it against a Node that lacks type stripping**, the way I did.

## R4-5 — Your "a control would have to mutate source" premise is false, and QA showed the work.

You wrote — correctly and valuably — that `runControls` proves *rules* fire but knows nothing about
`checkDerivedCadCopy` or `checkQualityResources`, and that deleting either leaves all 262 controls green and
the gate reporting PASS. **QA confirmed that four ways** with an ESM load hook that rewrote the gate in
memory, and proved its probe could turn red so the four PASSes were not a broken harness.

But it also falsified the reason you gave for not closing it. Two designs a gate is allowed to use:

1. **Split the read from the judgement.** `compareDerivedCopy(namespace, expected)` is pure — feed it
   `{ CAD_UPLOAD_FORMATS: "… ve DWG" }` from a control and assert it complains. No file is touched.
2. **An optional fixture path** — which is exactly the `mkdtempSync(tmpdir())` pattern **you introduced in
   C4** for `--also-scan=`.

Close it. Both non-rule checks get controls that run on every invocation.

## R4-2 — Detector (D) over-catches, and one of the two falsifies the defence written beside it.

`scripts/claims-gate.mjs:882`. These two fire and should not:

```
"Tüm dosyalarınızı tek adımda yükleyebilirsiniz; hiçbiri üçüncü tarafla paylaşılmaz."
"Ölçüm raporunu çeşitli formatlarda gönderebilirsiniz."
```

The first matters most: the comment at `:882` defends the detector by arguing `yükleyebilirsiniz` is not an
offer predicate — **and it is in `CAD_OFFER_PREDICATE`**. The second cuts across the `"Rapor Formatı"`
distinction the same rule draws deliberately in detector (C): the report *we deliver* is not the file the
visitor sends. Neither string is in the tree today, so this is latent. Fix the detector, fix the comment that
defends it, and add both as `silent` controls.

## R4-3 — The deferral I accepted is not discoverable where it was put, and the control's list is short.

Putting the 09b deferral into the gate's re-aimed control was the right instinct. The execution has two
faults:

- **The citations are stale by construction.** `claims-gate.mjs:1487` cites `servicePages.ts :774 :779 :797
  :804`. At the integration head those lines are a comparison-table row, a closing bracket, a fixture name
  and a repeatability label. The real sites moved **+14** — to `:788 :793 :811 :818` — because a commit in
  the same C4 batch added a 14-line comment at `:132`. `PROGRESS.md` has the same fault for the
  `ozel-projeler` pair, off by 26. **I have corrected my side.**
- **The control's enumeration is short by one.** "Those two" plus the four resolve to **five** distinct
  sites, because `:793` is counted twice and **`:3318`** — `"… tasarım (SolidWorks, CATIA, NX), …"` — is
  named nowhere. The class is **six** live sites: `:788 :793 :811 :818 :3318 :3332`. I re-counted at the
  source; six is right.

**Fix it by not citing line numbers.** `claims-gate.mjs:2396` cross-references by **rule id** and is robust
under any edit — that is the pattern. A grep-able marker such as `09b-SOFTWARE-INVENTORY` at each of the six
sites plus the control would also work, and would make the class enumerable by `grep` rather than by a list
that rots. Your call which; the requirement is that a later agent can find all six without arithmetic.

## R4-6 — A `.js` shadow would be invisible to both instruments.

`claims-gate.mjs:101`'s `EXT` does not scan `.js`/`.mjs`, and Vite's default `resolve.extensions` puts `.mjs`
and `.js` **before** `.ts`. So a `src/content/claims.js` would be what the app bundles while the gate reads
`claims.ts` literally and never sees the shadow. There are **zero** such files today. Close it cheaply —
scanning the extensions, or asserting the resolution, or whatever you judge soundest.

## R4-7 — The unsupported-syntax path reports the wrong thing.

A future `enum` or `namespace` in `claims.ts` throws `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` and the gate reports
**CAD copy drift over a correct file**. Fails closed, wrong diagnosis. Distinguish "could not load" from
"loaded and disagrees".

## R4-4 — QA's own spec has been measuring unrendered routes, and this is the finding that reaches backwards.

`e2e/qa-p09a2-claims-sweep.spec.ts:139` waits for `#root > *` to be **attached** — which the shell satisfies
— then sleeps 350 ms. QA measured that **41 of 63 routes settle more than 350 ms after the fastest, the
slowest at 4018 ms**, and caught two routes mid-flight with `innerText` of **88 characters** against 5753 and
4891 once settled. So `FINDINGS=0 across 63 routes` has always meant *"across the routes that happened to
have rendered"* — in rounds 2 and 3 as well.

**The findings survive on a better instrument**, which QA built and ran: a stabilised sweep gives
`neverSettled=0`, `SLA_ROUTES=57`, `FINDINGS=0` at **both** desktop-1280 and mobile-375, the same six routes
without the SLA. 57 was right; 56 was the instrument.

**This packet authorises you to fix that one QA spec and only that one** — it is normally off-limits, and QA
could not fix it because my own packet put it on its do-not-touch list. Make it wait for the same settled
condition QA's `qa-p09a4-stabilised-sweep.spec.ts` uses; read that spec, do not edit it. A route that never
settles must fail loudly, not silently count as clean.

## WRITE_ALLOWLIST

```
scripts/claims-gate.mjs
.github/workflows/playwright.yml    (ONLY if you choose the CI-Node route)
package.json                        (ONLY an engines.node declaration, if you judge it right — nothing else)
e2e/qa-p09a2-claims-sweep.spec.ts   (R4-4 only)
src/data/servicePages.ts            (ONLY a grep-able 09b marker, if you choose that route for R4-3)
```

## DO_NOT_TOUCH

```
src/utils/cadUpload.ts               ← THE AUTHORITY
src/content/claims.ts                ← the pin is correct; do not "improve" it
src/data/technicalLandingData.ts     ← pinned deferral
the six software-inventory sites themselves  ← 09b decides the class; you may only MARK them
package-lock.json  tsconfig.json  .claude/**
every other e2e spec, e2e/__golden__/**, reports/qa/**, scripts/qa-probes/**
supabase/**  src/pages/Login.tsx  ForgotPassword.tsx  ResetPassword.tsx  ChatBot.tsx
KVKK.tsx  GizlilikPolitikasi.tsx  CerezPolitikasi.tsx  src/styles/technical-landing.css
PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md
```

## ACCEPTANCE_CRITERIA

1. The gate runs and PASSes on a Node without unflagged type stripping — **proved by running it that way**.
2. Deleting `checkDerivedCadCopy` or `checkQualityResources`, or dropping either from the `clean`
   conjunction, makes the gate report a control failure.
3. Detector (D) is silent on both over-caught strings; the comment defending it says something true.
4. All six software-inventory sites are findable from the gate without arithmetic; no line-number citation
   that rots.
5. A `src/content/claims.js` shadow is caught by at least one instrument.
6. An unsupported-TS-syntax failure is reported as a load failure, not as copy drift.
7. `qa-p09a2-claims-sweep` fails loudly on a route that never settles, and reports `SLA_ROUTES=57` stably
   across three consecutive runs.
8. Gate PASSes on the tree and FAILs with the removed strings restored. `npx tsc -b` and `npm run build`
   exit 0. Full regression green, **no golden moves**.

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation, `> file 2>&1`, never
`run_in_background`. **Commit after every step.**

## RETURN_FORMAT

```text
CI:          which route you took and why; the proof on a stripping-less Node
CONTROLS:    how the two non-rule checks are now covered, and the four deletions re-tested
DETECTOR_D:  the fix, the corrected comment, both new silent controls
DEFERRAL:    how the six sites are findable now, and why that survives an edit
SHADOW:      how a .js shadow is caught
DIAGNOSIS:   load failure vs drift, shown
SWEEP:       the settled condition, three consecutive runs, and what a never-settling route does
GOLDENS:     expected none. Say so.
UNVERIFIED:  expected non-empty
```

Falsify me. You have in every packet this phase, and QA has in every round — including this one, where it
found that the instrument the phase was built around cannot run in the place it is supposed to protect.
