# QA Report — Phase 02 · MASTER DESIGN SYSTEM + 12-COLUMN GRID RECONSTRUCTION

- PHASE: 02
- CODE_COMMITS: `28a4cfe`, `39bf6d9`, `5b82164`, `cfe5ad0`, `603965e` (HEAD `603965e`)
- BASE FOR DIFF: `9133415`
- QA WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\qa-p02` on `wt/qa-p02`
- QA_COMMIT: TBD
- STATUS: IN PROGRESS
- PORTS USED: Playwright `PLAYWRIGHT_PORT=4419`; grid probe default `4199`; negative control `4299`

> This report is written and committed incrementally. Sections appear as evidence
> is produced; nothing below is transcribed from the Coder's summary.

---

## BLOCK 1 — Scope integrity and diff audit

### Changed files, `git diff --name-status 9133415 603965e`

```text
M	docs/lean/06-design-system.md
M	docs/lean/09-responsive-rules.md
M	docs/lean/13-forbidden-patterns.md
M	docs/lean/design-tokens.json
M	e2e/__golden__/win32/visual-1280/landing-fullpage.png
M	e2e/__golden__/win32/visual-1440/landing-fullpage.png
M	e2e/__golden__/win32/visual-375/landing-fullpage.png
A	e2e/landing/landing-grid-axes.spec.ts
M	e2e/technical-landing.spec.ts
A	scripts/grid-axis-probe.mjs
A	src/components/dev/MasterGridOverlay.tsx
A	src/components/dev/grid-overlay.css
M	src/components/technical-landing/TechnicalLanding.tsx
A	src/styles/design-tokens.css
A	src/styles/master-grid.css
M	src/styles/technical-landing.css
```

16 files, +1567 / -280. Nothing outside the phase's stated surface. No package/build
config, no `index.html`, no `supabase/`, no `/admin` or `/musteri-paneli` route
touched, no new npm dependency.

### S5 (part 1) — no copy edits

`git diff 9133415 603965e -- src/components/` touches exactly two paths:

- `src/components/dev/MasterGridOverlay.tsx` + `grid-overlay.css` — **new dev-only files**
- `src/components/technical-landing/TechnicalLanding.tsx` — **+19 / −1 lines**, and the
  entire change is the dev-overlay mount:

```tsx
const MasterGridOverlay = import.meta.env.DEV
  ? lazy(() => import("@/components/dev/MasterGridOverlay").then((m) => ({ default: m.MasterGridOverlay })))
  : null;
```

plus a `<Suspense fallback={null}>` wrapper at the end of the tree and the
`Suspense, lazy` import. **No band component file was modified at all** — not
`TechnicalHero`, `ProofStrip`, `LandingBands`, `DrawingFooter`, `MarqueeBand`,
`TechnicalHeader`. Therefore **no content string, heading, label, image `src`,
`alt`, link or data value changed in Phase 02**. Geometry-only scope is
structurally guaranteed by the diff, not merely asserted. → **S5 copy half: PASS**

### Orchestrator-accepted deviation — `e2e/technical-landing.spec.ts`

`git diff --numstat 9133415 603965e -- e2e/` = `30 insertions / 4 deletions` in that
file, and `144 / 0` for the new `e2e/landing/landing-grid-axes.spec.ts`. The four
deleted lines are exactly:

```diff
-    expect(["56px", "64px"]).toContain(contract.rail);
-    // Nav sütunu referanstaki gibi ~%41'de başlamalı (marka sütunu genişlerse kayar).
-    expect(navBaslangic).toBeGreaterThan(39);
-    expect(navBaslangic).toBeLessThan(44);
```

**Edit 1 — rail enumeration.** `["56px","64px"]` → `["42px","56px","64px"]`, and a new
*measured* bound was added in the same test:

```ts
const viewportWidth = page.viewportSize()?.width ?? 0;
expect(Number.parseFloat(contract.rail) / viewportWidth,
  `rail must not consume an excessive share of a ${viewportWidth}px viewport`)
  .toBeLessThan(0.15);
```

The added bound is a real, executed assertion (not a comment, not conditional) and it
is strictly stronger than what the enumeration alone gave: the old list would have
accepted `56px` at 320px (17.5%) without complaint. → **not a weakening.**

**Edit 2 — footer nav start.** `>39 && <44` (5.0 percentage points wide) →
`>36.5 && <39.5` (3.0 points wide). The window **narrowed by 40%**. Directional
sensitivity: one master column is 1/12 of the content field ≈ 7.3–8.0% of viewport,
so a brand column growing by one master column moves `navBaslangic` from ~37–38% to
~45%, outside `<39.5` — the test still goes red. The new range is failing-sensitive in
both directions and tighter than the old one. → **not a weakening.**

**Assertion accounting.** `expect(` count in `e2e/technical-landing.spec.ts`:
**78 at base → 79 at HEAD** (3 removed, 4 added). Repo-wide scan for
`.only` / `.fixme` / `xit` / `xdescribe`: **zero occurrences, new or old.** Every
`test.skip` / `test.fail` present at HEAD also exists at base except one — the new
`e2e/landing/landing-grid-axes.spec.ts:133` `test.skip(width >= 768, ...)`, a
viewport-lane selector on a mobile-only contract, matching the repo's established
lane pattern (`shared-shell-accessibility.spec.ts`, `fullscreen-menu.spec.ts`). No
assertion anywhere was deleted, skipped, `.only`'d, `xfail`'d or loosened.
→ **Accepted deviation: confirmed benign.**

---

## BLOCK 2 — AC6 static gates

| Gate | Command | Result |
|---|---|---|
| Typecheck | `npm run typecheck` (`tsc --noEmit` × app/node/e2e) | **PASS**, zero diagnostics |
| Lint | `npm run lint` (`eslint .`) | **PASS** — `✖ 1 problem (0 errors, 1 warning)` |
| Build | `npm run build` | **PASS** — `✓ built in 36.89s`, exit 0 |

The single lint warning is `react-hooks/exhaustive-deps` on
`src/components/technical-landing/TechnicalHeader.tsx:43` (`triggerRef.current` in an
effect cleanup). Verified **pre-existing**: the identical `triggerRef.current?.focus()`
cleanup is present in `git show 9133415:src/components/technical-landing/TechnicalHeader.tsx`.
Phase 02 introduced no new lint output. → **AC6: PASS**

---

## BLOCK 3 — AC3 dev overlay must not ship

```text
$ grep -ril "MasterGridOverlay\|grid-overlay" dist/               → no matches (exit 1)
$ grep -ril "tl-grid-overlay\|mas:grid-overlay\|CTRL+ALT+G" dist/ → no matches (exit 1)
$ find dist -type f | wc -l                                       → 367
```

The module identifier, the CSS class prefix and the localStorage key are all absent
from every one of the 367 built files. The `import.meta.env.DEV` ternary is a
compile-time constant `false`, so Rollup drops the dynamic import and with it the
component and its `import "./grid-overlay.css"`. → **AC3 bundle half: PASS.**
Dev-runtime half is verified in a later block.
