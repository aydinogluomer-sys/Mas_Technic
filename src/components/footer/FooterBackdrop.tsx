/**
 * Footer arka plan katmanları: watermark, grid pattern, radial glow.
 * Tüm efektler `pointer-events-none` ve dekoratif (aria-hidden).
 */
export const FooterBackdrop = () => {
  return (
    <>
      {/* RC-9: watermark mobil overflow guard — clamp + max-w-full + center */}
      <div
        className="pointer-events-none select-none overflow-hidden relative w-full max-w-full"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        <div
          style={{
            fontSize: "clamp(40px, 12vw, 160px)",
            fontFamily: "IBM Plex Mono, monospace",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text-vignette)",
            lineHeight: 1,
            whiteSpace: "nowrap",
            padding: "20px 0",
            textAlign: "center",
          }}
        >
          MAS TECHNIC
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(var(--precision-steel-rgb) / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--precision-steel-rgb) / 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgb(var(--precision-steel-rgb) / 0.12) 0%, transparent 70%)",
        }}
      />
    </>
  );
};
