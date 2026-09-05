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

   CLAUSE 03 NAMES THE GEMINI TRANSFER — PHASE 08 CORRECTION #2. This clause
   enumerates the requests that leave the reader's browser, and it listed only
   the font CDN. The chat panel's opt-in AI path is the other one: the
   conversation goes to the site's own edge function, which forwards it to
   Google (`supabase/functions/chat/index.ts:32`, fetched at `:34`). A list of
   third-party requests that omits one is a list that misleads, so it is named
   here — but the CHAIN lives in `/gizlilik-politikasi` madde 06 and this page
   defers to it rather than keeping a second copy that can drift out of step.
   It sets no cookie and leaves no key in the browser, which is why it is a
   sentence here and not a row of its own in the table above.

   THE TABLE WAS SHORT BY ONE — PHASE 08 CORRECTION #3. Madde 01 says the
   things this site stores are "hepsi 02. maddede listelenmiştir", and that
   sentence is the valuable part of the clause: it is a completeness claim a
   reader can falsify in thirty seconds with devtools. It was false.
   `mas_intro_seen` is written at `index.html:314` by the inline "Precision
   Born" entry script, which is not a module and therefore never appeared in
   any grep over `src/`. It is now the table's fifth row, because it is
   cheaper to make the claim true than to water it down.

   The row states only what `index.html:294-316` proves: `sessionStorage`, a
   one-bit flag that records the entry sequence has already played, written
   only when `location.pathname` is `/` and not written at all under
   `prefers-reduced-motion: reduce`, living until the tab closes — which is
   what `sessionStorage` IS, not a duration anybody chose. It is not tracking,
   identifies nobody and is never sent anywhere, so the note under the table
   still holds for it.

   THE NO-COOKIE CLAIM WAS FALSE — PHASE 08 CORRECTION #5. The sentence above
   ("measured, six public routes, zero cookies") is exactly how this shipped
   wrong: six routes were measured and `/giris` was not one of them. `/giris` is
   a public route by the repository's own contract (`NON_SHELL_PUBLIC_ROUTES` in
   `e2e/shared-shell-accessibility.spec.ts`), `Login.tsx:230` renders
   `<HCaptcha>` inside the form, and it mounts with the page.

   MEASURED, fresh context, plain load of `/giris`, NO interaction:

     cookie  __cf_bm   domain .hcaptcha.com   httpOnly  secure  sameSite None
                       expires in 29.9 minutes
     hosts   js.hcaptcha.com · newassets.hcaptcha.com · two ephemeral
             <id>.w.hcaptcha.com workers   (plus the two font hosts)
     iframes 2, both newassets.hcaptcha.com/captcha/v1/…/hcaptcha.html
             (`#frame=checkbox` and `#frame=challenge`)

   Every other route measured — `/`, `/kvkk`, `/cerez-politikasi`,
   `/malzemeler`, `/teklif-al`, `/sifremi-unuttum`, `/reset-password` —
   contacts only the two font hosts and creates zero cookies.

   THE PRECEDENT FOLLOWED is the font CDN's, which is this repository's own
   shape for a third party the browser contacts directly, and it is how the
   Gemini transfer was handled in correction #2: the disclosure goes in the
   clause that already enumerates outbound requests (madde 03), the cookie
   itself goes in the clause about cookies (madde 01), and the same three
   documents are corrected together so none of them can drift.

   WHAT IS DELIBERATELY NOT SAID: nothing about what hCaptcha or Cloudflare do
   with the request after it arrives — no retention, no deletion, no training,
   no security posture. Nothing in this repository establishes any of it, and
   `GizlilikPolitikasi.tsx` madde 06's stance is the model. What IS said is
   what the browser shows: which route, that it mounts on load without
   interaction, which hosts, the cookie's name, domain, flags and lifetime.

   MADDE 01'S SECOND SENTENCE IS UNTOUCHED AND STILL TRUE. `__cf_bm` is a
   bot-management cookie; it is not an ad cookie, an analytics cookie, a tag
   manager, an ad pixel or a session recorder.

   THE COOKIE DOES NOT GET A ROW IN MADDE 02, and that is a decision rather
   than an oversight. That table is titled "Yerel depo kayıtları" and its own
   note says these records are NOT cookies — they are not sent with every HTTP
   request and only this site's pages can read them. `__cf_bm` is the opposite
   on both counts. A cookie row in a local-storage table would be a small new
   untruth in the clause built to end one, so the cookie is disclosed in madde
   01 and madde 03 with its full attributes instead.

   LEFT OPEN, ON PURPOSE: madde 04 still says no "çerez tercihleri" window is
   shown. Whether a third-party widget that loads before any interaction
   changes that is a legal determination, not a repository fact, and whether
   the login form should carry hCaptcha at all is Phase 09's security call.
   This document's job here was to stop denying what the browser does.

   THE NOTE UNDER THE TABLE SAID "hiçbiri üçüncü bir tarafa aktarılmaz", AND
   THE FIRST ROW IS A COUNTEREXAMPLE. `sb-…-auth-token` is a bearer token: it
   is attached to every authenticated request and therefore reaches the hosting
   and database provider — which the other clauses and `/kvkk` madde 04
   correctly enumerate as a transfer case. "Aktarım" in the sense the note
   meant (nobody is handed this list) and "aktarım" in the sense KVKK madde 04
   means (data reaches a third party) are different words, and a legal document
   does not get to rely on the reader picking the right one. The note now says
   what the token does and cites the clause that enumerates it. The provider is
   described, not named, which is the convention `/kvkk` madde 04 already sets
   ("barındırma ile veri tabanı altyapısının hizmet sağlayıcısı").
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
    "mas_intro_seen",
    "sessionStorage",
    "Ana sayfadaki giriş sekansının oynadığını not eder; böylece aynı sekmede bir daha oynamaz. Yalnızca ana sayfada yazılır, hareket azaltma açıksa hiç yazılmaz.",
    "Sekme kapanana kadar",
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
    title: "Çerezler ve tek istisna",
    body: (
      <div className="shell-prose">
        <p>
          Bu sitenin kendi sayfaları tarayıcınızda çerez oluşturmuyor. Reklam çerezi, analitik çerezi,
          etiket yöneticisi, reklam pikseli ve oturum kaydı yazılımı da yok.
        </p>
        <p>
          Tek istisna giriş sayfasıdır ve kendi cümlesini hak ediyor:{" "}
          <Link to="/giris">giriş sayfası</Link> açıldığında, formu otomatik giriş denemelerine karşı
          koruyan hCaptcha bileşeni yükleniyor ve tarayıcınızda <code>__cf_bm</code> adında bir çerez
          oluşuyor. Çerez <code>hcaptcha.com</code> alan adına aittir, ömrü otuz dakikadır,{" "}
          <code>httpOnly</code> işaretlidir — yani sayfa betikleri onu okuyamaz — ve yalnızca
          hcaptcha.com’a giden isteklerle gönderilir. Bileşen sayfa açılır açılmaz yükleniyor; bunun
          için bir şeye tıklamanız gerekmiyor. Ne olduğu 03. maddede yazıyor.
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
      <>
        {/* THE WRAPPER IS A BLOCK, NOT A GRID — PHASE 08 CORRECTION #4.

            This figure was the only `ShellSpecTable` on the site that a phone
            could not read. Measured at 375 before the change: the table is
            583.88px wide, `DEPO`, `NE İŞE YARAR` and `SÜRE` sit entirely
            outside the viewport for all five rows, and nothing scrolls.

            The cause is one level up from the primitive, which is innocent:
            `ShellSpecTable` already wraps its table in `.shell-table-scroll`
            (`overflow-x: auto`). That region only engages when its own box is
            NARROWER than the table. The old wrapper was `div.shell-stack`,
            which is `display: grid`. `.shell-stack` sets `min-width: 0` on
            ITSELF but not on its items, so `figure.shell-table` kept
            `min-width: auto` and the single implicit `auto` track could not be
            sized below the figure's min-content contribution. THIS table's
            min-content is 585.875px — its key column carries unbreakable
            tokens like `mas_pending_cad_upload` — so the track resolved to
            585.875px inside a 333px container and the scroll box was never
            constrained. The other seven `ShellSpecTable` figures survive the
            same wrapper only because their own min-content happens to fit.

            Two classes were tried and MEASURED INERT here, so neither is the
            fix: `shell-span-read` (what `/kalite-dosyasi` uses) and
            `shell-doc-table` added on top of `shell-stack`. The clause body is
            `.shell-doc-section-body`, which is `display: block`, so
            `grid-column` on a child of it does nothing; and `.shell-doc-table`
            only sets a top margin. What changes the geometry is DROPPING THE
            GRID: a block-level figure takes its containing block's width
            regardless of min-content, the table then overflows
            `.shell-table-scroll`, and `useScrollableRegionAccess` grants
            `tabindex="0"` because `isScrollable()` is finally true. Measured
            after: figure 278 / 333 / 348px at 320 / 375 / 390, scrollWidth 584
            against clientWidth 276 / 331 / 346 — reachable by touch and by
            keyboard. 768 / 1280 / 1440 measure identical to before.

            The shape is `BlogDetail.tsx:199`'s — `div.shell-doc-table` inside
            a `ShellDocSection` — the one call site that already had it right.

            CARRY THIS FORWARD: THE REFLOW GUARD IS GREEN *BECAUSE* AN ANCESTOR
            CLIPS. `documentElement.scrollWidth - clientWidth <= 1` was 0 at all
            three widths while three of four columns were unreachable, because
            `div.shell-root` computes `overflow-x: clip` — which, unlike
            `hidden`, is not programmatically scrollable either. That assertion
            cannot see this failure class, and neither can axe. A test that CAN
            would walk every `.shell-table-scroll` and assert that the table
            either fits its box or its box is a real scroll region
            (`scrollWidth <= clientWidth + 1 || isScrollable(el)`). It belongs
            beside the existing lane in
            `e2e/landing/shell-cascade-contract.spec.ts` ("scrollable regions
            stay keyboard reachable"), which passed here for the wrong reason:
            at 375 there was no scrollable region, so there was no missing focus
            stop to find. Writing it is QA's call under §3.3, not this file's. */}
        <div className="shell-doc-table">
          <ShellSpecTable
            caption="Yerel depo kayıtları"
            note="Bu kayıtlar çerez değildir: her HTTP isteğiyle birlikte otomatik gönderilmezler ve yalnızca bu sitenin kendi sayfaları tarafından okunabilirler. Tarayıcınızın geliştirici araçlarındaki Uygulama / Depolama bölümünden hepsini görebilirsiniz."
            headers={["KAYIT", "DEPO", "NE İŞE YARAR", "SÜRE"]}
            numericFrom={4}
            rows={STORAGE_ROWS}
            rowKey={(row) => String(row[0])}
          />
        </div>
        <p className="shell-note">
          Bu kayıtların hiçbiri reklam veya profilleme amacı taşımaz. Tarayıcınız bunları
          kendiliğinden hiçbir yere göndermez; tek istisna oturum anahtarıdır — giriş yaptıysanız
          sitenin barındırma ve veri tabanı altyapısına yapılan isteklere eklenir, çünkü oturumunuzu
          açık tutan şey odur. Bu aktarım{" "}
          <Link to="/kvkk">KVKK Aydınlatma Metni</Link>’nin 04. maddesinde sayılıdır.
        </p>
      </>
    ),
  },
  {
    id: "ucuncu-taraf",
    title: "Üçüncü taraf istekleri",
    body: (
      <div className="shell-prose">
        {/* NO NUMERAL — PHASE 08 CORRECTION #5, THE THIRD ONE OF THESE.

            This clause opened "Tarayıcınızın bu sitenin dışına istek
            gönderdiği ÜÇ YER var. ÜÇÜ DE BURADA." — a sentence C4 wrote here
            while removing the same defect from two other clauses ("Aktarım
            İKİ HÂLDE olur", "İKİNCİ VE SON istek"). It was measured true on a
            plain page load and false the moment the reader does what the site
            asks: `src/integrations/supabase/client.ts` builds the client IN
            THE BROWSER against a `*.supabase.co` host, and `/giris`,
            `/sifremi-unuttum`, `/reset-password`, `/iletisim` and `/teklif-al`
            — all public — call it from a submit handler. The chat box calls it
            too (`ChatBot.tsx:95`, `${SUPABASE_URL}/functions/v1/chat`), and
            because the client is configured `persistSession` +
            `autoRefreshToken`, a signed-in reader's browser reaches that host
            on a plain page load as well. Four request destinations, not three,
            and the document already said so in two other places: madde 02's
            note describes the session key reaching the hosting and database
            infrastructure, and `/kvkk` madde 04 enumerates it as a transfer.

            The repair is `/kvkk` madde 04's shape, which C4 got right there:
            drop the numeral, label each case instead of numbering it, and
            close on "these are the cases" rather than on a count. Adding a
            destination now costs a paragraph, not a re-count, and no reader
            can falsify the clause by logging in or sending an RFQ.

            The infrastructure provider is described and not named, which is
            the convention `/kvkk` madde 04 already sets. Nothing is claimed
            about what any of these parties does after receipt. */}
        <p>
          Tarayıcınızın bu sitenin dışına istek gönderdiği yerler aşağıda tek tek sayılıdır.
        </p>
        <p>
          <strong>Yazı tipleri — her sayfada.</strong> Yazı tipleri harici bir yazı tipi dağıtım
          ağından yüklenir; tarayıcınız o sunucuya bir istek gönderir ve sunucu bu isteğe bağlı
          olarak IP adresinizi görür. Bu istek çerez oluşturmaz.
        </p>
        <p>
          <strong>
            Güvenlik bileşeni — yalnızca <Link to="/giris">giriş sayfasında</Link>.
          </strong>{" "}
          Form, otomatik giriş denemelerine karşı hCaptcha ile korunuyor. Bileşen sayfa açılır
          açılmaz yükleniyor — siz bir şey yapmadan ve onayınız istenmeden — tarayıcınız{" "}
          <code>hcaptcha.com</code> alan adındaki sunuculara istek gönderir, sayfaya oradan iki
          çerçeve gömülür ve 01. maddede anlatılan <code>__cf_bm</code> çerezi oluşur. İsteği alan
          sunucular, her istekte olduğu gibi, IP adresinizi ve tarayıcı bilginizi görür. Bundan
          sonrasını — orada ne olduğunu — bu metin anlatmıyor; göremediğimiz bir yer için sizin
          adınıza bir şey taahhüt etmiyoruz.
        </p>
        <p>
          <strong>Barındırma ve veri tabanı altyapısı.</strong> Sitenin çalıştığı barındırma ve
          veri tabanı altyapısı ayrı bir alan adındadır, dolayısıyla oraya giden istekleri de
          tarayıcınız gönderir: giriş yaptığınızda, parola sıfırlama istediğinizde, iletişim
          formunu ya da teklif akışını gönderdiğinizde, sohbet kutusuna bir mesaj yazdığınızda ve
          giriş yaptıysanız oturumunuzu açık tutmak için. 02. maddedeki oturum anahtarı bu
          isteklere eklenir; sayfayı yalnızca okuyorsanız eklenecek bir anahtar da olmaz. Bu hâl{" "}
          <Link to="/kvkk">KVKK Aydınlatma Metni</Link>’nin 04. maddesinde de sayılıdır.
        </p>
        <p>
          <strong>Sohbet asistanı — yalnızca yapay zekâ onayı verirseniz.</strong> Onay verirseniz
          o ana kadarki yazışma, sitenin kendi sunucu fonksiyonu üzerinden Google’ın Gemini
          servisine iletilir. O çerez oluşturmaz, ama burada listelenen kayıtlardan farklı olarak
          tarayıcınızda kalmaz — bu yüzden tam olarak nereye gittiği{" "}
          <Link to="/gizlilik-politikasi">Gizlilik Politikası</Link>’nın 06. maddesinde yazıyor.
        </p>
        <p>
          İsteğin gittiği yerler bunlardır. Bunların dışında sayfalarda gömülü üçüncü taraf video,
          harita, reklam veya sosyal medya bileşeni bulunmuyor.
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
          01. maddedeki <code>__cf_bm</code> çerezi bu sitenin alan adına değil hcaptcha.com’a ait
          olduğu için, bu sitenin verilerini temizlemek onu silmez; tarayıcınızın çerez listesinden
          ayrıca silinir ya da otuz dakika içinde kendiliğinden düşer.
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
    lede="Bu sitenin kendi sayfaları çerez oluşturmuyor; giriş sayfasındaki güvenlik bileşeni bir tane oluşturuyor. Tarayıcınızda tutulan kayıtların tamamı madde 02’de tek tek listelenmiştir."
    metaDescription="Mas Technic çerez politikası — sitenin kendi sayfaları çerez oluşturmaz, giriş sayfasındaki hCaptcha bileşeni bir çerez oluşturur; tarayıcınızda tutulan yerel depo kayıtları, süreleri ve nasıl silinecekleri."
    clauses={CLAUSES}
  />
);
