import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";

const links = [
  ["YETENEKLER", "#surec"],
  ["SEKTÖRLER", "#sektorler"],
  ["PROJELER", "#projeler"],
  ["NEXUS", "#nexus"],
  ["KALİTE", "#kalite"],
  ["İLETİŞİM", "#iletisim"],
] as const;

export function TechnicalHeader() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab" || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll<HTMLElement>("a,button")];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <header className="tl-header" data-testid="technical-header">
      <Link className="tl-brand" to="/" aria-label="MAS Technic ana sayfa">
        <strong>MAS <em>TECHNIC</em></strong><span>PRECISION CNC</span>
      </Link>
      <nav className="tl-nav" aria-label="Ana navigasyon">
        {links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
      </nav>
      <div className="tl-header-actions">
        <p className="tl-language">
          <span aria-current="true" aria-label="Aktif dil: Türkçe">TR</span>
          <i aria-hidden="true">/</i>
          <span className="tl-language-off" title="İngilizce sürüm hazırlanıyor">EN</span>
        </p>
        <Link className="tl-quote-button" to="/teklif-al">TEKLİF AL</Link>
        <button ref={triggerRef} className="tl-menu-trigger" type="button" aria-expanded={open} aria-controls="tl-mobile-menu" aria-label={open ? "Menüyü kapat" : "Menüyü aç"} onClick={() => setOpen((value) => !value)}>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      {open && (
        <div ref={panelRef} id="tl-mobile-menu" className="tl-mobile-menu" role="dialog" aria-modal="true" aria-label="Mobil navigasyon">
          <button type="button" aria-label="Menüyü kapat" onClick={() => setOpen(false)}><X aria-hidden="true" /></button>
          <nav aria-label="Mobil ana navigasyon">
            {links.map(([label, href], index) => (
              <a key={href} href={href} onClick={() => setOpen(false)}><small>{String(index + 1).padStart(2, "0")}</small>{label}</a>
            ))}
          </nav>
          <Link to="/teklif-al" onClick={() => setOpen(false)}>CAD DOSYANI YÜKLE <ArrowRight aria-hidden="true" /></Link>
        </div>
      )}
    </header>
  );
}
