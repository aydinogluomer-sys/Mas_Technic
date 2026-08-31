---
description: Phase closure and final Awwwards release-gate procedure for MAS TECHNIC. Use when deciding whether a phase or final release candidate passes.
---
# MAS TECHNIC Release Gate

A phase is complete only when its written acceptance criteria are independently evidenced. “Looks done” and Coder self-report are not evidence.

For every phase:
1. Inspect integrated diff and actual files.
2. Confirm write-scope integrity.
3. Run required build/type/lint/test checks.
4. Run phase-specific browser/accessibility/visual/performance checks.
5. Ensure no new console errors, broken links, placeholder/demo content, or accidental public claims.
6. QA writes a structured report.
7. Any mandatory failure => correction loop; do not advance.

Final release candidate additionally requires:
- CI green and current tests (not stale LandingFlow contracts).
- Chromium + Firefox + WebKit critical flows.
- Responsive visual regression at representative widths.
- Keyboard/reduced-motion/accessibility checks.
- Current Lighthouse/performance budgets.
- Canonical/metadata/sitemap/robots correctness.
- No fake/sample proof content.
- No public legacy/test/preview surfaces.
- Clean console/network behavior for critical pages.
- No production deploy or main merge unless `USER_INPUTS.md` explicitly authorizes it.
