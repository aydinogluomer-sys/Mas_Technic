# QA Report — Phase 04 (RETRY)

- PHASE: 04 — GLOBAL PUBLIC PAGE SHELL + ROUTE TRANSITIONS
- CODE_COMMITS: `9c66c47`, `7fee96e`, `ce5303e`, `56c8831`, `a695c0a` (integration HEAD `a695c0a`)
- BASE FOR DIFF: `77f9f7c`
- WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\qa-p04b` (branch `wt/qa-p04b`)
- QA_COMMIT: (see git log of this file)
- STATUS: **FAIL**
- TESTS_PASSED: 185
- TESTS_FAILED: 1 (environmental teardown timeout; green in isolation)
- TESTS_SKIPPED: 3
- NEW_TESTS_ADDED: 0 (19 QA-owned probe tools under reports/qa/tools/**)
- S1_INTENT_VERDICT: **REGRESSION**

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

### Block 7 — AC1, AC2, AC9, AC10, AC12

**AC9 — PASS.** `npm run typecheck` `TYPECHECK_EXIT=0`; `npm run lint`
`LINT_EXIT=0`; `npm run build` `BUILD_EXIT=0`, `✓ built in 1m 24s`.

**AC10 — PASS.**

| suite | result |
|---|---|
| `test:e2e:critical` | 136 passed, 3 skipped, 1 failed (teardown timeout, green in isolation) |
| `test:e2e:visual` | **27 passed**, `VISUAL_EXIT=0` |
| `test:e2e:smoke` | **12 passed**, `SMOKE_EXIT=0` (WebKit + Firefox, 390 and 1440) |
| B25 `--repeat-each=8` | **8 passed**, `EXIT=0` |
| process-flow isolated | 2 passed, `EXIT=0` |

Phase 03 navigation guarantees re-verified inside this run: the teardown matrix
(`navigation-teardown.spec.ts`, including the reduced-motion Escape and
close-button lanes) and the reachability set
(`navigation-reachability.spec.ts`, all 5 tests at both critical widths) are
green.

**AC1 — PASS.** `probe-ac2-contract.mjs`, 20 routes × 3 widths (1280/768/375),
fully settled: `shellRoots=1`, `mains=1`, `main.classList` contains
`shell-main` on every public route; `headers=1 footers=1` on all 17 non-auth
routes; `headers=0 footers=0` on the 3 auth routes by design. The families
covered are landing, company, contact, FAQ, journal index, journal article,
material index, material category, RFQ, three legal pages, service detail,
service category, capability detail, industry detail, 404 and the auth trio.

One route initially read `shellRoots=0` at 768 (`/hizmetler/cnc-frezeleme`).
Chased with `probe-768-servicedetail.mjs`: **5/5 rounds** and **6 neighbouring
widths (744/767/768/769/800/1024)** all report `shellRoots=1 headers=1
footers=1 mains=1 h1="CNC Frezeleme"`, with **no console or page errors**. The
first reading was my probe's own 700 ms settle being shorter than that lazy
chunk's mount. **Not a defect.**

**AC2 — PASS.** The rail/grid/rule/typography contract resolves on every inner
page, read from the browser rather than the stylesheet:

- `--tl-rail` resolves and the rail element *renders at that exact width* at
  every breakpoint: **64 px @1280, 56 px @768, 42 px @375**.
- `--tl-cols` resolves to **12 / 6 / 4**, and the footer band's
  `grid-template-columns` resolves to **13 / 7 / 5** tracks — rail + cols — on
  every non-auth route.
- `--tl-font-mono`, `--tl-font-serif`, `--tl-rule`, `--tl-rule-size`,
  `--tl-sheet-max` (`1600px`) and `--tl-gap` all resolve on every route.
- On the pages that already use the field, the first body child lands exactly
  on the rail axis (`content=65/65` at 1280, `57/57` at 768, `42/42` at 375).

Where inner-page bodies do *not* sit on the field (`/hakkimizda` 192,
`/iletisim` 304, `/blog/:slug` 528 at 1280) the cause is the body's own
shadcn container, not the shell — and the criterion is that the contract be
**available**, which it is. Inner-page bodies are the listed Phase 07/08
carry-forward.

**AC12 — FAIL (1 new serious node), with a second finding the Orchestrator
must rule on.**

*The shell itself is clean.* `probe-axe-attribution.mjs`, 13 routes × 2 widths,
axe with `wcag2a/2aa/21a/21aa`, scoping the header and the footer directly and
then attributing every whole-page node:

```
scopedHeader = 0 on all 10 routes that mount it, at both widths
scopedFooter = 0 on all 10 routes that mount it, at both widths
TOTAL serious/critical nodes attributable to the SHELL (or outside <main>): 0
```

`/`, `/hakkimizda`, `/kvkk`, `/gizlilik-politikasi`, `/cerez-politikasi` and the
404 are entirely clean at 1280 and 375. That is a real achievement of this
phase and it is what the re-aimed assertion in
`shared-shell-accessibility.spec.ts` was reaching for.

*But there is a new violation, and it is caused by the shell.* Re-running the
**identical Phase 03 QA tool** (`p03-axe-audit.mjs`, same tags, copied to
`p04-axe-same-tool.mjs`) against the Phase 04 build and diffing against the
committed `p03-axe-results.json` baseline:

| lane | Phase 03 baseline | Phase 04 | delta |
|---|---|---|---|
| 1280 `/` closed / open | 0 / 0 | 0 / 0 | — |
| 375 `/` closed / open | 0 / 0 | 0 / 0 | — |
| 1280 `/hizmetler/cnc-frezeleme` closed | `color-contrast` ×28, `scrollable-region-focusable` ×1 | `scrollable-region-focusable` **×2** | **+1 node** |
| 375 `/hizmetler/cnc-frezeleme` closed | `color-contrast` ×28 | none reported | see below |

**D1 — NEW serious node: `scrollable-region-focusable` 1 → 2 at 1280.**
Causally attributed, not guessed (`probe-b24-delta.mjs`):

```
horizontally scrollable regions at 1344px (= 1280 + the 64px rail): 1
horizontally scrollable regions at 1280px:                          2
```

Both regions are `div.relative.w-full.overflow-auto` inside `<main>`, with
`scrollWidth` 776 and 840 against `clientWidth` **743**; neither has a
`tabindex` nor contains a focusable descendant. Measured geometry on that page
at 1280: `sheet w=1280`, `main w=1278`, `rail w=64`, content field
`left=65 w=1214`. The shell's 64 px rail narrowed the inner-page content field,
and a table that previously fitted now overflows. This is a **WCAG 2.1.1
keyboard-access defect**: a keyboard-only reader cannot scroll that table to
the columns that are cut off. It is inside the page body, so the Coder's
re-aimed assertion ("no blocking node outside `main#main-content`") passes over
it.

**D3 — B24 was WORSENED, and axe's silence is not a fix.** The packet asked me
to confirm B24 was neither fixed nor worsened. It was worsened, and the 28
`color-contrast` violations did not disappear because they were repaired — they
moved into axe's `incomplete` bucket (`probe-b24-incomplete.mjs`):

```
1280px: violations = scrollable-region-focusable x2
        INCOMPLETE = serious color-contrast x13
          "Element's background color could not be determined because it is
           overlapped by another element"
375px:  violations = (none)
        INCOMPLETE = serious color-contrast x11
          "Element's background color could not be determined due to a
           background gradient"
```

The flagged elements are still rendered and still low contrast — measured
directly on the page: 6 chips, `color: rgb(10,125,138)`, own background
`rgba(10,125,138,0.1)`, first opaque ancestor `rgb(249,248,245)`, `12px/700`
(small text, 4.5:1 required). Composited and recomputed:

| ground | composited chip background | contrast |
|---|---|---|
| Phase 03, `#ffffff` | `rgb(231,242,243)` | **4.261 : 1** |
| Phase 04, measured `#f9f8f5` | `rgb(225,236,234)` | **4.025 : 1** |

The same effect on `/sss`, which axe *does* still report: `#94a0ab` on the new
`#fbf8f1` ground reads **2.51 : 1**, against **2.67 : 1** on pure white. The
paper surface moved already-failing inner-page text further from the floor.
That is the explicitly listed *"inner-page bodies on the shadcn light theme
(Phases 07/08)"* carry-forward, so it is not scored as a Phase 04 failure —
but the Coder's comment in `shared-shell-accessibility.spec.ts` describing
these nodes as *"already failing"* understates it: they are failing **more**,
and the phase's own change made them so.

*Full sweep, for the correction packet* (`probe-axe.mjs`, 16 routes × 2 widths,
97 serious + 16 critical nodes total, **all in page bodies**):

| route | 1280 | 375 |
|---|---|---|
| `/`, `/hakkimizda`, `/kvkk`, `/gizlilik-politikasi`, `/cerez-politikasi`, 404 | clean | clean |
| `/hizmetler/cnc-frezeleme` | `scrollable-region-focusable` ×2 | clean |
| `/sss` | `color-contrast` ×34 | ×34 |
| `/blog` | `color-contrast` ×8, `select-name` ×1 | same |
| `/iletisim` | `color-contrast` ×1, `label` ×1, `select-name` ×2 | ×3 |
| `/malzemeler` | `select-name` ×2 | ×2 |
| `/teklif-al` | clean | **`button-name` ×4 (critical)** |
| `/giris` | `color-contrast` ×3 | ×3 |
| `/sifremi-unuttum`, `/reset-password` | `color-contrast` ×1 each | ×1 each |

**D4 (unproven whether new).** `/teklif-al` at **375** carries 4 **critical**
`button-name` nodes ("Element does not have inner text that is visible to
screen readers") on the RFQ stepper — the primary conversion page, at mobile.
At 1280 the same page is clean. I cannot call this new: the Phase 03 same-tool
baseline covers only `/` and `/hizmetler/cnc-frezeleme`, and Phase 03's prose
"`/teklif-al` clean" does not state a width. Recorded so it is not lost.

### Block 8 — the assertion changes, judged

| change | verdict |
|---|---|
| `footer.bantOrani < 0.17` → `< 0.26` | **re-aim, not a weakening** — empirically breached by all three named degradations at the gate's own width (Block 4) |
| `malzemeler-sticky`: `"KVKK Aydınlatma Metni"` → `"KVKK"` | **rename** — verified: `legalLinks` in `ia.ts` publishes the label `KVKK` and the destination `/kvkk` is unchanged and reachable |
| `footer-reveal` ROUTES 3 → 5, `scroll-snap-regression` 2 → 3 | **broadening** — strictly more coverage |
| `shared-shell-accessibility`: `/teklif-al` moved into the full-shell set; 89 → 90 routes; 404 exception `header:0 footer:0` → `1/1` | **strengthening** — the shell's presence is now required where its absence used to be tolerated |
| `technical-landing`: wait for menu animations to settle before the axe scan | **legitimate** — measures the settled colour instead of a mid-fade composite; scope unchanged; bounded by a 10 s poll |
| `shared-shell-accessibility`: `every node.html.includes("text-primary/30")` → `no blocking node outside main#main-content` | **mixed.** Stricter about the shell (any shell node now fails, whatever its class) and demonstrably satisfied — the shell scores 0. But it no longer bounds the *quantity or identity* of body debt, so a newly-introduced body violation passes it. D1 is exactly such a violation. Not scored as a §12 violation, but the gap is real and should be closed by pinning a node-count inventory per route. |
| `[data-footer-information-band]` → `getByRole("contentinfo")` for the reduced-motion animation check | **broadening** — one band → the whole footer |
| `footer .container-industrial` → `footer` for safe-area padding | **equivalent** — the deleted mega footer put the inset on the Tailwind container; the surviving band puts it on itself. Verified: the assertion still measures that no content escapes the safe area on any of four edges |

No skips, xfails or deleted coverage were introduced. Golden regeneration is
the one §12 concern, and it is D0 below.

### Block 9 — final verdict

**STATUS: FAIL.**

Phase 04 is, in most respects, a strong and well-evidenced piece of work: one
shell on 20 routes across 3 widths, one footer, one route subtree, B25 closed
structurally and reproducibly (8/8 twice, by two independent methods), the 404
WCAG 2.2.1 hijack removed, `/teklif-al` given a working footer, the grid held
at 339 measured edges, and **zero** serious/critical axe nodes anywhere in the
shell itself. It fails on two specific, fixable items.

## Acceptance criteria matrix

| Criterion | Result | Evidence |
|---|---|---|
| AC1 all public families in one shell | **PASS** | `probe-ac2-contract.mjs` 20 routes × 3 widths, `shellRoots=1 mains=1 mainIsShell=true` everywhere; 768 anomaly disproved by `probe-768-servicedetail.mjs` (5/5 rounds, 6 widths) |
| AC2 rail/grid/rule/type contract available to inner pages | **PASS** | rail renders 64/56/42 px = token; footer tracks 13/7/5 = cols+1; all six `--tl-*` tokens resolve on every route |
| AC3 transition on direct load / client nav / Back / Forward | **PASS** | `probe-transition.mjs`: 1 curtain, `animation-name: route-curtain 1.06s`, 1/1/1 wrapper/header/main at every step |
| AC4 `Footer.tsx`, `footer/**`, `ScrollProgress.tsx` gone, nothing imports them | **PASS** | files absent from disk; `grep` over `src e2e scripts index.html` finds only prose comments plus unrelated `heroScrollProgress` and a local `footerLinks` variable |
| AC5 36 shell goldens across 6 surfaces | **PASS** | `git diff --name-status` → 36 added `shell-*` PNGs (6 surfaces × 2 captures × 3 widths); visual suite 27 passed |
| AC6 `/teklif-al` footer with working legal links | **PASS** | footer present (298 px, 53 links); all three legal links clicked and landed on `/kvkk`, `/gizlilik-politikasi`, `/cerez-politikasi` with correct `h1` and no 404 shell |
| AC7 B25 does not reproduce | **PASS** | Coder gate `--repeat-each=8` → 8 passed; independent user-driven probe → 8/8 clean |
| AC8 no stuck transition from rapid clicks | **PASS** | two attacks; 1/1/1 after each, no `inert`, no `overflow:hidden`, all 6 curtain panels `pointer-events:none` |
| AC9 typecheck / lint / build | **PASS** | exits 0, 0, 0 |
| AC10 critical / smoke / visual + Phase 03 guarantees | **PASS** | 136 + 12 + 27 passed; the single red is a teardown timeout that passes in 8.7 s isolated; teardown matrix and reachability specs green |
| AC11 grid probe 0 off-grid | **PASS** | `GRID AXIS PROBE: PASS`, 339 edges, `grep -c OFF = 0` |
| AC12 no new serious/critical axe | **FAIL** | `scrollable-region-focusable` 1 → 2 on `/hizmetler/cnc-frezeleme` @1280, caused by the shell rail (2 regions at 1280, 1 at 1344) |

## Scrutiny points

| Point | Result | Evidence |
|---|---|---|
| S1 375 golden body change | **REGRESSION** | `.tl-sheet` keeps `border-inline:1px` at ≤767 on `/` only, because `technical-landing.css` re-imports `master-grid.css` into a later chunk; 1 px shift + a wrapped spec value + 15 px cascade; confirmed a third time by `shell-footer-home.png` being 373 px vs 375 px |
| S2 `bantOrani` 0.17 → 0.26 | **PASS** | every Coder number verified to ≤1 px; all three named degradations empirically breach 0.26 at 1280 |
| S3 footer link parity | **PASS** | all 4 detail pages and both anchors traced to `navigationItems` / `landingSections`; reachability gate green |
| S4 B25 root cause structural | **PASS** | no `AnimatePresence`, no `setTimeout`, no new listener; curtain outside the routed subtree; transition still animates |
| S5 auth routes in `PageShell` | **PASS** | 0 headers, 0 footers, 1 `<main id="main-content">`, skip-link target present on all three |
| S6 pruned CSS rule | **PASS** | rule present in `dist/assets/PageShell-*.css`; it is the only `[data-chat-launcher]` rule in `dist/` |
| S7 contrast fix | **PASS** | recomputed: new tokens 10.007:1 and 6.077:1; Coder's figures off by ≤0.12 but every conclusion holds |
| S8 404 auto-redirect removed | **PASS** | no `window.location` outside a comment; page renders, is reachable, offers 4 recovery links + header + footer |
| S9 unreferenced leftovers | **PASS** | none of the three reaches `dist/` (ASCII fingerprints used) |

## Discrepancies found

**D0 — the 375 landing golden pins a layout regression (BLOCKING).**
`e2e/__golden__/win32/visual-375/landing-fullpage.png` was regenerated on the
stated premise "footer growth and nothing else". That premise is true at 1280
and 1440 and false at 375, where the whole body moved 1 px right and 15 px down
and `120.00 × 72.00 × 68.00 mm` wraps onto two lines. Root cause:
`src/styles/technical-landing.css:4` still `@import`s `master-grid.css`, so the
landing chunk re-emits the base `.tl-sheet` rule after `shell.css` and defeats
the `@media (max-width:767px){.tl-sheet{border-inline:0}}` override that Phase
04 moved into `src/styles/shell.css:87`. Fix belongs in production code (make
the override survive the cascade — e.g. keep it in the same stylesheet as the
base rule, or raise its specificity), then regenerate the 375 golden.
Independently visible in the Coder's own `shell-footer-home.png` (373 px vs
375 px on every other surface).

**D1 — new serious axe node (BLOCKING for AC12).**
`scrollable-region-focusable` went 1 → 2 nodes on `/hizmetler/cnc-frezeleme` at
1280. The shell's 64 px rail narrows the inner-page content field from 1278 to
1214, pushing a 776 px table past its 743 px container. Neither region is
keyboard-reachable. WCAG 2.1.1.

**D2 — heavy-route mount race (non-blocking, record for Phase 09/13).**
A menu-trigger click landing in the same frame as a heavy lazy route's mount
opens nothing: `/malzemeler` **2/10** with motion on, **3/10** under reduced
motion, `/kvkk` **0/10**. It is **not** the curtain (it reproduces identically
with reduced motion, where no curtain is rendered) and it is **not** a stuck
state — **0/10 unrecoverable**, versus B25's 8/8. State after a miss is fully
clean (1 trigger, 1 header, 1 main, `aria-expanded=false`, no lock).

**D3 — B24 worsened and is now masked.** See AC12 above: 4.261 → 4.025 on the
measured chip, and axe reclassified 13 nodes (1280) / 11 nodes (375) from
`violation` to `incomplete`. A future report reading only violation counts will
believe B24 was fixed. It was not.

**D4 — `/teklif-al` at 375 has 4 critical `button-name` nodes** on the RFQ
stepper. Unproven whether new (no same-tool baseline at that route/width).

**D5 — commit SHAs in the task packet do not match the worktree.** Packet
listed `7d01465 d2c7dc1 6a3bc84 f3cd3f5 a059aef`; the worktree contains
`9c66c47 7fee96e ce5303e 56c8831 a695c0a`. Same count, same integration HEAD
`a695c0a`, so the audit target is unambiguous.

**D6 — two menu links share the accessible name `İletişim`** (`/#iletisim` and
`/iletisim`). Pre-existing (`ia.ts`, Phase 03) and it cost me a false probe
failure. Worth a distinguishing label; owner is the navigation phase.

**D7 — `technicalLandingData.footerColumns` is now dead data**, referenced only
from comments. Cleanup for a later phase.

## Commands run

```text
git diff --name-status 77f9f7c..a695c0a
npm run typecheck                                   # exit 0
npm run lint                                        # exit 0
npm run build                                       # exit 0, 1m24s
npm run preview -- --port 4200 --strictPort         # 4173 and 4199 occupied
PLAYWRIGHT_BASE_URL=http://localhost:4200 npx playwright test \
  --project=critical-1280 --project=critical-375    # 136 passed / 1 env-failed / 3 skipped
  ... e2e/landing/landing-process-flow.spec.ts      # isolated re-run: 2 passed
  ... -g "B25" --repeat-each=8                      # 8 passed
  --project=visual-375 --project=visual-1280 --project=visual-1440   # 27 passed
  --project=smoke-webkit-1440 --project=smoke-webkit-390 \
  --project=smoke-firefox-1440 --project=smoke-firefox-390           # 12 passed
PROBE_BASE_URL=http://localhost:4200 node scripts/grid-axis-probe.mjs # PASS, 339 edges
PROBE_BASE_URL=http://localhost:4200 node reports/qa/tools/p04-axe-same-tool.mjs
node reports/qa/tools/{golden-diff,golden-xshift,golden-rowprofile,golden-crop}.mjs
node reports/qa/tools/{contrast,probe-s1-cause,probe-sheet-border}.mjs
node reports/qa/tools/{probe-s2-footer-bound,probe-transition,probe-ac8-diagnose}.mjs
node reports/qa/tools/{probe-trigger-clickability,probe-malzemeler-race}.mjs
node reports/qa/tools/{probe-axe,probe-axe-attribution,probe-ac2-contract}.mjs
node reports/qa/tools/{probe-b24-delta,probe-b24-incomplete,probe-768-servicedetail}.mjs
```

## Scope integrity — PASS

- Production files modified by QA: **NONE**. No file under `src/**`,
  `public/**`, `e2e/**`, `e2e/__golden__/**`, `scripts/**`, `docs/**`,
  `index.html`, any config, `PROGRESS.md`, `IMPLEMENTATION.md` or
  `USER_INPUTS.md` was written.
- Test/report files modified by QA: `reports/qa/phase-04.md` and 19 read-only
  probe tools under `reports/qa/tools/**` — both inside `QA_WRITE_ALLOWLIST`.
- The S2 fifth-column breach was produced by **runtime DOM injection in a
  throwaway browser context**; no `dist/` file and no source file was altered.
- No credential was printed. `.env` untouched.
- No repo test was added, weakened, skipped or deleted; no golden regenerated.

## Notes

- Preview ran on **port 4200** (4173 and 4199 were occupied), passed to
  Playwright via `PLAYWRIGHT_BASE_URL` so the config's managed web server was
  bypassed and `dist/` was reused.
- `node_modules` (a Windows junction) was never reinstalled, pruned or removed.
- Carry-forwards acknowledged and re-confirmed unchanged in kind: inner-page
  bodies on the shadcn light theme (Phases 07/08), support-launcher FAB styling
  (Phases 09/13), win32-only golden coverage, content wording (Phase 06).

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

---
---

# RE-VERIFICATION — correction packet #1

Original FAIL findings above are retained verbatim. This section verifies only
what was sent back: D0, D1, the new gate's teeth, the "no other split" claim,
the B24 contradiction and the axe-node-count drop.

- Code under test: `9809889`, `829cadf`, `94f87c3`, `fe42ce8`; integration HEAD `97e134b`
- Prior QA FAIL commit: `4dc80d4`
- Worktree: `C:\Users\Trade Bilisim\pdh-wt\qa-p04c` on `wt/qa-p04c`
- Machine note: ~0.5 GB free of 7.85 GB. All suites run serially against one
  prebuilt `dist/`. Any `ERR_INSUFFICIENT_RESOURCES` is recorded as
  environmental, not as a code defect.

## Scope integrity

`git diff --name-status 4dc80d4 97e134b` — 7 files, all allowlisted for the Coder:

```text
M  e2e/__golden__/win32/visual-375/landing-fullpage.png
M  e2e/__golden__/win32/visual-375/shell-footer-home.png
A  e2e/landing/shell-cascade-contract.spec.ts
M  src/components/shell/PageShell.tsx
A  src/components/shell/useScrollableRegionAccess.ts
M  src/styles/master-grid.css
M  src/styles/shell.css
```

No existing spec file was modified, so no assertion could have been weakened,
skipped or deleted in place. The only `e2e/` change is one added spec plus two
regenerated 375 goldens. 1280 and 1440 goldens untouched. SCOPE INTEGRITY: PASS.

## Static gates

| Gate | Result |
|---|---|
| `npm run typecheck` (3 projects) | PASS, exit 0 |
| `npm run lint` (`eslint .`) | PASS, no output |
| `npm run build` | PASS, built in 57.04s |

## R1 (structure) — D0 fix is in the right file at the right specificity

`src/styles/master-grid.css`: base `.tl-sheet { border-inline: var(--tl-rule-size) solid var(--tl-rule) }`
at line 75; override `@media (max-width: 767px) { .tl-sheet { border-inline: 0 } }`
at line 85, in the same file, ten lines below its base. No `!important`, no
specificity bump — confirmed by `grep -rn "border-inline" src/`. `shell.css:87`
now carries only a comment where the override used to be. The override is
therefore inlined into exactly the chunks its base is.

## R3 — the "no other split" claim, verified independently

Two tools were written for this, both parsing the emitted CSS with **postcss**
rather than regex, and both covering **all three** emitted chunks — not just the
two the Coder diffed (`index-BibnsWyF.css`, the entry chunk, was outside the
Coder's stated diff).

- `reports/qa/tools/p04c-chunk-split-audit.mjs` — selector-level first pass.
- `reports/qa/tools/p04c-cascade-split-precise.mjs` — the precise D0 shape:

> carriers(S,P) = chunks declaring (S,P) at base context.
> For every override context C where SOME carrier declares (C,S,P):
> if not ALL carriers declare it, that is a D0-shaped split.

Result on the fixed build:

```text
Index-C3pIdRxX.css:     388 selectors
PageShell-Nrxx0bdD.css: 260 selectors
index-BibnsWyF.css:    1786 selectors

(selector,property) pairs with a DUPLICATED base across chunks: 83
D0-SHAPED SPLITS: 0
```

The 83 duplicated-base pairs are a **larger** duplication surface than the
Coder's report of "5 shared selectors, 10 identical rules": `.tl-band` x5,
`.tl-grid` x8, `.tl-sheet` x4, `.tl-subgrid` x7 and 59 `:root` custom
properties are all inlined into both chunks. The Coder undercounted its own
exposure, but its conclusion is correct: **zero** of those 83 has an override
that ships in one carrier and not the other.

The selector-level pass additionally reports 0 value conflicts and 0 splits for
`.tl-sheet` / `.tl-band` / `.tl-grid` / `.tl-subgrid`. Its only other hits were
on a bogus selector token `:focus-visible)` produced by naive comma-splitting
inside `:is(...)`; the precise tool splits parens-aware and those disappear.
