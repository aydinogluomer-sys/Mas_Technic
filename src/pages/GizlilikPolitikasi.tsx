import { Link } from "react-router-dom";
import { LegalDocument, type LegalClause } from "@/components/pages/LegalDocument";
import { SALES_EMAIL } from "@/content/claims";

/* ══════════════════════════════════════════════════════════════════════════
   GİZLİLİK POLİTİKASI

   THE CLAUSE THAT HAD TO GO
   -------------------------
   > 4. Veri Güvenliği
   > "Tüm veriler şifreli ortamlarda saklanır ve yetkisiz erişime karşı
   >  korunur."

   `IMPLEMENTATION.md` §13 forbids inventing "encryption/NDA/retention
   guarantees" by name, and `USER_INPUTS.md` §J records
   `CONFIDENTIALITY_TEXT_APPROVED: NO`. Nothing in `USER_INPUTS.md` verifies
   at-rest encryption of anything, so that sentence is an unaudited security
   attestation printed on the page a reader goes to precisely in order to check
   one — the worst place on the site for an unverified claim.

   IT IS NOT REPLACED WITH A SOFTER VERSION. `claims.ts` records the pattern:
   a withheld fact becomes a typed absence, not a hedge. There is no security
   clause here at all, and the reason is written here so that a later agent
   does not "restore" it. When a real, verified security description exists, it
   goes in `claims.ts` first.

   WHAT THE PAGE SAYS INSTEAD, AND WHY IT IS MORE USEFUL
   -----------------------------------------------------
   Clauses 04 and 05 are the two facts about this site that a privacy-minded
   reader actually cannot find out for themselves without opening devtools, and
   both are verifiable from the repository rather than asserted:

     · no analytics, tag manager, tracking pixel or session recorder is loaded
       (§K `ANALYTICS_PROVIDER: NONE`, `ERROR_MONITORING_PROVIDER: NONE`; and
       there is no such script in `index.html` or anywhere in `src/`);
     · the fonts are fetched from a third-party host at page load, which means
       that host receives a request from your browser. That is a real, small
       disclosure and nobody had written it down.

   The `Mas Technic Precision CNC ("Şirket")` construction is gone too: the
   legal person is named in the KVKK metni, which is the document whose job
   that is, and this page links to it rather than restating it differently.
   ══════════════════════════════════════════════════════════════════════════ */

const CLAUSES: LegalClause[] = [
  {
    id: "kapsam",
    title: "Kapsam",
    body: (
      <div className="shell-prose">
        <p>
          Bu politika, mastechnic.com üzerindeki herkese açık sayfaların ziyaretçi verisiyle nasıl
          davrandığını anlatır. Kişisel verilerin işlenmesine ilişkin hukuki çerçeve, amaç, aktarım
          ve haklarınız ayrı bir belgede — <Link to="/kvkk">KVKK Aydınlatma Metni</Link> — yer alır;
          bu iki metin birbirini tekrar etmez.
        </p>
      </div>
    ),
  },
  {
    id: "toplanan-bilgiler",
    title: "Bize ilettiğiniz bilgiler",
    body: (
      <div className="shell-prose">
        <p>
          Site, siz bir form doldurmadıkça hiçbir kişisel bilgi toplamaz. Teklif akışında ad-soyad,
          e-posta, firma unvanı ve telefon ile yüklediğiniz teknik resim veya 3B model dosyası
          alınır. Hesap açtığınızda e-posta adresiniz kaydedilir.
        </p>
        <p>
          Bu bilgiler yalnızca teklif hazırlamak, üretilebilirlik incelemesi yapmak ve sizinle bu
          konuda iletişim kurmak için kullanılır. Bülten aboneliği, reklam listesi veya benzeri bir
          pazarlama kaydı tutulmaz.
        </p>
      </div>
    ),
  },
  {
    id: "tarayici-verisi",
    title: "Tarayıcınızda saklanan veriler",
    body: (
      <div className="shell-prose">
        <p>
          Site çerez kullanmaz. Tercihleriniz ve oturum bilgisi, tarayıcınızın kendi yerel
          deposunda (<code>localStorage</code> / <code>sessionStorage</code>) tutulur ve her istekle
          birlikte otomatik olarak sunucuya gönderilmez.
        </p>
        <p>
          Hangi kaydın ne işe yaradığı ve nasıl silineceği{" "}
          <Link to="/cerez-politikasi">Çerez Politikası</Link> sayfasında madde madde listelenmiştir.
        </p>
      </div>
    ),
  },
  {
    id: "izleme-yok",
    title: "İzleme ve ölçümleme",
    body: (
      <div className="shell-prose">
        <p>
          Bu sitede analitik aracı, etiket yöneticisi, reklam pikseli veya oturum kaydı yazılımı
          çalışmaz. Sayfa görüntüleme sayısı, tıklama haritası veya ziyaretçi profili tutulmaz.
        </p>
        <p>
          Bu, sitede yayımlanan hiçbir sayının bir okunma veya popülerlik ölçümüne dayanmadığı
          anlamına da gelir; böyle bir ölçüm yapılmadığı için böyle bir sayı da yayımlanmaz.
        </p>
      </div>
    ),
  },
  {
    id: "ucuncu-taraf-istekleri",
    title: "Üçüncü taraf istekleri",
    body: (
      <div className="shell-prose">
        <p>
          Sayfa yazı tipleri harici bir yazı tipi dağıtım ağından yüklenir. Bu, tarayıcınızın o
          sunucuya bir istek göndermesi anlamına gelir ve ilgili sunucu bu isteğe bağlı olarak IP
          adresinizi ve tarayıcı bilginizi görür. Yazı tipi dosyalarının dışında bu istekle veri
          gönderilmez.
        </p>
        <p>
          Teklif akışını kullandığınızda form verisi ve yüklediğiniz dosya, sitenin barındırma ve
          veri tabanı altyapısına iletilir. Bunun dışında sayfalarda gömülü üçüncü taraf içerik,
          reklam veya sosyal medya bileşeni bulunmaz.
        </p>
      </div>
    ),
  },
  {
    id: "iletisim",
    title: "İletişim",
    body: (
      <div className="shell-prose">
        <p>
          Bu politikaya ilişkin sorularınız ve kişisel verilerinizle ilgili talepleriniz için{" "}
          {SALES_EMAIL} adresine yazabilirsiniz. KVKK md. 11 kapsamındaki haklarınızın tam listesi{" "}
          <Link to="/kvkk">KVKK Aydınlatma Metni</Link>’nin 06. maddesindedir.
        </p>
      </div>
    ),
  },
];

export const GizlilikPolitikasi = () => (
  <LegalDocument
    rail={{ no: "L2", label: "GİZLİLİK" }}
    selfPath="/gizlilik-politikasi"
    eyebrow="Yasal metin"
    title="Gizlilik Politikası"
    lede="Bu sitenin ziyaretçi verisiyle ne yaptığı ve — daha önemlisi — ne yapmadığı."
    metaDescription="Mas Technic gizlilik politikası — bize ilettiğiniz bilgiler, tarayıcınızda saklanan veriler, izleme yapılmaması ve üçüncü taraf istekleri."
    clauses={CLAUSES}
  />
);
