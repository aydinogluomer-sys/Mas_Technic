# QA Report — Phase 01

- PHASE: 01
- PHASE_TITLE: Repository truth, CI recovery, legacy landing cleanup
- CODE_COMMIT: `9392efb` (Coder commits `038af33` + `9392efb`), base for diff `076c16a`
- QA_WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\qa-p01` on `wt/qa-p01`
- QA_COMMIT: TBD
- STATUS: IN PROGRESS (partial — committed incrementally)
- TESTS_PASSED: TBD
- TESTS_FAILED: TBD
- TESTS_SKIPPED: TBD
- NEW_TESTS_ADDED: 0

> Every result below is a measurement made by QA in this worktree. The Coder's
> report was read only to know which numbers to re-derive; it is never cited as
> evidence.

## Acceptance criteria matrix

| Criterion | Result | Evidence |
|---|---|---|
| AC1 dev-only routes absent from production, present in dev | PASS | see §AC1 |
| AC2 no active homepage test depends on `.lf-*`; `/` rewrite gone | PASS | see §AC2 |
| AC3 `#hero-shell` provably removed on `/` incl. fallback timeout | PASS | see §AC3 |
| AC4 single, real, resolving LCP image preload | PASS | see §AC4 |
| AC5 typecheck/lint/build pass; typecheck covers non-zero files | PASS | see §AC5 |
| AC6 critical Chromium suite against real `/` | PENDING | |
| AC7 WebKit + Firefox smoke | PENDING | |
| AC8 golden screenshot genuinely diffs (negative control) | PENDING | |
| AC9 CI job graph + combination arithmetic | PASS | see §AC9 |
| AC10 no skips/weakening/tolerance allow-list in production suite | PENDING | |
| S1 shell-contract reduction is re-pointing at truth | PASS | see §S1 |
| S2 legacy relocation genuinely legacy | PENDING | |
| S3 ErrorBoundary fallback at runtime | PENDING | |
| S4 claimed numbers re-derived | PARTIAL | see §S4 |

---

## §AC1 — No production-public legacy/test/technical-preview route

**Build:** `npm run build` → exit 0, `✓ built in 44.52s`.

**dist grep:**

```text
$ grep -ril "legacy-landing\|LandingFlow\|TestHowWeWork\|TechnicalPreview" dist/
GREP_EXIT=1        # no output, no match
```

**Production preview (`vite preview`, port 4173), real Chromium
(`C:\Program Files\Google\Chrome\Application\chrome.exe`, blocker B08 fallback),
2.5 s settle per route** — `reports/qa/tools/phase-01-runtime-probe.mjs`:

| route | 404 body text | `technical-landing-root` | `.lf-root` |
|---|---|---|---|
| `/technical-preview` | yes | absent | absent |
| `/legacy-landing` | yes | absent | absent |
| `/test` | yes | absent | absent |

(HTTP status is 200 for all three because `vite preview` serves the SPA
fallback document; the *rendered route* is the 404 page, which is the
contract.)

**Dev server (`vite --port 8099`)** — `reports/qa/tools/phase-01-dev-routes-probe.mjs`:

| route | renders | first heading | page errors |
|---|---|---|---|
| `/technical-preview` | `technical-landing-root` present | `HAM GEOMETRİDEN…` | none |
| `/legacy-landing` | `.lf-root` + `landing-version-root` + `#top` present | `MASTECHNIC` | none |
| `/test` | isolation page, 1602 chars | `HowWeWork izolasyon testi` | none |

All three remain fully available to developers. **AC1 PASS.**

---

## §AC2 — No active homepage test depends on `.lf-*`; no `/` → `/legacy-landing` rewrite

`e2e/helpers.ts:82-89` — `gotoAndSettle` now goes to `path` verbatim; the
`path === "/" ? "/legacy-landing"` rewrite is deleted (confirmed in
`git diff 076c16a 9392efb -- e2e/helpers.ts`).

`.lf-*` grep over the active suite (`e2e/*.spec.ts`, `e2e/landing/`,
`e2e/smoke/`, `e2e/visual/`) — see §AC2-grep in "Commands run"; the only hits
are negative assertions. `e2e/legacy/**` (not part of any gate) retains
positive `.lf-*` usage, which is correct: those specs drive `/legacy-landing`.

**`LANDING_SCENE_IDS` verified against the live DOM, not against the list.**
Runtime probe on `/` (preview build, 9 s settle):

```json
"anchorPresence":  { "surec":1,"nexus":1,"projeler":1,"sektorler":1,
                     "kalite":1,"sss":1,"iletisim":1 }
"legacyIdsPresent":{ "top":0,"hizmetler":0,"endustriler":0,"malzemeler":0,
                     "neden-biz":0,"kabiliyetler":0,"referanslar":0 }
"lfClassElements": 0
"headerHashes":    ["surec","sektorler","projeler","nexus","kalite","iletisim"]
```

All seven declared IDs exist exactly once on the real `/`; all nine stale IDs
from the old list are absent; zero `.lf-*`-classed elements exist on `/`.
`#sss` is reached from the footer rather than the header nav, which matches the
documented intent in `e2e/helpers.ts:3-8`. **AC2 PASS.**

---

## §AC3 — `#hero-shell` provably removed on `/`

Measured in real Chromium against `vite preview`, three independent contexts.

| scenario | shell at `load` | `data-intro` on shell | teardown at | shell null after +3 s | `data-intro-active` after |
|---|---|---|---|---|---|
| normal motion | present | yes | **2830 ms** | true | false |
| `prefers-reduced-motion: reduce` | already absent | n/a | **68 ms** | true | false |
| `mas:intro-done` suppressed | present | yes | **7040 ms** | true | false |

The third row is the fallback-timeout proof: `dispatchEvent` was patched in an
init script to swallow every `mas:intro-done` (`suppressed: 1` confirms exactly
one dispatch was intercepted, i.e. the event genuinely never reached a
listener). The shell was still in the DOM at t+4 s and was removed at
**7040 ms** — within a rounding tick of
`HERO_SHELL_TEARDOWN_FALLBACK_MS = 7000` (`src/lib/hero-shell.ts:37`). The
timeout path fires. **AC3 PASS.**

---

## §AC4 — The real hero asset is the only LCP preload target

Served `dist/index.html` (line 283) contains exactly **one**
`rel=preload as=image`:

```html
<link rel="preload" as="image" type="image/webp"
      href="/assets/hero-manifold-v1-DjyYu6ON.webp" fetchpriority="high">
```

The only other `rel="preload"` in the document is the Google Fonts stylesheet
(`as="style"`, line 269) — not an image preload. Four `rel="modulepreload"`
entries are JS chunks.

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

No preload returns `text/html` or 404; no response on `/` had status ≥ 400.
**AC4 PASS.**

---

## §AC5 — typecheck / lint / build, and non-zero typecheck coverage

| command | exit | note |
|---|---|---|
| `npm run typecheck` | **0** | `tsc -p tsconfig.app.json && -p tsconfig.node.json && -p tsconfig.e2e.json` |
| `npm run lint` | **0** | 1 problem: 0 errors, 1 pre-existing `react-hooks/exhaustive-deps` warning in `src/components/technical-landing/TechnicalHeader.tsx:43` |
| `npm run build` | **0** | 44.52 s (warm) |

**B09 re-verified independently:**

```text
$ npx tsc --noEmit --listFiles          # bare, root config
(0 lines of output)                     # root tsconfig.json has "files": []
```

versus the script's project configs:

```text
tsconfig.app.json  → 267 non-node_modules files listed
tsconfig.e2e.json  →  25 files under e2e/ listed
```

The bare invocation checks nothing; `npm run typecheck` checks 267 + 25 real
files. **AC5 PASS.**

---

## §AC9 — CI workflow structure and combination arithmetic

`.github/workflows/playwright.yml` parses as valid YAML (job graph read
directly). Jobs: `quality`, `build`, `e2e-critical` (needs build),
`e2e-smoke` (needs build), `visual` (needs build),
`e2e-regression` (needs build, `if: github.event_name == 'workflow_dispatch'`).

**Combination counts re-measured by QA with `--list`:**

| gate | Coder claim | QA measurement | command |
|---|---|---|---|
| critical | 62 | **62** in 6 files | `--project=critical-1280 --project=critical-375 --list` |
| smoke | 12 | **12** in 1 file | four `smoke-*` projects `--list` |
| visual | 3 | **3** in 1 file | three `visual-*` projects `--list` |
| regression (dispatch-only) | 536 | **536** in 12 files | eight regression viewport projects `--list` |
| **total** | 613 | **613 in 14 files** | `npx playwright test --list` |

Arithmetic checked by QA: 62 + 12 + 3 + 536 = **613**, equal to the measured
grand total. The four families partition the suite with no double count, and
`e2e/legacy/**` contributes 0 because `legacyProjects` is empty unless
`PLAYWRIGHT_LEGACY=1` (`playwright.config.ts`).

**Reduced-motion and axe are inside the blocking critical gate** — measured
from the critical `--list` output, not from a comment:

```text
[critical-1280] landing/landing-accessibility.spec.ts:20 › has no serious or critical axe violations on the whole document
[critical-1280] landing/landing-accessibility.spec.ts:32 › exposes one landmark set and a working skip link target
[critical-1280] landing/landing-accessibility.spec.ts:43 › keeps heading order legible…
[critical-1280] landing/landing-reduced-motion.spec.ts:14 › renders a complete, static landing and removes the intro shell at once
[critical-1280] landing/landing-reduced-motion.spec.ts:31 › keeps every band measurable…
[critical-1280] technical-landing.spec.ts:268 › has no serious or critical accessibility violations
[critical-1280] technical-landing.spec.ts:284 › reduced motion keeps the complete page visible without active animation
```

(identical set for `critical-375` → 14 reduced-motion/a11y combinations in the
blocking gate). Nothing was dropped.

Timeout budget: `build` 25 min for a build measured at 44.5 s warm / 4 m 05 s
cold; `e2e-critical` 20 min for 62 combinations with `dist/` downloaded and
`PLAYWRIGHT_PREVIEW_ONLY=1` (webServer timeout 120 s, preview only). Structure
completes within its timeouts. **AC9 PASS.**

The `visual` job's `Guard platform baselines` step is an honest, non-green-
faking gap declaration: it warns `VISUAL-BASELINE-GAP-LINUX` and skips the
visual suite rather than letting CI author its own baseline. Recorded as a
known gap, not a Phase 01 failure.

---

## §S1 — The shell-contract reduction (90→88 / 95→94)

Verified as **re-pointing at truth, not coverage loss**.

- `/` moved out of `STATIC_FULL_SHELL_ROUTES` into `OWN_SHELL_ROUTES`
  (`e2e/shared-shell-accessibility.spec.ts:51`) and is still counted in the
  94-path total (`...FULL_SHELL_ROUTES, ...OWN_SHELL_ROUTES, /teklif-al,
  /giris, /sifremi-unuttum, /reset-password, /cad-dashboard → 94`).
- `/test` left because it is dev-only; it is not silently dropped — three
  dev routes are now *positively* asserted to exist only behind the DEV guard
  (`expect([...APP_DEV_ROUTE_PATTERNS].sort()).toEqual([...EXPECTED_DEV_ROUTE_PATTERNS].sort())`
  plus a per-pattern `toContain('{DevRoute && <Route path="…"')` and a regex on
  `import.meta.env.DEV ? lazy(...) : null`). Net: 90 − 2 = 88, 95 − 1 = 94.
  Arithmetic is consistent.
- **The `/` exception is a real assertion, not a comment.**
  `e2e/shared-shell-accessibility.spec.ts` `keeps declared public and panel
  shell exceptions explicit` includes `{ route: "/", finalPaths: ["/"],
  header: 0, footer: 1 }` and the loop executes
  `await expect(page.locator("[data-fullscreen-header]"), expectation.route)
   .toHaveCount(expectation.header)`.
  When Phase 03 mounts the global header on `/`, that locator resolves to 1 and
  `toHaveCount(0)` fails. Confirmed against the live DOM: my probe measured
  `fullscreenHeaderCount: 0` and `contentinfoCount: 1` on `/` today, i.e. the
  assertion currently matches reality and will genuinely flip. **S1 PASS.**

---

## §S4 — Claimed vs measured numbers (partial)

| Coder claim | QA measurement | verdict |
|---|---|---|
| 267 app files typechecked | **267** (`tsc --listFiles -p tsconfig.app.json`, node_modules excluded) | matches |
| 25 e2e files typechecked | **25** (`tsc --listFiles -p tsconfig.e2e.json`, `e2e/` paths) | matches |
| 613 total combinations | **613 in 14 files** | matches |
| 62 / 12 / 3 / 536 per gate | **62 / 12 / 3 / 536** | matches |
| bare `tsc --noEmit --listFiles` → 0 files | **0 lines of output** | matches |
| warm build 1 m 13 s | **44.52 s** warm here | faster than claimed; not a defect |
| 73,024-pixel golden negative control | pending | |

---

## Commands run (so far)

```text
git diff --name-status 076c16a 9392efb
git diff 076c16a 9392efb -- e2e/ src/ index.html playwright.config.ts .github/
npm run build                                   # exit 0, 44.52s
npm run typecheck                               # exit 0
npm run lint                                    # exit 0 (1 warning, 0 errors)
npx tsc --noEmit --listFiles                    # 0 lines
npx tsc --noEmit --listFiles -p tsconfig.app.json | grep -vc node_modules   # 267
npx tsc --noEmit --listFiles -p tsconfig.e2e.json | grep -c /e2e/           # 25
grep -ril "legacy-landing|LandingFlow|TestHowWeWork|TechnicalPreview" dist/ # no match
npx vite preview --port 4173 --strictPort
curl -sI http://localhost:4173/assets/hero-manifold-v1-DjyYu6ON.webp        # 200 image/webp
node reports/qa/tools/phase-01-runtime-probe.mjs http://localhost:4173
npx vite --port 8099 --strictPort
node reports/qa/tools/phase-01-dev-routes-probe.mjs http://localhost:8099
npx playwright test --list                                                  # 613 / 14 files
npx playwright test --project=critical-* --list                             # 62
npx playwright test --project=smoke-* --list                                # 12
npx playwright test --project=visual-* --list                               # 3
npx playwright test --project=<8 regression viewports> --list               # 536
```

## Scope integrity

- Production files modified by QA: NONE
- QA-owned files added: `reports/qa/phase-01.md`,
  `reports/qa/tools/phase-01-runtime-probe.mjs`,
  `reports/qa/tools/phase-01-dev-routes-probe.mjs`

## Notes

Report is being committed incrementally; sections AC6/AC7/AC8/AC10/S2/S3
follow.
