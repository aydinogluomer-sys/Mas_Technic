# QA Report — Phase 04 (RETRY)

- PHASE: 04 — GLOBAL PUBLIC PAGE SHELL + ROUTE TRANSITIONS
- CODE_COMMITS: `9c66c47`, `7fee96e`, `ce5303e`, `56c8831`, `a695c0a` (integration HEAD `a695c0a`)
- BASE FOR DIFF: `77f9f7c`
- WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\qa-p04b` (branch `wt/qa-p04b`)
- QA_COMMIT: (see git log of this file)
- STATUS: IN PROGRESS

> Note on commit SHAs: the task packet listed `7d01465 d2c7dc1 6a3bc84 f3cd3f5 a059aef`.
> The commits actually present on this worktree between `77f9f7c` and `a695c0a` are
> `9c66c47 7fee96e ce5303e 56c8831 a695c0a` (5 commits, same count, same integration
> HEAD `a695c0a`). Verified by `git log --oneline 77f9f7c..a695c0a`. The packet SHAs
> appear to be from a pre-rebase/pre-integration line; the HEAD matches, so the audit
> target is unambiguous.

---

## Progress log (append-only; committed after each block)

### Block 1 — scope integrity + static checks (in progress)

**Changed files, `git diff --name-status 77f9f7c..a695c0a` (excluding goldens):**
50 non-golden files. New: `src/components/shell/{PageShell,ShellBand,ShellPrimitives,ShellStates,SiteFooter,footer-groups,index}`,
`src/styles/shell.css`, `docs/lean/15-page-shell.md`, `e2e/landing/shell-and-transition.spec.ts`,
`e2e/visual/shell-golden.spec.ts`. Deleted: `src/components/Footer.tsx`,
`src/components/footer/**` (6 files), `src/components/ui/ScrollProgress.tsx`.

- `npm run typecheck` — **PASS** (`TYPECHECK_EXIT=0`)
- `npm run lint` — **PASS** (`LINT_EXIT=0`)
- `npm run build` — **PASS** (`BUILD_EXIT=0`, `✓ built in 1m 24s`)

QA wrote only `reports/qa/phase-04.md` and `reports/qa/tools/**`. No production file touched.

### Block 2 — S1: the 375 body change, cause found and judged **REGRESSION**

**Reproduction of the Orchestrator's table** (own tool,
`reports/qa/tools/golden-diff.mjs`, top-aligned, meaningful = any channel ≥ 16/255;
old goldens extracted from `77f9f7c`):

| width | old→new | any diff | ≥16/255 | rows with ≥16 diff | body-band shift | residual at best offset |
|---|---|---|---|---|---|---|
| 1280 | 3980→4064 | 0.868 % | **0.776 %** | 3783–3979 (footer only) | **0 px** | **0.000 %** |
| 1440 | 4035→4119 | 0.834 % | **0.750 %** | 3838–4034 (footer only) | **0 px** | **0.000 %** |
| 375 | 8922→8969 | 36.767 % | **22.487 %** | **64–8921 (whole page)** | **15 px** | **11.976 %** |

Confirmed. (My 375 residual is 11.976 % vs the Orchestrator's 8.743 %; my probe
samples every 2nd column over rows 5 %–70 %. The conclusion is identical: a 15 px
shift that does *not* explain the remaining difference.)

**Additional measurement — horizontal shift probe** (`reports/qa/tools/golden-xshift.mjs`,
375, rows 100–760, i.e. above the first vertical divergence):

```
x offset  0 : 9.137 %
x offset +1 : 3.419 %   <-- minimum
x offset +2 : 11.351 %
```

The whole mobile landing body moved **exactly 1 px to the right**.

**Root cause — a CSS cascade regression, not footer growth and not intent.**

`src/styles/technical-landing.css` used to carry, at `@media (max-width:767px)`:

```css
.tl-sheet{border-inline:0}
```

Phase 04 moved that override into `src/styles/shell.css` (line 87). But
`technical-landing.css:4` still does `@import "./master-grid.css";` and
`shell.css:21` does the same. Rollup therefore emits the *base* rule
`.tl-sheet{...border-inline:var(--tl-rule-size) solid var(--tl-rule)...}`
into **both** chunk stylesheets, while the `≤767px` override exists in only one:

- `dist/assets/PageShell-CyeJBQRf.css` — base at byte 15951, override at byte 17539 (override wins inside this file)
- `dist/assets/Index-Q-yQMtXW.css` — base at byte 1716, **no override**

On `/` the landing chunk's stylesheet is injected *after* the shell's, so the
re-declared base rule wins at equal specificity. Measured live against the
production preview (`reports/qa/tools/probe-sheet-border.mjs`, port 4200):

```
===== 375px =====
  /                          borderInline=1px/1px   css=index-*.css PageShell-*.css Index-*.css
  /sss                       borderInline=0px/0px   css=index-*.css PageShell-*.css
  /hakkimizda                borderInline=0px/0px
  /teklif-al                 borderInline=0px/0px
  /blog                      borderInline=0px/0px
  /hizmetler/cnc-frezeleme   borderInline=0px/0px
  /yok-boyle-bir-sayfa       borderInline=0px/0px
===== 1280px =====   (all routes 1px/1px — correct, the rule is desktop-intended)
```

`/` is the **only** route where the mobile override fails, and it fails only
because it is the only route that loads `Index-*.css`.

**Consequences, measured on the live build at 375**
(`reports/qa/tools/probe-s1-cause.mjs`):

- `.tl-sheet` `borderLeft=1px`, `borderRight=1px` — a hairline frame at both screen
  edges that the design deliberately removed below 768 px.
- Content field is 2 px narrower, and the whole body starts 1 px further right.
- The `PARÇA BİLGİSİ` spec value `120.00 × 72.00 × 68.00 mm` now **wraps onto a
  second line** (measured `width 143.5`, `height 29.69`, `lines: 2`), leaving the
  unit `mm` alone on its own line. Confirmed visually against the old golden crop
  (rows 0–900), where the same value sits on one line.
- That extra line is the **15 px** vertical shift, and it cascades over the
  remaining ~8100 rows of the page.
- Live `document.scrollHeight` at 375 = **8969**, identical to the new golden —
  so the golden faithfully records the regressed build.

**S1_INTENT_VERDICT: REGRESSION.** The Coder's stated justification ("footer growth
and nothing else") is true at 1280 and 1440 and **materially false at 375**. The
regenerated `visual-375/landing-fullpage.png` pins a layout defect as the baseline:
a re-introduced 1 px sheet border below 768 px and a wrapped dimensional spec value
on the site's flagship precision claim. Per `IMPLEMENTATION.md` §12 this is a golden
regenerated on an incorrect premise, and the underlying pixels are **not acceptable**.

### Block 3+ — see below

---

## Acceptance criteria matrix

| Criterion | Result | Evidence |
|---|---|---|
| AC1–AC12 | pending | |

## Scrutiny points

| Point | Result | Evidence |
|---|---|---|
| S1–S9 | pending | |

## Discrepancies found

(pending)

## Commands run

```text
git diff --name-status 77f9f7c..a695c0a
npm run typecheck
```

## Scope integrity

- Production files modified by QA: NONE
- Test/report files modified by QA: `reports/qa/phase-04.md`, `reports/qa/tools/**`
