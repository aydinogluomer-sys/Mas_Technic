# QA Report — Phase 05b (creative choreography)

- PHASE: 05b
- CODE_COMMITS: `7085559`, `495d1d7`, `b3d66f6`, `d9a1b45`, `33ddcf8`, `1ee1361` (integration HEAD `1ee1361`)
- BASE FOR DIFF: `a2b4c20`
- QA_COMMIT: TBD
- STATUS: IN PROGRESS
- B28_REGRESSION: NONE
- I4_REMAINING_DEFECT: TBD

Preview served from `dist/` on **port 4211** (4173/4199/5199 held by other
agents). One build, reused for every block.

---

## Block 1 — R1: B28 regression (the phase's most valuable asset)

**Criterion.** Under `prefers-reduced-motion: reduce`, at rest, with no
scrolling, the number of text-bearing elements hidden must be **0** on `/` and
on at least three inner routes, at **both** 1280 and 375.

Measured **twice, with two independent instruments**, because the packet
requires an independent re-measurement and not a re-run of the Coder's tool.

### Instrument 1 — the project's own probe

```text
MOTION_AUDIT_BASE_URL=http://localhost:4211 node scripts/motion-audit.mjs --mode=rest
```

| viewport | route | elements | hidden | **hiddenText** |
|---|---|---|---|---|
| 1280 | `/` | 829 | 0 | **0** |
| 1280 | `/hizmetler/cnc-frezeleme` | 711 | 14 | **0** |
| 1280 | `/iletisim` | 271 | 0 | **0** |
| 1280 | `/malzemeler/aluminyum` | 497 | 0 | **0** |
| 1280 | `/hakkimizda` | 171 | 0 | **0** |
| 375 | `/` | 787 | 0 | **0** |
| 375 | `/hizmetler/cnc-frezeleme` | 697 | 14 | **0** |
| 375 | `/iletisim` | 258 | 0 | **0** |
| 375 | `/malzemeler/aluminyum` | 484 | 0 | **0** |
| 375 | `/hakkimizda` | 158 | 0 | **0** |

Exit 0, `PASS — no route hides text-bearing content at rest under reduced
motion.` The 14 `hidden` on the service route are all the same decorative
node printed in full by the probe's `silent` list — `<div class="absolute
inset-0 bg-gradient-to-r from-primary/5 …">` — carrying no text. They are
gradient overlays, not content.

The `rest` probe itself is **byte-identical to the version 05a QA validated**:
`git diff a2b4c20 HEAD -- scripts/motion-audit.mjs` touches only `runFrames`,
`runCursor` and `runGuard`. The gate was not moved under the measurement.

### Instrument 2 — QA-owned independent probe

`reports/qa/tools/p05b-r1-independent-rest.mjs`, written from the criterion
rather than from the Coder's code. It agrees on the population (only elements
with a layout box — a `display:none` subtree such as the closed fullscreen menu
is not "hidden by a reveal", and counting it produces ~52 false positives per
route; my first draft did exactly that and was wrong) but it **checks two
mechanisms the project probe does not**:

- `visibility: hidden` — `motion-audit`'s `effective()` returns `-1` for it and
  the caller then does `if (value !== 0) continue`, so a reveal expressed with
  `visibility` would be skipped;
- `clip-path: inset(… 100% …)` — not examined at all by the project probe,
  although the 05b motion layer parks `.tl-sector-card` at
  `clip-path: inset(0 -8px 100% -8px)` (fully clipped) in a resting
  declaration. It is under `[data-motion="ready"]`, which does not match on the
  reduced-motion path, but that is a fact to be measured rather than assumed.

```text
QA_VP=1280 node reports/qa/tools/p05b-r1-independent-rest.mjs
QA_VP=375  node reports/qa/tools/p05b-r1-independent-rest.mjs
```

All ten route/viewport pairs: `hiddenText=0 (opacity=0 visibility=0 clip=0)`,
`scrollY=0` on every one. Exit 0 both runs.

**R1 — PASS. B28_REGRESSION: NONE.** Zero by two instruments, the second of
which is strictly stricter than the first.

### Environment note (not a defect)

The independent probe was killed mid-run three times with
`Target page, context or browser has been closed`, at a different page each
time (after 3, after 7, and immediately). Host free memory measured 1225 MB of
8043 MB, with the user's own Edge resident. Restarting the browser per viewport
made every slice complete. This is the instability the packet describes; it is
recorded here so it is not mistaken later for a finding.

---
