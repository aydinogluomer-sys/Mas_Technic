import { ArrowLeft, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { MarqueeBand } from "./MarqueeBand";
import { footerLinks, type FooterLinkGroup } from "./footer/footerLinks";
import { FooterBrand } from "./footer/FooterBrand";
import { FooterBackdrop } from "./footer/FooterBackdrop";
import { FooterNewsletter } from "./footer/FooterNewsletter";
import { FooterCTA } from "./footer/FooterCTA";
import { FooterBottomBar } from "./footer/FooterBottomBar";

const FooterAccordion = ({ group }: { group: FooterLinkGroup }) => {
  const [open, setOpen] = useState(false);
  const disclosureId = useId().replace(/:/g, "");
  const triggerId = `footer-${disclosureId}-trigger`;
  const panelId = `footer-${disclosureId}-panel`;

  return (
    <div className="border-b" style={{ borderColor: "var(--surface-border)" }}>
      <h2>
        <button
          type="button"
          id={triggerId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
          className="flex min-h-11 w-full items-center justify-between py-4 text-center"
        >
          <span className="flex-1 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
            {group.title}
          </span>
          <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} style={{ color: "var(--text-technical)" }} />
        </button>
      </h2>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!open}
        className="pb-4"
      >
        <ul className="space-y-2.5 text-center">
          {group.items.map((l) => (
            <li key={l.label}>
              <Link to={l.href} className="text-xs hover:text-primary transition-colors duration-200" style={{ color: "var(--text-technical)" }}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } };

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Scroll-aware: up-arrow buton, footer alt-bar henüz viewport'a girmemişken görünür.
  // Footer'a yaklaşıldığında gizlenir → mobile'da legal linklerle çakışmaz.
  // Landing'de gösterilmiyor: pinned "Süreç & Kanıt" sahnesinin proof rail'ini
  // örtüyordu ve orada zaten sabit header (logo → ana sayfa) ile bölüm nokta
  // navigasyonu aynı erişimi veriyor.
  const isLanding = useLocation().pathname === "/";
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      if (isLanding) { setShowScrollTop(false); return; }
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const footerIsBelowViewport = (footerRef.current?.getBoundingClientRect().top ?? Infinity) > window.innerHeight;
      setShowScrollTop(max > 0 && scrolled > max * 0.3 && footerIsBelowViewport);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  return (
      <footer
        ref={footerRef}
        className="footer-industrial relative w-full overflow-x-hidden font-mono"
      >
        <MarqueeBand />
        <FooterBackdrop />

        <div className="relative z-10 container-industrial pt-20 pb-10">
          <FooterNewsletter />

          {/* Mobile: Brand + Accordion */}
          <div className="md:hidden mb-12">
            <FooterBrand centered />
            {footerLinks.map((group) => (
              <FooterAccordion key={group.title} group={group} />
            ))}
          </div>

          {/* Desktop: Brand + 4 link kolonu */}
          <motion.div
            variants={stagger}
            initial={reducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true }}
            className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 mb-16"
          >
            <motion.div variants={fadeUp} className="md:col-span-3 lg:col-span-1">
              <FooterBrand />
            </motion.div>
            {footerLinks.map((group) => (
              <motion.div key={group.title} variants={fadeUp}>
                <h2 className="font-semibold mb-4 uppercase tracking-wider text-xs" style={{ color: "var(--text-primary)" }}>
                  {group.title}
                </h2>
                <ul className="space-y-2.5">
                  {group.items.map((l) => (
                    <li key={l.label}>
                      <Link to={l.href} className="text-xs hover:text-primary transition-colors duration-200" style={{ color: "var(--text-technical)" }}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          <FooterCTA />
          <FooterBottomBar currentYear={currentYear} />
        </div>

        {/* Floating Scroll-to-Top - sol alt, sadece scroll>%50 sonrası */}
        {showScrollTop && createPortal(
          <div
          className="fixed z-50 pointer-events-auto"
          style={{
            bottom: "calc(1.5rem + var(--shell-safe-bottom))",
            left: "calc(1.5rem + var(--shell-safe-left))",
          }}
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })}
            className="floating-scroll-top"
            aria-label="Yukarı çık"
          >
            <ArrowLeft className="h-4 w-4 rotate-90" aria-hidden="true" />
          </button>
          </div>,
          document.body,
        )}

      </footer>
  );
};
