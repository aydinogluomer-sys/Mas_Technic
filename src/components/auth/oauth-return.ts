/* ══════════════════════════════════════════════════════════════════════════
   THE OAUTH RETURN LEG — THE ONLY PLACE A SOCIAL SIGN-IN CAN REPORT FAILURE

   ── WHY THE BUTTONS COULD NOT REPORT ANYTHING ────────────────────────────
   Read from the installed SDK, `@supabase/auth-js` 2.95.3:

     GoTrueClient.js:1854  async _handleProviderSignIn(provider, options) {
     GoTrueClient.js:1863      window.location.assign(url);
     GoTrueClient.js:1865      return { data: { provider, url }, error: null };

   `signInWithOAuth` makes NO request. It builds an `/authorize` URL, hands the
   browser to it, and returns `error: null` on every path. An `if (error)`
   branch after that call is unreachable code — which is why there is no such
   branch in `Login.tsx` any more — and it means the outbound leg is not a
   place where failure can be detected at all. The information exists only on
   the way back.

   ── WHAT THE WAY BACK CARRIES ────────────────────────────────────────────
   `src/integrations/supabase/client.ts` sets no `flowType`, so the client
   takes the SDK default (`GoTrueClient.js:20  flowType: 'implicit'`) and an
   OAuth failure comes back in the FRAGMENT:

     {redirectTo}#error=…&error_code=…&error_description=…

   A PKCE-shaped return would put the same three in the query string, so both
   are read here; query wins on a collision, matching the SDK's own
   `parseParametersFromURL` (`lib/helpers.js:66-85`).

   THE SDK SEES THOSE PARAMETERS AND THROWS THEM AWAY. `_getSessionFromURL`
   raises `AuthImplicitGrantRedirectError` at :1462 — BEFORE either of its two
   URL-clearing paths (`searchParams.delete('code')` at :1494 and
   `location.hash = ''` at :1533) — so the parameters are still in the URL,
   and `_initialize()` at :273 returns `{ error }` to a caller that does not
   exist. Nothing in this application read them before this file.

   ── THE HOP THAT ERASES THEM, AND HOW THIS SURVIVES IT ───────────────────
   `Login.tsx` asks for `redirectTo: {origin}/musteri-paneli`, which is a
   protected route. An unauthenticated reader — and a failed OAuth reader is
   exactly that — is bounced by `CustomerProtectedRoute` with
   `<Navigate to="/giris" replace />`. A bare path carries no hash, so the
   parameters are gone by the time this page mounts. MEASURED, not assumed:
   `reports/09b1c1/oauth-return-before.txt`, case `panel-fragment`, lands on
   `/giris` with an empty `location.hash`.

   `history.replaceState` rewrites the URL; it does not re-navigate. So the
   document still remembers the URL it was FETCHED with, and
   `reports/09b1c1/url-survival.json` measures which of the platform's records
   keeps it:

     location.href      http://localhost:4173/giris                  lost
     document.URL       http://localhost:4173/giris                  lost
     document.baseURI   http://localhost:4173/giris                  lost
     document.referrer  ""                                           lost
     PerformanceNavigationTiming.name
                        http://localhost:4173/musteri-paneli#error=… KEPT

   That is the whole mechanism. `navigation.name` is the document's own record
   of where it came from, it is immutable for the life of the document, and
   reading it needs no change to the redirect URL, no change to the protected
   route, and no guess about how the project is configured.

   ── WHAT IS DELIBERATELY NOT RENDERED ────────────────────────────────────
   `error_description` is a string an unauthenticated third party controls: a
   link to `/giris#error_description=…` puts whatever it says on this site's
   sign-in page. React escapes it, so it is not script injection — but a
   sign-in page is the one surface where attacker-authored prose in the site's
   own voice is worth something, and "type your password here to continue" is
   a sentence. So the server's prose is never rendered.

   ── AND THE WHITELIST WAS NOT ENOUGH, BECAUSE CHOOSING IS ALSO WRITING ───
   The first version of this file concluded that a whitelist settles it: the
   attacker cannot WRITE the prose, so the prose is ours. That is half true
   and the missing half is the dangerous one. They cannot write it, but they
   CHOOSE it — `#error_code=user_banned` used to render "HESAP KAPALI / Bu
   hesap ile giriş yapılamıyor / Hesabınızın durumunu öğrenmek için bizimle
   iletişime geçin" to a reader who was never banned and may never have had an
   account. That is not our sentence about their account; it is their sentence
   in our voice, and it ends by asking the reader to open a support channel,
   which is where a pretext gets spent.

   SO THE WHITELIST NOW HAS A RULE, AND IT IS ABOUT WHAT MAY BE ASSERTED:

     a notice raised on the strength of a URL fragment may describe THE
     ATTEMPT or THE SITE. It may not assert a fact about the READER — their
     account, their identity, their standing, or what they did.

   The reason is asymmetry, not squeamishness. This site cannot verify any of
   the three parameters: no session, no exchange, nothing but a string in a
   fragment. When the claim is about the attempt ("giriş tamamlanamadı",
   "adım zaman aşımına uğradı") the worst a forged link achieves is a true
   sentence — the attempt really did not complete, since there was no attempt
   — followed by advice that works: sign in with e-mail below. When the claim
   is about the reader ("hesabınız kapalı", "bu e-posta zaten kayıtlı",
   "adresiniz doğrulanmamış") a forged link manufactures a false belief about
   the reader's own account, which is leverage, and one of them additionally
   contradicts this page's own standing policy: `Login.tsx` keeps the sign-in
   failure generic precisely so the site never says which addresses have
   accounts, and `identity_already_exists` said it from a fragment.

   Four entries were removed on that rule — `user_banned`,
   `identity_already_exists`, `email_exists`,
   `provider_email_needs_verification`. NOTHING DIAGNOSTIC IS LOST: they fall
   through to `FALLBACK`, whose detail asks the reader to relay the code, and
   the code itself is still rendered. The assertion is withdrawn; the evidence
   is not.

   ── WHAT THE REFERENCE IS, AND WHAT IT IS NOT ────────────────────────────
   The raw code is shown as a support reference. An earlier version of this
   comment claimed it "cannot hold an instruction". THAT WAS FALSE and QA
   proved it by rendering `KOD: sifrenizi-yeniden-girin` — lowercase, hyphens,
   inside the old `[a-z0-9_-]{0,48}` class, and a complete Turkish sentence.

   What is now true, stated exactly, because a comment that rounds up is the
   defect this paragraph is repairing. The value is `trim()`ed and lowercased,
   then TESTED against the shape GoTrue actually emits rather than stripped
   down to a permissive class: `^[a-z][a-z0-9]*(_[a-z0-9]+){0,4}$`, at most 40
   characters. Anything that fails the test renders nothing at all — not a
   partial string, nothing.

   So the RENDERED reference cannot contain a space, a full stop, a slash, an
   `@`, a hyphen or an uppercase letter, and therefore cannot be a URL, an
   e-mail address, a phone number, a formatted call to action, or
   `sifrenizi-yeniden-girin`, which QA rendered and which the filter now
   discards. Measured, every case, in `reports/09b1c2/oauth-notice.txt`.

   TWO THINGS THAT SENTENCE DOES NOT SAY. Capitals are LOWERCASED, not
   rejected: `#error_code=USER_BANNED` renders `user_banned`, because GoTrue's
   vocabulary is case-insensitive in practice and rejecting a real code over
   its case would lose a support reference. And digits survive inside a
   segment, so a number can be present — it simply cannot be grouped or
   punctuated into a phone number.

   IT CAN STILL BE LOWERCASE WORDS JOINED BY UNDERSCORES, and no character
   rule fixes that, because "is an instruction" is a property of meaning and
   this is a filter over characters. That residue is stated rather than
   claimed away. What actually carries the weight is one line above: the
   site's own prose no longer varies with the code beyond a whitelist that
   asserts nothing about the reader, so a token that reads as words sits next
   to a `KOD:` label in mono and is contradicted by every sentence around it.

   ── AND IT MUST BE ABOUT SOMETHING THAT JUST HAPPENED ────────────────────
   `PerformanceNavigationTiming.name` is immutable for the life of the
   document, which is the property that makes the bounce readable at all and
   is also a way to be wrong. MEASURED by QA: land on `/malzemeler#error=…`,
   read for twenty seconds, reach `/giris` in the same document, and a
   twenty-second-old failure is announced with no indication of its age.

   The first answer here was a clock, and MEASURING IT KILLED IT: on 6× CPU
   with the network at 3G a GENUINE bounce reaches the notice at 14.3 s, so any
   threshold tight enough to catch QA's twenty seconds also silences a real
   sign-in failure on a slow phone. The discriminator is not speed, it is
   SHAPE — where the document entered. See `OAUTH_ENTRY_PATHS` and
   `RETURN_MAX_AGE_MS`.
   ══════════════════════════════════════════════════════════════════════════ */

export type OAuthProvider = "google" | "linkedin_oidc";

export type OAuthReturn = {
  /** Which record carried it — `location` for a direct return, `document` for the bounce. */
  source: "location" | "document";
  /** Mono status label for `ShellNotice`. */
  label: string;
  /** One-line summary in this site's voice, never the server's. */
  title: string;
  /** What the reader can do next. */
  detail: string;
  /** Sanitised technical reference, or `null` when the server sent nothing usable. */
  reference: string | null;
  /** The provider whose button started this, when this tab still knows. */
  provider: OAuthProvider | null;
};

const HANDOFF_KEY = "mt.auth.oauth-handoff";
/** A handoff older than this cannot be trusted to name the provider. */
const HANDOFF_TTL_MS = 10 * 60 * 1000;

/* ── BOUNDING THE STALE NOTICE — TWO RULES, AND THE FIRST IS THE REAL ONE ──

   `PerformanceNavigationTiming.name` never changes, so without a bound this
   file answers "was this document FETCHED with an error?" when the question
   the reader is owed is "did something just fail?". QA pulled the two apart
   with no session at all: land on `/malzemeler#error=…`, read for twenty
   seconds, reach `/giris` in the same document, and a twenty-second-old
   failure is announced as news.

   RULE 1 — WHERE THE DOCUMENT ENTERED, WHICH IS A SHAPE AND NOT A SPEED.
   The entry record is consulted ONLY when the document was fetched with the
   OAuth redirect target. `Login.tsx` asks for `redirectTo:
   {origin}/musteri-paneli`, a protected route that renders NOTHING and hands
   an unauthenticated reader straight to `/giris`; that is the entire reason
   the entry record has to be read in the first place. A document that entered
   at `/malzemeler` did not come back from a provider — it was READ, and then
   navigated. Its entry record is not a return leg and is never consulted.

   This is stronger than a clock because it does not degrade with the device.
   A 3G phone on a throttled CPU takes ten seconds to reach the notice and is
   still unambiguously a return; a fast reader who spends four seconds on
   `/malzemeler` is unambiguously not, and no threshold separates those two.
   The entry path does, exactly.

   RULE 2 — AGE, FOR THE ONE CASE RULE 1 CANNOT SEE. A reader who is ALREADY
   signed in when the crafted or genuine parameters arrive is not bounced: the
   panel renders, `Login` never mounts, and the entry record — a legitimate
   `/musteri-paneli` one — waits. If they later sign out, `Login` mounts in
   that same document and the old failure surfaces. Rule 1 admits it, so age
   bounds it.

   THE NUMBER IS MEASURED, NOT PICKED. `reports/09b1c2/oauth-notice.txt`
   records `performance.now()` at DOM insertion of the notice, for the real
   protected-route bounce and a direct return, on three profiles:

     bounce  warm             409 ms      direct  warm            591 ms
     bounce  6× CPU + 3G   12 336 ms      direct  6× CPU + 3G  10 935 ms
     bounce  20× CPU + 2G  inconclusive   direct  20× CPU + 2G  SUPPRESSED

   THE FIRST DRAFT OF THIS CONSTANT WAS 10 000 ms AND THE MEASUREMENT KILLED
   IT: a genuine return on a throttled phone arrives at 10.9–12.3 s and would
   have been swallowed in silence — the exact failure mode this file exists to
   remove. 30 000 ms sits at 2.4× the slowest genuine return measured and well
   under the time it takes to read a panel and sign out of it.

   AND THE COST IS MEASURED TOO, NOT ASSUMED AWAY. On a deliberately absurd
   20× CPU / 2G profile the direct case reached a MOUNTED sign-in form with the
   document 89 s old and the notice was suppressed — a real failure silenced by
   this rule. That profile is far worse than any phone, but the trade is real
   and it is stated: past 30 s this file prefers saying nothing to saying
   something that may not have just happened. */
const RETURN_MAX_AGE_MS = 30_000;

/* The OAuth redirect target — the only path a document can have ENTERED at
   and still be a return leg. It must stay in step with `Login.tsx`'s
   `redirectTo`; `reports/09b1c2/oauth-notice.txt` measures the consequence
   from four entry paths, of which only this one raises a notice. */
const OAUTH_ENTRY_PATHS = new Set(["/musteri-paneli"]);

function isOAuthEntry(href: string): boolean {
  try {
    const path = new URL(href).pathname.replace(/\/+$/, "");
    return OAUTH_ENTRY_PATHS.has(path === "" ? "/" : path);
  } catch {
    return false;
  }
}

/** Milliseconds since this document began navigating. `null` if unavailable. */
function documentAgeMs(): number | null {
  try {
    const now = performance.now();
    return Number.isFinite(now) ? now : null;
  } catch {
    return null;
  }
}

/* One document, one report. The parameters that survive in
   `PerformanceNavigationTiming.name` are immutable for the life of the
   document, so without this a reader who signs in with e-mail, uses the
   panel and signs out again — all inside the same document — would be shown
   the old OAuth failure a second time on their way past this route. */
let consumed = false;

type Copy = { label: string; title: string; detail: string };

/* THE COPY, KEYED BY GOTRUE'S OWN ERROR IDENTIFIERS — AND WHY IT IS A `Map`.

   It was a plain object literal indexed as `COPY[code]`, so every key on
   `Object.prototype` resolved through it: `#error_code=constructor` — and
   `__proto__`, `toString`, `valueOf`, `hasOwnProperty` — returned a truthy
   inherited value, the `|| FALLBACK` was skipped, and the notice rendered
   with an empty label, no title and an empty body. The fallback that exists
   for exactly the unknown-code case was bypassed BY the unknown-code case.

   A `Map` is used rather than an `Object.hasOwn` guard at the one call site
   because a guard is a rule that has to be remembered at every future call
   site and a `Map` has no prototype chain for string keys to walk at all. The
   defect class is removed rather than defended against.

   MEMBERSHIP IS GOVERNED BY THE ASSERTION RULE at the top of this file: an
   entry may describe the attempt or the site, never the reader. */
const COPY = new Map<string, Copy>(Object.entries({
  access_denied: {
    label: "İZİN VERİLMEDİ",
    title: "Giriş izni verilmediği için işlem tamamlanmadı.",
    /* Was "Sağlayıcı ekranında izni onaylamadınız." — an assertion about what
       the reader did, and false for every reader who arrived on a crafted
       link. The next step is the useful half and it is true either way. */
    detail: "Yeniden deneyebilir veya e-posta ve şifrenizle giriş yapabilirsiniz.",
  },
  provider_disabled: {
    label: "SAĞLAYICI KAPALI",
    title: "Bu sağlayıcı ile giriş şu anda kullanılamıyor.",
    detail: "E-posta ve şifrenizle aşağıdan giriş yapabilirsiniz. Sorun sürerse bize bildirin.",
  },
  oauth_provider_not_supported: {
    label: "SAĞLAYICI KAPALI",
    title: "Bu sağlayıcı ile giriş şu anda kullanılamıyor.",
    detail: "E-posta ve şifrenizle aşağıdan giriş yapabilirsiniz. Sorun sürerse bize bildirin.",
  },
  validation_failed: {
    label: "SAĞLAYICI KAPALI",
    title: "Bu sağlayıcı ile giriş şu anda kullanılamıyor.",
    detail: "E-posta ve şifrenizle aşağıdan giriş yapabilirsiniz. Sorun sürerse bize bildirin.",
  },
  signup_disabled: {
    label: "KAYIT KAPALI",
    title: "Bu sağlayıcı ile yeni hesap oluşturulamıyor.",
    detail: "Zaten hesabınız varsa e-posta ve şifrenizle giriş yapın.",
  },
  bad_oauth_state: {
    label: "OTURUM DÜŞTÜ",
    title: "Giriş adımı zaman aşımına uğradı.",
    detail: "Baştan başlamak için butona yeniden basın; bu genellikle sekme uzun süre açık kaldığında olur.",
  },
  bad_oauth_callback: {
    label: "OTURUM DÜŞTÜ",
    title: "Giriş adımı zaman aşımına uğradı.",
    detail: "Baştan başlamak için butona yeniden basın; bu genellikle sekme uzun süre açık kaldığında olur.",
  },
  flow_state_expired: {
    label: "OTURUM DÜŞTÜ",
    title: "Giriş adımı zaman aşımına uğradı.",
    detail: "Baştan başlamak için butona yeniden basın; bu genellikle sekme uzun süre açık kaldığında olur.",
  },
  flow_state_not_found: {
    label: "OTURUM DÜŞTÜ",
    title: "Giriş adımı zaman aşımına uğradı.",
    detail: "Baştan başlamak için butona yeniden basın; bu genellikle sekme uzun süre açık kaldığında olur.",
  },
  /* DELIBERATELY ABSENT — `user_banned`, `identity_already_exists`,
     `email_exists`, `provider_email_needs_verification`. Each asserted a fact
     about the READER's account on the strength of a fragment this site cannot
     verify:

       user_banned                        "HESAP KAPALI" + go and contact us
       identity_already_exists            "bu e-posta zaten kayıtlı"
       email_exists                       the same sentence
       provider_email_needs_verification  "adresiniz doğrulanmamış"

     The middle two additionally contradict a policy this page already states
     and keeps: `Login.tsx` holds the sign-in failure generic so the site never
     reveals which addresses have accounts — and these said it from a URL.

     They now reach `FALLBACK`, which describes the attempt and asks for the
     code. A genuine `user_banned` is still fully diagnosable: `KOD:
     user_banned` is rendered underneath, so support gets the same information
     the reader was previously told as if it were established fact. */
}));

const FALLBACK = {
  label: "GİRİŞ TAMAMLANAMADI",
  title: "Sağlayıcı ile giriş tamamlanamadı.",
  detail: "E-posta ve şifrenizle aşağıdan giriş yapabilirsiniz. Sorun sürerse aşağıdaki kodu bize iletin.",
};

/* THE SHAPE GOTRUE ACTUALLY EMITS. Every identifier the SDK and the auth
   server produce is lowercase `snake_case` with at most four segments — the
   longest in the whole vocabulary is `provider_email_needs_verification`, 33
   characters and four segments. So the reference is TESTED against that shape
   instead of being stripped into a looser one: a value that is not an
   identifier is not a reference, and renders as nothing.

   The predecessor stripped to `[a-z0-9_-]{0,48}`, which admitted hyphens and
   therefore admitted `sifrenizi-yeniden-girin`. See the note at the top of
   this file for what this does and does not guarantee — it is a lexical
   filter and it is described as one. */
const REFERENCE_SHAPE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+){0,4}$/;
const REFERENCE_MAX = 40;

/** A server-supplied token, or `null` when it is not shaped like a reference. */
function sanitiseReference(value: string | null): string | null {
  if (!value) return null;
  const cleaned = value.trim().toLowerCase();
  if (cleaned.length > REFERENCE_MAX || !REFERENCE_SHAPE.test(cleaned)) return null;
  return cleaned;
}

/** Query first, then fragment — the SDK's own precedence. */
function paramsOf(href: string): URLSearchParams | null {
  let url: URL;
  try { url = new URL(href); } catch { return null; }
  const merged = new URLSearchParams();
  if (url.hash.startsWith("#")) {
    try {
      new URLSearchParams(url.hash.slice(1)).forEach((v, k) => merged.set(k, v));
    } catch {
      /* A hash that is not a query string is a normal fragment, not an error. */
    }
  }
  url.searchParams.forEach((v, k) => merged.set(k, v));
  return merged;
}

function describe(params: URLSearchParams) {
  const error = params.get("error");
  const code = params.get("error_code");
  const description = params.get("error_description");
  if (!error && !code && !description) return null;
  /* `error_code` is the specific one; `error` is the OAuth-level bucket
     (`access_denied`, `server_error`). Prefer the specific, fall back to the
     bucket, then to this file's own generic copy. `Map.get` returns
     `undefined` for `constructor`, `__proto__` and every other inherited name
     — which is the whole point of it being a `Map`. */
  const copy = (code ? COPY.get(code) : undefined)
    ?? (error ? COPY.get(error) : undefined)
    ?? FALLBACK;
  return { copy, reference: sanitiseReference(code) ?? sanitiseReference(error) };
}

/** The provider this tab handed off to, if it did so recently. Never throws. */
function readHandoff(): OAuthProvider | null {
  try {
    const raw = window.sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { provider?: string; at?: number };
    if (typeof parsed.at !== "number" || Date.now() - parsed.at > HANDOFF_TTL_MS) return null;
    return parsed.provider === "google" || parsed.provider === "linkedin_oidc" ? parsed.provider : null;
  } catch {
    return null;
  }
}

/** Record the handoff so the return leg can name the button that started it. */
export function markOAuthHandoff(provider: OAuthProvider): void {
  try {
    window.sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ provider, at: Date.now() }));
  } catch {
    /* Private mode, storage disabled, quota. The notice loses the provider's
       name and keeps everything else; it is not worth failing a sign-in over. */
  }
}

export function clearOAuthHandoff(): void {
  try { window.sessionStorage.removeItem(HANDOFF_KEY); } catch { /* see above */ }
}

/** Strip the parameters from the live URL so a reload does not repeat the message. */
function clearErrorParams(): void {
  try {
    const url = new URL(window.location.href);
    let touched = false;
    for (const key of ["error", "error_code", "error_description"]) {
      if (url.searchParams.has(key)) { url.searchParams.delete(key); touched = true; }
    }
    if (url.hash.startsWith("#")) {
      const hash = new URLSearchParams(url.hash.slice(1));
      if (hash.has("error") || hash.has("error_code") || hash.has("error_description")) {
        for (const key of ["error", "error_code", "error_description"]) hash.delete(key);
        const rest = hash.toString();
        url.hash = rest ? `#${rest}` : "";
        touched = true;
      }
    }
    if (touched) window.history.replaceState(window.history.state, "", url.toString());
  } catch {
    /* Nothing here is worth breaking a render for. */
  }
}

/**
 * Read the OAuth return leg once per document.
 *
 * Returns `null` when this document was not an OAuth return, which is the
 * overwhelmingly common case and must cost nothing.
 */
export function readOAuthReturn(): OAuthReturn | null {
  if (typeof window === "undefined" || consumed) return null;

  const live = paramsOf(window.location.href);
  const fromLive = live ? describe(live) : null;

  /* The URL this DOCUMENT was fetched with. It survives the protected-route
     bounce that erases `location.hash`; see the note at the top of the file. */
  const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  /* RULE 1. Only a document fetched with the OAuth redirect target has an
     entry record that can be a return leg; see the note beside
     `OAUTH_ENTRY_PATHS`. A document that entered at `/malzemeler` was read,
     not returned to. */
  const entered = entry?.name && isOAuthEntry(entry.name) ? paramsOf(entry.name) : null;
  const fromEntry = entered ? describe(entered) : null;

  const found = fromLive ?? fromEntry;
  if (!found) return null;

  consumed = true;
  const provider = readHandoff();
  clearOAuthHandoff();
  if (fromLive) clearErrorParams();

  /* THE AGE BOUND. Consumed, handed off and cleared ABOVE rather than below,
     deliberately: a return leg that is too old to report is still spent. The
     URL is cleaned, the handoff is released, and the latch is closed, so a
     suppressed notice cannot reappear on a later mount and cannot leave the
     parameters sitting in the address bar. `null` age means the clock is not
     available, and then the notice is reported: silence about a real failure
     is worse than a notice that might be a few seconds old. */
  const age = documentAgeMs();
  if (age !== null && age > RETURN_MAX_AGE_MS) return null;

  return {
    source: fromLive ? "location" : "document",
    label: found.copy.label,
    title: found.copy.title,
    detail: found.copy.detail,
    reference: found.reference,
    provider,
  };
}

/** Test seam: the module-level latch is per document, and a test is one document. */
export function resetOAuthReturnLatchForTest(): void {
  consumed = false;
}

export const PROVIDER_LABEL: Record<OAuthProvider, string> = {
  google: "Google",
  linkedin_oidc: "LinkedIn",
};
