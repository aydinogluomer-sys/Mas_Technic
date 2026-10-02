# Phase 00 — Baseline Index

This directory is the measurable **"before" state** of the MAS TECHNIC autonomous Awwwards run.
It observes and records only. **No `src/**` file, no config, no test and no piece of copy was
changed in Phase 00.** The only non-report edit in this phase is a purely additive section in
`CLAUDE.md`.

## Commit this describes

| Field | Value |
|---|---|
| Base commit | `6ffde20` — *chore(run): initialize PROGRESS.md and reports skeleton* |
| Branch | `wt/coder-p00` (forked from `claude/awwwards-90-overhaul`) |
| Worktree | `C:\Users\Trade Bilisim\pdh-wt\coder-p00` |
| Captured | 2026-08-31 |

## Host / toolchain

| Field | Value |
|---|---|
| OS | Windows 11 Home Single Language 10.0.26200 |
| Shell | Git Bash (POSIX sh) |
| Node | `v26.3.0` |
| npm | `11.16.0` |
| `node_modules` | Windows directory junction → `C:\Users\Trade Bilisim\precision-dynamics-hub-main\node_modules` (**shared**; never mutated) |
| Browser used for captures/probes | `C:\Program Files\Google\Chrome\Application\chrome.exe` (Playwright's bundled revision 1217 is not installed on this host — see `known-blockers.md` B08) |

---

## Files produced

### Reports

| File | What it answers |
|---|---|
| `route-inventory.md` | Every route from `src/App.tsx`: path, component, lazy/eager, protected/public, classification, preview-dev flags, duplicates, orphans, and an evidence-backed nav-reachability audit. |
| `shell-inventory.md` | Every header / navigation / footer / page-shell implementation, which routes consume it, and how many parallel design languages exist. |
| `content-claims-inventory.md` | Every public factual/proof claim, with file:line, verbatim string, claim type, and a `VERIFIED_PUBLIC_OK` / `VERIFIED_BUT_NOT_PUBLIC` / `UNVERIFIED_MUST_REMOVE` / `DEMO_PLACEHOLDER` status cross-checked against `USER_INPUTS.md` §C/§D/§F/§G/§H/§J/§K/§L. |
| `build-test-baseline.md` | `npm ci --dry-run`, `npm ls`, `npm run build`, `npm run lint`, `npx tsc --noEmit`, `playwright test --list`, and the landing e2e run — with exit codes, verbatim warnings and failure root causes. |
| `dependency-baseline.md` | `npm audit` human + JSON summary, high/critical table with fix availability, `three-mesh-bvh` deprecation, `@react-three/*` ↔ `three@0.170` pairing. |
| `bundle-baseline.md` | Every chunk > 100 kB, total initial JS on `/` measured in a real browser, and which specialist bundles (Three/R3F/drei/OCCT/xlsx) do or do not load on the landing. |
| `requirements-traceability.md` | All 739 original requirement IDs mapped to a target phase, generated programmatically, with a machine-checkable coverage assertion block. |
| `known-blockers.md` | 22 pre-existing blockers/risks with file:line evidence, severity and owning phase. |
| `README.md` | This index. |

### Visual baseline — `visual/`

`INDEX.md` (per-file findings + capture conditions), `manifest.json` (machine-readable), and
**11 PNGs, 12.4 MB total** (no capture failed; the 8 MB → JPEG fallback never triggered):

| File | Route | Viewport |
|---|---|---|
| `landing-375.png` | `/` | 375×812 |
| `landing-768.png` | `/` | 768×1024 |
| `landing-1280.png` | `/` | 1280×800 |
| `landing-1440.png` | `/` | 1440×900 |
| `landing-1600.png` | `/` | 1600×900 |
| `hakkimizda-1440.png` | `/hakkimizda` | 1440×900 |
| `iletisim-1440.png` | `/iletisim` | 1440×900 |
| `teklif-al-1440.png` | `/teklif-al` | 1440×900 |
| `blog-1440.png` | `/blog` | 1440×900 |
| `sss-1440.png` | `/sss` | 1440×900 |
| `notfound-1440.png` | `/bu-sayfa-yok-404-baseline` (deliberate 404) | 1440×900 |

### Raw command output — `raw/`

| File | Source |
|---|---|
| `env.txt` | `node -v`, `npm -v` |
| `install.txt` | `npm ci --dry-run` + `npm ls --depth=0` |
| `build.txt` | `npm run build` (cold, no Supabase env) — verbatim, ANSI included |
| `build-clean.txt` | same, ANSI-stripped (used for the chunk tables) |
| `build-with-env.txt` | `npm run build` with Supabase env supplied |
| `lint.txt` | `npm run lint` |
| `tsc.txt` | `npx tsc --noEmit` for all four tsconfig projects |
| `audit.txt` / `audit.json` | `npm audit` / `npm audit --json` |
| `playwright-list.txt` | `npx playwright test --list` (784 tests / 16 files / 8 projects) |
| `playwright-landing.txt` | landing specs on `desktop-1280`, **no** Supabase env → 27 failed |
| `playwright-landing-with-env.txt` | same specs **with** env → 25 passed / 5 skipped / 0 failed |
| `probe-landing.txt` | DOM/console probe of `/` without env (empty `#root`) |
| `probe-landing-with-env.txt` | same with env (mounted; `#hero-shell` still present) |
| `landing-payload.txt` | real-browser network measurement of the landing route |
| `claims-scan.txt` | 1,105 raw claim-pattern hits across public source |
| `capture.txt` | screenshot capture run log |
| `preview-server.txt`, `preview2.txt` | `vite preview` server logs |

### Throwaway tooling — `tools/`

Deliberately placed here, **not** in production `scripts/`, so it can be deleted with the baseline.

| File | Purpose |
|---|---|
| `capture-baseline.mjs` | Builds (optional), starts `npm run preview`, captures the 11 full-page screenshots with reduced-motion emulation + animation freeze + lazy-image forcing, stops the server, writes `visual/manifest.json`. |
| `probe-landing.mjs` | Loads `/` and reports whether the React tree mounted, plus every console/page/request error. Used to find the root cause of the failing e2e specs. |
| `measure-landing-bundle.mjs` | Records every same-origin asset the landing route actually fetches, with on-disk sizes, and checks for specialist-bundle leakage. |
| `scan-claims.mjs` | Grep-style claim scanner over public source, excluding admin/customer surfaces. |
| `gen-traceability.mjs` | Generates `requirements-traceability.md` from the `IMPLEMENTATION.md` §8 range table and proves 1–739 coverage. |
| `build-with-env.sh` | Sources the primary checkout's `.env` into `process.env` (no file written into this worktree) so builds/tests can run the way CI does. Secrets are never echoed or stored. |

---

## Exact command list run in Phase 00

```bash
node -v ; npm -v

npm ci --dry-run                       # exit 0  (real `npm ci` DELIBERATELY substituted — see below)
npm ls --depth=0                       # exit 0

npm run build                          # exit 0, 4m05s (cold, no Supabase env)
npm run lint                           # exit 0, 0 errors / 1 warning
npx tsc --noEmit                       # exit 0  (compiles 0 files — tsconfig.json has files: [])
npx tsc --noEmit -p tsconfig.app.json  # exit 0
npx tsc --noEmit -p tsconfig.e2e.json  # exit 0
npx tsc --noEmit -p tsconfig.node.json # exit 0

npm audit                              # exit 1, 18 vulns
npm audit --json

npx playwright test --list             # exit 0, 784 tests in 16 files

npm run preview -- --port 4173 --strictPort
node reports/baseline/tools/probe-landing.mjs                        # empty #root, Supabase throw
PLAYWRIGHT_REUSE_SERVER=1 PLAYWRIGHT_ARTIFACTS=0 npx playwright test \
  --project=desktop-1280 e2e/technical-landing.spec.ts \
  e2e/landing-flow.spec.ts e2e/section-integrity.spec.ts             # exit 1: 27 failed

bash reports/baseline/tools/build-with-env.sh <env> npm run build    # exit 0, 42.6s
node reports/baseline/tools/probe-landing.mjs                        # mounted
bash reports/baseline/tools/build-with-env.sh <env> npx playwright test \
  --project=desktop-1280 <same three specs>                          # exit 0: 25 passed / 5 skipped

bash reports/baseline/tools/build-with-env.sh <env> \
  node reports/baseline/tools/capture-baseline.mjs --skip-build      # 11/11 captured, 12.4 MB
node reports/baseline/tools/measure-landing-bundle.mjs               # landing payload
curl -s -D - -o /dev/null http://localhost:4173/src/assets/hero-cnc.jpg   # 200 text/html (soft 404)

node reports/baseline/tools/scan-claims.mjs > reports/baseline/raw/claims-scan.txt
node reports/baseline/tools/gen-traceability.mjs                     # UNMAPPED: 0, DUPLICATES: 0

git status --porcelain ; git diff --stat
```

## Two deliberate deviations, recorded rather than hidden

1. **`npm ci` was NOT run.** `node_modules` is a Windows junction into the primary checkout.
   `npm ci` deletes and recreates it, which would have destroyed the primary checkout's install.
   `npm ci --dry-run` (lockfile↔`package.json` sync, exit 0) plus `npm ls --depth=0` (exit 0, no
   unmet/invalid/extraneous) were run instead. Playwright browsers were likewise **not**
   reinstalled.
2. **Two builds and two e2e runs were recorded, not one.** The isolated worktree has no `.env`
   (gitignored, so `git worktree add` never copies it), and without `VITE_SUPABASE_URL` the whole
   React tree fails to mount — which would have made every screenshot and every landing e2e
   result meaningless. Both states are recorded: the env-less state as blocker **B01**, and the
   env-supplied state as the usable design/test baseline. **No `.env` or any other file was
   written outside `reports/baseline/**` and `CLAUDE.md`;** the variables were passed through
   `process.env`, exactly as `.github/workflows/playwright.yml` does with repository secrets.

## Headline numbers

| Measure | Value |
|---|---|
| Routes | 30 `<Route>` declarations · 24 distinct public URL surfaces · 3 preview/dev · 4 admin/customer · 2 protected · 0 eager |
| Parallel public shell languages | 3 (+1 panel) · 2 headers · 3 footers · 3 link taxonomies |
| Build | PASS · 3 chunks > 500 kB · largest 858.06 kB raw |
| Landing initial JS | 777.8 kB raw across 36 chunks |
| Lint | 0 errors / 1 warning |
| Types | 0 errors (but the root `tsc --noEmit` checks nothing, and there is no `typecheck` script) |
| Playwright | 784 tests · 16 files · 8 projects; 504 of 784 combinations test `/legacy-landing` instead of `/` |
| npm audit | 18 total — 0 critical / 15 high / 3 moderate / 0 low |
| Content claims | 1,105 raw pattern hits; 41 catalogued `UNVERIFIED_MUST_REMOVE` rows, 8 `DEMO_PLACEHOLDER`, 2 `VERIFIED_BUT_NOT_PUBLIC` |
| Requirements | 739 / 739 mapped · `UNMAPPED: 0` · `DUPLICATES: 0` |
| Known blockers | 22 (6 × S1, 11 × S2, 5 × S3) |
| Baseline directory size | 14 MB |
