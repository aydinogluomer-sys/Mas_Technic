import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShellAction, ShellNotice } from "@/components/shell";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthPasswordField } from "@/components/auth/AuthField";
import {
  MIN_PASSWORD_LENGTH,
  authFieldId,
  collectAuthErrors,
  firstInvalidField,
  resetSchema,
  type AuthFieldErrors,
} from "@/components/auth/auth-schema";

/* ══════════════════════════════════════════════════════════════════════════
   /reset-password — SET A NEW PASSWORD

   Measured at 94 legacy-teal nodes inside `<main>` and 0 shell primitives
   before this change (`reports/09b1/design-membership-before.json`).

   ── THE PAGE NOW SAYS WHETHER IT CAN DO ANYTHING ─────────────────────────
   `isRecovery` existed before and was never read: the component set it and no
   branch used it. So a reader who opened `/reset-password` directly — with no
   recovery link, which is how every visitor who guesses the URL and every
   crawler arrives — got a full, enabled, plausible form that could not
   possibly work, and found out only after typing a password twice and
   pressing the button, at which point a toast told them
   "Auth session missing!" in English and then left.

   The context is now determined BEFORE the reader types anything, and
   entirely in the browser:

     ready    the SDK reported PASSWORD_RECOVERY, or handed us a session. Both
              mean `updateUser` has something to work with — the second covers
              a reader who is already signed in and is changing their password.
     expired  the URL carries an `error` / `error_code` fragment. That is what
              the auth server itself appends when a link has been used or has
              timed out, so the message below is the server's own verdict,
              not a guess.
     absent   no session, no recovery event, no auth parameters in the URL.
              There is nothing to reset and the form is not offered.
     checking the URL carries auth parameters and the SDK has not finished
              with them yet.

   NONE OF THIS COSTS A REQUEST. `onAuthStateChange` reads local storage;
   with no stored session it emits `INITIAL_SESSION` with `null` and contacts
   nothing — measured in `reports/09b1/third-party-before.json`, where this
   route reaches no Supabase host at all on load.

   ── THE FORM IS STILL RENDERED WHILE CHECKING ────────────────────────────
   `checking` shows the form, not a spinner over it: the SDK settles in a few
   milliseconds and swapping a form in and out under a reader who has started
   typing is worse than a brief moment of optimism. `absent` and `expired` are
   settled answers and those two replace it.
   ══════════════════════════════════════════════════════════════════════════ */

type Access = "checking" | "ready" | "expired" | "absent";

/**
 * Does the URL carry anything the auth SDK will act on?
 *
 * Implicit links land as `#access_token=…&type=recovery`, PKCE links as
 * `?code=…`, and a link the server has already rejected as
 * `#error=…&error_code=…`. Read once, synchronously, before the first paint.
 */
function readUrlAuthParams() {
  if (typeof window === "undefined") return { hasToken: false, error: null as string | null };
  const raw = `${window.location.hash.replace(/^#/, "")}&${window.location.search.replace(/^\?/, "")}`;
  const params = new URLSearchParams(raw);
  const error = params.get("error_description") ?? params.get("error_code") ?? params.get("error");
  const hasToken = ["access_token", "code", "token_hash", "refresh_token"].some((key) => params.has(key));
  return { hasToken, error };
}

export const ResetPassword = () => {
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [notice, setNotice] = useState<{ title: string; detail?: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [urlState] = useState(readUrlAuthParams);
  const [access, setAccess] = useState<Access>(() =>
    urlState.error ? "expired" : "checking",
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (urlState.error) return;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setAccess("ready");
        return;
      }
      if (event === "INITIAL_SESSION" && !urlState.hasToken) setAccess("absent");
    });
    return () => data.subscription.unsubscribe();
  }, [urlState.error, urlState.hasToken]);

  const set = (field: "password" | "confirmPassword") => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);

    const parsed = resetSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = collectAuthErrors(parsed.error.issues);
      setErrors(fieldErrors);
      const first = firstInvalidField(fieldErrors);
      if (first) document.getElementById(authFieldId(first))?.focus();
      return;
    }
    setErrors({});
    setPending(true);

    const { error } = await supabase.auth.updateUser({ password: values.password });
    setPending(false);

    if (error) {
      setNotice({
        title: "Şifre güncellenemedi.",
        detail:
          "Sıfırlama bağlantısı geçerliliğini yitirmiş olabilir. Yeni bir bağlantı isteyip yeniden deneyin.",
      });
      return;
    }
    setDone(true);
    /* The redirect is announced above before it happens, so nobody loses the
       page under them without warning. */
    window.setTimeout(() => navigate("/giris"), 4000);
  };

  const frame = (children: React.ReactNode) => (
    <AuthLayout
      asideTitle="Hoş Geldiniz"
      asideLede="MAS TECHNIC müşteri portalı ile teklif, sipariş ve üretim kayıtlarınızı tek yerden izleyin."
      back={{ to: "/giris", label: "Giriş sayfası" }}
    >
      <div>
        {/* Measured contract: `e2e/qa-p08-scroll-region-reach.spec.ts:206`.
            It is the page's heading in EVERY state, because it is what the
            page is about whether or not this particular visit can act. */}
        <h1 className="shell-auth-title">Yeni Şifre Belirleyin</h1>
      </div>
      {children}
    </AuthLayout>
  );

  if (done) {
    return frame(
      <>
        <ShellNotice tone="note" label="TAMAMLANDI" title="Şifreniz güncellendi.">
          <p>Birkaç saniye içinde giriş sayfasına yönlendirileceksiniz.</p>
        </ShellNotice>
        <ShellAction to="/giris" variant="ghost" full>
          Giriş sayfasına git
        </ShellAction>
      </>,
    );
  }

  if (access === "expired") {
    return frame(
      <>
        <ShellNotice
          tone="error"
          label="BAĞLANTI GEÇERSİZ"
          title="Bu sıfırlama bağlantısı artık kullanılamıyor."
        >
          <p>
            Bağlantılar tek kullanımlıktır ve bir süre sonra geçerliliğini yitirir. Yeni bir
            bağlantı isteyip yeniden deneyin.
          </p>
          {urlState.error && <p className="shell-state-reason">{urlState.error}</p>}
        </ShellNotice>
        <ShellAction to="/sifremi-unuttum" variant="primary" full>
          Yeni bağlantı iste
        </ShellAction>
      </>,
    );
  }

  if (access === "absent") {
    return frame(
      <>
        <ShellNotice
          tone="caution"
          label="BAĞLANTI GEREKLİ"
          title="Bu sayfa şifre sıfırlama e-postasındaki bağlantıyla açılır."
        >
          <p>
            Adrese doğrudan geldiyseniz sıfırlanacak bir şey yok. E-posta adresinizi girip yeni bir
            bağlantı isteyin; bağlantıya tıkladığınızda bu sayfa yeni şifrenizi soracak.
          </p>
        </ShellNotice>
        <ShellAction to="/sifremi-unuttum" variant="primary" full>
          Sıfırlama bağlantısı iste
        </ShellAction>
      </>,
    );
  }

  return frame(
    <>
      <p className="shell-auth-lede">
        Hesabınız için yeni bir şifre belirleyin. Bu form en az {MIN_PASSWORD_LENGTH} karakter
        istiyor.
      </p>

      <form className="shell-auth-form" onSubmit={handleSubmit} noValidate>
        <AuthPasswordField
          name="password"
          label="Yeni şifre"
          errors={errors}
          autoComplete="new-password"
          value={values.password}
          onChange={set("password")}
          placeholder="••••••••"
        />
        <AuthPasswordField
          name="confirmPassword"
          label="Yeni şifre (tekrar)"
          errors={errors}
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={set("confirmPassword")}
          placeholder="••••••••"
        />

        {notice && (
          <ShellNotice tone="error" label="GÜNCELLENEMEDİ" title={notice.title}>
            {notice.detail && <p>{notice.detail}</p>}
          </ShellNotice>
        )}

        <ShellAction type="submit" variant="primary" full disabled={pending}>
          Şifreyi güncelle
        </ShellAction>

        {pending && (
          <p className="shell-field-hint" role="status" data-auth-state="pending">
            ŞİFRE GÜNCELLENİYOR…
          </p>
        )}
      </form>
    </>,
  );
};
