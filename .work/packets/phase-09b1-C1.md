# CODER TASK PACKET — PHASE 09b-1, CORRECTION 1

PHASE_ID: 09b-1-C1
PHASE_TITLE: A control boundary nobody can see, and a button that cannot report failure
BASE_COMMIT: `467c029`
WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\coder-p09a`, already on **`wt/coder-p09b1c1`** at `467c029`, clean,
`.env` present, `node_modules` junctioned.

This packet is **the two things 09b-1 proved and could not fix from its own allowlist.** Both diagnoses were
yours and both were right; this widens the allowlist to let you act on them.

## ⚠ THE PROHIBITION IS UNCHANGED, AND STILL STRICTER NEAR AUTH

**No sign-in, sign-up, password-reset request, OAuth redirect, or any Supabase auth call against the live
project. No RFQ submit, edge-function invoke, storage upload, row insert, or deploy.** A reset request sends
real mail to a real address; a sign-up creates a real user. The four `public.rfqs` rows and three
`cad-uploads` objects remain untouched evidence of an unresolved user decision. Keep the abort guard with the
live canary proven before any measurement — 09b-1 ran it at `allowed 0` and that standard holds.

## ITEM 1 — `.shell-field`'s control boundary fails 1.4.11, site-wide

You measured it and I verified the mechanism at the source:

```
shell.css:1471   .shell-field :is(input, select, textarea)
                 border: var(--tl-rule-size) solid var(--sf-rule);
design-tokens.css:81   --tl-rule: rgba(227, 231, 225, .28);
```

Flattened on graphite that is **2.16:1** against 1.4.11's **3:1**, and the fill does not carry the control
either at **1.04:1** — so the border is the only thing that identifies the input as an input. You then showed
it is not an auth defect at all: **`/iletisim` measures the identical 2.16 / 1.04 / 17.35**, and
`/teklif-al` uses the same class.

**Two things to be careful about, both learned the expensive way in this run.**

- **09a's `--sf-danger` precedent.** A *root-scoped* override of a shared role broke a nested `paper` band
  that inherits from the graphite root — it traded one serious violation for another at 2.23:1, and
  `shell.css:961-970` already documents that trap. Whatever you build must be measured on **both grounds**,
  including a paper band nested inside a graphite root.
- **`--sf-rule` is not only used for control boundaries.** You already established that the decorative rules
  on these routes — the aside rule at 2.16, register hairlines at 1.4, the "MT" frame at 2.08 — are
  **1.4.11-exempt**. Raising the shared role globally would repaint every divider in the design system to
  satisfy a criterion they are not subject to. A role bound to *control boundaries* is the obvious shape, but
  **I am not prescribing the mechanism** — I have prescribed three this phase and been wrong twice.

**Scope of the blast radius, stated plainly:** this changes `/iletisim`, `/teklif-al` and the three auth
routes. `/iletisim` and `/teklif-al` have goldens and they will move. That is expected and permitted — but
every moved baseline must be **adjudicated at the DOM**, with the element proven to have changed only in the
way your change explains, the way 09a's golden work was done. `--update-snapshots` without that adjudication
is not acceptable for any of them.

**Also fix, while you are in there:** every other control that takes its boundary from the same role and
whose boundary is its only identifier. Do not stop at `.shell-field` if the same shape exists elsewhere — but
say what you swept and how you decided, and leave genuinely decorative rules alone.

## ITEM 2 — the social buttons cannot report failure, and the error branch is dead

I verified your finding at the source. `@supabase/auth-js`:

```js
GoTrueClient.js:1857  async _handleProviderSignIn(provider, options) {
GoTrueClient.js:1866      window.location.assign(url);
GoTrueClient.js:1868      return { data: { provider, url }, error: null };
```

**No request is made and `error` is `null` on every path.** So `Login.tsx`'s `if (error) toast.error(…)` is
unreachable code, and the buttons have no failure path **even when the providers are enabled and something
else breaks**. A disabled provider, or a redirect URL the project does not allow, sends the reader to the
auth server's error page and this site never learns.

**Make failure observable to the reader.** The return leg is where the information exists — an OAuth failure
comes back on the redirect with an error in the query string or the fragment, and nothing in this app reads
it today. Handle it, and land the reader in the branded `ShellNotice` idiom 09a built, not in a stock toast
and not on someone else's error page.

**Do not:** enable a provider, call the project to probe enablement, or remove the buttons on a guess. If
your work shows the buttons should not ship until enablement is confirmed, **say so and leave them** — that
is the user's call and I will route it.

**Enablement stays open.** `supabase/config.toml` has no `[auth]` block; the repo has no opinion, and the one
read that would settle it is a network call this packet forbids. Two questions are outstanding and one answer
does not cover both: are `google` and `linkedin_oidc` enabled, and is `{origin}/musteri-paneli` an allowed
redirect URL.

## WRITE_ALLOWLIST

```
src/styles/design-tokens.css        (a new role, or a ground-bound variant; NOT a global raise of --tl-rule without proof)
src/styles/shell.css
src/pages/Login.tsx                 (Item 2 only — the return-leg handling and the dead branch)
src/components/auth/**              (only what Item 2 needs)
e2e/__golden__/**                   (baselines your change explains, each adjudicated at the DOM)
reports/09b1c1/**                   (your measurements)
```

## DO_NOT_TOUCH

```
supabase/**                                    ← and no auth or network call to it
src/pages/KVKK.tsx  GizlilikPolitikasi.tsx  CerezPolitikasi.tsx   ← 09b-2
src/components/ChatBot.tsx  src/components/ScrollToTop.tsx        ← 09b-2
src/data/servicePages.ts                       ← the six software-inventory sites are 09b-2's, one decision
scripts/claims-gate.mjs  scripts/qa-probes/**  reports/qa/**      ← 09b-3 / QA
src/utils/cadUpload.ts  src/content/claims.ts CAD block  src/data/technicalLandingData.ts
e2e/*.spec.ts  e2e/**/*.spec.ts                ← no spec edits; if a spec must change, say so
src/styles/technical-landing.css  e2e/landing/motion-grammar.spec.ts   ← R2-3, Phase 10 (A23)
/admin/*  /musteri-paneli/*  routes and their components
PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md  package.json  package-lock.json  .claude/**  tsconfig.json
```

**No new npm package.** **No z-index outside `src/styles/z-index.ts`.** **No hardcoded hex/rgb** — the new
role is a token, defined with the others.

## ACCEPTANCE_CRITERIA

1. Every control whose boundary is its only identifier measures **≥ 3:1** on **both** grounds, rendered, at
   1280 and 375 — including a `paper` band nested inside a `graphite` root, which is the case that falsified
   two proposals in 09a.
2. Genuinely decorative rules are unchanged, and you state which you classified as decorative and why.
3. `/iletisim`, `/teklif-al` and the three auth routes all measured before and after with **one instrument**.
4. An OAuth failure returning to the app renders a branded, reachable notice — **demonstrated**, not
   inferred, without any live auth call. The dead branch is gone or made reachable.
5. Every moved golden is adjudicated at the DOM and explained. No unexplained `--update-snapshots`.
6. `npx tsc -b` exit 0; `npm run build` exit 0; `node scripts/claims-gate.mjs` PASS.
7. `critical-1280`, `critical-375`, four visual projects, `qa-p09a*-*`, three `qa-p08-*` at `mobile-320`,
   `shared-shell-accessibility` — green, specs unedited.
8. `git status` shows nothing outside the WRITE_ALLOWLIST.

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation, `> file 2>&1`, never
`run_in_background`. **Commit after every step** — five agents have stopped mid-run in this run (two process
kills, a rate limit, a network failure, one unexplained) and every time only committed work survived.
`PARTIAL` is accepted.

## RETURN_FORMAT

```text
BOUNDARY:    the mechanism, and why not a global raise; both grounds measured, both viewports
SWEEP:       every control you checked; which you classified decorative and why
ROUTES:      /iletisim, /teklif-al and the three auth routes, before and after, one instrument
OAUTH:       what the return leg carries, how failure now reaches the reader, and the demonstration
GOLDENS:     each moved baseline, adjudicated at the DOM
UNVERIFIED:  expected non-empty — anything needing a live auth call belongs here
```

Falsify me. You have done it in every packet you have held this run, including this one's two premises, and
the record is better for each.
