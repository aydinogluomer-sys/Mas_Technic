# CODER TASK PACKET — PHASE 09b-3 (CLOSING PACKET OF PHASE 09)

PHASE_ID: 09b-3
PHASE_TITLE: The security audit, documented rather than invented — and the hardening this phase owes itself
BASE_COMMIT: to be stated at dispatch (after QA closes 09b-1/09b-2)
WORKTREE: `C:\Users\Trade Bilisim\precision-dynamics-hub-main\pdh-wt\coder-p09a` — **note the path has moved
into the main checkout**; the old `C:\Users\Trade Bilisim\pdh-wt\` no longer exists.

The user has asked for Phase 9 to close as fast as possible. **This packet is scoped to what closes the
phase honestly.** `PARTIAL` is accepted; prefer a clean partial with the audit complete over a full sweep that
does not return.

## ⚠ THE PROHIBITION — ABSOLUTE, AND THIS PACKET IS ABOUT SECURITY, SO IT IS TEMPTING TO BREAK

**No schema change, no migration, no policy change, no bucket change, no auth-setting change, no edge-function
deploy, no row insert, no auth call, no RFQ submit.** `CLAUDE.md` forbids `supabase/` schema changes;
`USER_INPUTS.md` §M sets `ALLOW_PRODUCTION_DEPLOY: NO`; `IMPLEMENTATION.md` §7 says *"Audit Supabase RLS and
public operations **without changing schema** unless explicitly authorized."* Nothing here is authorised.
**Every deployed-state finding is documented for the user, not fixed by you.**

## THE DEPLOYED STATE — read-only, by the Orchestrator, 2026-09-14. You cannot reach it; do not try.

Security advisors on the project:

| finding | level | what it means |
|---|---|---|
| **No `rls_disabled_in_public` finding** | — | every public table has RLS enabled. The important absence. |
| `anon_security_definer_function_executable` ×3 | WARN | `handle_new_user()`, `has_role()`, `is_staff()` are `SECURITY DEFINER` and callable by **`anon`** via `/rest/v1/rpc/…`. `handle_new_user` is normally a trigger; if it can be invoked directly by an unauthenticated caller, that needs the user's attention. |
| `authenticated_security_definer_function_executable` ×3 | WARN | same three, callable by signed-in users |
| `function_search_path_mutable` | WARN | `update_updated_at_column` has a role-mutable `search_path` |
| `auth_leaked_password_protection` | WARN | HaveIBeenPwned check disabled |

Storage buckets:

| bucket | public | size limit | MIME allowlist |
|---|---|---|---|
| **`cad-uploads`** | **false** | **null** | **null** |
| `customer-files` | false | null | null |
| `finance-docs` | false | null | null |
| `avatars` | **true** | null | null |

**Two consequences for copy, and they are yours:**

1. **`cad-uploads` is private.** The criterion *"no public CAD file exposure"* is answered at the deployed
   state, and `cadUpload.ts` never calls `getPublicUrl`/`createSignedUrl`. Say so in the audit; do not say
   more than that.
2. **The bucket enforces no size limit and no MIME allowlist.** `cadUpload.ts:5` sets `CAD_MAX_FILE_SIZE = 50
   MB` and the site publishes it. `USER_INPUTS.md` §J: `MAX_UPLOAD_SIZE:
   DERIVE_FROM_BACKEND_OR_SHOW_NO_UNVERIFIED_LIMIT`. **The backend supplies no limit, so the published 50 MB
   is a client-side number the backend does not enforce.** Determine what the site may honestly say — a
   client-side check is real and may be described as one; a "limit" it is not — and fix the copy. Do not
   touch the validator's behaviour.

## THE IN-REPO AUDIT — read-only where it says so, fix where it says so

`IMPLEMENTATION.md` §7 Security, item by item:

- **Public env vars.** Enumerate every `VITE_*` and every `import.meta.env` read. State which are secrets
  by nature and which are public by design (an anon key is public by design). Fix any that should not ship.
- **Errors do not expose stack traces or secrets.** Audit every `catch` that reaches a reader on a public
  route and every `console.error` in a public path. Fix leaks.
- **Filename / metadata leakage.** `createCadStoragePath` builds
  `anonymous/RFQ-…/<timestamp>-<original filename>`. The original filename reaches the object key. Decide,
  and say why, whether that is leakage worth closing (a filename can carry a customer's part number or
  project name) — and if so, close it **without breaking the admin preview's ability to show the reader
  what they uploaded**.
- **Extension / MIME / content validation.** `validateCadFile` checks extension. State what it does and
  does not check, and harden **client-side only** if reasonable — the packet forbids touching the bucket.
- **Headers.** Established in 09b scoping: **no hosting header configuration exists anywhere** — no
  `vercel.json`, `netlify.toml`, `public/_headers`, `staticwebapp.config.json`, `firebase.json`,
  `.htaccess` — and `index.html` carries no CSP, referrer or content-type meta. **Document that none of CSP,
  referrer-policy, X-Content-Type-Options, Permissions-Policy, frame policy or HSTS is set, and that most
  cannot be set from this repository.** Add only the `<meta>`-expressible subset **if** you can show it does
  not break a deep route — Phase 08 established that adding a hosting config blind breaks every deep route.
  Do not invent a hosting config.
- **Rate limit.** Established: `rfq-rate-limit`'s source has **never been deployed** and the deployed
  function does not match it. Document; do not deploy.
- **The signup enumeration.** 09b-1 found the signup path surfaces the auth server's message verbatim, so
  *"User already registered"* discloses account existence to an unauthenticated visitor, while sign-in stays
  deliberately generic. **Make signup as generic as sign-in.**

## THE HARDENING THIS PHASE OWES ITSELF — from QA rounds 5 (09a) and 1–2 (09b-1)

- **Loader and instrument prose** (`claims-gate.mjs:857-865` and the instrument controls): narrow the
  "no module edge" universal to what QA proved true; make the three non-rule checks fail when guarded by a
  one-line identity test; make the control-count header count what **ran** rather than an array length.
- **Detector (D)'s six holes** — `SENTENCE_BREAK` (`:593`) does not break on `;`, and the report governor
  reaches across a full stop.
- **`e2e/visual/fonts.ts:169`** — the zero-tolerance network assertion, the 4×15 s budget against a 60 s
  timeout, and the absent local fallback. Three QA rounds called this "environmental"; QA round 5 diagnosed
  it as *slow converted into misdiagnosis*. Fix the instrument.
- **`deferred-class-register`'s message** — two one-line fixes QA named: *"in this file"* points at
  `servicePages.ts` while the constant lives in `claims-gate.mjs`; `occurs 2` gets `occurs 0`'s advice.
  **And now that 09b-2 removed the six sites, the register must be retired** — verify the gate is green with
  them gone and delete the entries as the message instructs.
- **`.tl-menu-trigger`** at 2.16–2.20:1 on ten rows, `navigation.css`. QA judged it not an *identification*
  failure. Fix it anyway if the swap is one token; leave it with the reasoning recorded if it is not.

## WRITE_ALLOWLIST

```
src/utils/cadUpload.ts              (ONLY client-side validation hardening and the storage-path decision; NOT the accepted list, NOT the size constant's value)
src/components/rfq/**  src/pages/TeklifAl.tsx   (only what the audit's fixes require)
src/pages/Login.tsx                 (the signup enumeration only)
src/components/auth/**              (only what the signup fix requires)
src/styles/navigation.css           (.tl-menu-trigger only)
scripts/claims-gate.mjs
e2e/visual/fonts.ts
index.html                          (ONLY <meta> security headers, and ONLY with proof deep routes survive)
reports/09b3/security-audit.md      (THE deliverable — findings documented for the user)
reports/09b3/**
e2e/09b3-*.spec.ts                  (NEW specs only)
e2e/__golden__/**                   (baselines your change explains, adjudicated at the DOM)
```

## DO_NOT_TOUCH

```
supabase/**  docs/supabase-full-setup.sql   ← and no network call, no migration, no policy, no bucket, no deploy
src/utils/cadUpload.ts CAD_ACCEPTED_EXTENSIONS and CAD_MAX_FILE_SIZE VALUES
src/content/claims.ts CAD block  src/data/technicalLandingData.ts
src/pages/KVKK.tsx  GizlilikPolitikasi.tsx  CerezPolitikasi.tsx   ← 09b-2 just closed these
src/data/servicePages.ts  src/components/ChatBot.tsx  src/components/ScrollToTop.tsx   ← 09b-2
src/styles/technical-landing.css  e2e/landing/motion-grammar.spec.ts   ← Phase 10 (A23)
/admin/*  /musteri-paneli/*  and their components   ← the avatars bucket being public is THEIRS; document only
every pre-existing spec except e2e/visual/fonts.ts;  scripts/qa-probes/**;  reports/qa/**
PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md  package.json  package-lock.json  .claude/**  tsconfig.json
```

**No new npm package. No hardcoded hex/rgb. No z-index outside `src/styles/z-index.ts`.**

## ACCEPTANCE_CRITERIA

1. `reports/09b3/security-audit.md` exists and documents every item in §7's Security block with a finding,
   a source, and *fixed / documented-for-user / not-applicable* — nothing asserted that was not measured.
2. The 50 MB copy says only what is true.
3. Signup discloses no more than sign-in.
4. No error reaching a reader on a public route carries a stack trace or a secret.
5. The instrument hardening items are done or explicitly deferred with the reason.
6. The deferred-class register is retired and the gate is green without it.
7. `npx tsc -b` exit 0 — **paste the real output**; `npm run build` exit 0; gate PASS.
8. `critical-1280`, `critical-375`, `qa-p09a*`, `qa-09b1*`, `09b2-*`, `shared-shell-accessibility`,
   `design-system-typography` — green, specs unedited except `fonts.ts`.
9. `git status` shows nothing outside the WRITE_ALLOWLIST.

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation, `> file 2>&1`, never
`run_in_background`. **Commit after every step** — seven agents have stopped mid-run in this run and every
time only committed work survived. `PARTIAL` is accepted and, given the user's request, preferred over an
unfinished whole.

## RETURN_FORMAT

```text
AUDIT:       path to security-audit.md, and the one-line verdict per §7 item
SIZE_COPY:   what the site said, what it says now, and why that is true
SIGNUP:      the enumeration closed, demonstrated without a live call
ENV:         every public variable, classified
ERRORS:      every reader-facing catch audited
PATH:        the filename decision and its reasoning
HEADERS:     what is set, what cannot be, and what <meta> you added with the deep-route proof
HARDENING:   each item done or deferred with reason
REGISTER:    retired, gate green
TSC:         the real output and exit code
GOLDENS:     each moved baseline adjudicated at the DOM
UNVERIFIED:  expected non-empty — everything that needs a deployed-state change belongs here
```

Falsify me. The deployed-state table above is the only thing in this packet I measured myself; everything
else is inherited from earlier findings and at least one of those has been wrong in every packet this phase.
