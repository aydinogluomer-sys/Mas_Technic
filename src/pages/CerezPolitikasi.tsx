import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const CerezPolitikasi = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="pt-24 pb-16">
      <div className="container-industrial">
        <div className="max-w-3xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] mb-3 block text-primary">Yasal</span>
          <h1 className="heading-industrial text-3xl md:text-4xl mb-8">Çerez Politikası</h1>
          <p className="text-muted-foreground mb-6 text-sm">Son güncelleme: 1 Ocak 2024</p>
          <div className="space-y-6 text-muted-foreground text-sm leading-relaxed">
            <section><h2 className="text-lg font-semibold text-foreground mb-3">1. Çerez Nedir?</h2><p>Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza yerleştirilen küçük metin dosyalarıdır.</p></section>
            <section><h2 className="text-lg font-semibold text-foreground mb-3">2. Kullanılan Çerez Türleri</h2><p>Zorunlu çerezler, performans çerezleri ve analitik çerezler kullanmaktayız.</p></section>
            <section><h2 className="text-lg font-semibold text-foreground mb-3">3. Çerez Yönetimi</h2><p>Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz. Ancak bu durumda web sitemizin bazı işlevleri düzgün çalışmayabilir.</p></section>
            <section><h2 className="text-lg font-semibold text-foreground mb-3">4. İletişim</h2><p>Çerez politikamız hakkında sorularınız için info@mastechnic.com adresinden bize ulaşabilirsiniz.</p></section>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);
