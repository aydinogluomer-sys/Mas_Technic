import { Check } from "lucide-react";
import { AmbientGlowOverlay } from "@/components/ui/AmbientGlowOverlay";
import { Reveal } from "@/components/ui/Reveal";
import { TextHighlight } from "@/components/ui/TextHighlight";
import { useScroll, useTransform } from "framer-motion";
import { motion } from "@/components/shell/motion";
import { useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import cncWorkshop from "@/assets/cnc-workshop.webp";
import qualityControl from "@/assets/quality-control.webp";
import { BlurImage } from "./BlurImage";

const advantages = [
  {
    title: "Akıllı Üretim Yönetimi",
    desc: "IoT sensörleri ile gerçek zamanlı makine izleme ve otomatik proses optimizasyonu.",
  },
  {
    title: "Tasarımdan Üretime Entegrasyon",
    desc: "DFM analizi ile tasarım doğrulama, maliyet düşürme ve üretim süresini kısaltma.",
  },
  {
    title: "Hızlı Prototipleme",
    desc: "48 saat içinde prototip üretim ve iteratif tasarım geliştirme desteği.",
  },
  {
    title: "Sürdürülebilir Üretim",
    desc: "ISO 14001 uyumlu çevresel yönetim ve malzeme atık minimizasyonu.",
  },
];

const stats = [
  { value: "45+", label: "CNC Tezgâh" },
  { value: "24/7", label: "Kesintisiz Üretim" },
  { value: "3500+", label: "Tamamlanan Proje" },
  { value: "15+", label: "Yıl Tecrübe" },
];

export const WhyUsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 95%", "start 40%"],
  });

  const clipPath = useTransform(scrollYProgress, [0, 1], ["inset(100% 0 0 0)", "inset(0% 0 0 0)"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);

  const splitLeftInitial = prefersReduced ? { x: 0, opacity: 1 } : { x: -60, opacity: 0 };
  const splitRightInitial = prefersReduced ? { x: 0, opacity: 1 } : { x: 60, opacity: 0 };
  const splitAnimate = { x: 0, opacity: 1 };

  return (
    <section
      ref={sectionRef}
      id="neden-biz"
      className="section-tone-proof relative"
      style={{ perspective: 1000 }}
    >
      <AmbientGlowOverlay />
      {/* Stats Bar */}
      <div className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className={`text-center py-8 md:py-10 ${i < 3 ? "border-r border-border/30" : ""}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div
                  className="text-4xl md:text-5xl font-bold mb-1 font-mono"
                  style={{ color: "hsl(var(--forge-molten))" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium"
                  style={{ color: "hsl(var(--forge-silver))" }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Highlight Section — scroll-linked */}
      <div className="border-t border-border/20 py-20 md:py-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <p
            className="text-2xl md:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight"
            style={{ fontStyle: "italic", color: "var(--text-primary)" }}
          >
            {"Sadece bir tedarikçi değil — "}
            <TextHighlight color="hsl(var(--forge-molten) / 0.3)">
              {"üretim sürecinizin"}
            </TextHighlight>
            {" mühendislik ortağıyız. "}
            <TextHighlight color="hsl(var(--primary) / 0.25)">
              {"Mikron seviyesinde hassasiyet,"}
            </TextHighlight>
            {" uçtan uca izlenebilirlik ve "}
            <TextHighlight color="hsl(var(--forge-steel) / 0.2)">
              {"48 saat içinde prototip"}
            </TextHighlight>
            {" garantisiyle."}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32 lg:py-40">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={splitLeftInitial}
            whileInView={splitAnimate}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-primary" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary font-mono">
                {"Avantajlar"}
              </span>
            </div>
            <Reveal variant="word-stagger" duration={0.6}>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-[0.95] tracking-tighter" style={{ color: "var(--text-primary)" }}>
                {"Endüstri Liderlerinin Mas Technic'i Tercih Etme Nedenleri."}
              </h2>
            </Reveal>
            <p className="text-sm leading-relaxed mb-10 max-w-md" style={{ color: "hsl(var(--forge-silver))" }}>
              {"Mikron seviyesinde üretim hassasiyetini, uçtan uca dijital izlenebilirlik ve "}
              <TextHighlight color="hsl(var(--primary) / 0.25)">{"şeffaf süreç yönetimiyle"}</TextHighlight>
              {" müşterilerimize sunuyoruz."}
            </p>

            <div className="space-y-6">
              {advantages.map((adv, i) => (
                <motion.div
                  key={adv.title}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                >
                  <div className="w-5 h-5 mt-0.5 flex items-center justify-center shrink-0 bg-primary/15">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-0.5" style={{ color: "var(--text-primary)" }}>{adv.title}</h4>
                    <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--forge-silver))" }}>
                      {adv.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Images with scroll-driven clipPath reveal */}
          <motion.div
            className="relative"
            initial={splitRightInitial}
            whileInView={splitAnimate}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="relative">
              <motion.div style={{ clipPath }}>
                <BlurImage
                  src={cncWorkshop}
                  alt="CNC Üretim Atölyesi"
                  className="w-full h-[350px] md:h-[450px] object-cover"
                />
              </motion.div>
              <motion.div
                className="absolute -bottom-8 -left-4 md:-left-8 w-40 md:w-52 border-4 border-forge-gunmetal shadow-2xl"
                style={{ scale: imageScale }}
              >
                <BlurImage src={qualityControl} alt="Kalite Kontrol" className="w-full h-32 md:h-40 object-cover" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
