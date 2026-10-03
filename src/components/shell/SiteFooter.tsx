import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, ChevronDown, Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { useLocation } from "react-router-dom";
import { stripLocale } from "@/i18n/locale";
import { Link } from "@/i18n/LocaleLink";
import { useTranslation } from "react-i18next";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { legalLinks, rfqLink } from "@/components/navigation/ia";
import {
  PUBLIC_ADDRESS_LINES,
  PUBLIC_PHONE,
  PUBLIC_PHONE_HREF,
  SALES_EMAIL,
  SALES_EMAIL_HREF,
} from "@/content/claims";
import { footerGroups, type FooterLinkGroup } from "./footer-groups";
import { ShellBand } from "./ShellBand";

/* ══════════════════════════════════════════════════════════════════════════
   THE SITE'S ONE FOOTER — a drawing title block, on every public route

   WHICH OF THE THREE FOOTERS SURVIVED, AND WHY
   --------------------------------------------
   The landing's `DrawingFooter` did. `mas-design-language` says the public
   system derives from TechnicalLanding, and the two footers were not two
   skins of one idea — they were opposites:

     mega footer   1398px tall at 1280 (measured), a full-bleed watermark, a
                   grid pattern, a radial glow, a scrolling marquee, two
                   `rounded-2xl` glass slabs with a 32px drop shadow and a
                   diagonal accent wash, a newsletter capture, a big CTA slab
                   and a live `IST hh:mm:ss` clock.
     title block   213px tall at 1280 (measured), hairlines, mono metadata,
                   four master columns, a watermark cut by the block edge.

   Everything in the first list is the generic-SaaS residue `IMPLEMENTATION.md`
   §5.5 tells this run to remove. So the title block is the footer, and it
   absorbed the obligations the mega footer really carried:

     · the conversion pair (`/teklif-al`, `/iletisim`) and the journal
       invitation, as one measured rule instead of two glass slabs;
     · the third legal link (`/cerez-politikasi`), which the landing footer
       was missing;
     · the mobile disclosure behaviour, so four columns of links do not turn
       into a 700px scroll on a phone (measured: the landing footer was 700px
       tall at 375 with every column expanded);
     · the desktop back-to-top control.

   Deleted on purpose, with reasons: the marquee (the landing already has one
   as band 03 — two on one page is noise), the newsletter capture (there is no
   list to subscribe to; the link goes to the journal, which is true), the live
   clock (a decorative readout that claims nothing), the watermark/grid/glow
   backdrop stack, and both glass slabs.

   MEASURED COST OF CONSOLIDATION
   ------------------------------
   The landing footer grows because it now does the whole site's footer job.
   The inner pages shrink by roughly 1.1 kilopixels of vertical scroll. Both
   numbers are recorded in `e2e/technical-landing.spec.ts`, which pins the
   band's proportion rather than trusting this comment.
   ══════════════════════════════════════════════════════════════════════════ */

/* Phase 07: these four strings moved into `src/content/claims.ts`, where §A
   authorises each one, because `/iletisim` published its own second copy of
   the phone number and the address. Two copies of a phone number is how a
   site ends up publishing two phone numbers. The values are unchanged, so the
   footer goldens do not move. */
const CONTACT = {
  phone: PUBLIC_PHONE,
  phoneHref: PUBLIC_PHONE_HREF,
  mail: SALES_EMAIL,
  mailHref: SALES_EMAIL_HREF,
} as const;

/* `USER_INPUTS.md` §L: LinkedIn, Instagram and Facebook are the permitted
   channels (Instagram and Facebook supplied by the owner on 2026-10-01);
   YouTube and X stay `NONE`. Only a supplied handle gets an icon — a dead icon
   is a promise the brand does not keep. */
const SOCIAL = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/mas-technic", Icon: Linkedin },
  { label: "Instagram", href: "https://www.instagram.com/mastechnic", Icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com/mastechnic", Icon: Facebook },
] as const;

/* ── Mobile disclosure ────────────────────────────────────────────────────
   `<h2><button aria-expanded aria-controls>` over a `role="region"` panel that
   carries a real `hidden` attribute — so a closed column is out of the tab
   order and out of the accessibility tree, not merely invisible. */
function FooterDisclosure({ group }: { group: FooterLinkGroup }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const base = useId().replace(/:/g, "");
  const triggerId = `shell-footer-${base}-trigger`;
  const panelId = `shell-footer-${base}-panel`;

  return (
    <div className="shell-footer-disclosure">
      <h2>
        <button
          type="button"
          id={triggerId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
        >
          <span>{t(group.title)}</span>
          <ChevronDown aria-hidden="true" data-open={open || undefined} />
        </button>
      </h2>
      <div id={panelId} role="region" aria-labelledby={triggerId} hidden={!open}>
        <ul>
          {group.items.map((item) => (
            <li key={item.href + item.label}>
              <Link to={item.href}>{t(item.label)}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Back to top ──────────────────────────────────────────────────────────
   Unchanged behaviour, moved here with the footer. Hidden below 768px by
   `src/index.css` (blocker B23 — the fixed global header's brand link already
   returns the reader to `/` at every width, and at 320 a 44px floating control
   covered footer text). Never shown on `/`, where it used to cover the pinned
   proof rail. */
function BackToTop() {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  const isLanding = stripLocale(useLocation().pathname) === "/";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    /* No listener at all on `/`: the control never shows there. */
    if (isLanding) { setVisible(false); return; }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const footer = document.querySelector("footer.tl-footer");
      const footerBelowViewport = (footer?.getBoundingClientRect().top ?? Infinity) > window.innerHeight;
      setVisible(max > 0 && window.scrollY > max * 0.3 && footerBelowViewport);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  if (!visible) return null;
  return createPortal(
    <div
      className="fixed z-50 pointer-events-auto"
      style={{
        bottom: "calc(1.5rem + var(--shell-safe-bottom))",
        left: "calc(1.5rem + var(--shell-safe-left))",
      }}
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })}
        className="floating-scroll-top"
        aria-label={t("Yukarı çık")}
      >
        <ArrowLeft className="h-4 w-4 rotate-90" aria-hidden="true" />
      </button>
    </div>,
    document.body,
  );
}

export function SiteFooter({ no = "14", label = "FOOTER", conversion = true }: { no?: string; label?: string; conversion?: boolean }) {
  const { t } = useTranslation();
  return (
    <>
      <ShellBand
        as="footer"
        no={no}
        label={label}
        className="tl-footer shell-footer"
        ariaLabel="Site altbilgisi"
      >
        {/* The subgrid is attached by class in `shell.css`, never in markup —
            a band body does not get to half-adopt the master grid. */}
        <div className="tl-footer-body">
          {/* THE CLOSING SCENE (polish run). The conversion rule used to be a
              thin strip squeezed between the link columns and the legal line;
              it is now the footer's first row and the last statement a reader
              meets on every page. `data-footer-newsletter` / `data-footer-cta`
              are unchanged contract markers — neither element animates. */}
          {/* UX01: the landing ends in its own RFQ band, so it renders the
              footer without this second quote call (`conversion={false}`). */}
          {conversion && (
          <div className="shell-footer-conversion">
            <div className="shell-footer-journal" data-footer-newsletter>
              <span className="shell-eyebrow">{t("SONRAKİ ADIM")}</span>
              <p className="pl-close-statement">
                {t("Toleransı siz yazın,")} <em>{t("gerisini ölçelim.")}</em>
              </p>
              <Link to="/blog">
                {t("Yazıları incele")}
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div className="shell-footer-actions" data-footer-cta>
              <Link className="shell-footer-primary" to={rfqLink.path}>
                {t("Hemen Teklif Al")}
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link className="shell-footer-secondary" to="/iletisim">{t("Bize Ulaşın")}</Link>
            </div>
          </div>
          )}

          <div className="tl-footer-brand">
            {/* `KANITLANMIŞ TESLİM.` iddiası kaldırıldı: §G CASE_STUDIES:
                NONE_PROVIDED_YET — "kanıtlanmış" var olmayan bir kanıta atıf
                yapıyordu. `İZLENEBİLİR` §0 PUBLIC_POSITIONING_PRIORITY'deki
                TRACEABILITY'yi karşılar, sitenin başka yerinde anlatılan lot
                ve ölçüm kaydı mekanizmasıyla birebir örtüşür ve aynı karakter
                sayısındadır, dolayısıyla satır kırılımı değişmez. */}
            <h2>{t("HASSAS ÜRETİM.")}<br />{t("İZLENEBİLİR TESLİM.")}</h2>
            {/* DOM order is address–address–phone–mail so a screen reader reads
                the postal address as one block. The two visual columns are
                built with explicit placement in CSS, which does not disturb
                that reading order. */}
            <address>
              <p><MapPin aria-hidden="true" /><span>{PUBLIC_ADDRESS_LINES[0]}</span></p>
              <p className="tl-addr-cont"><span>{PUBLIC_ADDRESS_LINES[1]}</span></p>
              <p className="tl-tel"><Phone aria-hidden="true" /><a href={CONTACT.phoneHref}>{CONTACT.phone}</a></p>
              <p className="tl-mail"><Mail aria-hidden="true" /><a href={CONTACT.mailHref}>{CONTACT.mail}</a></p>
            </address>
          </div>

          <nav aria-label={t("Altbilgi navigasyonu")}>
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3>{t(group.title)}</h3>
                {group.items.map((item) => (
                  <Link key={item.href + item.label} to={item.href}>{t(item.label)}</Link>
                ))}
              </div>
            ))}
          </nav>

          {/* The same four groups as disclosures below 768px. Two renderings of
              one derived list — never two lists. */}
          <div className="shell-footer-disclosures">
            {footerGroups.map((group) => (
              <FooterDisclosure key={group.title} group={group} />
            ))}
          </div>

          {/* The wordmark, resolved: full measure, never cropped by a rule or
              covered by a control. Each letter fills on hover. */}
          <div className="pl-wordmark" aria-hidden="true">
            <p>
              {"MAS TECHNIC".split("").map((ch, i) => (
                <span key={i} data-space={ch === " " || undefined}>{ch === " " ? " " : ch}</span>
              ))}
            </p>
          </div>

          <div className="tl-title-block">
            <div className="tl-social">
              {SOCIAL.map(({ label: name, href, Icon }) => (
                <a key={name} href={href} target="_blank" rel="noreferrer noopener" aria-label={name}>
                  <Icon aria-hidden="true" />
                </a>
              ))}
            </div>
            {/* The copyright line comes across from the mega footer's bottom
                bar: the title block never had one, and a site footer without
                it is an omission rather than a style choice. Its live `IST
                hh:mm:ss` clock did NOT come across — a readout that states
                nothing about the company. */}
            <p className="tl-meta-run">
              <span>© {new Date().getFullYear()} MAS TECHNIC</span>
              <span>{t("ÇİZEN")}: MAS TECHNIC</span>
              <span>{t("ÖLÇEK")}: 1:1</span>
              <span>{t("PAFTA")}: 01/14</span>
            </p>
            <p className="tl-legal">
              {legalLinks.map((link) => (
                <Link key={link.path} to={link.path}>{t(link.label)}</Link>
              ))}
              <svg className="tl-crosshair" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="7" />
                <path d="M12 0v24M0 12h24" />
              </svg>
            </p>
          </div>
        </div>
      </ShellBand>
      <BackToTop />
    </>
  );
}
