# 09b-1 — THIRD PARTIES REACHABLE FROM THE THREE AUTH ROUTES

Written for **09b-2**, which owns the legal copy. Nothing here is legal copy.
Every line is a measurement or a reading of installed source, and each says
which.

Evidence in this directory:

| file | what it is |
| --- | --- |
| `third-party-before.json` | the two-pass network measurement, base commit |
| `third-party-after.json` | the same measurement after the migration |
| `third-party-after.txt` | its console record |

**Before and after agree.** The migration changed nothing a third party can
observe: the same hosts, the same single cookie with the same 29.9-minute
lifetime, the same storage keys, and hCaptcha still requested on page load
with no interaction. The one thing 09b-1 changed about hCaptcha is its
`theme` prop — `dark`, so the widget sits on the graphite ground rather than
punching a white box into it — and that moved no origin, no cookie and no key.

| `probe-third-party.mjs` | the probe that produced both |
| `probe-lib.mjs` | the abort guard and the canary that proves it |

**How it was measured, and why it is safe.** Two passes. Pass A aborts every
non-loopback request and answers *which origins the page asks for, with no
interaction at all* — zero bytes leave the machine. Pass B allows hCaptcha and
the two Google font hosts and nothing else — Supabase, Google's OAuth
endpoints and LinkedIn stay aborted — and answers *what hCaptcha loads and
stores*. Neither pass signs in, signs up, requests a reset or starts a
redirect. Both prove the guard with a live `fetch` to `canary.example.com`
that must fail before anything is measured.

---

## 1. hCaptcha

**It is real, it is functional, and it loads on page load.**
`src/pages/Login.tsx` mounts `@hcaptcha/react-hcaptcha` inside the form and
passes the token to Supabase. Nothing defers it to an interaction.

### Origins contacted — `/giris` only

| host | first request | measured in |
| --- | --- | --- |
| `js.hcaptcha.com` | ~645 ms after navigation, no interaction | pass A and B |
| `newassets.hcaptcha.com` | ~1290 ms | pass B |
| `<id>.w.hcaptcha.com` | ~1189 ms and ~2317 ms | pass B |
| `sentry.hcaptcha.com` | ~2730 ms | **pass A only** |

`<id>.w.hcaptcha.com` is an ephemeral per-worker hostname: it changes run to
run, and the number of them changed between Phase 08's measurement and this
one. Any disclosure keyed to a specific worker name will go stale; the
registrable domain `hcaptcha.com` is the honest thing to publish, which is
what `/cerez-politikasi` already does.

**`sentry.hcaptcha.com` is a fifth host and it is not on the published list.**
`src/pages/CerezPolitikasi.tsx:85` names `js.hcaptcha.com`,
`newassets.hcaptcha.com` and "two ephemeral `<id>.w.hcaptcha.com` workers". It
does not name Sentry. The host appears in pass A — where every request is
aborted, so the widget fails — and not in pass B, where it succeeds. That is
hCaptcha reporting its own failure to Sentry, which means it is reached under
exactly the conditions a real visitor meets: a flaky network, a content
blocker, a corporate proxy. Those are the conditions a cookie/telemetry
disclosure is most for.

The widget's own iframe URL also carries `reportapi=https://accounts.hcaptcha.com`,
`endpoint=https://api.hcaptcha.com` and `pstissuer=https://pst-issuer.hcaptcha.com`
in its `clientOptions`. Those are configured destinations; only Sentry was
observed being contacted. **09b-2 decides whether the disclosure names hosts
that are configured or hosts that were observed** — both are defensible, but
the document should say which rule it is following, because the two lists
differ.

### Cookies

One, on `/giris` only, set on page load with no interaction:

```
__cf_bm   domain .hcaptcha.com   path /   httpOnly   secure   SameSite=None
          lifetime 29.9 minutes
```

Identical to Phase 08's measurement. `/sifremi-unuttum` and `/reset-password`
set no cookie at all.

### Storage

**hCaptcha writes no `localStorage` and no `sessionStorage` key of its own.**
The only key present after a load of any of the three routes is
`mas-technic-theme`, and that one is ours.

### A finding about `mas-technic-theme` that is not about hCaptcha

`/cerez-politikasi`'s table (`STORAGE_ROWS`, `CerezPolitikasi.tsx:164-169`)
describes it as *"3B model görüntüleyicisinin açık/koyu paletini hatırlar"*.
It is written on all three auth routes, where there is no 3D viewer. The
writer is the **global `<Toaster>`**: `src/components/ui/sonner.tsx` calls
`useTheme()`, `use-theme.ts:28` writes the key in an effect, and the Toaster is
mounted for every route in `src/App.tsx`. The key is published, so the
storage gate is green; the *description* is narrower than the behaviour.

---

## 2. Google and LinkedIn OAuth — **NOT ESTABLISHED**, and here is exactly why

### What is known, read from the installed SDK

`src/pages/Login.tsx` calls `supabase.auth.signInWithOAuth`. In
`@supabase/auth-js`, `signInWithOAuth` → `_handleProviderSignIn`
(`dist/module/GoTrueClient.js:1854`):

```js
const url = await this._getUrlForProvider(`${this.url}/authorize`, provider, {...});
if (isBrowser() && !options.skipBrowserRedirect) {
    window.location.assign(url);
}
return { data: { provider, url }, error: null };
```

Two consequences, both certain from that source:

1. **The call makes no network request.** It builds
   `{SUPABASE_URL}/auth/v1/authorize?provider=<p>&redirect_to=<encoded>` as a
   string and hands the browser to it. Nothing here can learn whether the
   provider exists.
2. **`error` is a literal `null` on every path.** The `if (error) toast.error(…)`
   the page carried before this phase was unreachable code. **These buttons
   have no failure path at all**: if a provider is not enabled, the visitor is
   navigated away to the auth server's error page and this site never learns
   and never reports.

### What the repository says about enablement: nothing

`supabase/config.toml` contains a `project_id` and five `[functions.*]`
blocks. **There is no `[auth]` block and no `[auth.external.*]` block.** No
migration and no edge function mentions a provider. So the repository has no
opinion on whether `google` and `linkedin_oidc` are enabled, and a reader of
this checkout cannot form one.

### What would settle it, and why this phase did not do it

One unauthenticated read:

```
GET {SUPABASE_URL}/auth/v1/settings   (apikey: publishable key)
  → { "external": { "google": true|false, "linkedin_oidc": true|false, … } }
```

It writes nothing, sends no mail, creates no user and starts no redirect. It
is still **a network call to the Supabase project**, which this packet's
DO_NOT_TOUCH forbids outright ("`supabase/**` ← and no auth or network call to
it"). So it was not made, and the question is returned unanswered rather than
answered by a workaround.

**The buttons were not removed.** The packet says not to remove them on a
guess and it is right to: removing a working sign-in path is the more
destructive of the two errors, and nothing here distinguishes "disabled" from
"enabled".

**Two questions for whoever is allowed to ask the project**, because one
answer does not cover both:

1. Are `google` and `linkedin_oidc` enabled?
2. Is `{origin}/musteri-paneli` in the project's allowed redirect URL list?
   A provider can be enabled and the redirect still rejected, which fails in
   the same silent way for the same reason.

---

## 3. The full list of third parties reachable from these routes

| party | routes | when | what it is |
| --- | --- | --- | --- |
| **hCaptcha** (`hcaptcha.com` and subdomains) | `/giris` | page load, no interaction | bot check; one cookie; four hosts on success, a fifth on failure |
| **Google Fonts** (`fonts.googleapis.com`, `fonts.gstatic.com`) | all three | **first external request on every one**, 39–46 ms | web fonts |
| **Google** (OAuth) | `/giris` | only if the reader presses the button | full-page navigation to Supabase, then to Google |
| **LinkedIn** (OAuth) | `/giris` | only if the reader presses the button | same |
| **Supabase** | all three | **never at load**; only on submit or a social press | auth backend |

Two of these are worth 09b-2's attention because the packet's own enumeration
("hCaptcha, Google, LinkedIn, Supabase itself") does not separate them:

- **Google Fonts is a separate Google service from Google OAuth**, it is
  contacted on all three routes including the two with no captcha and no
  social buttons, and it is the *first* external request on every one of them.
  A visitor who never presses a button and never submits a form has still had
  their IP and user agent sent to Google.
- **Supabase is contacted on none of the three at load.**
  `/reset-password`'s `onAuthStateChange` reads local storage and, with no
  session stored, emits `INITIAL_SESSION` with `null` and contacts nothing.
  Both passes confirm it: zero Supabase hosts in the request record.

---

## 4. Two security observations that are not privacy copy

Recorded here because they were found while establishing the above, and
because both are decisions somebody has to make rather than things this packet
could fix.

- **The sign-up path surfaces the auth server's own message verbatim**
  (`Login.tsx`, `setNotice({… detail: error.message })`). "User already
  registered" tells an unauthenticated visitor that an address has an account.
  The sign-IN path is deliberately generic and always was. The behaviour is
  unchanged by this phase — changing it is a security decision, not a design
  one — and it is reported rather than quietly altered.
- **The form's password minimum is 6 and is not known to be the project's.**
  `src/components/auth/auth-schema.ts` keeps the 6 the old `minLength={6}`
  enforced, and its copy says what *the form* requires rather than asserting
  the account rule, because `supabase/config.toml` carries no `[auth]` block
  and the deployed value was not read. If the project's minimum is higher, the
  reader learns it from the server's own answer in the same branded notice.
