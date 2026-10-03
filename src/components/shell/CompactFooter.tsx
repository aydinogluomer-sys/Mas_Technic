import { useTranslation } from "react-i18next";
import { Link } from "@/i18n/LocaleLink";
import { legalLinks } from "@/components/navigation/ia";
import { PUBLIC_PHONE, PUBLIC_PHONE_HREF, SALES_EMAIL, SALES_EMAIL_HREF } from "@/content/claims";

/* ══════════════════════════════════════════════════════════════════════════
   THE COMPACT FOOTER (UX04, §3 "Hukuki footer")

   On the legal texts, the auth steps and the quote studio the reader is in
   the middle of a task or a document: the long editorial footer — campaign
   statement, quote call, four link groups, the outlined wordmark — is a run
   of exits there. These surfaces get the brand, the direct line, the three
   legal links and the copyright, and nothing else. Every other public page
   keeps the full `SiteFooter`.
   ══════════════════════════════════════════════════════════════════════════ */

export function CompactFooter() {
  const { t } = useTranslation();
  return (
    <footer className="shell-footer-compact" data-footer-variant="compact" aria-label={t("Site altbilgisi")}>
      <p className="shell-footer-compact-brand">MAS TECHNIC</p>
      <p className="shell-footer-compact-contact">
        <a href={PUBLIC_PHONE_HREF}>{PUBLIC_PHONE}</a>
        <a href={SALES_EMAIL_HREF}>{SALES_EMAIL}</a>
      </p>
      <nav className="shell-footer-compact-legal" aria-label={t("Yasal bağlantılar")}>
        {legalLinks.map((link) => (
          <Link key={link.path} to={link.path}>{t(link.label)}</Link>
        ))}
      </nav>
      <p className="shell-footer-compact-copy">© {new Date().getFullYear()} MAS TECHNIC</p>
    </footer>
  );
}
