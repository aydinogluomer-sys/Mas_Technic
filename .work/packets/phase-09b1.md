# CODER TASK PACKET — PHASE 09b-1

PHASE_ID: 09b-1
PHASE_TITLE: The three auth routes, and a security badge nobody can back
BASE_COMMIT: `fb82ea2`
WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\coder-p09a`, already on **`wt/coder-p09b1`** at `fb82ea2`, clean,
`.env` present, `node_modules` junctioned. Nothing to provision.

Phase 09a closed PASS after five correction rounds. **09b is deliberately split**; this is the first of three
and it is the smallest, because 09a's packets were too large and cost four rounds partly for that reason.

## ⚠ THE PRODUCTION-WRITE PROHIBITION STILL APPLIES, AND THIS PACKET IS NEAR AUTH

**Do not sign in, sign up, request a password reset, trigger an OAuth redirect, or call any Supabase auth
method against the live project. Do not submit the RFQ form, invoke an edge function, upload to storage,
insert a row, or deploy.** Earlier in this phase an agent wrote four rows to `public.rfqs` and three objects
to `cad-uploads` on the customer's production database by trusting this repository's copy of an edge function
the deployed one does not match. Those rows and objects are untouched evidence of an unresolved user decision.

**Auth is more dangerous than the RFQ form was**, because a password-reset request sends real mail to a real
address and a sign-up creates a real user. Any check that needs an auth path must intercept and abort every
non-loopback request and **prove the interception holds before the click** — QA's pattern in this phase was a
live canary to example.com required to fail before any control is touched, with probe bundles given a
loopback URL and a junk key. Use it.

## THE LIVE DEFECT — `src/components/auth/LoginLeftPanel.tsx:52-56`

```tsx
<Shield size={14} className="text-primary/50" />
<span className="…">256-bit SSL ile korunan güvenli bağlantı</span>
```

A shield icon and an encryption claim on `/giris`. `IMPLEMENTATION.md` §7 PHASE 09 forbids **both**
independently: *"Do not claim encryption/security properties not verified"* and, under **Do not**, *"Add a
security badge unless backed by reality."*

Nobody in this repository can back it. The site does not terminate TLS — a host does — so its cipher suite is
not ours to state, "256-bit SSL" names a protocol deprecated in favour of TLS, and `USER_INPUTS.md`
authorises no security property anywhere. **`claims.ts:447` already records that there is no NDA, no approved
confidentiality text and no known retention**, and `RfqAside.tsx:32` documents that the RFQ page's silence
about encryption is deliberate and must stay. This badge is the same claim that page refuses to make.

**Remove the claim.** If the panel needs something in that slot, it may say only what is verifiable from this
repository. Do not replace one unbacked assurance with a softer unbacked assurance.

## THE DESIGN MIGRATION — Phase 08's criterion 3 failed on exactly these routes

Phase 08 measured `/giris` at **92 teal tokens**, and `/sifremi-unuttum` and `/reset-password` at **0 shell
primitives**. They are the last public routes still in the pre-overhaul language. Bring all three into the
shell design system the way 09a brought `/teklif-al` and `/cad-dashboard`: teal → 0, Radix → 0, shell
primitives real, `--sf-*` roles for state, no hardcoded hex or rgb, no z-index outside `src/styles/z-index.ts`.

`/sifremi-unuttum` is served by **`ForgotPassword.tsx`** (`App.tsx:211`). There is no `SifremiUnuttum.tsx`;
every DO_NOT_TOUCH list written earlier in this phase named a file that does not exist.

Sizes: `Login.tsx` 273, `ForgotPassword.tsx` 105, `ResetPassword.tsx` 150, plus five small components under
`src/components/auth/`. 676 lines total — small enough to do properly.

**Error and empty states go through `ShellNotice`/`--sf-danger`**, which 09a built and QA measured at 7.33:1
on graphite and 6.93:1 on paper. Do not introduce a fourth error idiom. Note `LoginLeftPanel` currently uses
`text-primary` and `rgb(var(--text-primary-rgb)/…)` — check those resolve to the shell's roles and not to the
old palette.

## THE FACTS I WANT ESTABLISHED — 09b-2 writes the legal copy and needs them

**Do not write legal or privacy copy in this packet.** The legal pages belong to 09b-2. Your job is to
establish, by measurement, what the auth routes actually *do*, so that packet is not written on a guess. The
last three packets in this phase were each wrong about a premise I had asserted.

1. **hCaptcha.** `Login.tsx:3` imports `@hcaptcha/react-hcaptcha`; `:49` gates submit on a token; `:59` passes
   it to Supabase. It is real and functional. Measure what it actually loads and stores: which origins are
   contacted, which cookies or storage keys are set, and when — on page load, or only on interaction. Phase 08
   published a storage-key list and a "zero cookies" claim, and gated both; if hCaptcha breaks either, that is
   a finding 09b-2 must act on.
2. **Google and LinkedIn OAuth.** `SocialButtons.tsx` renders both; `Login.tsx:103` calls a real
   `supabase.auth.signInWithOAuth`. **Determine whether those providers are actually enabled on the project**
   — read-only, without initiating a redirect. If they are not, a visitor clicking Google gets a failure, and
   a control that promises what it cannot do is the same class of defect as the CAD format list 09a spent two
   corrections on. Report what you find; **do not remove the buttons on a guess**, and do not enable anything.
3. **Third parties reachable from these routes**, enumerated: hCaptcha, Google, LinkedIn, Supabase itself.
   09b-2 will decide what the privacy copy must say; you supply the list and the evidence.

## WRITE_ALLOWLIST

```
src/pages/Login.tsx  src/pages/ForgotPassword.tsx  src/pages/ResetPassword.tsx
src/components/auth/**
src/index.css  src/styles/shell.css      (ONLY if an auth-specific shell rule is genuinely needed; prefer reuse)
e2e/__golden__/**                        (only baselines your change explains — expect the auth routes to move)
e2e/visual/**  e2e/*.spec.ts             (ONLY to add auth routes to an existing surface list, if the list hard-codes routes)
reports/09b1/**                          (your third-party evidence for 09b-2)
```

## DO_NOT_TOUCH

```
supabase/**                              ← and no auth or network call to it
src/pages/KVKK.tsx  GizlilikPolitikasi.tsx  CerezPolitikasi.tsx   ← 09b-2 writes the copy; you supply facts
src/components/ChatBot.tsx  src/components/ScrollToTop.tsx        ← 09b-2
src/data/servicePages.ts                 ← the six software-inventory sites are 09b-2's, one decision
scripts/claims-gate.mjs                  ← 09b-3 hardening; if you need a new rule, say so and I will route it
src/utils/cadUpload.ts  src/content/claims.ts CAD block  src/data/technicalLandingData.ts
e2e/qa-p09a*-*.spec.ts  e2e/landing/claims-gate.spec.ts  scripts/qa-probes/**  reports/qa/**
src/styles/technical-landing.css  e2e/landing/motion-grammar.spec.ts   ← R2-3, Phase 10 (A23)
/admin/*  /musteri-paneli/*  routes and their components
PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md  package.json  package-lock.json  .claude/**  tsconfig.json
```

**No new npm package** — `CLAUDE.md` forbids it, and 09a's loader fix showed the repo's existing
devDependencies are usually enough.

## ACCEPTANCE_CRITERIA

1. No unverified security or encryption claim, and no security badge, on any of the three routes — verified
   in the **rendered** DOM, not by grep.
2. All three routes measure 0 teal, 0 Radix primitives, real shell primitives, and use `--sf-*` for state.
   No hardcoded hex/rgb; no z-index outside `src/styles/z-index.ts`.
3. Error, loading and empty states are branded and **reached**, not inferred — the standard 09a was held to.
4. Keyboard reachable, focus visible, labels associated; contrast ≥ 4.5:1 for text and ≥ 3:1 for non-text,
   measured rendered at 1280 and 375.
5. The third-party facts of section "THE FACTS I WANT ESTABLISHED" are in `reports/09b1/`, with evidence.
6. `npx tsc -b` exit 0; `npm run build` exit 0; `node scripts/claims-gate.mjs` PASS.
7. `critical-1280`, `critical-375`, four visual projects, `qa-p09a*-*`, three `qa-p08-*` at `mobile-320`,
   `shared-shell-accessibility` — green, specs unedited except as the allowlist permits.
8. Any golden that moves is explained by your change, adjudicated at the DOM rather than the pixels, and
   **never** produced by an unexplained `--update-snapshots`.
9. `git status` shows nothing outside the WRITE_ALLOWLIST.

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation, `> file 2>&1`, never
`run_in_background`. Build once then `PLAYWRIGHT_PREVIEW_ONLY=1` with a free `PLAYWRIGHT_PORT`, checked
before binding. **Commit after every step** — four agents stopped mid-run in 09a (two process kills, a rate
limit, one unexplained) and every time only committed work survived. `PARTIAL` is an accepted return.

## RETURN_FORMAT

```text
BADGE:       the removed claim, what replaced it if anything, and why that is verifiable
DESIGN:      per route — teal, Radix, shell primitives, before and after; the states you reached
A11Y:        contrast and keyboard, measured rendered, both viewports
THIRD_PARTY: hCaptcha's origins/storage/timing; whether Google and LinkedIn OAuth are enabled; the full list
GOLDENS:     what moved and why, adjudicated at the DOM
UNVERIFIED:  expected non-empty — anything needing a live auth call belongs here, not in a workaround
```

Falsify me. Every packet in 09a was wrong about something I had asserted as verified, and the run is better
for each one that was caught.
