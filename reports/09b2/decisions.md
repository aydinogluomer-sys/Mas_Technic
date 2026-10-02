# 09b-2 — THE DECISIONS, AND THE PREMISES THAT DID NOT SURVIVE

Written for whoever integrates this phase. Every line is either a decision with
its authority, or a measurement with the command that produced it. Nothing here
is legal copy; the legal copy is in the three pages.

---

## 1. HOSTS: **OBSERVED**, at registrable-domain granularity

**The rule.** The site publishes hosts the browser was **measured contacting**.
It does not publish a destination that appears in a vendor's configuration and
was never reached.

**Why observed and not configured.** 09b-1 read three hosts out of the
hCaptcha widget's own `clientOptions` — `accounts.hcaptcha.com`,
`api.hcaptcha.com`, `pst-issuer.hcaptcha.com` — and measured none of them being
contacted. Publishing them would mean writing *"tarayıcınız
api.hcaptcha.com'a istek gönderir"* about a request that does not happen: a new
false sentence, in the documents this run exists to make true, of exactly the
class it keeps removing. A configured list is also unfalsifiable by the reader
and un-testable by the repository — it is read out of a third party's minified
options object, which changes without notice. An observed list is checkable in
thirty seconds with devtools, which `CerezPolitikasi.tsx`'s own header says is
the only form a statement like this can take and still be worth anything.

**Where it is applied.** All three documents, and the rule itself is now
**published** in `/cerez-politikasi` madde 03's opening paragraph, because a
list is only checkable if the reader knows what it is a list of.

### The packet's premise about the fifth host does not survive

> *"`sentry.hcaptcha.com` is a fifth host `/cerez-politikasi` does not name.
> `CerezPolitikasi.tsx:85-86` lists … and stops."*

`CerezPolitikasi.tsx:85-86` is **inside the file's `/* … */` header comment**,
which spans lines 6–137. It is a measurement record. `blankComments()` keeps it
out of the claims gate and no reader ever sees it.

The **rendered** clauses name the registrable domain `hcaptcha.com` and have
never enumerated subdomains — `GizlilikPolitikasi.tsx`, `CerezPolitikasi.tsx`
and `KVKK.tsx` all do this. `sentry.hcaptcha.com` is inside that domain, so the
published disclosure already covered it, for the same reason it covers the
ephemeral `<id>.w.hcaptcha.com` workers whose *number* moved between Phase 08's
measurement and 09b-1's.

So no host was added to any page. What was wrong was the **comment**, and it is
corrected there.

### What the fifth host did change

Two things, and both are published:

- **Widget failure is now its own sentence.** Every published sentence about
  hCaptcha described the success path. Sentry is reached *only* when the widget
  fails — content blocker, flaky network, corporate proxy — which is precisely
  the reader most likely to be reading a cookie policy. `/cerez-politikasi`
  madde 03 now says a failed load also produces a request to the same domain.
- **The frame counts are gone.** `"iki çerçeve"` appeared in two documents. It
  is a closed count over a third party's implementation: nothing here controls
  it, nothing tests it, and the neighbouring worker count has already been
  observed to move. Same shape as the `"iki hâlde"` that `/kvkk` correction #5
  removed. What replaced it is the fact that survives — where the frames come
  from.

---

## 2. GOOGLE FONTS IS **NAMED**

`index.html:265-274` hardcodes `fonts.googleapis.com` and `fonts.gstatic.com`.
09b-1 measured the request on every route it tested, before any interaction.

The repository's *"describe, don't name"* convention was set for the **hosting
and database provider**, whose identity is a commercial relationship nothing in
`USER_INPUTS.md` publishes. It was never a rule about hostnames that are in the
page source and visible to any reader.

The reason to name them is `/kvkk` madde 06, which publishes the reader's
statutory right *"yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri
bilme"*. The same documents already tell the reader the chat sends text to
**Google**. A reader told "Google" once and "harici bir yazı tipi dağıtım ağı"
the other time cannot learn that both are the same company. All three documents
now say so, and all three say the two are independent Google services.

Checked against `mas-content-truth`: a font CDN hostname is not a MAS TECHNIC
fact at all — not scale, not a client, not a KPI. It is a fact about the
reader's own browser. Withholding it was the defect.

---

## 3. `/gizlilik-politikasi` madde 02's "TEK YER" — **FALSE**

The sentence: *"Bu, sitede yazdığınız bir metnin dışarı çıktığı **tek yer**
olduğu için…"* — "the only place text you write on this site leaves".

Measured against the flow, read from source rather than argued about:

| where | what leaves | read at |
| --- | --- | --- |
| `/iletisim` | `topic` and `notes` — the visitor's own free text | `Iletisim.tsx:151-159` |
| `/teklif-al` | `notes` built from the draft, plus name, company, phone | `useRfqSubmission.ts:265-278` |
| `/giris`, `/sifremi-unuttum`, `/reset-password` | the address the reader types | Supabase auth |
| chat, with consent | the conversation | `ChatBot.tsx` → `functions/v1/chat` → Gemini |

The first three go to the hosting and database provider, which madde 05 of this
same document, madde 02 of `/cerez-politikasi` and `/kvkk` madde 04 **all
enumerate as a third party**. A processor is a third party; the document says so
elsewhere and contradicted itself here.

And it is the worse kind of false, for the reason Phase 08's D3 turned on: it
**closes an enumeration**. It does not merely fail to mention the form path — it
denies it.

**The replacement makes no superlative at all.** It says the form path is madde
05's, the chat transfer is separate from it, it happens only with consent, and
that is why it has its own clause. Nothing to falsify.

---

## 4. `/kvkk` madde 04 — D3 **HOLDS**, and the clause was still short by two

**Verified, not assumed.** The enumeration under *"Aktarım yalnızca aşağıda tek
tek sayılan hâllerde olur"* contains the AI transfer, in its own paragraph, with
its own lead. Phase 08's D3 fix is intact.

The clause was nevertheless incomplete, and neither omission is exotic:

- **The font CDN.** Every route, before any interaction, IP and user agent to a
  third party. That is a transfer by this clause's own standard — its hCaptcha
  paragraph says exactly that about the identical mechanism. Both sibling
  documents already listed the fonts. The one document whose statutory job is to
  enumerate aktarım did not, and it is the **most-visited transfer on the site**.
- **The OAuth redirect.** `Login.tsx:281` calls `signInWithOAuth`, which
  navigates the browser to the auth server and onward to the provider. 09b-1
  could not establish whether `google` and `linkedin_oidc` are **enabled** and
  returned that question unanswered rather than answering it by a workaround, so
  the paragraph is written to be true either way: it states the hop the source
  proves and stops at the provider's own page.

Both are also added to `/cerez-politikasi` madde 03, whose closing sentence
*"İsteğin gittiği yerler bunlardır"* is the same shape of closed list.

**The structural note, left in-file.** A closed list is the right form for an
aydınlatma metni and it will go stale again, because it enumerates BEHAVIOUR and
nothing in the build compares it against the behaviour.
`e2e/qa-p08-storage-disclosure.spec.ts` does exactly that for the storage table,
which is why that table has stopped drifting. The equivalent for this clause —
walk the public routes, collect the request origins, assert every one is covered
by a published case — is the instrument this defect class needs. It is QA's
under §3.3 and it is named in `KVKK.tsx`'s header so the next person does not
rediscover the need from a sixth correction.

---

## 5. `mas-technic-theme` — the row was wrong about its own writer

Published as *"3B model görüntüleyicisinin açık/koyu paletini hatırlar"*.

The writer is the global `<Toaster>`: `ui/sonner.tsx` calls `useTheme()`,
`use-theme.ts:26-29` writes the key in an effect, and `GlobalToasts` is mounted
by `App.tsx:290` for **every** public route including `/`. So the key is written
on pages that have no 3D viewer at all — which is how 09b-1 found it, on the
three auth routes.

Same shape as Phase 08's storage defect: the gate is green because the key is
**listed**, and the sentence about it is wrong. The row now says the palette is
the interface's and that the record is written on every page.

---

## 6. THE SIX SOFTWARE-INVENTORY SITES — **ALL SIX. The ruling survives.**

The invited falsification was: *a CAD package name is not exactly a machine
model, because it tells a buyer something operational about file exchange.*

It fails, three times, on this repository's own facts:

1. **The operational fact is already published, and more honestly.**
   `servicePages.ts:224` derives the accepted list from
   `CAD_ACCEPTED_EXTENSIONS` and then names `.sldprt`, `.catpart` and `.prt`
   **in order to refuse them**, with the email route that works. Measured after
   this change: `dist/assets/servicePages-*.js` contains `CATIA` **exactly
   once**, and it is that refusal.
2. **Two of the six contradicted it.** `{ label: "CAD", value: "SolidWorks,
   CATIA, NX" }` is the shape Phase 09a deleted as D1c. A spec row labelled CAD
   listing three packages, on a page a buyer reads *before uploading*, reads as
   supported **input** — and the uploader refuses all three. For that site the
   file-exchange argument is the reason to remove it fastest, not to keep it.
3. **The other four say nothing about file exchange.** "…ile 3D modelleme",
   "3D Modelleme (…)", "…ile profesyonel tasarım", "tasarım (…)" describe what
   *we* model in. What we model in constrains what we can open; it does not tell
   a buyer what they may send.

Authority: §D supplies no software inventory; §0 sets
`DO_NOT_EMPHASIZE_COMPANY_SCALE`, and `mas-content-truth` forbids publishing
scale-revealing facts "merely because known"; Phase 06 removed named machine
models on the same grounds; `named-enterprise-system` already cites §D for
ERP/MES/CAM.

**What is lost, stated rather than glossed.** A buyer who works in CATIA loses
an ecosystem signal. That was worth something. It is given up because nothing
verifies a seat, a version or a licence, and because the reader gets the true
operational answer one page over.

**All six or none — it is all six**, and the two Phase 09a had already deleted
on the same reasoning are positive controls of the new rule, so the decision
covers what came before it as well as what it removed.

### The register became a rule

`DEFERRED_09B_SOFTWARE_INVENTORY` asserted the six sites still **resolved**;
that question is answered forever once they are gone. It is **emptied, not
deleted** — the notation is generic and `checkDeferredClassRegister` stays in
`NON_RULE_CHECKS`, so the registry control and the two fixture controls keep the
instrument proven even though the live register is empty.

Its successor is `named-cad-package`. **"Still there" became "may not come
back"**, which is strictly stronger.

---

## 7. THE SWEEP — what the class actually contained

Ran over the 159 non-excluded files of every scanned root with comments blanked,
under a vocabulary far wider than the live `unapproved-confidentiality` rule:
confidentiality, NDA path, retention, deletion, and security property.

**One hit, and it is the deliberate negative statement:**

```
src/pages/KVKK.tsx  "Bu metin belirli bir gün sayısı veya sabit bir imha
                     takvimi taahhüt etmez."
```

**Nothing has crept back.** The four earlier removals all hold:
`claims.ts:447` keeps `CONFIDENTIALITY_PROMISE` withheld, `RfqAside.tsx:32`'s
deliberate silence is intact, `/gizlilik-politikasi` still has no security
clause, and `/kvkk` clause 05 still states only the statutory position.

### The one family worth naming, ALREADY ADJUDICATED — not reopened

Eight live sites across `/endustriyel/savunma-sanayi` and
`/endustriyel/ozel-projeler` say some form of *"Teknik verinin nasıl
paylaşılacağı … proje başında yazılı olarak mutabık kalınır."*

These are **not drift**. `git log -S` puts all eight in commit `8d31435`
("finish the servicePages sweep"), the same commit that deleted:

```
- "Gizlilik protokolümüz kapsamında NDA (gizlilik sözleşmesi) zorunlu, erişim
   kontrollü üretim alanı, … güvenlik soruşturmasından geçmiş personel …"
- "IP Koruma — NDA ve fikri mülkiyet güvencesi"
- { label: "Gizlilik", value: "NDA zorunlu" }
- { question: "NDA imzalıyor musunuz?", answer: "Evet, tüm özel projelerinde
   NDA zorunludur. IP koruma ve gizlilik güvencesi sağlıyoruz." }
```

They are the adjudicated replacements, written in the same batch as the
removals. The packet says not to reopen that, and it is right not to.

**Flagged, not changed:** the replacements are a *process* commitment ("terms
are agreed in writing at project start"), which is one reader-inference from an
NDA path while §J records `NDA_AVAILABLE: NO`. That judgement was taken by
Phase 06 with the full context; it is recorded here so the next reader knows it
was seen and left alone deliberately, not missed.

### Out of this class, found while sweeping, reported rather than changed

- **`src/components/landing/RestoredLandingSections.tsx:42`** offers
  `"STEP, STP, IGES, Parasolid, SolidWorks ve teknik resim formatlarını
  değerlendirebiliriz"` — a **rejected format offered as accepted**, the D1
  class. `cad-format-list-not-derived` walks past it because
  `değerlendirebiliriz` is **not in `CAD_OFFER_PREDICATE`**. Measured **absent
  from `dist/`**: the string is reachable only from the dev-only
  `/legacy-landing` route, so it is not published copy. The file is outside this
  packet's allowlist, and widening the predicate would turn the gate red on a
  file this packet may not fix. It is a negative control of `named-cad-package`
  with the reason written beside it, so the new rule cannot quietly swallow
  another rule's finding.
- **`src/data/chatFaqData.ts:93`** — `"Türkiye genelinde anlaşmalı kargo
  firmalarıyla güvenli gönderim yapıyoruz. Yurt dışı sevkiyat için de DHL,
  FedEx ve UPS ile çalışıyoruz. Özel paketleme ve sigortalı gönderim
  seçenekleri mevcuttur."` Named logistics partners and an insured-shipping
  offer, neither verified by any §D field. This is the `named-supplier` class,
  not item 7's; acting on it here would be scope creep into a decision this
  packet was not given.
- **`ChatBot.tsx`'s `callAi(text, history)`** never reads its first parameter —
  it was dead before this phase and is dead after. Left alone; noted so the
  next reader does not assume `pendingAiPrompt` is sent because it is passed.

---

## 8. THE TWO SMALL ONES, AND WHY EACH GOT A TEST

**`ChatBot.tsx`** filtered its own consent prompt out of the outbound
conversation against a string **literal** the component no longer produced
("Günlük limit: 5" vs the rendered "Kalan: N"). Nothing matched, nothing was
filtered. `Msg` now carries `kind?: "ai-consent"`, written by the same `send()`
call that renders the prompt.

Measured on the unfixed build: **nine entries on the wire** that should not have
been there. The re-appended duplicate of the reader's own question went with the
fix — `msgs` already ends with it, and the duplicate only existed because the
dead filter was the reason it needed re-adding.

`e2e/09b2-chat-consent-transfer.spec.ts` asserts on the **request body**, so it
is independent of the copy that masked this, and on the **source**, so a
literal-keyed filter cannot return quietly.

**`ScrollToTop.tsx`** destructured only `pathname`. Measured on the unfixed
build by the new spec: the cited clause sits **2447 px** below the top of a
1280×800 viewport, on both entry paths. Restoring native behaviour is not enough
for either — on a full navigation the browser resolves the fragment before the
`lazy()` route mounts, and on an SPA click the browser performs no fragment
scroll at all — so the target is resolved on a bounded rAF poll that goes
through `window.__lenis` when Lenis is running.

`e2e/09b2-fragment-navigation.spec.ts` drives the SPA path through the **real
affordance**: the launcher, an unmatched question, and the link inside the
consent block. Every Supabase origin is aborted at the route level and the chat
endpoint is fulfilled locally, so the production-write prohibition holds by
construction rather than by the test's good behaviour.

Consequence recorded in `KVKK.tsx`: its header said the numeric
cross-reference carries no `#` *because* `ScrollToTop` overrode fragments. That
constraint is gone. The citation style is **left as it is** — changing it is an
IA decision about three documents at once — but the next person now knows it is
a choice rather than a workaround.
