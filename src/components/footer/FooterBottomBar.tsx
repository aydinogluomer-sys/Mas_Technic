import { Link } from "react-router-dom";
import { LiveClock } from "../LiveClock";

/**
 * RC-8: flex-wrap + mobil stack (lg breakpoint'te yatay).
 * lg:pr-20 → sağ alt floating chat (56px width + 24px right offset) için rezerv.
 */
export const FooterBottomBar = ({ currentYear }: { currentYear: number }) => {
  return (
    <div className="pt-6" style={{ borderTop: "1px solid var(--surface-border)" }}>
      <div className="flex flex-col lg:flex-row justify-between items-center gap-3 lg:gap-4 md:pr-20">
        <div
          className="text-xs flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5"
          style={{ color: "var(--text-hint)" }}
        >
          <span>© {currentYear} MAS TECHNIC. Tüm hakları saklıdır.</span>
          <LiveClock />
        </div>
        <div
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs"
          style={{ color: "var(--text-hint)" }}
        >
          <span
            className="hidden md:inline"
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "11px",
              letterSpacing: "0.1em",
              color: "var(--text-hint)",
            }}
          >
            ÇİĞLİ / İZMİR / TR
          </span>
          <Link to="/gizlilik-politikasi" className="inline-flex min-h-[24px] items-center py-1 hover:text-primary transition-colors">
            Gizlilik Politikası
          </Link>
          <Link to="/kvkk" className="inline-flex min-h-[24px] items-center py-1 hover:text-primary transition-colors">
            KVKK Aydınlatma Metni
          </Link>
          <Link to="/cerez-politikasi" className="inline-flex min-h-[24px] items-center py-1 hover:text-primary transition-colors">
            Çerez Politikası
          </Link>
        </div>
      </div>
    </div>
  );
};
