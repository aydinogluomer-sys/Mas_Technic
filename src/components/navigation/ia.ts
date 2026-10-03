/* ══════════════════════════════════════════════════════════════════════════
   MAS TECHNIC — PUBLIC INFORMATION ARCHITECTURE

   THE SINGLE SOURCE OF TRUTH for every public navigation surface: the global
   header, the fullscreen menu, the inner-page footer and the landing drawing
   footer all read from this file.

   WHAT THIS REPLACES
   ------------------
   Before Phase 03 the site carried THREE parallel link taxonomies that had
   drifted apart:

     1. `src/components/navigation-data.tsx`      — fullscreen menu only
     2. `src/components/footer/footerLinks.ts`    — inner-page footer only
     3. `technicalLandingData.footerColumns`      — landing footer only

   …and a fourth vocabulary of six hash anchors hardcoded inside the
   landing-only `TechnicalHeader`. The landing therefore exposed no route-level
   navigation at all (`reports/baseline/known-blockers.md` B14). All four now
   derive from the groups below.

   THE GROUPING RULE (mas-navigation-ia)
   -------------------------------------
   Public destinations fall into four families plus one conversion path:

     PRIMARY    capabilities / services / industries — the three deep route
                families, each with five categories and their detail pages.
     SECTIONS   the seven real anchors of the landing sheet. These are page
                SECTIONS, not routes, and are presented as such.
     RESOURCES  technical reference surfaces: material library, journal, FAQ.
     COMPANY    who we are and how to reach us, plus the legal set.
     RFQ        `/teklif-al` — one strong CTA, never duplicated as a link.

   EXCLUSIONS ARE DELIBERATE AND RECORDED
   --------------------------------------
   `EXCLUDED_FROM_PRIMARY_NAV` below names every public route that is NOT in
   the menu and why. `e2e/landing/navigation-reachability.spec.ts` proves the
   union of (navigation targets ∪ index-page children ∪ exclusions) covers the
   whole route inventory, so a new orphan page cannot appear silently.
   ══════════════════════════════════════════════════════════════════════════ */

export interface NavigationLink {
  label: string;
  path: string;
}

export interface NavigationColumn {
  label: string;
  path: string;
  links: NavigationLink[];
}

export interface NavigationItem {
  label: string;
  /** Mono index shown in the rail — `01`, `02`, `03`. */
  index: string;
  path: string;
  children?: NavigationColumn[];
  /** A family of plain pages (04 Kurumsal) lists them directly, no categories. */
  links?: NavigationLink[];
}

/** A section of the landing sheet. `id` is the real DOM anchor on `/`. */
export interface SectionAnchor {
  id: string;
  index: string;
  label: string;
}

/* ── PRIMARY — the three deep route families ──────────────────────────────
   Route coverage: 15 category pages + 48 detail pages. The counts are locked
   by `e2e/fullscreen-menu.spec.ts`. */
export const navigationItems: NavigationItem[] = [
  {
    label: "Hizmetler",
    index: "01",
    path: "#hizmetler",
    children: [
      {
        label: "Talaşlı İmalat",
        path: "/hizmetler/kategori/talasli-imalat",
        links: [
          { label: "CNC Frezeleme", path: "/hizmetler/cnc-frezeleme" },
          { label: "CNC Tornalama", path: "/hizmetler/cnc-tornalama" },
          { label: "Hassas Mikro İşleme", path: "/hizmetler/hassas-mikro-isleme" },
          { label: "Derin Delik & Raybalama", path: "/hizmetler/derin-delik-raybalama" },
        ],
      },
      {
        label: "Ön Üretim",
        path: "/hizmetler/kategori/on-uretim",
        links: [
          { label: "Enjeksiyon Kalıbı", path: "/hizmetler/enjeksiyon-kalibi" },
          { label: "Basınçlı Döküm", path: "/hizmetler/basincli-dokum" },
          { label: "Silikon Kalıplama", path: "/hizmetler/silikon-kaliplama" },
          { label: "Fikstür & Aparat Tasarımı", path: "/hizmetler/fikstur-aparat-tasarimi" },
        ],
      },
      {
        label: "Yüzey İşlemleri",
        path: "/hizmetler/kategori/yuzey-islemleri",
        links: [
          { label: "Mekanik Yüzey İşlemleri", path: "/hizmetler/mekanik-yuzey-islemleri" },
          { label: "Anodizasyon", path: "/hizmetler/anodizasyon" },
          { label: "Kimyasal İşlemler", path: "/hizmetler/kimyasal-islemler" },
          { label: "Boya & Koruyucu Kaplamalar", path: "/hizmetler/boya-koruyucu-kaplamalar" },
        ],
      },
      {
        label: "İşaretleme & Tanımlama",
        path: "/hizmetler/kategori/isaretleme-tanimlama",
        links: [
          { label: "Lazer Kazıma", path: "/hizmetler/lazer-kazima" },
          { label: "Lazer Tavlama ile Markalama", path: "/hizmetler/tavlama" },
          { label: "QR & DataMatrix Kodları", path: "/hizmetler/qr-datamatrix-kodlari" },
          { label: "Logo & Markalama", path: "/hizmetler/logo-markalama" },
        ],
      },
      {
        label: "Montaj & Birleştirme",
        path: "/hizmetler/kategori/montaj-birlestirme",
        links: [
          { label: "Insert Uygulama", path: "/hizmetler/insert-uygulama" },
          { label: "Mekanik Montaj", path: "/hizmetler/mekanik-montaj" },
          { label: "Kitting & Paketleme", path: "/hizmetler/kitting-paketleme" },
          { label: "Kaynaklı İmalat", path: "/hizmetler/kaynakli-imalat" },
        ],
      },
    ],
  },
  {
    label: "Kabiliyetler",
    index: "02",
    path: "#kabiliyetler",
    children: [
      {
        label: "Üretim Altyapısı",
        path: "/kabiliyetler/kategori/uretim-altyapisi",
        links: [
          { label: "Makine Parkuru", path: "/kabiliyetler/makine-parkuru" },
          // The capability page for the material library, not the public
          // catalogue index. Both exist; linking only /malzemeler left
          // /kabiliyetler/malzeme-kutuphanesi orphaned, which the reachability
          // gate caught. The catalogue is reached from RESOURCES below.
          { label: "Malzeme Kütüphanesi", path: "/kabiliyetler/malzeme-kutuphanesi" },
        ],
      },
      {
        label: "Kalite & Standartlar",
        path: "/kabiliyetler/kategori/kalite-standartlar",
        links: [
          { label: "Kalite Kontrol", path: "/kabiliyetler/kalite-kontrol" },
          { label: "Tolerans & Hassasiyet", path: "/kabiliyetler/tolerans-hassasiyet" },
        ],
      },
      {
        label: "Mühendislik Desteği",
        path: "/kabiliyetler/kategori/muhendislik-destegi",
        links: [
          { label: "Tasarım Rehberi (DFM)", path: "/kabiliyetler/tasarim-rehberi-dfm" },
          { label: "Yüzey İşlemleri", path: "/kabiliyetler/yuzey-islemleri-muhendislik" },
        ],
      },
      {
        label: "Prototipten Seri Üretime",
        path: "/kabiliyetler/kategori/prototipten-seri-uretime",
        links: [
          { label: "Düşük Hacimli Üretim", path: "/kabiliyetler/dusuk-hacimli-uretim" },
          { label: "Seri İmalat", path: "/kabiliyetler/seri-imalat" },
        ],
      },
      {
        label: "Süreç & Operasyon",
        path: "/kabiliyetler/kategori/surec-operasyon",
        links: [
          { label: "Proje Yönetimi", path: "/kabiliyetler/proje-yonetimi" },
          { label: "Tedarik Zinciri", path: "/kabiliyetler/tedarik-zinciri" },
          { label: "Operasyonel Verimlilik", path: "/kabiliyetler/operasyonel-verimlilik" },
        ],
      },
    ],
  },
  {
    label: "Endüstriyel",
    index: "03",
    path: "/endustriyel/kategori/yuksek-teknoloji",
    children: [
      {
        label: "Yüksek Teknoloji",
        path: "/endustriyel/kategori/yuksek-teknoloji",
        links: [
          { label: "Havacılık & Uzay", path: "/endustriyel/havacilik-uzay" },
          { label: "Savunma Sanayi", path: "/endustriyel/savunma-sanayi" },
          { label: "Robotik", path: "/endustriyel/robotik" },
        ],
      },
      {
        label: "Seri Üretim",
        path: "/endustriyel/kategori/seri-uretim-endustriyel",
        links: [
          { label: "Otomotiv", path: "/endustriyel/otomotiv" },
          { label: "Medikal", path: "/endustriyel/medikal" },
          { label: "Yelken & Yat Sistemleri", path: "/endustriyel/yelken-yat-sistemleri" },
        ],
      },
      {
        label: "Endüstriyel Sistemler",
        path: "/endustriyel/kategori/endustriyel-sistemler",
        links: [
          { label: "Hidrolik & Pnömatik", path: "/endustriyel/hidrolik-pnomatik" },
          { label: "Boru & Bağlantı Parçaları", path: "/endustriyel/boru-baglanti-parcalari" },
          { label: "İklim Teknolojileri", path: "/endustriyel/iklim-teknolojileri" },
        ],
      },
      {
        label: "Üretim Çözümleri",
        path: "/endustriyel/kategori/uretim-cozumleri",
        links: [
          { label: "Prototip Üretim", path: "/endustriyel/prototip-uretim" },
          { label: "Küçük Seri", path: "/endustriyel/kucuk-seri" },
          { label: "Seri Üretim", path: "/endustriyel/seri-uretim" },
          { label: "Özel Projeler", path: "/endustriyel/ozel-projeler" },
        ],
      },
      {
        label: "Enerji & Altyapı",
        path: "/endustriyel/kategori/enerji-altyapi",
        links: [
          { label: "Yenilenebilir Enerji", path: "/endustriyel/yenilenebilir-enerji" },
          { label: "Petrol & Gaz", path: "/endustriyel/petrol-gaz" },
          { label: "Güç Dağıtım Sistemleri", path: "/endustriyel/guc-dagitim-sistemleri" },
          { label: "Madencilik Ekipmanları", path: "/endustriyel/madencilik-ekipmanlari" },
        ],
      },
    ],
  },
  /* Revision 4: the company and reference pages are a family of their own,
     listed flat — they have no categories. They replace the menu's former
     "Ana sayfa bölümleri" / "Kaynaklar" / "Kurumsal" directory columns. */
  {
    label: "Kurumsal",
    index: "04",
    path: "/hakkimizda",
    links: [
      { label: "Hakkımızda", path: "/hakkimizda" },
      { label: "İletişim", path: "/iletisim" },
      { label: "CNC İşleme Malzemeleri", path: "/malzemeler" },
      { label: "Kalite Dosyası", path: "/kalite-dosyasi" },
      { label: "Teknik Günlük", path: "/blog" },
      { label: "Sık Sorulan Sorular", path: "/sss" },
      { label: "Kabiliyet Profilleri", path: "/kabiliyet-profilleri" },
    ],
  },
];

/* ── SECTIONS — the landing sheet's own anchors ───────────────────────────
   These are the seven ids the production landing really publishes; the list
   is verified against the DOM by `e2e/landing/landing-anchors.spec.ts` and is
   the same set as `LANDING_SCENE_IDS` in `e2e/helpers.ts`.

   They are addressed as `/#id` rather than `#id` so the same control works
   from an inner page, where it means "go home, then to that section". */
export const landingSections: SectionAnchor[] = [
  /* UX01 order and numbering (package 7). */
  { id: "surec", index: "04", label: "Süreç" },
  { id: "projeler", index: "05", label: "Projeler" },
  { id: "sektorler", index: "06", label: "Sektörler" },
  { id: "kalite", index: "07", label: "Kalite" },
  { id: "nexus", index: "09", label: "Nexus" },
  { id: "sss", index: "10", label: "SSS" },
  { id: "iletisim", index: "11", label: "İletişim" },
];

/* ── RESOURCES — technical reference surfaces ─────────────────────────────*/
/* PHASE 08 added two entries here. Both are reference/evidence surfaces
   rather than commercial destinations, which is exactly what this group is
   for:

     `/kabiliyet-profilleri`  the index over `src/content/caseStudies.ts`,
                              carrying the same name as landing band 07.
     `/kalite-dosyasi`        the four §H documents with the control chain that
                              produces the records. Named after the landing
                              band it continues (`10 KALİTE DOSYASI`) and NOT
                              `/kalite`, because `kalite` is already a
                              published landing ANCHOR in `landingSections`
                              below — two destinations differing only by a `#`
                              is an addressing trap for readers and for whoever
                              maintains this file next.

   Registering them here is what keeps
   `e2e/landing/navigation-reachability.spec.ts` green: an unlisted new route
   fails that gate as an orphan. The detail route
   `/kabiliyet-profilleri/:slug` is covered by `INDEX_ROUTES` below. */
export const resourceLinks: NavigationLink[] = [
  { label: "CNC İşleme Malzemeleri", path: "/malzemeler" },
  { label: "Kabiliyet Profilleri", path: "/kabiliyet-profilleri" },
  { label: "Kalite Dosyası", path: "/kalite-dosyasi" },
  { label: "Teknik Günlük", path: "/blog" },
  { label: "Sık Sorulanlar", path: "/sss" },
];

/* ── COMPANY ──────────────────────────────────────────────────────────────*/
export const companyLinks: NavigationLink[] = [
  { label: "Hakkımızda", path: "/hakkimizda" },
  { label: "İletişim", path: "/iletisim" },
];

/* ── LEGAL ────────────────────────────────────────────────────────────────*/
export const legalLinks: NavigationLink[] = [
  { label: "KVKK", path: "/kvkk" },
  { label: "Gizlilik Politikası", path: "/gizlilik-politikasi" },
  { label: "Çerez Politikası", path: "/cerez-politikasi" },
];

/* ── CONVERSION AND ACCOUNT ───────────────────────────────────────────────*/
export const rfqLink: NavigationLink = { label: "Teklif Al", path: "/teklif-al" };
/** The menu CTA carries a verb; the header CTA carries the route name. */
export const rfqCtaLabel = "Projeni Yükle";
export const accountLink: NavigationLink = { label: "Giriş Yap", path: "/giris" };
export const homeLink: NavigationLink = { label: "Ana Sayfa", path: "/" };

/* ── EXCLUSIONS ───────────────────────────────────────────────────────────
   Every public route that is deliberately absent from primary navigation,
   with the reason. `e2e/landing/navigation-reachability.spec.ts` requires the
   route inventory to be exactly covered by navigation ∪ index pages ∪ this
   table, so an unlisted orphan fails the gate. */
export const EXCLUDED_FROM_PRIMARY_NAV: { path: string; reason: string }[] = [
  { path: "/sifremi-unuttum", reason: "Auth recovery step; reached only from /giris, per flow." },
  { path: "/reset-password", reason: "Entered from a Supabase e-mail token; has no standalone meaning." },
  { path: "/cad-dashboard", reason: "Redirect alias for /teklif-al, not a destination of its own." },
  { path: "*", reason: "404 catch-all; not addressable." },
  { path: "/technical-preview", reason: "Dev-only surface, not built into production (src/App.tsx DEV guard)." },
  { path: "/legacy-landing", reason: "Dev-only surface, not built into production (src/App.tsx DEV guard)." },
  { path: "/test", reason: "Dev-only scroll experiment, not built into production (src/App.tsx DEV guard)." },
];

/** Index pages that are the documented entry point for a parametrised family. */
export const INDEX_ROUTES: { path: string; covers: string }[] = [
  { path: "/malzemeler", covers: "/malzemeler/:slug" },
  { path: "/kabiliyet-profilleri", covers: "/kabiliyet-profilleri/:slug" },
  { path: "/blog", covers: "/blog/:slug" },
];

/** Every route target the global navigation itself links to. */
export function navigationTargets(): string[] {
  const fromFamilies = navigationItems.flatMap((item) => [
    ...(item.path.startsWith("/") ? [item.path] : []),
    ...(item.children ?? []).flatMap((category) => [
      category.path,
      ...category.links.map((link) => link.path),
    ]),
    ...(item.links ?? []).map((link) => link.path),
  ]);
  return [...new Set([
    homeLink.path,
    ...fromFamilies,
    ...resourceLinks.map((link) => link.path),
    ...companyLinks.map((link) => link.path),
    ...legalLinks.map((link) => link.path),
    rfqLink.path,
    accountLink.path,
  ])];
}
