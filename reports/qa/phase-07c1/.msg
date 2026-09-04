test(qa): F5 — the radius register is still incomplete, 3 of 5 sources

probes/q4-radius.mjs is a fresh census, not a re-read of the register: every
visible element on the SIX rebuilt routes, at 375 and 1280, after a full scroll
pass and a pointer move, grouped by class signature wherever any corner has a
non-zero computed border-radius.

DISTINCT SOURCES MEASURED: 6 class signatures / 5 components.

LISTED in docs/lean/17 §4, and confirmed exactly:
  div.h-1.5.flex-1.rounded-full        20 x 21x6    /malzemeler@375
  div.h-1.rounded-full.overflow-hidden  4 x 238x4   /malzemeler@1280
  div.h-full.rounded-full               4 x 190x4   /malzemeler@1280   (= the
                                        register's single "8 x" meter row)
  button.fixed...rounded-full          12 x 48x48/56x56, all 6 routes x both

NOT LISTED, and rendering on ALL SIX routes at 1280:
  div.fixed.top-0.left-0.pointer-events-none                    6 x 6x6,  50%
  div.fixed.top-0.left-0.pointer-events-none.flex...            6 x 44x44, 50%

Both are src/components/ui/CustomCursor.tsx:198-203 and :213-218, where the
radius is an INLINE style (`borderRadius: "50%"`), so no stylesheet grep can
see it. §4's own closing paragraph promises to list "anything a mounted
component paints, because the audit that missed these three checked the six
page files and not the components they mount" — and then misses a mounted
component that paints on every one of the six.

Same status as the three that ARE listed: CustomCursor.tsx is byte-identical
(98e64ab) at d1ed8e3, e07c154 and 6f37eb0, so this is the register being
incomplete, not the pages regressing. Neither layer is a card, so acceptance
criterion 3 is not violated in substance — but §4 is the register that
criterion's documented-exception escape hatch depends on.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013mzqXq7KjpjHdm76iXjL6k
