import { LegalDocument, type LegalClause } from "@/components/pages/LegalDocument";
import { PUBLIC_ADDRESS_LINES, SALES_EMAIL } from "@/content/claims";

/* ══════════════════════════════════════════════════════════════════════════
   KVKK AYDINLATMA METNİ

   THE PAGE IS COMPOSITION ONLY. The sheet, the clause numbering, the anchor
   index and the revision line are `src/components/pages/LegalDocument.tsx`;
   what lives here is the text.

   THREE CORRECTIONS TO THE TEXT ITSELF (IMPLEMENTATION.md §13)
   ------------------------------------------------------------
   1. THE VERİ SORUMLUSU IS NAMED PROPERLY. The old clause said "Mas Technic",
      a brand. A KVKK aydınlatma metni identifies the data controller as a
      legal person, and `USER_INPUTS.md` §A supplies exactly that, with
      `COMPANY_LEGAL_NAME_VISIBILITY: PUBLIC_CORE`.

   2. NO RETENTION PERIOD AND NO DELETION PROCESS IS DESCRIBED.
      §J `CAD_RETENTION_PERIOD: UNKNOWN_REMOVE_IF_UNVERIFIED` and
      `CAD_DELETE_REQUEST_PROCESS: UNKNOWN_REMOVE_IF_UNVERIFIED`. Clause 05
      states the STATUTORY position instead — data is kept while the purpose
      and the legal obligation require it — which is law, not a commitment
      this company has made and nobody has verified.

   3. THE AKTARIM CLAUSE NAMES A BOUNDARY, NOT "iş ortaklıkları".
      "Kişisel verileriniz … iş ortaklıkları kapsamında üçüncü kişilere
      aktarılabilir" is a blanket permission with no limit, written in a
      document whose entire purpose is to state the limit.

   The one thing this page must never grow is a security guarantee — see
   `GizlilikPolitikasi.tsx`, where one had to be removed.
   ══════════════════════════════════════════════════════════════════════════ */

const CLAUSES: LegalClause[] = [
  {
    id: "veri-sorumlusu",
    title: "Veri sorumlusu",
    body: (
      <div className="shell-prose">
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu,
          <strong> Mas Technic Makine Sanayi Ltd. Şti.</strong>’dir.
        </p>
        <p>
          {PUBLIC_ADDRESS_LINES.join(" ")} · {SALES_EMAIL}
        </p>
      </div>
    ),
  },
  {
    id: "islenen-veriler",
    title: "İşlenen kişisel veriler",
    body: (
      <div className="shell-prose">
        <p>
          Bu sitede kişisel veri yalnızca sizin ilettiğiniz kadarıyla işlenir. Teklif formunda
          ad-soyad, e-posta, firma unvanı ve telefon; teklif ekinde yüklediğiniz teknik resim veya
          3B model dosyaları; hesap açtığınızda e-posta adresiniz alınır.
        </p>
        <p>
          Yüklediğiniz dosyanın içeriği kişisel veri taşıyorsa — örneğin çizim antedindeki bir isim —
          o veri de bu metnin kapsamındadır.
        </p>
      </div>
    ),
  },
  {
    id: "amac-ve-hukuki-sebep",
    title: "İşleme amacı ve hukuki sebep",
    body: (
      <div className="shell-prose">
        <p>
          Veriler; teklif hazırlamak, üretilebilirlik incelemesi yapmak, sipariş ve üretim sürecini
          yürütmek, fatura düzenlemek ve sizinle bu konularda iletişim kurmak amacıyla işlenir.
        </p>
        <p>
          Hukuki sebep, KVKK md. 5/2-c uyarınca sözleşmenin kurulması veya ifasıyla doğrudan ilgili
          olması ve md. 5/2-ç uyarınca hukuki yükümlülüğün yerine getirilmesidir. Bu amaçların
          dışında bir işleme yapılmaz; pazarlama amaçlı profilleme ve otomatik karar verme
          uygulanmaz.
        </p>
      </div>
    ),
  },
  {
    id: "aktarim",
    title: "Aktarım",
    body: (
      <div className="shell-prose">
        <p>
          Kişisel verileriniz satılmaz ve pazarlama amacıyla üçüncü taraflara devredilmez. Aktarım
          iki hâlde olur: yetkili kamu kurum ve kuruluşlarının kanuna dayalı talebi, ve bu sitenin
          çalışması için kullanılan barındırma ile veri tabanı altyapısının hizmet sağlayıcısı.
        </p>
        <p>
          Bir işin yürütülmesi için üçüncü bir tedarikçiye teknik dosya iletilmesi gerekiyorsa, bu
          ancak sizin bilginiz dâhilinde yapılır.
        </p>
      </div>
    ),
  },
  {
    id: "saklama",
    title: "Saklama",
    body: (
      <div className="shell-prose">
        <p>
          Kişisel veriler, işlendikleri amaç için gerekli olduğu süre boyunca ve ilgili mevzuatın
          öngördüğü saklama yükümlülükleri devam ettiği sürece saklanır; bu süre sona erdiğinde
          silinir, yok edilir veya anonim hâle getirilir.
        </p>
        <p>
          Bu metin belirli bir gün sayısı veya sabit bir imha takvimi taahhüt etmez. Verinizin
          silinmesini istiyorsanız, 06. maddedeki hakkınızı kullanarak talep edebilirsiniz.
        </p>
      </div>
    ),
  },
  {
    id: "haklariniz",
    title: "Haklarınız (KVKK md. 11)",
    body: (
      <div className="shell-prose">
        <p>
          Kanunun 11. maddesi gereğince; kişisel verinizin işlenip işlenmediğini öğrenme, işlenmişse
          buna ilişkin bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını
          öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış
          işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini isteme, düzeltme ve silme
          işlemlerinin aktarım yapılan üçüncü kişilere bildirilmesini isteme, işlenen verilerin
          münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun ortaya
          çıkmasına itiraz etme ve kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın
          giderilmesini talep etme haklarına sahipsiniz.
        </p>
      </div>
    ),
  },
  {
    id: "basvuru",
    title: "Başvuru",
    body: (
      <div className="shell-prose">
        <p>
          Bu haklara ilişkin taleplerinizi {SALES_EMAIL} adresine iletebilirsiniz. Başvurunuzda
          kimliğinizi tespit etmeye yarayan bilgilerin ve talebinizin konusunun açıkça yer alması
          gerekir.
        </p>
      </div>
    ),
  },
];

export const KVKK = () => (
  <LegalDocument
    rail={{ no: "L1", label: "KVKK" }}
    selfPath="/kvkk"
    eyebrow="Yasal metin"
    title="KVKK Aydınlatma Metni"
    lede="6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında: bu sitede hangi kişisel veri, hangi amaçla ve hangi hukuki sebeple işlenir."
    metaDescription="Mas Technic KVKK aydınlatma metni — işlenen kişisel veriler, işleme amacı ve hukuki sebep, aktarım, saklama ve KVKK md. 11 kapsamındaki haklarınız."
    clauses={CLAUSES}
  />
);
