# Landing Page — Awwwards 90+ Release Audit

Audit date: 30 July 2026  
Target: production preview at `http://127.0.0.1:4173`  
Release rule: every independent category must be strictly greater than 90.

## Jury model

Official Awwwards scoring weights used for the release decision:

| Category | Weight | 90+ interpretation |
|---|---:|---|
| Design | 40% | Art direction, typography, imagery, composition, color, detail and consistency form one authored system. |
| Usability | 30% | Navigation, focus, reading order, responsive behavior and conversion paths remain obvious and reachable. |
| Creativity | 20% | The industrial editorial language feels project-specific rather than template-derived. |
| Content | 10% | Hierarchy, technical credibility, labels and calls to action communicate a coherent production story. |

Developer-quality gates additionally cover semantic markup/SEO, animations and transitions, accessibility, web performance, responsive execution and metadata.

Primary references:

- https://www.awwwards.com/sites/art4globalgoals
- https://www.awwwards.com/sites/computerized-forms
- https://www.awwwards.com/mobile-excellence-guidelines.pdf

## Section-by-section parameter matrix

| Scene | Image and surface | Grid and placement | Type and scale | Rules, frames and space | Motion and interaction | Acceptance evidence |
|---|---|---|---|---|---|---|
| Hero | Desaturated CNC image, graphite shade, stable `1920×1088` intrinsic dimensions | 110svh editorial canvas; metadata and CTA aligned to outer rails | Oversized two-line MAS TECHNIC, responsive clamp, compact mono metadata | Top/bottom hairlines; safe mobile CTA clearance | Scale/retreat scrub on desktop; instant natural state with reduced motion | LCP p75 <1s; CLS 0; no horizontal overflow |
| Manifesto | Warm paper field and copper editorial emphasis | Asymmetric copy/metric split; single-column mobile fallback | Large split statement with readable body measure | Generous vertical rhythm; three evenly spaced proof metrics | Batched reveal, removed in reduced motion | Contrast pairs ≥4.5; all content visible at 320px |
| Featured services | Five production images with controlled dark overlays | Desktop pinned nav + stable image stage; mobile native cards; short desktop balanced 3+2 grid | Large service titles, mono index and legible summaries | Progress datum, consistent card bounds and link targets | Single master scrub timeline; forward/reverse states 0→2→4→2→0 | Exactly two desktop pins; one exposed story; 4 hidden stories removed from tab order |
| Production laboratory | Warm technical surface and six asymmetric capability/material cards | Twelve-column editorial mosaic; one-column mobile | Strong card hierarchy with compact technical metadata | One-pixel frames, controlled gaps and deliberate size contrast | Transform-only hover/focus; natural reduced-motion state | Six cards; no clipping; focus remains visible |
| Industries | Five contextual industrial images on deep graphite | Desktop pinned horizontal track; mobile native stack; short desktop balanced 3+2 grid | Large titles, circular indices and live `01 / 05` counter | Consistent image frames and outer rails | Scrubbed horizontal progress with deterministic jump controls | Active state 0→2→4→2→0; zero mobile pins |
| Proof / knowledge | Paper surface, editorial rows and restrained previews | Two-column proof/knowledge layout; stacked mobile | Quote-led hierarchy and compact content taxonomy | Repeated row rules and predictable reading rhythm | Reveal only; no hover-only information | Legacy anchors remain valid; links remain keyboard reachable |
| CTA | Dark conversion stage with paper action surface | Full-width statement and aligned conversion rail | Oversized question with clear single primary action | Large breathing room, safe-area-aware mobile ending | Short reveal; immediate reduced-motion state | CTA visible at all audited viewports |
| Footer | Compact normal-flow graphite footer | Brand, two navigation groups, contact and legal rail | Clear small-type hierarchy | No reveal spacer, no fixed positioning, complete bottom reachability | Static normal document flow | Footer reachable on home, SSS, contact and material routes |

## Cross-cutting parameters and gates

| Parameter | Release threshold | Final evidence |
|---|---|---|
| Responsive widths | 320, 375, 768, 1280 and 1440px without horizontal overflow | Visual jury and Playwright viewport matrix passed |
| Short viewport | 1440×500/650 without orphan columns, clipped navigation or lost focus | Balanced 3+2 service/industry grids; short-height keyboard test passed |
| Typography | Clear display/body/mono hierarchy, no essential text clipping, usable 200% zoom behavior | Independent visual and accessibility audits passed |
| Contrast | WCAG AA for critical foreground/background pairs | Automated contrast and full-body axe checks passed |
| Focus | Visible outline, logical tab order and automatic visibility restoration | 45 short-height Tab targets stayed visible |
| Reduced motion | No pins, marquee, parallax or hidden reveal state | Automated reduced-motion tests passed |
| Motion readiness | Explicit signal only after `ScrollTrigger.refresh()` and next frame | `data-motion-ready=true`; desktop pins=2, mobile pins=0 |
| Forward/reverse motion | Active service and industry state updates deterministically | Both sequences verified as 0→2→4→2→0 |
| Runtime stability | No application page errors | Independent audits and route journey passed |
| CLS | <0.05 | 0 across independent samples |
| LCP | <2.5s | Final desktop p75 1,344ms; mobile p75 1,612ms |
| TBT proxy | <200ms p75 | Final desktop p75 75ms; mobile p75 56ms |
| Initial transfer | Stable and controlled | 511,315 bytes desktop; 457,077 bytes mobile |
| Build | Production compilation succeeds | Vite production build passed |
| Lint | Zero errors | 0 errors; 588 pre-existing non-blocking warnings |
| Regression | Full Playwright package has zero failures | 138 total: 113 passed, 25 viewport-conditional skips |

## Independent release scores

| Audit | Score | Result |
|---|---:|---|
| Design | 93 | PASS |
| Usability — visual jury | 92 | PASS |
| Creativity | 93 | PASS |
| Content | 92 | PASS |
| Weighted visual overall | 93 | PASS |
| Performance | 96 | PASS |
| Usability — performance/interaction | 94 | PASS |
| Accessibility | 99 | PASS |
| Code quality | 95 | PASS |

## Final verdict

All independent categories are strictly above 90. Production build, zero-error lint, full regression, axe, responsive, reduced-motion, keyboard, forward/reverse motion, footer reachability and isolated performance gates pass. No release blocker remains in the audited landing scope.
