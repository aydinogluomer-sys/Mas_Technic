# QA Report — Phase 03 (GLOBAL AWWWARDS NAVIGATION + INFORMATION ARCHITECTURE)

- PHASE: 03
- CODE_COMMIT: `1d5ea91` (integration HEAD; +8 preceding: `4937757 e58a088 c3183d1 4c6ac37 8c2549c 9a1fcc3 e9b1c6e b6ab1d3 7b99416` per packet, resolved in this worktree to `b0a630a f71f40f c8503f1 0408842 4738c41 b928ff8 3158d54 3e7a621 1d5ea91`)
- BASE FOR DIFF: `e8b7b97`
- QA_COMMIT: see final commit on `wt/qa-p03`
- STATUS: **IN PROGRESS — part 1 committed**
- Worktree: `C:\Users\Trade Bilisim\pdh-wt\qa-p03`, branch `wt/qa-p03`
- Ports used: build/preview `4301` (critical), `4302` (visual), `4303` (smoke),
  `4306` (grid probe). `4173/4174/4175/4187/4199` were already occupied.

> **Note on evidence.** Every PASS below is backed by a command this agent ran
> or a file/pixel this agent read. No Coder or Orchestrator summary is treated
> as evidence. Where my measurement disagrees with the Coder's claim it is
> recorded in "Discrepancies found".

---

## Part 1 — gates, scope, IA, goldens

### Scope integrity

`git diff --name-status e8b7b97 1d5ea91` → 42 files, +2550/−1006.

Deleted, verified absent from disk **and** from every import graph
(`grep -rn` over `src/ e2e/ scripts/`):

- `src/components/HeaderFullscreen.tsx`
- `src/components/technical-landing/TechnicalHeader.tsx`
- `src/components/menu/{MenuCategoryPanel,MenuConversionRail,MenuFamilyRail,MenuTrigger}.tsx`
- `src/components/menu/menu-tokens.ts`

The only textual survivors of those names are **comments** in
`src/components/Header.tsx`, `src/components/navigation/ia.ts`,
`src/components/navigation/motion.ts` and `e2e/helpers.ts`. No `import` /
`export … from` statement references any of them.

`SCOPE_INTEGRITY: PASS` — no production file was written by QA. QA writes are
confined to `reports/qa/phase-03.md` and `reports/qa/tools/**`.

### Deterministic gates

| Command | Result |
|---|---|
| `npm run typecheck` (3 projects: app, node, e2e) | **PASS** — no diagnostics |
| `npm run lint` (`eslint .`) | **PASS** — no findings |
| `npm run build` | **PASS** — exit 0, `dist/` 22 MB |
| `PLAYWRIGHT_PORT=4301 npm run test:e2e:critical` | **PASS** — 79 passed, 3 skipped, 0 failed (6.9 min) |
| `PLAYWRIGHT_PORT=4302 npm run test:e2e:visual` | **PASS** — 9 passed, 0 failed (51.9 s) |
| `PROBE_PORT=4306 node scripts/grid-axis-probe.mjs` | **PASS** — 0 off-grid at 375/768/1280/1440/1600 |

The 3 critical skips are lane guards, not silenced coverage:

- `landing-grid-axes.spec.ts:128` (mobile rail share) — skipped on `critical-1280`, runs at 375.
- `navigation-reachability.spec.ts:178` (route resolution) — skipped on `critical-375`; **ran and passed on `critical-1280` in 44.3 s**, resolving all 74 navigation targets.
- `technical-landing.spec.ts:147` (reference proportions) — skipped on `critical-375`, runs at 1280.

### AC2 — orphan audit, verified independently

I did **not** rely on `e2e/landing/navigation-reachability.spec.ts`. I audited
the spec, then re-derived the union with my own tool
(`reports/qa/tools/p03-ia-audit.mjs`, `p03-ia-audit2.mjs`).

**Audit of the Coder's spec — it is *not* self-confirming.** Its route list is
regex-extracted from the live text of `src/App.tsx` (`ROUTE_PATTERNS`), and the
concrete URLs behind each `:slug` pattern come from the real data modules
(`categoryPages`, `servicePages`, `materialsData`, `blogData`). Only the
*exclusion table* is hand-maintained, and that table is what the test treats as
the thing needing justification (each entry's `reason` must exceed 20 chars, and
every dev route must be excluded **and** absent from `navigationTargets()`).

**My independent measurement** (`node reports/qa/tools/p03-ia-audit2.mjs`):

```
public route decls: 26        (matches reports/baseline/route-inventory.md: 30 total, 4 panel)
nav targets: 74
categoryPages: 15   (hizmetler 5, kabiliyetler 5, endustriyel 5)
servicePages: 48    (hizmetler 20, kabiliyetler 11, endustriyel 17)
materialCategories: 11   blogSlugs: 6
ORPHANS: []
IA TARGETS WITH NO ROUTE: []
IA TARGETS NOT BACKED BY DATA OR A STATIC ROUTE: []
DEV LEAK: []
```

74 = `/` + 15 category + 48 detail + 3 resources + 2 company + 3 legal +
`/teklif-al` + `/giris`. Every one of the 26 public route declarations is
LINKED, INDEX-OK, or EXCLUDED-with-reason. The 7 exclusions and their recorded
reasons:

| Route | Recorded reason | My verdict |
|---|---|---|
| `/sifremi-unuttum` | auth recovery, reached from `/giris` | matches `src/pages/Login.tsx` cross-link recorded in the Phase 00 baseline |
| `/reset-password` | Supabase e-mail token | matches baseline "reached only from a password-reset email" |
| `/cad-dashboard` | redirect alias for `/teklif-al` | matches `<Navigate to="/teklif-al" replace/>` in `src/App.tsx` |
| `*` | 404 catch-all | correct |
| `/technical-preview` | dev-only, DEV-guarded | verified in `dist/` (below) |
| `/legacy-landing` | dev-only, DEV-guarded | verified in `dist/` (below) |
| `/test` | dev-only, DEV-guarded | verified in `dist/` (below) |

Cross-check against `reports/baseline/route-inventory.md`: the baseline's
"Orphan / unreachable-from-navigation" table listed `/technical-preview`,
`/legacy-landing`, `/test`, `/cad-dashboard` as unreachable and flagged B14
("from the home page no service, sector, material, blog, FAQ, about or contact
route is reachable through the header"). B14 is closed: the runtime lane
`navigation-reachability.spec.ts:102` opens every family and every category on
`/` and proves all 74 hrefs are really in the DOM; I saw it pass at both 1280
and 375.

**Robustness observation (not a failure).** `ROUTE_PATTERNS` is sliced between
the literals `"const publicRoutes ="` and `"return isPanel ? panelRoutes : publicRoutes;"`.
If either literal is ever renamed, `indexOf` returns `-1`, the slice collapses
to an empty string, and the static half of the gate would pass vacuously. Both
literals are present today (I re-derived the same 26 routes with an independent
slice), so this is a hardening note for a later phase, not a Phase 03 defect.

### AC1 / AC3 — one public header, one design language

- `src/components/Header.tsx` is a real 537-line component, not an alias
  (`export const Header = (...)`). It is the only module that renders
  `[data-fullscreen-header]`.
- `grep -rn "HeaderFullscreen|components/menu/|menu-tokens|TechnicalHeader" src/ e2e/ scripts/` → comment text only, zero imports.
- `e2e/shared-shell-accessibility.spec.ts` moved `/` from `OWN_SHELL_ROUTES`
  into `STATIC_FULL_SHELL_ROUTES`; the exception row
  `{ route: "/", header: 0, footer: 1 }` was **removed**, not relaxed, and the
  full-shell count went 88 → 89 with an explicit `expect(FULL_SHELL_ROUTES).toContain("/")`.
  Total public surface stays 94 because `/` moved between sets.
- The old inner-page accent vocabulary (`teal #38b9c5`, `orange #f26b25`),
  `.tl-nav`, `.tl-language`, `.tl-mobile-menu` and the content-measured
  `210px 1fr auto` interior are all deleted from `src/styles/technical-landing.css`
  and absent from the built CSS.

### AC10 / S6 — band-01 grid break retired

`scripts/grid-axis-probe.mjs` now probes the header **interior**, not just its
outer edges. The added probe blocks are `.tl-brand`, `.tl-header-context` and
`.tl-header-actions` inside `root: ".tl-header-band"` — i.e. the three children
of the `subgrid`. Measured output, all five widths, tolerance 1.0 px:

```
── 375px ──  Header header 42.00 C0 0.00 | 375.00 C4 0.00   OK
             Header brand  42.00 C0 0.00 | 291.75 C3 0.00   OK
             Header actions 291.75 C3 0.00 | 375.00 C4 0.00 OK
── 1600px ── (…every band…)  GRID AXIS PROBE: PASS
```

(`.tl-header-context` is `display:none` at 375, so it is not measurable there;
it is measured at 768+.) Final line: `GRID AXIS PROBE: PASS — every measured
edge sits on a master axis (tolerance 1px)`. **0 off-grid.**

### S5 — `navigation-data.tsx` compatibility surface

`src/components/navigation-data.tsx` is 16 lines, of which 14 are comment and 2
are:

```ts
export type { NavigationColumn, NavigationItem, NavigationLink } from "./navigation/ia";
export { navigationItems } from "./navigation/ia";
```

No competing IA. Its only importer is `src/components/LandingFlow.tsx` (the
dev-only `/legacy-landing` tree). Production absence, measured on the `dist/`
I built:

```
grep -ril "legacy-landing\|LandingFlow\|HeaderFullscreen\|menu-tokens" dist/   → NO MATCHES
grep -o -E "navigationItems|SoundToggle|ThemeToggle|technical-preview|TechnicalHeader|tl-mobile-menu|tl-language" \
     dist/assets/index-B37UiImF.js | sort | uniq -c
     → 1 technical-preview
```

The single `technical-preview` hit is the pre-existing `ScrollProgress` route
suppression documented in `reports/baseline/route-inventory.md`; it is a string
comparison, not a route or a link. `navigationItems`, `SoundToggle`,
`ThemeToggle`, `TechnicalHeader`, `tl-mobile-menu` and `tl-language` do **not**
ship. **S5 PASS.**

### S7 — deletions leave nothing dangling

- `useSoundEngine` appears in `src/App.tsx` only inside the explanatory comment;
  there is no `import` of it. The hook file remains and is still imported by
  `HeroSection`, `MagneticButton`, `ui/BracketButton`, `ui/CustomCursor` — all
  four verified by `grep -rln`.
- `SoundToggle.tsx` / `ThemeToggle.tsx` remain on disk with **zero** importers
  (only their own declarations and one comment in `src/hooks/use-sound.ts`).
  Neither ships to `dist/`. Recorded as carry-forward per packet instructions.
- `typecheck`, `lint` and `build` are all green, which is the mechanical proof
  that no dangling import survives.

### S3 — B23 decision (a): nothing deleted, both sides pinned

Read from the diff of `e2e/shared-shell-accessibility.spec.ts`:

- **320 lane** (`mobile-320`): the old `await expect(scrollTop).toBeVisible()` +
  bounds assertions were replaced by **two** assertions —
  `await expect(page.getByRole("button", { name: "Yukarı çık" })).toHaveCount(0)`
  and
  `expect(await page.locator(".floating-scroll-top").evaluateAll(e => e.map(x => getComputedStyle(x).display))).toEqual(["none"])`.
  The `toEqual(["none"])` form is non-vacuous in both directions: deleting the
  element yields `[]` and fails; re-exposing it without changing the CSS rule
  yields `["block"]` and fails.
- **375 lane** (reduced-motion audit): same pair, in the `else` branch of
  `if (desktopWidth)`.
- **>768 lane** (1440): `toBeVisible()` → `click()` →
  `__shellScrollBehaviors` must contain `"auto"` — **byte-identical to base**,
  only re-indented into the `if`. The reduced-motion `scrollTo` contract is
  untouched. **S3 PASS** pending my own 320/375 runtime re-verification (part 2).

### S4 — header settle race is a real wait, not a sleep

The added wait is

```ts
await expect.poll(() => header.evaluate((element) =>
  element.getAnimations({ subtree: true })
    .filter((animation) => animation.playState === "running").length)).toBe(0);
```

— a condition poll on the Web Animations API, no `waitForTimeout`, no fixed
duration. `grep -n "waitForTimeout" e2e/shared-shell-accessibility.spec.ts` in
the changed hunks: none added.

Root fix verified: `grep -n "transition" src/styles/navigation.css` returns 12
declarations and **every one names its properties** (`border-color`,
`background-color`, `color`, `transform`). There is no `transition: all`
anywhere in the new stylesheet. **S4 PASS.**

### S1 — THE GOLDEN REGENERATION (highest priority)

I extracted the base goldens (`git show e8b7b97:…`) and compared them against
the committed new goldens with my own decoder
(`reports/qa/tools/p03-golden-compare.cjs`, `p03-golden-amplitude.cjs`, using
the `pngjs` bundled in `playwright-core`). Method: align `new[y]` against
`old[y − dH]` where `dH` is the height delta, then report **amplitude**, not
just "pixel is not byte-identical".

**Dimensions.** All three shrank by exactly **1 px in height**, none changed
width:

| Project | old | new | dH |
|---|---|---|---|
| visual-375 | 375×8923 | 375×8922 | **−1** |
| visual-1280 | 1280×3981 | 1280×3980 | **−1** |
| visual-1440 | 1440×4036 | 1440×4035 | **−1** |

(The Coder said "a 1px height change"; the sign is **−1**, the page got
shorter.)

**The real figure.** The Coder's phrase "measured 0.03–0.04 of pixels" matches
nothing I can reproduce. My measurement, whole page, aligned by −1:

| Project | non-identical px (any amplitude) | px with amplitude ≥ 16/255 |
|---|---|---|
| visual-375 | 395 902 / 3 345 750 = **11.83 %** | 3 355 = **0.100 %** |
| visual-1280 | 654 219 / 5 094 400 = **12.84 %** | 6 920 = **0.136 %** |
| visual-1440 | 768 402 / 5 810 400 = **13.22 %** | 6 939 = **0.119 %** |

**Where the change actually is.** Grouping rows whose change is visually
meaningful (amplitude ≥ 16 on ≥ 1 % of the row) gives only three families of
region, at every width:

| Region | 375 | 1280 | 1440 | Peak amplitude | What it is |
|---|---|---|---|---|---|
| A — header band | y 8..55 | y 12..59 | y 12..59 | 236 | band 01 replaced by the global navigation — **intended** |
| B — landing footer nav | y 8528..8583 | y 3830..3883 | y 3886..3939 | 190 | two footer link labels changed — see below |
| C — process connector (375 only) | y 2066..2071 | — | — | 220 | 46 px; the mobile `02→03` flow arrow — see below |

Everything else that is non-identical has **peak amplitude 1–3 out of 255** —
imperceptible resampling of the large `webp` art after the 1 px reflow. The two
largest such regions (1280: y 90..899 and y 2278..2905; 1440: the same bands)
account for almost all of the 12–13 % figure and peak at amplitude **2**. I
cropped and visually compared 1280 y 2278..2905 old vs new
(`reports/qa/tools/crops/b-1280-{old,new}.png`): identical to the eye —
sector imagery and the "HASSASİYET İDDİA EDİLMEZ. ÖLÇÜLÜR." manifesto band,
unchanged.

**Region B is in scope and intended.** Crops
`reports/qa/tools/crops/foot-1280-{old,new}.png` show exactly two label
changes in the landing footer's second column:

```
old:  Hakkımızda / Vizyon & Misyon / Sertifikalar / Kariyer
new:  Hakkımızda / Teknik Günlük   / Sertifikalar / Sık Sorulanlar
```

Those are precisely the two entries `reports/baseline/route-inventory.md`
flagged as mis-targeted ("*Vizyon & Misyon* and *Kariyer* point at
`/hakkimizda` and `/iletisim`, i.e. there is no such page"). Phase 03's stated
task was to make one typed IA feed the landing footer, so this change is
in-scope and correct.

**Region C is a Phase 02 debt, not Phase 03 drift.** The crop pair
`reports/qa/tools/crops/a375w-{old,new}.png` shows the vertical "↓" flow
connector between process steps 02 and 03: **absent** in the old golden,
**present** in the new one. Provenance, established with `git log -S`:
`43d8adb fix(landing): restore mobile 02 to 03 process flow arrow` landed in
**Phase 02**, *after* the last golden refresh `cfe5ad0`. It moved
`.tl-process li:nth-child(2)::after{display:none}` out of
`@media (max-width:1180px)` into `@media (min-width:768px) and (max-width:1180px)`
so it stops leaking into mobile. The 46-pixel delta stayed under the spec's
`maxDiffPixels: 200` budget, which is why `visual-375` was still green at base.
Phase 03's regeneration absorbed it. The new golden is the *more* correct one —
it shows what the CSS prescribes.

**S1 verdict: PASS.** The regeneration is legitimate. Meaningful change is
confined to (a) the band-01 redesign this phase exists to deliver, (b) the
footer relabel this phase's IA consolidation requires, and (c) a 46-pixel
Phase-02 fix that the goldens had not yet caught up with. No unrelated region
changed above amplitude 3/255. Corroboration independent of the Coder's claim:
`npm run test:e2e:visual` re-ran all 9 goldens from a fresh build and they all
matched (`9 passed`), so the new baselines are reproducible, not one-shot
captures.

### AC7 — navigation goldens exist and are substantive

Six new files, desktop **and** mobile, closed **and** open:

```
e2e/__golden__/win32/visual-375/{navigation-closed.png, navigation-open.png}
e2e/__golden__/win32/visual-1280/{navigation-closed.png, navigation-open.png}
e2e/__golden__/win32/visual-1440/{navigation-closed.png, navigation-open.png}
```

I opened `visual-1440/navigation-open.png` and confirmed it is a real capture
of the full menu (family rail 01/02/03, expanded "Talaşlı İmalat" category with
its four detail links, the ANA SAYFA BÖLÜMLERİ / KAYNAKLAR / KURUMSAL
directory, the legal row and the "Projeni Yükle" CTA) — not a blank or
degenerate frame. `e2e/visual/navigation-golden.spec.ts` forces the first
category open at every width before capture, so mobile and desktop compare like
with like, and uses the same absolute `maxDiffPixels: 200` budget as the
landing golden (no ratio budget). **AC7 PASS.**

---

*Part 2 (AC4 keyboard, AC5 reduced-motion + 320/375, AC6 history/deep links,
AC11 axe, S2 self-reported defects, S8 clipping) follows in the next commit.*
