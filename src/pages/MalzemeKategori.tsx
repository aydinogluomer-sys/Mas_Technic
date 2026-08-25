import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { materialsData, materialCategories, findMaterialCategory } from "@/data/materialsData";
import { usePageMeta } from "@/hooks/use-page-meta";

const getPriceLabel = (p: string) => {
  switch (p) {
    case "low": return { text: "Ekonomik", cls: "bg-emerald-100 text-emerald-800" };
    case "medium": return { text: "Orta", cls: "bg-amber-100 text-amber-800" };
    case "high": return { text: "Premium", cls: "bg-rose-100 text-rose-800" };
    default: return { text: "-", cls: "" };
  }
};

export const MalzemeKategori = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = findMaterialCategory(slug || "");

  usePageMeta({
    title: category?.seoTitle ?? "Malzemeler",
    description: category?.seoDescription,
  });

  if (!category) return <Navigate to="/malzemeler" replace />;

  const materials = materialsData.filter(m => m.subcategory === category.subcategoryKey);
  const relatedCategories = materialCategories.filter(c => category.relatedCategories.includes(c.slug));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.95) 0%, var(--surface-base) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(to right, rgb(var(--text-primary-rgb) / 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--text-primary-rgb) / 0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="container-industrial relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: "rgb(var(--text-primary-rgb) / 0.5)" }}>
            <Link to="/" className="transition-colors hover:opacity-80" style={{ color: "rgb(var(--text-primary-rgb) / 0.8)" }}>Ana Sayfa</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/malzemeler" className="transition-colors hover:opacity-80" style={{ color: "rgb(var(--text-primary-rgb) / 0.8)" }}>Malzemeler</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium" style={{ color: "rgb(var(--text-primary-rgb) / 0.9)" }}>{category.name}</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <span className="text-4xl mb-4 block">{category.icon}</span>
            <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>{category.heroTitle}</h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "rgb(var(--text-primary-rgb) / 0.7)" }}>{category.heroDescription}</p>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <article className="container-industrial py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Intro */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold text-foreground mb-4">{category.name} Nedir?</h2>
            <p className="text-muted-foreground leading-relaxed">{category.content.intro}</p>
          </motion.section>

          {/* Advantages */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-primary/5 border border-primary/10 rounded-xl p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">{category.name} Avantajları</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {category.advantages.map((adv, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{adv}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Properties */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold text-foreground mb-4">Mekanik ve Fiziksel Özellikler</h2>
            <p className="text-muted-foreground leading-relaxed">{category.content.properties}</p>
          </motion.section>

          {/* Applications */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold text-foreground mb-4">Kullanım Alanları</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{category.content.applications}</p>
            <div className="flex flex-wrap gap-2">
              {category.commonApplications.map((app, i) => (
                <span key={i} className="px-4 py-2 text-sm font-medium bg-muted text-muted-foreground rounded-full">{app}</span>
              ))}
            </div>
          </motion.section>

          {/* Machining */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold text-foreground mb-4">CNC İşleme Özellikleri</h2>
            <p className="text-muted-foreground leading-relaxed">{category.content.machining}</p>
          </motion.section>

          {/* Selection Guide */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-muted/50 border border-border rounded-xl p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Malzeme Seçim Rehberi</h2>
            <p className="text-muted-foreground leading-relaxed">{category.content.selection}</p>
          </motion.section>
        </div>
      </article>

      {/* Materials in this category */}
      <section className="bg-muted/30 py-12">
        <div className="container-industrial">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">{category.name} Alaşımlarımız ({materials.length})</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {materials.map(mat => {
              const price = getPriceLabel(mat.priceCategory);
              return (
                <div key={mat.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{mat.subcategory}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${price.cls}`}>{price.text}</span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">{mat.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{mat.description}</p>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div><span className="text-muted-foreground">Yoğunluk:</span> <span className="font-semibold">{mat.density}</span></div>
                    <div><span className="text-muted-foreground">Mukavemet:</span> <span className="font-semibold">{mat.tensileStrength}</span></div>
                    <div><span className="text-muted-foreground">Sertlik:</span> <span className="font-semibold">{mat.hardness}</span></div>
                    <div><span className="text-muted-foreground">İşlenebilirlik:</span> <span className="font-semibold">{mat.machinability}/5</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Related Categories */}
      {relatedCategories.length > 0 && (
        <section className="container-industrial py-12">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">İlgili Malzeme Kategorileri</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {relatedCategories.map(rc => (
              <Link key={rc.slug} to={`/malzemeler/${rc.slug}`} className="group p-6 bg-card border border-border rounded-lg hover:border-primary/40 hover:shadow-md transition-all">
                <span className="text-3xl block mb-2">{rc.icon}</span>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{rc.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{rc.shortDescription}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-3">
                  İncele <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16" style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, var(--surface-base) 100%)" }}>
        <div className="container-industrial text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>{category.name} ile CNC Parça Üretimi</h2>
          <p className="mb-8 max-w-lg mx-auto" style={{ color: "rgb(var(--text-primary-rgb) / 0.7)" }}>Projeniz için en uygun {category.name.toLowerCase()} alaşımını birlikte belirleyelim.</p>
          <Link to="/iletisim" className="btn-industrial-primary inline-block px-8 py-3">Teklif Al <ArrowRight className="w-4 h-4 inline ml-1" /></Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};
