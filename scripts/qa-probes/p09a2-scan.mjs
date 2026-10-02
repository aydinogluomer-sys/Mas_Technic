/**
 * QA 09a-R2 — shared claim scanner.
 *
 * Deliberately WIDER than scripts/claims-gate.mjs. The gate is the thing under
 * test; reusing its regexes would only prove it agrees with itself. In
 * particular this scanner:
 *   - does NOT blank comments (the gate does, by design)
 *   - carries the worded, digit-free forms the Orchestrator says a numeric
 *     sweep missed twice: aynı gün, ekspres, acil, gece-gündüz, hafta sonu, 24/7
 *   - carries payment/credit and return/warranty families
 *
 * It over-reports on purpose. Every hit is adjudicated by hand; the point is to
 * make a miss impossible, not to produce a clean number.
 */

export const RULES = [
  // ── production / delivery DURATION, numeric ──────────────────────────────
  {
    id: "duration-numeric",
    cls: "LEAD_TIME",
    re: /\b\d+\s*[-–—]?\s*\d*\s*(iş\s*g[üu]n[üu]|g[üu]n|saat|hafta|ay|i[şs]\s*g[üu]n)\b/giu,
  },
  { id: "duration-24-72", cls: "LEAD_TIME", re: /\b\d+\s*[-–—]\s*\d+\s*(saat|g[üu]n|hafta|ay)\b/giu },
  { id: "duration-slash-247", cls: "LEAD_TIME", re: /\b24\s*[\/x]\s*7\b/gi },

  // ── production / delivery DURATION, WORDED (no digits) ───────────────────
  { id: "worded-ayni-gun", cls: "LEAD_TIME", re: /ayn[ıi]\s*g[üu]n/giu },
  { id: "worded-ertesi-gun", cls: "LEAD_TIME", re: /ertesi\s*g[üu]n/giu },
  { id: "worded-ekspres", cls: "LEAD_TIME", re: /ekspres/giu },
  { id: "worded-acil", cls: "LEAD_TIME", re: /\bacil\b/giu },
  { id: "worded-gece-gunduz", cls: "LEAD_TIME", re: /gece\s*[-–]?\s*g[üu]nd[üu]z/giu },
  { id: "worded-hafta-sonu", cls: "LEAD_TIME", re: /hafta\s*sonu/giu },
  { id: "worded-kesintisiz", cls: "LEAD_TIME", re: /kesintisiz/giu },
  { id: "worded-vardiya", cls: "LEAD_TIME", re: /vardiya/giu },
  { id: "worded-mesai", cls: "LEAD_TIME", re: /mesai/giu },
  { id: "worded-hizli-teslim", cls: "LEAD_TIME", re: /h[ıi]zl[ıi]\s*(teslim|[üu]retim|termin)/giu },
  { id: "worded-kisa-surede", cls: "LEAD_TIME", re: /k[ıi]sa\s*s[üu]re/giu },
  { id: "worded-termin-soz", cls: "LEAD_TIME", re: /(teslim|termin)\s*(s[üu]resi|tarihi|garantisi)/giu },
  { id: "worded-clock", cls: "LEAD_TIME", re: /\b\d{1,2}[:.]\d{2}\b/g },

  // ── PAYMENT / CREDIT terms ───────────────────────────────────────────────
  { id: "pay-vade", cls: "PAYMENT", re: /\bvade(li|si)?\b/giu },
  { id: "pay-pesin", cls: "PAYMENT", re: /pe[şs]in/giu },
  { id: "pay-on-odeme", cls: "PAYMENT", re: /[öo]n\s*[öo]deme|avans/giu },
  { id: "pay-acik-hesap", cls: "PAYMENT", re: /a[çc][ıi]k\s*hesap/giu },
  { id: "pay-taksit", cls: "PAYMENT", re: /taksit/giu },
  { id: "pay-percent-split", cls: "PAYMENT", re: /%\s*\d+\s*(?:[öo]n\s*[öo]deme|pe[şs]in|teslimatta)/giu },
  { id: "pay-indirim", cls: "PAYMENT", re: /indirim/giu },

  // ── RETURN / WARRANTY guarantees ─────────────────────────────────────────
  { id: "war-garanti", cls: "WARRANTY", re: /garanti/giu },
  { id: "war-iade", cls: "WARRANTY", re: /\biade\b/giu },
  { id: "war-degisim", cls: "WARRANTY", re: /de[ğg]i[şs]im/giu },
  { id: "war-ucretsiz", cls: "WARRANTY", re: /[üu]cretsiz/giu },
  { id: "war-tazmin", cls: "WARRANTY", re: /tazmin|telafi/giu },
  { id: "war-taahhut", cls: "WARRANTY", re: /taahh[üu]t/giu },
];

/** Strings that are authorised and must NOT be reported as violations. */
export const ALLOWED = [
  "1-3 iş günü", // QUOTE_RESPONSE_TIME
  "1-3 İŞ GÜNÜ", // QUOTE_RESPONSE_TIME_DISPLAY
];

export function scan(text, label) {
  const hits = [];
  for (const rule of RULES) {
    rule.re.lastIndex = 0;
    let m;
    while ((m = rule.re.exec(text)) !== null) {
      const start = Math.max(0, m.index - 70);
      const ctx = text.slice(start, Math.min(text.length, m.index + m[0].length + 70)).replace(/\s+/g, " ");
      hits.push({ label, rule: rule.id, cls: rule.cls, match: m[0], ctx });
      if (m[0].length === 0) rule.re.lastIndex++;
    }
  }
  return hits;
}

export function isAllowedQuoteSla(hit) {
  return ALLOWED.some((a) => hit.ctx.toLowerCase().includes(a.toLowerCase()));
}
