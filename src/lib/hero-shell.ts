/**
 * `#hero-shell` yaşam döngüsü — tek kaynak.
 *
 * UX01: `index.html` artık ne app-shell'i ne de "Precision Born" giriş
 * sekansını taşıyor; `data-intro-active` hiç kurulmuyor ve `mas:intro-done`
 * hiç yayınlanmıyor. Bu modül yine de duruyor, çünkü:
 *   · eski bir önbellekten gelen `index.html` hâlâ shell'i taşıyorsa onu
 *     anında kaldırır (aşağıdaki "sekans hiç kurulmadı" dalı),
 *   · `Header.tsx` ve `App.tsx` aynı sorguyu kullanıyor; shell yokken
 *     `isHeroIntroActive()` her zaman `false` döner ve hiçbir şey beklemez.
 * Yeni bir bekletme davranışı EKLENMEMELİ: sözleşme, bilginin ve CTA'nın
 * hiçbir girişi beklememesini istiyor.
 */

export const HERO_SHELL_ID = "hero-shell";
export const INTRO_DONE_EVENT = "mas:intro-done";

const INTRO_ACTIVE_ATTR = "data-intro-active";
const INTRO_ATTR = "data-intro";

/**
 * `index.html` koreografisinin en kötü hâli: tavan 5200 ms + `done` fazı 420 ms
 * + çapraz geçiş 620 ms = 6240 ms. Ağ olayı hiç gelmezse bu süre sonunda
 * shell koşulsuz kaldırılır; kullanıcı hiçbir senaryoda kilitlenmez.
 */
export const HERO_SHELL_TEARDOWN_FALLBACK_MS = 7000;

/** Giriş sekansı gerçekten çalışıyor mu? (Elemanın sadece var olması yetmez.) */
export function isHeroIntroActive(): boolean {
  if (typeof document === "undefined") return false;
  const shell = document.getElementById(HERO_SHELL_ID);
  if (!shell || !shell.hasAttribute(INTRO_ATTR)) return false;
  return document.documentElement.hasAttribute(INTRO_ACTIVE_ATTR);
}

/** Shell'i ve geride kalan intro durumunu DOM'dan kaldırır. Idempotent. */
export function removeHeroShell(): void {
  if (typeof document === "undefined") return;
  document.getElementById(HERO_SHELL_ID)?.remove();
  document.documentElement.removeAttribute(INTRO_ACTIVE_ATTR);
}

/**
 * Teardown'u kurar. `src/main.tsx` içinden, React render edilmeden önce bir
 * kez çağrılır. Dönen fonksiyon dinleyicileri söker (test/HMR için).
 */
export function installHeroShellTeardown(): () => void {
  if (typeof document === "undefined") return () => {};

  const shell = document.getElementById(HERO_SHELL_ID);
  if (!shell) {
    document.documentElement.removeAttribute(INTRO_ACTIVE_ATTR);
    return () => {};
  }

  // Sekans hiç kurulmadı: landing dışı rota, `prefers-reduced-motion` ya da
  // oturumda zaten görülmüş. Shell'in bekleyecek bir devri yok.
  if (!shell.hasAttribute(INTRO_ATTR)) {
    removeHeroShell();
    return () => {};
  }

  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    document.removeEventListener(INTRO_DONE_EVENT, finish);
    window.clearTimeout(timer);
    removeHeroShell();
  };

  // Yarış koşulu ağı: olay bu modül değerlendirilmeden önce yayınlandıysa
  // `data-intro-active` çoktan kalkmış olur.
  if (!document.documentElement.hasAttribute(INTRO_ACTIVE_ATTR)) {
    removeHeroShell();
    return () => {};
  }

  document.addEventListener(INTRO_DONE_EVENT, finish);
  const timer = window.setTimeout(finish, HERO_SHELL_TEARDOWN_FALLBACK_MS);

  return () => {
    document.removeEventListener(INTRO_DONE_EVENT, finish);
    window.clearTimeout(timer);
  };
}
