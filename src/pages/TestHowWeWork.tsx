import { PageShell } from "@/components/shell/PageShell";
import { HowWeWorkSection } from "@/components/HowWeWorkSection";

/* Dev-only surface (`import.meta.env.DEV` in `src/App.tsx`), migrated onto the
   shell so no page is left needing the old one. */
export const TestHowWeWork = () => {
  return (
    <PageShell surface="graphite" layout="bands">
      <section className="min-h-[80vh] flex items-center" style={{ backgroundColor: "hsl(var(--forge-obsidian))" }}>
        <div className="container-industrial py-16 text-primary-foreground">
          <p className="text-technical text-xs uppercase tracking-[0.3em] text-primary mb-4">Sticky test</p>
          <h1 className="heading-industrial text-4xl md:text-6xl text-primary-foreground mb-4">
            HowWeWork izolasyon testi
          </h1>
          <p className="max-w-2xl text-primary-foreground/70">
            Bu sayfa yalnızca sticky horizontal scroll davranışını doğrulamak için hazırlanmıştır. Aşağı kaydırdığınızda bölüm sabitlenmeli, dört kart sırayla görünmeli ve ardından sayfa normal akışa dönmelidir.
          </p>
        </div>
      </section>

      <HowWeWorkSection />

      <section className="min-h-[80vh] flex items-center border-t border-border" style={{ backgroundColor: "hsl(var(--forge-workshop))" }}>
        <div className="container-industrial py-16">
          <p className="text-technical text-xs uppercase tracking-[0.3em] text-primary mb-4">After sticky</p>
          <h2 className="heading-industrial text-3xl md:text-5xl mb-4">Sticky tamamlandıktan sonra normal scroll devam etmeli</h2>
          <p className="max-w-2xl text-muted-foreground">
            Eğer bu alan görünüyorsa, bölüm doğru anda pinlenmiş ve son karttan sonra akış serbest bırakılmış demektir.
          </p>
        </div>
      </section>
    </PageShell>
  );
};
