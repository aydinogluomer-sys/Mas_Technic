import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { accountLink, legalLinks, rfqCtaLabel, rfqLink } from "./ia";

interface NavConversionProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

/**
 * The menu's bottom title block: legal set, account entry, and the single RFQ
 * call to action.
 *
 * The CTA is the only filled surface in the entire menu — that is what makes
 * it read as the conversion path without a coloured accent or a glow.
 */
export function NavConversion({ currentPath, onNavigate }: NavConversionProps) {
  return (
    <div className="tl-menu-conversion">
      <nav className="tl-menu-legal" aria-label="Yasal bağlantılar">
        {legalLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            aria-current={currentPath === link.path ? "page" : undefined}
            onClick={(event) => { event.preventDefault(); onNavigate(link.path); }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Link
        className="tl-menu-account"
        to={accountLink.path}
        aria-current={currentPath === accountLink.path ? "page" : undefined}
        onClick={(event) => { event.preventDefault(); onNavigate(accountLink.path); }}
      >
        {accountLink.label}
      </Link>
      <Link
        className="tl-menu-cta"
        to={rfqLink.path}
        aria-current={currentPath === rfqLink.path ? "page" : undefined}
        onClick={(event) => { event.preventDefault(); onNavigate(rfqLink.path); }}
      >
        {rfqCtaLabel}
        <ArrowUpRight aria-hidden="true" />
      </Link>
    </div>
  );
}
