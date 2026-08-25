import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { Phone, Mail, MapPin, Clock, Calendar, Video, ArrowRight, Send, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.4 },
});

export const Iletisim = () => {
  usePageMeta({ title: "İletişim", description: "CNC işleme, teklif talebi ve mühendislik desteği için Mas Technic ile iletişime geçin." });
  const [meetingForm, setMeetingForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    date: "",
    time: "",
    topic: "",
    notes: "",
  });

  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });

  const [meetingLoading, setMeetingLoading] = useState(false);

  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsed = meetingSchema.safeParse(meetingForm);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Geçersiz giriş.";
      toast.error(firstError);
      return;
    }

    setMeetingLoading(true);
    try {
      const v = parsed.data;
      const { error } = await supabase.from("meetings").insert({
        name: v.name,
        email: v.email,
        company: v.company || null,
        phone: v.phone || null,
        meeting_date: v.date,
        meeting_time: v.time,
        topic: v.topic,
        notes: v.notes || null,
      });
      if (error) throw error;
      toast.success("Toplantı talebiniz alındı! En kısa sürede Google Meet davet linki gönderilecektir.");
      setMeetingForm({ name: "", email: "", company: "", phone: "", date: "", time: "", topic: "", notes: "" });
    } catch {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setMeetingLoading(false);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Mesajınız başarıyla gönderildi!");
    setContactForm({ name: "", email: "", message: "" });
  };

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00",
  ];

  const topics = [
    "CNC Frezeleme Teklifi",
    "CNC Tornalama Teklifi",
    "Prototip Üretim",
    "Seri Üretim Görüşmesi",
    "Kalıp & Aparat Projesi",
    "Malzeme & Yüzey İşlemi Danışmanlık",
    "Genel Bilgi",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <JsonLdSchema type="contact" />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container-industrial py-12 md:py-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="accent-line" />
            <span className="text-technical text-muted-foreground uppercase tracking-widest text-sm">İletişim</span>
          </div>
          <h1 className="heading-industrial text-3xl md:text-5xl mb-4">Bize Ulaşın</h1>
          <p className="subheading-industrial text-lg max-w-2xl">
            Projeleriniz hakkında konuşmak, teklif almak veya online toplantı planlamak için bizimle iletişime geçin.
          </p>
        </section>

        <div className="container-industrial">
          {/* Contact Info Cards */}
          <motion.div {...fadeUp(0.1)} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Phone, label: "Telefon", value: "+90 (536) 564 51 94", href: "tel:+905365645194" },
              { icon: Mail, label: "E-posta", value: "info@mastechnic.com", href: "mailto:info@mastechnic.com" },
              { icon: MapPin, label: "Adres", value: "İzmir, Türkiye", href: "#" },
              { icon: Clock, label: "Çalışma Saatleri", value: "Pzt-Cum: 08:00-18:00", href: "#" },
            ].map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="flex items-start gap-4 border border-border bg-card p-5 hover:border-primary transition-all group"
                whileHover={{ y: -2 }}
              >
                <div className="w-10 h-10 bg-primary flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-shadow">
                  <item.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{item.label}</h3>
                  <p className="text-xs text-muted-foreground">{item.value}</p>
                </div>
              </motion.a>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Meeting Booking - Main */}
            <motion.div {...fadeUp(0.2)} className="lg:col-span-3">
              <div className="border border-primary bg-card">
                <div className="bg-primary p-5 flex items-center gap-3">
                  <Video size={22} className="text-primary-foreground" />
                  <div>
                    <h2 className="font-bold text-primary-foreground text-lg">Online Toplantı Planlayın</h2>
                    <p className="text-primary-foreground/70 text-xs">Google Meet üzerinden mühendislik ekibimizle görüşün</p>
                  </div>
                </div>

                <form onSubmit={handleMeetingSubmit} className="p-6 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Ad Soyad *</label>
                      <input
                        type="text"
                        required
                        value={meetingForm.name}
                        onChange={(e) => setMeetingForm({ ...meetingForm, name: e.target.value })}
                        className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder="Adınız Soyadınız"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">E-posta *</label>
                      <input
                        type="email"
                        required
                        value={meetingForm.email}
                        onChange={(e) => setMeetingForm({ ...meetingForm, email: e.target.value })}
                        className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder="ornek@firma.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Firma</label>
                      <input
                        type="text"
                        value={meetingForm.company}
                        onChange={(e) => setMeetingForm({ ...meetingForm, company: e.target.value })}
                        className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder="Firma Adı"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Telefon</label>
                      <input
                        type="tel"
                        value={meetingForm.phone}
                        onChange={(e) => setMeetingForm({ ...meetingForm, phone: e.target.value })}
                        className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder="+90 5XX XXX XX XX"
                      />
                    </div>
                  </div>

                  {/* Topic */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Toplantı Konusu *</label>
                    <select
                      required
                      value={meetingForm.topic}
                      onChange={(e) => setMeetingForm({ ...meetingForm, topic: e.target.value })}
                      className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Konu Seçin</option>
                      {topics.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date & Time */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tercih Edilen Tarih *</label>
                      <input
                        type="date"
                        required
                        value={meetingForm.date}
                        onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                        className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tercih Edilen Saat *</label>
                      <select
                        required
                        value={meetingForm.time}
                        onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                        className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Saat Seçin</option>
                        {timeSlots.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Ek Notlar</label>
                    <textarea
                      value={meetingForm.notes}
                      onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
                      rows={3}
                      className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                      placeholder="Toplantıda görüşmek istediğiniz konuları kısaca belirtin..."
                    />
                  </div>

                  <button type="submit" disabled={meetingLoading} className="btn-industrial-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                    <Calendar size={16} /> {meetingLoading ? "Gönderiliyor..." : "Toplantı Talep Et"}
                  </button>

                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                    <span>Talebiniz alındıktan sonra Google Meet davet linki e-posta adresinize gönderilecektir.</span>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Right Side - Quick Contact + Info */}
            <motion.div {...fadeUp(0.3)} className="lg:col-span-2 space-y-6">
              {/* Quick Message */}
              <div className="border border-border bg-card p-6">
                <h2 className="font-bold text-lg mb-1">Hızlı Mesaj</h2>
                <p className="text-xs text-muted-foreground mb-5">Kısa bir mesaj göndermek için bu formu kullanın.</p>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <input
                    type="text"
                    required
                    placeholder="Adınız"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  />
                  <input
                    type="email"
                    required
                    placeholder="E-posta"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  />
                  <textarea
                    required
                    placeholder="Mesajınız"
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
                  />
                  <button type="submit" className="btn-industrial-primary w-full flex items-center justify-center gap-2">
                    <Send size={14} /> Gönder
                  </button>
                </form>
              </div>

              {/* Meeting Benefits */}
              <div className="border border-border bg-card p-6">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-3">
                  <Video size={18} className="text-primary" />
                </div>
                <h3 className="font-bold text-sm mb-3">Online Toplantı Avantajları</h3>
                <div className="space-y-3">
                  {[
                    "Google Meet ile yüz yüze görüşme",
                    "Mühendislik ekibiyle teknik danışmanlık",
                    "CAD dosyalarınızı ekran paylaşımıyla inceleyin",
                    "30 dakikalık ücretsiz ilk görüşme",
                    "Toplantı sonrası detaylı teklif raporu",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="border border-primary bg-primary/5 p-6 text-center">
                <h3 className="font-bold text-sm mb-2">Acil mi?</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Hemen telefonla ulaşın, en hızlı şekilde yardımcı olalım.
                </p>
                <a
                  href="tel:+905365645194"
                  className="btn-industrial-primary !py-3 w-full flex items-center justify-center gap-2 text-xs"
                >
                  <Phone size={14} /> +90 (536) 564 51 94
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
