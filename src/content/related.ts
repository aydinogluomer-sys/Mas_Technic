/* ══════════════════════════════════════════════════════════════════════════
   CURATED RELATED PAGES (PAGE01)

   Hand-checked, at most four per detail page, across families when the
   reader's next question lives in another family (a sector page points at the
   services its parts are made with). Replaces "the first eight of the same
   family". Every slug here must exist — `e2e/p4-visuals-modules.spec.ts`.
   ══════════════════════════════════════════════════════════════════════════ */

export const RELATED: Record<string, readonly string[]> = {
  /* ── Hizmetler ── */
  "cnc-frezeleme": ["cnc-tornalama", "fikstur-aparat-tasarimi", "tolerans-hassasiyet", "tasarim-rehberi-dfm"],
  "cnc-tornalama": ["cnc-frezeleme", "derin-delik-raybalama", "hassas-mikro-isleme", "kalite-kontrol"],
  "hassas-mikro-isleme": ["cnc-tornalama", "medikal", "kalite-kontrol", "tolerans-hassasiyet"],
  "derin-delik-raybalama": ["hidrolik-pnomatik", "cnc-tornalama", "kalite-kontrol", "enjeksiyon-kalibi"],
  "enjeksiyon-kalibi": ["basincli-dokum", "silikon-kaliplama", "tasarim-rehberi-dfm", "seri-imalat"],
  "basincli-dokum": ["enjeksiyon-kalibi", "cnc-frezeleme", "seri-imalat", "mekanik-yuzey-islemleri"],
  "silikon-kaliplama": ["prototip-uretim", "dusuk-hacimli-uretim", "enjeksiyon-kalibi", "kucuk-seri"],
  "fikstur-aparat-tasarimi": ["cnc-frezeleme", "kalite-kontrol", "mekanik-montaj", "seri-imalat"],
  "mekanik-yuzey-islemleri": ["anodizasyon", "boya-koruyucu-kaplamalar", "yuzey-islemleri-muhendislik", "kimyasal-islemler"],
  "anodizasyon": ["yuzey-islemleri-muhendislik", "kimyasal-islemler", "mekanik-yuzey-islemleri", "lazer-kazima"],
  "kimyasal-islemler": ["anodizasyon", "boya-koruyucu-kaplamalar", "yuzey-islemleri-muhendislik", "medikal"],
  "boya-koruyucu-kaplamalar": ["mekanik-yuzey-islemleri", "kimyasal-islemler", "yenilenebilir-enerji", "yuzey-islemleri-muhendislik"],
  "lazer-kazima": ["qr-datamatrix-kodlari", "logo-markalama", "tavlama", "kucuk-seri"],
  "tavlama": ["lazer-kazima", "qr-datamatrix-kodlari", "medikal", "logo-markalama"],
  "qr-datamatrix-kodlari": ["lazer-kazima", "tavlama", "kucuk-seri", "tedarik-zinciri"],
  "logo-markalama": ["lazer-kazima", "tavlama", "anodizasyon", "qr-datamatrix-kodlari"],
  "insert-uygulama": ["mekanik-montaj", "enjeksiyon-kalibi", "kitting-paketleme", "otomotiv"],
  "mekanik-montaj": ["insert-uygulama", "kitting-paketleme", "kaynakli-imalat", "fikstur-aparat-tasarimi"],
  "kitting-paketleme": ["mekanik-montaj", "tedarik-zinciri", "seri-uretim", "qr-datamatrix-kodlari"],
  "kaynakli-imalat": ["mekanik-montaj", "fikstur-aparat-tasarimi", "boru-baglanti-parcalari", "savunma-sanayi"],

  /* ── Kabiliyetler ── */
  "makine-parkuru": ["cnc-frezeleme", "cnc-tornalama", "derin-delik-raybalama", "hassas-mikro-isleme"],
  "malzeme-kutuphanesi": ["tedarik-zinciri", "yuzey-islemleri-muhendislik", "tasarim-rehberi-dfm", "havacilik-uzay"],
  "kalite-kontrol": ["tolerans-hassasiyet", "seri-imalat", "proje-yonetimi", "fikstur-aparat-tasarimi"],
  "tolerans-hassasiyet": ["kalite-kontrol", "tasarim-rehberi-dfm", "cnc-frezeleme", "hassas-mikro-isleme"],
  "tasarim-rehberi-dfm": ["tolerans-hassasiyet", "yuzey-islemleri-muhendislik", "cnc-frezeleme", "enjeksiyon-kalibi"],
  "yuzey-islemleri-muhendislik": ["anodizasyon", "mekanik-yuzey-islemleri", "kimyasal-islemler", "tasarim-rehberi-dfm"],
  "dusuk-hacimli-uretim": ["prototip-uretim", "silikon-kaliplama", "kucuk-seri", "seri-imalat"],
  "seri-imalat": ["seri-uretim", "operasyonel-verimlilik", "kalite-kontrol", "tedarik-zinciri"],
  "proje-yonetimi": ["tedarik-zinciri", "tasarim-rehberi-dfm", "ozel-projeler", "kalite-kontrol"],
  "tedarik-zinciri": ["malzeme-kutuphanesi", "proje-yonetimi", "seri-imalat", "kitting-paketleme"],
  "operasyonel-verimlilik": ["seri-imalat", "fikstur-aparat-tasarimi", "kalite-kontrol", "proje-yonetimi"],

  /* ── Endüstriyel ── */
  "havacilik-uzay": ["cnc-frezeleme", "kalite-kontrol", "malzeme-kutuphanesi", "savunma-sanayi"],
  "savunma-sanayi": ["havacilik-uzay", "kaynakli-imalat", "kalite-kontrol", "tedarik-zinciri"],
  "robotik": ["cnc-frezeleme", "cnc-tornalama", "tolerans-hassasiyet", "mekanik-montaj"],
  "otomotiv": ["seri-uretim", "seri-imalat", "kalite-kontrol", "insert-uygulama"],
  "medikal": ["hassas-mikro-isleme", "kimyasal-islemler", "kalite-kontrol", "tavlama"],
  "yelken-yat-sistemleri": ["kimyasal-islemler", "malzeme-kutuphanesi", "boru-baglanti-parcalari", "cnc-tornalama"],
  "hidrolik-pnomatik": ["derin-delik-raybalama", "boru-baglanti-parcalari", "iklim-teknolojileri", "kalite-kontrol"],
  "boru-baglanti-parcalari": ["hidrolik-pnomatik", "petrol-gaz", "cnc-tornalama", "kaynakli-imalat"],
  "iklim-teknolojileri": ["hidrolik-pnomatik", "boru-baglanti-parcalari", "mekanik-montaj", "kalite-kontrol"],
  "prototip-uretim": ["dusuk-hacimli-uretim", "silikon-kaliplama", "kucuk-seri", "tasarim-rehberi-dfm"],
  "kucuk-seri": ["prototip-uretim", "seri-uretim", "dusuk-hacimli-uretim", "qr-datamatrix-kodlari"],
  "seri-uretim": ["seri-imalat", "kucuk-seri", "otomotiv", "operasyonel-verimlilik"],
  "ozel-projeler": ["proje-yonetimi", "fikstur-aparat-tasarimi", "prototip-uretim", "tasarim-rehberi-dfm"],
  "yenilenebilir-enerji": ["boya-koruyucu-kaplamalar", "kaynakli-imalat", "guc-dagitim-sistemleri", "madencilik-ekipmanlari"],
  "petrol-gaz": ["boru-baglanti-parcalari", "hidrolik-pnomatik", "malzeme-kutuphanesi", "kalite-kontrol"],
  "guc-dagitim-sistemleri": ["yenilenebilir-enerji", "kimyasal-islemler", "mekanik-montaj", "malzeme-kutuphanesi"],
  "madencilik-ekipmanlari": ["kaynakli-imalat", "malzeme-kutuphanesi", "yenilenebilir-enerji", "petrol-gaz"],
};
