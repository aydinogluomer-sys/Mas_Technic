---
name: mas-performance
description: Performance and loading-budget rules for MAS TECHNIC React/Vite site. Use for LCP, images, fonts, code splitting, Three/R3F/CAD, JS chunks, motion cost, dependency hygiene, and Lighthouse budgets.
---
# MAS TECHNIC Performance

- Re-baseline the **current** TechnicalLanding; do not trust stale WebGL-era reports.
- Measure mobile and desktop LCP/CLS/INP and bundle composition.
- Preload only the actual current LCP asset; preload URL must match rendered URL.
- Use responsive image delivery (`srcset`/`sizes`/`picture` where useful), dimensions, proper priority for hero, lazy loading offscreen.
- Heavy CAD/Three/R3F/Drei/STL/OBJ/OCCT code should load only when the user needs it (e.g. after entering the RFQ/CAD path or selecting a file), not on public landing first load.
- Split very large chunks and remove duplicated/unused payload.
- Audit GSAP + Framer responsibilities to avoid duplicate runtime work.
- Optimize font weights, subsets/loading strategy; avoid synthetic styles and layout shifts.
- Treat >500KB chunk warnings and browser-externalized Node dependencies as investigation items.
- Add enforceable CI performance budgets only after measuring a realistic baseline.
- Preserve quality: do not hit Lighthouse targets by deleting core content/interaction.
