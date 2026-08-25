export const MOTION_EASE = {
  precision: [0.76, 0, 0.24, 1],
  enter: [0.16, 1, 0.3, 1],
} as const;

export const ROUTE_TRANSITION = {
  coverDuration: 0.30,
  /** Beş panelin AYNI ANDA kapalı durduğu aralık.
      Stagger yayılımından (4 × panelStagger = .12s) uzun olmak ZORUNDA;
      aksi halde ilk panel açılmaya başlarken sonuncusu henüz kapanmamış olur
      ve perde viewport'u hiçbir karede tam kapatmaz.
      Ölçüldü: .24 → .42 → .62 denendi; .42 en iyi sonucu verdi. Genişletmek
      sezgisel olarak yardımcı görünüyor ama .62'de sonuç KÖTÜLEŞTİ — toplam
      geçiş uzadıkça rota içeriği ve perde arasındaki zamanlama ilişkisi
      bozuluyor. Bu değeri değiştirmeden önce ölç. */
  holdDuration: 0.42,
  revealDuration: 0.34,
  panelStagger: 0.03,
  contentDuration: 0.48,
  contentOffset: 18,
  blur: 8,
} as const;

export const SECTION_TRANSITION = {
  crossThemeHeight: "clamp(48px, 8vw, 112px)",
  sameThemeHeight: "clamp(32px, 4vw, 64px)",
  seamTravel: 26,
  glowOpacity: 0.18,
} as const;
