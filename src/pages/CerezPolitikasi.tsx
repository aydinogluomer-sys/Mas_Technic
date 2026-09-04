import { Link } from "react-router-dom";
import { ShellSpecTable } from "@/components/shell";
import { LegalDocument, type LegalClause } from "@/components/pages/LegalDocument";
import { SALES_EMAIL } from "@/content/claims";

/* ══════════════════════════════════════════════════════════════════════════
   ÇEREZ POLİTİKASI — THE ONE THAT WAS SIMPLY NOT TRUE

   THE OLD CLAUSE 2, IN FULL
     > "Zorunlu çerezler, performans çerezleri ve analitik çerezler
     >  kullanmaktayız."

   Measured against the source rather than argued about:

     · The ONLY `document.cookie` write in the whole repository is
       `src/components/ui/sidebar.tsx` — a shadcn primitive that is imported by
       NOTHING. `grep -rn "ui/sidebar" src/` returns no hits at all.
     · There is no analytics script, tag manager or tracking pixel in
       `index.html` or anywhere under `src/`. §K records
       `ANALYTICS_PROVIDER: NONE` and `ERROR_MONITORING_PROVIDER: NONE`.

   So the site set no cookies, ran no analytics, and its cookie policy declared
   three categories of cookie including an analytics one. §K's instruction was
   `COOKIE_CONSENT_REQUIRED_BY_CURRENT_SETUP:
   DERIVE_FROM_ACTUAL_SCRIPTS_AND_LEGAL_REQUIREMENTS` — derive, and this is
   what deriving produced.

   WHAT REPLACES IT IS EVIDENCE, NOT A DENIAL
   ------------------------------------------
   Saying "we use no cookies" and stopping would be a claim of the same kind,
   just pointing the other way. Clause 02 is a table of what this site DOES put
   in your browser: the key, what writes it, what it is for and how long it
   lives — every row read out of the source that writes it, and cited there. A
   reader can open devtools and check the table against their own browser,
   which is the only form a statement like this can take and still be worth
   anything.

   NOT LISTED, AND DELIBERATELY: `mas_sound`. `use-sound.ts` still READS that
   key, but the only thing that ever wrote it was the header sound toggle, and
   Phase 03 removed the toggle from the public header. A key nothing can write
   is not something this site stores. Also not listed: `mas_gsap_debug` and the
   master-grid overlay key (both behind `import.meta.env.DEV`) and
   `nexus-settings` (the admin panel, outside this site's public surface per
   `USER_INPUTS.md` §N).
   ══════════════════════════════════════════════════════════════════════════ */

const STORAGE_ROWS: string[][] = [
  [
    "sb-…-auth-token",
    "localStorage",
    "Giriş yaptıysanız oturumunuzu açık tutar.",
    "Çıkış yapana kadar",
  ],
  [
    "mas_chat_ai_count",
    "localStorage",
    "Sohbet asistanına gönderilen günlük mesaj sayısını sayar.",
    "Gün sonuna kadar",
  ],
  [
    "mas_pending_cad_upload",
    "sessionStorage",
    "Ana sayfadan bıraktığınız çizimi teklif formuna taşır.",
    "Form devralınca silinir",
  ],
  [
    "mas-technic-theme",
    "localStorage",
    "3B model görüntüleyicisinin açık/koyu paletini hatırlar.",
    "Siz silene kadar",
  ],
];

const CLAUSES: LegalClause[] = [
  {
    id: "cerez-kullanimi",
    title: "Bu sitede çerez kullanılmıyor",
    body: (
      <div className="shell-prose">
        <p>
          Herkese açık sayfalarda hiçbir çerez oluşturulmuyor. Reklam çerezi, analitik çerezi,
          etiket yöneticisi, reklam pikseli ve oturum kaydı yazılımı da yok.
        </p>
        <p>
          Bu, sitenin tarayıcınızda hiçbir şey saklamadığı anlamına gelmez. Sakladığı şeyler
          çerez değil, tarayıcınızın kendi yerel deposundaki kayıtlar; hepsi 02. maddede
          listelenmiştir.
        </p>
      </div>
    ),
  },
  {
    id: "tarayici-kayitlari",
    title: "Tarayıcınızda tutulan kayıtlar",
    body: (
      <div className="shell-stack" data-gap="sm">
        <ShellSpecTable
          caption="Yerel depo kayıtları"
          note="Bu kayıtlar çerez değildir: her HTTP isteğiyle birlikte otomatik gönderilmezler ve yalnızca bu sitenin kendi sayfaları tarafından okunabilirler. Tarayıcınızın geliştirici araçlarındaki Uygulama / Depolama bölümünden hepsini görebilirsiniz."
          headers={["KAYIT", "DEPO", "NE İŞE YARAR", "SÜRE"]}
          numericFrom={4}
          rows={STORAGE_ROWS}
          rowKey={(row) => String(row[0])}
        />
        <p className="shell-note">
          Bu kayıtların hiçbiri reklam veya profilleme amacı taşımaz ve hiçbiri üçüncü bir tarafa
          aktarılmaz.
        </p>
      </div>
    ),
  },
  {
    id: "ucuncu-taraf",
    title: "Üçüncü taraf istekleri",
    body: (
      <div className="shell-prose">
        <p>
          Sayfa yazı tipleri harici bir yazı tipi dağıtım ağından yüklenir; tarayıcınız o sunucuya
          bir istek gönderir ve sunucu bu isteğe bağlı olarak IP adresinizi görür. Bu istek de çerez
          oluşturmaz.
        </p>
        <p>
          Sayfalarda gömülü üçüncü taraf video, harita, reklam veya sosyal medya bileşeni
          bulunmuyor.
        </p>
      </div>
    ),
  },
  {
    id: "yonetim",
    title: "Kayıtları silmek",
    body: (
      <div className="shell-prose">
        <p>
          02. maddedeki kayıtları tarayıcınızın ayarlarından — “site verilerini temizle” ya da
          geliştirici araçlarındaki Uygulama / Depolama bölümünden — istediğiniz zaman
          silebilirsiniz. Silmek sitenin çalışmasını engellemez; yalnızca varsa açık oturumunuz
          kapanır ve hatırlanan tercih sıfırlanır.
        </p>
        <p>
          Silinecek bir izleme kaydı olmadığı için ayrıca bir “çerez tercihleri” penceresi de
          gösterilmiyor. Onay istenecek bir işleme yapılmıyorsa, onay penceresi bilgi vermez;
          yalnızca sayfanın önünü kapatır.
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
          Bu metinle ilgili sorularınız için {SALES_EMAIL} adresine yazabilirsiniz. Kişisel
          verilerin işlenmesine ilişkin çerçeve{" "}
          <Link to="/kvkk">KVKK Aydınlatma Metni</Link>’nde, sitenin genel gizlilik davranışı{" "}
          <Link to="/gizlilik-politikasi">Gizlilik Politikası</Link>’nda yer alır.
        </p>
      </div>
    ),
  },
];

export const CerezPolitikasi = () => (
  <LegalDocument
    rail={{ no: "L3", label: "ÇEREZ" }}
    selfPath="/cerez-politikasi"
    eyebrow="Yasal metin"
    title="Çerez Politikası"
    lede="Bu site çerez kullanmıyor. Tarayıcınızda ne tuttuğu ise madde 02’de tek tek listelenmiştir."
    metaDescription="Mas Technic çerez politikası — bu sitede çerez kullanılmaz; tarayıcınızda tutulan yerel depo kayıtları, süreleri ve nasıl silinecekleri."
    clauses={CLAUSES}
  />
);
