import { Link } from "@/i18n/LocaleLink";
import { LegalDocument, type LegalClause } from "@/components/pages/LegalDocument";
import { PUBLIC_ADDRESS_LINES, SALES_EMAIL } from "@/content/claims";
import { KVKK_EN } from "@/content/en/legal/kvkk";
import { useLocale } from "@/i18n/hooks";

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

   4. THE AKTARIM LIST WAS CLOSED AND SHORT BY ONE — PHASE 08 CORRECTION.
      Clause 04 said transfers happen "iki hâlde" and enumerated two. There
      is a third: with the visitor's consent the chat conversation leaves for
      Google's Gemini service. Commit `5138fc1` disclosed that transfer in
      `CerezPolitikasi.tsx` and `GizlilikPolitikasi.tsx` and missed the one
      document whose statutory job is to enumerate aktarım. A CLOSED list
      that is incomplete is worse than an omission: it does not merely fail
      to mention the transfer, it denies it. Clause 02 now names the chat as
      a source of content-borne personal data, by that clause's own rule —
      "Yüklediğiniz dosyanın içeriği kişisel veri taşıyorsa … o veri de bu
      metnin kapsamındadır" — which text typed into a chat box plainly is.

   WHAT CLAUSE 04 DOES NOT SAY, AND WHY (§13, §1.3, USER_INPUTS §J)
   ----------------------------------------------------------------
   It says nothing about what Google does with the text after it arrives: no
   retention, no training, no deletion, no security posture, not even
   "geçici olarak işlenir". Nothing in this repository can establish any of
   it, and a KVKK aydınlatma metni is the last place to guess. What it does
   state is what the source proves — consent first, conversation text only,
   no IP (`supabase/functions/chat/index.ts:34-45` forwards no browser
   header), and no write to this site's database.

   The cross-reference is by clause NUMBER and links to `/gizlilik-politikasi`
   with no `#` fragment, the way `CerezPolitikasi.tsx` madde 03 already does.

   THE REASON FOR THAT HAS BEEN REMOVED — 09b-2. It used to read: "`ScrollToTop`
   overrides native fragment scrolling, so a hash link would land the reader at
   the top of a seven-clause document instead of at the clause it names." That
   was true and it was a workaround; `ScrollToTop.tsx` now honours the fragment
   on both entry paths and `e2e/09b2-fragment-navigation.spec.ts` holds it
   there. The numeric cross-reference is LEFT AS IT IS rather than converted:
   it is a citation style shared with two other documents, changing it is an IA
   decision about all three at once, and this packet's business here was the
   defect and not the convention. Anyone taking that decision should know the
   constraint is gone.

   5. THE LIST WAS CLOSED AND SHORT BY ONE AGAIN — PHASE 08 CORRECTION #5.
      Correction #4 replaced "iki hâlde" with "üç hâlde", which fixed the
      instance and kept the defect: a closed COUNT that a later measurement can
      falsify without anyone noticing. It was falsified within the round.
      Loading `/giris` sends the visitor's IP and browser data to hCaptcha's
      endpoints — measured on a plain load, no interaction: two
      `newassets.hcaptcha.com` iframes, four `hcaptcha.com` hosts, a `__cf_bm`
      cookie on `.hcaptcha.com` with a 29.9-minute expiry. That is a transfer
      and this is the document whose statutory job is to enumerate transfers.

      So the count is gone. The clause now says "yalnızca aşağıda tek tek
      sayılan hâllerde" and each case is its own paragraph with its own lead —
      still a CLOSED list, which is what an aydınlatma metni owes a reader, but
      one that cannot go stale silently: adding a case adds a paragraph, and no
      numeral anywhere else in the clause has to be found and changed with it.
      Prose paragraphs rather than an `<ol>` because `.shell-prose` styles only
      `> p`; a bare list would render at the browser's default, which is the
      library-default look this phase exists to remove, and `shell.css` is not
      this packet's to extend.

      What the new case says is only what the browser shows: which route, that
      it mounts on load with no consent asked, which host, and what the request
      necessarily carries. It says NOTHING about what hCaptcha or Cloudflare do
      after receipt — same boundary as the Gemini case, for the same reason.

   6. THE SUPPLIER TRANSFER IS NOW INSIDE THE LIST, NOT BENEATH IT.
      "Bir işin yürütülmesi için üçüncü bir tedarikçiye teknik dosya
      iletilmesi gerekiyorsa…" sat one paragraph under a sentence that had just
      closed the enumeration. That predates correction #4 and got sharper when
      the list acquired an explicit numeral: a closed list with a further case
      immediately beneath it denies the case it is printing. It is now a
      paragraph of the enumeration with the same lead as the others, and the
      boundary paragraph that follows says the list has ended rather than
      leaving the reader to infer it. Its own qualifier — that this happens
      only with the customer's knowledge — is unchanged, because it is the
      commitment the clause was already making and nothing here verifies more.

   7. THE LIST WAS CLOSED AND SHORT BY TWO — PHASE 09b-2. Correction #5's fix
      HOLDS: it was verified rather than assumed, and the enumeration under
      "Aktarım yalnızca aşağıda tek tek sayılan hâllerde olur" does contain the
      AI transfer, in its own paragraph, with its own lead. The clause was
      nevertheless still short, and the two it was short of are instructive
      because neither is exotic:

      THE FONT CDN. `index.html:265-274` loads the site's typefaces from
      `fonts.googleapis.com` and `fonts.gstatic.com`. 09b-1 measured that
      request on EVERY route it tested, before any interaction, and the request
      necessarily carries the visitor's IP and user agent. That is a transfer
      to a third party by this clause's own standard — its hCaptcha paragraph
      says so in as many words about the identical mechanism. Both sibling
      documents already listed the fonts; the ONE document whose statutory job
      is to enumerate aktarım did not. It is the most-visited transfer on the
      site and it was the missing one.
      C1 UPDATE: the fonts are self-hosted now (`src/styles/fonts.css`), so this
      transfer no longer exists and its paragraph was removed from madde 04 —
      a listed transfer that does not happen is as wrong as a missing one.

      THE OAUTH REDIRECT. `Login.tsx:281` calls `signInWithOAuth`, which
      navigates the browser to the auth server and onward to the provider.
      Whether `google` and `linkedin_oidc` are ENABLED could not be established
      from this checkout — 09b-1 returned that question unanswered rather than
      answering it by a workaround — so the paragraph is written to be true
      either way: it states the hop the source proves and stops at the
      provider's own page, which is that provider's aydınlatma metni to write,
      not ours.

      WHY THIS KEEPS HAPPENING, AND THE ONE STRUCTURAL NOTE WORTH LEAVING. A
      closed list is the right form for an aydınlatma metni and it will go
      stale again, because it enumerates BEHAVIOUR and nothing in the build
      compares it against the behaviour. `e2e/qa-p08-storage-disclosure.spec.ts`
      does exactly that for the storage table and it is why that table has
      stopped drifting. The equivalent for this clause — walk the public
      routes, collect the request origins, assert every one is covered by a
      published case — is the instrument this defect class actually needs. It
      is QA's to write under §3.3, and it is named here so the next person does
      not rediscover the need from a sixth correction.

   The one thing this page must never grow is a security guarantee — see
   `GizlilikPolitikasi.tsx`, where one had to be removed. §J
   `CONFIDENTIALITY_TEXT_APPROVED: NO` and `NDA_AVAILABLE: NO` were swept
   across the whole public tree in 09b-2 and nothing had crept back; clause 05
   still states the statutory position and commits to no day count and no
   destruction calendar.
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
        <p>
          Aynı kural sayfaların köşesindeki sohbet kutusuna yazdığınız metin için de geçerlidir:
          yazdıklarınız bir isim, bir telefon numarası veya bir firma unvanı taşıyorsa o veri de bu
          metnin kapsamındadır. Sohbet metni sitenin veri tabanına kaydedilmez; yalnızca yapay zekâ
          onayı verdiğiniz hâlde site dışına aktarılır ve bu aktarım 04. maddede yazılıdır.
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
          yalnızca aşağıda tek tek sayılan hâllerde olur.
        </p>
        <p>
          <strong>Kanuni talep.</strong> Yetkili kamu kurum ve kuruluşlarının kanuna dayalı talebi.
        </p>
        <p>
          <strong>Barındırma ve veri tabanı.</strong> Bu sitenin çalışması için kullanılan
          barındırma ile veri tabanı altyapısının hizmet sağlayıcısı.
        </p>
        <p>
          <strong>Giriş sayfasındaki güvenlik bileşeni.</strong>{" "}
          <Link to="/giris">Giriş sayfasını</Link> açtığınızda, formu otomatik giriş denemelerine
          karşı koruyan hCaptcha bileşeni yüklenir; tarayıcınız <code>hcaptcha.com</code> alan
          adındaki sunuculara istek gönderir ve bu istekle IP adresiniz ile tarayıcı bilginiz o
          sunuculara ulaşır. Bu hâl için onayınız istenmez ve alınmaz: bileşen sayfa açılır açılmaz,
          siz bir şey yapmadan yüklenir. Tarayıcınızda bıraktığı çerez ve bileşenin bütün alanları{" "}
          <Link to="/cerez-politikasi">Çerez Politikası</Link>’nın 01. ve 03. maddelerinde yazılıdır.
        </p>
        <p>
          <strong>Sohbet asistanı — yalnızca onay verirseniz.</strong> Sohbet asistanında yapay zekâ
          onayı vermeniz hâlinde, o ana kadarki yazışma sitenin kendi sunucu fonksiyonu üzerinden
          Google’ın Gemini servisine iletilir. Onay vermezseniz bu aktarım hiç olmaz. Aktarılan tek
          şey yazışma metnidir: IP adresiniz, oturum bilginiz veya sizi tanımlayan başka bir veri
          gönderilmez, çünkü aradaki sunucu fonksiyonu tarayıcınızın başlıklarını iletmez. Metin
          sitenin veri tabanına da kaydedilmez. Aktarımın adım adım nasıl gerçekleştiği{" "}
          <Link to="/gizlilik-politikasi">Gizlilik Politikası</Link>’nın 06. maddesindedir.
        </p>
        <p>
          <strong>Google veya LinkedIn ile giriş — yalnızca o düğmeye basarsanız.</strong>{" "}
          <Link to="/giris">Giriş sayfasındaki</Link> “Google” ya da “LinkedIn” düğmesine
          basarsanız tarayıcınız siteden ayrılır: önce yukarıdaki barındırma ve kimlik doğrulama
          altyapısına, oradan da seçtiğiniz sağlayıcının kendi giriş sayfasına gider. Düğmeye
          basmazsanız bu yönlendirme hiç olmaz. Sağlayıcının kendi sayfasında hangi verinin
          işlendiğini bu metin anlatmaz; orası o sağlayıcının kendi aydınlatma metninin konusudur.
        </p>
        <p>
          <strong>Bir işin tedarikçiye verilmesi — bilginiz dâhilinde.</strong> Bir işin
          yürütülmesi için üçüncü bir tedarikçiye teknik dosya iletilmesi gerekiyorsa, bu ancak
          sizin bilginiz dâhilinde yapılır.
        </p>
        <p>
          Aktarımın gerçekleştiği hâller bunlardır. Bir üçüncü tarafa ulaştıktan sonra verinin ne
          olduğu hakkında bu belge bir şey söylemez: orası bizim göremediğimiz bir yer ve sizin
          adınıza doğrulayamayacağımız bir şeyi burada yazmayız. Bu nedenle sohbet kutusuna
          paylaşmak istemediğiniz hiçbir bilgiyi yazmayın; teknik ayrıntılar için teklif akışını
          kullanın, oraya bıraktığınız veri ve dosyalar hiçbir yapay zekâ servisine gönderilmez.
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

const KVKK_TR = {
  eyebrow: "Yasal metin",
  title: "KVKK Aydınlatma Metni",
  lede: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında: bu sitede hangi kişisel veri, hangi amaçla ve hangi hukuki sebeple işlenir.",
  metaDescription: "Mas Technic KVKK aydınlatma metni — işlenen kişisel veriler, işleme amacı ve hukuki sebep, aktarım, saklama ve KVKK md. 11 kapsamındaki haklarınız.",
  clauses: CLAUSES,
};

export const KVKK = () => {
  const text = useLocale() === "en" ? KVKK_EN : KVKK_TR;
  return <LegalDocument rail={{ no: "L1", label: "KVKK" }} selfPath="/kvkk" {...text} />;
};
