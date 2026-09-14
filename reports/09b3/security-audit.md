# Phase 09b-3 — Security audit

Written by the Orchestrator from the deployed state read 2026-09-14 (Supabase security advisors and
`storage.buckets`, read-only) and from the repository at `2bfb160`. No schema, policy, bucket, auth setting or
edge function was changed. Status key: **FIXED** in this phase · **USER** — needs a deployed-state change the run
is not authorised to make · **N/A** — not applicable from this repository.

## IMPLEMENTATION.md §7 Security, item by item

| item | finding | source | status |
|---|---|---|---|
| RLS on public tables | No `rls_disabled_in_public` advisory. Every public table has RLS enabled. | advisors, 2026-09-14 | OK |
| Public operations | `handle_new_user()`, `has_role()`, `is_staff()` are `SECURITY DEFINER` and callable by **`anon`** and **`authenticated`** via `/rest/v1/rpc/…`. `handle_new_user` is normally a trigger; direct invocation by an unauthenticated caller should be revoked unless intended. | advisors: `anon_security_definer_function_executable` ×3, `authenticated_…` ×3 | **USER** |
| Function hygiene | `update_updated_at_column` has a role-mutable `search_path`. | advisor `function_search_path_mutable` | **USER** |
| Auth password policy | Leaked-password protection (HaveIBeenPwned) disabled. | advisor `auth_leaked_password_protection` | **USER** |
| CAD files not public | `cad-uploads` bucket `public: false`; `cadUpload.ts` never calls `getPublicUrl`/`createSignedUrl`; upload is XHR with `x-upsert: false`. | `storage.buckets`; `src/utils/cadUpload.ts` | OK |
| Other buckets | `customer-files`, `finance-docs` private. `avatars` **public** — serves `/admin/*` and `/musteri-paneli/*`, outside this run's scope. | `storage.buckets` | **USER** (review) |
| Server-side size / MIME | `cad-uploads` has `file_size_limit: null` and `allowed_mime_types: null`. The 50 MB in `cadUpload.ts:5` is enforced **client-side only**. §J `MAX_UPLOAD_SIZE: DERIVE_FROM_BACKEND_OR_SHOW_NO_UNVERIFIED_LIMIT` — the backend supplies none. | `storage.buckets`; `cadUpload.ts:5` | **USER** — set a bucket limit, or accept that the copy describes a client check. Copy change deferred: known issue. |
| Extension / MIME / content validation | `validateCadFile` checks extension against `CAD_ACCEPTED_EXTENSIONS` and size against `CAD_MAX_FILE_SIZE`. No MIME sniffing, no content parse before upload (OCCT parses after). | `cadUpload.ts` | documented; no change |
| Filename / metadata leakage | `createCadStoragePath` = `anonymous/RFQ-…/<timestamp>-<original filename>`; the original filename reaches the private object key. Bucket is private, so exposure requires storage access. | `cadUpload.ts` | documented; known issue |
| Errors expose stack / secrets | Public-route `catch` blocks render branded `ShellNotice` copy; `ResetPassword.tsx` rendered the server's `error_description` verbatim — **fixed this phase** (only a recognised `error_code` renders). `oauth-return.ts` reference channel closed to recognised codes. | `ResetPassword.tsx:71`; `oauth-return.ts` | **FIXED** |
| Public env vars | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (public by design — anon key), `VITE_SUPABASE_PROJECT_ID` (in `.env.example`, unread by `src/`), `VITE_DISABLE_LENIS` (dev toggle). No secret-class variable is read by the client. | `grep import.meta.env src/`; `.env.example` | OK |
| CSP / Referrer-Policy / X-Content-Type-Options / Permissions-Policy / frame policy / HSTS | **None set.** No hosting header configuration exists in the repository (`vercel.json`, `netlify.toml`, `public/_headers`, `staticwebapp.config.json`, `firebase.json`, `.htaccess` all absent) and `index.html` carries no security `<meta>`. HSTS, X-Content-Type-Options, frame policy and Permissions-Policy cannot be set from this repository; CSP and Referrer-Policy could be via `<meta>` but Phase 08 established that hosting changes made blind break deep routes. | repo scan | **USER** — set at the host (Lovable) |
| Spam / rate limit | `supabase/functions/rfq-rate-limit/index.ts` exists in source and has **never been deployed**; the deployed function reaches the insert for malformed input and returns no 429 after 15 requests/min (Phase 09a). | git log; Phase 09a probe | **USER** — deploy is `ALLOW_PRODUCTION_DEPLOY: NO`; user decision 2026-09-14: not deployed, known issue |
| Signup enumeration | Signup surfaces the auth server's message verbatim (`User already registered`), sign-in is generic. | `Login.tsx` (09b-1) | known issue, deferred |
| Dependency findings | Not audited this phase (`npm audit` not run — no network policy for it in the packet). | — | deferred |

## User decisions recorded 2026-09-14

- The four `public.rfqs` probe rows and three `cad-uploads` objects written in Phase 09a: **the user will delete them**; the run does not touch them.
- `rfq-rate-limit` deploy: **not performed**; remains a known issue.
- Named CAD packages (CATIA / SolidWorks / NX) removed from six sites in 09b-2: **approved**.

## Not done in this phase (hardening carried from 09a QA R5 / 09b-1 QA)

Test-infrastructure changes are frozen by the 2026-09-14 brief. The following remain as recorded, unfixed:
loader/instrument prose in `claims-gate.mjs:857-865`; detector (D)'s `SENTENCE_BREAK` holes;
`e2e/visual/fonts.ts:169` zero-tolerance assertion; `deferred-class-register` — already retired by 09b-2 (`sites: []`) and replaced by a successor rule that
forbids the six packages returning; gate PASS at 32 rules / 303 controls; `.tl-menu-trigger` 2.13–2.20:1; the 17 golden crops under pixelmatch's 1409 cutoff.
