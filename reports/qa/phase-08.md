# QA Report — Phase 08

- PHASE: 08 — INNER PAGES WAVE B: quality, projects, blog, resources, legal, search/discovery, 404/error
- CODE_COMMIT: `5138fc1` (15 commits, `7dcfb65~1..5138fc1`, 67 files, +4165/−1264)
- QA_COMMIT: this commit
- WORKTREE: `C:\Users\Trade Bilisim\pdh-wt\qa-p08` on `wt/qa-p08`
- STATUS: **FAIL**
- TESTS_PASSED: 380
- TESTS_FAILED: 2
- TESTS_SKIPPED: 84
- NEW_TESTS_ADDED: 46 (one new spec, `e2e/qa-p08-waveb-contract.spec.ts`; 61 executions across three projects)

**Why FAIL, in one paragraph.** Two of the repository's own gates are red at the
integration HEAD, both caused by Phase 08 commits, both deterministic (each
re-run twice, identical value), and neither is a snapshot that could be argued
either way: `e2e/technical-landing.spec.ts:271` is in the `critical-*` family
that `playwright.config.ts` describes as "PR'ı bloke eden hızlı kapı", and it
fires because the two footer links this phase added grew the shared footer past
the exact bound Phase 04 set to catch that growth. Separately, the phase's own
new legal surfaces carry two content defects on the axis this phase was
otherwise careful about: the KVKK notice still enumerates transfers as "two
cases" after the same phase disclosed a third one in the other two documents,
and the cookie policy's own completeness claim is short by one storage record.
Everything else Phase 08 set out to do, it did — and several parts of it are
better evidenced than the packet's premises assumed. The detail is below.

> Evidence files are in `reports/qa/phase-08/`. Console captures carry a `.txt`
> extension rather than `.log` because `.gitignore:3` is `*.log`, and evidence
> that cannot be committed is not evidence.

---

## Acceptance criteria matrix

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | 404 is unmistakably MAS TECHNIC, usable and linked back into the site | **PASS** | `notfound-branches.txt`. POPULATED branch `/kalite-dosyas` → 3 suggestions, each resolved: `/kalite-dosyasi` 200 `<h1>`"Kalite Dosyası", `/kabiliyetler/kalite-kontrol` 200 `<h1>`"Kalite Kontrol", `/kabiliyetler/kategori/kalite-standartlar` 200 `<h1>`"Kalite & Standartlar". EMPTY branch `/qa-zzz-nothing` → `YAKIN KAYIT 0`, block correctly absent, 8-entry directory + global header/footer still rendered (33 anchors captured, `rendered.txt`). Golden `e2e/__golden__/win32/visual-1280/waveb-notfound-body.png` opened and read: status readout, correction block, directory, three actions. |
| 2 | Blog/article, quality/resources, case studies, SSS and legal share the global design system | **PASS** | `design-membership.txt` + `legacy-accent.txt`, measured inside `<main>`: all ten Wave B surfaces have 0 legacy-teal nodes, 0 Radix component roots, 0 `bg-card`, 0 off-register border-radius, 0 system-font nodes, and 47–404 `shell-*`/`tl-*` primitives. |
| 3 | No public route still visibly belongs to the old generic design language | **FAIL** | Same instruments. `/teklif-al` 16 teal `rgb(10,125,138)` + 3 Radix tablists + 1 shell primitive; `/giris` 92 teal + 0 shell primitives; `/sifremi-unuttum` and `/reset-password` 0 shell primitives; `/cad-dashboard` 16 teal + 3 Radix + 1 shell primitive. Screenshot `shots/teklifal-format-error.png`. See **DEFECT 6**. |
| 4 | Search/filter is either implemented with a justified need or explicitly omitted | **PASS** | Recorded per surface, in writing, in the source: implemented on `/sss` with the corpus as the reason (`src/pages/SSS.tsx:60-72`); explicitly omitted on `/blog` (`src/pages/Blog.tsx:41-56`), `/kabiliyet-profilleri` (`:44-46`), `/kalite-dosyasi` (`:68-69`) and the 404 (`src/pages/NotFound.tsx:59-65`). Measured corpus backing the `/sss` decision: 117 `<details>` rendered (`rendered.json`). |
| 5 | Error/loading/empty states no longer fall back to generic library defaults | **FAIL** | Reached, not inferred (`error-states.txt`). Loading PASS, empty PASS, 500-class route error PASS. CAD-format/form error is a stock sonner toast: `background rgb(255,255,255)`, `border-radius 8px`, `font-family ui-sans-serif, system-ui, -apple-system…`. See **DEFECT 5**. |

### Mandatory tasks

| Task | Result | Evidence |
|---|---|---|
| Case-study/project index + detail on a verified/anonymised model | PASS | `/kabiliyet-profilleri` + `/kabiliyet-profilleri/:slug` over `src/content/caseStudies.ts` (`kind: "capability"`, `client`/`reportNo`/`measuredResults` typed `never`). All 3 slugs render, `<h1>` = the profile title. |
| The page states these are not customer projects | PASS | Rendered band 02 (`rendered.txt`, `/kabiliyet-profilleri`): "Bunlar müşteri projesi **değildir** … Bir isim, bir sipariş numarası veya bir ölçüm sonucu bulamazsınız". Golden `waveb-profile-scope.png` opened at 1280 and 375 — the sentence and both paragraphs are inside the crop, so the golden really does guard it. |
| Quality/Resources as a real technical-document surface | PASS | `/kalite-dosyasi` band 02 = the four §H PDFs as a register. See the document-register audit below. |
| Blog as a technical editorial publication | PASS | `/blog` lead band + register, no card grid, no newsletter form. Golden `waveb-journal-lead.png` (1280, 768) opened. |
| Article typography, figure/caption, tables, TOC, related content, non-aggressive RFQ continuation | PASS | `/blog/havacilik-parcalarinda-malzeme-secimi`: `PLAKA 01` figure+caption; `ShellSpecTable` "7075-T6 ve Ti-6Al-4V — yayımlanmış tipik değerler" with a note that a batch certificate governs (`src/data/blogData.ts:196-208`); `BÖLÜMLER` TOC; `İLGİLİ YAZILAR` × 3; one `SONRAKİ ADIM` band at the end. |
| SSS/FAQ and legal/privacy/cookie in the same shell, restrained | PASS | Criterion 2 measurement. Three legal routes share one `LegalDocument` composition; no hero image, no RFQ band. |
| Branded 500/general error | PASS | Reached by aborting the route chunk: `data-shell-state="error"`, exactly one `<h1>` "Bu sayfa yüklenemedi", mono `ERR::ROUTE_RENDER_FAILED`, three recovery actions. `shots/route-error.png`. |
| Branded CAD parse error | **FAIL** (documented deferral) | **DEFECT 5**. |
| Branded form error | **FAIL** (documented deferral) | **DEFECT 5**. |
| Meaningful empty/loading states | PASS | `/sss` empty: `border-radius 0px`, Space Grotesk, "EŞLEŞME YOK / Bu aramayla soru bulunamadı" + a working "Filtreleri temizle". Loading: "YÜKLENİYOR / Sayfa hazırlanıyor.", 0px, Space Grotesk. `shots/sss-empty.png`, `shots/route-loading.png`. |
| 404 has global navigation and recovery paths | PASS | Criterion 1. |
| Real HTTP/deployment 404 where hosting permits | **DEFERRED, explicitly and with a reason** | `src/pages/NotFound.tsx:68-99` states the gap and why. Verified independently: no `vercel.json`, `netlify.toml`, `public/_redirects`, `public/_headers`, `staticwebapp.config.json`, `firebase.json`, `.htaccess` or `public/404.html` exists anywhere in the tree; `public/` contains only `belgeler`, `favicon.ico`, `images`, `machine-loop.mp4`, `placeholder.svg`, `robots.txt`, `sequence-cnc`, `sequence-material`. Measured against the preview: `/bu-sayfa-yok` → `200 text/html`, i.e. a soft-404. Not a silent skip; the deferral is written down and the "adding `404.html` on a guess breaks every deep route" argument is correct for a static host. |

---

## Content truth and publication policy

`node scripts/claims-gate.mjs` → `PASS — 0 unverified claims across 27 rules`,
214 files / 27 666 non-comment lines (`claims-gate.txt`).

**Rendered-text scan (not source).** `probe-scale.mjs` / `probe-scale-expanded.mjs`
over the rendered `innerText` of every Phase 08 surface — with all 117 `<details>`
forced open first, because a closed `<details>` body is excluded from `innerText`
and the first pass had therefore read none of the 117 FAQ answers. 15 rule
families (machine count, headcount, facility size, revenue, order volume, years
of experience, "since YYYY", percentage KPI, capacity, superlative, testimonial,
client name, certificate number/registrar, material count, on-time delivery).
Result on the Phase 08 surfaces: every hit is a false positive (a list index
number, or `", firma"` inside a prose sentence). No scale, no headcount, no
machine count, no revenue proxy, no client name, no certificate number, no
superlative, no testimonial, no delivery statistic. Full output:
`scale-scan-expanded.txt`.

**The document register, checked against disk and against HTTP.** `/kalite-dosyasi`
prints four sizes. Bytes on disk: 81 083 / 103 038 / 92 312 / 88 370 → 79 / 101 /
90 / 86 KB, exactly the four printed values. `public/belgeler/*.pdf` are
`md5sum`-identical to the four `Politikalar/*.pdf` files §H names. All four serve
`200 application/pdf` with byte counts matching the disk exactly. The page states
no date, so there is no date to be wrong. `scripts/claims-gate.mjs:1384-1397`
re-measures the same thing on every run, so the register cannot drift.

**Certifications.** Rendered: ISO 9001:2015, ISO 14001:2015, OHSAS 18001 — the
three §C authorises and no more, with an explicit "Bu üç belge dışında bir
yönetim sistemi belgesi bulunmamaktadır" and an explicit refusal to print a
certificate number, a registrar or a verification link.

### Adversarial probe of the claims gate

Per §3.A. Copied `scripts/claims-gate.mjs` into a scratch tree at
`<scratch>/gateprobe/scripts/` (so `REPO_ROOT` resolves correctly) with a
`src/pages/Probe.tsx` containing three positive controls and ten adversarial
strings. The controls fired, so the tree was genuinely scanned:

```
### company-scale-disclosure — 4
  src/pages/Probe.tsx:4:  [48 mühendis]
  src/pages/Probe.tsx:5:  [15.000 metrekare]
  src/pages/Probe.tsx:12: [15 bin metrekare]
  src/pages/Probe.tsx:18: [6 işleme merkezi]
### periodic-volume-disclosure — 1
  src/pages/Probe.tsx:6:  [Yılda 50.000 adet]
```

**Eight strings that state company scale, headcount, machine count, order volume
or revenue and pass all 27 rules:**

| Input | Should have been caught by | Why it escapes |
|---|---|---|
| `Yıllık ciromuz 50 milyon TL seviyesindedir.` | §0 `DO_NOT_PUBLISH_REVENUE_OR_ORDER_VOLUME` | **There is no revenue rule at all.** No currency token (`TL`, `USD`, `EUR`, `₺`, `$`, `€`, `ciro`) appears anywhere in the 27 rules. This is the largest hole. |
| `Sipariş hacmimiz geçen yıl iki katına çıktı ve 8 milyon avroya ulaştı.` | same | same |
| `Bugüne kadar 12.000 parça teslim ettik.` | `periodic-volume-disclosure` | that rule requires a period by design; a cumulative total carries none, and `company-scale-disclosure` reaches `parça` only after a `+` |
| `2024 yılında 320 farklı siparişi tamamladık.` | `periodic-volume-disclosure` | the period is a year *label*, not a denominator/adverb/adjective |
| `Aylık ortalama 2.400 iş emri kapatıyoruz.` | `periodic-volume-disclosure` | `iş emri` is not in the count-noun list (`adet\|ünite\|parça\|birim\|palet\|parti\|sipariş`) |
| `Şu ana kadar 180 firmaya üretim yaptık.` | `company-scale-disclosure` | the noun list has `müşteri`, not `firma` |
| `Kadromuz 45 kişiden oluşmaktadır.` | `company-scale-disclosure` | the list has `kişilik ekip`, not bare `kişi` |
| `Atölyemizde otuz adet CNC tezgâh bulunmaktadır.` | `company-scale-disclosure` | every alternative requires a digit; the spelled-out numeral defeats them all |

None of these strings is present in the tree — the rendered scan above is clean.
This is a gate-coverage finding, not a Phase 08 content failure, and it is
reported because a gate is only as good as the class it can still be walked
around. `machine-inventory` and `unverified-certification` were probed too and
hold.

---

## Failed checks

| # | Check | Error / observation | Root cause | Production fix required? |
|---|---|---|---|---|
| 1 | `npx playwright test --project=critical-1280 -g "reference proportions"` | `expect(footer.bantOrani).toBeLessThan(0.26)` → received `0.2671875`. Re-run twice, identical. | `src/components/navigation/ia.ts:256-257` | **YES — blocking** |
| 2 | `npx playwright test --project=visual-1280 e2e/visual/radius-census.spec.ts` | `§4's source column still lands on a radius declaration` → `["src/components/ChatBot.tsx:225"]` | `docs/lean/17-inner-page-composition.md:137` vs `src/components/ChatBot.tsx` | **YES — blocking** |
| 3 | Rendered `/kvkk` madde 04 vs `/gizlilik-politikasi` madde 06 | KVKK enumerates transfers as "two cases"; the Gemini transfer is not one of them | `src/pages/KVKK.tsx` clause `aktarim` | **YES** |
| 4 | `probe-storage-and-hash.mjs` part A | `/cerez-politikasi` claims its storage list is complete; `sessionStorage` also holds `mas_intro_seen` | `src/pages/CerezPolitikasi.tsx` madde 02 vs `index.html:314` | **YES** |
| 5 | `probe-error-states.mjs` step 1 | CAD/format error and form error render a stock sonner toast | `src/components/ui/sonner.tsx` (unchanged since `2cd03c1`), `src/pages/TeklifAl.tsx:358,411,490` | Deferred in writing to Phase 09 — Orchestrator decision |
| 6 | `probe-design-membership.mjs`, `probe-legacy-accent.mjs` | five public routes still in the old language | `src/pages/TeklifAl.tsx`, `src/pages/Login.tsx`, `src/pages/CADDashboard.tsx` | Orchestrator decision — no phase owns it |

---

### DEFECT 1 — the two new footer links break the critical gate (BLOCKING)

**Measured** (`fail-1-critical-footer-ratio.txt`):

```
npx playwright test e2e/technical-landing.spec.ts --project=critical-1280 -g "reference proportions"
  x keeps reference proportions for headline, project cards and NEXUS rows
    Expected: < 0.26
    Received:   0.2671875     (run 1)
    Received:   0.2671875     (run 2)
    Received:   0.2671875     (run 3)
```

`0.2671875 x 1280 = 342 px`. The pre-Phase-08 footer measured 298 px — read
directly out of the old golden blob:
`git show 7dcfb65~1:e2e/__golden__/win32/visual-1280/shell-footer-home.png`
is `1278x298`; the new one is `1278x343`. `298 / 1280 = 0.2328`, comfortably
under the bound. So the test was green before this phase and is red after it.

**Root cause.** `src/components/navigation/ia.ts:256-257` adds
`Kabiliyet Profilleri` and `Kalite Dosyası` to `resourceLinks`. Those two rows
land in the footer's KURUMSAL column and grow the band by 45 px.

**Why this is not a bound that should simply be moved.** The bound is not
arbitrary and it is not stale. `e2e/technical-landing.spec.ts:255-270` is a
15-line comment written when Phase 04 raised it from 0.17 to 0.26, and it names
this exact failure in advance:

> "THE ASSERTION IS NOT WEAKENED, it is re-aimed at the same failure it always
> guarded against — a footer that stops being a title block: … **a fifth nav
> column, or a link column growing past ~9 rows**, or the conversion rule
> wrapping to two rows at desktop, each pushes past 0.26 (headroom over the
> measured value is 11%…)"

A link column grew. The guard fired. Moving the number to 0.27 would be the
third re-aiming of the same assertion in four phases and would make it
unfalsifiable.

**What I think happened.** Commit `931594f` adjudicated the footer growth
carefully and per viewport — its message contains the correct band tables for
768/1280/1440 and the correct `(0,-1)` finding at 375 — and rebanked 23 goldens
on that basis. What it did not do is run the `critical-*` projects, where the
same +45 px is a hard numeric contract rather than a picture. The visual
evidence and the proportional contract disagree, and only the picture was
consulted.

**Fix options (QA does not choose).** (a) absorb the two links without growing
the band — the KURUMSAL column is the tallest, so redistributing across the four
columns costs nothing; (b) place the two new surfaces in a different footer
group; (c) re-derive the contract with a written justification of the same
quality as Phase 04's. Do not simply raise the constant.

---

### DEFECT 2 — a Phase 08 edit moved a line the radius register cites (BLOCKING)

**Measured** (`fail-2-radius-citation.txt`):

```
npx playwright test --project=visual-1280 e2e/visual/radius-census.spec.ts
  x §4's source column still lands on a radius declaration
    Error: a cited line no longer declares a radius. A citation that has drifted
    is worse than no citation: it is what made the second version of this
    register look checkable.
    + Array [ "src/components/ChatBot.tsx:225" ]
```

**Root cause.** `docs/lean/17-inner-page-composition.md:137` reads

```
| `chat launcher` | 6 | 6 | 6 | `9999px` | 375: 48x48 · 768: 56x56 · 1280: 56x56 | `ChatBot.tsx:225` |
```

Verified green before the phase: `git show 7dcfb65~1:src/components/ChatBot.tsx`
line 225 **is** the launcher's `…rounded-full bg-primary…` declaration. Phase 08
inserted 143 lines into that file — the 81-line header comment at `:11-91`
(`a6d9f3f`) and the consent block at `:404-440` (`5138fc1`) — and the declaration
is now at `src/components/ChatBot.tsx:294`. Line 225 is now `[addAssistantMsg]`,
a `useCallback` dependency array.

`docs/lean/17:188` carries a second, un-asserted citation with the same drift:
`ChatBot.tsx:276-346` for the in-panel avatar/chip radii, now `:345-398`.

**Fix.** One-line citation update in `docs/lean/17-inner-page-composition.md:137`
(and `:188` while there). `docs/**` is outside the QA allowlist, so this is
reported rather than made. Nothing about the rendered radius changed; the
`every number in docs/lean/17 §4 comes back out of the browser` test in the same
file **passes**.

---

### DEFECT 3 — the KVKK notice still says transfers happen in exactly two cases

**Measured.** Rendered `/kvkk`, madde 04 "Aktarım" (`rendered-expanded.txt`):

> "Aktarım **iki hâlde** olur: yetkili kamu kurum ve kuruluşlarının kanuna dayalı
> talebi, ve bu sitenin çalışması için kullanılan barındırma ile veri tabanı
> altyapısının hizmet sağlayıcısı."

Rendered `/gizlilik-politikasi`, madde 06, added by the same phase:

> "…o ana kadarki yazışma önce sitenin kendi sunucu fonksiyonuna, oradan da
> Google'ın Gemini servisine (`generativelanguage.googleapis.com`,
> `gemini-2.0-flash`) iletilir"

`/cerez-politikasi` madde 03 says the same. `/kvkk` does not.

**Root cause.** `git show --stat 5138fc1` — the commit whose subject is *"the
chat does not stop at our backend — it goes to Google, so say that"* — touches
`docs/lean/18-document-surfaces.md`, `src/components/ChatBot.tsx`,
`src/pages/CerezPolitikasi.tsx`, `src/pages/GizlilikPolitikasi.tsx`. It does not
touch `src/pages/KVKK.tsx`. Two of the three legal texts were corrected; the one
whose statutory job is to enumerate *aktarım* was not.

**Why this is in scope and not a technicality.** The KVKK notice sets its own
scope broadly, in the phase's own new wording at madde 02: "Yüklediğiniz
dosyanın içeriği kişisel veri taşıyorsa — örneğin çizim antedindeki bir isim — o
veri de bu metnin kapsamındadır." Content-borne personal data is in scope by the
document's own rule. Text a visitor types into the chat is content-borne data of
exactly that kind — `/gizlilik-politikasi` madde 06 says so itself when it warns
"parça numarası, tolerans değeri, teknik resim içeriği ya da firmanızın adı gibi
… hiçbir bilgiyi sohbet kutusuna yazmayın". So a third transfer exists, and the
notice that enumerates transfers says there are two. Madde 02 has the mirror
gap: it lists the RFQ form and account e-mail and does not mention the chat,
where `/gizlilik-politikasi` madde 02 does.

This is the same defect class the phase spent itself removing (`/sss` analytics,
the `faq_analytics` write, the "şifreli ortamlarda saklanır" clause) — an
enumerating document that is misleading by omission even though no individual
sentence in it is false.

**Fix.** `src/pages/KVKK.tsx`, clause `aktarim` (and the collected-data clause),
worded from the code the same way clause 06 of the privacy policy was.

---

### DEFECT 4 — the cookie policy's storage list claims completeness and is short by one

**Measured** (`storage-and-hash.txt`, six public routes visited in one context):

```
cookies created over six public routes: []
localStorage keys:   ["mas-technic-theme"]
sessionStorage keys: ["mas_intro_seen"]
```

The no-cookie claim (madde 01) is **true** — zero cookies. The completeness
claim is not. Madde 01 says "Sakladığı şeyler … hepsi 02. maddede
listelenmiştir" and madde 02's table lists exactly four records:
`sb-…-auth-token`, `mas_chat_ai_count`, `mas_pending_cad_upload`,
`mas-technic-theme`. `mas_intro_seen` is not among them.

**Root cause.** `index.html:314` — `sessionStorage.setItem(KEY, "1")` inside the
inline "Precision Born" intro script, written once per session on `/` only.

**Severity.** Low in substance — it is a one-bit UI-state flag, not tracking, not
identifying, never sent anywhere. But it is a completeness assertion in a legal
text, and the surrounding table is precise to the point of naming an expiry per
row, which is what makes the omission visible. Add the fifth row, or drop the
word "hepsi".

---

### DEFECT 5 — CAD parse error and form error are still library defaults

**Reached, not inferred.** `probe-error-states.mjs` uploads a `.txt` file to the
single `input[type=file]` on `/teklif-al` and reads what appears
(`error-states.txt`):

```json
{ "tag": "li", "sonner": true,
  "text": "Desteklenmeyen dosya formatı.",
  "background": "rgb(255, 255, 255)",
  "borderRadius": "8px",
  "border": "1px solid rgb(217, 222, 226)",
  "fontFamily": "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont," }
```

Screenshot: `shots/teklifal-format-error.png` — a white, 8 px-rounded,
system-font card on a graphite shell. For contrast, the two states this phase
*did* brand measure `border-radius 0px` and
`font-family "Space Grotesk", system-ui, sans-serif`.

**Root cause.** `src/pages/TeklifAl.tsx:358` (`Desteklenmeyen dosya formatı.`),
`:411` (`STEP dosyası işlenirken hata oluştu.` — the CAD parse error by name) and
`:490` (the form error) all call `toast.error`, which resolves to
`src/components/ui/sonner.tsx`, a file unchanged since the initial commit
`2cd03c1`. `ShellNotice`'s `tone="error"` variant — introduced by `7dcfb65` and
described in its own commit message as "the one inline message block: form
error, parse error, caution" — is used **zero** times in `src/`
(`grep -rn 'tone="error"' src/` returns only the CSS rules and the comment; the
three real usages are all `tone="caution"`).

**This is a documented deferral, not a silent skip.** `docs/lean/18-document-surfaces.md:162-165`:

> "**Not wired, and deliberately:** the CAD parse error and the RFQ form errors
> live in `src/pages/TeklifAl.tsx`, which Phase 09 owns and Phase 08 may not
> edit. The primitive is here for Phase 09 to use; claiming those states are
> 'done' would be claiming a change that does not exist in that file."

I record this fairly: the reasoning is sound, the deferral is written down in the
repository, and Phase 09's acceptance criteria do include "All expected failure
states are designed and tested". But Phase 08's mandatory task names these two
states, criterion 5 is written unconditionally, and the criterion as written is
not met. Whether a Phase-09 ownership boundary overrides a Phase-08 acceptance
criterion is the Orchestrator's call, not QA's. I cannot verify the Coder's
write-allowlist claim ("Phase 08 may not edit") because I do not hold the Coder's
packet.

---

### DEFECT 6 — five public routes are still in the old generic design language

**Measured structurally, inside `<main>`, at 1280**
(`design-membership.txt`, `legacy-accent.txt`):

| route | shell-*/tl-* primitives | legacy teal nodes | Radix roots | off-register radii | `bg-card` | system-font nodes |
|---|---|---|---|---|---|---|
| all 10 Wave B surfaces | 47–404 | 0 | 0 | 0 | 0 | 0 |
| `/hakkimizda`, `/iletisim`, `/malzemeler`, `/hizmetler/cnc-frezeleme` (Wave A control) | 86–331 | 0 | 0 | 0 | 0 | 0 |
| `/teklif-al` | 1 | 16 | 3 | 0 | 0 | 0 |
| `/giris` | 0 | 92 | 0 | 0 | 0 | 0 |
| `/sifremi-unuttum` | 0 | — | — | 0 | 0 | 0 |
| `/reset-password` | 0 | — | — | 0 | 0 | 0 |
| `/cad-dashboard` | 1 | 16 | 3 | 0 | 0 | 0 |

Legacy teal = `rgb(10, 125, 138)`, sampled from the live page. All five are
public routes: `/giris`, `/sifremi-unuttum`, `/reset-password` and
`/cad-dashboard` are the four the repository's own contract calls
`NON_SHELL_PUBLIC_ROUTES` (`e2e/shared-shell-accessibility.spec.ts`), and
`/teklif-al` is a full-shell public route whose *body* is unmigrated. Visual
confirmation of `/teklif-al` at 1280: `shots/teklifal-format-error.png` — teal
`İLERİ` fill, teal upload tile, shadcn `Tabs`.

Two honest notes in the phase's favour. First, the radius register is clean
everywhere, including these five — the shadcn `--radius` token was retuned to the
shell register in an earlier phase, so the packet's expected "raw `rounded-lg`"
marker genuinely does not exist anywhere in the tree. Second, no repository
document records an exception for these five, and no phase's mandatory tasks name
a visual redesign of them: Phase 07 is Wave A (about/contact/materials/services/
sectors), Phase 08 is Wave B, Phase 09 owns `/teklif-al` for functionality and
security only, and the three auth routes are named by no phase at all. So
criterion 3 cannot be satisfied by any phase as currently written. That is a plan
gap the Orchestrator has to close, not something the Phase 08 Coder could have
fixed inside its scope.

---

## Adjudication of the two handed-over defects (§3.C)

### C.1 — `src/components/ChatBot.tsx:239-240`, the stale consent-prompt filter

Confirmed as described. Line 240 filters against
`"🤖 Bu soruyu daha detaylı yanıtlamak için AI asistanı kullanmamı ister misiniz? (Günlük limit: " + AI_DAILY_LIMIT + " mesaj)\n\n**Evet** yazarak onaylayabilirsiniz."`
while `:273` renders `` `…(Kalan: ${remaining} mesaj)\n\n**Evet** veya **Hayır** yazarak yanıtlayın.` ``.
The filter matches nothing.

**Traced payload.** `callAi(pendingAiPrompt, [...msgs.filter(never-matches), userMsg])`,
and `callAi`'s first parameter is never read — `streamChat({ messages: history })`
at `:211-212` sends the array whole. So Google receives: every prior turn in the
session (including any locally-answered FAQ exchange), the assistant's consent
prompt, and a **duplicate** of the original question. The literal `"Evet"` the
reader typed is correctly excluded (it is appended to `newMsgs`, not to the
payload).

**(a) Does this make any sentence on the legal pages false?** **No.** All three
texts are worded to cover it, and one of them deliberately so:

- in-panel, `ChatBot.tsx:414` — "Evet derseniz **o ana kadarki yazışma**, sitenin sunucusu üzerinden Google'ın Gemini servisine iletilir";
- `GizlilikPolitikasi.tsx:210-213` — "**o ana kadarki yazışma** önce sitenin kendi sunucu fonksiyonuna, oradan da Google'ın Gemini servisine … iletilir";
- `CerezPolitikasi.tsx` madde 03 — "yazışmanız … iletilir".

"The conversation up to that point" includes the assistant's own prompt. The
disclosure is broader than the code's intent, which is the safe direction.

**(b) Production fix required for Phase 08 to pass?** **No — carried item, for
Phase 09.** It is a code-correctness defect (a dead filter, one duplicated user
turn, one assistant turn the author meant to strip, and a few wasted tokens per
call), not an acceptance-criterion violation and not a disclosure defect.

**One corollary the Orchestrator should carry forward.** The defect is currently
*masked* by the broad wording. The moment anyone narrows clause 06 to something
like "only the question you asked is sent" — which is what `:240` was clearly
trying to make true — that sentence becomes false the same day, with no test
watching. The right fix is to key the filter on state (drop the trailing
assistant message when `pendingAiPrompt` is set) rather than on any string
literal, so the two can never drift again.

### C.2 — `src/components/ScrollToTop.tsx` ignoring `location.hash`

Confirmed and **measured at runtime**, three ways (`storage-and-hash.txt`):

```
B1. SAME-PAGE anchor click        {"scrollY":2115,"clauseTop":0,"hash":"#sohbet-asistani"}   <- works
B2. FULL navigation to the URL    {"scrollY":0,"clauseTop":2115,"hash":"#sohbet-asistani"}   <- does not
B3. clause link present in panel  true
B4. SPA <Link> click from the chat consent block
    {"url":"/gizlilik-politikasi#sohbet-asistani","scrollY":0,"clauseTop":2115,"viewportH":900}
    -> clause is NOT in the viewport
```

The clause sits 2115 px below a 900 px viewport. `ScrollToTop.tsx:7-19` is a
`useLayoutEffect` keyed on `pathname` alone that sets
`history.scrollRestoration = "manual"`, scrolls to 0, then schedules a second
`window.scrollTo(0, 0)` in `requestAnimationFrame` — which is why even a
**full page load of the pasted URL** fails, not just the SPA click: it overrides
the browser's own native fragment scroll. `src/components/Header.tsx:296` handles
hashes, but only when `onLanding`. Same-page anchors work, so the in-page
`MADDELER` index is unaffected.

**Adjudication.** This is a Phase 08 defect, and a narrow one.

- It does **not** touch criterion 1. Every link on the 404 is a route path, and I
  resolved them: three suggestions, three `200`s, three real `<h1>`s. The 404's
  recovery paths work.
- It **does** break the phase's own new disclosure affordance.
  `ChatBot.tsx:418` is the *only* cross-route hash link in the entire
  application — `grep -rnoE '(to|href)=\{?"[^"]*#[a-zA-Z0-9_-]+"' src/ | grep -v '="#'`
  returns exactly one line — Phase 08 created it, and it is the link a reader
  follows at the precise moment they are deciding whether to send text to a
  third party. It lands them at the top of a seven-clause document.

**Production fix required for Phase 08 to pass?** **Not on its own.** The
destination opens, the citation names the clause number in its own text
("Gizlilik Politikası, madde 06"), and the sticky `MADDELER` index puts the
clause one click away. I classify it **MEDIUM, required before release, not a
standalone blocker** — and I would not argue if the Orchestrator upgrades it,
because "the deep link in the privacy affordance does not land" is a poor thing
to ship. The fix is small and belongs in `src/components/ScrollToTop.tsx`: when
`location.hash` is present, scroll the target into view instead of resetting to
0, and leave the reset alone otherwise. It is production code, so it is
described here rather than made.

Phase 08 is not the author of `ScrollToTop.tsx` — the file is untouched by all 15
commits — but it is the author of the first link that depends on the behaviour.

---

## What Phase 08 got right, with the measurement

Stated because a FAIL report that lists only failures misrepresents the phase.

- **The `<h1>` recurrence of Phase 07's F3 did not happen.** All 15 Wave B paths
  expose exactly one `<h1>` in `main#main-content`, including both not-found
  bodies and both 404 branches (`e2e/qa-p08-waveb-contract.spec.ts`, 15/15 at
  `desktop-1280`). The 500-class state got its `<h1>` too, verified by reaching
  it.
- **Zero serious/critical axe violations** on all 15 paths at both
  `desktop-1280` and `mobile-375` (30/30). `incomplete` was not read as
  `violations`.
- **Reflow at 320 CSS px** holds on all 15 (15/15, `mobile-320`), measured as
  `documentElement.scrollWidth − clientWidth <= 1`.
- **Contrast**, with Phase 07's glyph-free instrument (negative controls
  reproduced at 21.0 / 1.0 / 3.033 / 3.033 / 3.977 on every route): **0 real
  failures** across `/kabiliyet-profilleri`, its detail, `/kalite-dosyasi`,
  `/blog`, an article, `/sss`, all three legal routes and the 404 — 1 587
  elements measured (`contrast-1280.json`, `contrast-1280.txt`). The two
  candidates it raised were both adjudicated and both cleared
  (`contrast-adjudication.txt`): `.shell-faq-source a` measures a uniform
  **6.319:1** (10 px, `rgb(78,85,82)` on `rgb(238,233,222)`) when every
  `<details>` is forced open — the single 2.583 reading was an artifact of a
  scroll step where the row was not painted at all (`naiveGlyphPx == modalBg`);
  and the 404 numeral is `aria-hidden="true"` with
  `-webkit-text-fill-color: transparent` and a `rgba(18,23,25,0.42)` 1.5 px
  stroke over paper — decorative, and the same "404" is carried as real text in
  the status readout.
- **Keyboard, SC 2.1.2.** The 117-item `/sss` register opens and closes from
  `Enter` on a `<summary>`, and `Tab` escapes the register within the bound. No
  trap.
- **Analytics removal is complete.** No `faq_analytics` write survives in public
  code (`src/components/admin/ChatbotAnalyticsView.tsx` is an admin *read*, and
  `admin/` is out of scope per §N). `src/pages/SSS.tsx` imports no Supabase
  client and runs no `useEffect`. No gtag/GTM/Plausible/Sentry/PostHog/Hotjar/
  Clarity/Matomo/Mixpanel/Segment anywhere in `src/`, `index.html` or `public/`.
  §K `ANALYTICS_PROVIDER: NONE` is now true of the code, not only of the copy.
- **The AI-disclosure claims check out against the code.** Local FAQ match makes
  no request (`findBestFaqMatch` over the bundled `src/data/chatFaqData`);
  `callAi` has exactly one call site (`ChatBot.tsx:240`) reachable only from the
  consent branch; the edge function forwards only `system_instruction` /
  `contents` / `generationConfig` and sets one header
  (`supabase/functions/chat/index.ts:34-45`), so no browser header and therefore
  no visitor IP reaches Google; the 103-line function holds no Supabase client,
  no `insert`, no `from(`; and the clause says nothing about Google's retention
  or training, which is correct because nothing in the repo can establish it.
  **No undisclosed third-party transfer exists**: the only outbound hosts
  reachable from a visitor's browser are `fonts.googleapis.com` /
  `fonts.gstatic.com` (disclosed, `index.html:265-274`) and the Gemini endpoint
  via the edge function (disclosed). The `pub-…r2.dev` URLs in `index.html:32,45`
  are `og:image`/`twitter:image` meta only and are never fetched by the visitor.
- **The register of four PDFs is exact** — see the document-register audit above.
- **`npx tsc -b` exit 0; `npm run build` exit 0.**

---

## The goldens (IMPLEMENTATION.md §12)

**No `--update-snapshots` was run, at any point, for any reason.** No golden PNG
was written, moved or deleted by QA.

**All four visual projects were run per project, in bounded foreground chunks.**
`visual-375`, `visual-768`, `visual-1440`: 35 passed, 0 failed each.
`visual-1280`: 40 passed, 1 failed — the failure is DEFECT 2, a citation check,
not a snapshot. **Every one of the 16 new and 23 modified baselines matched.**
No flake was observed in any of the four runs.

### Falsifying the rebank claim for the 23 modified goldens

Claim under test: the only change is the shared footer gaining two links, i.e. a
pure append below the fold with nothing above it moving. Old blobs read straight
out of `git show 7dcfb65~1:…`, decoded, compared row by row
(`probe-golden-rebank.mjs`, `probe-golden-shift.mjs`, threshold 16/255;
`golden-rebank.txt`, `golden-shift-375-*.txt`):

| golden | height Δ | first changed row | verdict |
|---|---|---|---|
| `visual-1280/landing-fullpage` | +45 | **3752** of 3918 (95.8 % down) | inside the footer region (footer ≈ last 298 rows, i.e. from 3620) — nothing above it moved |
| `visual-1440/landing-fullpage` | +45 | **3807** of 3973 (95.8 %) | same |
| `visual-768/landing-fullpage` | +45 | **5969** of 6144 (97.2 %) | same |
| `visual-1280/shell-footer-home` | +45 | **132** of 298 | crop *is* the footer; rows 0–131 byte-identical, everything below shifts +45 |
| `visual-1280/shell-footer-about` | +45 | **132** of 298 | same |
| `visual-1280/navigation-open` | 0 | **597** of 900 | inside the menu's KAYNAKLAR group; fixed-size overlay, so no height change |
| `visual-375/shell-footer-journal` | 0 | 10 | see below |
| `visual-375/shell-footer-notfound` | −1 | 0 | see below |

**The claim holds at 768/1280/1440.** No body content above the footer moved. At
threshold 1/255 there are scattered ±1 antialiasing pixels higher up (1–3 px on
a row); those are sub-perceptual and are why the meaningful measurement is at
threshold 8–16.

**At 375 the change is a different thing, and the commit says so.** Only 2 of the
6 footer crops changed there, because below 768 the nav columns become
disclosure panels with a real `hidden` attribute, so the two new links paint
nothing. The two that changed are exactly the two routes whose *body* this phase
rewrote. Row-by-row shift analysis: `shell-footer-notfound` is a **uniform −1**
(crop 743 → 742); `shell-footer-journal` is **0 down to row ~71 and −1 below it**
— a sub-pixel rasterisation shift from the footer element sitting at a different
fractional offset, not a content change. Source-level control, verified
independently: `SiteFooter.tsx`, `footer-groups.ts`, `claims.ts` and `Header.tsx`
are **byte-identical** across `7dcfb65~1..5138fc1` (`git diff --name-only` over
those four paths is empty), and the `shell.css` diff adds **no** `tl-footer` /
`shell-footer` selector. So the footer's own rendering did not change.

**Verdict: the rebank was justified.** No body content was silently rebanked
under cover of a footer change.

### The 16 new `waveb-*` baselines

Six opened and read directly (`waveb-profile-scope` @1280 and @375,
`waveb-quality-documents` @1280, `waveb-notfound-body` @1280 and @375,
`waveb-journal-lead` @1280 and @768); the remaining ten checked programmatically
for degeneracy (`golden-nondegenerate.txt`): 1 391–2 056 distinct 5-bit colours
each, dimensions 333x1521 to 1438x1665. **None is an empty band, a header
overlay or the chat launcher.** Each contains its stated subject:

- `waveb-notfound-body` — status readout, the populated `YAKIN KAYITLAR` block,
  the 8-entry directory, the three actions;
- `waveb-journal-lead` — the lead article opened up with plate, standfirst,
  section list and CTA;
- `waveb-quality-documents` — all four PDFs with `PDF · 79/101/90/86 KB`;
- `waveb-profile-scope` — the "Bunlar müşteri projesi **değildir**" heading and
  both paragraphs, so the golden really does guard the §G sentence it exists for.

---

## Observations (not Phase 08 defects; recorded so they are not lost)

1. **A capacity claim on `/sss` that `USER_INPUTS.md` does not authorise.**
   Rendered, inside an open `<details>`: *"Evet, 500 kg'a kadar ağırlık ve
   1500mm'ye kadar boyutta parça işleme kapasitemiz bulunmaktadır. Vinçli
   yükleme ve özel bağlama düzenleri kullanıyoruz."* Also *"CNC + konvansiyonel
   tezgah hibrit işleme kapasitesi"*. Source: `src/data/servicePages.ts:3112`,
   `:3118`, `:3223`. **Carried, not introduced:** `servicePages.ts` is untouched
   by all 15 commits, and `git show 7dcfb65~1:src/pages/SSS.tsx:53` already
   aggregated the same `page.faq` entries. The claims gate does not reach it —
   by its own documented design decision that a machine *envelope* (tool
   magazine, part size) is a legitimate specification while a machine *count* is
   not. I do not think that decision is wrong; I do think a max part weight and
   a hybrid machine mix sit closer to the §0 line than a tool magazine does, and
   somebody should decide deliberately rather than by rule coverage.
2. **Claims-gate holes** — eight strings, table above. The revenue hole is the
   one I would close first: §0 names revenue explicitly and no rule mentions a
   currency.
3. **Blog publication dates.** All six `date:` values are byte-identical to
   pre-Phase-08 (`15 Ocak 2024` … `10 Aralık 2023`) while the article bodies were
   rewritten wholesale. The same reasoning that moved `LEGAL_REVISION` to
   `4 Eylül 2026` — *"a date that had not been true since the texts were last
   edited"*, `LegalDocument.tsx:62-70` — was not applied here.
4. **`/gizlilik-politikasi` madde 06 says "Yalnızca 'Evet' yazarsanız"**;
   `ChatBot.tsx:233` also accepts `👍`. An understatement in the reader's favour,
   but an inaccuracy.
5. **Asymmetric naming.** Clause 05 names Google for Gemini but calls the font
   host only "harici bir yazı tipi dağıtım ağı". It is `fonts.googleapis.com` /
   `fonts.gstatic.com`. Not false; defensibly editorial; worth a decision.
6. **The 404 numeral**, measured as a stroke composite
   (`rgba(18,23,25,0.42)` over `#fbf8f1`), computes ≈ **2.75:1** against 3:1 for
   large text. `aria-hidden="true"`, purely decorative, and the same content is
   real text elsewhere on the page — so not a violation, but the number is here
   rather than omitted.
7. **The route-error state renders without header and footer**
   (`hasHeader: false`, `hasFooter: false`). Correct by construction — the shell
   comes from `PageShell` inside the page that just failed — and it is not a dead
   end (it offers `/` and `/iletisim`). Noted because the 404 *is* required to
   carry global navigation and the 500 reads differently.

---

## Commands run

```text
git log --oneline 7dcfb65~1..5138fc1                                   # 15 commits
git diff --stat 7dcfb65~1..5138fc1                                     # 67 files, +4165/-1264
npx tsc -b --pretty false                                              # exit 0
npm run build                                                          # exit 0
node scripts/claims-gate.mjs                                           # PASS - 0/27, 214 files
node <scratch>/gateprobe/scripts/claims-gate.mjs                       # adversarial: 3 controls fire, 8 probes pass
md5sum Politikalar/*.pdf public/belgeler/*.pdf                         # 4 pairs identical
curl -s -o /dev/null -w '%{http_code} %{size_download}' /belgeler/*.pdf  # 4 x 200 application/pdf, sizes exact
curl -s -o /dev/null -w '%{http_code}' /bu-sayfa-yok                   # 200 -> soft-404 confirmed

npx playwright test e2e/shared-shell-accessibility.spec.ts --project=desktop-1280      # 12 passed, 4 skipped
npx playwright test e2e/qa-p08-waveb-contract.spec.ts --project=desktop-1280           # 31 passed, 15 skipped
npx playwright test e2e/qa-p08-waveb-contract.spec.ts --project=mobile-375 --project=mobile-320
                                                                                       # 30 passed, 62 skipped
npx playwright test --project=visual-1280                              # 40 passed, 1 FAILED (radius-census citation)
npx playwright test --project=visual-1440                              # 35 passed
npx playwright test --project=visual-768                               # 35 passed
npx playwright test --project=visual-375                               # 35 passed
npx playwright test --project=critical-1280 --project=critical-375     # 162 passed, 1 FAILED, 3 skipped
npx playwright test e2e/technical-landing.spec.ts --project=critical-1280 -g "reference proportions"
                                                                       # x3, 0.2671875 every time

node reports/qa/phase-08/probe-render.mjs                              # 13 routes: h1 counts, links, text
node reports/qa/phase-08/probe-expanded.mjs                            # 11 routes with all <details> forced open
node reports/qa/phase-08/probe-scale.mjs / probe-scale-expanded.mjs    # 15-family publication-policy scan
node reports/qa/phase-08/probe-404.mjs                                 # both 404 branches + link resolution
node reports/qa/phase-08/probe-error-states.mjs                        # form/CAD error, empty, loading, route error
node reports/qa/phase-08/probe-design-membership.mjs                   # 19 routes, structural
node reports/qa/phase-08/probe-legacy-accent.mjs                       # 11 routes, teal + Radix
node reports/qa/phase-08/probe-storage-and-hash.mjs                    # cookies/storage + the hash deep link
node reports/qa/phase-08/probe-golden-rebank.mjs   (x8 goldens)        # first-changed-row falsification
node reports/qa/phase-08/probe-golden-shift.mjs    (x2 goldens)        # per-row shift profile at 375
node reports/qa/phase-08/probe-golden-nondegenerate.mjs                # all 16 waveb baselines
node reports/qa/phase-07/probes/p6-contrast.mjs  (QA_ROUTES=10 routes) # glyph-free contrast, 1587 elements
node reports/qa/phase-08/probe-faq-source.mjs                          # contrast adjudication
```

Playwright was run per project, in bounded foreground chunks, never
`run_in_background`, against a single `vite preview` on `:4173` via
`PLAYWRIGHT_BASE_URL`.

---

## Scope integrity

**PASS.**

- Production files modified by QA: **NONE**. `git status` before commit showed
  exactly two untracked paths: `e2e/qa-p08-waveb-contract.spec.ts` and
  `reports/qa/phase-08/`.
- Files created by QA, all inside the WRITE_ALLOWLIST:
  `reports/qa/phase-08.md`, `reports/qa/phase-08/**`,
  `e2e/qa-p08-waveb-contract.spec.ts` (new, `qa-` prefixed).
- No golden PNG written, moved or deleted. `--update-snapshots` never run.
- No assertion weakened, no tolerance broadened, no skip or xfail added, no
  coverage deleted. The one new spec adds only assertions the repository did not
  already make — see its header comment for the measured gap it closes (of the
  six surfaces Phase 08 created or rewrote, only `/sss` had ever been through a
  whole-page axe run in the repository suite).
- `PROGRESS.md`, `IMPLEMENTATION.md`, `USER_INPUTS.md`, `CLAUDE.md`,
  `MASTER_CONTEXT.md`, `docs/**`, `src/**`, `public/**`, `supabase/**`,
  `scripts/**` and all build/package config: untouched.
- Two transient files were touched and restored: `tsconfig.app.tsbuildinfo`
  (restored with `git checkout --`) and `tsconfig.e2e.tsbuildinfo` (a build
  artefact, deleted). Neither is in the final commit.

**Environment note, recorded because it changes what a fresh worktree renders.**
The worktree had no `.env`. Without it, `src/integrations/supabase/env` throws
`VITE_SUPABASE_URL is not set` at module load and **every route renders the
top-level branded error state** — my first 13-route pass captured
`<h1>Sayfa şu anda yüklenemedi.</h1>` on all 13 before I diagnosed it. I copied
`.env` from the main repo (it is `.gitignore`d at `.gitignore:16-17`, so it is
not in this commit) and rebuilt. Every measurement in this report is from the
rebuild. The accident is also the cleanest evidence that the top-level error
boundary is branded and reachable.

---

## Notes — what I could NOT verify

Stated plainly as unverified rather than assumed passing.

1. **The full `desktop-1280` regression project.** I started it and the Claude
   Code process exited mid-run. The specs it would have covered beyond what I
   did run are `footer-reveal`, `fullscreen-menu`, `malzemeler-sticky`,
   `material-category-footer`, `scroll-snap-regression` and the remaining
   `landing/**` specs at that one viewport. `critical-1280` / `critical-375`
   (166 tests) and `shared-shell-accessibility` at `desktop-1280` did run.
   The other seven regression viewports were not run at all.
2. **`smoke-*` (Firefox/WebKit).** Not run. Cross-browser behaviour of the Wave
   B surfaces is unverified.
3. **`e2e/visual/radius-census.spec.ts` at 375/768/1440.** The citation test is
   `desktop-1280`-scoped, so DEFECT 2 shows only there; the three other visual
   projects were green.
4. **Lighthouse / performance.** Not in this phase's criteria and not run.
5. **The Coder's write-allowlist.** DEFECT 5's deferral rests on the claim that
   "Phase 08 may not edit `TeklifAl.tsx`". I do not hold the Coder's packet and
   cannot confirm it.
6. **The real-HTTP-404 behaviour of the production host.** Unknowable from the
   repository — that is precisely the Coder's argument, and I agree with it. What
   I verified is only that no hosting config exists and that the preview serves
   `200` for an unknown path.
7. **Whether `mas_intro_seen` is the only unlisted storage record.** I measured
   six public routes in one browsing session. A route I did not visit, or a flow
   I did not complete (login, an RFQ submission), could write another.
8. **Contrast at 375.** The glyph-free instrument was run at 1280 only
   (1 587 elements). axe's `color-contrast` rule did run at `mobile-375` on all
   15 paths and found nothing serious/critical, but axe declines on composited
   backgrounds, which is the whole reason the Phase 07 instrument exists.
