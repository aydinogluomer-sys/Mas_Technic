import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { NavigationLink } from "../navigation-data";

export function MenuConversionRail({ links, onNavigate }: { links: NavigationLink[]; onNavigate: (path: string) => void }) {
  return (
    <div className="menu-conversion">
      <nav aria-label="Kurumsal bağlantılar">
        {links.map((link) => <Link key={link.path} to={link.path} onClick={(event) => { event.preventDefault(); onNavigate(link.path); }}>{link.label}</Link>)}
      </nav>
      <Link to="/giris" onClick={(event) => { event.preventDefault(); onNavigate("/giris"); }}>Giriş Yap</Link>
      <Link data-cursor="teklif" className="menu-conversion-cta" to="/teklif-al" onClick={(event) => { event.preventDefault(); onNavigate("/teklif-al"); }}>
        Projeni Yükle <ArrowUpRight className="size-4" />
      </Link>
    </div>
  );
}
