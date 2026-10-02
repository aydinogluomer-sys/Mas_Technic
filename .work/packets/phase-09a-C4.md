# CODER TASK PACKET — PHASE 09a, CORRECTION 4

PHASE_ID: 09a-C4
PHASE_TITLE: Make the instruments catch what they claim to catch
BASE_COMMIT: `8217c67`
WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\coder-p09a`, already on **`wt/coder-p09a4`** at `8217c67`, clean,
`.env` present, `node_modules` junctioned. Nothing to provision.

## ⚠ THE PRODUCTION-WRITE PROHIBITION STILL APPLIES

**Do not submit the RFQ form against the live project, invoke any edge function, upload to storage, insert a
row, or deploy.** The four rows in `public.rfqs` and three objects in `cad-uploads` are evidence of an
unresolved user decision — do not touch them. Nothing in this packet needs the network.

## WHY THIS PACKET EXISTS

QA round 3 returned **PASS**. Nothing here blocks. But it attacked the type pin you built in C3 twelve ways
and **four attacks got through**, and it found the gate has holes in exactly the classes it was just widened
to cover. Your C3 work was good; this packet closes the gap between what the instruments *claim* and what
they *catch*. That gap is the whole value of C3, so it is worth one more round.

**Your C3 reasoning was independently confirmed on the point that mattered most.** QA restored the runtime
import edge and measured it: `--project=critical-1280 --list` collects **0 tests in 0 files**
(`TypeError … VITE_SUPABASE_URL` at `env.ts:22`) against **83** at HEAD. My instruction was wrong and you
were right to refuse it. Same for the `F4` refusal — `isPublishableSpec` over every header in the tree drops
**265 of 279 (95%)** and would have shipped **53 of 54 tables** malformed, because `ShellComposition.tsx:243`
renders `headers` and `rows` independently with no zip and no width check. Both refusals stand.

## R3-1 — MEDIUM. The pin binds the tuple to the validator; it does not bind the copy to the tuple.

`src/content/claims.ts:96,99`. QA's attacks **A6** and **A7**: leave `PUBLISHED_CAD_EXTENSIONS` untouched and
edit the derivation instead —

```ts
CAD_UPLOAD_FORMATS = joinTurkishList([...PUBLISHED_CAD_EXTENSIONS.map(e => e.toUpperCase()), "DWG"]);
// or
CAD_UPLOAD_FORMATS = joinTurkishList(PUBLISHED_CAD_EXTENSIONS.slice(0, 5).map(...));
```

`tsc` exits 0. The gate PASSes. **All five publication sites then read `… IGS, 3MF ve DWG` against a
validator that refuses DWG** — which is the exact defect C3 existed to make impossible, reintroduced one
layer up.

Close it. The two exported strings must be provably a total, order-preserving function of the pinned tuple —
by construction, by a further type-level pin, by a gate check on the derived values, or by whatever you judge
soundest. I am not prescribing the mechanism; I prescribed one last time and it could not be built.

## R3-2 — MEDIUM. The pinned-file scan *replaces* the general detectors instead of supplementing them.

`scripts/claims-gate.mjs:837-848`. QA's **A10/A11**: because `cadFormatScan` substitutes for detectors (A)
and (B) on pinned files, **a bare prose offer of SolidWorks added to `claims.ts` — or to
`technicalLandingData.ts`, a rendered content file — is invisible to both instruments.** A file being pinned
should buy it an *extra* check, never fewer.

## R3-3 — MEDIUM. One softened suffix walks through the widened rule.

`scripts/claims-gate.mjs:905-909`. `kazanç` is matched; **`kazancı` is not**. `{ label: "Maliyet Kazancı",
value: "%30-50" }` and `"%35 zaman kazancı elde edilir"` pass the full gate, while `Zaman Kazanç` fires.
The fix is the `kazan[çc]` idiom **this file already uses four times**. I checked the tree myself: there are
**no live instances** — this is a latent hole, not a live claim, which is why it is MEDIUM and not blocking.
Add controls in both directions.

## R3-4 — LOW-MED. Two comments I wrote, and one you wrote, are false. `metaDescription` is dead data.

`ServiceDetail.tsx:195, 284, 306` all pass **`page.description`**. **Nothing in `src/**` reads
`metaDescription` on a service route.** So `claims-gate.mjs:1249-1251` and `servicePages.ts:2019-2021` —
"ships into search results and social cards" — are **false as written**, and so is the same sentence in my
own C3 packet and in `PROGRESS.md`, which I am correcting on my side.

**The removals were right; only the stated reason was wrong.** Correct the two comments to say what is true:
the string was removed because it is an unauthorised claim, and it happens to sit in a field that is
currently dead. **Do not** wire `metaDescription` up — that every service page carries an unread
`metaDescription` is a real SEO finding, but it belongs to the SEO phase, not to a content correction.
Record it in the commit message and leave it.

## R3-5 — MEDIUM. Two specs write outside their own space, and this run has had two process kills.

1. `e2e/landing/claims-gate.spec.ts:53` writes `src/content/__claims-gate-probe__.ts` into **production
   source** and removes it in `finally`. A process kill leaves it there. Two agents have been killed
   mid-run in this phase alone. Move the probe somewhere a crash cannot contaminate `src/**` while keeping
   what the test is for — a gate nobody has seen fail is a gate nobody can trust, and that reasoning in the
   comment above it is right.
2. `e2e/qa-p09a2-claims-sweep.spec.ts:150-157` writes `reports/qa/phase-09a-r2/sweep.json` **unconditionally
   on every run**, so running round 2's spec overwrites round 2's committed evidence. QA reproduced it,
   restored the files, and reported it as its own defect. It is a QA-authored spec and normally off-limits to
   you; **this packet authorises you to fix these two specs and only these two.** Make the write
   opt-in (an env flag) or route it to a scratch path. Round 2's committed evidence must be byte-identical
   afterwards.

## R3-6 — LOW. The byte-exact pin false-positives on a reformat.

`scripts/claims-gate.mjs:803`. A whitespace-only reformat or a single-quote change turns the gate red with
zero semantic drift. It fails *closed*, which is the right direction — but a formatter run producing a
baffling FAIL is a gate people learn to distrust. Normalise before comparing.

## ALSO — two stale controls QA found

- `scripts/claims-gate.mjs:1221` still blesses as silent the exact string `'"CAD/CAM Entegrasyonu — CATIA,
  SolidWorks, NX, Mastercam",'` — which **`b3ae3c7` deleted**. A negative control asserting silence on a
  string that no longer exists passes vacuously and quietly blesses the class. Remove or re-aim it.
- **The four D4 sites are ungated**: QA reports that restoring any of them leaves the gate green. Whatever
  rule ought to have caught them, add it, with controls drawn from the removed strings.

## NOT IN THIS PACKET — deliberately deferred, do not sweep them

`servicePages.ts:3292` and `:3306` (`{ label: "CAD", value: "SolidWorks, CATIA, NX" }` on
`/endustriyel/ozel-projeler`) and `/hizmetler/fikstur-aparat`'s four sites (`:680, :685, :703, :710`) name
CAD software as the tools work is *designed in*. That is the software-inventory class, and it is one
decision across six sites — **it goes to 09b as a whole**, not half-fixed here. You were right to stop at the
DFM page in C3, and the same reasoning applies now.

## WRITE_ALLOWLIST

```
src/content/claims.ts               (the derivation pin; NOT the QUOTE_RESPONSE_TIME block)
src/data/servicePages.ts            (ONLY the false comment at :2019-2021)
scripts/claims-gate.mjs
e2e/landing/claims-gate.spec.ts     (R3-5.1 only — move the probe out of src/**)
e2e/qa-p09a2-claims-sweep.spec.ts   (R3-5.2 only — make the evidence write opt-in)
```

## DO_NOT_TOUCH

```
src/utils/cadUpload.ts               ← THE AUTHORITY. Derive from it; never edit it to match the copy
src/content/claims.ts QUOTE_RESPONSE_TIME + QUOTE_RESPONSE_TIME_DISPLAY
src/data/technicalLandingData.ts     ← pinned deferral; e2e/technical-landing.spec.ts:167 asserts the string
src/pages/ServiceDetail.tsx          ← metaDescription stays unwired; that is the SEO phase's call
servicePages.ts:3292 :3306  and  /hizmetler/fikstur-aparat  ← 09b, as one decision
every other e2e spec, e2e/__golden__/**, reports/qa/**, scripts/qa-probes/**
supabase/**  src/pages/Login.tsx  ForgotPassword.tsx  ResetPassword.tsx  ChatBot.tsx  KVKK.tsx
GizlilikPolitikasi.tsx  CerezPolitikasi.tsx  src/styles/technical-landing.css
PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md  package.json  package-lock.json  .claude/**  tsconfig.json
```

## ACCEPTANCE_CRITERIA

1. QA's attacks **A6, A7, A10, A11** all fail — the mutation is caught by at least one instrument. Re-run
   its own harness against your fix: `scripts/qa-probes/p09a3-pin-attacks.mjs` is committed on the branch and
   is the fastest way to prove it. Read it, do not edit it.
2. A bare prose offer of a refused format added to `claims.ts` **or** `technicalLandingData.ts` fires.
3. `kazancı` fires; `kazan[çc]` controls in both directions.
4. The two false comments say something true; `metaDescription` left unwired.
5. Neither spec can write into `src/**` or into `reports/qa/phase-09a-r2/**` on an ordinary run. Round 2's
   committed evidence byte-identical afterwards — prove it by hash.
6. A whitespace-only reformat of the pinned tuple does **not** turn the gate red; a semantic change still
   does.
7. The stale control at `:1221` removed or re-aimed; the four D4 sites gated with controls.
8. Gate PASSes on the tree and FAILs with the removed strings restored. `npx tsc -b` exit 0;
   `npm run build` exit 0.
9. `critical-1280`, `critical-375`, four visual projects, `qa-p09a-rfq-form`, `qa-p09a2-*`, `qa-p09a3-*`,
   three `qa-p08-*` at `mobile-320`, `shared-shell-accessibility` — green, and **no golden moves**; this
   packet changes no rendered copy except one comment.

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation, `> file 2>&1`, never
`run_in_background`. **Commit after every step.**

## RETURN_FORMAT

```text
PIN:         how the derivation is now bound; A6/A7/A10/A11 re-run against your fix, with output
GATE:        each rule changed, its controls both ways, and the tree/restored runs
SPECS:       what each of the two specs writes now, and the hash proof round 2's evidence is intact
COMMENTS:    the corrected text, and what you found about metaDescription being unread
STALE:       :1221 and the four D4 sites
GOLDENS:     expected: none moved. Say so explicitly.
UNVERIFIED:  expected non-empty
```

Falsify me. You have done it in every packet this phase — the impossible runtime import, the `F4` filter, and
five CAD sites where I named one — and each time the record is better for it.
