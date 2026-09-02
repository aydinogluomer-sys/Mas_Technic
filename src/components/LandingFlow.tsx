import { startTransition, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, MoveRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { useInViewClass, type InViewClassTarget } from "@/hooks/useInViewClass";
import { navigationItems } from "./navigation-data";
import { LANDING_MOTION, type FeaturedStory } from "@/config/landing-motion";
import {
  DecisionSupport,
  MaterialsIntelligence,
  TrustProof,
} from "./landing/RestoredLandingSections";
import { ProcessProofCinema } from "./landing/ProcessProofCinema";
import "@/styles/landing-flow.css";

/** GSAP'sız, her breakpoint'te çalışan bir-kez efektleri (bkz. useInViewClass). */
const IN_VIEW_EFFECTS: readonly InViewClassTarget[] = [
  { selector: "[data-lf-sheen]", className: "is-swept" },
  { selector: "[data-lf-reveal='cut']", className: "is-cut", armClassName: "is-cut-armed" },
  { selector: "[data-lf-cuttext]", className: "is-cuttext", armClassName: "is-cuttext-armed" },
];

import cncImage from "@/assets/hero-cnc.webp";
import mouldImage from "@/assets/hero-enjeksiyon-kalibi.webp";
import surfaceImage from "@/assets/hero-anodizasyon.webp";
import markingImage from "@/assets/hero-lazer-kazima.webp";
import assemblyImage from "@/assets/hero-mekanik-montaj.webp";
import aerospaceImage from "@/assets/industry-aerospace.webp";
import defenseImage from "@/assets/industry-defense.webp";
import automotiveImage from "@/assets/industry-automotive.webp";
import medicalImage from "@/assets/industry-medical.webp";
import roboticsImage from "@/assets/industry-robotics.webp";

const serviceImages = [cncImage, mouldImage, surfaceImage, markingImage, assemblyImage];
const serviceGroup = navigationItems.find((item) => item.label === "Hizmetler");

const stories: FeaturedStory[] = (serviceGroup?.children ?? []).map((category, index) => ({
  id: category.path.split("/").at(-1) ?? `service-${index}`,
  index: String(index + 1).padStart(2, "0"),
  title: category.label,
  summary: [
    "Mikron seviyesinde hassasiyet, kontrollü proses ve tekrarlanabilir üretim.",
    "Fikstürden kalıba, üretime hazır mühendislik ve hızlı doğrulama.",
    "Fonksiyon, yüzey kalitesi ve dayanım için uçtan uca proses yönetimi.",
    "Kalıcı izlenebilirlik için endüstriyel markalama ve veri çözümleri.",
    "Tek parçadan sevkiyata, kontrollü montaj ve teslimat disiplini.",
  ][index],
  image: serviceImages[index],
  categoryPath: category.path,
  detailLinks: category.links,
}));

const industries = [
  { index: "01", title: "Havacılık & Uzay", path: "/endustriyel/havacilik-uzay", image: aerospaceImage, meta: "Ölçüm kayıtlı üretim" },
  { index: "02", title: "Savunma Sanayi", path: "/endustriyel/savunma-sanayi", image: defenseImage, meta: "Kritik parça üretimi" },
  { index: "03", title: "Otomotiv", path: "/endustriyel/otomotiv", image: automotiveImage, meta: "Prototipten seriye" },
  { index: "04", title: "Medikal", path: "/endustriyel/medikal", image: medicalImage, meta: "İzlenebilir proses" },
  { index: "05", title: "Robotik", path: "/endustriyel/robotik", image: roboticsImage, meta: "Yüksek tekrarlanabilirlik" },
] as const;

export function LandingFlow() {
  // Metinsel sahneler ilk render'da erişilebilir kalır; yalnız ağır görseller
  // intersection observer ile ertelenir. Böylece anchor hedefleri ve mobil doğal
  // akış, kullanıcı etkileşimine bağlı bir hydration yarışına girmez.
  // Hero (phase 1) ilk boyamada gelir, kalan bölümler hemen ardından kademeli
  // mount edilir. Tümünü tek seferde render etmek mobilde ana thread'i ~2.2 s
  // bloklayıp LCP'yi geciktiriyordu. Anchor hedefleri her fazda placeholder
  // <section id=...> olarak DOM'da durduğu için navigasyon etkilenmez.
  const [renderPhase, setRenderPhase] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLElement>(null);
  const featuredPinRef = useRef<HTMLDivElement>(null);
  const industryRef = useRef<HTMLElement>(null);
  const industryPinRef = useRef<HTMLDivElement>(null);
  const industryTrackRef = useRef<HTMLDivElement>(null);
  const industryCounterRef = useRef<HTMLSpanElement>(null);
  const industryRangeRef = useRef<{ start: number; end: number } | null>(null);
  const activeStoryRef = useRef(0);
  const activeIndustryRef = useRef(0);
  const motionRequestedRef = useRef(false);
  const prefersReduced = usePrefersReducedMotion();
  const pinnedLayout = !prefersReduced
    && typeof window !== "undefined"
    && window.matchMedia("(min-width: 769px) and (min-height: 601px) and (pointer: fine)").matches;

  useInViewClass(rootRef, IN_VIEW_EFFECTS, renderPhase);

  // Klavye odak güvenliği: `[data-lf-reveal]` blokları açılana kadar `clip-path`
  // ile kırpılı duruyor. `clip-path` çizimle birlikte İSABET TESTİNİ de kırpar,
  // ama `getBoundingClientRect` kırpılmamış kutuyu döndürür — yani sekmeyle
  // gelen kullanıcı görünürde var olan ama tıklanamayan bir hedefe odaklanabiliyordu
  // (ölçüldü: dar masaüstünde CTA'nın alt kenarı kendi bölümüne düşüyordu).
  // Odak içeri girdiğinde ilgili bloğu final durumuna alıyoruz.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onFocusIn = (event: FocusEvent) => {
      const block = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-lf-reveal]");
      if (!block) return;
      block.style.opacity = "1";
      block.style.transform = "none";
      block.style.clipPath = "none";
    };
    root.addEventListener("focusin", onFocusIn);
    return () => root.removeEventListener("focusin", onFocusIn);
  }, []);

  // index.html'deki app-shell hero'yu gerçek hero boyandıktan sonra kaldır.
  //
  // Giriş sekansı (Precision Born) AYNI shell'in içinde yaşıyor: harfler bloktan
  // kesilip ölçülüyor ve sonunda olduğu yerde hero başlığına dönüşüyor.
  // Bu yüzden sekans sürerken shell KALDIRILAMAZ — aksi halde intro iki kare
  // sonra silinip yok olurdu. Sekans yoksa (oturumda görüldü, reduced-motion,
  // alt sayfa) eski davranış aynen geçerli.
  useEffect(() => {
    const shell = document.getElementById("hero-shell");
    if (!shell) return;
    let frame = 0;
    const drop = () => {
      frame = requestAnimationFrame(() => requestAnimationFrame(() => shell.remove()));
    };
    if (document.documentElement.hasAttribute("data-intro-active")) {
      document.addEventListener("mas:intro-done", drop, { once: true });
      return () => {
        document.removeEventListener("mas:intro-done", drop);
        cancelAnimationFrame(frame);
      };
    }
    drop();
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      startTransition(() => setRenderPhase((phase) => Math.max(phase, 1)));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let timer = 0;
    let running = false;
    let cancelled = false;
    let steps = 0;
    const advance = () => {
      if (cancelled) return;
      startTransition(() => setRenderPhase((phase) => Math.min(5, phase + 1)));
      steps += 1;
      if (steps < 5) timer = window.setTimeout(advance, 90);
    };
    const hydrateOnIntent = () => {
      if (running) return;
      running = true;
      motionRequestedRef.current = true;
      advance();
    };
    const events = ["scroll", "wheel", "touchstart", "pointerdown", "keydown", "focusin"] as const;
    events.forEach((eventName) => window.addEventListener(eventName, hydrateOnIntent, { passive: true, once: true }));

    // Etkileşim beklemeden de mount et: pasif ziyaretçi ve tarayıcı botları
    // tam içeriği görmeli. Hero boyandıktan sonraki ilk boşta çalışır, böylece
    // LCP'yi bloklamaz.
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(hydrateOnIntent, { timeout: 400 })
      : window.setTimeout(hydrateOnIntent, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (window.requestIdleCallback) window.cancelIdleCallback(idle as number);
      else window.clearTimeout(idle as number);
      events.forEach((eventName) => window.removeEventListener(eventName, hydrateOnIntent));
    };
  }, []);

  useEffect(() => {
    if (renderPhase < 5) return;
    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;
    let cleanupMotion = () => {};
    const naturalFlow = prefersReduced || window.matchMedia("(max-width: 768px), (max-height: 600px), (pointer: coarse)").matches;

    const setupMotion = async () => {
      if (naturalFlow) {
        // "cut" varyantı hariç: onun clip'i CSS sınıfıyla sürülüyor ve burada
        // inline `clip-path:none` yazılırsa mobilde efekt tamamen eziliyor.
        // Görünürlük riski yok — sınıf eklenmezse zaten kırpma olmuyor.
        root.querySelectorAll<HTMLElement>(
          "[data-lf-reveal]:not([data-lf-reveal='cut']), .lf-story, .lf-industry-card",
        ).forEach((element) => {
          element.style.opacity = "1";
          element.style.transform = "none";
          element.style.clipPath = "none";
        });
        root.dataset.motionReady = "true";
        return;
      }

      const { gsap, ScrollTrigger } = await import("@/hooks/use-gsap");
      if (cancelled) return;
      const context = gsap.context(() => {

      gsap.fromTo(".lf-hero-title",
        { scale: 1, yPercent: 0 },
        {
          scale: 0.92,
          yPercent: 10,
          ease: "none",
          scrollTrigger: { trigger: ".lf-hero", start: "top top", end: "bottom top", scrub: LANDING_MOTION.scrub },
        },
      );
      gsap.fromTo(".lf-hero-media",
        { scale: 1.08 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: ".lf-hero", start: "top top", end: "bottom top", scrub: LANDING_MOTION.scrub },
        },
      );

      // "cut" varyantı hariç: o, CSS + IntersectionObserver ile sürülüyor
      // (mobilde de çalışsın diye) ve iki kez animasyon almamalı.
      ScrollTrigger.batch("[data-lf-reveal]:not([data-lf-reveal='cut'])", {
        start: "top 88%",
        once: true,
        onEnter: (items) => gsap.fromTo(items,
          { opacity: 0, y: LANDING_MOTION.revealDistance, clipPath: "inset(0 0 18% 0)" },
          { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: LANDING_MOTION.revealDuration, stagger: 0.08, ease: LANDING_MOTION.ease },
        ),
      });

      const media = gsap.matchMedia();
      media.add("(min-width: 769px) and (min-height: 601px) and (pointer: fine)", () => {
        const storyEls = gsap.utils.toArray<HTMLElement>(".lf-story");
        const navEls = gsap.utils.toArray<HTMLElement>(".lf-story-nav");
        const setActiveStory = (active: number) => {
          storyEls.forEach((story, index) => {
            const isActive = index === active;
            if (isActive) story.removeAttribute("aria-hidden");
            else story.setAttribute("aria-hidden", "true");
            story.querySelectorAll<HTMLElement>("a, button").forEach((control) => {
              control.tabIndex = isActive ? 0 : -1;
            });
          });
          navEls.forEach((item, index) => {
            item.toggleAttribute("data-active", index === active);
            if (index === active) item.setAttribute("aria-current", "step");
            else item.removeAttribute("aria-current");
          });
        };
        setActiveStory(0);
        gsap.set(storyEls.slice(1), { clipPath: "inset(100% 0 0 0)", scale: 1.06 });
        const featuredTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: featuredRef.current,
            pin: featuredPinRef.current,
            pinType: "transform",
            start: "top top",
            end: `+=${LANDING_MOTION.featuredScroll}`,
            scrub: LANDING_MOTION.scrub,
            invalidateOnRefresh: true,
            // Bu pin sayfada en üstte; kendi pin-spacer'ını ilk kurmalı ki
            // altındaki her trigger doğru konum ölçsün (bkz. useProcessProofCinema).
            refreshPriority: 3,
            onUpdate: (self) => {
              const active = Math.min(storyEls.length - 1, Math.round(self.progress * (storyEls.length - 1)));
              if (active === activeStoryRef.current) return;
              activeStoryRef.current = active;
              setActiveStory(active);
            },
          },
        });
        featuredTimeline.eventCallback("onUpdate", () => {
          const progress = featuredTimeline.progress();
          featuredPinRef.current?.style.setProperty("--lf-progress", `${progress}`);
        });
        storyEls.slice(1).forEach((story, index) => {
          featuredTimeline
            .to(storyEls[index], { opacity: 0.25, scale: 0.96, duration: 0.45, ease: "none" }, index)
            .to(story, { clipPath: "inset(0% 0 0 0)", scale: 1, duration: 0.55, ease: "none" }, index);
        });

        const track = industryTrackRef.current;
        const pin = industryPinRef.current;
        const cards = gsap.utils.toArray<HTMLElement>(".lf-industry-card");
        const industryJumps = gsap.utils.toArray<HTMLElement>(".lf-industry-jump");
        if (track && pin) {
          const setActiveIndustry = (active: number) => {
            cards.forEach((card, index) => {
              const isActive = index === active;
              card.toggleAttribute("data-active", isActive);
              if (isActive) card.removeAttribute("aria-hidden");
              else card.setAttribute("aria-hidden", "true");
              card.tabIndex = isActive ? 0 : -1;
            });
            industryJumps.forEach((jump, index) => {
              if (index === active) jump.setAttribute("aria-current", "step");
              else jump.removeAttribute("aria-current");
            });
            if (industryCounterRef.current) industryCounterRef.current.textContent = `${String(active + 1).padStart(2, "0")} / 05`;
          };
          setActiveIndustry(0);
          gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth + Math.max(48, window.innerWidth * 0.08)),
            ease: "none",
            scrollTrigger: {
              id: "landing-industries",
              trigger: industryRef.current,
              pin,
              pinType: "transform",
              start: "top top",
              end: `+=${LANDING_MOTION.industryScroll}`,
              scrub: LANDING_MOTION.scrub,
              invalidateOnRefresh: true,
              // İkinci pin: featured'ın spacer'ı yerindeyken ölçmelidir.
              refreshPriority: 2,
              onRefresh: (self) => {
                industryRangeRef.current = { start: self.start, end: self.end };
              },
              onUpdate: (self) => {
                industryRangeRef.current = { start: self.start, end: self.end };
                const active = Math.min(cards.length - 1, Math.round(self.progress * (cards.length - 1)));
                if (active === activeIndustryRef.current) return;
                activeIndustryRef.current = active;
                setActiveIndustry(active);
              },
            },
          });
        }
        return () => {
          storyEls.forEach((story) => {
            story.removeAttribute("aria-hidden");
            story.querySelectorAll<HTMLElement>("a, button").forEach((control) => control.removeAttribute("tabindex"));
          });
          cards.forEach((card) => {
            card.removeAttribute("aria-hidden");
            card.removeAttribute("tabindex");
          });
          industryJumps.forEach((jump) => jump.removeAttribute("aria-current"));
        };
      });
      return () => media.revert();
      }, root);
      cleanupMotion = () => context.revert();
      ScrollTrigger.refresh();
      window.requestAnimationFrame(() => {
        if (!cancelled) root.dataset.motionReady = "true";
      });
    };
    const motionEvents = ["scroll", "wheel", "touchstart", "pointerdown", "keydown", "focusin"] as const;
    const removeMotionListeners = () => {
      motionEvents.forEach((eventName) => window.removeEventListener(eventName, requestMotion));
    };
    const requestMotion = () => {
      removeMotionListeners();
      void setupMotion();
    };
    if (naturalFlow) void setupMotion();
    else if (motionRequestedRef.current || window.scrollY > 48) requestMotion();
    else motionEvents.forEach((eventName) => window.addEventListener(eventName, requestMotion, { passive: true, once: true }));

    const observers = [...root.querySelectorAll<HTMLElement>("[data-lf-media-zone]")].map((zone) => {
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        zone.querySelectorAll<HTMLImageElement>("img[data-lf-deferred]").forEach((image) => {
          const source = image.dataset.src;
          if (source) image.src = source;
          image.removeAttribute("data-lf-deferred");
          image.removeAttribute("data-src");
        });
        observer.disconnect();
      }, { rootMargin: "600px 0px" });
      observer.observe(zone);
      return observer;
    });
    return () => {
      cancelled = true;
      removeMotionListeners();
      observers.forEach((observer) => observer.disconnect());
      industryRangeRef.current = null;
      delete root.dataset.motionReady;
      cleanupMotion();
    };
  }, [prefersReduced, renderPhase]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const keepFocusVisible = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        const margin = 72;
        if (rect.top >= margin && rect.bottom <= window.innerHeight - margin) return;
        const destination = window.scrollY + rect.top - Math.max(margin, (window.innerHeight - rect.height) / 2);
        if (window.__lenis) window.__lenis.scrollTo(destination, { immediate: true });
        else window.scrollTo({ top: destination, behavior: "auto" });
      });
    };
    root.addEventListener("focusin", keepFocusVisible);
    return () => root.removeEventListener("focusin", keepFocusVisible);
  }, []);

  const scrollToStory = (index: number, immediate = false) => {
    const section = featuredRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const target = top + (index / Math.max(1, stories.length - 1)) * LANDING_MOTION.featuredScroll;
    if (window.__lenis) window.__lenis.scrollTo(target, { immediate });
    else window.scrollTo({ top: target, behavior: immediate || prefersReduced ? "auto" : "smooth" });
  };

  const scrollToIndustry = (index: number, immediate = false) => {
    const section = industryRef.current;
    if (!section || window.matchMedia("(max-width: 768px), (max-height: 600px), (pointer: coarse)").matches) return;
    const progress = index / Math.max(1, industries.length - 1);
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const start = industryRangeRef.current?.start ?? sectionTop;
    const end = industryRangeRef.current?.end ?? start + LANDING_MOTION.industryScroll;
    const target = start + progress * (end - start);
    if (window.__lenis) window.__lenis.scrollTo(target, { immediate });
    else window.scrollTo({ top: target, behavior: immediate || prefersReduced ? "auto" : "smooth" });
  };

  return (
    <div ref={rootRef} className="lf-root">
      <section id="top" className="lf-hero" data-surface="dark">
        <img className="lf-hero-media" src={cncImage} alt="" width="1920" height="1088" fetchPriority="high" decoding="async" />
        <div className="lf-hero-shade" />
        <div className="lf-hero-top">
          <span>PRECISION MANUFACTURING · 2026</span>
          <span>İZMİR · TÜRKİYE</span>
        </div>
        <h1 className="lf-hero-title" aria-label="MAS Technic">
          <span>MAS</span>
          <span>TECHNIC</span>
        </h1>
        <div className="lf-hero-bottom">
          <p>Fikirden doğrulanmış parçaya.<br />Tek üretim akışı.</p>
          <Link to="/teklif-al" data-cursor="teklif">CAD dosyanı yükle <ArrowRight /></Link>
          <span className="lf-scroll-cue">KEŞFET <ArrowDown /></span>
        </div>
      </section>

      <div className="lf-marquee" aria-label="Üretim yetkinlikleri">
        <div>{[0, 1].map((copy) => <span key={copy}>CNC FREZELEME ✳ TORNALAMA ✳ MİKRO İŞLEME ✳ YÜZEY İŞLEMLERİ ✳ KALİTE KONTROL ✳ </span>)}</div>
      </div>

      {renderPhase >= 1 && <div className="lf-manifesto" aria-label="Üretim yaklaşımı">
        <div className="lf-kicker" data-lf-reveal><span>01</span> YAKLAŞIM</div>
        <div className="lf-manifesto-grid">
          <h2 data-lf-reveal data-lf-cuttext>Hassas üretim,<br /><em>ölçülebilir kalite.</em></h2>
          <div className="lf-manifesto-copy" data-lf-reveal>
            <p>Her parçayı yalnız üretilecek bir geometri olarak değil; malzeme, tolerans, proses ve doğrulama kararlarının birlikte çalıştığı bir sistem olarak ele alıyoruz.</p>
            <Link to="/hakkimizda">Üretim yaklaşımımız <MoveRight /></Link>
          </div>
        </div>
      </div>}

      {renderPhase >= 2 ? <section id="hizmetler" ref={featuredRef} className="lf-featured" data-surface="dark" data-lf-media-zone>
        <div ref={featuredPinRef} className="lf-featured-pin">
          <div className="lf-featured-head">
            <div className="lf-kicker"><span>02</span> SEÇİLİ HİZMETLER</div>
            <span className="lf-featured-count">05 ÜRETİM AİLESİ</span>
          </div>
          <div className="lf-featured-layout">
            <nav aria-label="Hizmet hikâyeleri">
              {stories.map((story, index) => (
                <button type="button" className="lf-story-nav" aria-controls={story.id} aria-current={index === 0 && pinnedLayout ? "step" : undefined} data-active={index === 0 ? "" : undefined} onClick={() => scrollToStory(index)} onFocus={() => scrollToStory(index, true)} key={story.id}>
                  <small>{story.index}</small><span>{story.title}</span>
                </button>
              ))}
              <i aria-hidden="true"><b /></i>
            </nav>
            <div className="lf-story-stage">
              {stories.map((story, storyIndex) => (
                <article id={story.id} className="lf-story" aria-hidden={pinnedLayout && storyIndex > 0 ? "true" : undefined} key={story.id}>
                  <img
                    src={storyIndex === 0 ? story.image : undefined}
                    data-src={storyIndex === 0 ? undefined : story.image}
                    data-lf-deferred={storyIndex === 0 ? undefined : ""}
                    alt={`${story.title} üretim süreci`}
                    width="1920"
                    height="1080"
                    loading={storyIndex === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <div className="lf-story-overlay" />
                  <div className="lf-story-content">
                    <span>{story.index} / 05</span>
                    <h3>{story.title}</h3>
                    <p>{story.summary}</p>
                    <div>{story.detailLinks.slice(0, 4).map((link) => <Link key={link.path} to={link.path} tabIndex={pinnedLayout && storyIndex > 0 ? -1 : undefined}>{link.label}</Link>)}</div>
                    <Link className="lf-story-cta" to={story.categoryPath} data-cursor="open" tabIndex={pinnedLayout && storyIndex > 0 ? -1 : undefined}>Kategoriyi incele <ArrowRight /></Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section> : <section id="hizmetler" ref={featuredRef} className="lf-featured lf-deferred-placeholder" data-surface="dark" aria-label="Hizmetler yükleniyor" />}

      {renderPhase >= 3 ? <section id="endustriler" ref={industryRef} className="lf-industries" data-surface="dark" data-lf-media-zone>
        <div ref={industryPinRef} className="lf-industries-pin">
          <div className="lf-industries-head">
            <div className="lf-kicker"><span>03</span> ÇALIŞTIĞIMIZ ENDÜSTRİLER</div>
            <div className="lf-industry-status">
              <div className="lf-industry-nav" aria-label="Endüstri vitrini">
                {industries.map((industry, index) => (
                  <button
                    type="button"
                    className="lf-industry-jump"
                    aria-label={`${industry.title} kartını göster`}
                    aria-current={index === 0 && pinnedLayout ? "step" : undefined}
                    onClick={() => scrollToIndustry(index)}
                    onFocus={() => scrollToIndustry(index, true)}
                    key={industry.path}
                  >
                    {industry.index}
                  </button>
                ))}
              </div>
              <span ref={industryCounterRef} aria-live="polite" aria-atomic="true">01 / 05</span>
            </div>
          </div>
          <div ref={industryTrackRef} className="lf-industry-track">
            {industries.map((industry, index) => (
              <Link to={industry.path} className="lf-industry-card" aria-hidden={pinnedLayout && index > 0 ? "true" : undefined} tabIndex={pinnedLayout && index > 0 ? -1 : undefined} data-active={index === 0 ? "" : undefined} data-cursor="open" key={industry.path}>
                <img src={index === 0 ? industry.image : undefined} data-src={index === 0 ? undefined : industry.image} data-lf-deferred={index === 0 ? undefined : ""} alt={`${industry.title} üretimi`} width="800" height="640" loading="lazy" decoding="async" />
                <span>{industry.index}</span>
                <div><small>{industry.meta}</small><h3>{industry.title}</h3></div>
              </Link>
            ))}
          </div>
        </div>
      </section> : <section id="endustriler" ref={industryRef} className="lf-industries lf-deferred-placeholder" data-surface="dark" aria-label="Endüstriler yükleniyor" />}

      {renderPhase >= 4 ? <>
        <MaterialsIntelligence />
        <ProcessProofCinema />
      </> : <>
        <section id="malzemeler" className="lf-restored lf-deferred-placeholder" data-surface="light" aria-label="Malzemeler yükleniyor" />
        <section id="neden-biz" className="lf-restored lf-deferred-placeholder" data-surface="dark" aria-label="Neden biz yükleniyor" />
        <section id="kabiliyetler" className="lf-restored lf-deferred-placeholder" data-surface="dark" aria-label="Kabiliyetler yükleniyor" />
      </>}

      {renderPhase >= 5 ? <>
        <TrustProof />
        <DecisionSupport />
      </> : <>
        <section id="referanslar" className="lf-restored lf-deferred-placeholder" data-surface="dark" aria-label="Referanslar yükleniyor" />
        <section id="sss" className="lf-restored lf-deferred-placeholder" data-surface="light" aria-label="Sık sorulan sorular yükleniyor" />
      </>}

      {renderPhase >= 5 ? <section id="iletisim" className="lf-cta" data-surface="dark">
        <div className="lf-kicker"><span>09</span> BİRLİKTE ÜRETELİM</div>
        <h2 data-lf-reveal data-lf-sheen>Bir sonraki parçanız<br /><em>üretime hazır mı?</em></h2>
        <div data-lf-reveal>
          <p>CAD dosyanızı paylaşın. Teknik ekibimiz üretilebilirlik, termin ve fiyatlandırma için projenizi incelesin.</p>
          <Link to="/teklif-al" data-cursor="teklif">Projeni başlat <ArrowRight /></Link>
        </div>
      </section> : <section id="iletisim" className="lf-cta lf-deferred-placeholder" data-surface="dark" aria-label="İletişim yükleniyor" />}
    </div>
  );
}
