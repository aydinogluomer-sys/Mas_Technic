import { PageShell } from "@/components/shell/PageShell";

/* Shell only (Phase 04): the page no longer builds its own frame — no
   `min-h-screen bg-background` wrapper, no `<Header/>`, no `<main class="pt-24
   pb-16">` (that 96px was a second reservation on top of `.tl-header-spacer`),
   no `<Footer/>`. The body below is untouched; Phase 08 owns the legal pages'
   composition and copy. */
export const KVKK = () => (
  <PageShell rail={{ no: "L1", label: "KVKK" }}>
    <div className="container-industrial">
      <div className="max-w-3xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-[0.4em] mb-3 block text-primary">Yasal</span>
        <h1 className="heading-industrial text-3xl md:text-4xl mb-8">KVKK Aydınlatma Metni</h1>
        <p className="text-muted-foreground mb-6 text-sm">Son güncelleme: 1 Ocak 2024</p>
        <div className="space-y-6 text-muted-foreground text-sm leading-relaxed">
          <section><h2 className="text-lg font-semibold text-foreground mb-3">1. Veri Sorumlusu</h2><p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, Mas Technic veri sorumlusu sıfatıyla kişisel verilerinizi işlemektedir.</p></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">2. Kişisel Verilerin İşlenme Amacı</h2><p>Kişisel verileriniz; teklif hazırlama, sipariş yönetimi, üretim takibi, fatura düzenleme ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmektedir.</p></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">3. Kişisel Verilerin Aktarılması</h2><p>Kişisel verileriniz, yasal zorunluluklar ve iş ortaklıkları kapsamında üçüncü kişilere aktarılabilir.</p></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">4. Haklarınız</h2><p>KVKK'nın 11. maddesi gereğince; kişisel verilerinizin işlenip işlenmediğini öğrenme, düzeltme ve silinmesini talep etme hakkına sahipsiniz.</p></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">5. İletişim</h2><p>Başvurularınız için: sales@mastechnic.com</p></section>
        </div>
      </div>
    </div>
  </PageShell>
);
