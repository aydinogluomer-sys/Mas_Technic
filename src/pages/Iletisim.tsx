import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { upper } from "@/i18n/upper";
import { useLocation } from "react-router-dom";
import { Link } from "@/i18n/LocaleLink";
import { ArrowRight, ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { PageShell, ShellBreadcrumb } from "@/components/shell";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { BookingDialog, BOOKING_LINK } from "@/components/contact/BookingDialog";
import { usePageMeta } from "@/hooks/use-page-meta";
import "@/styles/contact-studio.css";
import {
  PUBLIC_ADDRESS_LINES,
  PUBLIC_PHONE,
  PUBLIC_PHONE_HREF,
  QUOTE_RESPONSE_TIME,
  SALES_EMAIL,
  SALES_EMAIL_HREF,
} from "@/content/claims";

/* ══════════════════════════════════════════════════════════════════════════
   İLETİŞİM — three routes, one of which is the RFQ

   THE ACCEPTANCE CRITERION THIS PAGE FAILED
   -----------------------------------------
   "Contact page must feel like part of the same system and route naturally
   into RFQ." It did neither. The page was four `border border-border bg-card`
   contact tiles over a `border-primary` panel with a teal header bar, beside a
   quick-message card, an "Online Toplantı Avantajları" checkmark card and an
   "Acil mi?" `bg-primary/5` tile. `/teklif-al` — the site's actual quote flow —
   was not linked from it once.

   Three routes are now the page's structure, in the order a buyer needs them:
   a technical quote (`/teklif-al`), a technical conversation (the booking form
   below), and the direct line. The RFQ is route 01.

   TWO THINGS WERE REMOVED, AND BOTH REMOVALS ARE THE POINT
   --------------------------------------------------------
   1. THE QUICK-MESSAGE FORM. Its submit handler was:

          const handleContactSubmit = (e) => {
            e.preventDefault();
            toast.success("Mesajınız başarıyla gönderildi!");
            setContactForm({ name: "", email: "", message: "" });
          };

      No network call of any kind. It told the reader their message had been
      sent and then discarded it. A form that lies about delivery is worse than
      no form, and the page already offers two paths that genuinely deliver —
      the meeting request below (which does insert into `meetings`) and
      `/teklif-al`. The direct e-mail address is route 03.

   2. THE "AVANTAJLAR" LIST. It promised "30 dakikalık ücretsiz ilk görüşme"
      and "Toplantı sonrası detaylı teklif raporu". Neither is a fact in
      `USER_INPUTS.md`; §D authorises capability figures, not commitments. The
      aside now states what the mechanism actually does.

   Working hours ("Pzt-Cum: 08:00-18:00") are also gone from the published
   copy: no field authorises them and nothing on the page depends on them —
   the booking form's own slot list is the operative information, and it is UI
   rather than a claim. `QUOTE_RESPONSE_TIME` takes the slot in the hero.

   WHAT WAS FIXED WHILE THE FORM WAS REBUILT
   -----------------------------------------
   Every field had a bare `<label>` with no `htmlFor` and no `id` on the
   control, so not one label was programmatically associated (WCAG 1.3.1 /
   3.3.2). They are associated now, the validation error is announced through a
   live region instead of only a toast, and the submit control is disabled
   while a request is in flight.
   ══════════════════════════════════════════════════════════════════════════ */

/* ROUND 2 — THE BOOKING STUDIO. The meeting form wrote a `meetings` row and
   promised a Meet invite that staff then had to send by hand. Availability,
   the invite and the reminders now come from the owner's Google Calendar
   appointment schedule, embedded in `BookingDialog`; the page is one
   composition — booking on the left, the direct line and the quote route on
   the right — instead of hero + three bands + next-step. */

export const Iletisim = () => {
  const { t, i18n } = useTranslation();
  usePageMeta({
    title: t("İletişim"),
    description: t("CNC işleme, teklif talebi ve mühendislik desteği için Mas Technic ile iletişime geçin."),
  });

  const location = useLocation();
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = useCallback(() => setBookingOpen(true), []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);

  /* `/iletisim?randevu` opens the dialog directly — the menu, the quote
     studio and the landing link here. `#toplanti` keeps landing on the card. */
  useEffect(() => {
    if (new URLSearchParams(location.search).has("randevu")) setBookingOpen(true);
  }, [location.search]);

  const lang = i18n.language ?? "tr";

  return (
    <PageShell surface="graphite" className="contact-page" rail={{ no: "C2", label: "İLETİŞİM" }}>
      <JsonLdSchema type="contact" />

      <section className="contact-studio" aria-labelledby="shell-page-title">
        <header className="contact-head">
          <ShellBreadcrumb trail={[{ label: "Ana sayfa", to: "/" }, { label: "İletişim" }]} />
          <p className="shell-eyebrow">{upper(t("İLETİŞİM · İZMİR · TEKLİF DÖNÜŞÜ {{time}}", { time: t(QUOTE_RESPONSE_TIME) }), lang)}</p>
          <h1 id="shell-page-title">{t("Bize ulaşın")}</h1>
          <p className="contact-lede">
            {t("Geometriyi birlikte okumak için bir görüşme planlayın ya da doğrudan yazın. Teknik resminiz hazırsa en hızlı yol teklif dosyasıdır.")}
          </p>
        </header>

        <div className="contact-grid">
          <article className="booking-card" id="toplanti" aria-labelledby="booking-card-title">
            <p className="booking-card-code">{t("01 · TEKNİK GÖRÜŞME")}</p>
            <h2 id="booking-card-title">
              {t("Parçanızı")} <em>{t("ekranda birlikte")}</em> {t("okuyalım.")}
            </h2>
            <p className="booking-card-lede">
              {t("Google Meet üzerinden ekran paylaşımlı görüşme. Uygun saati takvimden seçin; davet ve hatırlatma e-postanıza otomatik gelir.")}
            </p>

            {/* UX04 — the seven-day strip is gone. It printed the next seven
                workdays as if they were open slots, but no availability is
                known here; Google Calendar holds it. One control opens the
                real calendar, the new-tab link stays beside it. */}
            <ol className="booking-steps">
              <li><span>01</span>{t("Takvimden uygun saati seçin.")}</li>
              <li><span>02</span>{t("Google Meet daveti e-postanıza gelir.")}</li>
              <li><span>03</span>{t("Görüşmede dosyanızı ve toleranslarınızı birlikte inceleriz.")}</li>
            </ol>

            <div className="booking-card-actions">
              <button type="button" className="booking-primary" onClick={openBooking} data-testid="booking-open">
                {t("Uygun saatleri takvimde görüntüle")}
                <ArrowRight aria-hidden="true" />
              </button>
              <a className="booking-newtab" href={BOOKING_LINK} target="_blank" rel="noopener noreferrer">
                {t("Randevuyu yeni sekmede aç")}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </article>

          <aside className="contact-lines" aria-label={t("Doğrudan hat")}>
            <p className="booking-card-code">{t("02 · DOĞRUDAN HAT")}</p>
            <a className="contact-line" href={PUBLIC_PHONE_HREF}>
              <Phone aria-hidden="true" />
              <span><small>{t("TELEFON")}</small>{PUBLIC_PHONE}</span>
            </a>
            <a className="contact-line" href={SALES_EMAIL_HREF}>
              <Mail aria-hidden="true" />
              <span><small>{t("E-POSTA")}</small>{SALES_EMAIL}</span>
            </a>
            <p className="contact-line contact-line--static">
              <MapPin aria-hidden="true" />
              <span><small>{t("MERKEZ")}</small>{PUBLIC_ADDRESS_LINES.join(" ")}</span>
            </p>

            <div className="contact-quote">
              <p className="booking-card-code">{t("03 · TEKNİK TEKLİF")}</p>
              <p className="contact-quote-title">{t("Teknik resminiz hazır mı?")}</p>
              <p>{t("Dosyayı yükleyin; üretilebilirlik incelemesiyle birlikte {{time}} içinde dönelim.", { time: t(QUOTE_RESPONSE_TIME) })}</p>
              <Link className="booking-primary booking-primary--paper" to="/teklif-al">
                {t("Teklif al")}
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <BookingDialog open={bookingOpen} onClose={closeBooking} />
    </PageShell>
  );
};

export default Iletisim;
