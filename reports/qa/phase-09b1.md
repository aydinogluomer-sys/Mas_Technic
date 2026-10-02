# QA Report — Phase 09b-1 (with correction C1)

- PHASE: 09b-1-QA
- CODE_COMMIT: `cd0e53a` (range `183a323..cd0e53a`, 12 commits)
- QA_COMMIT: see `wt/qa-p09b1` head
- STATUS: **PASS**
- TESTS_PASSED: 542
- TESTS_FAILED: 0
- TESTS_SKIPPED: 81
- NEW_TESTS_ADDED: 12 (2 new specs) + 5 probe scripts

---

## 1 — The boundary, on grounds the Coder did not name

Measured **from painted pixels**, not from composited alpha: a full-page
screenshot is decoded in a canvas and the RGB is read off the element's own
edge, so the browser's compositor is the oracle and the arithmetic that the
Coder used as both method and check never enters.
`scripts/qa-probes/09b1-boundary.mjs`, `…/09b1-boundary-states.mjs`,
`reports/qa/phase-09b1/boundary.txt`, `…/boundary-states.txt`. 284 control
instances. `allowed 0` in every context, canary blocked first.

**The pass rule I used is not the Coder's.** WCAG 1.4.11 asks for 3:1 between
the component and the colours *adjacent* to it. The Coder asks for 3:1
"against BOTH adjacent colours", counting the control's own fill as one of
them — which is stricter than the criterion and reports a filled button as a
failure against itself. I score `max(border vs ground, fill vs ground)` and
report border-vs-fill separately, because that is what says whether the
*border* is carrying the identification. On these controls the fill is
1.00–1.08:1 from its ground, so the border is carrying it, and the stricter
rule and the correct one give the same verdict.

| ground | control | painted border/ground | verdict |
|---|---|---|---|
| graphite root `#070b0d` | `.shell-field input` | **3.88–4.00:1** | PASS |
| graphite root | `.shell-auth-social > button` | **3.72:1** | PASS |
| graphite root | `.shell-segment` (unpressed), `.shell-row-toggle` | **3.67:1** | PASS |
| void `#030506` | `.shell-field input` (`/malzemeler`) | **4.01:1** | PASS |
| **paper band in a graphite root** `#eee9de` | input / ghost / segment / social | **3.46 / 3.61–3.66 / 3.61–3.66 / 3.61–3.66:1** | PASS |
| **paper band in a PAPER root** (injected) | same four | **3.46 / 3.61 / 3.66 / 3.61–3.66:1** | PASS |
| **"graphite" band in a paper root** (injected) | same four | **3.95 / 3.74 / 3.79 / 3.74–3.79:1** | PASS |
| paper root `#fbf8f1` (404) | `.shell-action--ghost` | **3.85:1** (Coder), 3.74 injected | PASS |

The two grounds the application cannot currently produce were reached by
injecting shipped band markup into a running page — DOM mutation, not a
source change.

**The nested case that falsified 09a does not recur here, and it does not
recur *by construction*.** `--sf-control-rule` is bound in exactly the two
blocks that bind `--sf-rule`, and the paper block's selector list
(`shell.css:1018`) already contains `.shell-root .tl-band[data-band-tone="paper"]`,
so a paper band inherits the paper control rule whichever root it sits in.
Paper-in-paper and paper-in-graphite are colorimetrically identical
(`--sf-field: --tl-paper-raised`, `--sf-ground: --tl-paper` in both), which is
why one measurement covers both.

### States

`reports/qa/phase-09b1/boundary-states.txt`.

| control | default | hover | focus-visible | disabled |
|---|---|---|---|---|
| auth input | 4.00 | 4.00 (unchanged) | white border + outline | n/a |
| social button | 3.72 | 17.35 | 17.35 | **1.91** |
| segment (unpressed) | 3.67 | 3.67 (border unchanged) | 3.67 | — |
| row toggle | 3.67 | 17.35 | 17.35 | — |
| register input | 4.01 | 4.13 | white border + outline | — |

No state falls below the default. `aria-invalid` has **no** border rule in the
stylesheet, so the invalid state is the default state — nothing to fail.
`.shell-auth-social > button:disabled { opacity: .55 }` drops the boundary to
1.91:1; WCAG 1.4.11 exempts "an inactive user interface component", so this is
reported, not charged.

### Forced colors

Reachable, and Chromium replaces the authored palette wholesale — every
sampled surface returns Canvas/CanvasText and `.tl-menu-trigger`'s border
comes back at 21:1. The pixel sampler cannot distinguish a control edge from
its ground in that mode (both are Canvas), so this is recorded as *reached and
not adverse* rather than as a measurement. `shell.css:601` already restates
the footer's colours under `forced-colors: active` and
`shared-shell-accessibility.spec.ts` asserts `forced-color-adjust: auto` on
every focus target; both are green.

---

## 2 — The decorative classification, and the controls the probe cannot discover

### The two judgement calls: I agree with both, on evidence the Coder did not give

`scripts/qa-probes/09b1-decor-calls.mjs`, `reports/qa/phase-09b1/decor-calls.txt`.

The deciding fact is not the border, it is the label: 1.4.11 does not govern
information conveyed by text, which 1.4.3 governs instead. So the question is
whether a reader would still know a control is there with the border removed.

- **`a.tl-brand`** — 303.5×71 inside a `div.tl-header` that is **1214×71**. The
  `border-right` runs the *full height of the header row*, which is what a grid
  divider does and what a control boundary does not. The link renders
  "MAS TECHNIC PRECISION CNC" at **17.35:1**, and with `border: 0` forced at
  runtime the text is still there. **Divider. Call correct.**
- **`.shell-faq-source a`** — 143×13 inside a 543.4×23.1 `<p>`, one `border-bottom`,
  i.e. a run of inline text with an underline. Accessible name
  "Kalite Kontrol sayfası", **6.32:1** at 10px/500 on the paper band, so 1.4.3
  passes at its 4.5:1 requirement. **Underline. Call correct.** (Note for
  Phase 10, not a defect: 10px body copy, ×107.)

### Controls the probe does not discover — and this one is a real gap

`reports/09b1c1/probe-control-boundary.mjs:143` is `if (!edge) continue;`. Every
element with no drawn border is dropped **before** the interactive test runs.
The file header says it "keeps every element that is interactive (or is the
visible half of a control), keeps every element that draws a border, and
reports the two sets separately" — it does not. The interactive set is a strict
subset of the bordered set, and a control with no border cannot appear in
`control-boundary-after.json` at all. Confirmed by grep: zero occurrences of
`shell-auth-reveal`, `data-chat-launcher` or `tl-cad-drop` in that file.

Three controls fall through. I measured all three:

| control | why invisible to the box-walk | measured | verdict |
|---|---|---|---|
| `.shell-auth-reveal` (password reveal, `/giris`, `/reset-password`) | `border: 0` | glyph **8.20:1** on the field | PASS via graphical object |
| `[data-chat-launcher]` (every route but `/`) | `border-width: 0` | fill **4.11:1** graphite, **3.97:1** paper band, **4.53:1** paper root | PASS via fill |
| `.shell-check` (`/malzemeler`) | native checkbox, computed border-width `0px` under `appearance: auto` | UA edge **5.36:1** against the page ground | PASS as painted |

**The `.shell-check` unreachability claim is overstated.** The packet asked me
to verify the claim rather than the number. Forcing `border: 1px !important`
alone computes to `0px` — appearance:auto wins. But adding
`appearance: none !important` makes the same border compute to `3px`. So the
boundary *is* reachable from CSS with one extra declaration; "not reachable
without rebuilding the control" is not accurate. It costs nothing here,
because the UA's own checkbox already paints at 5.36:1 and owes nothing.

### DEFECT — a fourth control the sweep never saw, and it fails

`src/styles/technical-landing.css:368`

```css
.tl-cad-drop{ … border:1px dashed #9aa09c; … background:transparent; … }
```

Measured on `/` at 1280: `<button>`, 405×108, **four-sided enclosing border**,
transparent fill, painted **2.20:1** against the paper ground (fill/ground
1.00:1 — the border is the whole control). This is the same component class and
the same failure shape as `.shell-file`, which C1 fixed at `shell.css:1561`;
the landing has its own copy in a different stylesheet and it was left at the
old value. It also carries a hardcoded hex, which `CLAUDE.md` forbids.

It is not a failure of the instrument. The Coder's probe classifies enclosing
borders on interactive elements as `control` and would have reported this at
2.20:1 — its **route list** is `/giris`, `/sifremi-unuttum`, `/reset-password`,
`/iletisim`, `/teklif-al`, `/sss`, `/malzemeler`. `/` is not in it. The
adjudication probe *does* visit `/`, but only looks for the ten selectors that
changed.

Non-blocking for 09b-1: it is outside C1's allowlist, it predates this phase,
and this phase did not touch it. It is a live 1.4.11 failure on the landing and
should be a named item in the next correction packet.

---

## 3 — The crops: seventeen, not fourteen, and proved at the pixel

### The count is wrong; the enumeration is right

`reports/09b1c1/golden-adjudication.json` has **18** crops with at least one
changed-declaration hit. Excluding `waveb-notfound-body`, which moved, that is
**17**. The Coder's own commit message (`e837e2b`) enumerates them as "all six
`shell-footer-*`, `landing-fullpage`, all seven `inner-hero-*` and all three
`inner-next-*`" — 6 + 1 + 7 + 3 = **17** — while calling them "the fourteen".
The list is correct and the headline number is not.

### The claim was an inference; here it is as a measurement

`e2e/qa-09b1-golden-drift.spec.ts`, `reports/qa/phase-09b1/golden-drift.txt`.
The crops are re-captured with the owning specs' own helpers and viewport and
compared to the committed baselines twice — at pixelmatch's default cutoff and
exactly. No baseline is written.

| golden | counted @0.2 | changed exactly | first differing pixel |
|---|---|---|---|
| `shell-footer-home` | 0 | **416** | `rgb(69,73,73)` → `rgb(105,108,107)` |
| `shell-footer-about` | 0 | **416** | `rgb(68,72,72)` → `rgb(105,108,107)` |
| `shell-footer-notfound` | 0 | **416** | `rgb(68,72,72)` → `rgb(105,108,107)` |
| `inner-hero-contact` | 0 | **488** | `rgb(69,73,73)` → `rgb(105,108,107)` |
| `inner-hero-about` | 0 | **374** | `rgb(68,72,72)` → `rgb(104,107,106)` |
| `inner-next-service-detail` | 0 | **472** | `rgb(69,73,73)` → `rgb(105,108,107)` |
| `shell-header-home` (control) | 0 | 0 | — |
| `shell-header-about` (control) | 0 | 0 | — |
| `waveb-notfound-body` (regenerated) | 0 | 5 | antialiasing |
| `waveb-quality-documents` (zero-hit) | 0 | 0 | — |

Every differing pixel is the old `--tl-rule` composite becoming the new
`--tl-control-rule` composite. The two control crops and the zero-hit crop
report 0/0, so the instrument is not reporting drift everywhere.

### The arithmetic, reproduced independently

| ground | old → new | YIQ delta | cutoff 1408.6 |
|---|---|---|---|
| graphite `#070b0d` | `rgb(69,73,72)` → `rgb(104,108,106)` | **615** | invisible |
| void `#030506` | `rgb(66,68,67)` → `rgb(102,104,102)` | **651** | invisible |
| panel fill `#0c1114` | `rgb(72,77,77)` → `rgb(107,111,110)` | **591** | invisible |
| **paper band `#eee9de`** | `rgb(172,170,163)` → `rgb(119,120,116)` | **1294** | **invisible** |
| paper root `#fbf8f1` | `rgb(181,181,176)` → `rgb(125,126,124)` | **1527** | COUNTED |

615 and 1527 reproduce the Coder's figures exactly. The paper-band ground at
**1294** is a fourth ground it did not quantify and is also under the cutoff —
so a control boundary inside a paper band would also have changed without
failing.

### Gate or formality

**Formality, on colour.** At Playwright's default `threshold: 0.2` the
comparator's per-pixel cutoff is `35215 × 0.2² = 1408.6`, and a **neutral grey
can move 52/255 — 20% of the full range — before a single pixel is counted.**
That is not a tolerance for antialiasing; it is a tolerance wide enough to
repaint a whole tonal step invisibly.

It is worth being precise about which gate did the saving. The six footer crops
predict 410 changed pixels each and `shell-golden.spec.ts:69` sets
`maxDiffPixels: 200`. Had the per-pixel threshold counted them, those crops
**would have failed**. Nothing about the pixel budget saved them; the colour
threshold did, entirely.

The suite is still a real gate for geometry, type and layout, where changes
move pixels to a colour far from the original. It is close to a formality for
tone. **Phase 10 touches art direction, which is exactly the axis it is blind
on.** Lowering `threshold` toward 0.05–0.1 in `expect.toHaveScreenshot` would
surface these seventeen at once and turn any future tonal change into a
decision instead of a discovery; that is a config change and therefore the
Orchestrator's, not mine.

---

## 4 — The OAuth return leg, attacked

`scripts/qa-probes/09b1-oauth-attack.mjs`, `…/09b1-oauth-deferral.mjs`,
`reports/qa/phase-09b1/oauth-attack.txt`, `…/oauth-deferral.txt`. Guard at
`allowHosts=[]`, canary blocked first, `ALLOWED 0` throughout. No auth method
called, no social button pressed.

### The platform fact holds in all three engines — my strongest suspected attack failed

The whole fix rests on `PerformanceNavigationTiming.name` keeping the fragment.
`url-survival.json` establishes that in one browser, and the repository ships
Firefox and WebKit projects. I launched all three against
`/musteri-paneli#error=…`:

| engine | landed | fragment kept in `navName` | notice rendered |
|---|---|---|---|
| Chromium | `/giris`, no hash | **YES** | YES |
| Firefox | `/giris`, no hash | **YES** | YES |
| WebKit | `/giris`, no hash | **YES** | YES |

The single-browser measurement generalises. Stated plainly because it is the
attack I most expected to land.

### Lifecycle

| attack | result |
|---|---|
| bounce → reload | notice absent; `navName` clean on the new document. Correct. |
| direct paste `/giris#error=…` → reload | notice shown once, URL cleared to `/giris`, not repeated. Correct. |
| back after the clear | `replaceState` left no error entry. Correct. |
| `location.hash = '#error=…'` on a live page | **no** notice — the read is mount-only. Correct. |
| SPA navigation away and back | notice appears when `location.href` genuinely carries the params at mount. Intended path, not a latch failure. |
| second document | `consumed` latch is per document; each new document re-reads. Correct. |

### The deferral, reproduced without signing anyone in

The admitted case is "a reader already signed in when an attempt fails". The
mechanism needs no session — only a document that lands on the failure URL and
never mounts `Login`. Entering at `/malzemeler#error=…&error_code=user_banned`
shows nothing (correct), and after **20 s** in the same document a
`pushState` + `popstate` to `/giris` renders
"HESAP KAPALI — Bu hesap ile giriş yapılamıyor" with no age, no timestamp and
no hedge. The deferral is therefore broader than the note says: it is any
document that lands on the failure URL without mounting `Login`, not only a
signed-in one. Low severity, non-blocking.

### Hostile input, well beyond four needles

17 prose payloads through `error_description`: `<script>`, `<img onerror>`,
`<svg onload>`, `<iframe src=javascript:>`, `<style>`, `<link rel=stylesheet>`,
plain-language phishing prose, RTL override, zero-width joiners, CRLF, Unicode
separators, a 4000-character string, HTML entities, double URL encoding, a
`data:` URI, template braces, and a Cyrillic homoglyph domain.

**Every one: notice rendered, 0 injected nodes, 0 script executions, needle
absent from both `innerHTML` and `textContent`, body not hidden, no external
stylesheet.** The "server's prose is never rendered" decision holds under a
much wider attack than the four it was tested with. This is the strongest part
of the correction.

Three things do get through, and none is script injection.

**DEFECT — `src/components/auth/oauth-return.ts:208`**

```ts
const copy = (code && COPY[code]) || (error && COPY[error]) || FALLBACK;
```

`COPY` is an object literal, so it inherits from `Object.prototype` and
`COPY[code]` is truthy for a prototype member. `error_code=constructor`
resolves `copy` to the `Object` function, whose `.label`, `.title` and
`.detail` are all `undefined` — so `FALLBACK`, which exists precisely for
unknown codes, is skipped. Measured DOM:

```html
<div class="shell-notice" data-tone="error" role="alert">
  <p class="shell-notice-label"></p>
  <div class="shell-notice-body"><p></p>
  <p class="shell-field-hint">KOD: constructor</p></div></div>
```

A `role="alert"` region with an empty label, no title element and an empty
body. Reproduced for `constructor`, `__proto__`, `toString`, `valueOf` and
`hasOwnProperty`; `unknown_code_not_in_copy` correctly gets the full fallback.
Severity low, non-blocking — an attacker degrades a message rather than
escalating — but it is a bug in the function this correction added, in the
exact area it claimed to have handled, and the fix is one line
(`Object.hasOwn(COPY, code)`, `Object.create(null)`, or a `Map`).

**FINDING — the attacker cannot write the prose but can choose it.**
`/giris#error=x&error_code=user_banned` renders, on demand from a crafted link,
"HESAP KAPALI / Bu hesap ile giriş yapılamıyor. / Hesabınızın durumunu öğrenmek
için bizimle iletişime geçin." in the site's own voice. The threat model in the
file header — "a sign-in page is the one surface where attacker-authored prose
in the site's own voice is worth something" — is half-mitigated: authorship is
blocked, selection from thirteen pre-written messages is not. Low severity.

**FINDING — `oauth-return.ts:70-71` says the sanitised reference "cannot hold
an instruction". It can.** `[a-z0-9_-]` and 48 characters admits, measured and
rendered verbatim:

```
KOD: ara-0850-555-1234-destek-icin
KOD: sifrenizi-yeniden-girin
KOD: mas-technic-destek_444_0_000
```

The sanitiser does what it says; the comment claims more than the sanitiser
does. Comment-level, non-blocking.

---

## 5 — Regression

Every project run against the phase's own build. `dist/` built once,
`PLAYWRIGHT_PREVIEW_ONLY=1`, `PLAYWRIGHT_PORT=4181` checked free before
binding, one project per invocation, foreground.

| project | passed | failed | skipped |
|---|---|---|---|
| `visual-1280` | 41 | 0 | 0 |
| `visual-375` | 35 | 0 | 6 |
| `visual-768` | 35 | 0 | 6 |
| `visual-1440` | 35 | 0 | 6 |
| `critical-1280` | 82 | 0 | 1 |
| `critical-375` | 81 | 0 | 2 |
| `desktop-1280` (full regression, incl. both new specs) | 199 | 0 | 25 |
| `mobile-375` (shared shell + scroll reach) | 13 | 0 | 12 |
| `mobile-320` + `tablet-768` (shared shell) | 9 | 0 | 23 |
| `smoke-firefox-1440` + `-390` | 6 | 0 | 0 |
| `smoke-webkit-1440` + `-390` | 6 | 0 | 0 |
| **total** | **542** | **0** | **81** |

- `tsc --noEmit`: clean.
- `node scripts/claims-gate.mjs`: PASS, 0 unverified claims, 31 rules, 280 controls.
- `npm run lint`: 3 errors — `e2e/qa-p08-scroll-region-reach.spec.ts:533`,
  `e2e/qa-p08-storage-disclosure.spec.ts:272`, `src/content/claims.ts:90`.
  None of the three files appears in `git diff --name-only 183a323..cd0e53a`,
  so all three predate this phase. Reported, not charged.
- **No specs edited.** `git diff cd0e53a HEAD` touches only
  `e2e/qa-09b1-*.spec.ts` (new), `reports/qa/phase-09b1/**` and
  `scripts/qa-probes/09b1-*`.
- **No `--update-snapshots`, at any point.** `git status e2e/__golden__` is
  empty after every run; only the four `waveb-notfound-body` baselines differ
  from `183a323`, and they were moved by the Coder, not by me.
- The Coder's own `probe-control-boundary.mjs` re-run reproduces: 8
  component/tone rows under 3:1, all eight `.tl-menu-trigger` at 2.20; 82 rows
  at or over 3:1. Its scratch output was deleted; `reports/09b1c1/` is
  untouched.

### The three unknowables

Not resolved, and not resolvable without a live call, which was forbidden and
which I did not make:

1. whether `google` and `linkedin_oidc` are enabled on the project;
2. whether `{origin}/musteri-paneli` is an allowed redirect URL;
3. whether GoTrue serves `/authorize` errors itself instead of redirecting back.

`supabase/config.toml` carries no `[auth]` block, so the repository genuinely
cannot answer any of them.

**Is the return-leg fix theatre or insurance? Insurance — and it is cheaper
than the question implies.**

The third unknowable is the sharp one, and it does not have the reach the
packet fears. GoTrue's `/authorize` handler resolves the provider *after*
validating `redirect_to`, and its failure mode for a disabled provider is a
302 back to the redirect URL with `error`/`error_code`/`error_description` in
the fragment — which is exactly the shape `oauth-return.ts` is written for and
exactly what the Coder's own probe replays. GoTrue serves its own error page
only when it cannot determine a safe redirect target, principally when
`redirect_to` is *not* on the allow-list — that is unknowable 2, not 3, and in
that case the reader never returns whatever this code does.

So the case split is:

- **redirect URL allowed, provider disabled** — the common failure, the one the
  fix was built for: the reader comes back, and before C1 saw nothing at all.
  The fix fires. Insurance, and it pays.
- **redirect URL not allowed** — the reader lands on GoTrue's page and never
  returns. The fix is unreachable, but so is any client-side fix; nothing in
  this repository could have covered it. Not theatre, out of scope.
- **providers enabled and working** — `readOAuthReturn()` returns `null` on the
  first branch. Cost: one `URL` parse per `Login` mount.

The one case where I would call it theatre is if the buttons are dead *and*
the redirect URL is unregistered, because then no reader ever reaches the
notice. That is a two-unknowable conjunction, and the correct response is to
resolve unknowables 1 and 2 out of band, which is a decision for the
Orchestrator and the project owner. It is not a reason to hold this phase.

---

## 6 — `.tl-menu-trigger` at 375, judged

`reports/qa/phase-09b1/boundary-states.txt`. My painted measurement is
**2.13:1** (the Coder's composited 2.20; the difference is antialiasing).

| viewport | box | `.tl-menu-trigger-label` | bars |
|---|---|---|---|
| 1280 | 89×48 | `"MENÜ"`, `display: block`, visible | 22×1, 14×1, 22×1 at **17.35:1** |
| 768 | 89×48 | `"MENÜ"`, visible | same |
| **375** | **44×48** | `"MENÜ"`, **`display: none`, not visible** | same |
| **320** | **44×48** | **`display: none`** | same |

**The packet's suspicion is correct and the Coder's conclusion survives
anyway.** The word is genuinely absent below 768 — half of the stated argument
does not hold at 375, and it was offered without that caveat. But the other
half does all the work: at 375 the control is a 44×48 box whose only visible
content is three hairlines painting at **17.35:1**, and 1.4.11 is satisfied by
a graphical object required to identify the component. It sets no minimum size
for that object. The border at 2.13:1 is then not carrying identification and
is not what the criterion asks about.

Not an identification failure at any viewport. The 2.13:1 border is still a
weak boundary and `navigation.css:165` still paints it from `--tl-rule`; if
`.tl-menu-trigger` is ever reclassified as a control whose box is its
identification, this is where it lives.

---

## 7 — The label gap: yes, there is a cheap check, and here it is

`e2e/qa-09b1-type-slot-census.spec.ts`,
`reports/qa/phase-09b1/type-slot-census.txt` and `…-negative.txt`.

`e224364` concludes: "Nothing caught it and nothing could have." That is the
one claim in this phase I can falsify with a running test.

**The invariant is one sentence: a component the design system defines must
compute the same typography everywhere it appears.** `.shell-field` is such a
component and its label is styled by exactly one rule, so every `<label>`
inside a `.shell-field` on every route must resolve the same family, size,
weight, letter-spacing and transform. Two groups means one instance is outside
the system.

Result today — one treatment:

```
.shell-field label   — 1 treatment(s)
     13x  IBM Plex Mono / 9px / 600 / 1.44px / uppercase
          on /giris, /sifremi-unuttum, /iletisim, /malzemeler
```

**The negative control is what makes that green mean something.** Reverting, at
runtime, the four declarations `e224364` added:

```
.shell-field label, fix in place : IBM Plex Mono / 9px / 600 / 1.44px / uppercase
.shell-field label, fix reverted : Space Grotesk / 16px / 400 / normal / none
```

Two treatments — a SPLIT — and the census goes red.

**Cost: six page visits, 7.3 s, no baseline, no screenshot, no stored
artefact.** It needs no advance knowledge that a child combinator was involved,
and it catches the whole class: a selector that stopped matching, a specificity
loss, a page reaching for a Tailwind class, a component copied instead of
imported. All of them are one component rendering two ways, and all of them are
invisible to `tsc`, eslint, axe and a golden that does not photograph the route.

Coverage limit, stated: `/reset-password` renders its session-missing state and
`/teklif-al` keeps its fields behind a step, so neither contributed a label to
this run. Extending `SLOTS` is a one-line change per slot.

**Recommendation for the Orchestrator:** promote this to a permanent gate with
a wider `SLOTS` list. It is the cheapest instrument found in this phase and it
covers the one failure mode — a page silently leaving the design system — that
every existing gate is structurally blind to.

---

## Failed checks

| Check | Observation | Root cause | Production fix required? |
|---|---|---|---|
| — | none; every mandatory criterion is evidenced | — | — |

## Defects (none blocking 09b-1)

| # | Location | Severity | Blocks? |
|---|---|---|---|
| D1 | `src/styles/technical-landing.css:368` — `.tl-cad-drop`, a `<button>` with a 4-sided `1px dashed #9aa09c` boundary over a transparent fill, painted **2.20:1** on `/`. Live 1.4.11 failure; same shape C1 fixed in `.shell-file`. Also a hardcoded hex. | Medium | No — outside C1's allowlist, predates the phase, untouched by it. Name it in the next packet. |
| D2 | `src/components/auth/oauth-return.ts:208` — `COPY[code]` walks `Object.prototype`; `error_code=constructor\|__proto__\|toString\|valueOf\|hasOwnProperty` yields a `role="alert"` with empty label, no title and empty body instead of `FALLBACK`. | Low | No |
| D3 | `src/components/auth/oauth-return.ts:70-71` — "cannot hold an instruction" is false; `KOD: sifrenizi-yeniden-girin` renders. Comment-level. | Low | No |
| D4 | `reports/09b1c1/probe-control-boundary.mjs:143` — `if (!edge) continue;` contradicts the file's own header; the interactive set is a strict subset of the bordered set. Three controls fall through (all pass on measurement). Instrument, not production. | Low | No |
| D5 | Commit `e837e2b` says "fourteen"; its own enumeration and `golden-adjudication.json` both give **seventeen**. | Low | No |
| D6 | `shell.css` — the correction's own comment says `--tl-paper-control-rule` was solved for "the paper BAND nested in a graphite root"; the **paper band ground at delta 1294** was not named in the golden adjudication as a ground where a change would also pass invisibly. | Low | No |
| D7 | `ShellBand.tsx:50` — `tone?: "graphite" \| "paper"`, but no CSS matches `[data-band-tone="graphite"]` anywhere. Today a no-op (verified by injection: controls inside one keep the root's bindings and pass). If a future phase gives graphite bands a background without also re-binding `--sf-*`, every control inside one inside a paper root inherits `--tl-paper-control-rule` — the 09a trap in a new place. | Low, latent | No |
| D8 | `.shell-check` "not reachable from CSS without rebuilding the control" is overstated: `appearance: none` makes the border compute (measured `3px`). Moot — the UA paints it at 5.36:1. | Low | No |

## Scope integrity — PASS

- Production files modified by QA: **NONE**. `git diff --name-only cd0e53a HEAD`
  returns only `e2e/qa-09b1-*.spec.ts`, `reports/qa/phase-09b1/**` and
  `scripts/qa-probes/09b1-*`.
- `e2e/__golden__/**`: untouched. No `--update-snapshots` at any point.
- `reports/09b1c1/**`: untouched (the re-run's scratch JSON was deleted).
- No pre-existing spec edited, no assertion weakened, no tolerance broadened,
  no skip or xfail added, no coverage deleted.
- `.env` not committed.
- **One allowlist note.** The packet's `WRITE_ALLOWLIST` names
  `reports/qa/phase-09b1/**` and does not name `reports/qa/phase-09b1.md`,
  which is where this file sits. It is written there because that is the
  deliverable the QA contract requires (`reports/qa/phase-<id>.md`) and the
  convention every prior phase follows — `phase-09a.md` sits beside
  `phase-09a/`, `phase-07.md` beside `phase-07/`. It is a new file and
  overwrites nothing. Flagged rather than assumed; move it to
  `reports/qa/phase-09b1/phase-09b1.md` if the literal reading is intended.
- **One process error, self-reported.** During lint triage I ran
  `git checkout 183a323 -- .`, which reverted tracked files in the working tree
  and staged them. Nothing was committed. `git reset --hard HEAD` restored the
  tree, and `git diff --name-only cd0e53a HEAD` (above) is the proof the
  integration head's production files and goldens are byte-identical to
  `cd0e53a`. Recorded because an unrecorded near-miss is worse than a recorded
  one.

## Unverifiable

- `U1`–`U14` carried. `U1`–`U7` not attempted, per the packet.
- The three OAuth unknowables (§5), unresolved by construction.
- Forced-colors boundary contrast: reached, but not separately measurable —
  Chromium replaces every surface with Canvas/CanvasText, so a control edge and
  its ground are the same colour to a pixel sampler.
- `.shell-file` on `/teklif-al` was not reachable in the state probe (the file
  step is behind a wizard step); the Coder's own probe measured it at 3.88:1 as
  `label.shell-dropzone-area` and my re-run of that probe reproduces the figure.

## Commands run

```text
npm run build
node scripts/qa-probes/09b1-boundary.mjs
node scripts/qa-probes/09b1-boundary-states.mjs
node scripts/qa-probes/09b1-oauth-attack.mjs
node scripts/qa-probes/09b1-oauth-deferral.mjs
node scripts/qa-probes/09b1-decor-calls.mjs
node reports/09b1c1/probe-control-boundary.mjs qa-rerun     (scratch output deleted)
npx tsc --noEmit
npm run lint
node scripts/claims-gate.mjs
npx playwright test --project=visual-1280 | visual-375 | visual-768 | visual-1440
npx playwright test --project=critical-1280 | critical-375
npx playwright test --project=desktop-1280
npx playwright test --project=mobile-375 e2e/shared-shell-accessibility.spec.ts e2e/qa-p08-scroll-region-reach.spec.ts
npx playwright test --project=mobile-320 --project=tablet-768 e2e/shared-shell-accessibility.spec.ts
npx playwright test --project=smoke-firefox-1440 --project=smoke-firefox-390
npx playwright test --project=smoke-webkit-1440 --project=smoke-webkit-390
```

All Playwright invocations: `PLAYWRIGHT_PREVIEW_ONLY=1 PLAYWRIGHT_PORT=4181
PLAYWRIGHT_REUSE_SERVER=1`, one project per invocation, foreground.
All probes: `guard(context, [])` with a live canary asserted before any control
was touched; `ALLOWED 0` in every context in every run.
