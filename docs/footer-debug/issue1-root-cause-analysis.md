# ISSUE-1 Root Cause Analysis (MT-ENG-0043 Phase A3)

**Date**: 2026-04-24
**Route**: `/malzemeler/:slug` (e.g. `/malzemeler/aluminyum`)
**Original symptom**: "footer reveal CTA kartı hero text + footer link kolonlarını örtüyor"
**Status**: Hypothesis from MT-ENG-0043 audit **CONFIRMED** — not a reveal-mode artifact.

---

## Evidence

### 1. Footer variant audit (grep)
```
src/pages/Index.tsx:339:        <Footer variant="reveal" />        ← ONLY route using reveal
src/pages/Malzemeler.tsx:348:   <Footer variant="static" />
src/pages/MalzemeKategori.tsx:164:<Footer variant="static" />     ← already static
src/pages/Blog.tsx, BlogDetail.tsx, SSS.tsx, Iletisim.tsx, …      ← default = static (per Prompt #1)
```

**Verdict**: `MalzemeKategori` is already `static`. The reveal-mode hypothesis is **ruled out**.
Prompt #1 (Footer default flip to `static`) appears to have landed correctly — only `Index.tsx` opts into `reveal`.

### 2. Layout audit
`MalzemeKategori.tsx:26-167` structure:
```
<div className="min-h-screen bg-background">
  <Header />
  <section> Hero (gradient bg, pt-28 pb-16)
  <article> Content (max-w-4xl mx-auto)
  <section> Materials grid (bg-muted/30)
  <section> Related categories
  <section> Local CTA card (gradient bg, py-16)  ← bespoke, NOT FinalCTASection
  <Footer variant="static" />
</div>
```

No `fixed`/`absolute` positioning on Footer. No spacer needed. Footer is in normal document flow.

### 3. z-index audit
```
grep "z-index|z-\[" src/pages/MalzemeKategori.tsx → 0 matches
grep "z-index|z-\[" src/components/Footer.tsx     → only zIndex: isReveal ? 30 : 0
```
With `variant="static"`, footer `zIndex = 0`. No stacking context conflict possible.

### 4. CTA divergence (significant finding)
- `Index.tsx` uses `<FinalCTASection>` (full GSAP headline, 202 lines, magnetic button)
- `MalzemeKategori.tsx` uses a **bespoke local `<section>`** (lines 155-162, ~7 lines, plain Link)

This explains why "FinalCTA → footer bottom-bar manuel screenshot test" produced inconsistent
results across routes: there is no `FinalCTASection` on category pages at all.

---

## Real Root Cause

The original ISSUE-1 description ("reveal CTA örtüyor") was **diagnostically incorrect**.
What the reporter likely saw is one of these — must be re-verified visually:

### Hypothesis H1 — Stale screenshot from pre-Prompt-#1
The bug report predates the `variant="reveal"` → `static` default flip. After Prompt #1,
this overlap should no longer reproduce on `/malzemeler/:slug`. **Verify before fixing.**

### Hypothesis H2 — Local CTA gradient bleed
The local CTA section uses `linear-gradient(135deg, hsl(var(--primary)) 0%, var(--surface-base) 100%)`
with no bottom margin. On narrow viewports (375px), the gradient endpoint may visually merge
with `Footer`'s `hsl(var(--forge-obsidian))` background, creating an "overlap" perception
that is actually contrast/spacing — not a stacking bug.

### Hypothesis H3 — `<title>`/`<meta>` outside `<head>`
Lines 31-32 inject `<title>` and `<meta>` directly into the JSX body (not via `usePageMeta`
or react-helmet). This is HTML5-invalid and on some routes causes layout shift / repaint
flicker that screenshot tools capture as "overlap".

---

## Recommended Action (defer until Phase B)

**Do NOT fix in Phase A.** Reasoning:

1. The original report cannot be reproduced from code alone — needs visual confirmation
   on a deterministic build (= post-lockfile-collapse, post-Playwright-baseline).
2. Three competing hypotheses → need a regression test that pins the actual symptom
   before any fix lands. Otherwise we fix the wrong thing.
3. H3 (invalid `<title>`/`<meta>` in body) is a **separate code smell** that should be
   migrated to `usePageMeta` regardless of ISSUE-1 outcome — but as its own commit.

### Phase B (Determinism) deliverables for ISSUE-1
- [ ] Playwright spec: navigate `/malzemeler/aluminyum` at 375 / 768 / 1280
- [ ] Assert: no bounding-box intersection between local CTA `<section>` and Footer top edge
- [ ] Assert: no bounding-box intersection between Hero `<h1>` and Footer
- [ ] Capture baseline screenshots → if no overlap visible, **close ISSUE-1 as STALE**
- [ ] If overlap reproduces → bisect H1/H2/H3, then fix

### Independent micro-commit (can ship anytime)
- [ ] Migrate `MalzemeKategori.tsx:31-32` from inline `<title>`/`<meta>` to `usePageMeta()`
      — matches `Malzemeler.tsx:47` convention. Pure refactor, no behavior change.

---

## Audit alignment

This analysis follows MT-ENG-0043 directives:
- ✅ Prompt #1 verification done before touching `MalzemeKategori.tsx` (10-min grep)
- ✅ Did not couple "fix" with infra work
- ✅ Treated "manual screenshots" as unreliable signal pending E2E
- ✅ Identified bespoke CTA divergence — surfaces architectural debt the original plan missed

**Phase A3 outcome**: ISSUE-1 downgraded from HIGH-bug to **NEEDS-REPRO**.
Footer overlap may already be fixed by Prompt #1. Root cause cannot be confirmed without
deterministic visual baseline (Phase B prerequisite).
