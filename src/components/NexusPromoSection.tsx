import { motion } from "framer-motion";
import { AmbientGlowOverlay } from "@/components/ui/AmbientGlowOverlay";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { Link } from "react-router-dom";
import { SectionHeader } from "./SectionHeader";
import {
  LayoutDashboard,
  FileText,
  Package,
  Factory,
  ShieldCheck,
  ArrowRight,
  BarChart3,
  Clock,
  Upload,
  Eye,
  CheckCircle2,
} from "lucide-react";

const recentOrders = [
  { id: "ORD-2847", part: "Flanş Bağlantı", status: "Üretimde", progress: 72, machine: "DMG MORI" },
  { id: "ORD-2846", part: "Vana Gövdesi", status: "KK Bekliyor", progress: 95, machine: "Mazak" },
  { id: "ORD-2845", part: "Piston Kolu", status: "Tamamlandı", progress: 100, machine: "Haas" },
];

const recentFiles = [
  { name: "flans-v3.2.step", size: "4.2 MB", date: "2 saat önce" },
  { name: "vana-govdesi.iges", size: "8.7 MB", date: "5 saat önce" },
  { name: "piston-kolu-rev2.stp", size: "3.1 MB", date: "1 gün önce" },
];

const features = [
  { icon: BarChart3, label: "Gerçek Zamanlı Üretim Takibi", desc: "78 aktif sipariş · Anlık makine durumu" },
  { icon: Upload, label: "CAD Dosya Yönetimi", desc: "Versiyon kontrolü · NDA korumalı paylaşım" },
  { icon: ShieldCheck, label: "Kalite Raporları & Sertifikalar", desc: "3.2s ort. CMM ölçüm · Anlık erişim" },
  { icon: Clock, label: "Otomatik Bildirimler", desc: "Sipariş ve üretim durum güncellemeleri" },
];

export const NexusPromoSection = () => {
  const prefersReduced = usePrefersReducedMotion();
  const inkInitial = prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 };
  const inkAnimate = { opacity: 1, y: 0 };

  return (
    <motion.section
      className="relative min-h-[100dvh]"
      style={{ backgroundColor: "var(--bg-dark-gunmetal)" }}
      initial={inkInitial}
      whileInView={inkAnimate}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <AmbientGlowOverlay />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32 lg:py-40">
        {/* Standardized SectionHeader */}
        <div className="mb-12">
         <SectionHeader
            tag="Dijital Platform"
            title="Nexus Endüstriyel Yönetim Paneli"
            sectionNumber={3}
            description="Üretim süreçlerinizi, tekliflerinizi ve sipariş durumlarınızı tek bir noktadan yönetin. Hassas mühendislik için optimize edilmiş dijital tedarik zinciri entegrasyonu."
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-5 mb-10">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  className="flex items-start gap-4 group cursor-default"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                >
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-foreground mb-0.5">{f.label}</h4>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link
              to="/musteri-paneli"
              className="group inline-flex items-center gap-2 px-7 py-3.5 font-semibold text-sm transition-all hover:brightness-110"
              style={{ transform: "skewX(-4deg)", backgroundColor: "hsl(var(--forge-molten))", color: "var(--text-primary)" }}
            >
              <span style={{ transform: "skewX(4deg)" }} className="flex items-center gap-2">
                <span>Paneli Keşfet</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>

          <NexusDashboardMockup />
        </div>
      </div>
    </motion.section>
  );
};

const NexusDashboardMockup = () => (
  <motion.div
    className="relative"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: 0.2, duration: 0.6 }}
  >
    <div
      className="relative border border-border bg-card overflow-hidden shadow-xl transition-transform duration-300 hover:scale-[1.01] hover:shadow-2xl"
      style={{ boxShadow: "0 0 0 0 transparent" }}
    >
      <style>{`
        @keyframes nexus-scanline {
          0% { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <div
          className="absolute left-0 right-0 h-px opacity-20"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)",
            animation: "nexus-scanline 4s linear infinite",
          }}
        />
      </div>

      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-[10px] text-foreground/40 font-mono">nexus.mastechnic.com/dashboard</span>
        </div>
      </div>

      <div className="flex">
        <div className="w-12 border-r border-border bg-muted/20 py-3 hidden sm:flex flex-col items-center gap-3">
          <div className="w-7 h-7 bg-primary flex items-center justify-center">
            <span className="text-[8px] font-bold text-primary-foreground">MT</span>
          </div>
          <div className="w-6 h-6 flex items-center justify-center text-foreground/30 hover:text-primary transition-colors">
            <LayoutDashboard className="w-3.5 h-3.5" />
          </div>
          <div className="w-6 h-6 flex items-center justify-center text-primary">
            <Package className="w-3.5 h-3.5" />
          </div>
          <div className="w-6 h-6 flex items-center justify-center text-foreground/30">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="w-6 h-6 flex items-center justify-center text-foreground/30">
            <Factory className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-foreground">Sipariş Takibi</h4>
              <span className="text-[10px] text-foreground/50 font-mono">3 aktif sipariş</span>
            </div>
            <div className="flex items-center gap-1.5">
              <motion.span
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <span className="text-[10px] text-green-600 font-mono">Çevrimiçi</span>
            </div>
          </div>

          <div className="border border-border mb-4">
            <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-muted/30 border-b border-border">
              <span className="text-[9px] font-semibold text-foreground/50 uppercase tracking-wider">Sipariş</span>
              <span className="text-[9px] font-semibold text-foreground/50 uppercase tracking-wider">Parça</span>
              <span className="text-[9px] font-semibold text-foreground/50 uppercase tracking-wider">Durum</span>
              <span className="text-[9px] font-semibold text-foreground/50 uppercase tracking-wider">İlerleme</span>
            </div>
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-4 gap-2 px-3 py-2.5 border-b border-border last:border-0 items-center"
              >
                <span className="text-[10px] font-mono font-semibold text-primary">{order.id}</span>
                <span className="text-[10px] text-foreground/70 truncate">{order.part}</span>
                <span
                  className={`text-[9px] font-semibold px-1.5 py-0.5 inline-block w-fit ${
                    order.status === "Tamamlandı"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : order.status === "KK Bekliyor"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-primary/10 text-primary"
                  }`}
                >
                  {order.status}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${order.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-foreground/50">{order.progress}%</span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-2 block">
              Son Dosyalar
            </span>
            {recentFiles.map((file) => (
              <div key={file.name} className="flex items-center gap-2 py-1.5 group">
                <FileText className="w-3 h-3 text-primary/60 shrink-0" />
                <span className="text-[10px] text-foreground/70 truncate flex-1 font-mono">{file.name}</span>
                <span className="text-[9px] text-foreground/40">{file.size}</span>
                <Eye className="w-3 h-3 text-foreground/20 group-hover:text-primary transition-colors shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    <motion.div
      className="absolute -bottom-4 -right-4 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider shadow-lg"
      style={{ backgroundColor: "hsl(var(--forge-molten))", color: "var(--text-primary)" }}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.8 }}
    >
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Tam Entegrasyon</span>
      </div>
    </motion.div>
  </motion.div>
);
