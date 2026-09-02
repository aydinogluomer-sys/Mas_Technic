import { PageShell } from "@/components/shell/PageShell";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { Target, ClipboardCheck, Award, Globe } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { CERTIFICATION_SENTENCE_LIST, CMM_COVERAGE, MINIMUM_TOLERANCE } from "@/content/claims";

export const Hakkimizda = () => {
  usePageMeta({ title: "Hakkımızda", description: "Mas Technic — hassas CNC işleme, talaşlı imalat ve mühendislik çözümleri sunan güvenilir üretim partneri." });
  return (
  /* Shell only (Phase 04). See `KVKK.tsx`; the body is untouched — Phase 07
     owns this page's composition, and Phase 06 its claims. */
  <PageShell rail={{ no: "C1", label: "KURUMSAL" }}>
      <JsonLdSchema type="about" />
      <div className="container-industrial">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] mb-3 block text-primary">Kurumsal</span>
          <h1 className="heading-industrial text-3xl md:text-4xl mb-4">Hakkımızda</h1>
          <p className="subheading-industrial text-lg mb-12">Hassasiyet, güvenilirlik ve mühendislik mükemmelliği</p>

          <div className="space-y-8 text-muted-foreground text-sm leading-relaxed mb-16">
            <p>Mas Technic, CNC freze, torna ve talaşlı imalat alanında yüksek hassasiyetli üretim çözümleri sunan bir mühendislik firmasıdır. Havacılık, otomotiv, medikal ve robotik gibi kritik sektörlere hizmet vermekteyiz.</p>
            <p>{CERTIFICATION_SENTENCE_LIST} yönetim sistemleriyle çalışıyoruz. Standart tolerans aralığımız {MINIMUM_TOLERANCE}; her iş için kontrol planı oluşturulur ve ölçüm kayıtları teslimat dosyasına eklenir. {CMM_COVERAGE} olarak sağlanır.</p>
          </div>

          {/* The four cards used to publish a team size (§D
              TEAM_SIZE_VISIBILITY: PRIVATE_DO_NOT_DISCLOSE), a mission written
              as "en yüksek kalitede", and a vision about being one of Europe's
              leading centres. §0 sets DO_NOT_EMPHASIZE_COMPANY_SCALE and
              PUBLIC_POSITIONING_PRIORITY: precision, measurement, traceability,
              process discipline. The cards say those four things now. */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: "Misyon", desc: "Teknik resimdeki her koteyi ölçülebilir ve tekrarlanabilir biçimde üretmek" },
              { icon: Globe, title: "Yaklaşım", desc: "Hassasiyeti iddia etmek yerine ölçüm kaydıyla teslim etmek" },
              { icon: ClipboardCheck, title: "Süreç", desc: "DFM analizinden son kontrole kadar tanımlı bir kontrol planı" },
              { icon: Award, title: "Kalite", desc: "İzlenebilir malzeme kaydı ve belgelendirilmiş yönetim sistemleri" },
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
  </PageShell>
  );
};
