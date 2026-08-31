# Phase 00 — Build / Lint / Type / Test Baseline

**Base commit:** `6ffde20` on `wt/coder-p00`
**Host:** Windows 11 Home Single Language 10.0.26200 · Node `v26.3.0` · npm `11.16.0`
**Raw logs:** `reports/baseline/raw/` (`build.txt`, `build-clean.txt`, `lint.txt`, `tsc.txt`,
`install.txt`, `playwright-list.txt`, `playwright-landing.txt`, `playwright-landing-with-env.txt`,
`probe-landing.txt`, `probe-landing-with-env.txt`)

---

## 0. `npm ci` substitution — read this first

**A real `npm ci` was deliberately NOT run.** `node_modules` in this worktree is a Windows
directory junction pointing at `C:\Users\Trade Bilisim\precision-dynamics-hub-main\node_modules`,
which is the primary checkout's install and is shared. `npm ci` deletes and recreates
`node_modules`, so running it here would have destroyed the primary checkout's dependencies.

The substitute pair was run instead:

| Command | Exit | Result |
|---|---|---|
| `npm ci --dry-run` | **0** | `up to date in 8s` — lockfile and `package.json` are in sync; no install would be needed. |
| `npm ls --depth=0` | **0** | All 80 direct dependencies (61 prod + 19 dev) resolve with **no** `UNMET DEPENDENCY`, `invalid` or `extraneous` markers. |

`npm ci --dry-run` also emitted a policy warning worth recording:

```text
npm warn allow-scripts 3 packages have install scripts not yet covered by allowScripts:
npm warn allow-scripts   @swc/core@1.13.2 (install: (install scripts present))
npm warn allow-scripts   esbuild@0.21.5 (install: (install scripts present))
npm warn allow-scripts   esbuild@0.25.0 (install: (install scripts present))
```

Note the **two coexisting esbuild majors** (0.21.5 via Vite 5, 0.25.0 via something else) — see
`dependency-baseline.md`.

---

## 1. `npm run build`

| Run | Env | Exit | Duration |
|---|---|---|---|
| A (cold, no Supabase env) | none | **0** | **4 m 05 s** |
| B (warm, Supabase env supplied) | `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` | **0** | 42.6 s |

**The build passes.** But run A produces a bundle that **white-screens at runtime** — see §5.

### Warnings captured verbatim

```text
Browserslist: browsers data (caniuse-lite) is 14 months old. Please run:
  npx update-browserslist-db@latest

[plugin:vite:resolve] [plugin vite:resolve] Module "path" has been externalized for browser
  compatibility, imported by ".../node_modules/occt-import-js/dist/occt-import-js.js".
[plugin:vite:resolve] [plugin vite:resolve] Module "crypto" has been externalized for browser
  compatibility, imported by ".../node_modules/occt-import-js/dist/occt-import-js.js".

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
```

`occt-import-js` is an Emscripten build that `require`s Node's `path` and `crypto`. Vite stubs
them; if any code path in the CAD preview actually reaches those calls it will throw at runtime.
Owner: Phase 09 / Phase 12.

### Chunks over the 500 kB warning threshold

| Chunk | Raw | Gzip |
|---|---|---|
| `assets/OBJLoader-DgHxtQC6.js` | **858.06 kB** | 232.24 kB |
| `assets/AdminDashboard-B_o7QpTo.js` | **775.14 kB** | 190.09 kB |
| `assets/xlsx.min-f-rKPqe7.js` | **627.32 kB** | 322.94 kB |

**3 chunks > 500 kB; largest is 858.06 kB raw.** Total emitted files: 179 lines in the Vite
output table. Full chunk analysis in `bundle-baseline.md`.

---

## 2. `npm run lint` (`eslint .`)

**Exit 0.** `1 problem (0 errors, 1 warning)`:

```text
src\components\technical-landing\TechnicalHeader.tsx
  43:18  warning  The ref value 'triggerRef.current' will likely have changed by the time this
                  effect cleanup function runs...  react-hooks/exhaustive-deps
```

**0 errors / 1 warning.** ESLint is effectively green — but see §3 for why that is misleadingly
comfortable.

---

## 3. `npx tsc --noEmit` — and the gap it hides

| Command | Exit | Errors |
|---|---|---|
| `npx tsc --noEmit` (root `tsconfig.json`) | **0** | 0 |
| `npx tsc --noEmit -p tsconfig.app.json` | **0** | 0 |
| `npx tsc --noEmit -p tsconfig.e2e.json` | **0** | 0 |
| `npx tsc --noEmit -p tsconfig.node.json` | **0** | 0 |

**0 type errors — genuinely.** But two structural gaps must be recorded:

1. **`npx tsc --noEmit` at the root checks nothing.** `tsconfig.json` declares
   `"files": []` plus project `references`. Without `--build`/`-b`, `tsc` honours `files: []`
   and compiles **zero** files, exiting 0 unconditionally. The command named in the phase
   contract is therefore a no-op; the meaningful check is `-p tsconfig.app.json`, which was run
   separately above and also passes.
2. **There is no `typecheck` npm script.** `package.json` `scripts` contains
   `dev, build, build:dev, lint, preview, test:e2e, test:e2e:ui, test:e2e:install, assets:sync`.
   No `typecheck`, no `test` (unit), and **no vitest script at all** despite `vitest.config.ts`
   existing at the repo root and referencing `./src/test/setup.ts` — a path that **does not exist**. Vitest is also **not in
   `package.json` dependencies or devDependencies** — the config is orphaned.
   *Not added here.* Recorded as a Phase 01 gap (IDs 133–162).

Type strictness is also very loose (`tsconfig.app.json`): `strict: false`, `noImplicitAny: false`,
`strictNullChecks` unset at app level (`false` at root), `noUnusedLocals: false`,
`noUnusedParameters: false`. "0 type errors" is therefore a weak signal — e.g. the unused
`Footer` import in `src/pages/TeklifAl.tsx:54` passes silently.

---

## 4. Playwright — suite shape

`npx playwright test --list` → **exit 0**.

```text
Total: 784 tests in 16 files
```

### Project matrix (8 Chromium projects, all running the full contract)

| Project | Viewport | isMobile | Tests |
|---|---|---|---|
| `mobile-320` | 320×568 | yes | 98 |
| `mobile-375` | 375×812 | yes | 98 |
| `mobile-390` | 390×844 | yes | 98 |
| `tablet-768` | 768×1024 | yes | 98 |
| `landscape-844` | 844×390 | yes | 98 |
| `desktop-1280` | 1280×800 | no | 98 |
| `desktop-1440-short` | 1440×650 | no | 98 |
| `desktop-1440` | 1440×900 | no | 98 |

**8 projects × 98 tests = 784 combinations.** Four further cross-browser projects
(`firefox-smoke-390/1440`, `webkit-smoke-390/1440`) are gated behind
`PLAYWRIGHT_CROSS_BROWSER=1` and are **not** in the 784.

### Tests per spec (per project)

| Spec | Tests |
|---|---|
| `shared-shell-accessibility.spec.ts` | 16 |
| `technical-landing.spec.ts` | 14 |
| `fullscreen-menu.spec.ts` | 12 |
| `landing-flow.spec.ts` | 12 |
| `process-proof-cinema.spec.ts` | 8 |
| `color-system.spec.ts` | 5 |
| `decision-support.spec.ts` | 5 |
| `footer-reveal.spec.ts` | 5 |
| `landing-motion-polish.spec.ts` | 4 |
| `motion-architecture.spec.ts` | 4 |
| `section-integrity.spec.ts` | 4 |
| `reverse-scroll.spec.ts` | 3 |
| `scroll-snap-regression.spec.ts` | 3 |
| `fullpage-visual-qa.spec.ts` | 1 |
| `malzemeler-sticky.spec.ts` | 1 |
| `material-category-footer.spec.ts` | 1 |

**The full 784-combination suite was NOT run here.** With `workers=1` locally and a measured
~2–4 s per landing test plus ~20 s for specs that traverse the whole page, a serial full run
is well over an hour on this host; the phase contract explicitly permits recording the projected
combination count instead. **Projected: 784 combinations, 16 spec files, 8 projects.** CI runs it
with `workers=2` and `retries=2` under a `timeout-minutes: 30` job cap — see `known-blockers.md`.

## 5. Playwright — landing specs on `desktop-1280`, run twice

Command:

```text
PLAYWRIGHT_REUSE_SERVER=1 PLAYWRIGHT_ARTIFACTS=0 npx playwright test --project=desktop-1280 \
  e2e/technical-landing.spec.ts e2e/landing-flow.spec.ts e2e/section-integrity.spec.ts
```

### Run 1 — build WITHOUT Supabase env vars → 27 failed / 1 passed / 2 skipped (exit 1)

| Spec | Result |
|---|---|
| `technical-landing.spec.ts` | 13 failed, 1 passed (`does not create document-level horizontal overflow`) |
| `landing-flow.spec.ts` | 10 failed, 2 skipped |
| `section-integrity.spec.ts` | 4 failed |

**Root cause — single, and it is not a test defect.** `reports/baseline/raw/probe-landing.txt`:

```text
ROOT_INNERHTML_LENGTH: 0
TECHNICAL_LANDING_ROOT_COUNT: 0
[pageerror] VITE_SUPABASE_URL is not set. Copy .env.example to .env and fill in the Supabase
            values (dashboard → Project Settings → API).
```

`src/integrations/supabase/client.ts` calls `createClient(SUPABASE_URL, …)` at **module scope**,
and `./env` throws when the variable is missing. The throw happens during the initial module
graph evaluation, so `createRoot(...).render(<App/>)` never runs and `#root` stays empty. The
only thing painted is the static `#hero-shell` intro from `index.html`.

**Attribution.** This worktree has no `.env` (it is gitignored, so `git worktree add` does not
copy it). That specific *trigger* is an environment artefact of the isolated worktree — the
primary checkout has a `.env` and CI injects the values from secrets
(`.github/workflows/playwright.yml`). **But the failure mode itself is a real production risk**
and is recorded as such in `known-blockers.md`: a missing/incorrect Supabase env var takes down
100 % of the public marketing site, including routes that never touch Supabase.

### Run 2 — same build WITH `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` → 25 passed / 5 skipped / 0 failed (exit 0)

Env supplied without writing any file into the worktree, via
`reports/baseline/tools/build-with-env.sh` (sources the primary checkout's `.env` into
`process.env`; Vite's `loadEnv` picks up `VITE_`-prefixed process env — exactly what CI does).

| Spec | Passed | Skipped | Failed |
|---|---|---|---|
| `technical-landing.spec.ts` | 13 | 1 | 0 |
| `landing-flow.spec.ts` | 8 | 4 | 0 |
| `section-integrity.spec.ts` | 4 | 0 | 0 |
| **Total** | **25** | **5** | **0** |

Two `landing-flow` tests render in the list reporter as `✘` but **pass**: they are
`test.fail()`-annotated known-blocker recorders
(`landing-flow.spec.ts:43` "records nine physical sections as a known production blocker",
`:53` "records the future section semantics as a known production blocker"). They are green
*because the defect they document still exists*.

Skip reasons (all legitimate project-gating, none suppressing a failure):

| Test | Skip guard |
|---|---|
| `landing-flow.spec.ts:161` | `test.skip(!(await usesNaturalLandingFlow(page)))` — natural-flow profile only |
| `landing-flow.spec.ts:174` | `test.skip(testInfo.project.name !== "mobile-375")` — one canonical mobile axe scan |
| `landing-flow.spec.ts:231` | `test.skip(viewport !== 1440×650)` — short-desktop profile only |
| `landing-flow.spec.ts:255` | `test.skip(!isReducedMotionAuditViewport(page))` — 375×812 / 1440×900 lanes only |
| `technical-landing.spec.ts:274` | `test.skip(!isMobile)` — mobile navigation contract |

### The far more serious finding in these specs

`e2e/helpers.ts:62-67`:

```ts
export async function gotoAndSettle(page: Page, path: string) {
  const resolvedPath = path === "/" ? "/legacy-landing" : path;
  await page.goto(resolvedPath, { waitUntil: "domcontentloaded" });
```

**`landing-flow.spec.ts` and `section-integrity.spec.ts` call `gotoAndSettle(page, "/")` and are
silently redirected to `/legacy-landing`.** Their green results say nothing about the real home
page. Combined with the `.lf-*` selector contracts (`.lf-root`, `.lf-industry-card`,
`.lf-decision-card`, `.lf-marquee`, `[data-lf-reveal]` …) that exist only in `LandingFlow`, these
16 tests × 8 projects = **128 combinations are regression-testing a route no user is sent to**.
Only `technical-landing.spec.ts` (14 × 8 = 112 combinations) actually asserts against `/`.
Owner: Phase 01 (IDs 133–162).

---

## Summary table

| Check | Command | Exit | Result |
|---|---|---|---|
| lockfile sync | `npm ci --dry-run` | 0 | in sync (real `npm ci` deliberately substituted) |
| dependency tree | `npm ls --depth=0` | 0 | clean |
| build | `npm run build` | 0 | PASS · 3 chunks > 500 kB · largest 858.06 kB |
| lint | `npm run lint` | 0 | 0 errors / 1 warning |
| types (root) | `npx tsc --noEmit` | 0 | 0 errors — **but compiles 0 files** |
| types (app) | `npx tsc --noEmit -p tsconfig.app.json` | 0 | 0 errors |
| e2e list | `npx playwright test --list` | 0 | 784 tests / 16 files / 8 projects |
| e2e landing (no env) | `--project=desktop-1280` ×3 specs | 1 | 27 failed / 1 passed / 2 skipped |
| e2e landing (with env) | `--project=desktop-1280` ×3 specs | 0 | 25 passed / 5 skipped / 0 failed |
