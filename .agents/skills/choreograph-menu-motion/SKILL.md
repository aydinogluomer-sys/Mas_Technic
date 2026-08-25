---
name: choreograph-menu-motion
description: Design and implement deterministic Framer Motion timelines for fullscreen navigation, including panel reveals, masked typography, stagger, family transitions, cancellation, route handoff, pointer parallax, and reduced-motion fallbacks. Use for menu animation work in this project.
---

# Choreograph Menu Motion

1. Model open, closing, and closed states explicitly; make repeated input idempotent.
2. Keep Framer Motion as the production menu engine.
3. Sequence panels, typography, datum, and links through central motion tokens.
4. Animate transform, opacity, and clip-path only.
5. Cancel pending close/navigation work on Escape, rapid toggles, and unmount.
6. Finish menu close before route-curtain handoff.
7. Enable subtle pointer parallax only for fine pointers without reduced motion.
8. Collapse reduced motion to opacity changes within 80ms, with no stagger or large translation.
9. Verify input response under 100ms and total transition under 750ms.

Read [references/timeline-contract.md](references/timeline-contract.md) before implementation.
