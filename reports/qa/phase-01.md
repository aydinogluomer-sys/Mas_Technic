# QA Report — Phase 01

- PHASE: 01
- PHASE_TITLE: Repository truth, CI recovery, legacy landing cleanup
- CODE_COMMIT: `9392efb` (Coder commits `038af33` + `9392efb`), base for diff `076c16a`
- QA_WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\qa-p01` on `wt/qa-p01`
- QA_COMMIT: see `git log` on `wt/qa-p01` (this file's commit)
- STATUS: **PASS**
- TESTS_PASSED: 77
- TESTS_FAILED: 0
- TESTS_SKIPPED: 2 (both pre-existing viewport-lane guards, each runs in the complementary project)
- NEW_TESTS_ADDED: 0 Playwright specs (4 QA-owned read-only probe scripts under `reports/qa/tools/`)

> Every result below is a measurement made by QA in this worktree. The Coder's
> report was read only to know which numbers to re-derive; it is never cited as
> evidence.

## Acceptance criteria matrix

| Criterion | Result | Evidence |
|---|---|---|
| AC1 dev-only routes absent from production, present in dev | **PASS** | §AC1 — `grep dist/` empty; 3/3 routes render 404 under preview; 3/3 render fully under dev |
| AC2 no active homepage test depends on `.lf-*`; `/` rewrite gone | **PASS** | §AC2 — rewrite deleted; only 2 negative `.lf-root` assertions remain; 7/7 anchors verified against live DOM |
| AC3 `#hero-shell` provably removed on `/` incl. fallback timeout | **PASS** | §AC3 — 2830 ms normal, 68 ms reduced-motion, **7040 ms with `mas:intro-done` suppressed** |
| AC4 single, real, resolving LCP image preload | **PASS** | §AC4 — exactly 1 `as=image`; `curl -sI` → 200 `image/webp`; href == rendered `img[src]` |
| AC5 typecheck/lint/build pass; typecheck covers non-zero files | **PASS** | §AC5 — all exit 0; bare `tsc` = 0 files, project configs = 267 + 25 |
| AC6 critical Chromium suite against real `/` | **PASS** | §AC6 — 60 passed, 2 lane-skipped, 0 failed (5.5 m) |
| AC7 WebKit + Firefox smoke | **PASS** | §AC7 — 12/12 passed (1.5 m) |
| AC8 golden screenshot genuinely diffs (negative control) | **PASS** | §AC8 — clean run 3/3 pass with baselines byte-unchanged; perturbed build → **13 015 px / 27 758 px diff, FAILED** |
| AC9 CI job graph + combination arithmetic | **PASS** | §AC9 — valid YAML, 6 jobs; 62+12+3+536 = 613 = measured total; a11y/reduced-motion inside blocking gate |
| AC10 no skips/weakening/tolerance allow-list in production suite | **PASS** | §AC10 — 177→205 test blocks, 562→629 assertions, 57→**56** skips; allow-lists only under `e2e/legacy/` |
| S1 shell-contract reduction is re-pointing at truth | **PASS** | §S1 — `{ route: "/", header: 0 }` is an executed `toHaveCount` assertion; both contract tests pass |
| S2 legacy relocation genuinely legacy | **PASS** | §S2 — all 9 specs drive only `/legacy-landing`; test/assert counts identical across the move |
| S3 ErrorBoundary fallback at runtime | **PASS (proven, not UNPROVEN)** | §S3 — branded fallback renders on 4/4 routes in a broken-env scratch build; no white screen |
| S4 claimed numbers re-derived | **PASS with 2 minor discrepancies** | §S4 + §Discrepancies |

---

## §AC1 — No production-public legacy/test/technical-preview route

**Build:** `npm run build` → exit 0, `✓ built in 44.52s`.

**dist grep:**

```text
$ grep -ril "legacy-landing\|LandingFlow\|TestHowWeWork\|TechnicalPreview" dist/
GREP_EXIT=1        # no output, no match
```

**Production preview (`vite preview`, port 4173), real Chromium
(`C:\Program Files\Google\Chrome\Application\chrome.exe` — the B08 fallback),
2.5 s settle per route** — `reports/qa/tools/phase-01-runtime-probe.mjs`:

| route | 404 body text | `technical-landing-root` | `.lf-root` |
|---|---|---|---|
| `/technical-preview` | yes | absent | absent |
| `/legacy-landing` | yes | absent | absent |
| `/test` | yes | absent | absent |

HTTP status is 200 for all three because `vite preview` serves the SPA fallback
document; the *rendered route* is the 404 page, which is the contract, and
`e2e/landing/dev-routes.spec.ts` asserts the `ERR::PAGE_NOT_FOUND` signature
plus a recovery link.

**Dev server (`vite --port 8099`)** — `reports/qa/tools/phase-01-dev-routes-probe.mjs`:

| route | renders | first heading | page errors |
|---|---|---|---|
| `/technical-preview` | `technical-landing-root` present, 3611 chars | `HAM GEOMETRİDEN…` | none |
| `/legacy-landing` | `.lf-root` + `landing-version-root` + `#top` present, 5693 chars | `MASTECHNIC` | none |
| `/test` | isolation page, 1602 chars | `HowWeWork izolasyon testi` | none |

All three remain fully available to developers. **AC1 PASS.**

Mechanism verified in source, not assumed: `src/App.tsx` gates
`const DevRoute = import.meta.env.DEV ? lazy(() => import("./routes/DevRoutes")) : null;`
and each `<Route>` is `{DevRoute && …}`, so Rollup drops the dynamic import and
the whole `LandingFlow` / `TestHowWeWork` / `TechnicalPreview` tree from `dist/`.

---

## §AC2 — No active homepage test depends on `.lf-*`; no `/` → `/legacy-landing` rewrite

`e2e/helpers.ts` — `gotoAndSettle` now navigates to `path` verbatim; the
`const resolvedPath = path === "/" ? "/legacy-landing" : path;` line is deleted
(`git diff 076c16a 9392efb -- e2e/helpers.ts`).

`.lf-*` grep over the active suite (`e2e/*.spec.ts`, `e2e/landing/`,
`e2e/smoke/`, `e2e/visual/`, `e2e/helpers.ts`) returns exactly two hits, both
**negative**:

```text
e2e/landing/dev-routes.spec.ts:26:      await expect(page.locator(".lf-root")).toHaveCount(0);
e2e/landing/landing-structure.spec.ts:34:    await expect(page.locator(".lf-root")).toHaveCount(0);
```

`e2e/legacy/**` retains positive `.lf-*` usage, which is correct — those specs
drive `/legacy-landing` and are outside every gate.

**`LANDING_SCENE_IDS` verified against the live DOM, not against the list.**
Runtime probe on `/` (preview build, 9 s settle):

```json
"anchorPresence":  { "surec":1,"nexus":1,"projeler":1,"sektorler":1,
                     "kalite":1,"sss":1,"iletisim":1 }
"legacyIdsPresent":{ "top":0,"hizmetler":0,"endustriler":0,"malzemeler":0,
                     "neden-biz":0,"kabiliyetler":0,"referanslar":0 }
"lfClassElements": 0
"headerHashes":    ["surec","sektorler","projeler","nexus","kalite","iletisim"]
"sectionIdsInMain": [... surec, nexus, projeler, sektorler, kalite, sss, iletisim ...]
```

All seven declared IDs exist exactly once on the real `/`; all nine stale IDs
from the old list are absent; zero `.lf-*`-classed elements exist on `/`.
`#sss` is reached from the footer rather than the header nav, matching the
documented intent in `e2e/helpers.ts`. **AC2 PASS.**

---

## §AC3 — `#hero-shell` provably removed on `/`

Measured in real Chromium against `vite preview`, three independent contexts.

| scenario | shell at `load` | `data-intro` on shell | teardown at | shell `=== null` after +3 s | `data-intro-active` after |
|---|---|---|---|---|---|
| normal motion | present | yes | **2830 ms** | true | false |
| `prefers-reduced-motion: reduce` | already absent | n/a | **68 ms** | true | false |
| `mas:intro-done` suppressed | present | yes | **7040 ms** | true | false |

The third row is the fallback-timeout proof: `EventTarget.prototype.dispatchEvent`
was patched in an init script to swallow every `mas:intro-done`. The counter
`suppressed: 1` confirms exactly one dispatch was intercepted — i.e. the event
genuinely never reached a listener. The shell was still in the DOM at t+4 s and
was removed at **7040 ms**, within one polling tick of
`HERO_SHELL_TEARDOWN_FALLBACK_MS = 7000` (`src/lib/hero-shell.ts`). The timeout
path fires; the user is never locked out.

Independently corroborated by `e2e/landing/landing-structure.spec.ts` "hands the
intro shell off and leaves no stale intro state" and
`e2e/landing/landing-reduced-motion.spec.ts`, both green in the critical gate at
1280 and 375. **AC3 PASS.**

---

## §AC4 — The real hero asset is the only LCP preload target

Served `dist/index.html` line 283 contains exactly **one** `rel=preload as=image`:

```html
<link rel="preload" as="image" type="image/webp"
      href="/assets/hero-manifold-v1-DjyYu6ON.webp" fetchpriority="high">
```

The only other `rel="preload"` in the document is the Google Fonts stylesheet
(`as="style"`, line 269) — not an image preload. Four `rel="modulepreload"`
entries are JS chunks. The old `/src/assets/hero-cnc.jpg` line (which resolved
to `text/html` via the SPA fallback) is gone from `index.html`.

```text
$ curl -sI http://localhost:4173/assets/hero-manifold-v1-DjyYu6ON.webp
HTTP/1.1 200 OK
Content-Type: image/webp
Content-Length: 64074
```

Runtime equality with what the hero actually renders:

```json
"imagePreloadCount": 1,
"imagePreloadHref":  "/assets/hero-manifold-v1-DjyYu6ON.webp",
"heroImgSrc":        "/assets/hero-manifold-v1-DjyYu6ON.webp",
"heroImgCurrentSrc": "http://localhost:4173/assets/hero-manifold-v1-DjyYu6ON.webp",
"heroImgComplete": true, "heroImgNaturalWidth": 1672,
"failedRequests": []
```

No preload returns `text/html` or 404; **no response on `/` had status ≥ 400**.
The `mas-hero-preload` Vite plugin throws the build if the hashed asset is not
found in the bundle, so a stale preload cannot ship silently. **AC4 PASS.**

---

## §AC5 — typecheck / lint / build, and non-zero typecheck coverage

| command | exit | note |
|---|---|---|
| `npm run typecheck` | **0** | `tsc -p tsconfig.app.json && -p tsconfig.node.json && -p tsconfig.e2e.json` |
| `npm run lint` | **0** | `1 problem (0 errors, 1 warning)` — pre-existing `react-hooks/exhaustive-deps` warning at `src/components/technical-landing/TechnicalHeader.tsx:43` |
| `npm run build` | **0** | 44.52 s (warm) |

**B09 re-verified independently by QA:**

```text
$ npx tsc --noEmit --listFiles          # bare, root config
(0 lines of output)                     # root tsconfig.json declares "files": []
```

versus the script's project configs:

```text
$ npx tsc --noEmit --listFiles -p tsconfig.app.json | grep -v node_modules | wc -l
267
$ npx tsc --noEmit --listFiles -p tsconfig.e2e.json | grep -c /e2e/
25
```

The bare invocation checks nothing; `npm run typecheck` checks 267 + 25 real
files. **AC5 PASS.**

---

## §AC6 — Critical Playwright suite against the real `/`

```text
$ PLAYWRIGHT_PREVIEW_ONLY=1 PLAYWRIGHT_REUSE_SERVER=1 npm run test:e2e:critical
Running 62 tests using 1 worker
  ...
  2 skipped
  60 passed (5.5m)
```

The two skips are pre-existing viewport-lane guards, and **each runs in the
complementary project**, so neither is a coverage hole:

- `technical-landing.spec.ts:274 mobile menu traps focus and closes with Escape`
  — skipped on `critical-1280` (`test.skip(!isMobile)`), **passed** on `critical-375`.
- `technical-landing.spec.ts:136 keeps reference proportions …`
  — skipped on `critical-375` (`test.skip(width < 1180)`), **passed** on `critical-1280`.

Every `landing/**` spec ran against the real `/` (no rewrite). **AC6 PASS.**

---

## §AC7 — WebKit and Firefox smoke

```text
$ PLAYWRIGHT_PREVIEW_ONLY=1 PLAYWRIGHT_REUSE_SERVER=1 npm run test:e2e:smoke
Running 12 tests using 1 worker
  12 passed (1.5m)
```

3 tests × 4 projects (`smoke-firefox-390/1440`, `smoke-webkit-390/1440`), all
green: complete landing render + intro-shell hand-off, shared-shell inner page,
and the `/teklif-al` conversion route. **AC7 PASS.**

---

## §AC8 — The golden screenshot test genuinely diffs

**Positive run** (clean production preview):

```text
$ PLAYWRIGHT_PREVIEW_ONLY=1 PLAYWRIGHT_REUSE_SERVER=1 npm run test:e2e:visual
  ✓ [visual-375]  matches the committed landing baseline (4.6s)
  ✓ [visual-1280] matches the committed landing baseline (6.4s)
  ✓ [visual-1440] matches the committed landing baseline (6.0s)
  3 passed (23.9s)
```

**It compared rather than re-captured** — `git status --porcelain` immediately
after the run showed the three committed baselines
(`e2e/__golden__/win32/visual-{375,1280,1440}/landing-fullpage.png`)
**byte-unchanged**, i.e. no silent `--update-snapshots` behaviour.

**Negative control (QA-designed, production files untouched).** `dist/` was
copied to the gitignored `dist-ssr/`, a single visible perturbation was injected
into the copied HTML only —

```html
<style id="QA_NEGATIVE_CONTROL">.tl-hero-copy p{background:#ff0000 !important;}</style>
```

— served on port 4174, and the *unmodified* spec and the *committed* baselines
were run against it via `PLAYWRIGHT_BASE_URL`:

```text
$ PLAYWRIGHT_BASE_URL=http://localhost:4174 npx playwright test --project=visual-1280 --project=visual-375
  ✘ [visual-375]  … 13015 pixels (ratio 0.01 of all image pixels) are different.
  ✘ [visual-1280] … 27758 pixels (ratio 0.01 of all image pixels) are different.
  2 failed
```

Both failures are 65×–139× the configured absolute budget
(`maxDiffPixels: 200`). The gate catches a real visual change. `dist-ssr/`,
`test-results/` and `playwright-report/` were removed afterwards and
`git status --porcelain` shows no residue. **AC8 PASS.**

Note the budget is deliberately **absolute** (`maxDiffPixels: 200`), not the
proportional `maxDiffPixelRatio` it replaced — a ratio of 0.002 on a
1280×3844 page would have been a ~9 840-pixel budget, i.e. wide enough to hide
the injected rectangle. Tightening, not loosening.

---

## §AC9 — CI workflow structure and combination arithmetic

`.github/workflows/playwright.yml` parses as valid YAML (parsed with the `yaml`
package, not by eye). Job graph as measured:

| job | needs | timeout-min | if | steps |
|---|---|---|---|---|
| `quality` | — | 15 | — | 5 |
| `build` | — | 25 | — | 6 |
| `e2e-critical` | `build` | 20 | — | 10 |
| `e2e-smoke` | `build` | 20 | — | 9 |
| `e2e-regression` | `build` | 120 | `github.event_name == 'workflow_dispatch'` | 9 |
| `visual` | `build` | 20 | — | 9 |

Triggers: `push`/`pull_request` on `main` + `workflow_dispatch`.

**Combination counts re-measured by QA with `--list`:**

| gate | Coder claim | QA measurement | selection |
|---|---|---|---|
| critical | 62 | **62** in 6 files | `--project=critical-1280 --project=critical-375` |
| smoke | 12 | **12** in 1 file | four `smoke-*` projects |
| visual | 3 | **3** in 1 file | three `visual-*` projects |
| regression (dispatch-only) | 536 | **536** in 12 files | eight regression viewport projects |
| **total** | 613 | **613 tests in 14 files** | `npx playwright test --list` |

**Arithmetic checked by QA: 62 + 12 + 3 + 536 = 613**, equal to the measured
grand total. The four families partition the suite with no double count, and
`e2e/legacy/**` contributes 0 because `legacyProjects` is empty unless
`PLAYWRIGHT_LEGACY=1`.

**Reduced-motion and axe are inside the blocking critical gate** — read from the
critical `--list` output, not from a comment:

```text
[critical-1280] landing/landing-accessibility.spec.ts:20 › has no serious or critical axe violations on the whole document
[critical-1280] landing/landing-accessibility.spec.ts:32 › exposes one landmark set and a working skip link target
[critical-1280] landing/landing-accessibility.spec.ts:43 › keeps heading order legible: exactly one h1 and no skipped level
[critical-1280] landing/landing-reduced-motion.spec.ts:14 › renders a complete, static landing and removes the intro shell at once
[critical-1280] landing/landing-reduced-motion.spec.ts:31 › keeps every band measurable — nothing collapses to zero height
[critical-1280] technical-landing.spec.ts:268 › has no serious or critical accessibility violations
[critical-1280] technical-landing.spec.ts:284 › reduced motion keeps the complete page visible without active animation
```

(identical set for `critical-375` → 14 reduced-motion/a11y combinations inside
the blocking gate). Nothing was dropped.

**Timeout feasibility, from my own wall-clock measurements** (local, 1 worker;
CI uses `workers: 2`):

| job | measured local time | CI budget | headroom |
|---|---|---|---|
| build | 44.5 s warm (4 m 05 s cold, per Phase 00 baseline) | 25 min | ample |
| e2e-critical (62) | 5.5 min @1w → ~2.8 min @2w | 20 min | ample |
| e2e-smoke (12) | 1.5 min @1w | 20 min | ample |
| visual (3) | 24 s @1w | 20 min | ample |
| e2e-regression (536) | ~5.3 s/test → ~47 min @1w → ~24 min @2w | 120 min | ample |

`dist/` is built once and shared as an artifact; test jobs run with
`PLAYWRIGHT_PREVIEW_ONLY=1` so no job rebuilds. The structure completes within
its timeouts. **AC9 PASS.**

The `visual` job's `Guard platform baselines` step is an honest, non-green-faking
gap declaration: only `win32` baselines exist, so on ubuntu it emits
`::warning title=VISUAL-BASELINE-GAP-LINUX`, writes a step summary, and skips the
visual suite rather than letting CI author its own baseline. Recorded here as a
carried-forward known gap (`VISUAL-BASELINE-GAP-LINUX`), not a Phase 01 failure —
the golden gate is proven to work on the platform where baselines exist.

---

## §AC10 — Nothing skipped, deleted or weakened to obtain green

Whole-suite accounting, `076c16a` → `9392efb`, produced by
`reports/qa/tools/phase-01-coverage-diff.mjs` (counts `test(`/`test.describe(`
blocks, `expect(`/`expect.poll(` calls, and `test.skip/fixme/fail/only`):

| | baseline `076c16a` | head `9392efb` | delta |
|---|---|---|---|
| test blocks | 177 | **205** | **+28** |
| assertions | 562 | **629** | **+67** |
| skips | 57 | **56** | **−1** |

All nine relocated legacy specs are **identical** in test count, assertion count
and skip count across the move (`color-system 11/16/4 → 11/16/4`,
`decision-support 11/24/3`, `fullpage-visual-qa 2/3/0`, `landing-flow 27/57/12`,
`landing-motion-polish 8/29/3`, `motion-architecture 8/30/2`,
`process-proof-cinema 16/44/6`, `reverse-scroll 6/6/3`, `section-integrity 6/21/0`).

**Every removal accounted for:**

| removal | where | replacement / justification |
|---|---|---|
| `footer-reveal.spec.ts` 22→20 assertions | `/` dropped from `ROUTES`; two `landing-version-root` probes removed | `/` prints `.tl-footer`, not the shared footer. Landing footer reachability now asserted in `e2e/landing/landing-structure.spec.ts` "an End-key journey reaches the landing footer legal links" (focus + `expectLocatorUnobscured` on KVKK and Gizlilik Politikası links) |
| `scroll-snap-regression.spec.ts` 3→2 blocks, 1→0 skips | `/` dropped from `MOBILE_ROUTES`; `test.skip(!usesNaturalLandingFlow(page))` removed | Same replacement as above. Removing a conditional skip **strengthens** the gate |
| `helpers.ts` 17→12 assertions | `hydrateLanding`, `usesNaturalLandingFlow`, `expectsNaturalLandingFlow`, `assertLovableAuthWasNotCaptured` moved out | All four relocated verbatim into `e2e/legacy/legacy-helpers.ts` and still invoked by `e2e/legacy/fullpage-visual-qa.spec.ts:20` etc. Nothing deleted |
| `vitest.config.ts` deleted | repo root | Dead config: no `vitest` dependency in `package.json`, no `vitest` in `node_modules`, no `src/test/setup.ts` (absent at `076c16a` too), and zero `*.test.ts(x)` files anywhere. Zero coverage removed |
| `shared-shell-accessibility.spec.ts` | 119→**122** assertions | Net **gain** of 3 (the dev-route guard assertions) |

**No tolerance allow-list entered the production suite.** Both legacy
allow-lists live **only** under `e2e/legacy/`:

```text
e2e/legacy/landing-flow.spec.ts:14: const KNOWN_V1_SEMANTIC_VIOLATIONS = [   # 36 entries
e2e/legacy/landing-flow.spec.ts:27: const KNOWN_MOBILE_CONTRAST_TARGETS = [  # 7 entries
```

The only occurrences elsewhere are the two comment lines at
`e2e/landing/landing-accessibility.spec.ts:9-10` explaining that the new suite
inherits neither. That suite asserts unconditionally:

```ts
expect(blocking).toEqual([]);   // serious + critical axe violations, no allow-list
```

**No `.only`, no `xfail`, no `xit`, no `xdescribe` anywhere in `e2e/`**
(`grep -rn "\.only(" e2e/` and `grep -rn "xfail\|xit(\|xdescribe" e2e/` both
exit 1). **AC10 PASS.**

---

## §S1 — The shell-contract reduction (90→88 / 95→94)

Verified as **re-pointing at truth, not coverage loss**.

- `/` moved out of `STATIC_FULL_SHELL_ROUTES` into `OWN_SHELL_ROUTES` and is
  still counted in the 94-path total
  (`new Set([...FULL_SHELL_ROUTES, ...OWN_SHELL_ROUTES, "/teklif-al", "/giris",
  "/sifremi-unuttum", "/reset-password", "/cad-dashboard"]).size === 94`).
- `/test` left the full-shell list because it is dev-only — and it is **not**
  silently dropped. Three positive assertions were added in its place:
  `expect([...APP_DEV_ROUTE_PATTERNS].sort()).toEqual([...EXPECTED_DEV_ROUTE_PATTERNS].sort())`,
  a per-pattern `toContain('{DevRoute && <Route path="…"')`, and a regex on
  `import.meta.env.DEV ? lazy(() => import("./routes/DevRoutes")) : null`.
  Arithmetic is consistent: 90 − 2 = 88, 95 − 1 = 94.
- **The `/` exception is a real, executed assertion.** In
  `e2e/shared-shell-accessibility.spec.ts` "keeps declared public and panel shell
  exceptions explicit", the entry `{ route: "/", finalPaths: ["/"], header: 0,
  footer: 1 }` is consumed by the loop body

  ```ts
  await expect(page.locator("[data-fullscreen-header]"), expectation.route)
    .toHaveCount(expectation.header);
  await expect(page.getByRole("contentinfo"), expectation.route)
    .toHaveCount(expectation.footer);
  ```

  When Phase 03 mounts the global header on `/`, that locator resolves to 1 and
  `toHaveCount(0)` fails. This is a genuine tripwire, not a comment.
- Corroborated against the live DOM: my probe measured `fullscreenHeaderCount: 0`
  and `contentinfoCount: 1` on `/` today — the assertion matches reality now and
  will genuinely flip later.
- Both contract tests executed and pass:

  ```text
  $ npx playwright test --project=desktop-1280 -g "exhaustive 94-path public route|shell exceptions explicit"
    ✓ derives an exhaustive 94-path public route and shell ownership contract (24ms)
    ✓ keeps declared public and panel shell exceptions explicit (8.3s)
    2 passed (11.2s)
  ```

**S1 PASS.**

---

## §S2 — Legacy relocation

**All nine relocated specs genuinely test `/legacy-landing`.** Every navigation
in `e2e/legacy/*.spec.ts` goes through `LEGACY_LANDING_PATH = "/legacy-landing"`
(`e2e/legacy/legacy-helpers.ts`); grep found **zero** `page.goto("/")` or
`gotoAndSettle(page, "/")` in the folder. None is a production test parked out
of the way. Their contracts are `.lf-*` classes, `#hizmetler`/`#endustriler`
anchors and `data-lf-reveal` — none of which exist on `/` (measured: 0 `.lf-*`
elements, 0/7 legacy anchors).

Claimed production replacements verified to assert equivalent ground:

| retired legacy spec | production replacement | equivalent ground asserted |
|---|---|---|
| `landing-flow` (anchors, sections, axe) | `landing/landing-anchors.spec.ts` + `landing/landing-accessibility.spec.ts` | anchors bidirectionally (header hash → DOM, DOM → in-viewport), axe with **no** allow-list |
| `section-integrity` | `landing/landing-structure.spec.ts` + `technical-landing.spec.ts` | 14 numbered bands in order, one `main#main-content`, one `contentinfo`, no competing landing tree |
| `fullpage-visual-qa` (captured only, compared nothing) | `visual/landing-golden.spec.ts` | real `toHaveScreenshot` diff — a strict upgrade (see §AC8) |
| `motion-architecture`, `landing-motion-polish`, `process-proof-cinema`, `reverse-scroll` (reduced motion, pins) | `landing/landing-reduced-motion.spec.ts` + `technical-landing.spec.ts:284` + the golden spec's `["false:none","false:none"]` reverse-scroll assertion | reduced-motion completeness, no zero-height bands, reverse-scroll layers provably disabled |
| `color-system` (opaque surfaces, contrast) | partially — `landing/landing-accessibility.spec.ts` axe scan covers contrast; the per-surface opacity sweep has **no direct equivalent** | see below |
| `decision-support` | **none** | correct — see below |

**Coverage retired without replacement — audited, both are legitimate:**

1. `decision-support.spec.ts`. Traced the component: `DecisionSupport` is
   declared at `src/components/landing/RestoredLandingSections.tsx:121`, and its
   **only** consumer in the entire tree is `src/components/LandingFlow.tsx:551`.
   `LandingFlow` is imported only by `src/pages/LegacyLanding.tsx:4`, which is
   reachable only through `src/routes/DevRoutes.tsx` behind
   `import.meta.env.DEV`. `grep -ril "LandingFlow" dist/` returns nothing. The
   component has **no production surface**, so it has nothing to replace. The
   Coder's admission is accurate.
2. `color-system.spec.ts`'s per-`.lf-*`-surface opacity sweep is likewise bound
   to selectors that do not exist on `/`. The `/` equivalent (opaque surfaces,
   contrast) is covered by the axe scan; a `.tl-*` surface sweep would be new
   work, not a restoration. Flagged as a **carried-forward opportunity**, not a
   Phase 01 defect.

**S2 PASS.**

---

## §S3 — ErrorBoundary fallback exercised at runtime (the Coder left this static)

The Coder verified only statically that no import chain from `src/main.tsx`
reaches `src/integrations/supabase/env.ts`. QA exercised the fallback.

Method — **the real `.env` was never touched**: a scratch production build was
emitted to the gitignored `dist-ssr/` with `VITE_SUPABASE_URL=` (empty), and the
throw was confirmed to survive into the bundle before probing:

```text
$ VITE_SUPABASE_URL= npx vite build --outDir dist-ssr      # exit 0
$ grep -rl "is not set. Copy .env.example" dist-ssr/assets/
dist-ssr/assets/client-D7LUYh0c.js                          # module-scope throw is present
$ grep -o 'VITE_SUPABASE_URL",""' dist-ssr/assets/client-*.js
VITE_SUPABASE_URL",""                                       # empty value baked in
```

Then served on port 4175 and probed with
`reports/qa/tools/phase-01-error-boundary-probe.mjs`:

| route | branded fallback rendered | heading | recovery link | white screen | root text length |
|---|---|---|---|---|---|
| `/teklif-al` | **true** | "Sayfa şu anda yüklenemedi." | `href="/"`, visible | false | 238 |
| `/giris` | **true** | same | `href="/"`, visible | false | 238 |
| `/musteri-paneli` | **true** | same | `href="/"`, visible | false | 238 |
| `/` | **true** | same | `href="/"`, visible | false | 238 |

The `React.lazy` rejection is caught by the root boundary and
`AppErrorFallback` (`data-testid="app-error-fallback"`) renders with a visible,
full-page-load recovery link — **not** a white screen. `#hero-shell` is torn
down in the failure path too, so the fallback is not hidden behind the intro
shell. The scratch build and server were removed afterwards; no credential value
appears in this report or in the probe output.

**S3 PASS (upgraded from the Coder's UNPROVEN).**

---

## §S4 — Claimed vs measured numbers

| Coder claim | QA measurement | verdict |
|---|---|---|
| 267 app files typechecked | **267** | matches |
| 25 e2e files typechecked | **25** | matches |
| 613 total combinations | **613 in 14 files** | matches |
| 62 / 12 / 3 / 536 per gate | **62 / 12 / 3 / 536** | matches |
| bare `tsc --noEmit --listFiles` → 0 files | **0 lines of output** | matches |
| 88 full-shell / 94 total routes | contract test **passes** | matches |
| 7 `KNOWN_MOBILE_CONTRAST_TARGETS` selectors | **7** | matches |
| 37 `KNOWN_V1_SEMANTIC_VIOLATIONS` entries | **36** | **discrepancy (documentation only)** |
| warm build 1 m 13 s | **44.52 s** | **discrepancy (faster; not a defect)** |
| 73 024-pixel golden negative control | not reproduced; my own control gave **13 015 px (375)** and **27 758 px (1280)** | different perturbation; conclusion identical and independently established |

---

## Discrepancies found

1. **`KNOWN_V1_SEMANTIC_VIOLATIONS` has 36 entries, not 37.** Counted
   mechanically in both revisions: `git show 076c16a:e2e/landing-flow.spec.ts`
   → 72 quote characters → 36 entries; head `e2e/legacy/landing-flow.spec.ts`
   → 36. The "37" figure appears in the Coder's report **and** in the code
   comment at `e2e/landing/landing-accessibility.spec.ts:9`.
   *Impact:* none on behaviour or coverage — the list is byte-identical across
   the move and lives only under `e2e/legacy/`. This is an off-by-one in
   narrative text, not a weakened assertion. **Not a Phase 01 failure.**
   Suggested (non-blocking) follow-up: correct "37 kalemlik" to "36 kalemlik"
   in that comment when the file is next touched.

2. **Warm build measured 44.52 s, not the claimed 1 m 13 s.** Faster than
   claimed on this machine at this moment; no acceptance criterion depends on
   the figure. Recorded for baseline accuracy only.

3. **The Coder's 73 024-pixel golden negative control was not reproduced.** I
   did not attempt to replicate their exact injection; I designed my own
   (`.tl-hero-copy p{background:#ff0000}` injected into a copied `dist/`) and
   independently established the same conclusion with 13 015 / 27 758 diff
   pixels against a 200-pixel budget. The criterion (AC8) is met by my own
   measurement; their specific number remains unverified and should not be
   cited as evidence.

**Everything else I re-measured agreed exactly with the Coder's report.** What I
checked and found consistent: dist grep emptiness, all four gate combination
counts and their sum, the 267/25 typecheck file counts, the bare-`tsc` zero-file
claim (B09), the 88/94 route contract, the 7-selector contrast allow-list, the
CI job graph and its trigger conditions, the presence of reduced-motion and axe
specs inside the blocking gate, and the per-file test/assertion/skip parity of
all nine relocated legacy specs.

## Failed checks

| Check | Error / observation | Root cause | Production fix required? |
|---|---|---|---|
| — | none | — | no |

## Carried-forward known gaps (documented, not Phase 01 defects)

| ID | Gap | Owner |
|---|---|---|
| `VISUAL-BASELINE-GAP-LINUX` | No `e2e/__golden__/linux/` baselines, so the golden gate is inert on CI (ubuntu). CI declares this loudly and refuses to self-generate. | future phase / CI provisioning |
| B14 | `/` mounts no global header (`fullscreenHeaderCount: 0` measured). Honestly encoded as an explicit failing-when-fixed exception. | Phase 03 |
| B08 | Playwright's pinned Chromium/Firefox/WebKit revisions are absent locally; config falls back to installed browsers **outside CI only**. Determinism gap is scoped and documented, not hidden. | environment |
| color-system `.lf-*` surface-opacity sweep has no `.tl-*` equivalent | new work, not a restoration | future phase |

## Commands run

```text
git diff --name-status 076c16a 9392efb
git diff 076c16a 9392efb -- e2e/ src/ index.html playwright.config.ts .github/ package.json
npm run build                                   # exit 0, 44.52s
npm run typecheck                               # exit 0
npm run lint                                    # exit 0 (0 errors, 1 pre-existing warning)
npx tsc --noEmit --listFiles                    # 0 lines
npx tsc --noEmit --listFiles -p tsconfig.app.json | grep -vc node_modules   # 267
npx tsc --noEmit --listFiles -p tsconfig.e2e.json | grep -c /e2e/           # 25
grep -ril "legacy-landing|LandingFlow|TestHowWeWork|TechnicalPreview" dist/ # no match
grep -rn "lf-" e2e/*.spec.ts e2e/landing/ e2e/smoke/ e2e/visual/ e2e/helpers.ts
grep -rn "\.only(" e2e/ ; grep -rn "xfail|xit(|xdescribe" e2e/              # both empty
npx vite preview --port 4173 --strictPort
curl -sI http://localhost:4173/assets/hero-manifold-v1-DjyYu6ON.webp        # 200 image/webp
node reports/qa/tools/phase-01-runtime-probe.mjs http://localhost:4173
npx vite --port 8099 --strictPort
node reports/qa/tools/phase-01-dev-routes-probe.mjs http://localhost:8099
node reports/qa/tools/phase-01-coverage-diff.mjs 076c16a
npx playwright test --list                                                  # 613 / 14 files
npx playwright test --project=critical-1280 --project=critical-375 --list   # 62
npx playwright test --project=smoke-* --list                                # 12
npx playwright test --project=visual-* --list                               # 3
npx playwright test --project=<8 regression viewports> --list               # 536
PLAYWRIGHT_PREVIEW_ONLY=1 PLAYWRIGHT_REUSE_SERVER=1 npm run test:e2e:critical  # 60 passed, 2 skipped
PLAYWRIGHT_PREVIEW_ONLY=1 PLAYWRIGHT_REUSE_SERVER=1 npm run test:e2e:smoke     # 12 passed
PLAYWRIGHT_PREVIEW_ONLY=1 PLAYWRIGHT_REUSE_SERVER=1 npm run test:e2e:visual    # 3 passed
npx playwright test --project=desktop-1280 -g "exhaustive 94-path|shell exceptions"  # 2 passed
cp -r dist dist-ssr && <inject QA_NEGATIVE_CONTROL style> && npx vite preview --outDir dist-ssr --port 4174
PLAYWRIGHT_BASE_URL=http://localhost:4174 npx playwright test --project=visual-1280 --project=visual-375  # 2 FAILED (intended)
VITE_SUPABASE_URL= npx vite build --outDir dist-ssr
npx vite preview --outDir dist-ssr --port 4175 --strictPort
node reports/qa/tools/phase-01-error-boundary-probe.mjs http://localhost:4175
rm -rf dist-ssr test-results playwright-report
git status --porcelain
```

## Scope integrity

- **Production files modified by QA: NONE.** No file under `src/**`,
  `public/**`, `index.html`, `vite.config.ts`, `tsconfig*`, `eslint.config.js`,
  `playwright.config.ts`, `package.json`, `package-lock.json`, `.github/**`,
  `supabase/**`, `docs/**`, `Politikalar/**`, `scripts/**`, `CLAUDE.md`,
  `MASTER_CONTEXT.md`, `ACTIVE_TASK.md`, `PROGRESS.md`, `IMPLEMENTATION.md`,
  `USER_INPUTS.md`, `.claude/**`, `reports/baseline/**` or **`e2e/**`** was
  touched. `git status --porcelain` after all runs listed only QA-owned files.
- **`.env` was never modified, never committed, and no credential value appears
  anywhere in this report or in the probe outputs.** The S3 negative build used
  a process-level env override into a gitignored scratch outDir.
- QA-owned files added (all inside `QA_WRITE_ALLOWLIST`):
  - `reports/qa/phase-01.md`
  - `reports/qa/tools/phase-01-runtime-probe.mjs`
  - `reports/qa/tools/phase-01-dev-routes-probe.mjs`
  - `reports/qa/tools/phase-01-coverage-diff.mjs`
  - `reports/qa/tools/phase-01-error-boundary-probe.mjs`
- `e2e/qa-phase-01/**` was **not** needed: every criterion was provable with the
  delivered suite plus read-only probes, so no new spec entered the gates.
- All scratch artifacts (`dist-ssr/`, `test-results/`, `playwright-report/`)
  removed; tree left clean.

## Verdict

**PASS.** All ten acceptance criteria are evidenced by QA's own measurements,
and all four scrutiny points hold — including the two the Coder could not
close (S3, and the golden test's real diffing behaviour), which QA proved
independently. Coverage went **up** (+28 test blocks, +67 assertions, −1 skip);
no assertion was weakened, no tolerance allow-list entered the production suite,
and the three legacy allow-list/`.lf-*` families are confined to a non-gating
folder that tests a surface which provably does not ship. The one factual
discrepancy found (36 vs 37 allow-list entries) is a comment miscount with no
behavioural consequence.
