---
description: Measurement-driven motion and interaction grammar for MAS TECHNIC. Use for scroll choreography, hero dimensions, menu/page transitions, cursor, reverse-scroll effects, and reduced-motion behavior.
---
# MAS TECHNIC Motion System

Core concept: **measurement is the interaction model**. Motion must derive from machining, datum, tolerance, inspection, verification, technical drawing, assembly, or document logic.

- Narrative vocabulary can progress RAW -> MACHINING -> DATUM -> TOLERANCE -> CMM -> VERIFIED.
- Different content types get different motion grammar: paper/document bands, dark panels, data tables, imagery, dimension lines, menu assembly, verification states.
- Reserve 2–3 strong award moments; do not animate everything at equal intensity.
- Manifesto/quality can be a climax; proof/marquee/reference should generally be quieter.
- Motion must not mutate layout geometry. Favor transform, opacity, clip-path and carefully-audited filters.
- Never drive the same DOM element with both GSAP and Framer Motion.
- GSAP contexts must clean up.
- Reduced motion is mandatory; mobile effect density should be lower.
- Custom cursor/scroll progress stay only if semantic and brand-specific.
- Page/menu transitions must preserve URL/history behavior and should not delay functional navigation.
- Test 60fps-class behavior on real/representative devices and avoid heavy continuous offscreen work.
