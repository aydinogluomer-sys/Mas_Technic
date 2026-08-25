import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { Target, Users, Award, Globe } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";

export const Hakkimizda = () => {
  usePageMeta({ title: "Hakkımızda", description: "Mas Technic — hassas CNC işleme, talaşlı imalat ve mühendislik çözümleri sunan güvenilir üretim partneri." });
  return (
  <div className="min-h-screen bg-background">
    <Header />
    <JsonLdSchema type="about" />
    <main className="pt-24 pb-16">
      <div className="container-industrial">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] mb-3 block text-primary">Kurumsal</span>
          <h1 className="heading-industrial text-3xl md:text-4xl mb-4">Hakkımızda</h1>
          <p className="subheading-industrial text-lg mb-12">Hassasiyet, güvenilirlik ve mühendislik mükemmelliği</p>

          <div className="space-y-8 text-muted-foreground text-sm leading-relaxed mb-16">
            <p>Mas Technic, CNC freze, torna ve talaşlı imalat alanında yüksek hassasiyetli üretim çözümleri sunan bir mühendislik firmasıdır. Havacılık, otomotiv, medikal ve robotik gibi kritik sektörlere hizmet vermekteyiz.</p>
            <p>ISO 9001:2015, AS9100D ve IATF 16949 sertifikalarına sahip üretim tesisimizde, en son teknoloji CNC tezgahları ve CMM ölçüm sistemleri ile ±0.005mm hassasiyette üretim gerçekleştiriyoruz.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: "Misyon", desc: "Müşterilerimize en yüksek kalitede hassas üretim çözümleri sunmak" },
              { icon: Globe, title: "Vizyon", desc: "Avrupa'nın önde gelen hassas işleme merkezlerinden biri olmak" },
              { icon: Users, title: "Ekip", desc: "50+ deneyimli mühendis ve teknisyenden oluşan uzman kadro" },
              { icon: Award, title: "Kalite", desc: "Uluslararası standartlarda sertifikalı üretim süreçleri" },
            ].map((item) => (
              <div key={item.title} className="border border-border bg-card p-6">
                <item.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
  );
};
