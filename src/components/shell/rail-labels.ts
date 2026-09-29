/* ══════════════════════════════════════════════════════════════════════════
   RAIL LABELS — ONE LANGUAGE FOR THE SHEET INDEX

   The rail caption under each band number is a drawing-sheet code, not page
   copy. It was half Turkish, half English (`HERO`, `PROOF STRIP` next to
   `SÜREÇ`, `SEKTÖRLER`). Call sites keep passing the label they always did;
   the band renders the English sheet code from this one table, so a new band
   cannot reintroduce the mix, and the rail stays English in every UI language.
   Unknown labels pass through unchanged (already English, or a proper noun).
   ══════════════════════════════════════════════════════════════════════════ */
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
};

export function railLabel(label: string): string {
  return RAIL_EN[label.trim().toLocaleUpperCase("tr-TR")] ?? label;
}
