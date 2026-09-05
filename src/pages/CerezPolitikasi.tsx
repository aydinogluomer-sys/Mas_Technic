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

   The no-cookie claim in madde 01 is separate and remains TRUE: measured, six
   public routes, zero cookies.
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
          Bu kayıtların hiçbiri reklam veya profilleme amacı taşımaz ve hiçbiri üçüncü bir tarafa
          aktarılmaz.
        </p>
      </>
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
        <p>
          Üçüncü tarafa giden ikinci ve son istek sohbet asistanınındır: yapay zekâ onayı
          verirseniz yazışmanız Google’ın Gemini servisine iletilir. O da çerez oluşturmaz, ama
          burada listelenen kayıtlardan farklı olarak tarayıcınızda kalmaz — bu yüzden tam olarak
          nereye gittiği{" "}
          <Link to="/gizlilik-politikasi">Gizlilik Politikası</Link>’nın 06. maddesinde yazıyor.
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
