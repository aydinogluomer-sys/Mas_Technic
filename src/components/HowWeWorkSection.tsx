/**
 * HowWeWorkSection.tsx — FIXED
 *
 * FIXES:
 * 1. Pin+scrub — section itself was being pinned, but header was inside.
 *    GSAP pin adds a pin-spacer DIV around the trigger. When header is inside
 *    the pinned element, it scrolls away. Fixed: separate pinned container.
 * 2. Card stagger — was triggering at "top 60%" on the section (before pin),
 *    so cards appeared before scrolling started. Fixed: removed stagger,
 *    cards visible by default inside pinned area.
 * 3. Progress bar — was using CSS scaleX with "transition-none" class but
 *    GSAP set doesn't respect CSS transitions anyway. Cleaned up.
 * 4. totalScroll calculation — end was `+=${totalScroll}` which creates
 *    mismatch with Lenis. Fixed: use proper `end: () => "+=" + totalScroll`.
 */
import { useRef, useEffect } from "react";
import { Upload, MessageSquare, Settings, Truck } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { SectionHeader } from "./SectionHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { gsap, ScrollTrigger } from "@/hooks/use-gsap";

const steps = [
  {
    number: "01",
    icon: Upload,
    label: "Analiz",
    title: "Fizibilite & Kaynak Planlaması",
    description: "Teknik analiz, malzeme fizibilitesi ve kaynak planlamasıyla başlıyoruz.",
    checklist: [
      { title: "Maliyet Optimizasyonu", desc: "Kaynak tahsis stratejisi" },
      { title: "Malzeme Analizi", desc: "Dayanıklılık ve mukavemet testleri" },
      { title: "ISO Hazırlığı", desc: "Standart uyumluluk denetimi" },
    ],
    stat: { value: "99.8%", label: "Faz Güvenilirliği" },
    accent: "hsl(var(--forge-teal))",
  },
  {
    number: "02",
    icon: MessageSquare,
    label: "Tasarım",
    title: "Teknik Tasarım & Geri Bildirim",
    description: "Mühendislerimiz, tasarımınızı DFM ilkelerine göre imalata uygunluk açısından inceler.",
    checklist: [
      { title: "DFM Analizi", desc: "Üretim için tasarım optimizasyonu" },
      { title: "Tolerans Kontrolü", desc: "Geometrik boyut doğrulama" },
      { title: "Malzeme Seçimi", desc: "Uygulamaya özel malzeme" },
    ],
    stat: { value: "48 sa", label: "Ortalama Teklif Süresi" },
    accent: "hsl(var(--forge-molten))",
  },
  {
    number: "03",
    icon: Settings,
    label: "Üretim",
    title: "Hassas Üretim & İzleme",
    description: "Onaylı tasarımlar, CNC tezgâhlarda gerçek zamanlı izlemeyle üretilir.",
    checklist: [
      { title: "5 Eksen CNC", desc: "Karmaşık geometri işleme" },
      { title: "Yüzey İşleme", desc: "Ra 0.4μm yüzey kalitesi" },
      { title: "Proses Kontrolü", desc: "SPC ile süreç yönetimi" },
    ],
    stat: { value: "±0.005", label: "mm Tolerans" },
    accent: "hsl(var(--forge-amber))",
  },
  {
    number: "04",
    icon: Truck,
    label: "KK & Teslimat",
    title: "Kalite Kontrol & Sevkiyat",
    description: "CMM ölçüm cihazlarıyla kalite onayı, özenli paketleme ve tam vaktinde teslimat.",
    checklist: [
      { title: "CMM Ölçüm", desc: "3 boyutlu koordinat ölçümü" },
      { title: "Sertifikasyon", desc: "Malzeme ve test sertifikaları" },
      { title: "Paketleme", desc: "Özel koruyucu ambalaj" },
    ],
    stat: { value: "%100", label: "Kalite Kontrol" },
    accent: "hsl(var(--primary))",
  },
];

export const HowWeWorkSection = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const isMobile = useIsMobile();
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (isMobile || prefersReduced) return;
    const wrapper = wrapperRef.current;
    const pinContainer = pinContainerRef.current;
    const strip = stripRef.current;
    const progress = progressRef.current;
    const counter = counterRef.current;
    if (!wrapper || !pinContainer || !strip || !progress || !counter) return;

    const ctx = gsap.context(() => {
      const totalScroll = strip.scrollWidth - window.innerWidth;

      // FIX: Pin the inner container, not the whole section.
      // This way the wrapper provides the scroll height via its natural height
      // and the pin-spacer wraps pinContainer correctly.
      gsap.to(strip, {
        x: -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: () => `+=${totalScroll}`,
          pin: pinContainer,
          scrub: 1.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Progress bar
            gsap.set(progress, { scaleX: self.progress });
            // Counter
            const step = Math.min(4, Math.floor(self.progress * 4) + 1);
            counter.textContent = String(step).padStart(2, "0");
          },
        },
      });
    }, wrapper);

    return () => ctx.revert();
  }, [isMobile, prefersReduced]);

  // Mobile: simple vertical layout
  if (isMobile) {
    return (
      <section
        id="nasil-calisiyoruz"
        className="relative border-y border-border py-12"
        style={{ backgroundColor: "hsl(var(--forge-workshop))" }}
      >
        <div className="container-industrial mb-8">
          <SectionHeader
            tag="Metodoloji"
            title="Hassas Üretim İş Akışımız"
            sectionNumber={2}
            description="Teknik veriden son kalite onayına kadar uçtan uca endüstriyel sürecimiz"
          />
        </div>
        <div className="flex flex-col gap-5 px-4">
          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <div ref={wrapperRef} id="nasil-calisiyoruz">
      {/* This is the element that gets pinned */}
      <div
        ref={pinContainerRef}
        className="relative overflow-hidden border-y border-border"
        style={{
          backgroundColor: "hsl(var(--forge-workshop))",
          height: "100vh",
        }}
      >
        {/* Header — stays visible during pin because it's inside pinContainer */}
        <div className="pt-12 pb-6 px-8 lg:px-16">
          <SectionHeader
            tag="Metodoloji"
            title="Hassas Üretim İş Akışımız"
            sectionNumber={2}
            description="Teknik veriden son kalite onayına kadar uçtan uca endüstriyel sürecimiz"
          />
        </div>

        {/* Horizontal scroll strip */}
        <div
          ref={stripRef}
          className="flex gap-8 px-8 lg:px-16 pb-20 will-change-transform items-start"
          style={{ height: "calc(100vh - 200px)" }}
        >
          <div className="flex-shrink-0 w-[5vw]" />
          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
          <div className="flex-shrink-0 w-[15vw]" />
        </div>

        {/* Bottom progress line */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ backgroundColor: "hsl(var(--border))" }}>
          <div
            ref={progressRef}
            className="h-full origin-left"
            style={{
              backgroundColor: "hsl(var(--forge-molten))",
              transform: "scaleX(0)",
            }}
          />
        </div>

        {/* Counter */}
        <div className="absolute bottom-6 right-8 text-xs font-mono tracking-widest text-muted-foreground/50">
          <span ref={counterRef}>01</span> / 04
        </div>
      </div>
    </div>
  );
};

const StepCard = ({ step, index }: { step: (typeof steps)[number]; index: number }) => {
  return (
    <div
      className="hww-card flex-shrink-0 w-[360px] lg:w-[400px] p-8 lg:p-10 border bg-background border-border hover:border-primary/40 transition-all duration-500 group relative overflow-hidden"
      data-cursor="detail"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
        style={{ backgroundColor: step.accent }}
      />

      {/* Step number + icon */}
      <div className="flex items-center justify-between mb-8">
        <span className="text-6xl font-bold font-mono leading-none" style={{ color: "hsl(var(--border))" }}>
          {step.number}
        </span>
        <div
          className="w-14 h-14 flex items-center justify-center border border-border group-hover:border-primary/40 transition-colors duration-300"
          style={{ backgroundColor: "hsl(var(--muted))" }}
        >
          <step.icon className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Label */}
      <span className="text-[10px] font-mono uppercase tracking-[0.3em] mb-3 block" style={{ color: step.accent }}>
        {step.label}
      </span>

      {/* Title */}
      <h3 className="heading-industrial text-xl lg:text-2xl mb-3 group-hover:text-primary transition-colors duration-300">
        {step.title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm leading-relaxed mb-6">{step.description}</p>

      {/* Checklist */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {step.checklist.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: step.accent }} />
            <div>
              <span className="text-xs font-semibold block">{item.title}</span>
              <span className="text-[11px] text-muted-foreground">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Stat footer */}
      <div className="flex items-center gap-3 pt-5 border-t border-border">
        <span className="text-technical font-bold text-xl" style={{ color: step.accent }}>
          {step.stat.value}
        </span>
        <span className="text-technical text-[10px] text-muted-foreground uppercase tracking-wider">
          {step.stat.label}
        </span>
      </div>
    </div>
  );
};
