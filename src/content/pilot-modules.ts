/* ══════════════════════════════════════════════════════════════════════════
   PILOT CORE MODULES (PAGE01)

   Seven detail pages carry one concrete module right after the hero: one
   technical problem → the process answer → how it is checked. Each pilot
   shows a DIFFERENT problem; the other 41 pages do not get a copy of this
   module with the title changed. The drawing is representative and carries
   no measured value; where a real class, thickness or capacity is unknown the
   text stays qualitative.
   ══════════════════════════════════════════════════════════════════════════ */

type Text = { tr: string; en: string };

export type PilotKey = "frezeleme" | "tornalama" | "derin-delik" | "fikstur" | "anodizasyon" | "kalite" | "dfm";

export interface PilotModule {
  schema: PilotKey;
  title: Text;
  subject: Text;
  problem: Text;
  process: Text;
  control: Text;
}

export const PILOT_MODULES: Record<string, PilotModule> = {
  "cnc-frezeleme": {
    schema: "frezeleme",
    title: { tr: "Bir parça, iki erişim yönü, tek datum", en: "One part, two access directions, one datum" },
    subject: { tr: "Aynı parçada erişim, bağlama ve datum ilişkisi", en: "Access, clamping and datum relationship on one part" },
    problem: {
      tr: "Cepler üst yüzde, yan özellik eğik bir yüzde. İki ayrı bağlama, iki özelliği iki ayrı referansa bağlar; aradaki ilişki bağlamaların hizalanması kadar iyi olur.",
      en: "The pockets are on the top face, the side feature on an inclined face. Two separate clampings tie the two features to two separate references; the relationship between them is only as good as the alignment of the clampings.",
    },
    process: {
      tr: "Parça bağlama yüzeyi datum A olacak şekilde bir kez bağlanır. OP10 üstten erişimle cepleri, OP20 döner eksenle eğik özelliği aynı referanstan işler.",
      en: "The part is clamped once, with the clamping face as datum A. OP10 machines the pockets from above and OP20 machines the inclined feature with the rotary axis, from the same reference.",
    },
    control: {
      tr: "Eğik özelliğin A ve B'ye göre konumu kontrol planına yazılır; ilk parçada ölçülür ve kayda geçer.",
      en: "The position of the inclined feature relative to A and B is written into the control plan; it is measured on the first part and recorded.",
    },
  },
  "cnc-tornalama": {
    schema: "tornalama",
    title: { tr: "Çap tek başına yetmez: salgı aynı datumdan", en: "Diameter alone is not enough: runout from the same datum" },
    subject: { tr: "Aynı datum üzerinden çap ve salgı kontrolü", en: "Diameter and runout checked from the same datum" },
    problem: {
      tr: "İki yatak çapı tek tek doğru olsa da birbirine göre kaçık olabilir; mil montajda salgı yapar.",
      en: "Two bearing diameters can each be right and still be offset from each other; the shaft then runs out in the assembly.",
    },
    process: {
      tr: "Çaplar mümkün olduğunca aynı bağlamada, punta referansı korunarak işlenir. Kısa ve rijit parçalar standart tornada, uzun ve ince parçalar sehimi sınırlamak için kayar puntalı tornada işlenir; seçim parça geometrisine göre yapılır.",
      en: "The diameters are machined in the same clamping wherever possible, keeping the centre reference. Short, rigid parts are turned on a standard lathe; long, slender parts on a Swiss-type lathe to limit deflection — the choice follows the part geometry.",
    },
    control: {
      tr: "Salgı, çapların kendisi gibi datum A (punta ekseni) üzerinden ölçülür; ölçümün hangi datuma göre alındığı kayda yazılır.",
      en: "Runout is measured, like the diameters, from datum A (the centre axis); the record states which datum the measurement was taken from.",
    },
  },
  "derin-delik-raybalama": {
    schema: "derin-delik",
    title: { tr: "Derin delikte üç ayrı soru: çap, doğrusallık, yüzey", en: "Three separate questions in a deep hole: diameter, straightness, surface" },
    subject: { tr: "Derin delik kesiti ve kontrol yöntemleri", en: "Deep-hole section and inspection methods" },
    problem: {
      tr: "Boy/çap oranı büyüdükçe takım sapar, talaş tahliyesi zorlaşır. Ağızda doğru çıkan çap, deliğin dibinde aynı olmayabilir.",
      en: "As the length/diameter ratio grows, the tool deflects and chip evacuation gets harder. A diameter that is right at the mouth may not be the same at the bottom of the hole.",
    },
    process: {
      tr: "Yöntem L/D oranına göre seçilir: kısa deliklerde matkap ve rayba, uzun deliklerde derin delik delme ve gerekiyorsa raybalama. Ulaşılabilir oran kanal çapı ve malzemeye göre teklifte belirtilir.",
      en: "The method is chosen by the L/D ratio: drill and reamer for short holes, deep-hole drilling and, where needed, reaming for long ones. The achievable ratio is stated in the quote according to bore diameter and material.",
    },
    control: {
      tr: "Çap, doğrusallık ve yüzey ayrı ayrı kontrol edilir: çap iç çap ölçümüyle, doğrusallık ve yüzey kontrol planında tanımlanan yöntemle. Hangi kotenin hangi derinlikte ölçüldüğü kayda geçer.",
      en: "Diameter, straightness and surface are checked separately: diameter by bore measurement, straightness and surface by the method defined in the control plan. The record states which dimension was measured at which depth.",
    },
  },
  "fikstur-aparat-tasarimi": {
    schema: "fikstur",
    title: { tr: "Fikstürün dört işi: konumla, tut, eriş, bırak", en: "A fixture's four jobs: locate, hold, give access, release" },
    subject: { tr: "Konumlama, tutma, erişim ve serbest bırakma", en: "Locating, holding, access and release" },
    problem: {
      tr: "Parça tutuluyken doğru, bırakıldığında farklı ölçülebilir: sıkma kuvveti ince kesitleri esnetir, bırakınca geri yaylanır.",
      en: "A part can measure right while it is held and differently once released: clamping force flexes thin sections, which spring back when released.",
    },
    process: {
      tr: "Önce konum (pimler ve dayama yüzeyleri parçayı tek konuma oturtur), sonra tutma (kuvvet rijit kesitlere verilir), sonra takım erişimi planlanır. Sıra ve kuvvet noktaları fikstür tasarımına yazılır.",
      en: "Location comes first (pins and rest surfaces seat the part in one position), then holding (force goes onto rigid sections), then tool access is planned. The sequence and force points are written into the fixture design.",
    },
    control: {
      tr: "Kritik koteler parça fikstürden serbest bırakıldıktan sonra da ölçülür; tutuluyken ve serbestken alınan değerler aynı kayıtta durur.",
      en: "Critical dimensions are measured again after the part is released from the fixture; the values taken while held and while free sit in the same record.",
    },
  },
  "anodizasyon": {
    schema: "anodizasyon",
    title: { tr: "Kaplama ölçüyü değiştirir: pay işleme planındadır", en: "Coating changes the size: the allowance is in the machining plan" },
    subject: { tr: "İşlem öncesi ve sonrası boyut payı, maskeleme", en: "Size allowance before and after treatment, masking" },
    problem: {
      tr: "Anodik tabaka yüzeyden hem dışarı büyür hem malzemeye nüfuz eder. Dar toleranslı bir geçme yüzeyi, işlemeden doğru çıkıp kaplamadan sonra sığmayabilir.",
      en: "An anodic layer both grows outward from the surface and penetrates the material. A tight-tolerance fit surface can come out right from machining and no longer fit after coating.",
    },
    process: {
      tr: "Tabaka tipi ve kalınlığı şartnameden okunur; kritik yüzeylerde işleme ölçüsü bu paya göre belirlenir. Diş, geçme ve elektriksel temas yüzeyleri gerekiyorsa maskelenir.",
      en: "The layer type and thickness are read from the specification; on critical surfaces the machined size is set for this allowance. Threads, fit surfaces and electrical contact surfaces are masked where needed.",
    },
    control: {
      tr: "Kritik koteler kaplama sonrasında ölçülür; maskelenen yüzeyler kontrol planında ayrıca işaretlenir.",
      en: "Critical dimensions are measured after coating; masked surfaces are marked separately in the control plan.",
    },
  },
  "kalite-kontrol": {
    schema: "kalite",
    title: { tr: "Kontrol bir zincirdir; şablon ile kayıt ayrı şeylerdir", en: "Inspection is a chain; a template and a record are different things" },
    subject: { tr: "Kontrol planından teslim kaydına", en: "From control plan to delivery record" },
    problem: {
      tr: "Bir ölçüm raporu, neyin neden ölçüldüğü önceden yazılmadıysa yalnızca sayılardan oluşur; seri boyunca neyin izlendiği belirsiz kalır.",
      en: "A measurement report is just numbers unless what was measured, and why, was written down beforehand; what is monitored through the series stays unclear.",
    },
    process: {
      tr: "Kontrol planı imalattan önce yazılır, ilk parça tüm kritik koteleri doğrular, ara kontroller kayma eğilimli koteleri izler, teslim kaydı bunların toplamıdır.",
      en: "The control plan is written before manufacturing, the first part verifies every critical dimension, in-process checks monitor dimensions prone to drift, and the delivery record is the sum of these.",
    },
    control: {
      tr: "Bu sayfadaki zincir bir örnek şablondur; sizin işinizin kaydı teknik resminize göre kurulur ve teslim dosyasında yer alır. Akredite 3. taraf CMM ölçümü talebe bağlıdır.",
      en: "The chain on this page is an example template; the record for your job is built from your technical drawing and sits in the delivery file. Accredited 3rd-party CMM measurement is on request.",
    },
  },
  "tasarim-rehberi-dfm": {
    schema: "dfm",
    title: { tr: "Üç sorun, üç üretilebilirlik yaklaşımı", en: "Three problems, three manufacturability approaches" },
    subject: { tr: "İç köşe, cep ve bağlama üzerinde üç sorun", en: "Three problems on corner, pocket and clamping" },
    problem: {
      tr: "Sivri iç köşe frezeyle işlenemez; derin ve dar bir cep uzun, sapan bir takım ister; bağlanacak yüzeyi olmayan bir parça ikinci operasyonda tutulamaz.",
      en: "A sharp internal corner cannot be milled; a deep, narrow pocket needs a long tool that deflects; a part with no surface to clamp cannot be held for the second operation.",
    },
    process: {
      tr: "Köşeye takım yarıçapına uygun bir radyüs verilir, cep oranı kullanılabilir takıma göre ayarlanır, işlevi bozmayan bir bağlama payı veya yüzeyi eklenir. Her öneri işlevi koruyup korumadığıyla birlikte yazılır.",
      en: "The corner gets a radius that suits the tool radius, the pocket ratio is set for a usable tool, and a clamping allowance or surface that does not harm the function is added. Each suggestion is written down together with whether it keeps the function.",
    },
    control: {
      tr: "Öneriler teklifle birlikte yazılı iletilir; kararı tasarımcı verir. Revize model, kabul edilen önerilerle birlikte geri gönderilir.",
      en: "The suggestions are sent in writing with the quote; the designer decides. The revised model is returned with the accepted suggestions.",
    },
  },
};
