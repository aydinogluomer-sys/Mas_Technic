import { useState, useMemo, useEffect, Suspense, lazy } from "react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search, X, ChevronLeft, ChevronRight, ArrowUpDown, LayoutGrid, Rows3,
  Check, FlaskConical, Gem, Wrench, Thermometer, Scale, Shield, Zap, ArrowRight, SlidersHorizontal,
} from "lucide-react";
import { PageShell } from "@/components/shell/PageShell";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { materialsData, materialCategories, type Material } from "@/data/materialsData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MaterialMorphScroll = lazy(() => import("@/components/MaterialMorphScroll").then(m => ({ default: m.MaterialMorphScroll })));

const sortOptions = [
  { id: "name", label: "İsim" },
  { id: "density", label: "Yoğunluk (Düşük → Yüksek)" },
  { id: "tensileStrength", label: "Mukavemet (Yüksek → Düşük)" },
  { id: "machinability", label: "İşlenebilirlik (Yüksek → Düşük)" },
  { id: "priceCategory", label: "Fiyat (Düşük → Yüksek)" },
];

const getPriceLabel = (p: string) => {
  switch (p) {
    case "low": return { text: "Ekonomik", cls: "bg-emerald-100 text-emerald-800" };
    case "medium": return { text: "Orta", cls: "bg-amber-100 text-amber-800" };
    case "high": return { text: "Premium", cls: "bg-rose-100 text-rose-800" };
    default: return { text: "-", cls: "" };
  }
};

const RatingBar = ({ value, max = 5, label }: { value: number; max?: number; label: string }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="w-24 text-muted-foreground shrink-0">{label}</span>
    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(value / max) * 100}%` }} />
    </div>
    <span className="font-bold text-foreground w-8 text-right">{value}/{max}</span>
  </div>
);

export const Malzemeler = () => {
  usePageMeta({ title: "Malzemeler", description: "CNC işlemede kullanılan alüminyum, çelik, titanyum ve mühendislik plastikleri — teknik özellikler ve karşılaştırma." });
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [compareList, setCompareList] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [viewMode, setViewMode] = useState<"grid-3" | "grid-2">("grid-3");

  const filteredMaterials = useMemo(() => {
    let result = [...materialsData];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.applications.some(a => a.toLowerCase().includes(q)));
    }
    if (activeCategory !== "all") {
      const cat = materialCategories.find(c => c.slug === activeCategory);
      if (cat) result = result.filter(m => m.subcategory === cat.subcategoryKey);
    }
    const priceOrder: Record<string, number> = { low: 1, medium: 2, high: 3 };
    result.sort((a, b) => {
      switch (sortBy) {
        case "density": return a.density - b.density;
        case "tensileStrength": return b.tensileStrength - a.tensileStrength;
        case "machinability": return b.machinability - a.machinability;
        case "priceCategory": return (priceOrder[a.priceCategory] || 0) - (priceOrder[b.priceCategory] || 0);
        default: return a.name.localeCompare(b.name, "tr");
      }
    });
    return result;
  }, [activeCategory, sortBy, searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [activeCategory, sortBy, searchQuery, itemsPerPage]);

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const visibleMaterials = filteredMaterials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleCompare = (material: Material) => {
    if (compareList.find(m => m.id === material.id)) setCompareList(compareList.filter(m => m.id !== material.id));
    else if (compareList.length < 4) setCompareList([...compareList, material]);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) { setCurrentPage(page); window.scrollTo({ top: 400, behavior: "smooth" }); }
  };

  return (
    /* Shell only (Phase 04). This page had NO `<main>`, so `#main-content` did
       not exist on it; the shell supplies one. `pt-28` was the page's own
       clearance for the fixed bar and is now `py-16` — the bar is reserved
       once, by `.tl-header-spacer`. */
    <PageShell rail={{ no: "R1", label: "MALZEME" }}>
      <JsonLdSchema type="productCatalog" name="Malzeme Kütüphanesi" description="CNC işleme için alüminyum, çelik, titanyum, pirinç, bakır ve mühendislik plastikleri. Teknik özellikler ve karşılaştırma." />

      {/* Hero */}
      <section className="relative py-16 overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.95) 0%, hsl(var(--forge-navy)) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(to right, rgb(var(--text-primary-rgb) / 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--text-primary-rgb) / 0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        {/* Ghost machine-loop video */}
        <video
          src="/machine-loop.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none hidden md:block"
          style={{ mixBlendMode: "luminosity" }}
          aria-hidden="true"
        />
        <div className="container-industrial relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-[rgb(var(--text-primary-rgb)/0.6)] mb-3 block">Malzeme Kütüphanesi</span>
            <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">CNC İşleme Malzemeleri</h1>
            <p className="text-lg text-[rgb(var(--text-primary-rgb)/0.7)] max-w-2xl mx-auto mb-8">{materialsData.length}+ malzeme ve alaşım ile endüstriyel ihtiyaçlarınıza çözüm. Karşılaştırın, seçin, üretin.</p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--text-primary-rgb)/0.4)]" />
              <input type="text" placeholder="Malzeme ara... (ör: 7075, PEEK, titanyum)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-[rgb(var(--text-primary-rgb)/0.1)] border border-[rgb(var(--text-primary-rgb)/0.2)] text-[var(--text-primary)] placeholder:text-[rgb(var(--text-primary-rgb)/0.4)] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm" />
              {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-primary-rgb)/0.4)] hover:text-[var(--text-primary)]"><X className="w-4 h-4" /></button>}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Material Morph Scroll — canvas animation */}
      <Suspense fallback={<div className="h-[50vh] flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin" /></div>}>
        <MaterialMorphScroll />
      </Suspense>

      {/* Category Cards */}
      <section className="container-industrial py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <button onClick={() => setActiveCategory("all")} className={`p-4 rounded-lg border text-center transition-all ${activeCategory === "all" ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border hover:border-primary/40 hover:bg-muted/50"}`}>
            <span className="text-2xl block mb-1">📦</span>
            <span className="text-sm font-semibold text-foreground">Tümü</span>
            <span className="text-[10px] text-muted-foreground block">{materialsData.length} malzeme</span>
          </button>
          {materialCategories.map(cat => {
            const count = materialsData.filter(m => m.subcategory === cat.subcategoryKey).length;
            return (
              <button key={cat.slug} onClick={() => setActiveCategory(cat.slug)} className={`p-4 rounded-lg border text-center transition-all ${activeCategory === cat.slug ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border hover:border-primary/40 hover:bg-muted/50"}`}>
                <span className="text-2xl block mb-1">{cat.icon}</span>
                <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                <span className="text-[10px] text-muted-foreground block">{count} malzeme</span>
              </button>
            );
          })}
        </div>
        {/* Category detail link */}
        {activeCategory !== "all" && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center">
            <Link to={`/malzemeler/${activeCategory}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              {materialCategories.find(c => c.slug === activeCategory)?.name} hakkında detaylı bilgi <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </section>

      {/* Sticky scope wrapper — bar releases when this wrapper ends (before CTA + Footer) */}
      <div className="relative">
      {/* Filters Bar */}
      <section className="sticky top-[60px] z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container-industrial py-3">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-end gap-3 ml-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Sırala</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-1.5 text-xs border border-border rounded bg-background text-foreground min-w-[180px]">
                  {sortOptions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Görünüm</label>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setViewMode("grid-3")} aria-label="Üç sütunlu ızgara görünümü" aria-pressed={viewMode === "grid-3"} className={`grid h-9 w-9 place-items-center rounded border ${viewMode === "grid-3" ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground"}`}><LayoutGrid className="w-4 h-4" aria-hidden="true" /></button>
                  <button type="button" onClick={() => setViewMode("grid-2")} aria-label="İki sütunlu ızgara görünümü" aria-pressed={viewMode === "grid-2"} className={`grid h-9 w-9 place-items-center rounded border ${viewMode === "grid-2" ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground"}`}><Rows3 className="w-4 h-4" aria-hidden="true" /></button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Limit</label>
                <select value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))} className="px-3 py-1.5 text-xs border border-border rounded bg-background text-foreground">
                  <option value={12}>12</option><option value={24}>24</option><option value={48}>48</option>
                </select>
              </div>
            </div>
          </div>
          <AnimatePresence>
            {compareList.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">Karşılaştır ({compareList.length}/4):</span>
                  {compareList.map(m => <span key={m.id} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">{m.name}<button onClick={() => toggleCompare(m)} className="hover:opacity-70">×</button></span>)}
                </div>
                <Button size="sm" onClick={() => setShowCompareModal(true)}>Karşılaştır</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Results count */}
      <div className="container-industrial pt-6 pb-2">
        <p className="text-sm text-muted-foreground"><span className="font-bold text-foreground">{filteredMaterials.length}</span> malzeme bulundu{searchQuery && <span> — "<span className="text-primary">{searchQuery}</span>"</span>}</p>
      </div>

      {/* Materials Grid */}
      <section className="container-industrial pb-12">
        <div className={`grid gap-4 ${viewMode === "grid-3" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-1 lg:grid-cols-2"}`}>
          {visibleMaterials.map(material => {
            const price = getPriceLabel(material.priceCategory);
            const isComparing = !!compareList.find(m => m.id === material.id);
            const catIcon = material.category === "metal" ? "🔩" : material.category === "plastic" ? "🧪" : "🧬";
            return (
              <motion.div key={material.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`group relative bg-card border rounded-lg p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isComparing ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><span className="text-xs">{catIcon}</span><span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{material.subcategory}</span></div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${price.cls}`}>{price.text}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">{material.name}{material.isPopular && <span className="ml-2 text-xs text-amber-500">⭐</span>}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{material.description}</p>
                <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded-md mb-4">
                  <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Yoğunluk</span><span className="text-sm font-semibold text-foreground">{material.density} g/cm³</span></div>
                  <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Mukavemet</span><span className="text-sm font-semibold text-foreground">{material.tensileStrength} MPa</span></div>
                  <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Sertlik</span><span className="text-sm font-semibold text-foreground">{material.hardness}</span></div>
                  <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Maks. Sıcaklık</span><span className="text-sm font-semibold text-foreground">{material.maxTemperature}°C</span></div>
                </div>
                <div className="space-y-2 mb-4">
                  <RatingBar value={material.machinability} label="İşlenebilirlik" />
                  <RatingBar value={material.corrosionResistance} label="Korozyon Direnci" />
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {material.applications.slice(0, 3).map((app, i) => <span key={i} className="px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded">{app}</span>)}
                </div>
                <div className="flex gap-2 pt-3 border-t border-border">
                  <button onClick={() => setSelectedMaterial(material)} className="flex-1 py-2 text-xs font-semibold bg-muted text-foreground rounded hover:bg-muted/80 transition-colors">Detay</button>
                  <button onClick={() => toggleCompare(material)} disabled={!isComparing && compareList.length >= 4} className={`flex-1 py-2 text-xs font-semibold rounded border transition-all ${isComparing ? "bg-primary text-primary-foreground border-primary" : "border-primary text-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"}`}>{isComparing ? "✓ Seçildi" : "+ Karşılaştır"}</button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredMaterials.length === 0 && (
          <div className="text-center py-20">
            <FlaskConical className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Malzeme bulunamadı</h3>
            <p className="text-sm text-muted-foreground">Filtrelerinizi veya arama teriminizi değiştirin.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button type="button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Önceki sayfa" className="grid h-9 w-9 place-items-center rounded border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" aria-hidden="true" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => handlePageChange(page)} className={`w-9 h-9 rounded text-sm font-semibold transition-all ${page === currentPage ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted"}`}>{page}</button>
            ))}
            <button type="button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Sonraki sayfa" className="grid h-9 w-9 place-items-center rounded border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" aria-hidden="true" /></button>
          </div>
        )}
      </section>
      </div>

      {/* Material Detail Modal */}
      <Dialog open={!!selectedMaterial} onOpenChange={() => setSelectedMaterial(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMaterial && (<>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded ${getPriceLabel(selectedMaterial.priceCategory).cls}`}>{getPriceLabel(selectedMaterial.priceCategory).text}</span>
                {selectedMaterial.isPopular && <span className="text-xs text-amber-500">⭐ Popüler</span>}
              </div>
              <DialogTitle className="text-2xl">{selectedMaterial.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">{selectedMaterial.description}</p>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div>
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-primary" /> Teknik Özellikler</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <Scale className="w-3.5 h-3.5" />, label: "Yoğunluk", value: `${selectedMaterial.density} g/cm³` },
                    { icon: <Zap className="w-3.5 h-3.5" />, label: "Çekme Mukavemeti", value: `${selectedMaterial.tensileStrength} MPa` },
                    { icon: <Gem className="w-3.5 h-3.5" />, label: "Sertlik", value: selectedMaterial.hardness },
                    { icon: <Thermometer className="w-3.5 h-3.5" />, label: "Maks. Sıcaklık", value: `${selectedMaterial.maxTemperature}°C` },
                    { icon: <Wrench className="w-3.5 h-3.5" />, label: "İşlenebilirlik", value: `${selectedMaterial.machinability}/5` },
                    { icon: <Shield className="w-3.5 h-3.5" />, label: "Korozyon Direnci", value: `${selectedMaterial.corrosionResistance}/5` },
                  ].map((spec, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 bg-muted/50 rounded">
                      <span className="text-primary">{spec.icon}</span>
                      <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{spec.label}</div><div className="text-sm font-semibold text-foreground">{spec.value}</div></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><h4 className="text-sm font-bold text-foreground mb-2">✅ Avantajlar</h4><ul className="space-y-1.5">{selectedMaterial.advantages.map((a, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /> {a}</li>)}</ul></div>
                <div><h4 className="text-sm font-bold text-foreground mb-2">⚠️ Dikkat Edilmesi Gerekenler</h4><ul className="space-y-1.5">{selectedMaterial.limitations.map((l, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><span className="text-amber-500 mt-0.5 shrink-0">•</span> {l}</li>)}</ul></div>
              </div>
              <div><h4 className="text-sm font-bold text-foreground mb-2">Uygulama Alanları</h4><div className="flex flex-wrap gap-2">{selectedMaterial.applications.map((app, i) => <span key={i} className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">{app}</span>)}</div></div>
              <Link to="/iletisim" className="btn-industrial-primary w-full text-center block py-3 text-sm">Bu Malzeme ile Teklif Al <ArrowRight className="w-4 h-4 inline ml-1" /></Link>
            </div>
          </>)}
        </DialogContent>
      </Dialog>

      {/* Compare Modal */}
      <Dialog open={showCompareModal && compareList.length > 0} onOpenChange={() => setShowCompareModal(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Malzeme Karşılaştırması</DialogTitle></DialogHeader>
          <div className="overflow-x-auto mt-4">
            <Table>
              <TableHeader><TableRow><TableHead className="font-bold">Özellik</TableHead>{compareList.map(m => <TableHead key={m.id} className="font-bold text-center">{m.name}</TableHead>)}</TableRow></TableHeader>
              <TableBody>
                <TableRow><TableCell className="font-medium">Fiyat Kategorisi</TableCell>{compareList.map(m => <TableCell key={m.id} className="text-center"><span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${getPriceLabel(m.priceCategory).cls}`}>{getPriceLabel(m.priceCategory).text}</span></TableCell>)}</TableRow>
                {[
                  { label: "Yoğunluk (g/cm³)", key: "density" },
                  { label: "Çekme Mukavemeti (MPa)", key: "tensileStrength" },
                  { label: "Sertlik", key: "hardness" },
                  { label: "İşlenebilirlik", key: "machinability", suffix: "/5" },
                  { label: "Korozyon Direnci", key: "corrosionResistance", suffix: "/5" },
                  { label: "Isı İletkenliği (W/m·K)", key: "thermalConductivity" },
                  { label: "Maks. Sıcaklık (°C)", key: "maxTemperature" },
                ].map(row => (
                  <TableRow key={row.key}><TableCell className="font-medium">{row.label}</TableCell>{compareList.map(m => <TableCell key={m.id} className="text-center font-semibold">{String((m as unknown as Record<string, unknown>)[row.key])}{row.suffix || ""}</TableCell>)}</TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowCompareModal(false)}>Kapat</Button>
            <Link to="/iletisim"><Button>Teklif Al</Button></Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* CTA */}
      <section className="py-16" style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--forge-navy)) 100%)" }}>
        <div className="container-industrial text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">Malzeme Seçiminde Yardıma mı İhtiyacınız Var?</h2>
          <p className="text-[rgb(var(--text-primary-rgb)/0.7)] mb-8 max-w-lg mx-auto">Mühendislik ekibimiz projeniz için en uygun malzemeyi seçmenizde size yardımcı olabilir.</p>
          <Link to="/iletisim" className="btn-industrial-primary inline-block px-8 py-3">Uzmanlarımızla Görüşün</Link>
        </div>
      </section>
    </PageShell>
  );
};
