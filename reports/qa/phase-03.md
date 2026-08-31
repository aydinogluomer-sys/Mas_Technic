# QA Report — Phase 03 (GLOBAL AWWWARDS NAVIGATION + INFORMATION ARCHITECTURE)

- PHASE: 03
- CODE_COMMIT: `1d5ea91` (integration HEAD) + 8 preceding
  (`b0a630a f71f40f c8503f1 0408842 4738c41 b928ff8 3158d54 3e7a621`)
- BASE FOR DIFF: `e8b7b97`
- QA_COMMIT: `1c7e5df` (part 1) + this commit
- **STATUS: FAIL**
- TESTS_PASSED: 138 (107 repository Playwright tests + 31 QA-authored checks)
- TESTS_FAILED: 7 (5 = the reduced-motion modal trap, R1; 2 = pre-existing
  non-navigation axe debt, carry-forward)
- TESTS_SKIPPED: 12 (all lane guards, no coverage lost)
- NEW_TESTS_ADDED: 0 automated repository tests. `QA_WRITE_ALLOWLIST` excludes
  `e2e/**`, so the regression coverage this phase needs (see R1) must be added
  by the Coder. 8 QA-owned verification tools were added under
  `reports/qa/tools/**`.
- Worktree: `C:\Users\Trade Bilisim\pdh-wt\qa-p03`, branch `wt/qa-p03`
- Ports: `4301` critical, `4302` visual, `4303` smoke, `4304` mobile-320,
  `4306` grid probe, `4307` QA preview. (`4173/4174/4175/4187/4199` were
  already occupied by other agents.)

> **Evidence policy.** Every verdict below is backed by a command this agent
> ran or a pixel/DOM value this agent read. No Coder or Orchestrator summary is
> treated as evidence.

---

## Headline

The consolidation itself is excellent work: one header, one typed IA, zero
orphan routes, a legitimate golden regeneration, a clean grid, and a menu with
no accessibility violations of its own. **It is failed by one defect.**

**R1 — under `prefers-reduced-motion: reduce` the fullscreen menu cannot be
closed, and cannot navigate. The user is sealed inside an inert, scroll-locked
modal with no recovery except a page reload.** It reproduces at 320, 375 and
1280, on the landing and on inner pages. It is a Phase 03 regression: the
header this phase deleted did not have it.

---

## Acceptance criteria matrix

| # | Criterion | Result | Evidence |
|---|---|---|---|
| AC1 | One global public navigation on `/` and all public inner pages | **PASS** | `Header.tsx` is a real 537-line component (was a one-line alias). `grep -rn "HeaderFullscreen\|components/menu/\|menu-tokens\|TechnicalHeader" src/ e2e/ scripts/` → comment text only, **zero imports**. Runtime: exactly 1 `[data-fullscreen-header]`, 1 `[data-menu-trigger]`, 1 `.tl-header-spacer` on `/`, `/hakkimizda` and after `goBack`, and the trigger count sampled every 90 ms across the whole back-transition curtain was `[1,1,1,1,1,1,1,1,1,1,1,1]`. |
| AC2 | No public page orphaned | **PASS** | Re-derived independently (`reports/qa/tools/p03-ia-audit2.mjs`): 26 public route declarations, 74 nav targets, **0 orphans**, 0 IA targets without a backing route or data record, 0 dev-route leaks, 7 exclusions each with a reason cross-checked against `reports/baseline/route-inventory.md`. Runtime: `navigation-reachability.spec.ts:178` resolved all 74 targets with no redirect and no not-found shell (44.3 s, `critical-1280`). |
| AC3 | No duplicate public header design language | **PASS** | The old vocabulary (`.tl-nav`, `.tl-language`, `.tl-mobile-menu`, `210px 1fr auto`, teal `#38b9c5` / orange `#f26b25`) is deleted from `src/styles/technical-landing.css` and absent from the built CSS. `grep -o -E "tl-mobile-menu\|tl-language" dist/**` → 0. The `/` shell exception row in `e2e/shared-shell-accessibility.spec.ts` was **removed**, and the full-shell count raised 88 → 89 with an explicit `toContain("/")`. |
| AC4 | Menu fully keyboard-operable | **FAIL** | Everything passes under normal motion — tab order `["Ana içeriğe geç", "MAS Technic ana sayfa", "[data-menu-trigger]", "TEKLİF AL"]`; Enter opens; 90 × Tab and 90 × Shift+Tab never escaped the dialog; Shift+Tab from the first of 30 focusables wrapped to the last ("Projeni Yükle"); ESC closed in 715 ms and restored focus to `[data-menu-trigger]`; scroll lock held a 1200 px wheel at `scrollY 0`; lock/inert released on close and on route change. **But under `prefers-reduced-motion: reduce` ESC does nothing at all** — see R1. "Fully keyboard-operable" is not conditional on a motion preference. |
| AC5 | Reduced-motion and mobile (320/375) both pass | **FAIL** | Mobile passes: at 320 and 375 the header is 64 px, the menu fills the viewport with 0 horizontal overflow, 3 families expand to **81 distinct hrefs** (74 route targets + 7 landing anchors), and no control is under 24 px. **Reduced motion fails outright** — see R1. |
| AC6 | Back/forward and deep links correct | **PASS** | Cold `/#kalite` landed the band at `top = 72` against a 72 px bar (`scrollY 2835`). `/hizmetler/cnc-frezeleme` survived a hard refresh with its `h1` and exactly 1 header. Back/forward chain `/ → /hakkimizda → /blog` returned `["/hakkimizda","/","/hakkimizda","/blog"]` with 1 header at the end. A history move with the menu open closed it and released the lock. |
| AC7 | Menu visual snapshots desktop + mobile, closed + open | **PASS** | 6 new goldens at `visual-375`, `visual-1280`, `visual-1440` × `{navigation-closed, navigation-open}`. I opened `visual-1440/navigation-open.png`: a real full menu (family rail 01/02/03, expanded "Talaşlı İmalat" with its four detail links, the three-column directory, legal row, "Projeni Yükle" CTA) — not a blank frame. `navigation-golden.spec.ts` forces the first category open at every width so mobile and desktop compare like with like, and uses the same absolute `maxDiffPixels: 200` budget (no ratio budget). |
| AC8 | typecheck / lint / build | **PASS** | `npm run typecheck` (3 tsconfigs) clean; `npm run lint` (`eslint .`) clean; `npm run build` exit 0. |
| AC9 | `test:e2e:critical` incl. shell contract + relocated `fullscreen-menu` | **PASS** | 79 passed, 3 skipped, 0 failed (6.9 min). Skips are lane guards: `landing-grid-axes:128` (runs at 375), `navigation-reachability:178` (**ran and passed at 1280**), `technical-landing:147` (runs at 1280). Also ran `test:e2e:visual` 9/9, `test:e2e:smoke` 12/12 (Firefox + WebKit @390/1440), `--project=mobile-320 e2e/shared-shell-accessibility.spec.ts` 7 passed / 9 skipped / 0 failed. |
| AC10 | `grid-axis-probe.mjs` 0 off-grid | **PASS** | `PROBE_PORT=4306 node scripts/grid-axis-probe.mjs` → `GRID AXIS PROBE: PASS — every measured edge sits on a master axis (tolerance 1px)` across 375/768/1280/1440/1600. |
| AC11 | Zero serious/critical axe on `/` and an inner page, menu closed + open | **PASS for the navigation; carry-forward debt elsewhere** | `/` at 1280 and 375, menu **closed and open**: **0 violations of any impact**. Inner page scoped to the navigation: `include("[data-fullscreen-header]")` → 0, `include("[data-fullscreen-menu]")` → 0. Whole-page `/hizmetler/cnc-frezeleme` reports 2 serious findings (`color-contrast` ×28 at `src/pages/ServiceDetail.tsx:278`, `scrollable-region-focusable` ×1). Neither file is in the Phase 03 diff, and the same class of debt exists on `/sss` (5), `/blog` (3 + `select-name`) and `/malzemeler` (`select-name`) — the repo's own spec already documents it as "non-shell debt". `/hakkimizda`, `/kvkk`, `/teklif-al` are clean. Carry-forward to Phase 04/06/07. |

## Scrutiny points

| # | Point | Result | Evidence |
|---|---|---|---|
| S1 | Golden regeneration legitimacy | **PASS** | Quantified below. |
| S2 | The two self-reported defects | **PASS (2) / PASS (1)** | Below. |
| S3 | B23 decision (a) — nothing deleted | **PASS** | Below. |
| S4 | Header settle race — not a sleep | **PASS** | Below. |
| S5 | `navigation-data.tsx` re-export | **PASS** | Below. |
| S6 | Band-01 grid break retired, interior measured | **PASS** | Below. |
| S7 | Deletions leave nothing dangling | **PASS** | Below. |
| S8 | Phase 07 carry-forward clipping | **PASS — the reported clipping no longer exists** | Below. |

---

# R1 — CRITICAL: the menu is a permanent modal trap under reduced motion

## What I measured

`reports/qa/tools/p03-esc-probe.mjs` — open the menu, press Escape, poll for 12 s:

```
1280 no-reduce   focusInDialog=BUTTON:Menüyü kapat   ESC-close=715ms        after={"present":false}
1280 reduce      focusInDialog=BUTTON:Menüyü kapat   ESC-close=NEVER(>12s)  closeBtn=NEVER
375  no-reduce   focusInDialog=BUTTON:Menüyü kapat   ESC-close=697ms        after={"present":false}
375  reduce      focusInDialog=BUTTON:Menüyü kapat   ESC-close=NEVER(>12s)  closeBtn=NEVER
320  reduce      focusInDialog=BUTTON:Menüyü kapat   ESC-close=NEVER(>12s)  closeBtn=NEVER
```

`reports/qa/tools/p03-reduced-motion-trap.mjs` — full state characterisation
at 375 and 1280 with `reducedMotion: "reduce"`
(`window.matchMedia("(prefers-reduced-motion: reduce)").matches === true`):

```
menu open    : menuPresent=true  bodyOverflow=hidden  rootInert=true  rootAriaHidden="true"  headerInert=true
after ESC #1 : menuPresent=true  bodyOverflow=hidden  rootInert=true  rootAriaHidden="true"  headerInert=true
after ESC #2 : menuPresent=true  bodyOverflow=hidden  rootInert=true  rootAriaHidden="true"  headerInert=true
after closeBt: menuPresent=true  bodyOverflow=hidden  rootInert=true  rootAriaHidden="true"  headerInert=true
after wheel  : menuPresent=true  bodyOverflow=hidden  scrollY=0        (1200px wheel absorbed)
tab target   : BUTTON:01 Hizmetler insideMenu=true
after link   : location.pathname === "/"     <-- clicking "Hakkımızda" did NOT navigate
```

`reports/qa/tools/p03-trap-shot.mjs`, two Escapes plus 8 s of waiting:

```
landing-1280 (/)           {"menuStillMounted":1,"bodyOverflow":"hidden","rootInert":true}
inner-375    (/hakkimizda) {"menuStillMounted":1,"bodyOverflow":"hidden","rootInert":true}
```

Screenshots: `reports/qa/tools/crops/reduced-motion-trap-landing-1280.png`,
`…-inner-375.png`.

## Severity

For a user with reduced motion enabled — the exact population this feature is
supposed to protect — the global navigation is **completely non-functional**:

- it cannot be closed by Escape,
- it cannot be closed by its own close button,
- it cannot navigate anywhere (menu links are inert as navigation),
- the page underneath is `inert` + `aria-hidden="true"` and scroll-locked,
- there is no `Escape` hatch at all; only a browser reload or leaving the site.

This is a WCAG 2.1 SC 2.1.2 (No Keyboard Trap) violation on the site's primary
navigation, and it breaks the Phase 03 mandatory task *"Implement keyboard
navigation, focus trap, ESC close, focus restoration, scroll lock, route-close
behavior and reduced-motion variant."*

## Root cause

`src/components/Header.tsx`, the menu's `motion.div`:

```tsx
initial={reducedMotion ? "visible" : "hidden"}
animate="visible"
exit={reducedMotion ? "visible" : "exit"}          // <-- exit target === animate target
transition={reducedMotion ? NAV_MOTION.reduced : NAV_MOTION.open}   // reduced = { duration: 0 }
```

Under reduced motion the **exit variant is identical to the animate variant**
(`visible` → `clipPath: "inset(0 0 0% 0)"`), so Framer Motion schedules no exit
animation and `<AnimatePresence onExitComplete={finishExit}>` never fires.

`finishExit` is the **only** caller of `setPhase("closed")` and the only place
`navigate(pendingHref)` and `pendingSectionScroll` are honoured. So the
component parks permanently in `phase === "closing"`, where
`modalActive = phase !== "closed"` is still `true` — which is why the scroll
lock, the `inert` and the `aria-hidden` are never released, and why clicking a
link does nothing.

Confirmed as a **regression**, not inherited: the deleted
`src/components/HeaderFullscreen.tsx` at base `e8b7b97` used

```tsx
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={reducedMotion ? MENU_MOTION.reduced : MENU_MOTION.close}
```

— a real 1 → 0 value change even at `duration: 0`, so `onExitComplete` fired.

## Why no test caught it

`e2e/fullscreen-menu.spec.ts` contains both halves but never together:

- line ~145: opens the menu and asserts `Escape` → `toHaveCount(0)` — **no
  reduced motion**;
- line 154 `"reduced motion opens without a delayed hidden state"` — emulates
  reduced motion, **opens the menu, and never closes it**.

`e2e/visual/navigation-golden.spec.ts` is the only other spec that opens the
menu under reduced motion (the `visual-*` projects declare
`reducedMotion: "reduce"`), and it only screenshots the open state. So the
phase was green with a completely broken reduced-motion close path.

## What a correction packet needs

1. Give the exit variant a real value change under reduced motion (or drive the
   close through a path that does not depend on `onExitComplete`, e.g. also
   settling `phase` from an effect when `isVisible` is false).
2. Add regression coverage that **opens and then closes** the menu under
   `prefers-reduced-motion: reduce` at 320, 375 and 1280 — asserting the menu
   unmounts, `body`/`html` `overflow` is released, `#root` loses `inert` and
   `aria-hidden`, focus returns to `[data-menu-trigger]`, and that a menu link
   clicked under reduced motion actually changes `location.pathname`.
3. `e2e/fullscreen-menu.spec.ts` is not in `CRITICAL_MATCH`; consider whether
   the reduced-motion menu contract belongs in the gate.

---

# S1 — Golden regeneration forensics (quantified)

Method: extract the base goldens with `git show e8b7b97:…`, decode both with
the `pngjs` bundled in `playwright-core`, align `new[y]` against `old[y − dH]`,
and report **amplitude**, not merely "not byte-identical".
Tools: `reports/qa/tools/p03-golden-compare.cjs`, `p03-golden-amplitude.cjs`,
`p03-golden-crop.cjs`.

**Dimensions** — all three are exactly **1 px shorter**, none changed width:

| Project | old | new | dH |
|---|---|---|---|
| visual-375 | 375×8923 | 375×8922 | **−1** |
| visual-1280 | 1280×3981 | 1280×3980 | **−1** |
| visual-1440 | 1440×4036 | 1440×4035 | **−1** |

**The real figure.** The Coder's "measured 0.03–0.04 of pixels" matches nothing
I can reproduce. Mine, whole page, aligned by −1:

| Project | non-identical px (any amplitude) | px with amplitude ≥ 16/255 |
|---|---|---|
| visual-375 | 395 902 / 3 345 750 = **11.83 %** | 3 355 = **0.100 %** |
| visual-1280 | 654 219 / 5 094 400 = **12.84 %** | 6 920 = **0.136 %** |
| visual-1440 | 768 402 / 5 810 400 = **13.22 %** | 6 939 = **0.119 %** |

**Where the change is.** Rows whose change is visually meaningful (amplitude
≥ 16 on ≥ 1 % of the row) group into exactly three families:

| Region | 375 | 1280 | 1440 | Peak amp. | What it is |
|---|---|---|---|---|---|
| A — header band | y 8..55 | y 12..59 | y 12..59 | 236 | band 01 replaced by the global navigation — **the intended redesign** |
| B — landing footer nav | y 8528..8583 | y 3830..3883 | y 3886..3939 | 190 | two footer labels — **intended IA consolidation** |
| C — process connector (375 only) | y 2066..2071 | — | — | 220 | 46 px — a **Phase 02** fix the goldens had not absorbed |

Everything else that differs peaks at **amplitude 1–3 out of 255**. The two
largest such regions (1280 y 90..899 and y 2278..2905; 1440 the same bands)
account for nearly all of the 12–13 % figure and peak at **amplitude 2** — the
webp art re-rasterising after the 1 px reflow. I cropped 1280 y 2278..2905 old
vs new (`crops/b-1280-{old,new}.png`) and they are identical to the eye:
sector imagery and the "HASSASİYET İDDİA EDİLMEZ. ÖLÇÜLÜR." manifesto band,
unchanged.

**Region B is in scope.** `crops/foot-1280-{old,new}.png`:

```
old:  Hakkımızda / Vizyon & Misyon / Sertifikalar / Kariyer
new:  Hakkımızda / Teknik Günlük   / Sertifikalar / Sık Sorulanlar
```

Exactly the two entries `reports/baseline/route-inventory.md` flagged as
mis-targeted ("*Vizyon & Misyon* and *Kariyer* point at `/hakkimizda` and
`/iletisim`, i.e. there is no such page"). One typed IA now feeds the landing
footer, which is a Phase 03 mandatory task.

**Region C is Phase 02 debt, not Phase 03 drift.** `crops/a375w-{old,new}.png`
show the "↓" flow connector between process steps 02 and 03: **absent** in the
old golden, **present** in the new. Provenance via `git log -S`:
`43d8adb fix(landing): restore mobile 02 to 03 process flow arrow` landed in
Phase 02 *after* the last golden refresh `cfe5ad0`; it moved
`.tl-process li:nth-child(2)::after{display:none}` out of
`@media (max-width:1180px)` into `@media (min-width:768px) and (max-width:1180px)`.
The 46-pixel delta stayed under the spec's `maxDiffPixels: 200`, which is why
`visual-375` was still green at base. The new golden is the *more* correct one.

**S1 verdict: PASS.** The regeneration is legitimate; meaningful change is
confined to the band-01 redesign, the footer relabel the IA consolidation
requires, and a 46-pixel Phase-02 fix. **No unrelated region changed above
amplitude 3/255.** Independent corroboration: `npm run test:e2e:visual` re-ran
all 9 goldens from my own fresh build and all matched, so the new baselines are
reproducible rather than one-shot captures.

---

# S2 — The two self-reported defects

**(1) Anchor navigation.** Fixed, and I verified the fix rather than the claim.
`reports/qa/tools/p03-runtime-audit.mjs` opened the menu and clicked four
section controls at two widths:

```
375 : surec scrollY=1357 top=64/64 | projeler 2929 top=64/64 | kalite 6124 top=64/64 | iletisim 7594 top=64/64
1280: surec  682 top=72/72 | projeler 1526 top=72/72 | kalite 2835 top=72/72 | iletisim 3180 top=446/72
```

The menu closed each time (`menus: 0`) and the band came to rest exactly under
the bar. The `iletisim` outlier at 1280 is **not** a defect: `scrollY 3180`
equals `maxScrollY 3180` (`docHeight 3980 − viewportH 800`) — the page is at its
natural bottom and the 141 px section physically cannot rise further. Verified
separately in `p03-followup.mjs` §3 (`atBottom: true`).

**(2) Two header instances.** Fixed. Counts are 1/1/1 on `/`, `/hakkimizda` and
after `goBack`, and I sampled `[data-menu-trigger]` every 90 ms across the whole
`goBack` curtain: `[1,1,1,1,1,1,1,1,1,1,1,1]`. **It did not break the
no-header routes**: `/giris`, `/reset-password`, `/sifremi-unuttum` and a 404
URL all report `header: 0` **and** `spacer: 0`, so the in-flow spacer is not
added where no bar exists. `/teklif-al` correctly reports `header: 1, spacer: 1`.

---

# S3 — B23 decision (a): nothing deleted, both sides pinned

- **320 lane** (`shared-shell-accessibility.spec.ts` ~line 667): the old
  `toBeVisible()` + bounds block was replaced by **two** assertions —
  `expect(getByRole("button", {name:"Yukarı çık"})).toHaveCount(0)` **and**
  `expect(locator(".floating-scroll-top").evaluateAll(…display)).toEqual(["none"])`.
  The `toEqual(["none"])` form is non-vacuous in both directions: deleting the
  element yields `[]` and fails; re-exposing it without changing the CSS rule
  yields a non-`none` display and fails.
- **375 lane** (reduced-motion audit, ~line 738): the identical pair, in the
  `else` branch of `if (desktopWidth)`.
- **>768 lane**: `toBeVisible()` → `click()` → `__shellScrollBehaviors` must
  contain `"auto"` — byte-identical to base, only re-indented into the `if`.
  The reduced-motion `scrollTo` contract is **untouched**.
- Executed: `--project=mobile-320 e2e/shared-shell-accessibility.spec.ts`
  → 7 passed, 9 skipped, 0 failed; the safe-area test carrying the 320 B23
  assertions is among the 7.

---

# S4 — Header settle race

Spec fix is a real condition wait, not a sleep:

```ts
await expect.poll(() => header.evaluate((element) =>
  element.getAnimations({ subtree: true })
    .filter((animation) => animation.playState === "running").length)).toBe(0);
```

No `waitForTimeout` was added. Root fix confirmed: `grep -n "transition"
src/styles/navigation.css` returns 12 declarations and **every one names its
properties** (`border-color`, `background-color`, `color`, `transform`). There
is no `transition: all` anywhere in the new stylesheet.

---

# S5 — `navigation-data.tsx` compatibility surface

16 lines, 14 of them comment, 2 of them:

```ts
export type { NavigationColumn, NavigationItem, NavigationLink } from "./navigation/ia";
export { navigationItems } from "./navigation/ia";
```

No competing IA. Only importer: `src/components/LandingFlow.tsx` (dev-only
`/legacy-landing`). Production absence measured on the `dist/` I built:

```
grep -ril "legacy-landing\|LandingFlow\|HeaderFullscreen\|menu-tokens" dist/   → NO MATCHES
grep -o -E "navigationItems|SoundToggle|ThemeToggle|technical-preview|TechnicalHeader|tl-mobile-menu|tl-language" \
     dist/assets/index-B37UiImF.js | sort | uniq -c                            → 1 technical-preview
```

The lone `technical-preview` hit is the pre-existing `ScrollProgress` route
suppression documented in the Phase 00 baseline — a string comparison, not a
route or a link.

---

# S6 — Band-01 grid break retired, interior genuinely measured

The probe's new blocks under `root: ".tl-header-band"` are `.tl-brand`,
`.tl-header-context` and `.tl-header-actions` — the three **children** of the
`subgrid`, not just `.tl-header`'s outer edges. Measured:

```
── 375px ──  Header header  42.00 C0 0.00 | 375.00  C4 0.00  OK
             Header brand   42.00 C0 0.00 | 291.75  C3 0.00  OK
             Header actions 291.75 C3 0.00 | 375.00 C4 0.00  OK
── 1600px ── … GRID AXIS PROBE: PASS — every measured edge sits on a master axis (tolerance 1px)
```

`.tl-header-context` is `display:none` below 768 so it is unmeasurable there; it
is measured at 768/1280/1440/1600. **0 off-grid at all five widths.**

---

# S7 — Deletions

- `useSoundEngine` appears in `src/App.tsx` only inside an explanatory comment;
  there is no `import` of it. The hook is still imported by `HeroSection`,
  `MagneticButton`, `ui/BracketButton`, `ui/CustomCursor` — all four verified.
- `SoundToggle.tsx` / `ThemeToggle.tsx` remain on disk with **zero** importers
  and do not ship to `dist/`. Carry-forward per the packet.
- Green `typecheck` + `lint` + `build` is the mechanical proof that no dangling
  import survives.

---

# S8 — Inner-page clipping: the reported defect no longer exists

I measured the top of `#main-content` and of any breadcrumb-ish landmark
against the fixed bar's height on 11 routes × 3 widths
(`p03-runtime-audit.mjs`, S8 block):

| Width | Bar | Result |
|---|---|---|
| 320 | 64 px | all 11 routes clear the bar, `clippedBy = 0` |
| 375 | 64 px | all 11 routes clear the bar, `clippedBy = 0` |
| 767 | 64 px | all 11 routes clear the bar, `clippedBy = 0` |

On `/hizmetler/:slug`, `/endustriyel/:slug` and `/kabiliyetler/:slug` the main
region starts at exactly `y = 64` — flush with the bottom of the 64 px bar, not
8 px behind it. The `h1` sits at 120–258 px depending on route. `/malzemeler`
and `/teklif-al` render no `#main-content`/`<main>` (pre-existing structure,
Phase 04) but their `h1` is at 204 / 160, well clear.

**The "still clipped by 8px" carry-forward the Coder reported is not
reproducible on the integrated build.** `.tl-header-spacer` reserves
`calc(var(--gnav-h) + var(--shell-safe-top,0px))` inside `#shared-header-host`,
which resolves to the full bar height. No other route is clipped by the newly
in-flow fixed bar.

---

## Discrepancies found

1. **R1 (blocking).** The Coder's summary reports a working reduced-motion
   variant. It does not work: the menu cannot be closed or navigated from under
   `prefers-reduced-motion: reduce`, at any width, on any route.
2. **S1 figure.** "measured 0.03–0.04 of pixels" is not reproducible. The real
   figures are 11.83 / 12.84 / 13.22 % non-identical at any amplitude, and
   0.100 / 0.136 / 0.119 % at amplitude ≥ 16/255. The conclusion still holds,
   but the number cited as evidence does not.
3. **S1 sign.** The height change is **−1 px** (pages got shorter), not "+1".
4. **S1 completeness.** The justification named only the band-01 redesign plus
   the 1 px reflow. Two further meaningful regions changed and were not
   declared: the landing footer relabel (in scope, correct) and a 46-pixel
   Phase-02 process-arrow fix the goldens had not previously absorbed
   (legitimate, but it is Phase 02 debt being settled inside a Phase 03
   regeneration, and it should have been stated).
5. **S8.** The reported "still clipped by 8px on `/hizmetler/:slug` and
   `/endustriyel/:slug` at ≤767" does not reproduce — those routes measure
   `clippedBy = 0` at 320, 375 and 767. The carry-forward appears already
   fixed; carrying it forward as an open defect would have been misleading.
6. **Reachability spec robustness (non-blocking).** `ROUTE_PATTERNS` is sliced
   between two string literals in `src/App.tsx`. If either literal is renamed,
   `indexOf` returns `-1`, the slice collapses to `""`, and the static half of
   the gate passes vacuously. Both literals are present today (I re-derived the
   same 26 routes independently), so this is hardening for a later phase.

## Non-Phase-03 carry-forward (recorded, not failed)

- Whole-page axe debt outside the navigation: `/hizmetler/cnc-frezeleme`
  `color-contrast` ×28 (`src/pages/ServiceDetail.tsx:278`) +
  `scrollable-region-focusable` ×1; `/sss` `color-contrast` ×5; `/blog`
  `color-contrast` ×3 + `select-name`; `/malzemeler` `select-name` ×2. None of
  these files are in the Phase 03 diff. Owner: Phase 04/06/07.
- `TeklifAl.tsx` importing `Footer` without rendering it — pre-existing,
  Phase 04.
- ~130 lines of dead `.menu-*` / `.shared-public-header` CSS in `src/index.css`
  — allowlist prevented removal, Phase 04/12.
- `design-tokens.css` duplicated across two CSS chunks — Phase 12.
- Unreferenced `SoundToggle.tsx` / `ThemeToggle.tsx`.
- The win32-only golden gap.

## Failed checks

| Check | Error / observation | Root cause | Production fix required? |
|---|---|---|---|
| AC4 / AC5 — ESC close under reduced motion (320, 375, 1280) | Menu never unmounts; `body`/`html` stay `overflow:hidden`; `#root` stays `inert` + `aria-hidden="true"`; close button and menu links inert; only a reload recovers | `exit={reducedMotion ? "visible" : "exit"}` in `src/components/Header.tsx` makes the exit target identical to the animate target, so Framer schedules no exit animation, `AnimatePresence.onExitComplete` never fires, and `finishExit` — the only caller of `setPhase("closed")` and of `navigate(pendingHref)` — never runs | **YES** |
| AC11 whole-page, inner routes | 2 serious axe findings on `/hizmetler/cnc-frezeleme`, plus similar on `/sss`, `/blog`, `/malzemeler` | Pre-existing shadcn/Tailwind inner-page content; files untouched by Phase 03; navigation itself scores 0 | No — carry-forward Phase 04/06/07 |

## Commands run

```text
git diff --name-status e8b7b97 1d5ea91
npm run typecheck                                            # clean
npm run lint                                                 # clean
npm run build                                                # exit 0
PLAYWRIGHT_PORT=4301 PLAYWRIGHT_PREVIEW_ONLY=1 npm run test:e2e:critical   # 79 passed, 3 skipped
PLAYWRIGHT_PORT=4302 PLAYWRIGHT_PREVIEW_ONLY=1 npm run test:e2e:visual     # 9 passed
PLAYWRIGHT_PORT=4303 PLAYWRIGHT_PREVIEW_ONLY=1 npm run test:e2e:smoke      # 12 passed
PLAYWRIGHT_PORT=4304 PLAYWRIGHT_PREVIEW_ONLY=1 \
  npx playwright test --project=mobile-320 e2e/shared-shell-accessibility.spec.ts   # 7 passed, 9 skipped
PROBE_PORT=4306 node scripts/grid-axis-probe.mjs             # PASS, 0 off-grid
grep -ril "legacy-landing\|LandingFlow\|HeaderFullscreen\|menu-tokens" dist/        # NO MATCHES
npx vite preview --port 4307 --strictPort                    # QA's own preview
node reports/qa/tools/p03-ia-audit.mjs
node reports/qa/tools/p03-ia-audit2.mjs                      # 0 orphans, 0 dev leaks
node reports/qa/tools/p03-golden-compare.cjs
node reports/qa/tools/p03-golden-amplitude.cjs
node reports/qa/tools/p03-golden-crop.cjs  (×8 crops)
node reports/qa/tools/p03-runtime-audit.mjs                  # 25 checks
node reports/qa/tools/p03-esc-probe.mjs                      # isolates R1
node reports/qa/tools/p03-reduced-motion-trap.mjs            # characterises R1
node reports/qa/tools/p03-trap-shot.mjs                      # R1 screenshots
node reports/qa/tools/p03-axe-audit.mjs                      # 8 axe lanes
node reports/qa/tools/p03-followup.mjs
git status --porcelain
```

## Scope integrity

- **Production files modified by QA: NONE.**
- Test/report files modified by QA: `reports/qa/phase-03.md`,
  `reports/qa/tools/**` (8 verification scripts, 10 evidence images,
  `p03-axe-results.json`). Both are inside `QA_WRITE_ALLOWLIST`.
- The Coder's own scope: 42 files, all inside the phase allowlist; no
  `src/pages/**`, no build/workflow config, no `PROGRESS.md` /
  `IMPLEMENTATION.md` / `USER_INPUTS.md`.
- `SCOPE_INTEGRITY: PASS`

## Notes

- `PLAYWRIGHT_PREVIEW_ONLY=1` was used for the three Playwright gate runs so
  each did not re-run a ~4-minute `vite build`. The `dist/` they served is the
  one produced by my own `npm run build` at the top of this report, and it is
  the same `dist/` I grepped for dev-route leakage.
- `node_modules` is a Windows junction to the shared primary tree; it was never
  installed, pruned or modified.
- Old goldens extracted for comparison live at
  `reports/qa/tools/golden-old/` on disk but are deliberately **not committed**
  (4.5 MB of blobs already recoverable via `git show e8b7b97:…`).
