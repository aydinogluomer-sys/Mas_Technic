import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AtSign,
  User,
  Building2,
  Phone,
  MapPin,
  ChevronLeft,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/shell/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { PageShell } from "@/components/shell/PageShell";
import { LoginLeftPanel } from "@/components/auth/LoginLeftPanel";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { AuthSeparator } from "@/components/auth/AuthSeparator";
import { FormField } from "@/components/auth/FormField";

const HCAPTCHA_SITE_KEY = "95ae4f14-f512-4a34-ad44-8e04ce323240";

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      toast.error("Lütfen CAPTCHA doğrulamasını tamamlayın.");
      return;
    }
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken },
      });
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
      if (error) {
        toast.error("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
        setLoading(false);
        return;
      }
      toast.success("Giriş başarılı!");
      navigate("/musteri-paneli");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          captchaToken,
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName },
        },
      });
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName,
          company,
          phone,
          city,
        });
      }
      toast.success("Kayıt başarılı! E-posta adresinizi doğrulayın.");
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider: "google" | "linkedin_oidc") => {
    setSocialLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/musteri-paneli` },
    });
    if (error) toast.error("Giriş başarısız: " + error.message);
    setSocialLoading(null);
  };

  return (
    /* Shell only (Phase 04). The auth family renders inside the SAME shell as
       every other public route — root, sheet, tokens, focus ring and
       `<main id="main-content">`, which this page did not have, so the global
       skip link had no target here — but with `navigation={false}` and
       `footer={false}`: a credential step must not offer a menu and a run of
       exits mid-task, and the header/footer counts for `/giris`,
       `/sifremi-unuttum` and `/reset-password` are contracts in
       `e2e/shared-shell-accessibility.spec.ts`. The panel layout below is
       untouched. */
    <PageShell navigation={false} footer={false} layout="bands" className="shell-auth">
      <div className="min-h-screen w-full flex">
      <LoginLeftPanel isLogin={isLogin} />

      <div className="w-full lg:w-[55%] flex items-center justify-center bg-background px-6 py-12">
        <motion.div
          className="w-full max-w-[420px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ChevronLeft size={14} />
            Ana Sayfa
          </Link>

          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">MT</span>
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight">MAS TECHNIC</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Müşteri Portalı</div>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-[26px] font-bold tracking-tight mb-2">
              {isLogin ? "Giriş Yapın" : "Hesap Oluşturun"}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isLogin
                ? "Hesabınıza giriş yaparak projelerinizi takip edin."
                : "Bilgilerinizi doldurarak müşteri portalına erişim sağlayın."}
            </p>
          </div>

          <SocialButtons socialLoading={socialLoading} onSocial={handleSocialLogin} />
          <AuthSeparator />

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? "login" : "signup"}
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
              transition={{ duration: 0.25 }}
            >
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Ad Soyad" icon={User} required>
                      <Input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 h-11" placeholder="Ahmet Yılmaz" maxLength={100} />
                    </FormField>
                    <FormField label="Firma" icon={Building2}>
                      <Input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="pl-10 h-11" placeholder="Firma Adı" maxLength={100} />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Telefon" icon={Phone}>
                      <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10 h-11" placeholder="05XX XXX XX XX" maxLength={20} />
                    </FormField>
                    <FormField label="Şehir" icon={MapPin}>
                      <Input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="pl-10 h-11" placeholder="İstanbul" maxLength={50} />
                    </FormField>
                  </div>
                </>
              )}

              <FormField label="E-posta" icon={AtSign} required>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11" placeholder="ornek@firma.com" />
              </FormField>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Şifre</label>
                  {isLogin && (
                    <Link to="/sifremi-unuttum" className="text-xs text-primary hover:underline">Şifremi Unuttum</Link>
                  )}
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 h-11"
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={HCAPTCHA_SITE_KEY}
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                />
              </div>

              <Button type="submit" disabled={loading || !captchaToken} className="w-full h-12 font-semibold tracking-wider text-sm text-[var(--text-primary)]">
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Giriş Yap" : "Hesap Oluştur"}
                    <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </Button>
            </motion.form>
          </AnimatePresence>

          <div className="text-center mt-6">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {isLogin ? (
                <>Hesabınız yok mu? <span className="font-semibold text-primary">Kayıt Olun</span></>
              ) : (
                <>Zaten hesabınız var mı? <span className="font-semibold text-primary">Giriş Yapın</span></>
              )}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground/50 text-center mt-6 leading-relaxed">
            Devam ederek{" "}
            <Link to="/gizlilik-politikasi" className="underline hover:text-primary">Gizlilik Politikası</Link>
            {"'nı ve "}
            <Link to="/kvkk" className="underline hover:text-primary">KVKK Aydınlatma Metni</Link>
            {"'ni kabul etmiş olursunuz."}
          </p>
        </motion.div>
      </div>
      </div>
    </PageShell>
  );
};
