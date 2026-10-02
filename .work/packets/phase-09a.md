# CODER TASK PACKET — PHASE 09a

PHASE_ID: 09a
PHASE_TITLE: RFQ/CAD — architecture, form behaviour, and the surface itself
BASE_COMMIT: `3a89e7c` (integration branch `claude/awwwards-90-overhaul`)

## WORKTREE — FRESHLY CREATED FOR YOU

```
C:\Users\Trade Bilisim\pdh-wt\coder-p09a     branch: wt/coder-p09a     at: 3a89e7c
```

`node_modules` junctioned to the main checkout, `.env` copied in (without it
every route renders the top-level error boundary and every measurement you take
is a measurement of an error page). `cd` there and stay. Ignore any worktree the
harness auto-creates under `.claude/worktrees/`; **never delete a worktree.**

## WHY THIS PHASE IS SPLIT

`IMPLEMENTATION.md` §7 PHASE 09 has four task blocks. This packet is the first
two — **Architecture/performance** and **Form behaviour** — plus the two Phase 08
items that live inside the same file and would otherwise mean editing 1540 lines
twice. **09b** takes Privacy/business policy and Security, the three auth
routes, and the carried privacy-copy items. Phase 05 was split the same way
(§10) and it bought a correction round; Phase 08 was not, and cost four.

`PROGRESS.md` A21 assigns `/teklif-al` and `/cad-dashboard` to this half.

## READ_FIRST

1. `IMPLEMENTATION.md` §7 PHASE 09 — the mandatory tasks and the "Do not" list.
2. `PROGRESS.md` — the Phase 08 section, and assumptions **A20** and **A21**.
3. `src/pages/TeklifAl.tsx` in full before changing any of it. 1540 lines.
4. `docs/lean/18-document-surfaces.md:162-165` — the deferral that made A20.
5. Skills: `mas-security-rfq` (upload/validation boundaries — read it even
   though security is 09b, because it constrains what you may build here),
   `mas-design-language` and `mas-performance`.

## MEASURED STARTING FACTS (falsify them; they are my reading, not gospel)

| fact | value | source |
|---|---|---|
| `TeklifAl.tsx` | 1540 lines | `wc -l` |
| route is already lazy | yes | `src/App.tsx:66` — `lazy(() => import("./pages/TeklifAl"))` |
| but the 3D stack is **static** in that chunk | `@react-three/fiber`, `@react-three/drei`, `three`, `STLLoader`, `OBJLoader` at `TeklifAl.tsx:3-7` | so opening `/teklif-al` pulls the whole viewer before anyone asks for one |
| OCCT is already dynamic | `TeklifAl.tsx:382` — `(await import("occt-import-js")).default` | the precedent you want, in this file |
| upload path | `@/utils/cadUpload` — `createCadStoragePath`, `uploadCadFile` | not inline in the page |
| rate limiting already exists | `TeklifAl.tsx:523` invokes `rfq-rate-limit` (`supabase/functions/rfq-rate-limit/index.ts`, 164 lines) | nothing to invent |
| the three AI/sync functions are admin-only | `finance-ai`, `ocr-invoice`, `parasut-sync` invoked only from `src/components/admin/FinanceDocsView.tsx:167,255,272` | QA verified nothing an RFQ writes reaches them; **do not change that** |
| `/cad-dashboard` | a redirect alias for `/teklif-al` per `ia.ts` | fixing one fixes both; QA measured identical symptoms |
| the error primitive exists and is unused | `ShellNotice` `tone="error"` sets `role="alert"` (`ShellComposition.tsx:517-529`); **zero** usages in `src/` | built by `7dcfb65` for exactly this |
| the current error states | `TeklifAl.tsx:358` "Desteklenmeyen dosya formatı.", `:411` "STEP dosyası işlenirken hata oluştu.", `:490` form error — all `toast.error` → stock sonner: white, 8px radius, `ui-sans-serif` | A20 |
| the surface is still the old language | `/teklif-al` measured 16 legacy-teal `rgb(10,125,138)` nodes, 3 Radix tablists, 1 shell primitive inside `<main>` | Phase 08 criterion 3, carried by A21 |

## MANDATORY TASKS

### A — Architecture / performance (§7)

1. **Decompose `TeklifAl.tsx`.** 1540 lines into maintainable modules. Structure
   is yours to choose; justify the seams in a comment, and prefer seams the
   repository already uses (`src/components/shell/**` composition primitives,
   `src/utils/**` for non-React logic, a `src/components/rfq/**` folder if that
   is the honest shape).
2. **Lazy-load the CAD/3D tooling so it loads only when the interaction needs
   it.** The route chunk must not pull `three`, `@react-three/*`, `STLLoader`,
   `OBJLoader` or OCCT until a file is actually being previewed. `:382`'s
   dynamic import is the pattern. **Measure the route chunk before and after**
   and put both numbers in the commit message.

### B — Form behaviour (§7)

3. **Verify the real submission pipeline** end to end locally. `.env` is
   present, so credentials permit it. Report what you actually exercised and
   what you could not.
4. **Client validation with accessible field errors** — programmatically
   associated (`aria-describedby`/`aria-invalid`), announced, focus moved to the
   first invalid field. Not colour alone.
5. **Prevent double-submit.**
6. **Handle timeout, network, upload and parse failures** — each reachable and
   each branded (see C).
7. **Show accepted CAD formats and max file size before upload.**
   `CAD_ACCEPT_ATTR`, `CAD_FORMAT_CHIPS`, `CAD_FORMAT_HINT` already exist in
   `@/hooks/useCadHandoff` — use them rather than writing a second list that can
   drift from the first.
8. **Success state with a stable request/confirmation identifier**, *if* the
   system already supports one. If it does not, say so and do not invent one —
   a fabricated reference number is exactly the class §13 forbids.
9. **Verify the internal notification/recipient path.** Report what exists. Do
   not add a recipient address that `USER_INPUTS.md` does not support.

### C — Carried from Phase 08 (both live in this file)

10. **A20 — wire `ShellNotice tone="error"` to the CAD parse error and the form
    error.** Phase 08 built the primitive and documented in the repository that
    it could not use it because this file was Phase 09's. This is that phase.
    The two branded states this phase already shipped measure `border-radius 0`
    and `Space Grotesk`; match them. `sonner` may remain for genuinely transient
    confirmations if you argue for it, but a parse failure and a form failure
    are not transient — they need to persist and be announced.
11. **A21 — bring the `/teklif-al` body into the design language.** 16 teal
    nodes, 3 Radix tablists, 1 shell primitive is the starting measurement;
    Wave A and Wave B surfaces measure 0 / 0 / 47–404. `/cad-dashboard` inherits
    the fix. The landing and the Wave A/B pages are the source of truth: read
    them, do not invent a third dialect.

## WRITE_ALLOWLIST

```
src/pages/TeklifAl.tsx
src/pages/CADDashboard.tsx
src/components/rfq/**                     (new, if that is the shape you choose)
src/utils/cadUpload.ts
src/hooks/useCadHandoff.ts
src/components/shell/ShellComposition.tsx (ONLY if a genuine gap in the primitives blocks you — say why in the diff)
src/styles/shell.css                      (ONLY for a token/class the composition genuinely lacks; no ad-hoc page CSS)
src/App.tsx                               (ONLY for lazy-boundary changes the decomposition requires)
e2e/__golden__/**                         (only baselines your change explains; §12 protocol)
```

## DO_NOT_TOUCH

```
supabase/**                               ← read-only audit only, and that is 09b's. NO schema, NO function edits, NO data.
docs/supabase-full-setup.sql
src/components/admin/**                   ← including FinanceDocsView.tsx; admin is out of scope per §N
src/pages/musteri-paneli/**  src/pages/admin/**
src/pages/Login.tsx  src/pages/SifremiUnuttum.tsx  src/pages/ResetPassword.tsx   ← 09b (A21)
src/pages/KVKK.tsx  src/pages/GizlilikPolitikasi.tsx  src/pages/CerezPolitikasi.tsx ← 09b (A26); do not "align" copy here
src/components/ChatBot.tsx  src/components/ScrollToTop.tsx                        ← 09b
src/components/navigation/ia.ts  src/components/shell/footer-groups.ts
src/styles/technical-landing.css  e2e/landing/motion-grammar.spec.ts              ← R2-3 stays red, Phase 10 (A23)
e2e/qa-p08-*.spec.ts                      ← QA's. All three must stay green unedited.
PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md  reports/qa/**
package.json  package-lock.json           ← no dependency added or removed
.claude/**  tsconfig.json                 ← now committed by the user; leave them alone
```

## ACCEPTANCE_CRITERIA

1. `/teklif-al` measured inside `<main>`: **0** legacy-teal `rgb(10,125,138)`
   nodes, **0** Radix component roots, **0** `bg-card`, **0** off-register radii,
   **0** system-font nodes, and shell primitives in the range Wave A/B surfaces
   show. Same for `/cad-dashboard`.
2. The `/teklif-al` route chunk does not contain `three` / `@react-three/*` /
   STL / OBJ / OCCT until a preview is requested. Before/after chunk sizes
   reported.
3. CAD parse error and form error render `ShellNotice tone="error"`:
   `border-radius 0px`, Space Grotesk, `role="alert"`. Reached, not inferred —
   upload a `.txt` to the file input the way QA did (`probe-error-states.mjs` in
   `reports/qa/phase-08/`, borrow it, do not edit it).
4. Every field error is programmatically associated and announced; keyboard
   users reach the first invalid field.
5. Double-submit is impossible; demonstrate it.
6. Accepted formats and max size are visible **before** a file is chosen, from
   the existing constants.
7. `npx playwright test e2e/qa-p08-scroll-region-reach.spec.ts e2e/qa-p08-storage-disclosure.spec.ts e2e/qa-p08-waveb-contract.spec.ts --project=mobile-320` green, **specs unedited**.
8. `critical-1280` and `critical-375` green; `bantOrani` still `0.23203125`.
9. All four visual projects run per project; each moved golden adjudicated per
   viewport in the commit message. `shell-header-rfq.png` and
   `shell-footer-rfq.png` are the only RFQ baselines — the body is not
   photographed, so a body redesign may legitimately move nothing.
10. `node scripts/claims-gate.mjs` PASS; `npx tsc -b` exit 0; `npm run build` exit 0.
11. `git status` shows nothing outside the WRITE_ALLOWLIST.

## THE THINGS THIS PHASE MUST NOT DO (§7 "Do not", §13)

- No Supabase schema or data mutation, no production deploy.
- **No invented NDA, retention period, deletion process, confirmation number or
  security guarantee.** If the system cannot produce a stable reference, say so.
- No security badge, no "verileriniz şifreli" claim, no recipient address that
  `USER_INPUTS.md` does not carry.
- No new dependency.

## GOLDEN PROTOCOL (§12)

`--update-snapshots` is not a way to silence a failure. Adjudicate per viewport
before regenerating: height delta, first changed row, and what explains it.
`reports/qa/phase-08/probe-golden-rebank.mjs` and `probe-golden-shift.mjs` are in
your tree — borrow, do not edit.

## MACHINE

8 GB RAM, **one heavy process at a time**. Playwright: one `--project=` per
invocation, **foreground**, chunked, `> file 2>&1`, never `run_in_background`. A
cold `npm run build` has died with `write ENOMEM` here — build once, then
`PLAYWRIGHT_PREVIEW_ONLY=1` with a free `PLAYWRIGHT_PORT`. Check ports
4173/4187/4190/4191/4199/4205/4207/4209/4211 before use.
`installFontRetry()` flakes at visual-375; known, Phase 12, do not fix.
`scripts/claims-gate.mjs` resolves `REPO_ROOT` from its own location — run it in
place. PowerShell is primary.

## HOW TO NOT LOSE WORK

**Commit after every step.** This run has been interrupted four times: a QA
agent by a process exit, a Coder by a user stop, one agent refused resume, and
the worktrees were pruned between turns. Every agent that committed as it went
lost nothing. Write every measurement into a file or a commit message the moment
you take it.

This is a large packet. If you reach a point where the remaining work is a
distinct second thing — say, the decomposition is done and green but the design
migration is barely started — **commit what is green and say so in
`STATUS: PARTIAL`** rather than pushing on to a half-finished whole. A clean
partial is worth more to me than an unreviewable complete.

## RETURN_FORMAT

Your agent definition's structure, plus:

```text
DECOMPOSITION:  the seams you chose and why · file list with line counts before/after
BUNDLE:         route chunk before/after · what still loads eagerly and why
FORM:           each of the six form-behaviour tasks · what you exercised end to end · what you could not
ERRORS:         the two branded states, measured (radius, font, role) and reached not inferred
DESIGN:         /teklif-al and /cad-dashboard measured against the Wave A/B instrument
GOLDENS:        moved or not, adjudicated
```

Falsify me. In Phase 08 nine premises fell — six of them mine — and the phase was
better for it. If the starting facts above are wrong, show the measurement.
