import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, AtSign, ChevronLeft, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginLeftPanel } from "@/components/auth/LoginLeftPanel";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error("Bir hata oluştu: " + error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
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

          {sent ? (
            <div className="text-center space-y-4">
              <Mail size={48} className="mx-auto text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">E-posta Gönderildi</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik. Lütfen gelen kutunuzu kontrol edin.
              </p>
              <Link to="/giris" className="inline-block text-sm text-primary font-semibold hover:underline mt-4">
                Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Mail size={24} className="text-primary" />
                </div>
                <h1 className="text-[26px] font-bold tracking-tight mb-2">Şifremi Unuttum</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    E-posta
                  </label>
                  <div className="relative">
                    <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                      placeholder="ornek@firma.com"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 font-semibold tracking-wider text-sm text-[var(--text-primary)]">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Sıfırlama Bağlantısını Gönder"}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};
