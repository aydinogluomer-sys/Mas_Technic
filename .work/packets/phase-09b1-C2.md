# CODER TASK PACKET — PHASE 09b-1, CORRECTION 2

PHASE_ID: 09b-1-C2
PHASE_TITLE: The drop zone the sweep never visited, and the check the phase said could not exist
BASE_COMMIT: `3ba5343`
WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\coder-p09a`, already on **`wt/coder-p09b1c2`** at `3ba5343`, clean,
`.env` present, `node_modules` junctioned.

QA returned **PASS** on 09b-1 and C1 — 542 passed, 0 failed. Nothing here blocks. This packet is the eight
defects it found plus the one thing it proved was cheap and that this phase had assumed was impossible.

**Two of your numbers were falsified and both matter.** The crops are **seventeen, not fourteen** — your own
commit enumerates 6+1+7+3 and calls the total fourteen. And your control probe does **not** discover controls
the way its header claims: `probe-control-boundary.mjs:143` is `if (!edge) continue;`, so every borderless
element is dropped *before* the interactive test, making the interactive set a strict subset of the bordered
set. Three controls fall through it. They happen to pass; the claim was still wrong.

## ⚠ THE PROHIBITION IS UNCHANGED, AND STILL STRICTER NEAR AUTH

**No sign-in, sign-up, password-reset request, OAuth redirect, or Supabase auth call against the live
project. No RFQ submit, edge-function invoke, storage upload, row insert, or deploy.** Keep the abort guard
with the live canary proven before any measurement.

## D1 — a live 1.4.11 failure on the landing page, and it breaks a standing rule too

`src/styles/technical-landing.css:368`:

```css
.tl-cad-drop{ … border:1px dashed #9aa09c; … background:transparent; … }
```

A `<button>` with a four-sided boundary over a transparent fill, painted at **2.20:1** on `/`. It is the
same shape C1 fixed in `.shell-file`; your sweep missed it only because **`/` was not in its route list**.
Your probe would have caught it.

**And it is a second violation independently:** `#9aa09c` is a hardcoded hex, which `CLAUDE.md` lists under
Forbidden Actions. Route it through the token system like everything else.

`technical-landing.css` is otherwise reserved for Phase 10 (A23, the R2-3 motion item). **You may change the
`.tl-cad-drop` boundary declarations and nothing else in that file.** Do not touch the stack track, the band
rules, or anything `motion-grammar.spec.ts` asserts.

Landing goldens will move. Adjudicate every one at the DOM.

## D2 — the notice lookup walks `Object.prototype`, and an attacker can choose the prose

`src/components/auth/oauth-return.ts:208`:

```ts
const copy = (code && COPY[code]) || (error && COPY[error]) || FALLBACK;
```

`COPY[code]` is a plain object index. `error_code=constructor` — and `__proto__`, `toString`, `valueOf`,
`hasOwnProperty` — resolves to a truthy inherited value, so `FALLBACK` is skipped and the notice renders with
an empty label, no title and an empty body. **The fallback that exists for exactly this case is bypassed by
the case it exists for.**

**The second half is the one I care about more, and QA is right that it is real.** The attacker cannot
*write* the prose, but they can *choose* it: a crafted link `#error_code=user_banned` renders **"HESAP KAPALI"
— an assertion about the reader's account status, in this site's voice**, to someone who was never banned and
may never have had an account. That is a social-engineering surface the site hands out for free.

Fix the lookup so only own properties resolve. Then decide, and say why, what the notice may assert on the
strength of a URL fragment alone. **I am not prescribing it** — but note the asymmetry: the site cannot
verify any of this, and a message that asserts *a fact about the reader* is different in kind from one that
says an attempt did not complete.

## D3 — a comment that is false, in the file whose job is not to be

`oauth-return.ts:70-71` says the reference "cannot hold an instruction". QA rendered
`KOD: sifrenizi-yeniden-girin`. Make the comment true or make the code match it. This is the fourth comment
in this run to claim something broader than its controls demonstrate, and QA named that pattern at the close
of 09a.

## D4 — the probe's discovery claim

`probe-control-boundary.mjs:143`. Either make the discovery match the header, or make the header match the
discovery and report the borderless-interactive set separately. It is your instrument and its next reader
will trust its header.

## THE STALE NOTICE — broader than the deferral you disclosed

You disclosed that a reader already signed in sees the notice at their next `Login` mount. QA reproduced it
**with no session at all**: land on `/malzemeler#error=…`, wait 20 seconds, reach `/giris` in the same
document, and a twenty-second-old failure is announced **with no indication of its age**. Bound it — by age,
by navigation count, or by whatever you judge sound — so the notice describes something that just happened.

## D7 — a latent trap of exactly the 09a shape

`ShellBand.tsx:50` types `tone: "graphite"`, and **no CSS matches `[data-band-tone="graphite"]`** — I checked.
A no-op today, verified by QA's injection. But the moment a future phase gives that selector a background
without re-binding the `--sf-*` roles alongside it, it becomes the nested-ground trap that cost 09a two
falsified proposals. Close it now: either bind the roles or remove the tone from the type.

## THE CHECK THIS PHASE SAID COULD NOT EXIST — build it

You reported, correctly and valuably, that your never-matching `.shell-field > label` selector passed `tsc`,
eslint, axe, a contrast census and every golden, and was found only by opening a screenshot. **QA falsified
the "nothing could have caught it" half with a running test**, and it is cheap:

> *A component the design system defines must compute the same typography everywhere it appears.*

13 `.shell-field` labels across 4 routes, one treatment today. Reverting the four declarations at runtime
flips `/giris` to `Space Grotesk / 16px / 400`, a split, and the check goes red — **six page visits, 7.3 s,
no baseline, no screenshot**, and it needs no advance knowledge that a child combinator was involved.

**Promote it to a permanent gate.** Generalise beyond `.shell-field > label` if the same invariant holds for
other design-system components — but do not over-reach: a component that legitimately varies by ground or
viewport is not a violation, and the check must say which axis it holds constant.

## RECORD-ONLY — no code

State the corrected figures where your commits stated the wrong ones: the crops are **seventeen**, and the
paper-band ground has a **fourth delta, 1294**, which your adjudication did not quantify.

## WRITE_ALLOWLIST

```
src/styles/technical-landing.css    (ONLY the .tl-cad-drop boundary declarations)
src/styles/design-tokens.css  src/styles/shell.css
src/components/auth/oauth-return.ts  src/components/auth/**  src/pages/Login.tsx
src/components/shell/ShellBand.tsx   (D7 only)
e2e/*.spec.ts                        (the new typography gate — a NEW spec file)
e2e/__golden__/**                    (baselines your change explains, each adjudicated at the DOM)
reports/09b1c2/**
scripts/qa-probes/09b1c1-**          (D4 — your own probe, not QA's)
```

## DO_NOT_TOUCH

```
supabase/**                                   ← and no auth or network call to it
src/styles/technical-landing.css              ← EVERYTHING except the .tl-cad-drop boundary
e2e/landing/motion-grammar.spec.ts            ← R2-3, Phase 10 (A23)
src/pages/KVKK.tsx  GizlilikPolitikasi.tsx  CerezPolitikasi.tsx   ← 09b-2
src/components/ChatBot.tsx  src/components/ScrollToTop.tsx        ← 09b-2
src/data/servicePages.ts                      ← the six software-inventory sites, 09b-2, one decision
scripts/claims-gate.mjs                       ← 09b-3
e2e/qa-*.spec.ts  scripts/qa-probes/p09a*  scripts/qa-probes/09b1-*  reports/qa/**   ← QA's
/admin/*  /musteri-paneli/*   PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md
package.json  package-lock.json  .claude/**  tsconfig.json
```

**No new npm package. No hardcoded hex/rgb. No z-index outside `src/styles/z-index.ts`.**

## ACCEPTANCE_CRITERIA

1. `.tl-cad-drop` measures **≥ 3:1** on every ground it appears on, rendered, 1280 and 375, and carries no
   hardcoded colour.
2. No inherited property resolves through `COPY`; the fallback is reached for every non-own key.
3. What the notice asserts on the strength of a fragment is defensible, and you say why.
4. The stale notice is bounded, and you state the bound.
5. `oauth-return.ts:70-71` is true.
6. The typography gate exists, goes red on the historical defect (proven by reverting the four declarations
   at runtime), and green on the tree.
7. `[data-band-tone="graphite"]` cannot become a nested-ground trap.
8. `npx tsc -b` exit 0; `npm run build` exit 0; `node scripts/claims-gate.mjs` PASS.
9. Full matrix green, specs unedited except the new gate, every moved golden adjudicated at the DOM.
10. `git status` shows nothing outside the WRITE_ALLOWLIST.

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation, `> file 2>&1`, never
`run_in_background`. **Commit after every step** — five agents have stopped mid-run in this run.

## RETURN_FORMAT

```text
DROP:        the fix, measured on every ground; the token it now uses
COPY:        the lookup fix, and your reasoning about what a fragment may assert
STALE:       the bound and why it is the right one
GATE:        the typography check, red on the historical defect, green on the tree, and its scope
BAND:        how the graphite tone can no longer become a trap
PROBE:       D4 — header and behaviour reconciled
FIGURES:     seventeen, and the 1294 delta
GOLDENS:     each moved baseline adjudicated at the DOM
UNVERIFIED:  expected non-empty
```

QA falsified two of your numbers and one of my suspicions this round, and its most useful output was proving
that a check this phase had written off as impossible takes 7.3 seconds. Falsify me the same way.
