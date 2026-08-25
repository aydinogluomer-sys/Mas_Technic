const TERMS = [
  "MAS TECHNIC",
  "HİZMETLER",
  "KABİLİYETLER",
  "ENDÜSTRİYEL",
  "MALZEMELER",
  "TEKNİK İÇERİK",
  "TEKLİF",
  "İLETİŞİM",
];

interface MarqueeBandProps {
  className?: string;
}

const renderTerms = (groupKey: string) =>
  TERMS.map((term, i) => (
    <span
      key={`${groupKey}-${i}`}
      style={{
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: "clamp(10px, 1.5vw, 13px)",
        letterSpacing: "0.25em",
        color: "var(--text-muted)",
        whiteSpace: "nowrap",
      }}
    >
      {term}
      <span style={{ margin: "0 24px", color: "var(--text-hint)" }}>•</span>
    </span>
  ));

export const MarqueeBand = ({ className = "" }: MarqueeBandProps) => {
  return (
    <div
      aria-hidden="true"
      className={`marquee-outer ${className}`}
      style={{
        overflow: "hidden",
        borderTop: "1px solid var(--surface-border)",
        borderBottom: "1px solid var(--surface-border)",
        padding: "14px 0",
        background: "var(--overlay-vignette-light)",
      }}
    >
      <div className="marquee-inner items-center" data-footer-information-band>
        {renderTerms("a")}
        {renderTerms("b")}
      </div>
    </div>
  );
};
