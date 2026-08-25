import { useRef, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { gsap, ScrollTrigger } from "@/hooks/use-gsap";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "./MagneticButton";
import { useTilt } from "@/hooks/useTilt";

const projects = [
  {
    title: "Havacılık Türbin Kanatları",
    subtitle: "Ti-6Al-4V • 5 Eksen CNC",
    description: "AS9100 sertifikalı üretim hattında 1200+ türbin kanadı üretimi. ±0.003mm tolerans.",
    tag: "Havacılık & Uzay",
    gradient: "from-[hsl(var(--forge-iron))] to-[hsl(var(--forge-gunmetal))]",
    link: "/endustriyel/havacilik-uzay",
  },
  {
    title: "Otomotiv Şanzıman Gövdesi",
    subtitle: "Al 7075-T6 • CNC Frezeleme",
    description: "Seri üretimde 10.000+ adet/yıl kapasite. Entegre CMM kalite kontrolü.",
    tag: "Otomotiv",
    gradient: "from-[hsl(var(--forge-gunmetal))] to-[hsl(var(--forge-obsidian))]",
    link: "/endustriyel/otomotiv",
  },
  {
    title: "Medikal İmplant Prototipi",
    subtitle: "316L Paslanmaz • Mikro İşleme",
    description: "ISO 13485 uyumlu prototyping. Yüzey pürüzlülüğü Ra 0.4µm.",
    tag: "Medikal",
    gradient: "from-[hsl(var(--forge-steel))] to-[hsl(var(--forge-iron))]",
    link: "/endustriyel/medikal",
  },
  {
    title: "Enerji Valf Gövdeleri",
    subtitle: "Inconel 718 • Derin Delik",
    description: "Yüksek basınç uygulamaları için özel alaşım işleme. 350+ bar test.",
    tag: "Enerji",
    gradient: "from-[hsl(var(--forge-obsidian))] to-[hsl(var(--forge-steel))]",
    link: "/endustriyel/petrol-gaz",
  },
  {
    title: "Savunma Optik Montaj",
    subtitle: "Al 6061-T6 • 5 Eksen",
    description: "MIL-SPEC standartlarında optik montaj braketi. Vibrasyon ve şok testli.",
    tag: "Savunma",
    gradient: "from-[hsl(var(--forge-iron))] to-[hsl(var(--forge-obsidian))]",
    link: "/endustriyel/savunma",
  },
  {
    title: "Robotik Aktüatör Gövdesi",
    subtitle: "SUS304 • CNC Torna + Freze",
    description: "Yüksek tekrarlanabilirlik gerektiren servo motor montaj gövdesi. ±0.005mm.",
    tag: "Robotik",
    gradient: "from-[hsl(var(--forge-steel))] to-[hsl(var(--forge-gunmetal))]",
    link: "/endustriyel/robotik",
  },
];

export const ProjectShowcase = () => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobile) return;
    const container = containerRef.current;
    const track = trackRef.current;
    const progress = progressRef.current;
    if (!container || !track) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    // Small delay to ensure layout is complete
    const ctx = gsap.context(() => {
      const getScrollAmount = () => -(track.scrollWidth - window.innerWidth);

      const tween = gsap.to(track, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          pin: true,
          scrub: 1.2,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progress) {
              progress.style.transform = `scaleX(${self.progress})`;
            }
          },
        },
      });

      // Card stagger reveal
      const cards = track.querySelectorAll<HTMLElement>(".gsap-project-card");
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0.3, scale: 0.92 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left 80%",
              end: "left 40%",
              scrub: true,
            },
          }
        );
      });
    }, container);

    return () => ctx.revert();
  }, [isMobile]);

  // Mobile: vertical layout
  if (isMobile) {
    return (
      <section
        className="section-industrial"
        style={{ backgroundColor: "var(--bg-dark-obsidian)" }}
      >
        <div className="container-industrial">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-primary" />
              <span className="typo-tag text-primary">{"Projelerimiz"}</span>
            </div>
            <Reveal variant="word-stagger" duration={0.6}>
              <h2 className="typo-h2 mb-4" style={{ color: "var(--text-primary)" }}>
                {"Referans Projeler"}
              </h2>
            </Reveal>
          </div>
          <div className="flex flex-col gap-6">
            {projects.map((p, i) => (
              <MobileProjectCard key={i} project={p} index={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ backgroundColor: "var(--bg-dark-obsidian)" }}
    >
      {/* Chromatic aberration overlay — triggered on viewport entry */}
      <style>{`
        @keyframes chroma-r { 0% { transform: translateX(8px); opacity: 0.6; } 70% { transform: translateX(0); opacity: 0.3; } 100% { opacity: 0; } }
        @keyframes chroma-g { 0% { transform: translateX(-6px); opacity: 0.6; } 70% { transform: translateX(0); opacity: 0.3; } 100% { opacity: 0; } }
        @keyframes chroma-b { 0% { transform: translateX(4px); opacity: 0.6; } 70% { transform: translateX(0); opacity: 0.3; } 100% { opacity: 0; } }
        .chroma-layer { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: screen; opacity: 0; }
        .chroma-active .chroma-layer { animation-duration: 0.4s; animation-fill-mode: forwards; animation-timing-function: ease-out; }
        .chroma-active .chroma-r { animation-name: chroma-r; }
        .chroma-active .chroma-g { animation-name: chroma-g; }
        .chroma-active .chroma-b { animation-name: chroma-b; }
      `}</style>
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none"
        onViewportEnter={() => {
          const el = containerRef.current;
          if (el) el.classList.add("chroma-active");
        }}
        viewport={{ once: true }}
      />
      {/* chromatic aberration / RGB channel split — intentional, DO NOT tokenize */}
      {/* eslint-disable-next-line no-restricted-syntax */}
      <div className="chroma-layer chroma-r" style={{ backgroundColor: "rgba(255,0,0,0.15)" /* OK: chroma split */ }} />
      {/* eslint-disable-next-line no-restricted-syntax */}
      <div className="chroma-layer chroma-g" style={{ backgroundColor: "rgba(0,255,0,0.1)" /* OK: chroma split */ }} />
      {/* eslint-disable-next-line no-restricted-syntax */}
      <div className="chroma-layer chroma-b" style={{ backgroundColor: "rgba(0,0,255,0.15)" /* OK: chroma split */ }} />
      <div className="h-screen flex flex-col justify-center">
        {/* Header */}
        <div className="container-industrial pt-12 pb-8">
          <Reveal direction="up" duration={0.6}>
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px bg-primary" />
                  <span className="typo-tag text-primary">{"Projelerimiz"}</span>
                </div>
                <h2 className="typo-h2" style={{ color: "var(--text-primary)" }}>
                  <span>{"Referans Projeler"}</span>
                </h2>
              </div>
              <Link
                to="/endustriyel/havacilik-uzay"
                className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
              >
                {"Tüm Projeler"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Horizontal scroll track — GSAP pinned */}
        <div
          ref={trackRef}
          className="flex gap-8 pl-8 will-change-transform"
        >
          {projects.map((project, i) => (
            <ProjectCard key={i} project={project} index={i} />
          ))}
        </div>

        {/* Progress bar */}
        <div className="container-industrial py-6">
          <div className="w-full h-px bg-[rgb(var(--text-primary-rgb)/0.1)] overflow-hidden">
            <div
              ref={progressRef}
              className="h-full origin-left"
              style={{
                transform: "scaleX(0)",
                background: "linear-gradient(90deg, hsl(var(--forge-molten)), hsl(var(--forge-amber)))",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const ProjectCard = ({ project, index }: { project: typeof projects[number]; index: number }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { ref: tiltRef, spotRef, handleMouseMove, handleMouseLeave } = useTilt(5);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const text = project.title;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      el.textContent = text;
      return;
    }

    el.innerHTML = text
      .split("")
      .map((c) =>
        c === " "
          ? " "
          : `<span class="gsap-char" style="display:inline-block;opacity:0;transform:translateY(30px)">${c}</span>`
      )
      .join("");

    const chars = el.querySelectorAll(".gsap-char");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(chars, {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.02,
            ease: "power3.out",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      el.textContent = text;
    };
  }, [project.title]);

  return (
    <div
      ref={tiltRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`gsap-project-card relative flex-shrink-0 w-[80vw] h-[60vh] bg-gradient-to-br ${project.gradient} overflow-hidden group cursor-pointer`}
      style={{ willChange: "transform, opacity", transition: "transform 0.15s ease-out" }}
    >
      {/* 3D spotlight overlay */}
      <div
        ref={spotRef}
        className="absolute inset-0 pointer-events-none z-[2]"
        aria-hidden="true"
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            `linear-gradient(to right, var(--surface-border) 1px, transparent 1px), linear-gradient(to bottom, var(--surface-border) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-10 lg:p-14">
        <span className="text-[10px] font-mono uppercase tracking-[0.4em] mb-4" style={{ color: "var(--text-muted)" }}>
          {project.tag}
        </span>
        <h3
          ref={titleRef}
          className="text-3xl lg:text-5xl font-bold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}
          aria-label={project.title}
        />
        <p className="text-sm font-mono mb-4" style={{ color: "var(--text-technical)" }}>
          <span>{project.subtitle}</span>
        </p>
        <p className="text-base max-w-lg leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
          <span>{project.description}</span>
        </p>
        <MagneticButton
          href={project.link}
          className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 transition-all w-fit text-[color:var(--text-primary)] border border-[color:var(--surface-border-hover)]"
          strength={0.2}
        >
          <span>{"Detayları Gör"}</span>
          <ArrowRight className="w-4 h-4" />
        </MagneticButton>
      </div>

      {/* Number watermark */}
      <div
        className="absolute top-6 right-10 text-[120px] lg:text-[200px] font-bold leading-none pointer-events-none select-none"
        style={{ color: "var(--text-vignette)" }}
      >
        {`0${index + 1}`}
      </div>
    </div>
  );
};

const MobileProjectCard = forwardRef<HTMLDivElement, { project: typeof projects[number]; index: number }>(
  ({ project, index }, ref) => (
    <motion.div
      ref={ref}
      className={`relative bg-gradient-to-br ${project.gradient} overflow-hidden p-6`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <span className="text-[10px] font-mono uppercase tracking-[0.4em] mb-3 block" style={{ color: "var(--text-muted)" }}>
        {project.tag}
      </span>
      <h3 className="text-xl font-bold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
        <span>{project.title}</span>
      </h3>
      <p className="text-xs font-mono mb-3" style={{ color: "var(--text-technical)" }}>
        <span>{project.subtitle}</span>
      </p>
      <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
        <span>{project.description}</span>
      </p>
      <Link
        to={project.link}
        className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 transition-all" style={{ color: "var(--text-primary)", border: "1px solid var(--surface-border-hover)" }}
      >
        {"Detaylar"}
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  )
);
MobileProjectCard.displayName = "MobileProjectCard";
