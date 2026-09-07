import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { supabase } from "@/integrations/supabase/client";
import { ShellAction, ShellNotice } from "@/components/shell";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField, AuthPasswordField } from "@/components/auth/AuthField";
import { AuthSeparator } from "@/components/auth/AuthSeparator";
import { SocialButtons } from "@/components/auth/SocialButtons";
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

const EMPTY = { email: "", password: "", fullName: "", company: "", phone: "", city: "" };

export const Login = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [notice, setNotice] = useState<FormNotice | null>(null);
  const [confirmSentTo, setConfirmSentTo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [socialPending, setSocialPending] = useState<"google" | "linkedin_oidc" | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);
  const navigate = useNavigate();

  const isLogin = mode === "login";

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

  const handleSocial = async (provider: "google" | "linkedin_oidc") => {
    setSocialPending(provider);
    /* This hands the browser to the auth server; it does not return here on
       success, and `error` is a literal null on every path (see
       `SocialButtons.tsx`). Nothing is asserted about the outcome. */
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/musteri-paneli` },
    });
  };

  if (confirmSentTo) {
    return (
      <AuthLayout
        asideTitle="Aramıza Katılın"
        asideLede="MAS TECHNIC müşteri portalı ile teklif, sipariş ve üretim kayıtlarınızı tek yerden izleyin."
        back={{ to: "/", label: "Ana sayfa" }}
      >
        <div>
          <p className="shell-eyebrow" role="status">HESAP OLUŞTURULDU</p>
          <h1 className="shell-auth-title">Hesabınız Oluşturuldu</h1>
        </div>
        <ShellNotice tone="note" label="SIRADA NE VAR">
          <p>
            <strong>{confirmSentTo}</strong> adresine bir doğrulama bağlantısı gönderildi. Girişi
            tamamlamak için o bağlantıyı açın.
          </p>
        </ShellNotice>
        <ShellAction variant="ghost" full onClick={() => { setConfirmSentTo(null); setMode("login"); }}>
          Giriş ekranına dön
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
        <h1 className="shell-auth-title">{isLogin ? "Giriş Yapın" : "Hesap Oluşturun"}</h1>
        <p className="shell-auth-lede">
          {isLogin
            ? "Hesabınıza giriş yaparak tekliflerinizi ve siparişlerinizi takip edin."
            : "Bilgilerinizi doldurarak müşteri portalına erişim sağlayın."}
        </p>
      </div>

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
                <span>Şifremi unuttum</span>
              </Link>
            ) : undefined
          }
        />

        <div className="shell-auth-captcha">
          <HCaptcha
            ref={captchaRef}
            sitekey={HCAPTCHA_SITE_KEY}
            theme="dark"
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
          />
        </div>

        {notice && (
          <ShellNotice tone="error" label={notice.label} title={notice.title}>
            {notice.detail && <p>{notice.detail}</p>}
          </ShellNotice>
        )}

        <ShellAction type="submit" variant="primary" full disabled={pending}>
          {isLogin ? "Giriş yap" : "Hesap oluştur"}
        </ShellAction>

        {pending && (
          <p className="shell-field-hint" role="status" data-auth-state="pending">
            {isLogin ? "GİRİŞ DOĞRULANIYOR…" : "HESAP OLUŞTURULUYOR…"}
          </p>
        )}
      </form>

      <div className="shell-auth-foot">
        <button type="button" className="shell-action shell-action--quiet" onClick={switchMode}>
          <span>{isLogin ? "Hesabınız yok mu? Kayıt olun" : "Zaten hesabınız var mı? Giriş yapın"}</span>
        </button>
        <p className="shell-auth-legal">
          Devam ederek{" "}
          <Link to="/gizlilik-politikasi">Gizlilik Politikası</Link>
          {"’nı ve "}
          <Link to="/kvkk">KVKK Aydınlatma Metni</Link>
          {"’ni kabul etmiş olursunuz."}
        </p>
      </div>
    </AuthLayout>
  );
};
