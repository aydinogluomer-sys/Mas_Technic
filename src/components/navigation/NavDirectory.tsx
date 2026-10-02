import { Link } from "@/i18n/LocaleLink";
import { useTranslation } from "react-i18next";
import { companyLinks, landingSections, resourceLinks } from "./ia";

interface NavDirectoryProps {
  currentPath: string;
  /** Id of the landing section currently in view, or null off the landing. */
  activeSection: string | null;
  onNavigate: (path: string) => void;
  onSection: (id: string) => void;
}

/**
 * The secondary directory: page SECTIONS on the left, ROUTES on the right.
 *
 * This is where the anchor/route distinction is made legible instead of being
 * silently mixed. Section entries carry the sheet's own band numbers and a `§`
 * mark, are set in mono, and read as "somewhere on the home sheet". Route
 * entries carry no number, are set in the interface face, and read as "another
 * page". Same rule system, same rhythm — two clearly different objects.
 */
export function NavDirectory({ currentPath, activeSection, onNavigate, onSection }: NavDirectoryProps) {
  const { t } = useTranslation();
  const onHome = currentPath === "/";
  return (
    <div className="tl-menu-directory">
      <nav className="tl-menu-dir-col" aria-labelledby="nav-dir-sections" data-nav-sections>
        <p className="tl-menu-dir-title" id="nav-dir-sections">
          {t("ANA SAYFA BÖLÜMLERİ")}
          <span aria-hidden="true">{String(landingSections.length).padStart(2, "0")}</span>
        </p>
        <ul>
          {landingSections.map((section) => (
            <li key={section.id}>
              <Link
                to={`/#${section.id}`}
                className="tl-menu-section-link"
                aria-current={onHome && activeSection === section.id ? "true" : undefined}
                onClick={(event) => { event.preventDefault(); onSection(section.id); }}
              >
                <span className="tl-menu-section-index" aria-hidden="true">§{section.index}</span>
                {t(section.label)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav className="tl-menu-dir-col" aria-labelledby="nav-dir-resources">
        <p className="tl-menu-dir-title" id="nav-dir-resources">
          {t("KAYNAKLAR")}
          <span aria-hidden="true">{String(resourceLinks.length).padStart(2, "0")}</span>
        </p>
        <ul>
          {resourceLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className="tl-menu-route-link"
                aria-current={currentPath === link.path ? "page" : undefined}
                onClick={(event) => { event.preventDefault(); onNavigate(link.path); }}
              >
                {t(link.label)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav className="tl-menu-dir-col" aria-labelledby="nav-dir-company">
        <p className="tl-menu-dir-title" id="nav-dir-company">
          {t("KURUMSAL")}
          <span aria-hidden="true">{String(companyLinks.length).padStart(2, "0")}</span>
        </p>
        <ul>
          {companyLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className="tl-menu-route-link"
                aria-current={currentPath === link.path ? "page" : undefined}
                onClick={(event) => { event.preventDefault(); onNavigate(link.path); }}
              >
                {t(link.label)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
