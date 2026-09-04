test(qa): F3 verified with a red control on the pre-correction build

probes/q3-notfound.mjs measures the six not-found bodies, the global 404 and
six real detail routes in the DOM of two built bundles.

INTEGRATED (:4190) — 0 problems.
  Every not-found body exposes exactly ONE <h1>; none matches the anchored
  /^(Sayfa|Yazı) Bulunamadı$/ the accessibility spec guards; all 8 titles are
  distinct and route-specific; /malzemeler/<unknown> stays on its own URL with
  its own h1 rather than rendering the index.

PRE-CORRECTION (:4191) — the same probe goes red on every count.
  6 bodies with h1 count = 0.
  /endustriyel/<unknown> and /kabiliyetler/<unknown> both read the HİZMET rail.
  3 bodies fell back to the site-default document.title.
  /malzemeler/<unknown> silently swapped its URL to /malzemeler and rendered
  the index — a soft 404 that looked valid.

RETIRED, MY ERROR: the first version of this probe asserted the rail NUMBER
equalled the family number (03/04/05), which I had inferred from a summary
rather than from the code. CategoryPage/ServiceDetail pass no="01" for the
hero and no="02" for the band; the family lives in the LABEL, and the label is
right on all six. Rescored on the label.

SPEC INTEGRITY, verified by blob hash rather than by reading a diff:
  e2e/shared-shell-accessibility.spec.ts is cfdc358 at d1ed8e3, e07c154,
  dfe9da7, 4640135 and 6f37eb0 — byte-identical. It was not weakened.
  The whole e2e/ diff across Phase 07 is 443 insertions, 0 deletions.

FOUND BRANCH: the ~48 real detail routes went from the site-default title to a
per-page one. Nothing depended on the old value: a search of e2e/ for
toHaveTitle and for document.title returns zero matches, and a golden captures
the viewport, which the document title is not part of.

TOLERANCES: independently re-derived. Every pre-existing maxDiffPixels 200 is
unchanged between e07c154 and 6f37eb0; the only new numeric is the new inner-
page spec's own 120, which is tighter.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013mzqXq7KjpjHdm76iXjL6k
