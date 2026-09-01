import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Lock, Eye, EyeOff, CheckCircle, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/shell/PageShell";
import { LoginLeftPanel } from "@/components/auth/LoginLeftPanel";

export const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }
    if (password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error("Şifre güncellenemedi: " + error.message);
    } else {
      setSuccess(true);
      toast.success("Şifreniz başarıyla güncellendi!");
      setTimeout(() => navigate("/giris"), 3000);
    }
    setLoading(false);
  };

  return (
    /* Shell only (Phase 04) — see `Login.tsx`. Body untouched. */
    <PageShell navigation={false} footer={false} layout="bands" className="shell-auth">
      <div className="min-h-screen w-full flex">
      <LoginLeftPanel isLogin={true} />

      <div className="w-full lg:w-[55%] flex items-center justify-center bg-background px-6 py-12">
        <motion.div
          className="w-full max-w-[420px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Link
            to="/giris"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ChevronLeft size={14} />
            Giriş Sayfası
          </Link>

          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle size={48} className="mx-auto text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Şifre Güncellendi</h1>
              <p className="text-sm text-muted-foreground">
                Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Lock size={24} className="text-primary" />
                </div>
                <h1 className="text-[26px] font-bold tracking-tight mb-2">Yeni Şifre Belirleyin</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Hesabınız için yeni bir şifre oluşturun. En az 6 karakter olmalıdır.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Yeni Şifre
                  </label>
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

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Şifre Tekrar
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-11"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 font-semibold uppercase tracking-wider text-sm text-[var(--text-primary)]">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Şifreyi Güncelle"}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
      </div>
    </PageShell>
  );
};
