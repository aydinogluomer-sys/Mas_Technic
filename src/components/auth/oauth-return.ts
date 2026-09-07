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
   a sentence. So the server's prose is never rendered. The reader gets THIS
   file's copy, chosen from a whitelist of error identifiers; the raw code is
   shown only after being reduced to `[a-z0-9_-]` and 48 characters, which is
   a support reference and cannot hold an instruction.
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

/* One document, one report. The parameters that survive in
   `PerformanceNavigationTiming.name` are immutable for the life of the
   document, so without this a reader who signs in with e-mail, uses the
   panel and signs out again — all inside the same document — would be shown
   the old OAuth failure a second time on their way past this route. */
let consumed = false;

/** The copy, keyed by GoTrue's own error identifiers. */
const COPY: Record<string, { label: string; title: string; detail: string }> = {
  access_denied: {
    label: "İZİN VERİLMEDİ",
    title: "Giriş izni verilmediği için işlem tamamlanmadı.",
    detail: "Sağlayıcı ekranında izni onaylamadınız. Yeniden deneyebilir veya e-posta ve şifrenizle giriş yapabilirsiniz.",
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
  provider_email_needs_verification: {
    label: "E-POSTA DOĞRULANMAMIŞ",
    title: "Sağlayıcıdaki e-posta adresiniz doğrulanmamış.",
    detail: "Sağlayıcı hesabınızdaki e-posta adresini doğruladıktan sonra yeniden deneyin.",
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
  user_banned: {
    label: "HESAP KAPALI",
    title: "Bu hesap ile giriş yapılamıyor.",
    detail: "Hesabınızın durumunu öğrenmek için bizimle iletişime geçin.",
  },
  identity_already_exists: {
    label: "HESAP ZATEN VAR",
    title: "Bu e-posta adresi başka bir yöntemle kayıtlı.",
    detail: "Aynı adresle e-posta ve şifrenizi kullanarak giriş yapın.",
  },
  email_exists: {
    label: "HESAP ZATEN VAR",
    title: "Bu e-posta adresi başka bir yöntemle kayıtlı.",
    detail: "Aynı adresle e-posta ve şifrenizi kullanarak giriş yapın.",
  },
};

const FALLBACK = {
  label: "GİRİŞ TAMAMLANAMADI",
  title: "Sağlayıcı ile giriş tamamlanamadı.",
  detail: "E-posta ve şifrenizle aşağıdan giriş yapabilirsiniz. Sorun sürerse aşağıdaki kodu bize iletin.",
};

/** Reduce a server-supplied token to something that can only be a reference. */
function sanitiseReference(value: string | null): string | null {
  if (!value) return null;
  const cleaned = value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 48);
  return cleaned.length ? cleaned : null;
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
     bucket, then to this file's own generic copy. */
  const copy = (code && COPY[code]) || (error && COPY[error]) || FALLBACK;
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
  const entered = entry?.name ? paramsOf(entry.name) : null;
  const fromEntry = entered ? describe(entered) : null;

  const found = fromLive ?? fromEntry;
  if (!found) return null;

  consumed = true;
  const provider = readHandoff();
  clearOAuthHandoff();
  if (fromLive) clearErrorParams();

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
