test(qa): F4 — make the font guard fail on purpose, four ways

A fix against a SILENT NO-OP is not closed until its new failure path is shown
to be live. e2e/visual/qa-f4-font-guard.spec.ts (QA-owned) does not assert that
the guard passes — the visual suite already does that 64 times. It asserts that
the guard goes RED, deliberately, with the stated reason.

  armed              counters > 0 on BOTH hosts on a real load          PASS
  gstatic silenced   throws "intercepted 0 requests on fonts.gstatic"   PASS
  googleapis silenced throws "intercepted 0 requests on fonts.google"   PASS
  both blackholed    throws "the web fonts never loaded"                PASS

  4 passed (39.3s) @ visual-1280.

Cases 2 and 3 reproduce the F4 defect exactly: a page.route() registered AFTER
installFontRetry() wins (Playwright matches handlers last-registered-first), so
the retry's handler never runs for that host and its counter stays 0 — which is
precisely what the old `https://fonts.g*` glob did to both hosts at once.

Case 4 isolates part 2 by NOT installing the retry, so awaitRealFaces() skips
the counter block and the FontFaceSet proof is the only thing left standing.

The counting is therefore real and the failure mode is live, which is what
makes the clean 64/64 run 64 independent confirmations rather than 64 silences.
All four golden specs opt in (installFontRetry + awaitRealFaces in each).

MY OWN ERROR, CORRECTED IN THE FILE: the first version of the armed case used a
bare page.goto(..., {waitUntil:"load"}) and saw gstatic at 0. The face files are
fetched lazily after the stylesheet is parsed; the four golden specs use
gotoAndSettle. The probe was wrong, not the guard.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013mzqXq7KjpjHdm76iXjL6k
