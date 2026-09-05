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
   Clauses 04, 05 and 06 are the three facts about this site that a
   privacy-minded reader actually cannot find out for themselves without opening
   devtools, and all three are verifiable from the repository rather than
   asserted:

     · no analytics, tag manager, tracking pixel or session recorder is loaded
       (§K `ANALYTICS_PROVIDER: NONE`, `ERROR_MONITORING_PROVIDER: NONE`; and
       there is no such script in `index.html` or anywhere in `src/`);
     · the fonts are fetched from a third-party host at page load, which means
       that host receives a request from your browser. That is a real, small
       disclosure and nobody had written it down.
     · the chat panel forwards what you type to Google — clause 06, below.

   The `Mas Technic Precision CNC ("Şirket")` construction is gone too: the
   legal person is named in the KVKK metni, which is the document whose job
   that is, and this page links to it rather than restating it differently.

   ── CLAUSE 06, ADDED BY PHASE 08 CORRECTION #2 ───────────────────────────
   THE GAP, AND WHY IT IS A DEFECT RATHER THAN AN OMISSION
   Correction #1 deleted the `faq_analytics` writes from `ChatBot.tsx` and
   reported upward that ONE request survived, described nowhere: the chat's own
   `POST {SUPABASE_URL}/functions/v1/chat`. A privacy policy's job is to
   enumerate processing, so an undisclosed transfer of reader-typed content
   makes the document misleading even where no individual sentence in it is
   false. That is the same failure class this phase spent itself removing, one
   level up.

   THE ESCALATED DRAFT WAS WRONG, WHICH IS WHY IT WAS ESCALATED
   The reported sentence said the assistant "transmits the message you type to
   the site's own backend for answering". Read rather than inferred:
   `supabase/functions/chat/index.ts:32` builds
   `https://generativelanguage.googleapis.com/v1beta/models/
   gemini-2.0-flash:streamGenerateContent` and `:34` fetches it, with the
   conversation remapped into Gemini's `role`/`parts` shape at `:22-30`. The
   message does not stop at the site's backend. "Our own backend" would have
   been a NEW false statement in the document this phase rewrote to stop being
   false — which is precisely why narrowing a legal page is not one agent's
   call to take alone.

   EVERY SENTENCE IN CLAUSE 06 IS A CODE FACT, AND HERE IS EACH ONE
     · local-first; no network on a match — `ChatBot.tsx:235-239`, over the
       bundled `src/data/chatFaqData`
     · the opt-in gate — `ChatBot.tsx:209` (typed `Evet` / `👍`), `:384` (the
       rendered Evet button), and `:216`, which is the ONLY call site of
       `callAi()`. There is no path to the network that does not pass it.
     · site function → Google — `ChatBot.tsx:71` and `:98`, then
       `chat/index.ts:32` and `:34`
     · the conversation, not one line — `ChatBot.tsx:216` passes the prior
       `msgs` plus the original question; `:188` sends that array whole
     · only the text goes onward — `chat/index.ts:37-44`: the outbound body is
       `system_instruction`, `contents` and `generationConfig`, and no browser
       header is forwarded with it
     · nothing reaches this site's database — the whole 103-line function
       contains no Supabase client, no `insert` and no `from(`
     · the daily counter — `ChatBot.tsx:72-73`, `:168`, `:242`; already a row
       in the `/cerez-politikasi` table
     · the RFQ contrast — `TeklifAl.tsx:523` invokes `rfq-rate-limit`, which
       makes no external call, and there is no external `fetch()` anywhere in
       `src/`. The chat is the only place on the public site where something
       you TYPE leaves this site's own infrastructure.

   WHAT THE CLAUSE DELIBERATELY DOES NOT SAY
   Nothing about what Google does with the text, how long it holds it, or
   whether it trains on it. We do not know; `USER_INPUTS.md` has no field about
   processors, AI or third parties; and a reassurance nobody can check is the
   defect this page already lost its "şifreli ortamlarda saklanır" sentence
   for. The clause states the BOUNDARY instead — a policy that cannot speak for
   what happens after the handoff should say so, because a reader deciding
   whether to paste a part number needs the boundary more than the comfort.
   §J `NDA_AVAILABLE: NO` is why that advice is given plainly rather than
   hinted at.

   ── CLAUSES 03 AND 05, CORRECTED BY PHASE 08 CORRECTION #5 ───────────────
   This file carried two false sentences, both written by this phase:

     madde 03  "Site çerez kullanmaz."
     madde 05  "Bunun dışında sayfalarda gömülü üçüncü taraf içerik … bulunmaz"
               + "Bir istisna var"

   Measured on a plain load of `/giris` with no interaction: `Login.tsx:230`
   mounts `@hcaptcha/react-hcaptcha`, two `newassets.hcaptcha.com` iframes are
   embedded, four `hcaptcha.com` hosts are contacted, and a `__cf_bm` cookie
   appears on `.hcaptcha.com` with a 29.9-minute expiry. So the site DOES embed
   third-party content, it DOES cause a cookie, and there are TWO exceptions,
   not one — and the second one, unlike the chat, needs no consent and fires on
   load. The full measurement is in `CerezPolitikasi.tsx`'s header, which is
   where the cookie's own attributes are published.

   The disclosure is written where the font CDN's already was, because that is
   this repository's established shape for a third party the browser contacts
   directly, and it is how the Gemini transfer was handled in correction #2.
   The old first sentence of madde 05's second paragraph is kept intact and its
   trailing absolute is moved to its own paragraph, so the RFQ path's
   description did not have to be rewritten to fix a claim about widgets.

   MADDE 04 IS UNTOUCHED AND STILL TRUE: hCaptcha is not an analytics tool, a
   tag manager, an ad pixel or a session recorder, and no page-view count,
   click map or visitor profile is kept.

   Clause 06's boundary — "orası bizim göremediğimiz bir yer ve sizin adınıza
   doğrulayamayacağımız bir şeyi burada yazmıyoruz" — is the model the new
   hCaptcha paragraph follows and cites rather than restates. Nothing here says
   what hCaptcha or Cloudflare do with a request after it arrives.
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
        <p>
          Sohbet kutusuna yazdıklarınız da kaydedilmez; ama onay verirseniz bir yapay zekâ
          servisine iletilir. Bu, sitede yazdığınız bir metnin dışarı çıktığı tek yer olduğu için
          ayrı bir maddede — 06. maddede — anlatılıyor.
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
          Bu sitenin kendi sayfaları çerez oluşturmaz; tek istisna giriş sayfasına gömülü güvenlik
          bileşenidir ve 05. maddede yazılıdır. Tercihleriniz ve oturum bilgisi, tarayıcınızın kendi
          yerel deposunda (<code>localStorage</code> / <code>sessionStorage</code>) tutulur ve her
          istekle birlikte otomatik olarak sunucuya gönderilmez.
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
          veri tabanı altyapısına iletilir.
        </p>
        <p>
          Sayfalara gömülü tek üçüncü taraf bileşeni <Link to="/giris">giriş sayfasındadır</Link>:
          form, otomatik giriş denemelerine karşı hCaptcha ile korunuyor. Bu bileşen sayfa açılır
          açılmaz yükleniyor — bir şeye tıklamanız gerekmiyor ve onayınız istenmiyor — sayfaya{" "}
          <code>hcaptcha.com</code> alan adından iki çerçeve gömülüyor, tarayıcınız o sunuculara
          istek gönderdiği için sunucular IP adresinizi ve tarayıcı bilginizi görüyor ve
          tarayıcınızda ömrü otuz dakika olan <code>__cf_bm</code> adında bir çerez oluşuyor.
          Çerezin bütün alanları <Link to="/cerez-politikasi">Çerez Politikası</Link>’nın 01.
          maddesinde yazılı. Verinin hcaptcha.com’a ulaştıktan sonra ne olduğunu bu politika
          anlatamaz: 06. maddedeki sınır burada da geçerlidir.
        </p>
        <p>
          Bunun dışında sayfalarda gömülü üçüncü taraf video, harita, reklam veya sosyal medya
          bileşeni bulunmaz.
        </p>
        <p>
          İkinci istisna kendi maddesini hak ediyor: sohbet asistanına yapay zekâ onayı verirseniz
          yazdığınız metin bir üçüncü tarafa aktarılır. Nasıl ve kime olduğu 06. maddede yazıyor.
          Aradaki fark önemli: bu aktarım yalnızca siz onay verirseniz olur, giriş sayfasındaki
          bileşen ise sayfayı açtığınız anda yüklenir.
        </p>
      </div>
    ),
  },
  {
    id: "sohbet-asistani",
    title: "Sohbet asistanı ve yapay zekâ",
    body: (
      <div className="shell-prose">
        <p>
          Ana sayfa dışındaki sayfaların köşesinde bir sohbet kutusu var ve iki ayrı şekilde
          çalışıyor. Aradaki fark, yazdığınız metnin nereye gittiğidir. Sorunuz sitenin içinde
          gömülü hazır soru-cevap listesiyle eşleşirse yanıt tarayıcınızın içinde bulunur: bu
          durumda hiçbir yere istek gönderilmez.
        </p>
        <p>
          Eşleşme bulunamazsa asistan durur ve size yapay zekâ kullanıp kullanmayacağını sorar.
          Yalnızca <strong>“Evet”</strong> yazarsanız — ya da çıkan Evet düğmesine basarsanız — o
          ana kadarki yazışma önce sitenin kendi sunucu fonksiyonuna, oradan da Google’ın Gemini
          servisine (<code>generativelanguage.googleapis.com</code>, <code>gemini-2.0-flash</code>)
          iletilir; yanıt oradan gelir. “Hayır” derseniz ya da hiçbir şey yazmazsanız bu aktarım
          olmaz. Onay bir kez alınıp kenara konmuyor: yanıtlanamayan her yeni soruda yeniden
          soruluyor.
        </p>
        <p>
          Bu istekle yalnızca yazışma metni gönderilir: IP adresiniz, oturum bilginiz veya sizi
          tanımlayan başka bir veri Google’a aktarılmaz. Yazdıklarınız sitenin veri tabanına da
          kaydedilmez — aradaki fonksiyon mesajı iletir, tutmaz. Tarayıcınızda kalan tek kayıt,
          günde en fazla 5 mesajlık sınırı sayan <code>mas_chat_ai_count</code>’tur ve{" "}
          <Link to="/cerez-politikasi">Çerez Politikası</Link>’nın 02. maddesinde listelenmiştir.
        </p>
        <p>
          Metin Google’a ulaştıktan sonra ne olduğunu bu politika anlatamaz: orası bizim
          göremediğimiz bir yer ve sizin adınıza doğrulayamayacağımız bir şeyi burada yazmıyoruz.
          Bu yüzden açıkça söylüyoruz — parça numarası, tolerans değeri, teknik resim içeriği ya da
          firmanızın adı gibi paylaşmak istemediğiniz hiçbir bilgiyi sohbet kutusuna yazmayın.
          Teknik ayrıntılar için <Link to="/teklif-al">teklif akışını</Link> kullanın: oraya
          bıraktığınız veri ve dosyalar 05. maddedeki yolu izler ve hiçbir yapay zekâ servisine
          gönderilmez.
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
    metaDescription="Mas Technic gizlilik politikası — bize ilettiğiniz bilgiler, tarayıcınızda saklanan veriler, izleme yapılmaması, üçüncü taraf istekleri ve sohbet asistanının yapay zekâ aktarımı."
    clauses={CLAUSES}
  />
);
