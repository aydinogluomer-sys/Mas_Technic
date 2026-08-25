import { Mail, MapPin, Phone } from "lucide-react";

/**
 * Footer marka bloğu — mobil (centered) ve desktop (sol-hizalı) varyantı tek prop'la döner.
 */
export const FooterBrand = ({ centered = false }: { centered?: boolean }) => {
  const justify = centered ? "justify-center" : "";
  return (
    <div className={centered ? "mb-8 text-center" : ""}>
      <div className={`flex items-center gap-3 mb-5 ${justify}`}>
        <div className="w-10 h-10 bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">MT</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight" style={{ color: "var(--text-primary)" }}>
            MAS TECHNIC
          </span>
          <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: "var(--text-technical)" }}>
            Precision CNC
          </span>
        </div>
      </div>
      <p className={`text-xs leading-relaxed mb-5 max-w-xs ${centered ? "mx-auto" : ""}`} style={{ color: "var(--text-secondary)" }}>
        Projenizin kapsamını paylaşmak veya bilgi almak için Mas Technic ile iletişime geçin.
      </p>
      <address className={`${centered ? "flex flex-col items-center" : "space-y-2.5"} mb-5 gap-2.5 not-italic`}>
        <a href="tel:+905365645194" className="flex min-h-11 items-center gap-2.5 text-xs hover:text-primary" style={{ color: "var(--text-secondary)" }}>
          <Phone aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
          <span>+90 (536) 564 51 94</span>
        </a>
        <a href="mailto:sales@mastechnic.com" className="flex min-h-11 items-center gap-2.5 text-xs hover:text-primary" style={{ color: "var(--text-secondary)" }}>
          <Mail aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
          <span>sales@mastechnic.com</span>
        </a>
        <div className={`flex items-start gap-2.5 text-xs ${centered ? "max-w-xs justify-center" : ""}`} style={{ color: "var(--text-secondary)" }}>
          <MapPin aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
          <span>Ataşehir Mah., 8287. Sok. No: 4, 35620 Çiğli/İzmir, Türkiye</span>
        </div>
      </address>
    </div>
  );
};
