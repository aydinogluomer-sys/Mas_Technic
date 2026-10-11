# Inspection story execution — 2026-10-11

Authority: original user-approved `implementation.md`, preserved byte-for-byte beside this file. Requirement/phase/finding state is canonical in `execution.json`; these are derived records, not replacement criteria.

## Active scope

- 12 body bands 02–13 in their original order, NEXUS at 11; header 01/footer 14.
- Existing public families and buyer flows; no database, RLS, private portal, auth, submission or upload-parser mutation.
- Preserve the original working tree, whose temporary Git index matched remote candidate tree `9446e5f18719e24fa1c066e50eb527752bef5924` without changing the real index.
- App baseline is the native v6 build from merge commit `5c2289b7a3f52dc38b5b8ea5a6fb35a8638d4c8f`, not the older local `dist`. GitHub comparison with candidate `4047…` reports no changed files.
- Writer for P00 tests/source identity: root. Writer for P01 preparation: art-direction unit, docs-only. Independent frontend/performance review: QA, read-only. A fresh release reviewer is required later.

## Verification strategy

The unchanged paired harness runs on frozen v6 source and candidate at 320/390/768/1440, retaining actual-motion video, trace, all 12 bands, all five NEXUS documents, 16 public family frames, route/asset identity and cold lab performance. Existing CI/typecheck/lint/critical/interop/regression oracles stay in force. Browser binaries are unavailable locally; current Chromium execution uses the existing GitHub Actions environment. Linux goldens are absent and are not counted as passing.

`npm run typecheck` passed before application changes. The existing exact-baseline CI build passed at run `38137555970`; new evidence tests are not yet executed. Running route-table.ts directly failed on Node alias resolution; rerunning through the existing `scripts/lib/route-table.mjs` loader produced the authoritative route classes. No test oracle or runtime source was changed to hide that error.

## Hard blockers

Gogade (A-02/REQ-005): actual licensed font file, web embedding permission and glyph evidence are missing. Matching hero geometry/materials (A-03/A-04/REQ-007) and metrology scene (A-06) are missing. These whole acceptance gates remain blocked; only subunits independent of those assets may progress. A photographed poster, schematic or unlicensed lookalike is never reported as the requested font or live part geometry.

## Phase closure

No phase is verified yet. Moderate phases require the implementation evidence and independent acceptance key. A repeat finding twice requires root-cause classification; a third blind equivalent patch is forbidden. Source identities and dependent tests are refreshed after shared changes. Publication and a 7.0+ aesthetic claim are not derived from green technical tests.
