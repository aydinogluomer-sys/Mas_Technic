test(qa): A7 — red control, counter-proof, and an anti-narrowing set comparison

THE FIX IS REAL, AND THE RED IT CLOSES IS REPRODUCIBLE.
Current scripts/motion-audit.mjs --mode=rest, run against two builds:

  pre-fix build (dfe9da7, :4191)
    /malzemeler @1280   hidden=38  hiddenText=12  partialText=0   -> FAIL
    /malzemeler @375    hidden=0   hiddenText=0                   (desktop-only
                                                                   choreography)
  integrated build (6f37eb0)
    12 pairs, /malzemeler @1280 at 1977 elements
    hidden=0  hiddenText=0  partialText=0 on every pair           -> PASS

The Coder reports 39; I measure 38, on an element count of 1976 against their
1977. A one-element drift in a portal-mounted overlay. hiddenText=12 — the
number that carries the finding — matches exactly.

THE CHOREOGRAPHY WAS GATED, NOT DELETED.
--mode=enabled on the integrated build:
  /malzemeler @1280  elements=1998  armed=44  armedText=12
                     afterScroll=44  afterScrollText=12
  /malzemeler @375   armed=5  armedText=0
The same 12 text-bearing elements are still animated for a reader who did not
ask for motion off. A "fix" that deleted the reveal would report 0 here too,
which is why this run is the one that decides it.

THE HARD GATE WAS NOT NARROWED — measured, not read off the diff.
The PRE-A7 audit script (7e69a79) was run against the SAME pre-fix build:
  old script: 10 pairs, all hidden=0 hiddenText=0, exit 0 — it reported PASS
              over a build hiding 12 text-bearing elements, because
              /malzemeler was not in its matrix.
  new script: those same 10 pairs, identical hidden=0 hiddenText=0, PLUS the
              two new /malzemeler pairs, one of them red.
Every pair the old gate judged, the new gate judges identically. Widened only.

THE partialText BAND IS UNGATED OBSERVABILITY.
partialText=0 on BOTH builds and every pair, including the pre-fix pair where
38 elements sat at chain 0 — so the band did not absorb anything the hard gate
used to catch. In source the band intercepts only 0 < chain < 0.95, which the
previous code already discarded at `if (value !== 0) continue`. The chain-0
gate is byte-equivalent.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013mzqXq7KjpjHdm76iXjL6k
