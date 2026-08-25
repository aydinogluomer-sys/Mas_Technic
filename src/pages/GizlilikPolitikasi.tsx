import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const GizlilikPolitikasi = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="pt-24 pb-16">
      <div className="container-industrial">
        <div className="max-w-3xl mx-auto prose prose-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] mb-3 block text-primary">Yasal</span>
          <h1 className="heading-industrial text-3xl md:text-4xl mb-8">Gizlilik Politikası</h1>
          <p className="text-muted-foreground mb-6">Son güncelleme: 1 Ocak 2024</p>
          <div className="space-y-6 text-muted-foreground text-sm leading-relaxed">
            <section><h2 className="text-lg font-semibold text-foreground mb-3">1. Veri Sorumlusu</h2><p>Mas Technic Precision CNC ("Şirket"), kişisel verilerinizin korunması konusunda büyük hassasiyet göstermektedir.</p></section>
            <section><h2 className="text-lg font-semibold text-foreground mb-3">2. Toplanan Veriler</h2><p>Ad-soyad, e-posta, telefon numarası, şirket bilgileri ve teknik çizim dosyaları gibi veriler toplanabilir.</p></section>
            <section><h2 className="text-lg font-semibold text-foreground mb-3">3. Verilerin Kullanımı</h2><p>Toplanan veriler yalnızca teklif hazırlama, üretim süreçleri ve müşteri iletişimi amacıyla kullanılır.</p></section>
            <section><h2 className="text-lg font-semibold text-foreground mb-3">4. Veri Güvenliği</h2><p>Tüm veriler şifreli ortamlarda saklanır ve yetkisiz erişime karşı korunur.</p></section>
            <section><h2 className="text-lg font-semibold text-foreground mb-3">5. İletişim</h2><p>Gizlilik politikamız hakkında sorularınız için info@mastechnic.com adresinden bize ulaşabilirsiniz.</p></section>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);
