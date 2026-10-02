# CODER TASK PACKET — PHASE 09b-2

PHASE_ID: 09b-2
PHASE_TITLE: Privacy copy that matches the actual data flow
BASE_COMMIT: `63a7ddc`
WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\coder-p09a`, already on **`wt/coder-p09b2`** at `63a7ddc`, clean,
`.env` present, `node_modules` junctioned.

**A QA agent is running in parallel** on the auth routes and `e2e/`. Your allowlist and its are disjoint by
construction. Do not touch `src/pages/Login.tsx`, `src/pages/ForgotPassword.tsx`,
`src/pages/ResetPassword.tsx`, `src/components/auth/**`, or any spec.

## ⚠ THE PRODUCTION-WRITE PROHIBITION STILL APPLIES

**No RFQ submit, no edge-function invoke, no storage upload, no row insert, no auth call, no deploy.** The
four `public.rfqs` rows and three `cad-uploads` objects are untouched evidence of an unresolved user
decision. Keep the abort guard with the canary proven before any measurement — 09b-1 ran it at `allowed 0`.

## THE AUTHORITY, AND IT DECIDES MORE THAN IT LOOKS

`USER_INPUTS.md` §J and §K, quoted exactly:

```
CAD_RETENTION_PERIOD:            UNKNOWN_REMOVE_IF_UNVERIFIED
CAD_DELETE_REQUEST_PROCESS:      UNKNOWN_REMOVE_IF_UNVERIFIED
NDA_AVAILABLE:                   NO
CONFIDENTIALITY_TEXT_APPROVED:   NO
ANALYTICS_PROVIDER:              NONE      ERROR_MONITORING_PROVIDER: NONE
COOKIE_CONSENT_REQUIRED_BY_CURRENT_SETUP: DERIVE_FROM_ACTUAL_SCRIPTS_AND_LEGAL_REQUIREMENTS
```

`CONFIDENTIALITY_TEXT_APPROVED: NO` settles a class in advance: **the site may not publish a confidentiality
assurance in any wording.** Earlier phases already act on this — `claims.ts:447` records it, `RfqAside.tsx:32`
documents that `/teklif-al`'s silence about encryption is deliberate and must stay, and 09b-1 removed a
security badge for the same reason. Do not reopen any of that; check that nothing has crept back.

`IMPLEMENTATION.md` §7's Privacy block adds: display *verified* confidentiality wording, explain retention
and deletion **if known**, show an NDA path **only if actually available**, align KVKK/privacy copy with the
**actual data flow**, and claim no unverified encryption or security property.

## THE FACTS 09b-1 MEASURED — this packet exists because they are now known

`reports/09b1/third-party-facts.md` on this branch is the evidence. Summarised:

- **hCaptcha loads on page load** (~400–650 ms, no interaction) on `/giris` only. Cookie `__cf_bm` on
  `.hcaptcha.com`, httpOnly/secure/SameSite=None, 29.9 min. **No localStorage or sessionStorage key of its
  own.**
- **`sentry.hcaptcha.com` is a fifth host `/cerez-politikasi` does not name.** `CerezPolitikasi.tsx:85-86`
  lists `js.hcaptcha.com`, `newassets.hcaptcha.com` and two ephemeral `<id>.w.hcaptcha.com` workers, and
  stops. Sentry is contacted **only when the widget fails** — the flaky-network and content-blocker case a
  disclosure exists for. Three further hosts (`accounts.`, `api.`, `pst-issuer.`) appear as *configured*
  destinations in the widget's own options and were **never observed**.
- **`mas-technic-theme` is published with the wrong writer.** `CerezPolitikasi.tsx:167` calls it *"the 3D
  model viewer's light/dark palette"*. Its actual writer is the global `<Toaster>` via `useTheme`, and it is
  written on all three auth routes, which have no 3D viewer.
- **Google Fonts is the first external request on all three auth routes** (34–55 ms), including the two with
  no captcha and no social buttons. A different Google service from OAuth.
- **Supabase is contacted on none of the three at load.**

**Your first job is to decide, and state, whether the site publishes *configured* or *observed* hosts** —
and then be consistent everywhere. Both are defensible; silently mixing them is not.

## THE ITEMS

### 1 — A26. `/gizlilik-politikasi` madde 02's "tek yer"

`GizlilikPolitikasi.tsx:166`: *"Bu, sitede yazdığınız bir metnin dışarı çıktığı **tek yer** olduğu için…"* —
"the only place text you write on this site leaves". **Establish whether that is true**, against the actual
flow: the chatbot to Gemini, the RFQ form and the contact form to Supabase, and anything else you find. A
processor is still a third party. If it is false, the sentence must go or narrow to what is true; a claim
that closes an enumeration is worse than one that omits, which is what Phase 08's D3 turned on.

### 2 — Verify Phase 08's D3 fix still holds

`KVKK.tsx:158-164` now reads *"Aktarım yalnızca aşağıda tek tek sayılan hâllerde olur."* Confirm the
enumeration that follows actually contains the AI transfer, and that no other page still closes a transfer
list that is incomplete. This was a blocking defect once; verify rather than assume.

### 3 — The three disclosure gaps above

The fifth host, the wrong writer, and Google Fonts. Note `mas-technic-theme` is the same shape as Phase 08's
storage-list defect: the gate is green because the key is *listed*, and the sentence about it is wrong.

### 4 — `ChatBot.tsx`'s dead consent filter

`:240` filters the outgoing history against a **string literal** that `:273` no longer produces;
`pendingAiPrompt` is state at `:179`. **Key the filter on state, never on a string literal.** The defect is
currently masked by the legal texts' broad "o ana kadarki yazışma" wording — so narrowing that clause later
would make it false the same day, with no test watching. Add the test.

### 5 — `ScrollToTop.tsx`'s fragment override

`:5` destructures only `pathname` from `useLocation()`; `:19` deps on `[pathname]`. The
`requestAnimationFrame(() => window.scrollTo(0, 0))` overrides the browser's native fragment scroll, measured
in Phase 08 at 2115 px below a 900 px viewport **both** after an SPA click and after a full navigation to a
pasted URL. It breaks the only cross-route hash link in the app, in the privacy affordance. `hash` is one
word away.

### 6 — The six software-inventory sites. **My ruling, open to falsification.**

Live and verified by me: `servicePages.ts:788, 793, 811, 818` (`/hizmetler/fikstur-aparat`) and `:3318,
:3332` (`/endustriyel/ozel-projeler`) name CATIA, SolidWorks and NX as the tools work is *designed in*.

**Ruling: remove the named packages, keep the capability.** §D supplies no software inventory; §0 sets
`DO_NOT_EMPHASIZE_COMPANY_SCALE`; Phase 06 removed named **machine models** under the same authority and
`claims-gate.mjs`'s `named-enterprise-system` rule already cites it for ERP/MES. Tooling names are inventory,
and 3D modelling, tolerance simulation and fixture design are the capability — which is what §1.3 permits and
what a buyer actually needs.

**The falsification I am inviting:** a CAD package name is not exactly a machine model, because it tells a
buyer something operational about file exchange. If you think that survives — say so with the argument, and
note that the *intake* list is already derived from the validator and carries that information honestly. Do
not half-sweep: all six or none, with the reason.

### 7 — A sweep, not a checklist

Nothing may publish a confidentiality assurance, a retention period, a deletion process, an NDA path, or an
unverified encryption/security property. Sweep for it rather than checking these six items and stopping — the
last four packets in this run each found the class wider than it was described.

## WRITE_ALLOWLIST

```
src/pages/KVKK.tsx  src/pages/GizlilikPolitikasi.tsx  src/pages/CerezPolitikasi.tsx
src/components/ChatBot.tsx  src/components/ScrollToTop.tsx
src/data/servicePages.ts            (ONLY the six software-inventory sites)
src/content/claims.ts               (a ledger entry if item 6 or 7 needs one; NOT the CAD block, NOT QUOTE_RESPONSE_TIME)
src/data/chatFaqData.ts             (only if the sweep finds a claim there)
scripts/claims-gate.mjs             (rules for what you remove, with controls both ways)
e2e/09b2-*.spec.ts                  (NEW specs only — the ChatBot and ScrollToTop tests)
e2e/__golden__/**                   (baselines your change explains, each adjudicated at the DOM)
reports/09b2/**
```

## DO_NOT_TOUCH

```
src/pages/Login.tsx  ForgotPassword.tsx  ResetPassword.tsx  src/components/auth/**   ← QA is in these NOW
e2e/*.spec.ts except your new e2e/09b2-*   ← including the new typography gate
src/utils/cadUpload.ts  src/content/claims.ts CAD block  src/data/technicalLandingData.ts
src/styles/technical-landing.css  e2e/landing/motion-grammar.spec.ts   ← Phase 10 (A23)
supabase/**   /admin/*   /musteri-paneli/*
scripts/qa-probes/**  reports/qa/**  reports/09b1/**  reports/09b1c1/**  reports/09b1c2/**
PROGRESS.md  IMPLEMENTATION.md  USER_INPUTS.md  package.json  package-lock.json  .claude/**  tsconfig.json
```

**No new npm package. No hardcoded hex/rgb. No z-index outside `src/styles/z-index.ts`.**

## ACCEPTANCE_CRITERIA

1. Every claim about where data goes is true of the **measured** flow, and you state whether the site
   publishes configured or observed hosts.
2. No sentence closes an enumeration that is incomplete.
3. Nothing publishes a confidentiality assurance, retention period, deletion process, NDA path, or
   unverified security property — swept, not checked.
4. The ChatBot filter is keyed on state and a test fails if it regresses to a literal.
5. A cross-route hash link lands on its target, after an SPA click **and** after a full navigation to a
   pasted URL, with a test.
6. Item 6 resolved all six or none, with the reason recorded in-file.
7. New gate rules for what you removed, each firing on a positive control and silent on the authorised SLA.
8. `npx tsc -b` **exit 0** — paste the real output. `npm run build` exit 0. `node scripts/claims-gate.mjs`
   PASS.
9. Full matrix green, every moved golden adjudicated at the DOM.
10. `git status` shows nothing outside the WRITE_ALLOWLIST.

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation, `> file 2>&1`, never
`run_in_background`. **A QA agent is running in parallel** — if the machine is contended, say so rather than
reporting a slow test as a defect. **Commit after every step**; `PARTIAL` accepted.

## RETURN_FORMAT

```text
HOSTS:        configured or observed, decided and applied consistently
TEK_YER:      whether it is true, measured; what it says now
D3:           Phase 08's fix verified still holding, or not
GAPS:         the fifth host, the wrong writer, Google Fonts
CHATBOT:      the state-keyed filter and its test
SCROLLTOP:    the fragment fix and its test, both entry paths
INVENTORY:    all six or none, and the argument
SWEEP:        what else the class contained beyond the named items
GATE:         rules added, controls both ways
TSC:          the real output and exit code
GOLDENS:      each moved baseline adjudicated at the DOM
UNVERIFIED:   expected non-empty
```

Falsify me — item 6 is a ruling and rulings are the thing most worth attacking. Every packet in this run has
been wrong about at least one premise it asserted as verified.
