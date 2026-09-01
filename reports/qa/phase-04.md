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

### Block 3 — the Coder's own new goldens independently confirm the S1 regression

`shell-golden.spec.ts` captures `footer.tl-footer` on six surfaces at three
widths. The captured widths (read with `PNG.sync.read`):

| golden | 375 | 1280 | 1440 |
|---|---|---|---|
| shell-footer-about | 375 × 742 | 1278 × 298 | 1438 × 298 |
| shell-footer-journal | 375 × 742 | 1278 × 299 | 1438 × 299 |
| shell-footer-notfound | 375 × 743 | 1278 × 299 | 1438 × 299 |
| shell-footer-rfq | 375 × 742 | 1278 × 298 | 1438 × 298 |
| shell-footer-service | 375 × 743 | 1278 × 298 | 1438 × 298 |
| **shell-footer-home** | **373 × 741** | 1278 × 298 | 1438 × 298 |

At 375 the landing's footer is **2 px narrower than every other page's** — the
same 2 px of `.tl-sheet` border that Block 2 traced. At 1280/1440 all six agree,
because the border is intended at those widths. The goldens created to prove
"one shell" therefore *record* the landing being off-contract at mobile, and it
was not noticed. This is a second, independent line of evidence for the Block 2
finding, taken from the Coder's own artefacts.

### Block 4 — S2: the loosened `bantOrani` bound has teeth

`reports/qa/tools/probe-s2-footer-bound.mjs`, live preview, runtime DOM
injection only (no file on disk altered). The assertion lives in
`e2e/technical-landing.spec.ts:147`, which is `test.skip(width < 1180)`, so it
runs only at `critical-1280`.

```
===== 1280px =====
  AS SHIPPED                            297 px   ratio 0.2320   PASS vs 0.26
  (old bound 0.17)                                          would FAIL
  + a 5th nav column                    447 px   ratio 0.3492   BREACHED 0.26
  + link column grown to 12 rows        432 px   ratio 0.3375   BREACHED 0.26
  + conversion rule wrapped to 2        361 px   ratio 0.2820   BREACHED 0.26
  deleted mega footer 1398px       1.0922 ratio -> BREACHED 0.26
===== 1440px =====
  AS SHIPPED                            297 px   ratio 0.2062
  + a 5th nav column                    447 px   ratio 0.3104   BREACHED
  + link column grown to 12 rows        432 px   ratio 0.3000   BREACHED
  + conversion rule wrapped to 2        361 px   ratio 0.2507   would NOT breach
```

Verification of each Coder claim:

| Claim | Measured | Verdict |
|---|---|---|
| 298 px / 0.2328 at 1280 | **297 px / 0.2320** | correct to 1 px |
| "at 1440 it is the same 298 px" | **297 px** | correct |
| was 213 px / 0.1666 | 213/1280 = 0.1664 | correct |
| mega footer "would read 1.09" | 1398/1280 = **1.0922** | correct |
| new bound has 11 % headroom | (0.26−0.2320)/0.2320 = **12.1 %** | correct |
| old bound had 2 % headroom | (0.17−0.1664)/0.1664 = **2.2 %** | correct |
| a 5th nav column breaches 0.26 | 0.3492 | **breaches — verified empirically** |
| a column past ~9 rows breaches | 0.3375 at 12 rows | **breaches — verified** |
| the conversion rule wrapping breaches | 0.2820 at 1280 | **breaches — verified** |

**S2 = PASS.** The bound is not toothless: at the only width where the assertion
runs, all three named degradations and the deleted mega footer breach it. One
nuance worth recording — the wrap case yields 0.2507 at 1440 and would *not*
breach there; the claim is only true at the gate's own width. That does not
weaken the gate, because the assertion never executes at 1440.

### Block 5 — S3, S6, S7, S8, S9

**S3 — footer link parity: PASS.** Old `technicalLandingData.footerColumns`
destinations, each traced:

| old landing-footer destination | now reachable via |
|---|---|
| `/hakkimizda`, `/iletisim` | `companyLinks` → footer KURUMSAL column + menu |
| `/blog`, `/sss`, `/malzemeler` | `resourceLinks` → footer KURUMSAL column + menu |
| `/teklif-al` | footer conversion row (`rfqLink`) + header CTA |
| `#kalite` (×3), `#surec` | `landingSections` in `ia.ts` → published in the menu's section rail |
| `/hizmetler/cnc-frezeleme` | `navigationItems` → Hizmetler ▸ Talaşlı İmalat |
| `/kabiliyetler/tolerans-hassasiyet` | `navigationItems` → Kabiliyetler ▸ Kalite & Standartlar |
| `/kabiliyetler/kalite-kontrol` | `navigationItems` → Kabiliyetler ▸ Kalite & Standartlar |
| `/kabiliyetler/yuzey-islemleri-muhendislik` | `navigationItems` → Kabiliyetler ▸ Mühendislik Desteği |

Exactly the four detail pages and two anchors the Coder named; every one is
still published site-wide. Machine-checked, not just read: the Phase 03
reachability gate passed in this run —
`e2e/landing/navigation-reachability.spec.ts` tests 23–27 at `critical-1280`
and 93–95 at `critical-375`, including *"covers every public route surface by
navigation, index page or a recorded exclusion"* and *"every route the menu
links to resolves without a redirect or a not-found shell"*. No destination
became unreachable.

Carry-forward for a later phase (not a Phase 04 failure):
`technicalLandingData.footerColumns` is now dead data — referenced only from
comments in `ia.ts`, `footer-groups.ts` and `FinalSections.tsx`.

**S6 — the pruned CSS rule: PASS.** The rule is in the built CSS:

```
dist/assets/PageShell-CyeJBQRf.css:
body:has(.tl-footer:focus-within) [data-chat-launcher]{opacity:0;pointer-events:none}
```

It is the only `[data-chat-launcher]` rule in `dist/` (count: index-*.css 0,
Index-*.css 0, PageShell-*.css 1), and `PageShell-*.css` loads on every public
route, which is where `ChatBot` mounts. Moving it out of `@layer components`
was the correct fix.

*Phase 12 input — other `@layer components` rules keyed on possibly-absent
classes:* the `.footer-industrial` family was the only set whose sole class
source was a deleted file. Remaining `@layer components` entries in
`src/index.css` (`.container-industrial`, `.heading-industrial`,
`.subheading-industrial`, `.typo-*`, `.grid-lines`, `.accent-line`,
`.text-technical`) are all still referenced from live `src/**`, so none is
currently at risk; the class of bug remains latent for any future component
deletion and is worth a lint rule.

**S7 — the contrast fix: PASS with a numeric nit.** Recomputed with WCAG 2.x
relative luminance (`reports/qa/tools/contrast.mjs`):

| pair | Coder | measured | required at 10 px/600 |
|---|---|---|---|
| `--tl-bronze` on `--tl-black` | 4.32 | **4.401** | 4.5 — fails |
| `--tl-bronze` on `--tl-void` (the real graphite ground) | — | **4.549** | marginal |
| `--tl-bronze` on `--tl-paper-sunken` | 4.31 | **4.233** | 4.5 — fails |
| `--tl-bronze-light` on `--tl-black` | 9.9 | **10.007** | passes |
| `--tl-bronze-light` on `--tl-void` | — | **10.343** | passes |
| `--tl-bronze-ink` on `--tl-paper-sunken` | 6.2 | **6.077** | passes |

`.shell-eyebrow` is `font: 600 10px/1` — small text, so 4.5:1 applies. The two
new assignments (`--tl-bronze-light` on graphite, `--tl-bronze-ink` on paper)
both clear it comfortably at the sizes actually used. The Coder's figures are
off by 0.08–0.12 (their graphite reference is `--tl-black` while the shell
ground is `--tl-void`), but every conclusion drawn from them holds. `--tl-bronze`
now survives only on large editorial type (`h2 em`, `.shell-notfound-title em`,
`.tl-faq summary:hover`) and as a rule/background fill, where 3:1 applies.

**S8 — 404 auto-redirect removed: PASS.** `window.location` appears in
`src/pages/NotFound.tsx` only inside the header comment describing what was
removed; there is no timer and no assignment. The page renders inside
`PageShell` (`rail={{ no: "404", label: "HATA" }}`), keeps `ShellMetaRow` with
`YÖNLENDİRME: YOK`, and offers four recovery links (`/`, `/#hizmetler`,
`/teklif-al`, `/sss`). Reachability and the "way out" are covered by the passing
`shell-and-transition.spec.ts:101` at both critical widths, and my own probe
loaded `/yok-boyle-bir-sayfa` successfully. WCAG 2.2.1 defect closed.

**S9 — unreferenced leftovers absent from `dist/`: PASS.** All three files are
still on disk and none reaches the production bundle:

| file | fingerprint searched in `dist/` | found |
|---|---|---|
| `src/pages/CADDashboard.tsx` | `SB 2310-63-001` | no |
| `src/components/LiveClock.tsx` | `Europe/Istanbul` | no |
| `src/components/MarqueeBand.tsx` (root) | `marquee-outer`, `data-footer-information-band` | no |

ASCII fingerprints were used deliberately: Turkish strings are escaped in the
minified output, so a Turkish-literal grep would have produced a false
"absent". `src/components/technical-landing/MarqueeBand.tsx` is a **different,
live** component and is correctly present.

### Block 6 — AC3, AC6, AC7, AC8, S4, S5, AC10 (critical), AC11

**`test:e2e:critical`** (`--project=critical-1280 --project=critical-375`,
`PLAYWRIGHT_BASE_URL=http://localhost:4200`, preview on port **4200** because
4173 and 4199 were occupied):

```
1 failed
  [critical-1280] › landing-process-flow.spec.ts:163 › the connector matrix holds at every measured width
3 skipped
136 passed (25.5m)
```

The single failure is **`Tearing down "context" exceeded the test timeout of
60000ms`** — a teardown timeout, not an assertion. The same test passed at
`critical-375` in 8.7 s inside the same run. Re-run in isolation with nothing
else on the machine:

```
✓ 1 [critical-1280] › ...the connector matrix holds at every measured width (8.7s)
✓ 2 [critical-1280] › ...the connector matrix holds at this project's own viewport (4.2s)
2 passed (15.5s)   EXIT=0
```

Classified **environmental** (CPU contention with my concurrent probes), not a
Phase 04 defect. `reports/qa/tools/p04-e2e-processflow-isolated.log`.

**Adversarial probe** (`reports/qa/tools/probe-transition.mjs`, written
independently of the Coder's spec, entirely user-driven — real clicks, real
Back/Forward, real key presses):

*AC3 — PASS.* Direct load mounts exactly one curtain; the panel carries a real
CSS keyframe animation (`animation-name: route-curtain`, `1.06 s`) so the
transition still animates. Client navigation, Back and Forward each land on the
right URL with exactly **1** `[data-route-transition]`, **1** header and **1**
`<main>`, and no stranded lock. Direct load of a deep route is a single subtree.

*S4 — PASS, and the fix is structural.* `src/components/PageTransition.tsx`
contains no `AnimatePresence`, no `setTimeout`, and no route-change listener;
`[data-route-curtain]` is keyed on `location.pathname` and sits **outside** the
routed subtree, and `{children}` is a single unkeyed node. The curtain is driven
by CSS keyframes ending at `scaleY(0)`. Measured: `transitionWrappers`,
`headers` and `mains` were 1/1/1 at every observation point across ~40
navigations, including mid-flight. No papering-over mechanism was added.

*AC7 — PASS, two independent ways.*
- The Coder's own gate, `--repeat-each=8`: **8 passed (2.0m), EXIT=0**
  (`reports/qa/tools/p04-b25-repeat8.log`).
- My own user-driven probe (build the `/#sektorler` → `/hakkimizda` history,
  Back, open the menu, press Forward, poll 4 s for release, then verify the
  trigger still works): **8/8 OK**, every round `menu=false inert=false
  htmlOverflow=clip visible triggers=1 headers=1 mains=1 wrappers=1
  landingRoots=0 triggerWorks=true`. B25's three symptoms — stranded lock,
  doubled trigger, dead trigger — all absent.

*AC8 — PASS.* Attack 1: six iterations of click-link → click again 80 ms into
the curtain → Back → Forward. Attack 2: twelve route swaps at 90 ms intervals,
faster than the 1.06 s curtain. After both: exactly one wrapper/header/main, no
`inert`, no `overflow:hidden`, and **no curtain panel captures pointer events**
(all six `pointer-events: none`). No stuck-transition state was reachable.

One probe assertion initially reported red — *"the site is still fully navigable
after the hammering"*. Diagnosed and dismissed as **my own selector bug**: the
menu publishes **two links whose accessible name is exactly `İletişim`**,
`/#iletisim` (the landing section) and `/iletisim` (the route). `.first()`
matched the anchor, the page scrolled correctly, and `waitForURL("**/iletisim")`
timed out on a navigation that never should have happened. Re-verified with an
unambiguous selector: `/sss`, `/blog` and every direct route load navigate fine.

*A separate, genuine observation surfaced while chasing that* — see
"Discrepancies found" item D2 (heavy-route mount race on `/malzemeler`).

*S5 — PASS.* All three auth routes measured live:

| route | headers | footers | mains | `main` id | skip href | target exists |
|---|---|---|---|---|---|---|
| `/giris` | 0 | 0 | 1 | `main-content` | `#main-content` | yes |
| `/sifremi-unuttum` | 0 | 0 | 1 | `main-content` | `#main-content` | yes |
| `/reset-password` | 0 | 0 | 1 | `main-content` | `#main-content` | yes |

Header/footer counts unchanged (still zero — `navigation={false} footer={false}`),
and each now has the `<main id="main-content">` the skip link previously had no
target for.

*AC6 — PASS.* `/teklif-al` renders `footer.tl-footer` (298 px, 53 links). Its
legal run and the result of actually clicking each link:

```
KVKK               -> /kvkk                  h1="KVKK Aydınlatma Metni"   404=false
Gizlilik Politikası-> /gizlilik-politikasi    h1="Gizlilik Politikası"     404=false
Çerez Politikası   -> /cerez-politikasi       h1="Çerez Politikası"        404=false
```

The `src/pages/TeklifAl.tsx:54` "imports `Footer`, never renders it" defect is
closed.

**AC11 — PASS.** `PROBE_BASE_URL=http://localhost:4200 node scripts/grid-axis-probe.mjs`:

```
GRID AXIS PROBE: PASS — every measured edge sits on a master axis (tolerance 1px).
GRID_EXIT=0
```

339 measured edges, **0 off-grid** (`grep -c "OFF" = 0`). The new
`Footer body / brand / nav / nav columns #1–#4 / title block` rows are all `OK`
on C0/C4/C6/C8/C10/C12 — the consolidated footer stayed on the master grid.

### Block 7+ — see below

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
