import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@/i18n/LocaleLink";
import { useLocaleNavigate as useNavigate } from "@/i18n/hooks";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { supabase } from "@/integrations/supabase/client";
import { ShellAction, ShellNotice } from "@/components/shell";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField, AuthPasswordField } from "@/components/auth/AuthField";
import { AuthSeparator } from "@/components/auth/AuthSeparator";
import { SocialButtons } from "@/components/auth/SocialButtons";
import {
  markOAuthHandoff,
  PROVIDER_LABEL,
  readOAuthReturn,
  type OAuthProvider,
} from "@/components/auth/oauth-return";
import {
  authFieldId,
  collectAuthErrors,
  firstInvalidField,
  loginSchema,
  signupSchema,
  type AuthFieldErrors,
} from "@/components/auth/auth-schema";

/* ══════════════════════════════════════════════════════════════════════════
   /giris — SIGN IN AND SIGN UP

   PHASE 04 mounted `PageShell` here and left the body alone. PHASE 08 measured
   this route as one of the last three public surfaces still in the
   pre-overhaul language; re-measured with this phase's own instrument
   (`reports/09b1/design-membership-before.json`) it carried 93 legacy-teal
   `rgb(10,125,138)` nodes inside `<main>` and not one shell primitive. This is
   that phase.

   ── THE SECURITY BADGE ───────────────────────────────────────────────────
   Removed. `AuthAside.tsx` carries the three reasons and the decision not to
   replace it with anything.

   ── EVERY FAILURE IS NOW A NOTICE, NOT A TOAST ───────────────────────────
   `sonner` was the only feedback channel this page had: a captcha that had
   not been solved, a rejected credential and a rejected sign-up all became a
   floating message that named one problem and then left. A message that
   leaves cannot be re-read, is not next to the control it is about, and is
   gone by the time a screen-reader user reaches it. Everything is
   `ShellNotice`/`.shell-form-error` now — the site's one inline message block,
   already built in Phase 08 and measured by QA at 7.33:1 on graphite. No
   fourth error idiom was introduced.

   ── THE SUBMIT BUTTON IS NO LONGER DISABLED ON A MISSING CAPTCHA ─────────
   It used to be `disabled={loading || !captchaToken}`, with the explanation
   sitting in a `toast.error` behind a click that could not happen. A control
   disabled for a reason the reader is never told is a dead end: nothing says
   what is missing, nothing takes focus, and on a page where the captcha
   widget can simply fail to load there is no way forward and no way to find
   out why. The button is live; pressing it with no token renders the reason.

   ── THE SOCIAL BUTTONS CAN NOW REPORT FAILURE ────────────────────────────
   They could not before, and not because of a missing branch: read from the
   installed SDK, `signInWithOAuth` makes no request and returns
   `error: null` on every path (`@supabase/auth-js` `GoTrueClient.js:1854`),
   so there is nothing to test on the outbound leg and an `if (error)` after
   it is unreachable code. The information exists only on the way back, and
   nothing here read it. `oauth-return.ts` now does — including through the
   protected-route bounce that erases `location.hash`, which is measured in
   `reports/09b1c1/` rather than reasoned about. The result lands in the same
   `ShellNotice` idiom as every other failure on this page.

   ── WHAT IS DELIBERATELY UNCHANGED ───────────────────────────────────────
   The sign-in failure message stays GENERIC. "E-posta veya şifre doğrulanamadı"
   does not say which, on purpose: a message that distinguishes them tells an
   attacker which addresses have accounts. The sign-up path still surfaces the
   server's own message, exactly as before — that is a pre-existing
   account-enumeration disclosure and changing it is a security decision, not
   a design one, so it is reported rather than quietly altered here.
   ══════════════════════════════════════════════════════════════════════════ */

const HCAPTCHA_SITE_KEY = "95ae4f14-f512-4a34-ad44-8e04ce323240";

type Mode = "login" | "signup";
type FormNotice = { label: string; title: string; detail?: string };
/** What a social sign-in can say about itself: the return leg, or a handoff that never left. */
type SocialNotice = {
  label: string;
  title: string;
  detail: string;
  reference: string | null;
  provider: OAuthProvider | null;
};

/* THE ONE FAILURE THE RETURN LEG CANNOT REPORT, because the reader never
   leaves to come back. `window.location.assign` is fire-and-forget: if the
   browser does not act on it the page simply stays, with both buttons stuck
   on "Yönlendiriliyor…" and nothing else happening ever. This is not a guess
   about why — it is the one thing that is certainly true fifteen seconds
   later, and it is cancelled by `pagehide`, so a reader whose redirect DID
   start never sees it. */
const REDIRECT_STALL_MS = 15_000;
const STALLED: SocialNotice = {
  label: "YÖNLENDİRME BAŞLAMADI",
  title: "Sağlayıcı sayfasına yönlendirme başlamadı.",
  detail:
    "Bağlantınız yavaş olabilir ya da tarayıcınız yönlendirmeyi engelliyor olabilir. Yeniden deneyebilir veya e-posta ve şifrenizle giriş yapabilirsiniz.",
  reference: null,
  provider: null,
};

const EMPTY = { email: "", password: "", fullName: "", company: "", phone: "", city: "" };

export const Login = () => {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<Mode>("login");
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [notice, setNotice] = useState<FormNotice | null>(null);
  const [confirmSentTo, setConfirmSentTo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [socialPending, setSocialPending] = useState<OAuthProvider | null>(null);
  const [socialNotice, setSocialNotice] = useState<SocialNotice | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);
  const stallTimer = useRef<number | null>(null);
  const navigate = useNavigate();

  const isLogin = mode === "login";

  /* READ THE RETURN LEG, ONCE, AFTER MOUNT.
     After mount and not during render for a reason the codebase already
     documents beside `.shell-form-error`: a `role="alert"` region that is
     already in the DOM at first paint is frequently not announced at all.
     Inserting it in an effect makes it an appearance, which is what gets
     read out. */
  useEffect(() => {
    const returned = readOAuthReturn();
    if (!returned) return;
    setSocialNotice({
      label: returned.label,
      title: returned.title,
      detail: returned.detail,
      reference: returned.reference,
      provider: returned.provider,
    });
  }, []);

  /* `pagehide` is the browser saying the redirect actually happened. Cancelling
     on it is what keeps the stall notice from being a lie on a slow link. */
  useEffect(() => {
    const cancel = () => {
      if (stallTimer.current !== null) {
        window.clearTimeout(stallTimer.current);
        stallTimer.current = null;
      }
    };
    window.addEventListener("pagehide", cancel);
    return () => {
      window.removeEventListener("pagehide", cancel);
      cancel();
    };
  }, []);

  const set = (field: keyof typeof EMPTY) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
    /* Clear the field's own message as soon as it is edited: a stale error
       under a control the reader has just fixed makes a valid form look
       broken. */
    setErrors((current) => {
      if (!current[field as keyof AuthFieldErrors]) return current;
      const next = { ...current };
      delete next[field as keyof AuthFieldErrors];
      return next;
    });
  };

  const switchMode = () => {
    setMode(isLogin ? "signup" : "login");
    setErrors({});
    setNotice(null);
    setConfirmSentTo(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);

    const parsed = (isLogin ? loginSchema : signupSchema).safeParse(values);
    if (!parsed.success) {
      const fieldErrors = collectAuthErrors(parsed.error.issues);
      setErrors(fieldErrors);
      const first = firstInvalidField(fieldErrors);
      if (first) document.getElementById(authFieldId(first))?.focus();
      return;
    }
    setErrors({});

    if (!captchaToken) {
      setNotice({
        label: "DOĞRULAMA EKSİK",
        title: "CAPTCHA doğrulaması tamamlanmadı.",
        detail:
          "Formun altındaki kutuyu işaretleyin. Kutu hiç görünmüyorsa tarayıcınız veya ağınız hCaptcha’yı engelliyor olabilir.",
      });
      return;
    }

    setPending(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
        options: { captchaToken },
      });
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
      setPending(false);
      if (error) {
        setNotice({
          label: "GİRİŞ YAPILAMADI",
          title: "E-posta veya şifre doğrulanamadı.",
          detail: "Bilgilerinizi kontrol edip yeniden deneyin. Şifrenizi hatırlamıyorsanız sıfırlayabilirsiniz.",
        });
        return;
      }
      navigate("/musteri-paneli");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        captchaToken,
        emailRedirectTo: window.location.origin,
        data: { full_name: values.fullName.trim() },
      },
    });
    setCaptchaToken(null);
    captchaRef.current?.resetCaptcha();

    if (error) {
      setPending(false);
      setNotice({ label: "KAYIT TAMAMLANAMADI", title: "Hesap oluşturulamadı.", detail: error.message });
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: values.fullName.trim(),
        company: values.company.trim(),
        phone: values.phone.trim(),
        city: values.city.trim(),
      });
    }
    setPending(false);

    /* WHAT THE COPY SAYS IS DERIVED FROM WHAT THE SERVER ANSWERED, not from an
       assumption about how the project is configured. A `signUp` that returns
       a user and NO session is a project with e-mail confirmation switched on:
       the account exists and the sign-in has not happened yet. One that
       returns a session has already signed the reader in, and telling them to
       go and check their inbox would be false. */
    if (data.session) {
      navigate("/musteri-paneli");
      return;
    }
    setConfirmSentTo(values.email.trim());
  };

  const handleSocial = async (provider: OAuthProvider) => {
    setSocialNotice(null);
    setSocialPending(provider);
    /* Written BEFORE the call, synchronously, because the call may never
       return control to this document. It is the only record of which button
       was pressed, and the return leg uses it to name the provider. */
    markOAuthHandoff(provider);
    /* This hands the browser to the auth server; it does not return here on
       success, and `error` is a literal null on every path — so there is
       still nothing to test HERE. What is asserted is only what can be
       observed from this document: whether it is still the document fifteen
       seconds from now. */
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/musteri-paneli` },
    });
    stallTimer.current = window.setTimeout(() => {
      stallTimer.current = null;
      setSocialPending(null);
      setSocialNotice(STALLED);
    }, REDIRECT_STALL_MS);
  };

  if (confirmSentTo) {
    return (
      <AuthLayout
        asideTitle="Aramıza Katılın"
        asideLede="MAS TECHNIC müşteri portalı ile teklif, sipariş ve üretim kayıtlarınızı tek yerden izleyin."
        back={{ to: "/", label: "Ana sayfa" }}
      >
        <div>
          <p className="shell-eyebrow" role="status">{t("HESAP OLUŞTURULDU")}</p>
          <h1 className="shell-auth-title">{t("Hesabınız Oluşturuldu")}</h1>
        </div>
        <ShellNotice tone="note" label="SIRADA NE VAR">
          <p>
            {t("{{email}} adresine bir doğrulama bağlantısı gönderildi. Girişi tamamlamak için o bağlantıyı açın.", { email: confirmSentTo })}
          </p>
        </ShellNotice>
        <ShellAction variant="ghost" full onClick={() => { setConfirmSentTo(null); setMode("login"); }}>
          {t("Giriş ekranına dön")}
        </ShellAction>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      asideTitle={isLogin ? "Hoş Geldiniz" : "Aramıza Katılın"}
      asideLede="MAS TECHNIC müşteri portalı ile teklif, sipariş ve üretim kayıtlarınızı tek yerden izleyin."
      back={{ to: "/", label: "Ana sayfa" }}
    >
      <div>
        {/* The heading string is a measured contract:
            `e2e/qa-p08-scroll-region-reach.spec.ts:204` reads it as this
            route's anti-404 surface. */}
        <h1 className="shell-auth-title">{t(isLogin ? "Giriş Yapın" : "Hesap Oluşturun")}</h1>
        <p className="shell-auth-lede">
          {t(isLogin
            ? "Hesabınıza giriş yaparak tekliflerinizi ve siparişlerinizi takip edin."
            : "Bilgilerinizi doldurarak müşteri portalına erişim sağlayın.")}
        </p>
      </div>

      {/* Above the buttons, not floating over the page and not at the bottom
          of the form: a message about a control belongs next to that control,
          and this is the first thing after the heading a returning reader
          meets. The server's own prose is never shown — `oauth-return.ts`
          carries the reason — so what is here is this site's copy plus a
          sanitised reference code. */}
      {socialNotice && (
        <ShellNotice tone="error" label={socialNotice.label} title={socialNotice.title}>
          {socialNotice.provider && (
            <p>
              {t("{{provider}} ile başlatılan giriş bu sayfaya geri döndü.", { provider: PROVIDER_LABEL[socialNotice.provider] })}
            </p>
          )}
          <p>{t(socialNotice.detail)}</p>
          {socialNotice.reference && (
            <p className="shell-field-hint">{t("KOD")}: {socialNotice.reference}</p>
          )}
        </ShellNotice>
      )}
      <SocialButtons pending={socialPending} onSocial={handleSocial} />
      <AuthSeparator />

      <form className="shell-auth-form" onSubmit={handleSubmit} noValidate>
        {!isLogin && (
          <>
            <div className="shell-form-row">
              <AuthField
                name="fullName"
                label="Ad soyad"
                errors={errors}
                type="text"
                autoComplete="name"
                value={values.fullName}
                onChange={set("fullName")}
                placeholder="Ahmet Yılmaz"
                maxLength={100}
              />
              <AuthField
                name="company"
                label="Firma"
                optional
                errors={errors}
                type="text"
                autoComplete="organization"
                value={values.company}
                onChange={set("company")}
                placeholder="Firma adı"
                maxLength={100}
              />
            </div>
            <div className="shell-form-row">
              <AuthField
                name="phone"
                label="Telefon"
                optional
                errors={errors}
                type="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={set("phone")}
                placeholder="05XX XXX XX XX"
                maxLength={20}
              />
              <AuthField
                name="city"
                label="Şehir"
                optional
                errors={errors}
                type="text"
                autoComplete="address-level2"
                value={values.city}
                onChange={set("city")}
                placeholder="İzmir"
                maxLength={50}
              />
            </div>
          </>
        )}

        <AuthField
          name="email"
          label="E-posta"
          errors={errors}
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={set("email")}
          placeholder="ornek@firma.com"
          maxLength={255}
        />

        <AuthPasswordField
          name="password"
          label="Şifre"
          errors={errors}
          autoComplete={isLogin ? "current-password" : "new-password"}
          value={values.password}
          onChange={set("password")}
          placeholder="••••••••"
          aside={
            isLogin ? (
              <Link className="shell-action shell-action--quiet" to="/sifremi-unuttum">
                <span>{t("Şifremi unuttum")}</span>
              </Link>
            ) : undefined
          }
        />

        <div className="shell-auth-captcha">
          <HCaptcha
            ref={captchaRef}
            sitekey={HCAPTCHA_SITE_KEY}
            theme="dark"
            languageOverride={i18n.language === "en" ? "en" : "tr"}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
          />
        </div>

        {notice && (
          <ShellNotice tone="error" label={notice.label} title={notice.title}>
            {notice.detail && <p>{t(notice.detail)}</p>}
          </ShellNotice>
        )}

        <ShellAction type="submit" variant="primary" full disabled={pending}>
          {t(isLogin ? "Giriş yap" : "Hesap oluştur")}
        </ShellAction>

        {pending && (
          <p className="shell-field-hint" role="status" data-auth-state="pending">
            {t(isLogin ? "GİRİŞ DOĞRULANIYOR…" : "HESAP OLUŞTURULUYOR…")}
          </p>
        )}
      </form>

      <div className="shell-auth-foot">
        <button type="button" className="shell-action shell-action--quiet" onClick={switchMode}>
          <span>{t(isLogin ? "Hesabınız yok mu? Kayıt olun" : "Zaten hesabınız var mı? Giriş yapın")}</span>
        </button>
        <p className="shell-auth-legal">
          {t("Devam ederek")}{" "}
          <Link to="/gizlilik-politikasi">{t("Gizlilik Politikası")}</Link>
          {t("’nı ve ")}
          <Link to="/kvkk">{t("KVKK Aydınlatma Metni")}</Link>
          {t("’ni kabul etmiş olursunuz.")}
        </p>
      </div>
    </AuthLayout>
  );
};
