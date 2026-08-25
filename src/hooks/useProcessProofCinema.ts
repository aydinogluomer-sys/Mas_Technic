import { useEffect, type RefObject } from "react";
import { LANDING_MOTION } from "@/config/landing-motion";
import { usePrefersReducedMotion } from "./use-reduced-motion";

const desktopQuery = "(min-width: 769px) and (min-height: 601px) and (pointer: fine)";
/**
 * Medya figürlerinin "dinlenme" (tam ekran, yerinde) durumu.
 */
const MEDIA_REST = { xPercent: 0, yPercent: 0, scale: 1, opacity: 1, clipPath: "inset(0px)" } as const;

/**
 * Aşamalar arası geçişler — her biri farklı bir sinema dili.
 *
 * Önceden beş aşamanın beşi de tek bir dikey perde kullanıyordu. Sıra artık
 * anlatıya bağlı seçiliyor — her geçiş o adımın üretimdeki karşılığını taklit eder:
 *
 *   01→02 değerlendirme → malzeme : yukarıdan aşağı perde
 *                                  ham blok depodan iner, tezgaha yerleşir
 *   02→03 malzeme → imalat     : sert yatay kesim, sağdan sola
 *                                  itme "slayt"tır, kesim "talаş" — bu yüzden
 *                                  xPercent değil clip-path: kenar bıçak gibi olsun
 *   03→04 imalat → yüzey       : küçük çerçeveden tam ekrana açılma
 *                                  önce kaplanmış yüzeyin detayına bakılır, sonra parça
 *   04→05 yüzey → doğrulama    : zoom-out
 *                                  parçadan geri çekilme; artık parçaya değil veriye bakılıyor
 *
 * `enter` gelen figürün BAŞLANGIÇ durumu, `leave` gidenin HEDEF durumu.
 * Figürler DOM sırasına göre üst üste yığılı; gelen her zaman üstte olduğu için
 * asıl geçişi `enter` taşır, `leave` yalnız derinlik hissi verir.
 *
 * Her `enter` `opacity: 0` ile başlar: aksi halde henüz sırası gelmemiş bir figür
 * (örn. ortada küçük bir çerçeve olarak duran 03) alttakileri örterdi.
 *
 * `ease` / `duration` opsiyonel; verilmezse ortak değer kullanılır.
 *
 * Yalnız masıüstü + tam hareket dalında çalışır (yukarıdaki erken çıkışa bak).
 */
const MEDIA_TRANSITIONS = [
  // 01→02 — yukarıdan aşağı perde
  {
    enter: { ...MEDIA_REST, opacity: 0, scale: 1.05, clipPath: "inset(0px 0px 100% 0px)" },
    leave: { yPercent: 7, opacity: 0.25 },
  },
  // 02→03 — sert yatay kesim (sağdan sola). Kısa ve keskin: talаş kaldırma anı.
  {
    enter: { ...MEDIA_REST, opacity: 0, clipPath: "inset(0px 0px 0px 100%)" },
    leave: { xPercent: -14, opacity: 0.3 },
    ease: "power4.inOut",
    duration: 0.085,
  },
  // 03→04 — küçük çerçeveden tam ekrana.
  // Oran tam ekrana göre yeniden hesaplandı: eski 37%/29% değerleri kutulanmış
  // düzende dengeliydi, tam kanamada mektup kutusu gibi bir şerit bırakıyordu.
  {
    enter: { ...MEDIA_REST, opacity: 0, scale: 1.22, clipPath: "inset(31% 33% 31% 33%)" },
    leave: { scale: 1.1, opacity: 0.3 },
  },
  // 04→05 — zoom-out
  {
    enter: { ...MEDIA_REST, opacity: 0, scale: 1.65 },
    leave: { scale: 0.94, opacity: 0.2 },
  },
] as const;

const stageProgressStart = 0.16;
const stageProgressEnd = 0.9;

export function useProcessProofCinema(rootRef: RefObject<HTMLElement>) {
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const stages = [...root.querySelectorAll<HTMLElement>("[data-process-stage]")];
    const triggers = [...root.querySelectorAll<HTMLElement>("[data-process-stage-trigger]")];
    const proofs = [...root.querySelectorAll<HTMLElement>("[data-process-proof]")];
    const media = [...root.querySelectorAll<HTMLElement>("[data-process-media]")];
    const pin = root.querySelector<HTMLElement>("[data-process-pin]");
    if (!stages.length || !pin) return;

    let cancelled = false;
    let cleanup = () => {};
    let removeInteractions = () => {};
    let activeIndex = -1;
    let interactionIndex: number | null = null;
    let interactionLockUntil = 0;
    let interactionTimer: number | undefined;
    let jumpTo = (index: number) => setActive(index, true);

    const setActive = (index: number, desktop: boolean) => {
      const next = Math.max(0, Math.min(stages.length - 1, index));
      if (desktop && next === activeIndex) return;
      activeIndex = next;
      root.dataset.processProgress = String(next / Math.max(1, stages.length - 1));

      [stages, proofs, media].forEach((group) => group.forEach((element, itemIndex) => {
        const active = itemIndex === next;
        element.toggleAttribute("data-active", active);
        if (desktop) element.setAttribute("aria-hidden", active ? "false" : "true");
        else element.removeAttribute("aria-hidden");
        element.querySelectorAll<HTMLElement>("a, button").forEach((control) => {
          if (desktop && !active) control.tabIndex = -1;
          else control.removeAttribute("tabindex");
        });
      }));

      triggers.forEach((trigger, itemIndex) => {
        if (itemIndex === next) trigger.setAttribute("aria-current", "step");
        else trigger.removeAttribute("aria-current");
      });
    };

    if (prefersReduced || !window.matchMedia(desktopQuery).matches) {
      setActive(0, false);
      stages.forEach((stage) => stage.setAttribute("data-active", ""));
      proofs.forEach((proof) => proof.setAttribute("data-active", ""));
      media.forEach((item) => item.setAttribute("data-active", ""));
      return;
    }

    // Navigation and accessible state must not wait for the GSAP chunk.
    setActive(0, true);
    // Klavye erişilebilirliği: bir aşamanın kendi bağlantısına sekmeyle gelen
    // kullanıcı o aşamanın GÖRÜNMESİNİ bekler. Aksi halde odak, `opacity:0` ve
    // `pointer-events:none` olan pasif bir aşamanın içine düşüyor ve bağlantı
    // aktif aşamanın altında kalıyordu (ölçüldü: dar masaüstünde CTA "obscured").
    const stageFocusCleanups = stages.map((stage, index) => {
      const focusIn = () => {
        // Rail tıklamasıyla aynı kilit: odaklanma tarayıcıyı kaydırır, kaydırma
        // scrub'ı ilerletir ve `onUpdate` seçimi hemen geri alarak aşamayı yine
        // gizlerdi. Kısa kilit, odak yerleşene kadar seçimi korur.
        interactionIndex = index;
        interactionLockUntil = performance.now() + 600;
        setActive(index, true);
      };
      stage.addEventListener("focusin", focusIn);
      return () => stage.removeEventListener("focusin", focusIn);
    });

    const listeners = triggers.map((trigger, index) => {
      const activateAndJump = (event: Event) => {
        event.preventDefault();
        interactionIndex = index;
        interactionLockUntil = performance.now() + 600;
        window.clearTimeout(interactionTimer);
        interactionTimer = window.setTimeout(() => {
          interactionIndex = null;
          interactionLockUntil = 0;
        }, 600);
        setActive(index, true);
        jumpTo(index);
      };
      const preview = () => {
        interactionIndex = index;
        setActive(index, true);
        media.forEach((item, itemIndex) => {
          const active = itemIndex === index;
          const computed = getComputedStyle(item);
          // Rail önizlemesi aşamaya özel sinematik geçişi tekrarlamaz; anlık geri
          // bildirim için sade bir crossfade yeter. Scroll sürdüğünde timeline
          // zaten kendi durumunu yeniden yazar.
          const target = {
            opacity: active ? "1" : "0",
            clipPath: "inset(0px)",
            transform: active ? "scale(1)" : `scale(${LANDING_MOTION.processMediaScale})`,
          };
          item.getAnimations().forEach((animation) => animation.cancel());
          item.animate([
            { opacity: computed.opacity, clipPath: computed.clipPath, transform: computed.transform },
            target,
          ], {
            duration: LANDING_MOTION.processSwapDuration * 1000,
            easing: "cubic-bezier(.22,1,.36,1)",
          });
          Object.assign(item.style, target);
        });
      };
      const releasePreview = () => {
        window.setTimeout(() => {
          if (performance.now() >= interactionLockUntil && document.activeElement !== trigger) {
            interactionIndex = null;
          }
        }, 80);
      };
      const releaseFocus = () => {
        if (performance.now() >= interactionLockUntil) interactionIndex = null;
      };
      trigger.addEventListener("click", activateAndJump);
      trigger.addEventListener("focus", activateAndJump);
      trigger.addEventListener("pointerenter", preview);
      trigger.addEventListener("pointerleave", releasePreview);
      trigger.addEventListener("blur", releaseFocus);
      return () => {
        trigger.removeEventListener("click", activateAndJump);
        trigger.removeEventListener("focus", activateAndJump);
        trigger.removeEventListener("pointerenter", preview);
        trigger.removeEventListener("pointerleave", releasePreview);
        trigger.removeEventListener("blur", releaseFocus);
      };
    });
    removeInteractions = () => {
      listeners.forEach((remove) => remove());
      stageFocusCleanups.forEach((remove) => remove());
    };

    void import("@/hooks/use-gsap").then(({ gsap }) => {
      if (cancelled) return;
      const processRail = root.querySelector<HTMLElement>("[data-process-rail]");
      const heading = root.querySelector<HTMLElement>(".ppc-header h2");
      const stripes = gsap.utils.toArray<HTMLElement>(".ppc-stripe", root);

      const context = gsap.context(() => {
        // Her figür kendi giriş-öncesi durumuna kurulur (artık ortak değil).
        media.forEach((item, index) => {
          gsap.set(item, index === 0 ? MEDIA_REST : MEDIA_TRANSITIONS[index - 1].enter);
        });
        // Parallax için pay: görsel kapsayıcıdan biraz büyük dursun ki kayarken
        // kenarlarda boşluk açılmasın.
        const mediaImages = media
          .map((item) => item.querySelector<HTMLElement>("img"))
          .filter((image): image is HTMLElement => !!image);
        gsap.set(mediaImages, { scale: 1.12 });

        const timeline = gsap.timeline({
          scrollTrigger: {
            id: "process-proof-cinema",
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: LANDING_MOTION.processScrub,
            invalidateOnRefresh: true,
            // Bu bölüm hiç pin-spacer ÜRETMEZ, yalnız TÜKETİR: üstteki iki pin'in
            // spacer'ları yerindeyken ölçülmeli. GSAP `refreshPriority` bulunmayan
            // projelerde `_sort` bayrağını hiç açmıyor (ScrollTrigger.js:1036-1038),
            // dolayısıyla `ScrollTrigger.sort()` atlanıyor (:497) ve trigger'lar
            // OLUŞTURMA SIRASIYLA yenileniyordu (:507). Bu bölüm renderPhase 4'te,
            // pinler renderPhase 5'te kurulduğu için burada hep ilk sıradaydı ve
            // her yenilemede `_revertAll()` spacer'ları sökmüşken ölçülüyordu:
            // start/end 1250+900 = 2150 px eksik kilitleniyor, beş aşamalı sahne
            // bölüm ekrana gelmeden bitiyordu (ölçüldü).
            // NEGATİF değer: sıralama `(pri || 0) * -1e6 + _sortY` (:2647); 0 verilseydi
            // kendi yanlış ölçülmüş `_sortY`'sine düşerdi. -9999 kullanılmaz (ScrollSmoother rezerve).
            refreshPriority: -1,
            onUpdate: (self) => {
              root.dataset.processProgress = self.progress.toFixed(4);
              const externalIndex = Number.parseInt(root.dataset.processInteraction ?? "", 10);
              const stageProgress = Math.max(0, Math.min(1,
                (self.progress - stageProgressStart) / (stageProgressEnd - stageProgressStart),
              ));
              setActive(
                (Number.isFinite(externalIndex) ? externalIndex : interactionIndex)
                  ?? Math.round(stageProgress * (stages.length - 1)),
                true,
              );
            },
          },
        });

        if (stripes.length) {
          timeline.fromTo(stripes, { scaleY: 1 }, {
            scaleY: 0,
            transformOrigin: "top",
            stagger: 0.025,
            duration: 0.08,
            ease: "power3.inOut",
          }, 0);
        }
        if (heading) {
          timeline.fromTo(heading, {
            filter: `blur(${LANDING_MOTION.processHeadingBlur}px)`,
            opacity: 0.35,
          }, {
            filter: "blur(0px)",
            opacity: 1,
            duration: 0.08,
            ease: "power2.out",
          }, 0.08);
        }
        if (processRail) timeline.fromTo(processRail, { y: LANDING_MOTION.processRailOffset }, { y: -LANDING_MOTION.processRailOffset, ease: "none", duration: 1 }, 0);
        // Parallax: görseller kapsayıcılarından farklı hızda süzülür.
        if (mediaImages.length) {
          timeline.fromTo(mediaImages,
            { yPercent: -5 },
            { yPercent: 5, ease: "none", duration: 1 },
            0);
        }

        const { opacity: _restOpacity, ...MEDIA_REST_NO_OPACITY } = MEDIA_REST;
        media.slice(1).forEach((item, index) => {
          const position = (index + 1) / (media.length - 1);
          const at = Math.max(0, position - 0.055);
          const step = MEDIA_TRANSITIONS[index];
          const leave = step.leave;
          const duration = "duration" in step ? step.duration : 0.11;
          const ease = "ease" in step ? step.ease : "none";
          timeline
            .to(media[index], { ...leave, duration, ease }, at)
            // Opaklik geçişin başında hızla açılır; asıl anlatıyı clip/transform taşır.
            .to(item, { opacity: 1, duration: 0.028, ease: "none" }, at)
            .to(item, { ...MEDIA_REST_NO_OPACITY, duration, ease }, at);
        });

        jumpTo = (index: number) => {
          const scrollTrigger = timeline.scrollTrigger;
          if (!scrollTrigger) return;
          const stageProgress = stageProgressStart
            + (index / Math.max(1, stages.length - 1)) * (stageProgressEnd - stageProgressStart);
          const destination = scrollTrigger.start
            + stageProgress * (scrollTrigger.end - scrollTrigger.start);
          setActive(index, true);
          if (window.__lenis) window.__lenis.scrollTo(destination, { immediate: true });
          else window.scrollTo({ top: destination, behavior: "smooth" });
        };
      }, root);

      cleanup = () => {
        removeInteractions();
        context.revert();
      };
    });

    return () => {
      cancelled = true;
      window.clearTimeout(interactionTimer);
      media.forEach((item) => item.getAnimations().forEach((animation) => animation.cancel()));
      cleanup();
      delete root.dataset.processProgress;
      delete root.dataset.processInteraction;
    };
  }, [prefersReduced, rootRef]);
}
