import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

export const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      setLoading(false);
      return;
    }

    toast.success("Giriş başarılı!");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md p-8 rounded-lg border border-[rgb(var(--text-primary-rgb)/0.1)] bg-slate-900/80 backdrop-blur">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Yönetim Paneli</h1>
          <p className="text-sm text-[rgb(var(--text-primary-rgb)/0.5)] mt-1">Devam etmek için giriş yapın</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-[rgb(var(--text-primary-rgb)/0.7)] mb-1">E-posta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded bg-slate-800 border border-[rgb(var(--text-primary-rgb)/0.1)] text-[var(--text-primary)] placeholder:text-[rgb(var(--text-primary-rgb)/0.3)] focus:outline-none focus:border-primary"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-[rgb(var(--text-primary-rgb)/0.7)] mb-1">Şifre</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded bg-slate-800 border border-[rgb(var(--text-primary-rgb)/0.1)] text-[var(--text-primary)] placeholder:text-[rgb(var(--text-primary-rgb)/0.3)] focus:outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
};
