docs(qa): Phase 07 re-verification report — FAIL on F5 alone

Seven of the eight correction items close, most of them well. The phase fails on
F5: docs/lean/17 §4 still lists three of the five things that paint a radius on
those routes. Both layers of the custom cursor (CustomCursor.tsx:198-203 and
:213-218, borderRadius "50%" as an inline style) render at opacity 1 on all six
routes at 1280 and are absent from the register. The sentence "three things paint
one" is false of the exact route and measurement it cites, and the register's own
closing paragraph promises to include anything a mounted component paints.

Nothing else fails. F1, F2, F3, F4, A1, A7 and A2 are each evidenced with a red
control or a negative control, and the two F1 assumptions are adjudicated and
accepted. Seven hardening notes are recorded and none of them needs a cycle.

Also banked: npm run test:e2e:visual with my two guard specs included —
96 passed (8.0m), which is the 64 pre-existing golden comparisons plus 32 of mine.

Five of my own instrument errors are retired in §6, including two where the Coder
or the document was right and I was wrong: the not-found rail number (the family
is in the label, not the number) and the golden disc/stray classification (§8.2
locates the launcher as a connected region, which is correct; my colour test threw
the launcher's white icon into the strays and manufactured a contradiction).

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013mzqXq7KjpjHdm76iXjL6k
