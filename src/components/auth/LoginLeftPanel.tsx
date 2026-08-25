import { CheckCircle, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingPaths } from "@/components/FloatingPaths";

const benefits = [
  "Teklif taleplerinizi anlık takip edin",
  "Sipariş durumunuzu görüntüleyin",
  "Geçmiş projelerinize erişin",
  "Mühendislerimizle doğrudan iletişim kurun",
];

export const LoginLeftPanel = ({ isLogin }: { isLogin: boolean }) => (
  <div className="hidden lg:flex lg:w-[45%] relative bg-industrial-dark overflow-hidden items-center justify-center">
    <FloatingPaths position={1} />
    <FloatingPaths position={-1} />
    <motion.div
      className="relative z-10 max-w-sm px-10 flex flex-col items-start"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-12">
        <div className="w-11 h-11 bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-base">MT</span>
        </div>
        <div>
          <div className="text-[var(--text-primary)] font-bold text-base tracking-tight">MAS TECHNIC</div>
          <div className="text-[rgb(var(--text-primary-rgb)/0.4)] text-[10px] uppercase tracking-[0.3em]">Precision Engineering</div>
        </div>
      </div>
      <div className="w-10 h-[2px] bg-primary mb-8" />
      <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-3">
        {isLogin ? "Hoş Geldiniz" : "Aramıza Katılın"}
      </h2>
      <p className="text-[rgb(var(--text-primary-rgb)/0.5)] text-sm leading-relaxed mb-10">
        MAS TECHNIC müşteri portalı ile üretim süreçlerinizi tek noktadan yönetin.
      </p>
      <div className="space-y-4">
        {benefits.map((b, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <CheckCircle size={15} className="text-primary mt-0.5 shrink-0" />
            <span className="text-[13px] text-[rgb(var(--text-primary-rgb)/0.65)] leading-snug">{b}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-14 pt-6 border-t border-[rgb(var(--text-primary-rgb)/0.1)] flex items-center gap-3">
        <Shield size={14} className="text-primary/50" />
        <span className="text-[10px] text-[rgb(var(--text-primary-rgb)/0.25)] uppercase tracking-wider">
          256-bit SSL ile korunan güvenli bağlantı
        </span>
      </div>
    </motion.div>
  </div>
);
