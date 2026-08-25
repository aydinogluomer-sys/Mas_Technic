# MAS Technic Technical Editorial Landing — Implementation Plan

## 1. Objective

Rebuild the public landing page around the supplied 12-band reference: a dense technical drawing sheet that joins verified manufacturing proof, CNC imagery, quality documentation, the NEXUS production layer, and a direct RFQ path.

Success is not a static screenshot clone. The shipped page must preserve the reference's composition and visual character while remaining responsive, accessible, truthful, performant, and integrated with the existing React/Supabase product.

## 2. Binding visual direction

- **World:** precision drawing office × blackened CNC workshop × controlled inspection report.
- **Primary contrast:** graphite/near-black surfaces against warm technical paper.
- **Typography:** condensed display face where already available; Space Grotesk for readable UI; IBM Plex Mono for dimensions, labels, status and document metadata.
- **Geometry:** square corners, one-pixel rules, registration marks, dimension lines, coordinate ticks and drawing-title-block logic.
- **Density:** deliberate and technical, but with one dominant idea per band. Small text must remain legible and never be used merely as texture.
- **Signature interaction:** a manufactured part is revealed first; its measurement annotations resolve into verified process, quality and digital traceability evidence as the visitor moves down the page.
- **Motion principle:** motion behaves like a measuring instrument—precise, finite and stateful. No ambient looping on content or continuously moving dashboards.

## 3. Truth and content constraints

- Do not invent customers, certifications, measured tolerances, delivery percentages, production counts, report numbers or machine capabilities.
- Unverified proof appears as clearly labelled sample/demonstration data or is omitted.
- Customer logos require approved source assets and written permission; until then the reference band becomes a capability/sector trust band without third-party logos.
- Certification cards link only to verified documents. Placeholder certificates must be labelled `ÖRNEK DOKÜMAN` and excluded from structured claims.
- AI-generated imagery may portray parts and workshop atmosphere. Measurements, tables, labels, QR codes, certificates and technical drawings are rendered in HTML/SVG from controlled data.

## 4. Page architecture

| Ref | Section | Implementation | Primary proof/action |
|---|---|---|---|
| 01 | Header | `TechnicalHeader` | Navigation, language, RFQ |
| 02 | Hero | `TechnicalHero` | CNC part, dimensional annotation, part passport |
| 03 | Proof strip | `ProofStrip` | Verified capability facts |
| 04 | Process | `TechnicalProcess` | Analysis → DFM → production → inspection |
| 05 | NEXUS | `NexusEvidence` | Production traceability demo linked to portal |
| 06 | Selected projects | `MeasuredProjects` | Nominal/measured/result evidence |
| 07 | Sectors | `TechnicalSectors` | Sector-specific parts and relevant constraints |
| 08 | Manifesto | `MeasurementManifesto` | “Hassasiyet iddia edilmez. Ölçülür.” |
| 09 | Quality file | `QualityFile` | Verified document and report access |
| 10 | Trust band | `TrustBand` | Approved references or capability proof |
| 11 | FAQ + RFQ | `DecisionDesk` | Questions, resources, CAD upload entry |
| 12 | Footer | `DrawingFooter` | Contact, sitemap and drawing title block |

The new page lives behind a single `TechnicalLanding` composition. Existing public routes, Supabase flows, admin/customer panels, legal pages, blog and service pages remain intact.

## 5. Responsive contract

### Desktop ≥ 1280px

- Fixed-width drawing frame with a narrow numbered left rail.
- Hero uses a three-column composition: narrative, part stage, passport.
- NEXUS and measured project tables remain visible.
- Maximum text column length stays within 66 characters.

### Tablet 768–1279px

- Number rail becomes an in-flow band label.
- Hero passport moves below the part.
- NEXUS retains status cards; the wide table becomes a horizontally scrollable labelled region.
- Process switches to two columns.

### Mobile ≤ 767px

- No scaled-down desktop poster.
- Header becomes an accessible fullscreen menu.
- Part annotations reduce to three high-value markers; full specification opens as a disclosure panel.
- Proof strip becomes a two-column grid.
- Process, projects, sectors and quality documents become vertically ordered cards.
- Tables use accessible card representations; essential values remain visible without horizontal scrolling.
- Sticky RFQ action must not overlap footer, dialogs or focused controls.

## 6. Motion contract

- Header: 550–700 ms assembly from rules, logo mask and nav labels.
- Hero: part exposure plus SVG measurement-line drawing; annotations settle in a deterministic sequence.
- Scroll reveals: one finite reveal per band, driven by IntersectionObserver or GSAP context with complete cleanup.
- Process: the route line advances through four steps and respects keyboard focus.
- NEXUS: one finite data-acquisition sequence; no fake perpetual live updates.
- Project measurements: scanning rule reveals nominal/measured/result cells once.
- Manifesto: the strongest motion peak; CNC probe/media and typography converge.
- `prefers-reduced-motion: reduce`: all information appears immediately, pinned scrolling is disabled, smooth scrolling is disabled and decorative transforms are removed.
- Motion must never hide content before JavaScript readiness.

## 7. Asset plan

Reuse suitable current project imagery first. Generate or commission only missing hero/project/inspection images.

- `hero-technical-part`: isolated high-detail machined manifold on black stone, wide composition, no text.
- `process-machining`: top-down five-axis machining scene, room for editorial copy.
- `manifesto-inspection`: CMM probe inspecting a polished circular part, dark negative space for headline.
- `sector-*`: four distinct precision parts with consistent lens, lighting and backdrop.

Final generated assets are stored under `src/assets/technical-landing/`, converted to efficient WebP/AVIF where supported, assigned intrinsic dimensions and loaded according to viewport priority.

## 8. Component and styling boundary

- New files: `src/components/technical-landing/*`, `src/styles/technical-landing.css`, `src/data/technicalLandingData.ts`.
- `src/pages/Index.tsx` becomes the integration boundary after the new composition passes its phase gates.
- Existing `LandingFlow` and its CSS are preserved until final cutover so rollback remains possible.
- CSS is scoped under `.tl-root`; no global token or existing component behavior is changed without explicit need.
- All repeated proof, project, sector, document and FAQ content is data-driven.

## 9. Phases and gates

### Phase 0 — Contract and baseline

- Record this plan and the technical editorial design contract.
- Capture current build/test baseline.
- Confirm usable existing assets and content sources.

**Gate:** `npm run build`; targeted current landing smoke test.

### Phase 1 — Frame, header, hero and proof strip

- Implement drawing frame, numbered rail, header, hero part stage, SVG annotations, part passport and capability strip.
- Add accessible mobile navigation and reduced-motion states.

**Gate:** build, technical-landing hero E2E at 390/768/1440, keyboard menu test, axe scan, desktop/mobile screenshots.

### Phase 2 — Process, NEXUS and selected projects

- Implement light process band, NEXUS evidence panel and measured-project tables.
- Use labelled demonstration data until production-backed values are available.

**Gate:** build, data/section integrity tests, responsive overflow test, screenshots at 390/768/1440.

### Phase 3 — Sectors, manifesto and quality file

- Implement sector cards, manifesto media band and truthful quality document layer.

**Gate:** build, link/document-state tests, contrast and keyboard tests, screenshots at 390/1440.

### Phase 4 — Trust, decision desk and footer

- Implement approved trust band fallback, FAQ/resources, CAD handoff and drawing-title-block footer.

**Gate:** build, FAQ ARIA test, RFQ-route test, footer overlap test, full-page screenshots.

### Phase 5 — Choreography, optimization and cutover

- Add finite motion, route handoff, lazy assets and responsive final states.
- Replace the current landing composition only after all earlier gates pass.

**Gate:** full relevant Playwright suite, production build, detector scan, reduced-motion test, desktop/mobile full-page capture.

## 10. Visual comparison protocol

1. Capture the implementation at 724 px wide for direct reference-proportion comparison and at 1440 × 900 for production desktop QA.
2. Capture mobile at 390 × 844 and tablet at 768 × 1024.
3. Compare section-by-section rather than as unreadable full-page thumbnails:
   - frame/grid and header;
   - hero silhouette and annotation density;
   - dark/light rhythm;
   - NEXUS density;
   - project evidence tables;
   - manifesto peak;
   - document/FAQ/footer finish.
4. Classify discrepancies as structural, typographic, asset, spacing, color, interaction or content-truth issues.
5. Fix structural and asset mismatches before micro-spacing.
6. A screenshot is valid only after fonts/assets load and entrance motion settles.

## 11. Automated acceptance criteria

- Production build succeeds with no TypeScript/Vite errors.
- Technical landing E2E passes at 390, 768 and 1440 widths.
- No horizontal document overflow at supported viewports.
- Header/menu is fully keyboard operable; focus is trapped/restored on mobile.
- FAQ disclosure has correct accessible states.
- All CTAs resolve to existing routes.
- No serious/critical axe violations in the landing page.
- Reduced-motion renders every section without pinned or hidden content.
- Hero image has explicit dimensions and does not cause material layout shift.
- No generated or sample proof is presented as a verified company claim.

## 12. Visual acceptance criteria

- The first viewport unmistakably matches the supplied reference's technical drawing-sheet character.
- The hero is dominated by a believable machined part, not abstract decoration.
- Measurement annotations align with the part and remain legible.
- The page alternates dark workshop and warm paper bands with the same rhythm as the reference.
- NEXUS reads as production evidence, not a generic SaaS dashboard.
- Project cards communicate nominal vs measured outcome without requiring hover.
- The manifesto creates the page's visual climax.
- Mobile feels intentionally recomposed rather than scaled down.
- Motion strengthens measurement, assembly and verification metaphors without competing with content.

## 13. Stop condition

Implementation is complete only when phase gates are green, the final browser captures are valid, material reference mismatches have been resolved, and any remaining differences are intentional responsive/content-truth adaptations documented in the final handoff.

## 14. Completion record — 18 August 2026

- Phases 01–05 implemented and individually gated with production builds and viewport tests.
- `/` promoted to the technical landing; the former landing remains available at `/legacy-landing` for regression coverage.
- Desktop 1440, tablet 768 and mobile 390 captures inspected against the supplied reference.
- Final design detector result: no findings.
- Production build: passed.
- Full selected regression matrix: 164 passed, 109 intentionally skipped, 0 failed across 273 tests.
- Intentional reference deviations: unverified customer logos/certificates were not reproduced; sample records and documents are explicitly labelled; layouts recompose on narrow screens instead of shrinking the desktop poster.
