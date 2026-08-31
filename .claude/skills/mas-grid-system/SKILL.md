---
description: Master grid rules for MAS TECHNIC. Use for landing or inner-page layout, rail geometry, desktop/tablet/mobile columns, subgrid, section alignment, and visual regression of vertical axes.
---
# MAS TECHNIC Grid System

## Desktop contract
- Sheet max width: 1600px unless the implementation plan changes it.
- Continuous left technical rail: 64px desktop.
- Content field: 12 equal master columns, zero arbitrary local grid drift.
- Prefer CSS `subgrid` so nested bodies inherit real parent tracks.
- Do not recreate `repeat(12,1fr)` inside padded bodies if that shifts axes.
- Internal breathing room should normally come from child padding, not by changing master boundaries.

## Canonical section intent
- Hero: 4 / 6 / 2.
- Proof: 6 x 2.
- Process: 4 / 8; process steps 4 x 3.
- Nexus: 3 / 9 (or an intentional empty master column explicitly documented).
- Featured project: 6 / 6; secondary cards occupy master spans.
- Sectors: 4 x 3.
- Quality: 6 x 2; decorative stamp must not create a seventh structural track.
- References: 6 x 2.
- FAQ: 7 / 5 using master boundaries, not 7fr/5fr plus gap drift.
- RFQ: a real 12-unit composition, preferably 3/4/5 or 4/4/4.
- Footer: master-grid composition such as 4/8 unless phase art direction explicitly proves another 12-column split.

## Responsive
- Tablet: rail about 56px, six master columns. Ensure no accidental empty track.
- Mobile: rail about 40–44px, four content columns; preserve identity without consuming ~15–18% of viewport.

## Verification
- Provide a development grid overlay/debug mode.
- Verify 375, 768, 1280/1440, and 1600 widths where applicable.
- Pixel-perfect local resemblance is subordinate to consistent master axes unless an intentional break is documented.
