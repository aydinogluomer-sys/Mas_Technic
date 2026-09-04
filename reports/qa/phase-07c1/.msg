test(qa): A2 — re-derive the per-viewport golden adjudication of 516ab95

probes/q8-golden-adjudicate.mjs classifies every differing pixel in the 25
changed goldens as DISC (inside the launcher's bounding box, located from its
teal fill in the OLD image) or STRAY (outside it), and checks the three
falsifiable predictions docs/lean/17 §8.2 committed to BEFORE regenerating.

DISC GEOMETRY vs CSS — right:1rem, h-12 w-12 below md, md:h-14 md:w-14:
  375   48x48  x 311-358   predicted x0 = 375-16-48 = 311   Δ 0
  768   56x56  x 695-750   predicted x0 = 766-16-56 = 694   Δ +1
  1280  56x56  x 1207-1262 predicted x0 = 1278-16-56 = 1206 Δ +1
  1440  56x56  x 1367-1422 predicted x0 = 1438-16-56 = 1366 Δ +1
Cell for cell with the doc's table. "Within a pixel at all four widths" holds.

STRAYS — the prediction was that removing a translucent black shadow can only
BRIGHTEN, so a darker stray would falsify it:
  1280  1110 strays  1110 brighter  0 darker   maxΔ outside disc = 2
  1440  1110 strays  1110 brighter  0 darker   maxΔ outside disc = 2
   768  2030 strays  2030 brighter  0 darker   maxΔ outside disc = 4
   375   595 strays   591 brighter  4 darker   maxΔ outside disc = 30
Per-file: 222 @1280, 222 @1440, 406 @768 — the doc's exact numbers.
The only 4 darker pixels in all 25 are 2 each on inner-next-{sector,service}
-detail @375, at maxΔ 30 — which §8.2 declares separately and explains as the
sliver's antialiased rim losing a teal blend to a graphite ground rather than a
black wash. Predicted, then found. Zero darker shadow strays anywhere.

THE TWO EXTRA GOLDENS WERE NOT SWEPT IN. inner-next-{sector,service}-detail
@375: disc 34x8 at x 318-351, disc pixels 214, strays 2, total 216. The doc
says "216 changed pixels each, of which 214 are the sliver and 2 are its
antialiased rim". Exact.
inner-hero-material-family @375: disc 40x11, total 336 — the doc's 40x11 and
336. (It reports 2 strays where I count 32, a bounding-box edge difference of
no consequence.)

THE CONTROL IS REAL. shell-footer-home exists at all four widths, is absent
from the 25, and the only Phase 07 change to it was the ADDITION of the 768
variant when that viewport was introduced. Same footer element, same widths,
the one route that mounts no launcher, and it did not move.

MY OWN ERROR, CORRECTED IN THE FILE. The first version classified disc vs stray
by COLOUR, which threw the launcher's white speech-bubble icon out into the
strays and produced 15,662 strays with 5,973 darker — a spurious contradiction
of the doc. §8.2 locates the launcher as a connected changed REGION, which is
correct and which I have now matched. The doc was right and my instrument was
wrong.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013mzqXq7KjpjHdm76iXjL6k
