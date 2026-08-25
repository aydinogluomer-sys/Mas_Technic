import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const KVKK = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="pt-24 pb-16">
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
            <section><h2 className="text-lg font-semibold text-foreground mb-3">5. İletişim</h2><p>Başvurularınız için: info@mastechnic.com</p></section>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);
