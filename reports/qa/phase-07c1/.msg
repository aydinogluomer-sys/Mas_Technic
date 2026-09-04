test(qa): A2 — the launcher is in none of the 100, and the guard fails on cue

THE LAUNCHER IS GONE, AND THE SCAN THAT SAYS SO CAN FIND IT.
probes/q6-launcher-scan.mjs reads the disc colour from the LIVE page rather
than hardcoding it (rgb(10,125,138), 56x56 at 1280), then decodes every golden
in a canvas. The site's brand teal appears as antialiased TEXT within euclidean
distance 11-13 of the same colour, so a colour test alone cannot separate "the
disc is here" from "this page uses the brand". The discriminator is a solid
horizontal RUN: a >=48px disc must produce one, a 1-2px glyph stroke cannot.

  positive control (a live capture that DOES contain it)
      exact=172  tight<=8=2204  near<=24=2518  maxRun=52
  all 100 goldens
      exact=0    maxRun=1       (single antialiased text pixels)

  52 against 1. The separation is total, and the control proves a zero result
  means something.

WHAT BECAME VISIBLE — LOOKED AT, NOT ASSUMED.
probes/q7-golden-reveal.mjs decodes the OLD and NEW blob of each of the 25
changed goldens, diffs them and crops the changed region old-over-new.

  every one of the 25 changes inside ONE bounding box, in the corner the
  launcher occupied, and nowhere else:
    1280  70x64 at x=1200      1440  70x64 at x=1360
     768  61x70 at x=690        375  60x64 at x=305 (footers)
                                375  42x11 / 36x8 (inner crops)
  changed area 0.105% - 0.952% per file.

  Inspected at full size: 375 shell-footer-about, 1280 shell-footer-service,
  375 inner-hero-sector-detail. In every case the newly-baselined region is
  plain footer/hero background — the disc was sitting on empty ground, not on
  text. The MALZEMELER spec block (Ti6Al4V, Inconel 718, Al 7075) sits beside
  the old disc, not under it, and reads identically in both. No defect is
  pinned by the new baseline.

NO GOLDEN MOVED BECAUSE OF A1 OR A7 — measured, not asserted. If either had
moved a pixel inside these 25 crops, the diff would show a second bounding box.
There is exactly one per file, and it is the launcher's.

THE require:true GUARD FAILS ON CUE.
e2e/visual/qa-a2-overlay-guard.spec.ts (QA-owned), 16/16 at 375/768/1280/1440:
  armed          finds and hides [data-chat-launcher] on a mounting route
  red            require:true THROWS "no [data-chat-launcher] was found to
                 hide" on /, which mounts none — behaviourally identical to a
                 drifted selector
  green          require:false returns 0 without throwing
  premise        the launcher really does overlap the captured footer element

ChatBot.tsx is byte-identical (7a5daf0) at d1ed8e3, e07c154 and 6f37eb0 — the
fix touched no production code, as claimed. All three require:false call sites
are on / only.

MY OWN ERROR, CORRECTED IN THE FILE: the overlap test first compared a
position:fixed viewport rect against an unscrolled footer rect and reported no
overlap. The probe was wrong.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013mzqXq7KjpjHdm76iXjL6k
