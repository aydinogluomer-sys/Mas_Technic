test(qa): A1 re-measured with my own glyph-free instrument, red-controlled

probes/p6-contrast.mjs is the Phase 07 instrument, unchanged: it never reads a
glyph pixel. Background is measured from rendered pixels with the glyphs made
transparent (not hidden, which would take the element's own background with
it); foreground is COMPUTED as composite(color, alpha x ancestor-opacity-chain)
over that background, so the number is immune to font size.

NEGATIVE CONTROLS, asserted every run, all held:
  21.000 / 1.000 / 3.033 @16px / 3.033 @8px / 3.977 (half-opacity ancestor)
  The 8px control matching the 16px control at 3.033 is the point: the naive
  glyph-pixel method reports 2.119 for the same control at 1280.

AT-REST FAILURES on /malzemeler, reducedMotion=reduce, same instrument, two
builds:
  375 : 5 -> 0   (274/451 candidates measured)
  1280: 1 -> 0   (838/839 candidates measured)

The Coder reports 2 at 1280; my instrument finds 1. Direction and endpoint
agree, so I do not press it.

The five pre-correction failures are exactly the three repairs claimed:
  the dark-accent eyebrow rgb(10,125,138) "Malzeme Dönüşümü" on a dark ground
    - 1.588 @375 and 4.013 @1280
  four rgba(240,239,237,0.5) property labels at 10px - 3.442 to 4.110 @375

THE GAP THE CODER DECLINED TO CLAIM IS NOW MEASURED, NOT BOUNDED.
The property card under prefers-reduced-motion, where A7 makes it newly visible
at chain 1.0, was bounded by arithmetic at ~8.6:1. Measured:

  1280  İşlenebilirlik / Korozyon Direnci / Mukavemet / Termal Dayanım
        ratio 8.481 (worst-pixel 8.481 too), required 4.5, opacityChain 1.000
  375   the same four at 7.574 - 7.875, opacityChain 1.000

  opacityChain = 1.000 on every one is itself the proof they were measured
  while fully painted under reduced motion, which is A7's counter-proof seen
  from the contrast side.

  The eyebrow: 1.588 -> 14.505 @375, 4.013 -> 16.877 @1280.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013mzqXq7KjpjHdm76iXjL6k
