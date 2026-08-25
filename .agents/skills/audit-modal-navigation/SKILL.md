---
name: audit-modal-navigation
description: Audit and test accessible fullscreen modal navigation for WCAG 2.2 AA, including dialog naming, focus trap and restore, inert background, scroll lock, keyboard roving, accordion ARIA, safe areas, reduced motion, and automated axe checks. Use before releasing menu changes.
---

# Audit Modal Navigation

1. Test the rendered behavior, not markup alone.
2. Verify named modal dialog, portal isolation, inert background/header, scroll lock, and focus restoration.
3. Exercise Escape, Tab, Shift+Tab, arrows, Home, End, rapid toggles, and route selection.
4. Check `aria-pressed` on family controls and paired `aria-expanded`/`aria-controls` on disclosures.
5. Confirm visual order equals focus order and no content is hover-only.
6. Test four-edge safe areas, `100dvh`, 320px width, short landscape, coarse pointer, and reduced motion.
7. Run axe with the dialog both closed and open; record every exception explicitly.
8. Reject keyboard traps, hidden focused content, background interaction, or inaccessible sticky controls.

Use [references/acceptance-matrix.md](references/acceptance-matrix.md) as the minimum acceptance set.
