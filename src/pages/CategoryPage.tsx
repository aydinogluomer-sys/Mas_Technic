import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { categoryPages } from "@/data/categoryPages";
import { ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const pathname = window.location.pathname;
  const prefix = pathname.startsWith("/hizmetler") ? "hizmetler" : pathname.startsWith("/kabiliyetler") ? "kabiliyetler" : "endustriyel";
  const category = categoryPages.find(
    (c) => c.slug === slug && c.prefix === prefix
  );

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container-industrial text-center">
            <h1 className="text-3xl font-bold mb-4">Sayfa Bulunamadı</h1>
            <Link to="/" className="text-primary hover:underline">Ana Sayfaya Dön</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const prefixLabel =
    category.prefix === "hizmetler"
      ? "Hizmetler"
      : category.prefix === "kabiliyetler"
      ? "Kabiliyetler"
      : "Endüstriyel";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container-industrial">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
            <ChevronRight className="w-3 h-3" />
            <span>{prefixLabel}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{category.title}</span>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.4em] mb-3 block text-primary">
                {prefixLabel}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{category.title}</h1>
              <p className="text-muted-foreground text-lg">{category.description}</p>
            </motion.div>

            {/* Links grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-12">
              {category.links.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <Link
                    to={link.path}
                    className="block border border-border bg-card p-6 hover:border-primary hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group h-full"
                  >
                    <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                      {link.label}
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {link.description}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              className="text-center border-t border-border pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-muted-foreground text-sm mb-4">
                Projeleriniz için detaylı bilgi almak ister misiniz?
              </p>
              <Link
                to="/teklif-al"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider hover:brightness-110 transition-all"
              >
                Teklif Al
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
