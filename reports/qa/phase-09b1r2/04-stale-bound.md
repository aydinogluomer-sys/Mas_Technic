# QA 09b-1 R2 — STEP 4: the stale bound, shape rule and clock

Probes: `scripts/qa-probes/09b1r2-stale-bound.mjs`, `scripts/qa-probes/09b1r2-rule2.mjs`.
Evidence: `reports/qa/phase-09b1r2/stale-bound.txt`, `rule2.txt`. `guard()` at `allowHosts=[]`,
canary first, no auth call, `U1`–`U7` not attempted.

## 4.1 Round 1's finding is fixed

```
/malzemeler#error=…  →  read for 20 s  →  /giris in the same document
   at /malzemeler   rendered=false
   at /giris        rendered=false   documentAge=26110 ms
```

Rule 1 silences it. The 20-second stale announcement round 1 produced does not reproduce.

## 4.2 The shape rule, attacked at its edges — fail-closed everywhere

| entry path | landed at | notice | reading |
|---|---|---|---|
| `/musteri-paneli` | `/giris` | **yes** | the real redirect target |
| `/musteri-paneli/` | `/giris` | yes | trailing slash normalised, as the code says |
| `/musteri-paneli//` | `/giris` | yes | `replace(/\/+$/)` strips both |
| `/MUSTERI-PANELI` | `/MUSTERI-PANELI` | no | the router does **not** match case-insensitively here, so this can never be a genuine return either |
| `/Musteri-Paneli` | `/Musteri-Paneli` | no | same |
| `//musteri-paneli` | `//musteri-paneli` | no | fail-closed |
| `/musteri-paneli/x` | `/musteri-paneli/x` | no | fail-closed |
| `/malzemeler` | `/malzemeler` | no | correct |
| `/giris` direct | `/giris` | yes | raised from `location`, not the entry record — by design |
| `/reset-password` | `/reset-password` | no | not an OAuth entry — correct, and see §4.6 |

No near-miss lets a non-return in, and no near-miss silences something that could have been a genuine
return, because the paths that fail the test are paths the router does not serve either. The one
open question I had — a case-insensitive router turning a genuine return into a silenced one — is
**measured closed**.

### What rule 1 is, stated exactly

Rule 1 is a **staleness** discriminator, not an **authenticity** one. Measured:

```
/musteri-paneli#error=access_denied&error_code=hesabiniz_kapatildi
  → "İZİN VERİLMEDİ … KOD: hesabiniz_kapatildi"
```

Any crafted link that enters at the redirect target passes rule 1 unchanged. The file's prose reads
in one direction only — *"A document that entered at `/malzemeler` did not come back from a provider"*
— which is true and is all rule 1 claims; the converse is not established and the file's security
argument does not rest on it (that is the assertion rule's job, §3). Recorded so the two rules are
not confused later: **rule 1 answers "did this just happen?", not "is this real?"**.

## 4.3 The clock, measured on the rule rather than on the machine

Throttling measures a machine on a given afternoon. Offsetting `performance.now()` at document start
measures `RETURN_MAX_AGE_MS` itself:

```
apparent age +     0 ms → rendered=true
apparent age + 29000 ms → rendered=true
apparent age + 29900 ms → rendered=false     ← the boundary
apparent age + 30100 ms → rendered=false
apparent age + 35000 ms → rendered=false
apparent age + 83000 ms → rendered=false
apparent age + 89000 ms → rendered=false
```

The constant is exactly what the source says it is, the flip is sharp, and **the disclosed 83–89 s
hole is confirmed**: a document in that band is silenced.

## 4.4 The hole is wider than disclosed

The disclosure places the silencing at 83–89 s on a 20× CPU / 2G profile. Measured here, on the same
profile, on a **genuine-shaped** bounce:

```
20x CPU / 2G  →  /giris   rendered=false   documentAge=36176 ms   wall=36185 ms
```

The suppression happens at **36 s**, not 83 s. The gap above the 30 s bound is therefore not the
2.4× safety margin the source describes; on this profile the genuine return misses the bound by
about six seconds. Two honest caveats: this machine has 8 GB and was **running a Coder in parallel**,
so 36.2 s is an observation of this run and not a bound; and 20×/2G is deliberately worse than any
real phone. The point survives both: the distance between the slowest measured genuine return and
the constant is smaller than the record states, and it is a distance that shrinks with load rather
than with device class.

**D-09b1r2-12 (low, does not block).** The trade is disclosed and is a considered one; what is
understated is its margin. If it is ever revisited, the shape rule already carries the discrimination
and the clock is only guarding rule 2's residue — so the age bound could be tightened to rule 2's
case alone (`fromEntry` without a live `fromLive`) instead of applying to every return.

## 4.5 Rule 2's one-direction proof — insufficient, and it did not have to be

The author measured only the direction that does not fire, on the ground that the other direction
needs a session. **It does not.** Rule 2's load-bearing property is only "the document entered at
`/musteri-paneli` and `Login` mounts LATE in it". `App.tsx:157` wraps the route in
`CustomerProtectedRoute`, which is the component that calls `getSession()` and returns
`<Navigate to="/giris">`; hold **its** chunk and the document sits at `/musteri-paneli` in Suspense
until it arrives, and `Login` then mounts at whatever age the hold produced — with no auth anywhere.

```
hold      0 ms  → /giris  rendered=true   documentAge=  5764 ms
hold   6000 ms  → /giris  rendered=true   documentAge= 10359 ms
hold  36000 ms  → /giris  rendered=false  documentAge= 39495 ms
hold  45000 ms  → /giris  rendered=false  documentAge= 48520 ms
```

Both directions, measured. The suppression is the same suppression rule 2 relies on and it fires
exactly where `RETURN_MAX_AGE_MS` says it will.

*(A first attempt held `MusteriPaneli-*.js` and did nothing — 4.8 s wall against a 36 s hold, route
handler never fired — because the redirect happens in the wrapper and the page's own chunk is never
needed. A hold that holds nothing is this round's running theme, and it is in the probe's header
rather than deleted.)*

**Answer to the packet's question:** one direction was **not** sufficient, and the missing direction
is now supplied. What remains genuinely unverifiable without a session is rule 2's *premise* — that a
signed-in reader is not bounced and `Login` never mounts — which is read from
`CustomerProtectedRoute.tsx:31-33` and cannot be exercised under the prohibition. Carried as **U16**.

## 4.6 Found while reading `OAUTH_ENTRY_PATHS`: the app's other auth redirect target

**D-09b1r2-13 (medium, pre-existing, outside 09b-1's scope, does not block this phase).**

`OAUTH_ENTRY_PATHS` holds one path. The application has **two** auth redirect targets:
`Login.tsx:283` → `/musteri-paneli` and `ForgotPassword.tsx:63` → `/reset-password`. The second one
receives the same three parameters from the same server, and `oauth-return.ts:62-69` states the
policy for them:

> `error_description` is a string an unauthenticated third party controls … a sign-in page is the
> one surface where attacker-authored prose in the site's own voice is worth something, and "type
> your password here to continue" is a sentence. So the server's prose is never rendered.

`ResetPassword.tsx:71` reads `error_description` **first** in its precedence chain and `:184` renders
it directly:

```jsx
{urlState.error && <p className="shell-state-reason">{urlState.error}</p>}
```

Measured:

```
/reset-password#error=access_denied&error_code=otp_expired
               &error_description=Guvenlik%20dogrulamasi%20icin%20mevcut%20sifrenizi%20asagiya%20yazin.

  attacker sentence rendered verbatim on the page: true
  .shell-state-reason: "Guvenlik dogrulamasi icin mevcut sifrenizi asagiya yazin."
  password inputs present in the document: 0
```

The exact thing `oauth-return.ts` refuses to do, on the other auth page, today. It is **not** this
phase's change and it is mitigated by the fact that the expired state renders no password field
(`0` inputs), so the sentence has nothing directly under it to fill — but "the site's own voice
carrying an attacker's instruction on an auth route" is the property the policy exists to prevent,
and it is currently true on one of two auth routes. Raised for routing, not for correction here.

## 4.7 Defects raised in this step

| id | file:line | severity | blocks |
|---|---|---|---|
| D-09b1r2-12 | `src/components/auth/oauth-return.ts:229` (`RETURN_MAX_AGE_MS`) — margin understated | low | no |
| D-09b1r2-13 | `src/pages/ResetPassword.tsx:71,184` — attacker-authored prose rendered on an auth route; pre-existing | medium | no |
