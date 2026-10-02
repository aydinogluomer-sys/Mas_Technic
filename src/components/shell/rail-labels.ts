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

export function railLabel(label: string, language = "tr"): string {
  const key = label.trim().toLocaleUpperCase("tr-TR");
  if (language.toLowerCase().startsWith("en")) return RAIL_EN[key] ?? label;
  return RAIL_TR[key] ?? label;
}
