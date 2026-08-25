# Acceptance matrix

Viewports: 320x568, 375x812, 390x844, 768x1024, 1280x800, 1440x650, 1440x900.

For each representative mobile, tablet, and desktop viewport:

- Open at page top and after deep scroll.
- Verify first focused control, cyclic Tab order, Escape, and trigger focus restore.
- Verify background and header cannot receive pointer or keyboard input.
- Verify scroll position restores after close.
- Reach every family, category, detail link, and CTA without hover.
- Check sticky controls against all four safe-area insets.
- Repeat with reduced motion; repeat mobile checks with coarse pointer.
- Run axe with overlay closed and open.
