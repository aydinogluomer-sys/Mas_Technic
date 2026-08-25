import { useEffect, type RefObject } from "react";

export interface InViewClassTarget {
  /** Kök içinde aranacak seçici */
  selector: string;
  /** Görünüre girince eklenecek sınıf */
  className: string;
  /**
   * Eleman ekrana yaklaşırken (henüz görünür değilken) eklenen hazırlık sınıfı.
   * Clip-path gibi "önce gizle, sonra aç" efektleri için gerekli.
   *
   * Başlangıç durumu bilerek CSS'e gömülmüyor: sınıf yoksa içerik normal
   * görünür, yani JS hiç çalışmasa bile metin kaybolmaz.
   */
  armClassName?: string;
}

/**
 * Hedefler görünüre girdiğinde bir kez sınıf ekler, sonra gözlemi bırakır.
 *
 * Landing'de GSAP yalnız masaüstünde yükleniyor (mobil `naturalFlow` yolunda hiç
 * import edilmiyor). Bu yüzden her breakpoint'te çalışması gereken efektler
 * GSAP'a değil, IntersectionObserver + CSS'e dayanıyor.
 *
 * Reduced-motion'da da çağrılır: sınıfın kendisi zararsız, ilgili CSS kuralı
 * hareketi kapatıp final durumu veriyor (eleman asla `opacity:0`'da kalmaz).
 */
/**
 * Sınıfı eleman gerçekten görünür olduğunda ekler.
 *
 * Aynı elemanda `data-lf-reveal` da olabilir: onun GSAP animasyonu elemanı
 * `opacity:0`'dan getiriyor ve IntersectionObserver ondan önce tetikleniyor.
 * Doğrudan sınıf eklenirse efekt görünmez bir elemanda oynayıp biter (ölçüldü).
 * Bu yüzden opaklık eşiği geçene kadar bekliyoruz; mobilde ve reduced-motion'da
 * eleman zaten opak olduğu için bu ilk karede geçer.
 */
/**
 * Elemanın ekranda gerçekten göründüğü opaklık: kendi değeri değil, atalarıyla
 * çarpımı. GSAP reveal'i çoğu yerde parent'a (`<header data-lf-reveal>`)
 * uygulanıyor; yalnız elemanın kendi `opacity`'sine bakılsaydı 1 okunur ve
 * efekt şeffaf bir kapsayıcının içinde oynayıp biterdi.
 */
function effectiveOpacity(element: HTMLElement) {
  let node: HTMLElement | null = element;
  let opacity = 1;
  while (node && node !== document.body) {
    opacity *= Number.parseFloat(getComputedStyle(node).opacity) || 0;
    if (opacity < 0.9) return opacity;
    node = node.parentElement;
  }
  return opacity;
}

function armWhenVisible(
  element: HTMLElement,
  className: string,
  armClassName: string | undefined,
) {
  let frames = 0;
  const tick = () => {
    if (!element.isConnected) return;
    const opaque = effectiveOpacity(element) >= 0.9;
    // ~2 sn üst sınır: reveal hiç çalışmazsa efekt yine de kaybolmasın.
    if (opaque || frames > 120) {
      element.classList.add(className);
      // Efekt bitince sınıflar kaldırılır: efekt geçici, dinlenme durumu metnin
      // DOĞAL stili olmalı. Aksi halde `-webkit-text-fill-color` (kalıtılan bir
      // özellik) son karede hesaplanan değerde takılı kalıyor ve içerideki <em>
      // kendi bakır vurgusunu kaybediyordu (ölçüldü). Ayrıca kalıcı
      // `background-clip:text` boyama maliyetini de kaldırır.
      element.addEventListener(
        "animationend",
        (event) => {
          if (event.target !== element) return;
          element.classList.remove(className);
          if (armClassName) element.classList.remove(armClassName);
        },
        { once: true },
      );
      return;
    }
    frames += 1;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function useInViewClass(
  rootRef: RefObject<HTMLElement>,
  targets: readonly InViewClassTarget[],
  /**
   * Değiştiğinde DOM yeniden taranır. Landing bölümleri `renderPhase` ile
   * kademeli mount olduğu için gerekli: ilk taramada hedefler henüz yoktur.
   */
  revision = 0,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const observers = targets.flatMap(({ selector, className, armClassName }) => {
      const nodes = [...root.querySelectorAll<HTMLElement>(selector)];
      if (!nodes.length) return [];

      // Hazırlık: eleman alttan yaklaşırken kurulur, böylece kullanıcı
      // "görünür → gizlenir → açılır" sıçramasını görmez.
      let armObserver: IntersectionObserver | null = null;
      if (armClassName) {
        armObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add(armClassName);
              armObserver?.unobserve(entry.target);
            });
          },
          { rootMargin: "0px 0px 45% 0px" },
        );
        nodes.forEach((node) => armObserver?.observe(node));
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            armWhenVisible(entry.target as HTMLElement, className, armClassName);
          });
        },
        { rootMargin: "0px 0px -12% 0px" },
      );

      nodes.forEach((node) => observer.observe(node));
      return armObserver ? [armObserver, observer] : [observer];
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, [rootRef, targets, revision]);
}
