import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  PageShell,
  ShellAction,
  ShellNextStep,
  ShellPageHero,
  ShellRun,
  ShellSurfaceBand,
  ShellTitleBlock,
} from "@/components/shell";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { supabase } from "@/integrations/supabase/client";
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

const meetingSchema = z.object({
  name: z.string().trim().min(2, "Ad en az 2 karakter olmalı").max(100, "Ad en fazla 100 karakter olabilir"),
  email: z.string().trim().email("Geçerli bir e-posta adresi girin").max(255),
  company: z.string().max(100).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  date: z.string().min(1, "Tarih seçin"),
  time: z.string().min(1, "Saat seçin"),
  topic: z.string().min(1, "Konu seçin").max(200),
  notes: z.string().max(1000, "Notlar en fazla 1000 karakter olabilir").optional().or(z.literal("")),
});

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00",
];

const TOPICS = [
  "CNC Frezeleme Teklifi",
  "CNC Tornalama Teklifi",
  "Prototip Üretim",
  "Seri Üretim Görüşmesi",
  "Kalıp & Aparat Projesi",
  "Malzeme & Yüzey İşlemi Danışmanlık",
  "Genel Bilgi",
];

/* What the booking mechanism actually does. No duration, no price, no report:
   none of the three is a fact anybody supplied. */
const MEETING_SEQUENCE = [
  {
    title: "Talep kaydedilir",
    detail: "Formu gönderdiğinizde tarih, saat ve konu tercihiniz kayda alınır.",
  },
  {
    title: "Davet iletilir",
    detail: "Google Meet davet bağlantısı verdiğiniz e-posta adresine gönderilir.",
  },
  {
    title: "Görüşme",
    detail: "CAD dosyanızı ekran paylaşımıyla birlikte inceler, teknik soruları görüşürüz.",
  },
];

const emptyForm = {
  name: "", email: "", company: "", phone: "", date: "", time: "", topic: "", notes: "",
};

export const Iletisim = () => {
  usePageMeta({
    title: "İletişim",
    description: "CNC işleme, teklif talebi ve mühendislik desteği için Mas Technic ile iletişime geçin.",
  });

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const set = (field: keyof typeof emptyForm) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;

    const parsed = meetingSchema.safeParse(form);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message || "Geçersiz giriş.";
      setError(message);
      toast.error(message);
      return;
    }
    setError(null);
    setPending(true);
    try {
      const value = parsed.data;
      const { error: insertError } = await supabase.from("meetings").insert({
        name: value.name,
        email: value.email,
        company: value.company || null,
        phone: value.phone || null,
        meeting_date: value.date,
        meeting_time: value.time,
        topic: value.topic,
        notes: value.notes || null,
      });
      if (insertError) throw insertError;
      toast.success("Toplantı talebiniz alındı. Google Meet davet bağlantısı e-posta ile iletilecek.");
      setForm(emptyForm);
    } catch {
      const message = "Talep gönderilemedi. Lütfen tekrar deneyin veya doğrudan e-posta gönderin.";
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <PageShell surface="graphite" rail={{ no: "C2", label: "İLETİŞİM" }}>
      <JsonLdSchema type="contact" />

      <ShellPageHero
        no="01"
        label="İLETİŞİM"
        eyebrow="İletişim"
        title="Bize ulaşın"
        lede="Teknik resminizi göndermek, bir görüşme planlamak veya doğrudan konuşmak için üç yol var. Hangisi işinize uyuyorsa onu seçin."
        meta={[
          { label: "Telefon", value: PUBLIC_PHONE },
          { label: "E-posta", value: SALES_EMAIL },
          { label: "Merkez", value: PUBLIC_ADDRESS_LINES.join(" ") },
          { label: "Teklif dönüşü", value: QUOTE_RESPONSE_TIME },
        ]}
        actions={
          <>
            <ShellAction to="/teklif-al" variant="primary">Teklif Al</ShellAction>
            <ShellAction href="#toplanti" variant="ghost">Toplantı planla</ShellAction>
          </>
        }
      />

      <ShellSurfaceBand no="02" label="YÖNLENDİRME" tone="paper" labelledBy="iletisim-yon">
        <div className="shell-span-read">
          <ShellTitleBlock
            id="iletisim-yon"
            index="02"
            title="Nasıl ilerleyelim?"
            standfirst="Elinizde ne olduğuna göre değişir. Teknik resim varsa birinci yol en hızlısıdır."
          />
        </div>
        <ShellRun
          ariaLabel="İletişim yolları"
          items={[
            {
              title: "Teknik teklif",
              detail: `Teknik resim veya 3B modelinizi yükleyin; üretilebilirlik incelemesiyle birlikte fiyat çalışması yapalım. Dönüş süresi ${QUOTE_RESPONSE_TIME}.`,
              action: <ShellAction to="/teklif-al" variant="primary">Teklif Al</ShellAction>,
            },
            {
              title: "Teknik görüşme",
              detail: "Dosya henüz netleşmediyse mühendislik ekibiyle ekran paylaşımlı bir görüşme planlayın.",
              action: <ShellAction href="#toplanti" variant="ghost">Toplantı planla</ShellAction>,
            },
            {
              title: "Doğrudan hat",
              detail: `Kısa bir soru için telefon veya e-posta. ${PUBLIC_ADDRESS_LINES.join(" ")}.`,
              action: <ShellAction href={PUBLIC_PHONE_HREF} variant="ghost">{PUBLIC_PHONE}</ShellAction>,
            },
          ]}
        />
      </ShellSurfaceBand>

      <ShellSurfaceBand no="03" label="TOPLANTI" id="toplanti" labelledBy="iletisim-toplanti">
        <div className="shell-doc">
          <div className="shell-doc-main">
            <ShellTitleBlock
              id="iletisim-toplanti"
              index="03"
              title="Online toplantı planlayın"
              standfirst="Tercih ettiğiniz tarih ve saati bırakın; uygunluk teyidiyle birlikte davet bağlantısını gönderelim."
            />
            <form className="shell-form" onSubmit={handleSubmit} noValidate>
              <div className="shell-form-row">
                <div className="shell-field">
                  <label htmlFor="toplanti-ad">Ad soyad *</label>
                  <input
                    id="toplanti-ad"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Adınız Soyadınız"
                  />
                </div>
                <div className="shell-field">
                  <label htmlFor="toplanti-eposta">E-posta *</label>
                  <input
                    id="toplanti-eposta"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="ornek@firma.com"
                  />
                </div>
                <div className="shell-field">
                  <label htmlFor="toplanti-firma">Firma</label>
                  <input
                    id="toplanti-firma"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    value={form.company}
                    onChange={set("company")}
                    placeholder="Firma adı"
                  />
                </div>
                <div className="shell-field">
                  <label htmlFor="toplanti-telefon">Telefon</label>
                  <input
                    id="toplanti-telefon"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
              </div>

              <div className="shell-field">
                <label htmlFor="toplanti-konu">Toplantı konusu *</label>
                <select id="toplanti-konu" name="topic" required value={form.topic} onChange={set("topic")}>
                  <option value="">Konu seçin</option>
                  {TOPICS.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
                </select>
              </div>

              <div className="shell-form-row">
                <div className="shell-field">
                  <label htmlFor="toplanti-tarih">Tercih edilen tarih *</label>
                  <input
                    id="toplanti-tarih"
                    name="date"
                    type="date"
                    required
                    value={form.date}
                    onChange={set("date")}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="shell-field">
                  <label htmlFor="toplanti-saat">Tercih edilen saat *</label>
                  <select id="toplanti-saat" name="time" required value={form.time} onChange={set("time")}>
                    <option value="">Saat seçin</option>
                    {TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                </div>
              </div>

              <div className="shell-field">
                <label htmlFor="toplanti-not">Ek notlar</label>
                <textarea
                  id="toplanti-not"
                  name="notes"
                  rows={4}
                  value={form.notes}
                  onChange={set("notes")}
                  placeholder="Görüşmek istediğiniz konuları kısaca yazın."
                />
              </div>

              {/* The error was a toast only. A toast is transient and is not
                  attached to the form, so a screen-reader user who missed it
                  had no way back to the reason. */}
              <p className="shell-form-error" role="alert">{error}</p>

              <ShellAction type="submit" variant="primary" disabled={pending}>
                {pending ? "Gönderiliyor…" : "Toplantı talep et"}
              </ShellAction>
            </form>
          </div>

          <div className="shell-doc-aside">
            <p className="shell-eyebrow">Ne oluyor?</p>
            <ShellRun ariaLabel="Toplantı akışı" items={MEETING_SEQUENCE} />
            <p className="shell-note">
              Teknik resminiz hazırsa toplantıyı beklemeden teklif dosyası açabilirsiniz.
            </p>
            <ShellAction href={SALES_EMAIL_HREF} variant="ghost">{SALES_EMAIL}</ShellAction>
          </div>
        </div>
      </ShellSurfaceBand>

      <ShellNextStep
        no="04"
        title="Teknik resminiz hazır mı?"
        body="Teklif dosyası, görüşmeye göre daha hızlı ilerler: dosyayı yükleyin, üretilebilirlik incelemesiyle birlikte dönelim."
        detail={[
          { label: "Dönüş süresi", value: QUOTE_RESPONSE_TIME },
          { label: "E-posta", value: SALES_EMAIL },
          { label: "Telefon", value: PUBLIC_PHONE },
        ]}
        secondary={{ label: "Toplantı planla", href: "#toplanti" }}
      />
    </PageShell>
  );
};
