import * as J from "./journal";
import * as P from "./pilot";
import * as S from "./sector";

/* Schema registry for the detail-page visual manifest (IMG01). */
export const SECTOR_SCHEMAS = {
  savunma: S.Savunma,
  robotik: S.Robotik,
  otomotiv: S.Otomotiv,
  medikal: S.Medikal,
  yat: S.Yat,
  hidrolik: S.Hidrolik,
  boru: S.Boru,
  iklim: S.Iklim,
  prototip: S.Prototip,
  "kucuk-seri": S.KucukSeri,
  "ozel-proje": S.OzelProje,
  yenilenebilir: S.Yenilenebilir,
  "petrol-gaz": S.PetrolGaz,
  "guc-dagitim": S.GucDagitim,
  madencilik: S.Madencilik,
  "dusuk-hacim": S.DusukHacim,
  montaj: S.Montaj,
  verimlilik: S.Verimlilik,
  "lazer-tavlama": S.LazerTavlama,
} as const;

export type SectorSchemaKey = keyof typeof SECTOR_SCHEMAS;


/* PAGE01 pilot module drawings, keyed by `PilotModule.schema`. */
export const PILOT_SCHEMAS = {
  frezeleme: P.PilotFrezeleme,
  tornalama: P.PilotTornalama,
  "derin-delik": P.PilotDerinDelik,
  fikstur: P.PilotFikstur,
  anodizasyon: P.PilotAnodizasyon,
  kalite: P.PilotKalite,
  dfm: P.PilotDfm,
} as const;

/* UX05 journal and profile drawings, keyed by slug. */
export const JOURNAL_SCHEMAS = {
  "5-eksen-cnc-isleme-avantajlari": J.JournalBesEksen,
  "havacilik-parcalarinda-malzeme-secimi": J.JournalMalzeme,
  "dfm-tasarimdan-uretime-gecis": J.JournalDfm,
  "cnc-torna-frezeleme-farki": J.JournalTornaFreze,
  "kalite-kontrol-cmm-olcum": J.JournalCmm,
  "endustriyel-yuzey-islemleri-rehberi": J.JournalYuzey,
} as const;

export const PROFILE_SCHEMAS = {
  "ince-cidarli-govde": J.ProfileInceCidar,
  "titanyum-baglanti-parcasi": J.ProfileTitanyum,
  "hassas-mil": J.ProfileMil,
} as const;
