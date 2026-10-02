import { useTranslation } from "react-i18next";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShellAction, ShellNotice } from "@/components/shell";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import {
  authFieldId,
  collectAuthErrors,
  firstInvalidField,
  forgotSchema,
  type AuthFieldErrors,
} from "@/components/auth/auth-schema";

/* ══════════════════════════════════════════════════════════════════════════
   /sifremi-unuttum — ASK FOR A RESET LINK

   Served by THIS file. There is no `SifremiUnuttum.tsx`; `src/App.tsx:211`
   maps the route to `ForgotPassword`, and every earlier list in this phase
   named a file that does not exist.

   Measured at 94 legacy-teal nodes inside `<main>` and 0 shell primitives
   before this change (`reports/09b1/design-membership-before.json`).

   ── THE SENT STATE SAYS WHAT WAS DONE, NOT WHAT WILL ARRIVE ──────────────
   It used to read "…adresine şifre sıfırlama bağlantısı GÖNDERDİK." A 200
   from `resetPasswordForEmail` means the request was accepted, not that a
   message was delivered — and Supabase deliberately answers the same way for
   an address that has no account, precisely so that this page cannot be used
   to find out which addresses do. Claiming delivery would therefore be wrong
   in the one case the API is designed around. The copy states the request and
   what to do if nothing turns up.

   ── AND THE FAILURE IS NOW READABLE ──────────────────────────────────────
   `toast.error("Bir hata oluştu: " + error.message)` put a raw English SDK
   string in a message that floats away. It is a `ShellNotice tone="error"`
   now, in the flow, next to the control, and it stays.
   ══════════════════════════════════════════════════════════════════════════ */

export const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [notice, setNotice] = useState<{ title: string; detail?: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [requestedFor, setRequestedFor] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);

    const parsed = forgotSchema.safeParse({ email });
    if (!parsed.success) {
      const fieldErrors = collectAuthErrors(parsed.error.issues);
      setErrors(fieldErrors);
      const first = firstInvalidField(fieldErrors);
      if (first) document.getElementById(authFieldId(first))?.focus();
      return;
    }
    setErrors({});
    setPending(true);

    const address = email.trim();
    const { error } = await supabase.auth.resetPasswordForEmail(address, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setPending(false);

    if (error) {
      setNotice({
        title: "Sıfırlama isteği gönderilemedi.",
        detail: "Bağlantınızı kontrol edip yeniden deneyin. Sorun sürerse bizimle iletişime geçin.",
      });
      return;
    }
    setRequestedFor(address);
  };

  if (requestedFor) {
    return (
      <AuthLayout
        asideTitle="Hoş Geldiniz"
        asideLede="MAS TECHNIC müşteri portalı ile teklif, sipariş ve üretim kayıtlarınızı tek yerden izleyin."
        back={{ to: "/giris", label: "Giriş sayfası" }}
      >
        <div>
          <p className="shell-eyebrow" role="status">{t("İSTEK ALINDI")}</p>
          <h1 className="shell-auth-title">{t("Şifremi Unuttum")}</h1>
        </div>
        <ShellNotice tone="note" label="SIRADA NE VAR">
          <p>
            {t("{{email}} için sıfırlama isteği alındı. Bu adrese bağlı bir hesap varsa şifre sıfırlama bağlantısı o adrese gider.", { email: requestedFor })}
          </p>
          <p>
            {t("Birkaç dakika içinde bir şey gelmezse spam klasörünü kontrol edin ve adresi doğru yazdığınızdan emin olarak yeniden deneyin.")}
          </p>
        </ShellNotice>
        <ShellAction variant="ghost" full onClick={() => setRequestedFor(null)}>
          {t("Başka bir adres dene")}
        </ShellAction>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      asideTitle="Hoş Geldiniz"
      asideLede="MAS TECHNIC müşteri portalı ile teklif, sipariş ve üretim kayıtlarınızı tek yerden izleyin."
      back={{ to: "/giris", label: "Giriş sayfası" }}
    >
      <div>
        {/* Measured contract: `e2e/qa-p08-scroll-region-reach.spec.ts:205`. */}
        <h1 className="shell-auth-title">{t("Şifremi Unuttum")}</h1>
        <p className="shell-auth-lede">
          {t("Hesabınızın e-posta adresini girin, şifre sıfırlama bağlantısını oraya gönderelim.")}
        </p>
      </div>

      <form className="shell-auth-form" onSubmit={handleSubmit} noValidate>
        <AuthField
          name="email"
          label="E-posta"
          errors={errors}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors({});
          }}
          placeholder="ornek@firma.com"
          maxLength={255}
        />

        {notice && (
          <ShellNotice tone="error" label="GÖNDERİLEMEDİ" title={notice.title}>
            {notice.detail && <p>{t(notice.detail)}</p>}
          </ShellNotice>
        )}

        <ShellAction type="submit" variant="primary" full disabled={pending}>
          {t("Sıfırlama bağlantısı iste")}
        </ShellAction>

        {pending && (
          <p className="shell-field-hint" role="status" data-auth-state="pending">
            {t("İSTEK GÖNDERİLİYOR…")}
          </p>
        )}
      </form>
    </AuthLayout>
  );
};
