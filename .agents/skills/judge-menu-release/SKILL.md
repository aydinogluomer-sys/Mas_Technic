---
name: judge-menu-release
description: Independently score a rendered fullscreen menu for design, usability, originality, content, navigation architecture, accessibility, and responsive execution. Use as the final release gate after implementation and tests, without reading implementer rationale.
---

# Judge Menu Release

1. Judge only the rendered product and observable interaction; do not read implementation rationale first.
2. Capture desktop, short desktop, tablet, standard mobile, and 320px mobile states.
3. Exercise opening, family switching, category disclosure, route selection, Escape, keyboard travel, and reduced motion.
4. Score design, usability, originality, content, and navigation architecture from 0–100.
5. Report weighted overall score, usability score, evidence, blockers, and highest-leverage fixes.
6. Reject release if overall or usability is below 90, axe has serious findings, content counts drift, or core keyboard paths fail.
7. Avoid rewarding animation that delays orientation or degrades low-power/touch behavior.

Read [references/scorecard.md](references/scorecard.md) before issuing a verdict.
