import { ChevronDown, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import blog5eksen from "@/assets/blog-5eksen.jpg";
import blogMalzeme from "@/assets/blog-malzeme.jpg";
import blogDfm from "@/assets/blog-dfm.jpg";
import { SectionHeader } from "./SectionHeader";

const faqs = [
  {
    question: "Minimum sipariş adedi nedir?",
    answer:
      "Minimum sipariş adedi bulunmamaktadır. Tek parça prototipten seri üretime kadar her ölçekte hizmet veriyoruz.",
  },
  {
    question: "Hangi dosya formatlarını kabul ediyorsunuz?",
    answer:
      "STEP, IGES, DXF, DWG, SOLIDWORKS (.sldprt, .sldasm), Autodesk Inventor (.ipt), PDF ve 2D teknik çizim formatlarını kabul ediyoruz.",
  },
  {
    question: "Teslim süresi ne kadardır?",
    answer:
      "Prototip üretimde 3-5 iş günü, küçük serilerde 1-2 hafta, seri üretimde proje bazlı planlama yapılır. Acil üretim seçeneğimiz de mevcuttur.",
  },
  {
    question: "Kalite belgeniz var mı?",
    answer:
      "ISO 9001:2015, AS9100D, IATF 16949 ve ISO 14001 belgelerine sahibiz. Havacılık, otomotiv ve medikal sektörlerine uygun üretim yapıyoruz.",
  },
  {
    question: "Yüzey işleme hizmetiniz var mı?",
    answer:
      "Anodizasyon, kaplama, boyama, kumlama, parlatma ve ısıl işlem gibi yüzey işleme hizmetlerini de sunuyoruz veya koordine ediyoruz.",
  },
  {
    question: "Hangi sektörlere hizmet veriyorsunuz?",
    answer:
      "Havacılık & uzay, otomotiv, medikal, robotik, savunma sanayi, enerji ve genel endüstriyel üretim sektörlerine hizmet veriyoruz. Her sektöre özel kalite standartlarına uygun üretim yapabiliyoruz.",
  },
  {
    question: "Teklifinizi ne kadar sürede alırım?",
    answer:
      "Teknik çizimlerinizi gönderdikten sonra genellikle 24-48 saat içinde detaylı fiyat teklifimizi iletiyoruz. Acil talepler için aynı gün teklif seçeneğimiz de mevcuttur.",
  },
];

const blogPosts = [
  {
    slug: "5-eksen-cnc-isleme-avantajlari",
    title: "5 Eksen CNC İşleme Avantajları",
    excerpt:
      "Karmaşık geometrilerde tek seferde işleme imkanı ve yüzey kalitesi artışı...",
    date: "15 Ocak 2024",
    category: "Teknik",
    image: blog5eksen,
  },
  {
    slug: "havacilik-parcalarinda-malzeme-secimi",
    title: "Havacılık Parçalarında Malzeme Seçimi",
    excerpt:
      "Alüminyum 7075 vs Titanyum: Mukavemet, ağırlık ve maliyet karşılaştırması...",
    date: "8 Ocak 2024",
    category: "Malzeme",
    image: blogMalzeme,
  },
  {
    slug: "dfm-tasarimdan-uretime-gecis",
    title: "DFM: Tasarımdan Üretime Geçiş",
    excerpt:
      "Design for Manufacturing prensipleri ile maliyetleri düşürün ve kaliteyi artırın...",
    date: "2 Ocak 2024",
    category: "Mühendislik",
    image: blogDfm,
  },
];

export const FAQBlogSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const prefersReduced = usePrefersReducedMotion();

  const faqCardVariants = {
    hidden: prefersReduced ? { opacity: 1, rotateY: 0 } : { opacity: 0, rotateY: 90 },
    visible: (i: number) => ({
      opacity: 1,
      rotateY: 0,
      transition: { duration: 0.5, delay: i * 0.08, ease: [0.76, 0, 0.24, 1] as [number, number, number, number] },
    }),
  };

  return (
    <section
      id="sss"
      className="section-tone-knowledge section-industrial flex flex-col justify-center border-y border-border py-16 md:py-24 lg:py-28"
      style={{ perspective: 1200 }}
    >
      <div className="container-industrial">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* FAQ Column */}
          <div>
            <div className="mb-8">
              <SectionHeader tag="SSS" title="Sıkça Sorulan Sorular" sectionNumber={6} />
            </div>

            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {faqs.map((faq, index) => (
                <motion.div key={index} className="border border-border bg-background" custom={index} variants={faqCardVariants}>
                  <button
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                    className="w-full flex items-center justify-between p-4 text-center md:text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium pr-4 text-center md:text-left w-full">
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="px-4 pb-4 text-muted-foreground text-sm leading-relaxed border-t border-border pt-4 text-center md:text-left">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center md:text-left mt-6">
              <Link
                to="/sss"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors"
              >
                {"Tüm Sorular"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Blog Column */}
          <div>
            <div className="mb-8">
              <SectionHeader tag="Blog" title="Teknik İçerikler" sectionNumber={7} />
            </div>

            <div className="space-y-4">
              {blogPosts.map((post, index) => (
                <Link
                  key={index}
                  to={`/blog/${post.slug}`}
                  className="flex flex-col md:flex-row gap-4 border border-border bg-background p-3 hover:border-primary transition-colors group overflow-hidden"
                >
                  <div className="w-full md:w-28 h-40 md:h-24 flex-shrink-0 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                      <span className="text-technical text-xs text-primary">
                        {post.category}
                      </span>
                      <span className="text-muted-foreground">{"·"}</span>
                      <span className="text-xs text-muted-foreground">
                        {post.date}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-1 mt-2 text-xs text-primary">
                      {"Devamını Oku"}
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center md:text-left mt-6">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors"
              >
                {"Tüm Yazılar"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
