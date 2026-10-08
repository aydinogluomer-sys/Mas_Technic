/* ══════════════════════════════════════════════════════════════════════════
   RAIL LABELS — ONE LANGUAGE PER PAGE, AND IT IS THE READER'S

   The rail caption under each band number names the section. Phase 04 made it
   an English sheet code in every UI language, which put `HEADER`, `PROOF
   STRIP`, `DEFINITION`, `REGISTER` and `NEXT STEP` on Turkish pages — developer
   vocabulary the reader had to decode (COPY01, implementation contract §7).

   Call sites keep passing the key they always did (mostly Turkish already).
   `railLabel(key, language)` renders a meaningful section name in the page
   language: Turkish keys stand as they are, the few English-only keys get a
   Turkish name, and an English page reads `RAIL_EN`. Unknown keys pass through
   unchanged. Names stay short enough for the 56/64px rail (mobile hides it).
   ══════════════════════════════════════════════════════════════════════════ */

/** Keys that were English sheet codes, given a Turkish section name. */
const RAIL_TR: Record<string, string> = {
  "HEADER": "MENÜ",
  "HERO": "AÇILIŞ",
  "PROOF STRIP": "KABİLİYET ÖZETİ",
  "MARQUEE": "HİZMETLER",
  "RFQ": "TEKLİF",
  "PAGE": "SAYFA",
  /* R1: no rail word may pass ten letters (64px rail, 10px mono). */
  "REFERANSLAR": "REFERANS",
  "İÇİNDEKİLER": "İÇERİK",
  "KARŞILAŞTIRMA": "KIYAS",
};

const RAIL_EN: Record<string, string> = {
  "SÜREÇ": "PROCESS",
  "KABİLİYET PROFİLLERİ": "CAPABILITY PROFILES",
  "SEKTÖRLER": "SECTORS",
  "MANİFESTO": "MANIFESTO",
  "KALİTE DOSYASI": "QUALITY FILE",
  "REFERANSLAR": "REFERENCES",
  "SSS": "FAQ",
  "GÜNLÜK": "JOURNAL",
  "BAŞYAZI": "LEAD",
  "DİZİN": "INDEX",
  "YAZI": "ARTICLE",
  "METİN": "TEXT",
  "BÖLÜMLER": "SECTIONS",
  "İLGİLİ": "RELATED",
  "İÇİNDEKİLER": "CONTENTS",
  "AİLE": "FAMILY",
  "KURUMSAL": "COMPANY",
  "YAKLAŞIM": "APPROACH",
  "KAPSAM": "SCOPE",
  "İLETİŞİM": "CONTACT",
  "YÖNLENDİRME": "ROUTING",
  "TOPLANTI": "MEETING",
  "PROFİL": "PROFILE",
  "KONTROL": "CONTROL",
  "DİĞER": "OTHER",
  "KALİTE": "QUALITY",
  "DOKÜMAN": "DOCUMENTS",
  "BELGE": "CERTS",
  "ZİNCİR": "CHAIN",
  "MALZEME": "MATERIAL",
  "TANIM": "DEFINITION",
  "ÖZELLİK": "PROPERTIES",
  "KULLANIM": "USE CASES",
  "İŞLEME": "MACHINING",
  "KAYIT": "REGISTER",
  "KABİLİYET": "CAPABILITY",
  "KARŞILAŞTIRMA": "COMPARISON",
  "SORULAR": "QUESTIONS",
  "TEKLİF": "RFQ",
  "TALEP": "REQUEST",
  "ALTERNATİF": "OPTIONS",
  "MADDELER": "CLAUSES",
  "HİZMET": "SERVICE",
  "SEKTÖR": "SECTOR",
  "SONRAKİ ADIM": "NEXT STEP",
  "HATA": "ERROR",
  "PAFTA": "SHEET",
  "MODÜL": "MODULE",
  "KARAR": "DECISION",
  "ŞEMA": "SCHEMA",
  "KAYNAK": "SOURCES",
  "SAYFA": "PAGE",
  "MENÜ": "MENU",
  "GİZLİLİK": "PRIVACY",
  "ÇEREZ": "COOKIES",
  "KVKK": "KVKK",
  "HEADER": "MENU",
  "HERO": "OPENING",
  "PROOF STRIP": "CAPABILITY SUMMARY",
  "MARQUEE": "SERVICES",
  "RFQ": "RFQ",
  "PAGE": "PAGE",
};

/* L3 — German section names. Same ten-letter ceiling; DATENSCHUTZ is the one
   eleven-letter word, kept because no shorter German word means "privacy". */
const RAIL_DE: Record<string, string> = {
  "SÜREÇ": "PROZESS",
  "KABİLİYET PROFİLLERİ": "PROFILE",
  "SEKTÖRLER": "BRANCHEN",
  "MANİFESTO": "MANIFEST",
  "KALİTE DOSYASI": "QUALITÄT",
  "REFERANSLAR": "REFERENZEN",
  "SSS": "FAQ",
  "GÜNLÜK": "JOURNAL",
  "BAŞYAZI": "EDITORIAL",
  "DİZİN": "INDEX",
  "YAZI": "ARTIKEL",
  "METİN": "TEXT",
  "BÖLÜMLER": "ABSCHNITTE",
  "İLGİLİ": "VERWANDT",
  "İÇİNDEKİLER": "INHALT",
  "AİLE": "FAMILIE",
  "KURUMSAL": "FIRMA",
  "YAKLAŞIM": "ANSATZ",
  "KAPSAM": "UMFANG",
  "İLETİŞİM": "KONTAKT",
  "YÖNLENDİRME": "VERWEISE",
  "TOPLANTI": "TERMIN",
  "PROFİL": "PROFIL",
  "KONTROL": "PRÜFUNG",
  "DİĞER": "WEITERE",
  "KALİTE": "QUALITÄT",
  "DOKÜMAN": "DOKUMENTE",
  "BELGE": "ZERTIFIKAT",
  "ZİNCİR": "KETTE",
  "MALZEME": "WERKSTOFF",
  "TANIM": "DEFINITION",
  "ÖZELLİK": "MERKMALE",
  "KULLANIM": "EINSATZ",
  "İŞLEME": "ZERSPANUNG",
  "KAYIT": "REGISTER",
  "KABİLİYET": "KOMPETENZ",
  "KARŞILAŞTIRMA": "VERGLEICH",
  "SORULAR": "FRAGEN",
  "TEKLİF": "ANGEBOT",
  "TALEP": "ANFRAGE",
  "ALTERNATİF": "OPTIONEN",
  "MADDELER": "KLAUSELN",
  "HİZMET": "LEISTUNG",
  "SEKTÖR": "BRANCHE",
  "SONRAKİ ADIM": "NÄCHSTES",
  "SIRADA NE VAR": "NÄCHSTES",
  "HATA": "FEHLER",
  "PAFTA": "BLATT",
  "MODÜL": "MODUL",
  "KARAR": "ENTSCHEID",
  "ŞEMA": "SCHEMA",
  "KAYNAK": "QUELLEN",
  "SAYFA": "SEITE",
  "MENÜ": "MENÜ",
  "GİZLİLİK": "DATENSCHUTZ",
  "ÇEREZ": "COOKIES",
  "KVKK": "KVKK",
  "NEXUS": "NEXUS",
  "HEADER": "MENÜ",
  "HERO": "AUFTAKT",
  "PROOF STRIP": "ÜBERBLICK",
  "MARQUEE": "LEISTUNGEN",
  "RFQ": "ANFRAGE",
  "PAGE": "SEITE",
};

export function railLabel(label: string, language = "tr"): string {
  const key = label.trim().toLocaleUpperCase("tr-TR");
  const code = language.toLowerCase();
  if (code.startsWith("en")) return RAIL_EN[key] ?? label;
  if (code.startsWith("de")) return RAIL_DE[key] ?? label;
  return RAIL_TR[key] ?? label;
}
