# QA TASK PACKET — PHASE 08, VERIFICATION ROUND 4 (closing, tightly scoped)

PHASE_ID: 08 (QA round 4, after correction packet C5)
CODE_COMMIT: `27de482` — integration branch `claude/awwwards-90-overhaul`
PRIOR: your round-3 report (PASS) at `reports/qa/phase-08.md`; packet at
`.work/packets/phase-08-C5.md`.

## WORKTREE

```
C:\Users\Trade Bilisim\pdh-wt\qa-p08      branch: wt/qa-p08r4      at: 27de482
```

`.env` present, `node_modules` junctioned, `.tsbuildinfo` artifacts to be left
alone. Never delete a worktree.

## THIS IS A SHORT ROUND. You already passed the phase; C5 is a small delta.

Three C5 commits: `5003c66` · `a727e54` · `27de482`. Do **not** re-run the full
regression — round 3 did that at `49a1af6` and the only production change since
is two added class names plus legal copy. Scope below.

## ITEM 1 — YOUR GUARD WALKS TWO 404s, AND THAT IS THE ROUND'S REAL WORK

`e2e/qa-p08-scroll-region-reach.spec.ts` route list contains two paths that do
not exist. Orchestrator-verified against the data:

| line | walked | reality |
|---|---|---|
| `:129` | `/kabiliyet-profilleri/ince-cidarli-aluminyum-govde` | not a slug. The three real ones in `src/content/caseStudies.ts` are `ince-cidarli-govde` (`:115`), `titanyum-baglanti-parcasi` (`:138`), `hassas-mil` (`:161`) |
| `:134` | `/endustriyel/havacilik` | not a slug. `src/data/servicePages.ts:2434` is `havacilik-uzay` |

So the guard walks a 404 twice, and **`KabiliyetProfilDetay.tsx:157` has no
watcher at all** — C5 fixed that defect on all three capability profiles
(measured 325.172 / 314.453 / 327.281 against a 278px column at 320) by direct
measurement, because your guard could not see it.

**This is the dead-sentinel failure class this run has already paid for once** —
`d3c8a6c`, "the whole-page axe lane had a dead sentinel, and it was hiding the
clock". A gate that walks a 404 reports green for the same reason an empty scan
does.

Fix the route list, re-run at `mobile-320` / `mobile-375` / `desktop-1280`, and
report what the corrected list finds — including whether it now goes red
anywhere C5 did not already fix. **Add a control that fails if a walked route
does not render its expected surface**, so this specific hole cannot reopen: a
404 must not be able to masquerade as a passing route. That control is worth
more than the route fix itself.

## ITEM 2 — verify C5's two fixes independently

- **R3-1.** C5 reports the defect was **two call sites, ten routes, three
  viewports, 14 instances** — not the one route/one viewport my packet claimed.
  `grid-cols-[minmax(0,1fr)]` added at `ServiceDetail.tsx:423` and
  `KabiliyetProfilDetay.tsx:157`; `ServiceDetail.tsx:512` and
  `Malzemeler.tsx:177` measured track == wrapper at every width and left alone
  with comments. Verify the 14, verify the two untouched call sites really are
  safe, and note that **`Malzemeler.tsx:177`'s register is filterable, so its
  min-content is user-driven** — C5 flags this as an unwatched risk. Decide
  whether it needs a watcher and say so.
- **Madde 03.** The count is gone; the hosting/database case is named with its
  triggers. C5 explicitly did **not** scope the clause to "a page load", because
  `persistSession: true` + `autoRefreshToken: true` means a signed-in reader's
  browser reaches that host on a plain load too — my packet's suggested framing
  would have been a fourth instance of the same defect. Verify the rendered
  clause, verify no numeral-closed enumeration remains anywhere in the three
  documents, and verify nothing new is claimed about any third party after
  receipt.

## ITEM 3 — the systemic fix is blocked by your own live control. Adjudicate it.

C5 built the class-level fix (`.shell-stack > * { min-width: 0 }`) first and
**measured it safe**: 76 routes × 7 viewports = 375 records, nothing moved at
768/844/1280/1440 on any route, nothing moved on any of the 14 golden surfaces
at any of the 4 golden widths. It then reverted it, because your guard's live
control at `:535` restores the pre-C4 markup on `/cerez-politikasi` and requires
the checker to report exactly one problem — and fixing the class makes R2-1
**impossible to express**, so the control goes green and the test fails.

That is a real design tension in the control style, not a coding error: a live
control that reconstructs a defect in the real DOM forbids fixing that defect at
the root. C5 chose "green unedited" over a tidier stylesheet, which was the right
call under its instructions.

**You own that spec. Decide and record:** keep the live control as-is and accept
that the class fix is permanently unavailable, or re-aim it to a fixture-based
control that survives a root fix. Do not change it just because C5 was
inconvenienced — if the live control is worth more than the class fix, say so
and say why. The measurement is in `5003c66`'s and `a727e54`'s commit messages.

## ITEM 4 — one handed-up content item, for adjudication not repair

C5 found, and correctly refused to edit outside its gate:
`/gizlilik-politikasi` madde 02 calls the chat "sitede yazdığınız bir metnin
dışarı çıktığı **tek yer**", while madde 05 of the same document says RFQ form
data and the uploaded file go to the hosting and database infrastructure — which
`/kvkk` madde 04 counts as a transfer. Contestable on the document's own
definitions.

**My reading, which I want you to test rather than accept:** this is
*contestable*, not *false* — unlike R2-2's five sentences, where a cookie
existed that the text said did not. "Dışarı çıkan metin" can honestly mean
leaving our own processing chain for a third party like Google, which the RFQ
path does not do. On that reading the sentence stands. Phase 09's mandatory
tasks include "Align KVKK/privacy copy with actual data flow", and Phase 09
rewrites the RFQ path that makes the sentence contestable, so it has a natural
owner.

If you measure it as **false** rather than contestable, say so and Phase 08 does
not close — that is exactly the call you made correctly on R2-2.

## OUT OF SCOPE — do not re-run, do not touch

- Full regression, all viewports, cross-browser, contrast, axe: done at round 3;
  C5's production delta is two class names. Run only what Item 1 and 2 need,
  plus a golden check (see below).
- R2-3 (`motion-grammar.spec.ts` at tablet-768 / landscape-844): carried to
  Phase 10 per A23. Confirm still red, same cause, nothing more.
- Criteria 3 and 5: carried per A20/A21, verified twice. Do not re-measure.
- hCaptcha, `Login.tsx`, `KVKK.tsx`: settled.

**Do check that no golden moved.** C5 reports all four visual projects green
with zero regenerated. Confirm independently — it is cheap and it is the claim
that would hurt most if wrong.

## QA_WRITE_ALLOWLIST

```
e2e/qa-p08-*.spec.ts
reports/qa/phase-08.md          (append round 4; keep rounds 1–3 legible)
reports/qa/phase-08/**
```

`--update-snapshots` forbidden. Production code read-only.

## MACHINE

8 GB, one heavy process, foreground, one `--project=` per invocation,
`> file 2>&1`, never `run_in_background`. Build once then
`PLAYWRIGHT_PREVIEW_ONLY=1` with a free `PLAYWRIGHT_PORT`. Ports 4173/4187/4190/
4191/4199/4205/4207/4209 — check before use. Commit after every step; this run
has been interrupted three times.

## RETURN_FORMAT

```text
GUARD_FIXED:    corrected route list · what it finds now · the new anti-404 control
C5_VERIFIED:    the 14 instances · the two untouched call sites · Malzemeler's filterable risk
LEGAL:          madde 03 rendered · no numeral-closed enumeration remains
CONTROL:        your ruling on the live control vs the class fix, with reasons
MADDE02:        false or contestable, with the measurement
GOLDENS:        confirmed unmoved
VERDICT:        PASS | FAIL for Phase 08
```

If you rule Item 4 false, or Item 1 turns up a surface C5 missed, say so plainly
— a fourth round is cheaper than shipping it.
