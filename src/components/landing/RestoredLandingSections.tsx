import { useRef, useState } from "react";
import { ArrowRight, Check, Gauge, ScanLine, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { toleranceMaterials } from "@/data/toleranceMaterials";
import { useMaterialCardMotion } from "@/hooks/useLandingMicroMotion";
import { EditorialKnowledgePreview } from "./EditorialKnowledgePreview";
import { DecisionPixelCard, type DecisionItem } from "./DecisionPixelCard";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

import blogMachining from "@/assets/blog-5eksen.webp";
import blogMaterial from "@/assets/blog-malzeme.webp";
import blogDfm from "@/assets/blog-dfm.webp";

const proofItems = [
  {
    icon: ShieldCheck,
    title: "Malzeme izlenebilirliği",
    // §C yalnızca ISO 9001, ISO 14001 ve OHSAS 18001 veriyor. `EN 10204 3.1`
    // bir belge sınıfını adlandırır ve alıcının kendi dosyası buna dayanır;
    // beyan edilmemiş bir standardı yayımlamak yerine uygulamanın kendisi
    // yazılıyor. İçerik aynı: talebe bağlı malzeme belgesi + lot kaydı.
    text: "Talebe göre malzeme sertifikası ve lot bazlı kayıt zinciri.",
  },
  {
    icon: ScanLine,
    title: "Boyutsal doğrulama",
    text: "Kritik karakteristikler için CMM ölçümü ve paylaşılabilir kontrol raporu.",
  },
  {
    icon: Gauge,
    title: "Üretime geçiş paketi",
    text: "Proje gereksinimine göre ilk parça kontrolü ve seri üretim kontrol planı için teknik kayıt.",
  },
] as const;

const faqs: readonly DecisionItem[] = [
  {
    id: "cad-formats",
    index: "01",
    category: "CAD / GİRDİ",
    question: "Teklif için hangi dosya formatlarını gönderebilirim?",
    answer: "STEP, STP, IGES, Parasolid, SolidWorks ve teknik resim formatlarını değerlendirebiliriz. Tolerans, malzeme ve adet bilgisini eklemek incelemeyi hızlandırır.",
  },
  {
    id: "prototype",
    index: "02",
    category: "ADET / PROSES",
    question: "Prototip ve düşük adetli üretim yapıyor musunuz?",
    answer: "Evet. Tek parça prototipten tekrarlı küçük serilere kadar süreç; fikstür, programlama ve kontrol gereksinimine göre planlanır.",
  },
  {
    id: "lead-time",
    index: "03",
    category: "TERMİN / PLAN",
    question: "Termin nasıl belirleniyor?",
    answer: "Termin; geometri, malzeme tedariki, proses sayısı, kalite dokümantasyonu ve mevcut kapasite birlikte değerlendirilerek teklif içinde netleştirilir.",
  },
  {
    id: "finishing",
    index: "04",
    category: "YÜZEY / ÇIKTI",
    question: "Yüzey işlemlerini de yönetiyor musunuz?",
    answer: "Anodizasyon, kaplama, ısıl işlem, pasivasyon ve benzeri ikincil prosesler proje gereksinimine göre koordine edilebilir.",
  },
] as const;

const knowledge = [
  { kind: "TEKNİK NOT", title: "5 Eksen CNC İşleme Avantajları", path: "/blog/5-eksen-cnc-isleme-avantajlari", image: blogMachining },
  { kind: "MALZEME", title: "Havacılık Parçalarında Malzeme Seçimi", path: "/blog/havacilik-parcalarinda-malzeme-secimi", image: blogMaterial },
  { kind: "MÜHENDİSLİK", title: "DFM: Tasarımdan Üretime Geçiş", path: "/blog/dfm-tasarimdan-uretime-gecis", image: blogDfm },
] as const;

export function MaterialsIntelligence() {
  const rootRef = useRef<HTMLElement>(null);
  useMaterialCardMotion(rootRef);

  return (
    <section ref={rootRef} id="malzemeler" className="lf-restored lf-materials" data-surface="light">
      <header className="lf-restored-head" data-lf-reveal>
        <div className="lf-kicker"><span>04</span> MALZEME ZEKÂSI</div>
        <h2 data-lf-cuttext>Doğru malzeme,<br /><em>doğru proses penceresi.</em></h2>
        <p>Seçilmiş alaşımları yalnız isimleriyle değil; tolerans hedefi, yüzey beklentisi ve kullanım bağlamıyla birlikte ele alıyoruz.</p>
      </header>
      <div className="lf-material-grid">
        {toleranceMaterials.map((material, index) => (
          <Link to="/malzemeler" className={`lf-material-card lf-material-${index + 1}`} key={material.code} data-lf-reveal data-cursor="open">
            <span>{material.code}</span>
            <h3>{material.name}</h3>
            <p>{material.subtitle}</p>
            <div className="lf-tolerance" aria-hidden="true"><i style={{ left: `${material.left}%`, width: `${material.width}%` }} /></div>
            <strong>{material.target}</strong>
            <small>{material.caption}</small>
            <ArrowRight />
          </Link>
        ))}
      </div>
      <Link className="lf-inline-link" to="/malzemeler">Tüm malzeme kütüphanesi <ArrowRight /></Link>
    </section>
  );
}

export function TrustProof() {
  return (
    <section id="referanslar" className="lf-restored lf-trust" data-surface="dark">
      <header className="lf-restored-head" data-lf-reveal>
        <div className="lf-kicker"><span>07</span> GÜVENİLİR ÜRETİM KANITI</div>
        <h2 data-lf-reveal="cut">Sözden fazlası:<br /><em>izlenebilir çıktı.</em></h2>
        <p>Her proje farklı bir doğrulama seviyesi ister. Kontrol kapsamını parçanın işlevi ve müşteri gereksinimi belirler.</p>
      </header>
      <div className="lf-proof-cards">
        {proofItems.map(({ icon: Icon, title, text }, index) => (
          <article key={title} data-lf-reveal>
            <span>0{index + 1}</span><Icon aria-hidden="true" />
            <h3>{title}</h3><p>{text}</p>
          </article>
        ))}
      </div>
      <div className="lf-cert-rail" aria-label="Desteklenen kalite dokümantasyonu" data-lf-reveal>
        {["KONTROL PLANI", "ÖLÇÜM KAYDI", "İLK PARÇA KONTROLÜ", "MALZEME İZLENEBİLİRLİĞİ"].map((item) => <span key={item}><Check />{item}</span>)}
      </div>
    </section>
  );
}

export function DecisionSupport() {
  const [openFaq, setOpenFaq] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section id="sss" className="lf-restored lf-decision" data-surface="light">
      <header className="lf-restored-head" data-lf-reveal>
        <div className="lf-kicker"><span>08</span> KARAR DESTEĞİ</div>
        <h2 data-lf-cuttext>Üretime geçmeden önce<br /><em>kritik dört yanıt.</em></h2>
        <p>Dosya formatından termin planına kadar teklif kararını etkileyen temel üretim girdilerini tek bakışta doğrulayın.</p>
      </header>
      <div className="lf-decision-layout">
        <div className="lf-decision-matrix" aria-label="Teklif öncesi karar matrisi">
          {faqs.map((faq, index) => (
            <DecisionPixelCard
              item={faq}
              active={openFaq === index}
              onActivate={() => setOpenFaq(index)}
              reducedMotion={prefersReducedMotion}
              key={faq.id}
            />
          ))}
          <Link className="lf-inline-link" to="/sss">Tüm sık sorulan sorular <ArrowRight /></Link>
        </div>
        <aside className="lf-decision-dossier" aria-label="Teknik bilgi dosyası">
          <div className="lf-decision-dossier-head" data-lf-reveal>
            <span>TEKNİK DOSYA</span>
            <small>03 / SEÇİLMİŞ İÇERİK</small>
          </div>
          <EditorialKnowledgePreview items={knowledge} />
        </aside>
      </div>
    </section>
  );
}
