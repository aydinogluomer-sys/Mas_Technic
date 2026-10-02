# QA 09b-1 R2 — STEP 3: the OAuth notice after capability was removed

`scripts/qa-probes/09b1r2-oauth-attack.mjs` — 47 cases, every one read off the **rendered DOM** on
`/giris`, behind `guard()` at `allowHosts=[]` with a live canary. No auth method called, no control
pressed, `U1`–`U7` not attempted. Evidence: `reports/qa/phase-09b1r2/oauth-attack.{txt,json}`.

## 3.0 A methodological failure of my own, first, because it nearly hid everything below

The probe's first run reported `rendered=false` for **all thirty** direct cases. That would have read
as "the filter rejects everything" and it was nothing of the kind: `page.goto("/giris#a")` followed
by `page.goto("/giris#b")` is a **same-document** navigation, so `Login` never remounted and the
module-level `consumed` latch was never re-armed. Thirty cases that had not run, presenting as thirty
cases that passed.

It was caught because the bounce control — which does load a new document — rendered on the *same
selector*. `about:blank` between cases forces a real load, and the comment at
`09b1r2-oauth-attack.mjs:130-139` records it rather than quietly fixing it. This is the fourth
instrument in this round found doing nothing, and the second of them mine.

## 3.1 Round 1's attacks, re-run — all fixed

| class | cases | result |
|---|---|---|
| the five inherited names (`constructor`, `__proto__`, `toString`, `valueOf`, `hasOwnProperty`) | 5 | all reach **FALLBACK** with the full label/title/detail. The `Map` closes the prototype hole. |
| the four removed reader-asserting entries | 4 | all reach **FALLBACK**. |
| round 1's `sifrenizi-yeniden-girin` | 1 | **`ref=null`** — nothing rendered, not a partial string. |
| URL, e-mail, HTML tag, `javascript:` | 4 | all `ref=null`. |
| boundary: 40 chars / 41 chars | 2 | 40 renders, 41 renders nothing. |
| boundary: five segments / six segments | 2 | five renders, six renders nothing. |
| `_leading`, `trailing_`, non-ASCII `şifrenizi_girin` | 3 | all `ref=null`. |
| `USER_BANNED`, `"  user_banned  "` | 2 | lowercased/trimmed to `user_banned` — as documented. |

**`"HESAP KAPALI"` was rendered in 0 of 47 cases.** Round 1 rendered it. The capability removal is
real, and the nine surviving `COPY` entries were read in full: every one of them describes the
attempt or the site. Verified, not assumed.

## 3.2 WHAT THE REMOVAL MISSED

### D-09b1r2-10 — the assertion rule was applied to the prose and not to the reference (medium, does not block)

The rule the four deletions were made under is stated at `oauth-return.ts:82-85`:

> a notice raised on the strength of a URL fragment may describe THE ATTEMPT or THE SITE. It may not
> assert a fact about the READER — their account, their identity, their standing, or what they did.

`COPY` now obeys it. `sanitiseReference` does not, and it renders a string the attacker wrote,
verbatim, in the site's own page. All four deleted assertions are reproducible through it — in
**Turkish**, which `user_banned` never was:

```
error_code=hesabiniz_kapatildi              → KOD: hesabiniz_kapatildi              ("your account has been closed")
error_code=hesabiniz_askiya_alindi          → KOD: hesabiniz_askiya_alindi          ("your account has been suspended")
error_code=eposta_adresiniz_zaten_kayitli   → KOD: eposta_adresiniz_zaten_kayitli   ("your e-mail address is already registered")
error_code=sifrenizi_buraya_yazin           → KOD: sifrenizi_buraya_yazin           ("type your password here")
```

`eposta_adresiniz_zaten_kayitli` is the one the file singles out as also contradicting `Login.tsx`'s
own standing policy — the site never says which addresses have accounts. It says it, from a
fragment, today.

**And the combination is worse than either part.** One crafted link supplies whitelisted prose *and*
the reader-fact claim:

```
/giris#error=access_denied&error_code=hesabiniz_kapatildi
  → "İZİN VERİLMEDİ / Giriş izni verilmediği için işlem tamamlanmadı. /
     Yeniden deneyebilir veya e-posta ve şifrenizle giriş yapabilirsiniz.  KOD: hesabiniz_kapatildi"
```

The site's own sentence lends credibility; the attacker's sentence supplies the content. Measured
identically through the **bounce** (`/musteri-paneli#…` → `/giris`), which is rule 1's one admitted
shape, so neither the shape rule nor the age rule reduces this.

**Why this is a gap and not a surprise.** The file *does* disclose a residue —

> IT CAN STILL BE LOWERCASE WORDS JOINED BY UNDERSCORES, and no character rule fixes that … That
> residue is stated rather than claimed away.

— but it frames the residue as "can read as an instruction" and never connects it to the assertion
rule it had just written two hundred lines above. The four entries were deleted because a fragment
must not assert a fact about the reader; the channel that renders the fragment's own text was left
governed by a shape test instead.

**And the correction is already in the file.** `oauth-return.ts:356-359` claims to know the whole
vocabulary: *"Every identifier the SDK and the auth server produce is lowercase snake_case with at
most four segments — the longest in the whole vocabulary is `provider_email_needs_verification`."* If
the vocabulary is known, the reference can be an **allowlist** rather than a shape test, and the
channel closes completely with no diagnostic loss. Choosing a shape test while asserting knowledge of
the closed set is the decision to revisit. For the Orchestrator to route.

### D-09b1r2-11 — the file says the rendered reference "cannot be … a phone number". It can. (low, does not block)

`oauth-return.ts:125-127`:

> So the RENDERED reference cannot contain a space, a full stop, a slash, an `@`, a hyphen or an
> uppercase letter, and therefore **cannot be a URL, an e-mail address, a phone number**, a formatted
> call to action, or `sifrenizi-yeniden-girin`.

Measured:

```
error_code=destek_05551234567    → KOD: destek_05551234567
error_code=whatsapp_05551234567  → KOD: whatsapp_05551234567
error_code=05551234567           → nothing   (the first segment must start [a-z])
```

`05551234567` is a complete, dialable Turkish mobile number and the shape admits it inside a segment.
The file contradicts itself two paragraphs later — *"digits survive inside a segment, so a number can
be present — it simply cannot be grouped or punctuated into a phone number"* — and the weaker,
correct sentence is the one that is buried. This paragraph was rewritten in `ec8d201`, whose subject
line is *"my own replacement comment rounded up, in the paragraph about a comment rounding up"*. It
rounded up again.

The remedy is one word of prose, or the allowlist above, which removes the question.

### An observation, not a defect — the whitelist can still make the site lie about itself

`#error_code=provider_disabled` renders *"Bu sağlayıcı ile giriş şu anda kullanılamıyor. E-posta ve
şifrenizle aşağıdan giriş yapabilirsiniz."* on a site whose provider is not disabled, and steers the
reader to a password field. This is **within** the file's stated rule (a notice may describe THE
SITE) and the field it steers to is the site's own, on the site's own origin, so no credential goes
anywhere new. Recorded so the rule's cost is on the record rather than discovered later.

## 3.3 Defects raised in this step

| id | file:line | severity | blocks |
|---|---|---|---|
| D-09b1r2-10 | `src/components/auth/oauth-return.ts:369-376` (`sanitiseReference` / `REFERENCE_SHAPE`) | medium | no |
| D-09b1r2-11 | `src/components/auth/oauth-return.ts:125-127` (comment) | low | no |
