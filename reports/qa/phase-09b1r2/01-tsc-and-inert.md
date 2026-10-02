# QA 09b-1 R2 — STEP 1: `tsc`, and the instruments that do nothing

HEAD under review: `63a7ddc` on `wt/qa-p09b1r2` (worktree of `claude/awwwards-90-overhaul`).
A Coder is in `09b-2` in parallel; nothing in this step reads a file on that list.

## 1.1 `npx tsc -b` — the command, its output, its exit code

Round 1 committed `reports/qa/phase-09b1/tsc.txt` at **0 bytes** and called it green. That file is
still 0 bytes on this head (`reports/qa/phase-09b1/**` is DO_NOT_TOUCH, so it stays wrong and is
reported instead). This round does not put the answer in a file.

```
$ cd C:/Users/Trade Bilisim/pdh-wt/qa-p09b1r2
$ npx tsc -b
$ echo "EXITCODE=$?"
EXITCODE=0
```

No output. Exit **0**.

```
$ npx tsc -b --force
EXITCODE_FORCE=0
```

```
$ npm run typecheck
> vite_react_shadcn_ts@0.0.0 typecheck
> tsc --noEmit -p tsconfig.app.json && tsc --noEmit -p tsconfig.node.json && tsc --noEmit -p tsconfig.e2e.json
```

No output, exit 0.

### 1.2 The exit code is only evidence if the command looks at the files

An exit code of 0 from an incremental builder proves nothing until you know the builder did work.
Three checks, because round 1's whole failure was believing a green it had not earned.

**(a) The e2e project is in the build graph, and never skipped.**

```
$ npx tsc -b -v --dry
Projects in this build:
    * tsconfig.app.json
    * tsconfig.node.json
    * tsconfig.e2e.json
    * tsconfig.json

Project 'tsconfig.app.json'  is out of date because output file 'src/App.js' does not exist
Project 'tsconfig.node.json' is out of date because output file 'vite.config.js' does not exist
Project 'tsconfig.e2e.json'  is out of date because output file 'e2e/design-system-typography.spec.js' does not exist
```

All three are `noEmit`, so the named output files can never exist, so every project is permanently
"out of date" and `tsc -b` is never a no-op here. That is luck rather than design, but it is
measured luck.

**(b) A live canary in the exact shape of the round-1 defect.** A throwaway spec was placed in
`e2e/` (a path this round is allowed to write) with an unknown `test.use()` key:

```ts
test.use({ thisOptionDoesNotExist: "canary" });
```

```
$ npx tsc -b
e2e/qa-09b1r2-tsc-canary.spec.ts(5,12): error TS2353: Object literal may only specify known
properties, and 'thisOptionDoesNotExist' does not exist in type 'Fixtures<{}, {}, PlaywrightTestArgs
& PlaywrightTestOptions, PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.
Exit code 2
```

Same rule, same error number, same file class as round 1's real failure. The canary was deleted and
`tsc -b` returned to exit 0 with no output. So the green above is a green the compiler actually
produced by reading the spec files.

**(c) Stale incremental state cannot fake it.** `tsconfig.app.tsbuildinfo` and
`tsconfig.node.tsbuildinfo` are **tracked in git** (committed at `2cd03c1`, the initial commit) and
`tsconfig.e2e.tsbuildinfo` is neither tracked nor ignored. Running `tsc -b` dirties the first and
creates the third. They were restored/removed before committing. Not a defect of this phase, but a
committed build artifact is a loaded gun for exactly the class of mistake round 1 made; noted as
D-09b1r2-06.

## 1.3 The `reducedMotion` fix — verified by measurement, not by reading the fix

The Coder's claim is that project- and test-level `reducedMotion` are inert and only
`contextOptions` / `emulateMedia` reach the page. Independently reproduced here rather than trusted.

**Source check, my own:**

```
$ grep -rn "reducedMotion" node_modules/playwright/lib/        -> 0 matches, 0 files
$ grep -rn "reducedMotion" node_modules/playwright/types/test.d.ts
  test.d.ts:7474:   *       reducedMotion: 'reduce',
```

That single occurrence in the types is inside the JSDoc **usage example for `contextOptions`**
(`types/test.d.ts:7459-7481`), i.e. the only form the 1.59.1 types document is the one the Coder
adopted. `reducedMotion` is implemented entirely in `playwright-core` at the
context/page level (`client/browserContext.js:518`, `client/page.js:386`,
`server/browserContext.js:713`) and does not exist in the test runner's fixture surface.

**Runtime check, my own** — `scripts/qa-probes/09b1r2-reducedmotion.{config,probe}.mjs`, four
projects, `about:blank`, no server, reading `matchMedia("(prefers-reduced-motion: reduce)")` in the
page. Evidence: `reports/qa/phase-09b1r2/reducedmotion-placement.txt`.

```
placement                                              reduce?  expected
A-project-use-reducedMotion                            false    false     <- playwright.config.ts:203
B-project-use-contextOptions                           true     true      <- the shipped fix
C-control-nothing                                      false    false     <- control: the OS is not reduced
D-control-emulateMedia                                 true     true      <- control: the mechanism works
```

C is the control that matters: it proves the `true` in B is Playwright's doing and not this
machine's accessibility setting. The probe **asserts** these values rather than printing them, so if
a future Playwright starts honouring project-level `reducedMotion` the probe goes red and the
finding is revisited.

**Verdict on the fix:** correct, canonical, and it restores the intent instead of deleting it. Both
specs keep every assertion they were written with — `qa-09b1-golden-drift.spec.ts:248`
(`atDefault <= 200`) and `qa-09b1-type-slot-census.spec.ts:150` (`split == []`) and `:199`
(negative control must diverge) are untouched by `0d3f905`, which changed one line and added one
comment block per file. The committed evidence under `reports/qa/phase-09b1/` is unchanged by that
commit (`git show --stat 0d3f905` lists two spec files and nothing else).

## 1.4 WHAT ELSE IS INERT — found by looking

### D-09b1r2-01 — `playwright.config.ts:203` is dead, and it is not only the goldens

`visualProjects[].use.reducedMotion = "reduce"` is placement A above: **it does nothing**. The
Coder disclosed this and argued it is harmless because every golden-capturing spec calls
`page.emulateMedia({ reducedMotion: "reduce" })` itself. I checked that argument and it holds for
the goldens — all five capturing specs do call it, and all five calls are on the per-test path:

| spec | emulateMedia | where |
|---|---|---|
| `visual/landing-golden.spec.ts` | yes | `:27`, beforeEach |
| `visual/inner-pages-golden.spec.ts` | yes | `:97`, inside each test |
| `visual/shell-golden.spec.ts` | yes | `:45`, inside each test |
| `visual/wave-b-golden.spec.ts` | yes | `:62`, inside each test |
| `visual/navigation-golden.spec.ts` | yes | `:22`, beforeEach |

But the `visual-*` projects match `visual/**/*.spec.ts`, not just the golden specs, and **four
non-golden specs in that family do not call `emulateMedia` at all**:

```
visual/qa-a2-overlay-guard.spec.ts        0 emulateMedia
visual/qa-f4-font-guard.spec.ts           0 emulateMedia
visual/qa-h4-cursor-independent.spec.ts   0 emulateMedia
visual/radius-census.spec.ts              0 emulateMedia
```

Those four run believing the project declares reduced motion, and it does not. That is a live
consequence of the dead line, not merely dead weight. It is test-side, not production, and it does
not block — but "harmless" is one spec family too narrow.

The reason the type system never caught it is worth stating, because it is the general mechanism:
`visualProjects` is built with `.map()` and assigned to a variable, so TypeScript's excess-property
check — the very check that produced round 1's `TS2353` — does not apply. **A wrong option written
inline is a compile error; the same wrong option written through a variable is silent.**

### D-09b1r2-02 — a never-matching row in my own census

`e2e/qa-09b1-type-slot-census.spec.ts:57-61` declares three slots. The committed evidence
`reports/qa/phase-09b1/type-slot-census.txt` reports **two**:

```
.shell-field label   — 1 treatment(s)   13x   on /giris, /sifremi-unuttum, /iletisim, /malzemeler
.shell-field input   — 1 treatment(s)    9x   on /giris, /sifremi-unuttum, /iletisim, /malzemeler
```

`{ component: ".shell-form", slot: ".shell-field-hint" }` produced **zero observations on all six
routes** and therefore zero groups, zero possible splits, and zero possible failures. It is a census
row that cannot report. `.shell-field-hint` exists in eleven places in `src/`, so the row is not
pointing at a dead class — it is pointing at a dead *containment*: the hints are not descendants of
a `.shell-form` on the routes visited. Third of the census's three rows: inert.

### D-09b1r2-03 — two of my six census routes contributed nothing

The same evidence file names four routes in its `on` lists. `/reset-password` and `/teklif-al` are
in `ROUTES` (`:45-52`) and appear nowhere in the output, so they contributed **no observation to any
slot**. The spec's own header prose says the routes were "chosen so the component appears on both
sides of the defect: **three** auth routes where the label is nested" — two auth routes actually
contributed. That is prose ahead of measurement, in my file, and it is the same shape of error this
phase has now found in the gate, in a selector, in a config and in a fixture.

Neither of these two weakens the census's *positive* finding (0 splits over the slots that did
report) or its negative control. They mean the census's stated coverage is larger than its measured
coverage, which is the thing round 1 should have said and did not. Runtime confirmation of both is
in step 3.

### D-09b1r2-04 — the network guard every probe in this phase trusts does not cover WebSockets

`reports/09b1c1/probe-lib.mjs:45-63` installs `context.route("**/*")` and aborts non-loopback
hosts, and `canary()` proves it by issuing a `fetch`. In Playwright 1.59 WebSocket traffic is
**not** carried by `context.route`; it has a separate API, `routeWebSocket`
(`playwright-core/lib/client/browserContext.js:336`). So the guard's proof covers
`fetch`/XHR/navigation/subresources and does not cover a `wss://` connection, which is the transport
`@supabase/supabase-js` realtime uses. I did **not** test this by opening a socket — that would be
egress, which the packet forbids — so it is asserted from the API surface.

This is not hypothetical for this phase. `grep -rn "\.channel(" src/` finds **fourteen** realtime
subscriptions, and they are in `src/components/musteri/**` and `src/components/admin/**` — the
`/musteri-paneli` subtree, which is precisely the route the stale-bound rule under review reads. The
reason no probe has opened one is the route guard, not the network guard: `MusteriPaneli.tsx:43-45`
calls `supabase.auth.getSession()` and `navigate("/giris")` when there is no session, so signed out
the tab components never mount and never call `.channel()`. That is a mitigation supplied by the
application, and if it ever stops holding, `guard()` and its canary will still report clean.
Recorded as a limit of the instrument, not as an incident. Carried as **U15**.

### D-09b1r2-05 — my own probe truncated its own evidence, first run

`09b1r2-reducedmotion.probe.mjs` writes a header in `beforeAll`. `beforeAll` runs **once per
project**, so projects 2-4 each truncated the file and the first committed run reported one line out
of four. Caught by reading the artefact instead of the exit code — which is the entire lesson of
round 1 — and fixed by an append mode before anything was committed. Both runs are in this commit's
history; the file now carries all four rows.

## 1.5 Not a defect, but the assertion is looser than its own comment

`qa-09b1-golden-drift.spec.ts:243-248` says the count "must be within the crop's own
`maxDiffPixels`" and then asserts a hard-coded `<= 200`. The two are not the same sentence. All ten
measured crops report `0`, so nothing is hidden by it today, and it is my file from round 1 rather
than anything the Coder shipped. Noted so it is not discovered later as a third instance of the same
habit.
