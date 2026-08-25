# Trionn-Inspired CNC Signature — Implementation Report

## 1. Report Scope and Status

This document records the approved direction for a Trionn-inspired process-proof cinema on the MAS Technic landing experience. It is an implementation handoff and release-gate reference, not permission to copy a third-party visual identity.

The target is a distinctive MAS Technic signature: cinematic process storytelling, measurable proof, and precise industrial motion. Existing navigation, scroll ownership, accessibility behavior, responsive flow, and performance budgets remain authoritative.

| Field               | Status                                            |
| ------------------- | ------------------------------------------------- |
| Product surface     | Public landing page                               |
| Primary experience  | Five-stage process-proof cinema                   |
| Desktop mode        | Fine-pointer pinned cinema                        |
| Mobile/coarse mode  | Native vertical flow                              |
| Reduced-motion mode | Static visible sequence                           |
| Case-study policy   | Anonymous proof only unless explicitly approved   |
| Production release  | Implemented; content gate remains feature-flagged |

## 2. Triple Validation Record

The direction is accepted only after three independent validation lenses agree.

### 2.1 Experience Validation

- The pattern must clarify how MAS Technic turns an input into a controlled manufacturing result.
- Each stage must carry a distinct process statement, evidence unit, and media state.
- The interaction must preserve recognition, direct selection, keyboard visibility, and reverse navigation.
- The cinema must not become a decorative third scroll tunnel; it replaces or consolidates an existing storytelling responsibility.

### 2.2 Technical Validation

- GSAP/ScrollTrigger remains the sole owner of landing scroll timelines and pinned progress.
- Lenis remains the sole smooth-scroll owner on eligible fine-pointer desktop viewports.
- Framer Motion remains responsible for component presence, fullscreen menu lifecycle, dot navigation, and footer reveal groups.
- Mobile, coarse-pointer, short-height, and reduced-motion layouts must not create ScrollTrigger pins.
- Motion setup remains intent-gated and reports readiness through the established landing readiness contract.

### 2.3 Release Validation

- Performance and usability must independently score above 90.
- Automated coverage must validate five stages, two anchor sentinels, forward/reverse active state, focus selection, responsive natural flow, reduced motion, overflow, scene integrity, and proof-policy behavior.
- Visual review must confirm that the result is recognizable as MAS Technic rather than an imitation of Trionn.

| Validation lens | Required outcome                                    | Failure response               |
| --------------- | --------------------------------------------------- | ------------------------------ |
| Experience      | Process and proof are easier to understand          | Simplify or remove the pattern |
| Technical       | One owner per motion concern; deterministic cleanup | Refactor before visual polish  |
| Release         | Performance and usability both >90                  | Block release                  |

## 3. Accepted Trionn-Inspired Patterns

The accepted patterns are principles, not copied compositions.

| Pattern                     | MAS Technic adaptation                                                | Reason accepted                                 |
| --------------------------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| Cinematic state progression | Five manufacturing stages with synchronized process, proof, and media | Supports the real production narrative          |
| Editorial scale contrast    | Large process title paired with compact mono evidence                 | Matches the existing technical/editorial system |
| Single active scene         | Exactly one active process, proof, and media state on desktop         | Reduces cognitive competition                   |
| Controlled media reveal     | Mask/clip transition between stage media                              | Already compatible with GSAP ownership          |
| Direct stage navigation     | Five accessible stage triggers with current-state semantics           | Preserves user control and keyboard access      |
| Measured technical detail   | Tolerance, traceability, inspection, and output evidence              | Turns spectacle into credible proof             |
| Sparse reactive depth       | Small pointer-fine response in evidence/media fields                  | Adds signature without a new interaction system |
| Intent-gated motion         | Heavy motion initializes only after real user intent                  | Protects passive startup performance            |

## 4. Rejected Patterns and Decision Reasons

| Rejected pattern                                 | Reason                                                                |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| Third pinned landing sequence                    | Duplicates the two-scene scroll model and increases scroll fatigue    |
| WebGL liquid/distortion hero                     | Competes with the CNC hero, increases GPU/payload cost, and risks LCP |
| New custom cursor system                         | The repository already has a GSAP cursor with contextual labels       |
| Second smooth-scroll controller                  | Would conflict with Lenis and ScrollTrigger synchronization           |
| Global magnetic buttons                          | Reduces target predictability and harms navigation consistency        |
| Site-wide split-text animation                   | Duplicates reveal ownership and can hide text in reduced motion       |
| Hover-only evidence                              | Fails coarse-pointer and keyboard equivalence                         |
| Autoplay audio or ambient video                  | Adds consent, bandwidth, distraction, and mobile risks                |
| Client-identifying case studies without approval | Creates confidentiality and evidence-governance risk                  |
| Decorative pseudo-metrics                        | Weakens trust when values are not operationally defensible            |

## 5. Final Visual Storyboard

The storyboard uses five manufacturing stages. Copy and assets remain replaceable, but the hierarchy and behavior are fixed.

| Stage             | Process layer                               | Proof layer                                  | Media direction                   | Transition intent                 |
| ----------------- | ------------------------------------------- | -------------------------------------------- | --------------------------------- | --------------------------------- |
| 01 — Intake       | CAD, tolerance, material, quantity          | Input completeness and revision control      | Technical drawing/detail crop     | Establish datum and scope         |
| 02 — Engineering  | DFM, process planning, fixture logic        | Risk removal and manufacturability decision  | CAD/CAM or fixture image          | Move from idea to controlled plan |
| 03 — Machining    | Toolpath, setup, in-process control         | Repeatability and critical-dimension control | Machine/process image             | Highest cinematic energy          |
| 04 — Verification | CMM, surface, documentation                 | Measured result and traceability             | Inspection/report imagery         | Slow down and emphasize evidence  |
| 05 — Release      | Packaging, lot identity, delivery readiness | Approved output package                      | Finished component/dispatch image | Resolve into conversion action    |

### 5.1 Desktop Composition

- A stable pinned frame presents stage navigation, process copy, proof, and media.
- Stage triggers remain visible and directly selectable.
- Forward and reverse scrolling produce deterministic active states.
- Exactly one process, proof, and media unit is active and exposed to assistive technology.
- Start and end sentinels preserve anchor geometry and predictable release from the pin.

### 5.2 Mobile and Coarse-Pointer Composition

- All five stages appear in source order as natural vertical content.
- No horizontal track, forced pin, hover dependency, or hidden inactive content.
- Proof remains adjacent to the process statement it supports.
- Media uses reserved dimensions and deferred loading without layout shift.

### 5.3 Reduced-Motion Composition

- All process, proof, and media units are visible.
- No element depends on clip-path, opacity, or transform animation to become readable.
- No process pin is created.
- Marquee, parallax, tilt, scrub, and masked transitions resolve to static final states.

## 6. Technical Ownership Contract

| Concern                 | Owner                                     | Implementation rule                                                          |
| ----------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| Landing scroll timeline | GSAP/ScrollTrigger                        | Create inside the existing landing context and clean up on unmount           |
| Smooth desktop scroll   | Lenis                                     | No second controller; use immediate destinations for deterministic selection |
| Menu lifecycle          | Framer Motion                             | No GSAP injected into fullscreen modal navigation                            |
| Dot navigation presence | Framer Motion                             | Focus and hover labels must remain equivalent                                |
| Footer reveal           | Framer Motion                             | Reuse the current viewport reveal; no new global timeline                    |
| Responsive layout       | CSS media queries                         | Coarse, short-height, and reduced-motion use native layout                   |
| Scene state semantics   | React + DOM attributes                    | Maintain `aria-current`, `aria-hidden`, and tabindex ownership               |
| Deferred media          | IntersectionObserver/native image loading | Reserve dimensions and avoid eager below-fold requests                       |
| Runtime readiness       | Landing root data contract                | Expose readiness only after setup and refresh complete                       |

### 6.1 Process-Cinema DOM Contract

| Contract                        | Purpose                           |
| ------------------------------- | --------------------------------- |
| `[data-process-cinema]`         | Single experience root            |
| `[data-process-stage]`          | Five process units                |
| `[data-process-stage-trigger]`  | Direct accessible stage selection |
| `[data-process-proof]`          | Five synchronized proof units     |
| `[data-process-media]`          | Five synchronized media units     |
| `[data-process-anchor="start"]` | Stable entry sentinel             |
| `[data-process-anchor="end"]`   | Stable exit sentinel              |
| `[data-process-pin]`            | Desktop pinned frame target       |
| `[data-approved-case-study]`    | Governed approved-case content    |

## 7. Anonymous-Proof Feature-Flag Policy

Anonymous proof is the default and must remain useful without implying a named client relationship.

### 7.1 Default-Off Rule

- Approved case-study blocks are absent when the approval flag is false.
- Hidden CSS is not sufficient; unapproved content must not be rendered into the DOM.
- No client name, logo, proprietary drawing, part number, purchase quantity, or identifying metadata may ship through anonymous proof.

### 7.2 Anonymous Proof Requirements

- Use process categories, tolerance bands, documentation types, and generalized outcomes.
- Values must be operationally defensible and approved by the responsible MAS Technic stakeholder.
- Wording must avoid unverifiable superlatives and implied certification claims.
- Media must be owned, licensed, or safely anonymized.

### 7.3 Approval Enablement

An approved case-study flag may be enabled only after written content and asset approval. Enabling the flag requires a dedicated regression run and content review.

| Flag state | DOM policy                               | Content policy               |
| ---------- | ---------------------------------------- | ---------------------------- |
| False      | No approved case-study blocks rendered   | Anonymous proof only         |
| True       | Only explicitly approved blocks rendered | Approved copy/assets/version |

## 8. Awwwards-Target Release Gates

The target is not animation quantity. It is a coherent, original, fast, and usable industrial experience.

### 8.1 Performance Gates

| Metric                             | Gate                                                             |
| ---------------------------------- | ---------------------------------------------------------------- |
| Usability score                    | >90                                                              |
| Performance score                  | >90                                                              |
| LCP                                | <2.5s at p75                                                     |
| CLS                                | <0.1; target near zero                                           |
| TBT                                | <200ms at p75                                                    |
| Maximum startup long task          | Prefer <100ms; investigate >150ms                                |
| Horizontal overflow                | 0px                                                              |
| Desktop process pins               | Exactly one process pin plus existing approved landing pin count |
| Mobile/coarse/reduced process pins | 0                                                                |

### 8.2 Interaction Gates

- Five stages render in the intended order.
- Exactly one process, proof, and media unit is active on desktop.
- Forward and reverse scroll restore the correct active state.
- Focus selection scrolls the selected proof into a visible viewport region.
- Inactive interactive controls are removed from the tab order.
- Mobile/coarse content remains fully available in natural flow.
- Reduced-motion content has no hidden clip or opacity state.
- Nine public scene IDs remain unchanged.
- Start/end sentinels remain ordered and stable.
- Approved case-study blocks are absent when the flag is false.

### 8.3 Design-Jury Gates

- Originality: the result reads as MAS Technic precision manufacturing, not a Trionn clone.
- Hierarchy: process, proof, and conversion remain understandable in one scan.
- Restraint: no redundant cursor, pin, marquee, or text-reveal system.
- Craft: typography, masking, image crop, active-state transitions, and section release feel intentional in both directions.
- Content: every metric and proof statement is credible and decision-relevant.

## 9. Implemented File and Test Map

| Area                | File                                                                                                                            | Status      | Notes                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| Process cinema      | `src/components/landing/ProcessProofCinema.tsx`                                                                                 | Implemented | Five semantic stages, proof/media rails, sentinels and default-off cases           |
| Timeline hook       | `src/hooks/useProcessProofCinema.ts`                                                                                            | Implemented | One GSAP progress timeline; CSS sticky frame avoids Lenis pin transforms           |
| Landing integration | `src/components/LandingFlow.tsx`                                                                                                | Implemented | Existing Why/Capability responsibilities consolidated without a tenth anchor       |
| Dot navigation      | `src/components/SectionDotNav.tsx`                                                                                              | Implemented | Nine labels retained; virtual-anchor jump and half-scene handoff                   |
| Motion constants    | `src/config/landing-motion.ts`                                                                                                  | Implemented | Process tokens plus reduced service/industry scroll budgets                        |
| Responsive styling  | `src/styles/landing-flow.css`                                                                                                   | Implemented | Desktop cinema; mobile/coarse/short/reduced natural flow                           |
| Feature flag        | `ProcessProofCinema` props                                                                                                      | Implemented | Approved anonymous cases are default-off and absent from the DOM                   |
| E2E contract        | `e2e/process-proof-cinema.spec.ts`                                                                                              | Implemented | Stage, sentinel, reverse, focus, responsive, reduced, policy and overflow coverage |
| Project skills      | `.agents/skills/{adapt-trionn-to-cnc,choreograph-process-proof,verify-industrial-proof-content,judge-landing-awwwards-release}` | Implemented | All four pass `quick_validate.py`                                                  |

## 10. Verification Results

- Targeted ESLint: passed for the new component, hook, integration, tokens and E2E contract.
- Production build: passed; landing chunk is `13.18 kB` gzip and remains within the planned incremental budget.
- Desktop production E2E: `5 passed`, `1 not-applicable skipped`.
- Mobile 375 production E2E: `4 passed`, `2 desktop-only skipped`.
- Reduced-motion, horizontal overflow, default-off content governance and focus visibility passed.
- Local production preview: `http://127.0.0.1:4181`.
- Real approved anonymous cases have not been supplied; the Content release gate therefore remains intentionally closed.

### 10.1 Blind Jury Forward-Test

The new release-judge skill was forward-tested against rendered desktop and mobile views without implementation rationale. Its locked scores were Design 94, Usability 90, Creativity 95, Content 92 and Developer 88, producing a blocked verdict under the non-compensating category gates. The jury raised a perceived desktop active-state mismatch. A subsequent DOM audit on both development and production previews confirmed identical trigger, stage, proof and media IDs; the E2E contract now asserts that identity explicitly. The release verdict nevertheless remains blocked because Usability/Developer thresholds require another independent jury cycle and no approved anonymous case package exists.

## 11. Final Decision

Proceed only with the five-stage process-proof cinema and the restrained supporting details documented here. Do not expand the work into a global Trionn effect layer.

The signature succeeds when users understand the manufacturing process faster, trust the evidence more, and reach the next action without losing control. Performance, accessibility, and responsive natural flow are part of the visual concept, not post-production cleanup.
