import {
  PageShell,
  ShellAction,
  ShellBreadcrumb,
  ShellEvidence,
  ShellIndexList,
  ShellNextStep,
  ShellNotice,
  ShellPageHero,
  ShellRun,
  ShellSpecTable,
  ShellSurfaceBand,
  ShellTitleBlock,
} from "@/components/shell";
import { usePageMeta } from "@/hooks/use-page-meta";
import {
  CERTIFICATIONS,
  CERTIFICATION_SENTENCE_LIST,
  CMM_COVERAGE,
  MINIMUM_TOLERANCE,
  QUALITY_RESOURCES,
  QUOTE_RESPONSE_TIME,
} from "@/content/claims";

/* ══════════════════════════════════════════════════════════════════════════
   KALİTE DOSYASI — THE DOCUMENT AND EVIDENCE SURFACE

   ── WHAT EXISTED, AND WHY IT WAS NOT ENOUGH ──────────────────────────────
   The landing's band 10 (`KALİTE DOSYASI`, `FinalSections.tsx`) shows three
   certificate cards and three document-shaped graphics, and band 12 hangs the
   four real PDFs off a `KAYNAKLAR` list. That is a good landing band and it is
   not a document surface: the four PDFs are offered with a title and a byte
   size and nothing that says what is inside them, when a reader would want
   one, or how the documents relate to each other. There has never been a
   `/kalite` route at all — `kalite` in the IA is a landing ANCHOR.

   ── WHAT THIS ROUTE ADDS, AND WHAT IT REFUSES TO ADD ─────────────────────
   Everything here is `PUBLIC_OK` in `USER_INPUTS.md`, and nothing else is:

     · §H — the four documents in `Politikalar/`, all four `PUBLIC_OK`, served
       from `public/belgeler/`. Their printed sizes are re-measured from disk
       by `scripts/claims-gate.mjs`, so a size on this page cannot drift from
       the file a reader downloads.
     · §C — ISO 9001:2015, ISO 14001:2015, OHSAS 18001. Three, and only three:
       AS9100D and IATF 16949 are `NONE`.
     · §D — the tolerance and the measurement-coverage statement, through
       `claims.ts`.

   REFUSED, with the authority for each refusal:

     · CERTIFICATE NUMBERS AND REGISTRARS. No issuer field exists in §C at all
       (`CERTIFYING_BODIES` is `withhold`n in `claims.ts`: "naming a registrar
       invents an audit that did not happen").
     · A VERIFICATION LINK OR QR. `REPORT_VERIFICATION_SERVICE` is withheld;
       `IMPLEMENTATION.md` §13 forbids a fake verification destination by name,
       and Phase 06 deleted a seeded-LCG "QR" from the landing for exactly this.
     · AN ON-TIME-DELIVERY OR FIRST-PASS RATE. `ON_TIME_DELIVERY` is withheld:
       the permission is conditional (`PUBLIC_IF_VERIFIED_AND_STRATEGIC`) and an
       unaudited self-reported percentage is not evidence.
     · A SAMPLE INSPECTION REPORT. There is no real one to publish, and a
       specimen with invented numbers is what Phase 06 removed from band 07.

   The page therefore has no proof strip and no badge row. What it has is four
   documents a reader can open and a description of the control chain that
   produces the records — which is the only kind of quality claim this project
   is authorised to make.

   ── SEARCH/FILTER: OMITTED ───────────────────────────────────────────────
   Four documents and three certificates. Nothing to search.

   ── THE ROUTE IS `/kalite-dosyasi`, NOT `/kalite` ────────────────────────
   `kalite` is already a published landing anchor (`landingSections` in
   `ia.ts`, `/#kalite`, verified against the DOM by
   `e2e/landing/landing-anchors.spec.ts`). Two destinations differing only by a
   `#` is an addressing trap for readers and for whoever maintains the IA next.
   The route takes the band's own full name instead.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * What each published document is for.
 *
 * The titles and sizes come from `claims.ts` (§H); these lines describe what
 * the reader will find inside and are the only thing on this page written
 * here rather than lifted from the ledger. They describe the document's
 * SUBJECT — they do not summarise or restate its contents, which would be a
 * second, unversioned copy of a controlled document.
 */
const DOCUMENT_SUBJECTS: Record<string, string> = {
  "KALİTE POLİTİKAMIZ": "Yönetim sistemi kapsamında kalite politikasının yazılı beyanı.",
  "ÖLÇÜM EKİPMANLARI LİSTESİ": "Doğrulamada kullanılan ölçüm ekipmanlarının listesi.",
  "PAKETLEME KILAVUZU": "Sevkiyat öncesi paketleme ve koruma kuralları.",
  "TEDARİKÇİ DAVRANIŞ KURALLARI": "Tedarikçilerimizden beklenen davranış kuralları.",
};

/** The chain a record travels, stated as mechanism rather than as promise. */
const CONTROL_CHAIN = [
  {
    title: "Kontrol planı",
    detail: "Hangi kotenin hangi aşamada, hangi yöntemle doğrulanacağı imalattan önce yazılır.",
  },
  {
    title: "İlk parça",
    detail: "Yeni bir işin ilk parçasında kritik koteler doğrulanır; kurulum ve program onaylanmadan seri üretime geçilmez.",
  },
  {
    title: "Ara kontrol",
    detail: "Operasyonlar arasında, sonraki operasyonun referans alacağı yüzeyler kontrol edilir.",
  },
  {
    title: "Son kontrol",
    detail: "Kontrol planında tanımlanan koteler ölçülür ve sonuçlar kayda geçer.",
  },
  {
    title: "Malzeme izlenebilirliği",
    detail: "Parti ve döküm bilgisi, parçanın kaydıyla birlikte tutulur.",
  },
  {
    title: "Teslim dosyası",
    detail: "Ölçüm kayıtları ve malzeme parti bilgisi sevkiyatla birlikte iletilir.",
  },
];

export const KaliteDosyasi = () => {
  usePageMeta({
    title: "Kalite Dosyası",
    description:
      "Yönetim sistemi belgeleri, yayımlanan kalite dokümanları ve bir işin kontrol zinciri: hangi kayıt hangi aşamada oluşur.",
  });

  return (
    <PageShell surface="graphite" rail={{ no: "Q1", label: "KALİTE" }}>
      <ShellPageHero
        no="01"
        label="KALİTE"
        crumb={<ShellBreadcrumb trail={[{ label: "Ana sayfa", to: "/" }, { label: "Kalite dosyası" }]} />}
        eyebrow="Belge ve kayıt"
        title="Kalite Dosyası"
        lede="Yayımlanan dokümanlar, yönetim sistemi belgelerimiz ve bir işin hangi aşamasında hangi kaydın oluştuğu. Buradaki her doküman açılabilir bir dosyadır."
        meta={[
          { label: "Yönetim sistemleri", value: CERTIFICATIONS.map((item) => item.code).join(" · ") },
          { label: "Standart tolerans", value: MINIMUM_TOLERANCE },
          { label: "Ölçüm", value: CMM_COVERAGE },
        ]}
        actions={
          <>
            <ShellAction to="/teklif-al" variant="primary">Teklif Al</ShellAction>
            <ShellAction to="/kabiliyet-profilleri" variant="ghost">Kabiliyet profilleri</ShellAction>
          </>
        }
      />

      {/* ── 02 — the four real documents ─────────────────────────────────── */}
      <ShellSurfaceBand no="02" label="DOKÜMAN" tone="paper" labelledBy="kalite-dokuman">
        <div className="shell-span-read">
          <ShellTitleBlock
            id="kalite-dokuman"
            index="02"
            title="Yayımlanan dokümanlar"
            standfirst="Dört doküman indirilebilir. Yanlarındaki boyutlar, sunulan dosyadan ölçülür — yazılmaz."
          />
        </div>
        <div className="shell-span-full">
          <ShellIndexList
            ariaLabel="Yayımlanan kalite dokümanları"
            items={QUALITY_RESOURCES.map((resource, index) => ({
              href: resource.href,
              download: true,
              index: `D${index + 1}`,
              title: resource.title,
              description: DOCUMENT_SUBJECTS[resource.title],
              meta: [resource.size],
            }))}
          />
        </div>
      </ShellSurfaceBand>

      {/* ── 03 — certificates, with the refusals stated ──────────────────── */}
      <ShellSurfaceBand no="03" label="BELGE" labelledBy="kalite-belge">
        <div className="shell-span-read shell-stack">
          <ShellTitleBlock
            id="kalite-belge"
            index="03"
            title="Yönetim sistemi belgeleri"
            standfirst={`${CERTIFICATION_SENTENCE_LIST} kapsamında çalışıyoruz.`}
          />
          <ShellSpecTable
            caption="Yönetim sistemleri"
            note="Bu üç belge dışında bir yönetim sistemi belgesi bulunmamaktadır. Belge kapsamı dışında bir standart gerekiyorsa teknik incelemede birlikte değerlendiririz."
            headers={["STANDART", "KAPSAM"]}
            numericFrom={2}
            rows={CERTIFICATIONS.map((item) => [item.code, item.name])}
            rowKey={(row) => String(row[0])}
          />
        </div>

        <div className="shell-span-note shell-stack" data-gap="sm">
          <ShellNotice tone="caution" label="YAYIMLANMAYAN" title="Belge numarası ve kuruluş">
            <p>
              Bu sayfada belge numarası, belgelendirme kuruluşu veya bir doğrulama bağlantısı
              yayımlanmaz. Bunlar doğrulanabilir bir kaynağa dayanmadan yazılırsa, belge değil
              belge görüntüsü olur.
            </p>
          </ShellNotice>
          <ShellEvidence kind="BELGE" source={QUALITY_RESOURCES[0].title}>
            Kalite politikasının yazılı beyanı, yukarıdaki dokümanlar arasında indirilebilir
            durumdadır.
            <ShellAction href={QUALITY_RESOURCES[0].href} variant="quiet">
              {QUALITY_RESOURCES[0].size}
            </ShellAction>
          </ShellEvidence>
        </div>
      </ShellSurfaceBand>

      {/* ── 04 — the control chain ───────────────────────────────────────── */}
      <ShellSurfaceBand no="04" label="ZİNCİR" tone="paper" labelledBy="kalite-zincir">
        <div className="shell-span-read">
          <ShellTitleBlock
            id="kalite-zincir"
            index="04"
            title="Bir kayıt nasıl oluşur"
            standfirst="Kalite bir aşama değil, bir zincirdir. Aşağıdaki altı adımın her biri arkasında bir kayıt bırakır ve teslim dosyası bu kayıtlardan oluşur."
          />
        </div>
        <ShellRun items={CONTROL_CHAIN} ariaLabel="Kontrol zinciri" />
        <div className="shell-span-full">
          <ShellEvidence kind="ÖLÇÜM" source={QUALITY_RESOURCES[1].title}>
            Doğrulamada kullanılan ölçüm ekipmanlarının listesi yayımlanmıştır. Standart tolerans
            aralığı {MINIMUM_TOLERANCE}; {CMM_COVERAGE}.
            <ShellAction href={QUALITY_RESOURCES[1].href} variant="quiet">
              {QUALITY_RESOURCES[1].size}
            </ShellAction>
          </ShellEvidence>
        </div>
      </ShellSurfaceBand>

      <ShellNextStep
        no="05"
        title="Sizin işiniz için kontrol planı"
        body="Teknik resim veya 3B model gönderin; hangi kotenin hangi aşamada ve hangi yöntemle doğrulanacağını teklifle birlikte yazalım."
        detail={[
          { label: "Dönüş süresi", value: QUOTE_RESPONSE_TIME },
          { label: "Gönderilecek", value: "Teknik resim veya 3B model" },
          { label: "Ölçüm", value: CMM_COVERAGE },
        ]}
        secondary={{ label: "Sık sorulanlar", to: "/sss" }}
      />
    </PageShell>
  );
};
