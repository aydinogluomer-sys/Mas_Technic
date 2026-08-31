---
description: Accessibility and inclusive-interaction acceptance rules for MAS TECHNIC. Use for menu, forms, tables, motion, responsive UI, semantic HTML, keyboard/focus, contrast, and cross-browser QA.
---
# MAS TECHNIC Accessibility QA

- Preserve semantic HTML before adding ARIA.
- All interactive-looking controls must actually be keyboard-operable links/buttons or be visually demoted.
- Fullscreen menu: focus trap, initial focus, ESC close, focus restore, scroll lock, accessible names.
- Strong visible `:focus-visible` that fits the design language.
- No hover-only essential information.
- Respect `prefers-reduced-motion`; all core content/function remains available.
- Decorative technical SVGs/images should be hidden from assistive tech; meaningful diagrams need equivalent text/context.
- FAQ details/summary semantics should remain correct.
- Resource downloads must be anchors.
- Horizontal technical tables need usable mobile scrolling and cues.
- Touch targets and mobile controls must be appropriately sized.
- Audit contrast on graphite and paper surfaces.
- Run axe plus keyboard/manual critical-flow checks; test WebKit/Safari behavior, Firefox and Chromium at release gates.
