/* ══════════════════════════════════════════════════════════════════════════
   PILOT CORE MODULES (PAGE01)

   Seven detail pages carry one concrete module right after the hero: one
   technical problem → the process answer → how it is checked. Each pilot
   shows a DIFFERENT problem; the other 41 pages do not get a copy of this
   module with the title changed. The drawing is representative and carries
   no measured value; where a real class, thickness or capacity is unknown the
   text stays qualitative.
   ══════════════════════════════════════════════════════════════════════════ */

type Text = { tr: string; en: string; de: string; ru: string };

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
    title: { tr: "Bir parça, iki erişim yönü, tek datum", en: "One part, two access directions, one datum", de: "Ein Teil, zwei Zugriffsrichtungen, ein Bezug", ru: "Одна деталь, два направления доступа, одна база" },
    subject: { tr: "Aynı parçada erişim, bağlama ve datum ilişkisi", en: "Access, clamping and datum relationship on one part", de: "Zugänglichkeit, Aufspannung und Bezug am selben Teil", ru: "Доступ, закрепление и базы на одной детали" },
    problem: {
      tr: "Cepler üst yüzde, yan özellik eğik bir yüzde. İki ayrı bağlama, iki özelliği iki ayrı referansa bağlar; aradaki ilişki bağlamaların hizalanması kadar iyi olur.",
      en: "The pockets are on the top face, the side feature on an inclined face. Two separate clampings tie the two features to two separate references; the relationship between them is only as good as the alignment of the clampings.",
      de: "Die Taschen liegen auf der Oberseite, das seitliche Merkmal auf einer schrägen Fläche. Zwei getrennte Aufspannungen binden die beiden Merkmale an zwei getrennte Bezüge; ihre Lage zueinander ist nur so gut wie die Ausrichtung der Aufspannungen.",
      ru: "Карманы расположены на верхней грани, боковой элемент — на наклонной. Два отдельных установа привязывают эти элементы к двум разным базам; их взаимное положение не точнее совмещения установов.",
    },
    process: {
      tr: "Parça bağlama yüzeyi datum A olacak şekilde bir kez bağlanır. OP10 üstten erişimle cepleri, OP20 döner eksenle eğik özelliği aynı referanstan işler.",
      en: "The part is clamped once, with the clamping face as datum A. OP10 machines the pockets from above and OP20 machines the inclined feature with the rotary axis, from the same reference.",
      de: "Das Teil wird einmal aufgespannt, mit der Spannfläche als Bezug A. OP10 bearbeitet die Taschen von oben und OP20 das schräge Merkmal über die Rundachse, jeweils vom selben Bezug aus.",
      ru: "Деталь закрепляется за один установ, поверхность закрепления служит базой A. OP10 обрабатывает карманы сверху, OP20 — наклонный элемент с помощью поворотной оси, от той же базы.",
    },
    control: {
      tr: "Eğik özelliğin A ve B'ye göre konumu kontrol planına yazılır; ilk parçada ölçülür ve kayda geçer.",
      en: "The position of the inclined feature relative to A and B is written into the control plan; it is measured on the first part and recorded.",
      de: "Die Lage des schrägen Merkmals zu A und B wird im Prüfplan festgelegt; sie wird am Erstteil gemessen und dokumentiert.",
      ru: "Положение наклонного элемента относительно A и B вносится в план контроля; оно измеряется на первой детали и фиксируется в протоколе.",
    },
  },
  "cnc-tornalama": {
    schema: "tornalama",
    title: { tr: "Çap tek başına yetmez: salgı aynı datumdan", en: "Diameter alone is not enough: runout from the same datum", de: "Der Durchmesser allein genügt nicht: Rundlauf vom selben Bezug", ru: "Одного диаметра недостаточно: биение от той же базы" },
    subject: { tr: "Aynı datum üzerinden çap ve salgı kontrolü", en: "Diameter and runout checked from the same datum", de: "Durchmesser- und Rundlaufprüfung vom selben Bezug", ru: "Контроль диаметра и биения от одной базы" },
    problem: {
      tr: "İki yatak çapı tek tek doğru olsa da birbirine göre kaçık olabilir; mil montajda salgı yapar.",
      en: "Two bearing diameters can each be right and still be offset from each other; the shaft then runs out in the assembly.",
      de: "Zwei Lagerdurchmesser können jeder für sich stimmen und dennoch zueinander versetzt sein; die Welle hat dann in der Baugruppe Rundlauffehler.",
      ru: "Две подшипниковые шейки могут быть каждая в допуске и всё же смещены друг относительно друга; тогда вал в сборке даёт биение.",
    },
    process: {
      tr: "Çaplar mümkün olduğunca aynı bağlamada, punta referansı korunarak işlenir. Kısa ve rijit parçalar standart tornada, uzun ve ince parçalar sehimi sınırlamak için kayar puntalı tornada işlenir; seçim parça geometrisine göre yapılır.",
      en: "The diameters are machined in the same clamping wherever possible, keeping the centre reference. Short, rigid parts are turned on a standard lathe; long, slender parts on a Swiss-type lathe to limit deflection — the choice follows the part geometry.",
      de: "Die Durchmesser werden nach Möglichkeit in derselben Aufspannung bearbeitet, unter Beibehaltung des Zentrierbezugs. Kurze, steife Teile werden auf einer Standarddrehmaschine gedreht, lange, schlanke Teile auf einem Langdrehautomaten, um die Durchbiegung zu begrenzen — die Wahl richtet sich nach der Teilegeometrie.",
      ru: "Диаметры по возможности обрабатываются за один установ с сохранением базы по центрам. Короткие жёсткие детали точатся на стандартном токарном станке, длинные и тонкие — на автомате продольного точения, чтобы ограничить прогиб, — выбор определяется геометрией детали.",
    },
    control: {
      tr: "Salgı, çapların kendisi gibi datum A (punta ekseni) üzerinden ölçülür; ölçümün hangi datuma göre alındığı kayda yazılır.",
      en: "Runout is measured, like the diameters, from datum A (the centre axis); the record states which datum the measurement was taken from.",
      de: "Der Rundlauf wird wie die Durchmesser von Bezug A (Zentrierachse) aus gemessen; das Protokoll hält fest, auf welchen Bezug sich die Messung bezieht.",
      ru: "Биение, как и диаметры, измеряется от базы A (оси центров); в протоколе указывается, от какой базы выполнено измерение.",
    },
  },
  "derin-delik-raybalama": {
    schema: "derin-delik",
    title: { tr: "Derin delikte üç ayrı soru: çap, doğrusallık, yüzey", en: "Three separate questions in a deep hole: diameter, straightness, surface", de: "Drei getrennte Fragen bei der Tiefbohrung: Durchmesser, Geradheit, Oberfläche", ru: "Три отдельных вопроса в глубоком отверстии: диаметр, прямолинейность, поверхность" },
    subject: { tr: "Derin delik kesiti ve kontrol yöntemleri", en: "Deep-hole section and inspection methods", de: "Querschnitt der Tiefbohrung und Prüfmethoden", ru: "Сечение глубокого отверстия и методы контроля" },
    problem: {
      tr: "Boy/çap oranı büyüdükçe takım sapar, talaş tahliyesi zorlaşır. Ağızda doğru çıkan çap, deliğin dibinde aynı olmayabilir.",
      en: "As the length/diameter ratio grows, the tool deflects and chip evacuation gets harder. A diameter that is right at the mouth may not be the same at the bottom of the hole.",
      de: "Mit wachsendem Längen-/Durchmesserverhältnis wird das Werkzeug abgedrängt und die Spanabfuhr schwieriger. Ein Durchmesser, der am Bohrungseintritt stimmt, ist am Bohrungsgrund nicht unbedingt derselbe.",
      ru: "С ростом отношения длины к диаметру инструмент отжимается, а отвод стружки затрудняется. Диаметр, верный на входе, на дне отверстия может оказаться другим.",
    },
    process: {
      tr: "Yöntem L/D oranına göre seçilir: kısa deliklerde matkap ve rayba, uzun deliklerde derin delik delme ve gerekiyorsa raybalama. Ulaşılabilir oran kanal çapı ve malzemeye göre teklifte belirtilir.",
      en: "The method is chosen by the L/D ratio: drill and reamer for short holes, deep-hole drilling and, where needed, reaming for long ones. The achievable ratio is stated in the quote according to bore diameter and material.",
      de: "Das Verfahren richtet sich nach dem L/D-Verhältnis: Bohrer und Reibahle bei kurzen Bohrungen, Tieflochbohren und bei Bedarf Reiben bei langen. Das erreichbare Verhältnis wird im Angebot abhängig von Bohrungsdurchmesser und Werkstoff angegeben.",
      ru: "Метод выбирается по отношению L/D: для коротких отверстий — сверло и развёртка, для длинных — глубокое сверление и при необходимости развёртывание. Достижимое отношение указывается в КП в зависимости от диаметра отверстия и материала.",
    },
    control: {
      tr: "Çap, doğrusallık ve yüzey ayrı ayrı kontrol edilir: çap iç çap ölçümüyle, doğrusallık ve yüzey kontrol planında tanımlanan yöntemle. Hangi kotenin hangi derinlikte ölçüldüğü kayda geçer.",
      en: "Diameter, straightness and surface are checked separately: diameter by bore measurement, straightness and surface by the method defined in the control plan. The record states which dimension was measured at which depth.",
      de: "Durchmesser, Geradheit und Oberfläche werden getrennt geprüft: der Durchmesser durch Innenmessung, Geradheit und Oberfläche nach der im Prüfplan festgelegten Methode. Das Protokoll hält fest, welches Maß in welcher Tiefe gemessen wurde.",
      ru: "Диаметр, прямолинейность и поверхность контролируются раздельно: диаметр — измерением отверстия, прямолинейность и поверхность — методом, заданным в плане контроля. В протоколе указывается, какой размер измерен на какой глубине.",
    },
  },
  "fikstur-aparat-tasarimi": {
    schema: "fikstur",
    title: { tr: "Fikstürün dört işi: konumla, tut, eriş, bırak", en: "A fixture's four jobs: locate, hold, give access, release", de: "Vier Aufgaben einer Vorrichtung: positionieren, halten, zugänglich machen, entspannen", ru: "Четыре задачи приспособления: базировать, удержать, дать доступ, раскрепить" },
    subject: { tr: "Konumlama, tutma, erişim ve serbest bırakma", en: "Locating, holding, access and release", de: "Positionieren, Halten, Zugänglichkeit und Entspannen", ru: "Базирование, удержание, доступ и раскрепление" },
    problem: {
      tr: "Parça tutuluyken doğru, bırakıldığında farklı ölçülebilir: sıkma kuvveti ince kesitleri esnetir, bırakınca geri yaylanır.",
      en: "A part can measure right while it is held and differently once released: clamping force flexes thin sections, which spring back when released.",
      de: "Ein Teil kann im gespannten Zustand maßhaltig sein und nach dem Entspannen andere Maße zeigen: Die Spannkraft verformt dünne Querschnitte elastisch, die beim Entspannen zurückfedern.",
      ru: "Деталь может быть в допуске в закреплённом состоянии и иметь другие размеры после раскрепления: усилие зажима упруго деформирует тонкие сечения, и после раскрепления они пружинят обратно.",
    },
    process: {
      tr: "Önce konum (pimler ve dayama yüzeyleri parçayı tek konuma oturtur), sonra tutma (kuvvet rijit kesitlere verilir), sonra takım erişimi planlanır. Sıra ve kuvvet noktaları fikstür tasarımına yazılır.",
      en: "Location comes first (pins and rest surfaces seat the part in one position), then holding (force goes onto rigid sections), then tool access is planned. The sequence and force points are written into the fixture design.",
      de: "Zuerst wird die Positionierung geplant (Stifte und Auflageflächen legen das Teil in genau einer Lage fest), dann das Halten (die Kraft wird in steife Querschnitte eingeleitet), dann die Werkzeugzugänglichkeit. Reihenfolge und Kraftangriffspunkte werden in der Vorrichtungskonstruktion festgehalten.",
      ru: "Сначала планируется базирование (штифты и опорные поверхности фиксируют деталь в одном положении), затем удержание (усилие прикладывается к жёстким сечениям), затем доступ инструмента. Последовательность и точки приложения усилий фиксируются в конструкции приспособления.",
    },
    control: {
      tr: "Kritik koteler parça fikstürden serbest bırakıldıktan sonra da ölçülür; tutuluyken ve serbestken alınan değerler aynı kayıtta durur.",
      en: "Critical dimensions are measured again after the part is released from the fixture; the values taken while held and while free sit in the same record.",
      de: "Kritische Maße werden nach dem Entspannen des Teils aus der Vorrichtung erneut gemessen; die Werte im gespannten und im freien Zustand stehen im selben Protokoll.",
      ru: "Критические размеры измеряются повторно после раскрепления детали в приспособлении; значения в закреплённом и свободном состоянии заносятся в один протокол.",
    },
  },
  "anodizasyon": {
    schema: "anodizasyon",
    title: { tr: "Kaplama ölçüyü değiştirir: pay işleme planındadır", en: "Coating changes the size: the allowance is in the machining plan", de: "Die Beschichtung verändert das Maß: Die Zugabe steht im Bearbeitungsplan", ru: "Покрытие меняет размер: припуск заложен в план обработки" },
    subject: { tr: "İşlem öncesi ve sonrası boyut payı, maskeleme", en: "Size allowance before and after treatment, masking", de: "Maßzugabe vor und nach der Behandlung, Abdeckung", ru: "Припуск на размер до и после обработки, маскирование" },
    problem: {
      tr: "Anodik tabaka yüzeyden hem dışarı büyür hem malzemeye nüfuz eder. Dar toleranslı bir geçme yüzeyi, işlemeden doğru çıkıp kaplamadan sonra sığmayabilir.",
      en: "An anodic layer both grows outward from the surface and penetrates the material. A tight-tolerance fit surface can come out right from machining and no longer fit after coating.",
      de: "Eine Eloxalschicht wächst sowohl von der Oberfläche nach außen als auch in den Werkstoff hinein. Eine eng tolerierte Passfläche kann nach der Bearbeitung maßhaltig sein und nach der Beschichtung nicht mehr passen.",
      ru: "Анодный слой одновременно нарастает наружу от поверхности и проникает в материал. Посадочная поверхность с жёстким допуском может выйти в размер после механообработки и перестать сопрягаться после покрытия.",
    },
    process: {
      tr: "Tabaka tipi ve kalınlığı şartnameden okunur; kritik yüzeylerde işleme ölçüsü bu paya göre belirlenir. Diş, geçme ve elektriksel temas yüzeyleri gerekiyorsa maskelenir.",
      en: "The layer type and thickness are read from the specification; on critical surfaces the machined size is set for this allowance. Threads, fit surfaces and electrical contact surfaces are masked where needed.",
      de: "Schichtart und Schichtdicke werden der Spezifikation entnommen; an kritischen Flächen wird das Bearbeitungsmaß auf diese Zugabe ausgelegt. Gewinde, Passflächen und elektrische Kontaktflächen werden bei Bedarf abgedeckt.",
      ru: "Тип и толщина слоя берутся из спецификации; на критических поверхностях размер механообработки назначается с учётом этого припуска. Резьбы, посадочные поверхности и поверхности электрического контакта при необходимости маскируются.",
    },
    control: {
      tr: "Kritik koteler kaplama sonrasında ölçülür; maskelenen yüzeyler kontrol planında ayrıca işaretlenir.",
      en: "Critical dimensions are measured after coating; masked surfaces are marked separately in the control plan.",
      de: "Kritische Maße werden nach der Beschichtung gemessen; abgedeckte Flächen werden im Prüfplan gesondert gekennzeichnet.",
      ru: "Критические размеры измеряются после нанесения покрытия; маскируемые поверхности отдельно отмечаются в плане контроля.",
    },
  },
  "kalite-kontrol": {
    schema: "kalite",
    title: { tr: "Kontrol bir zincirdir; şablon ile kayıt ayrı şeylerdir", en: "Inspection is a chain; a template and a record are different things", de: "Prüfung ist eine Kette; Vorlage und Protokoll sind zweierlei", ru: "Контроль — это цепочка; шаблон и протокол — разные вещи" },
    subject: { tr: "Kontrol planından teslim kaydına", en: "From control plan to delivery record", de: "Vom Prüfplan zum Liefernachweis", ru: "От плана контроля до протокола поставки" },
    problem: {
      tr: "Bir ölçüm raporu, neyin neden ölçüldüğü önceden yazılmadıysa yalnızca sayılardan oluşur; seri boyunca neyin izlendiği belirsiz kalır.",
      en: "A measurement report is just numbers unless what was measured, and why, was written down beforehand; what is monitored through the series stays unclear.",
      de: "Ein Messprotokoll besteht nur aus Zahlen, wenn nicht vorab festgehalten wurde, was gemessen wird und warum; was über die Serie hinweg überwacht wird, bleibt unklar.",
      ru: "Протокол измерений — лишь набор чисел, если заранее не записано, что измеряется и зачем; что отслеживается на протяжении серии, остаётся неясным.",
    },
    process: {
      tr: "Kontrol planı imalattan önce yazılır, ilk parça tüm kritik koteleri doğrular, ara kontroller kayma eğilimli koteleri izler, teslim kaydı bunların toplamıdır.",
      en: "The control plan is written before manufacturing, the first part verifies every critical dimension, in-process checks monitor dimensions prone to drift, and the delivery record is the sum of these.",
      de: "Der Prüfplan wird vor der Fertigung erstellt, das Erstteil bestätigt alle kritischen Maße, Zwischenprüfungen überwachen driftanfällige Maße, und der Liefernachweis ist die Summe daraus.",
      ru: "План контроля составляется до начала производства, первая деталь подтверждает все критические размеры, промежуточный контроль отслеживает размеры, склонные к дрейфу, а протокол поставки — совокупность всего этого.",
    },
    control: {
      tr: "Bu sayfadaki zincir bir örnek şablondur; sizin işinizin kaydı teknik resminize göre kurulur ve teslim dosyasında yer alır. Akredite 3. taraf CMM ölçümü talebe bağlıdır.",
      en: "The chain on this page is an example template; the record for your job is built from your technical drawing and sits in the delivery file. Accredited 3rd-party CMM measurement is on request.",
      de: "Die Kette auf dieser Seite ist eine beispielhafte Vorlage; das Protokoll für Ihren Auftrag wird anhand Ihrer technischen Zeichnung erstellt und liegt der Lieferdokumentation bei. Eine akkreditierte KMG-Messung durch Dritte ist auf Anfrage möglich.",
      ru: "Цепочка на этой странице — пример шаблона; протокол по вашему заказу строится по вашему чертежу и входит в комплект документации на поставку. Измерение на КИМ аккредитованной третьей стороной — по запросу.",
    },
  },
  "tasarim-rehberi-dfm": {
    schema: "dfm",
    title: { tr: "Üç sorun, üç üretilebilirlik yaklaşımı", en: "Three problems, three manufacturability approaches", de: "Drei Probleme, drei Ansätze zur Fertigbarkeit", ru: "Три проблемы, три подхода к технологичности" },
    subject: { tr: "İç köşe, cep ve bağlama üzerinde üç sorun", en: "Three problems on corner, pocket and clamping", de: "Drei Probleme bei Innenecke, Tasche und Aufspannung", ru: "Три проблемы: угол, карман и установ" },
    problem: {
      tr: "Sivri iç köşe frezeyle işlenemez; derin ve dar bir cep uzun, sapan bir takım ister; bağlanacak yüzeyi olmayan bir parça ikinci operasyonda tutulamaz.",
      en: "A sharp internal corner cannot be milled; a deep, narrow pocket needs a long tool that deflects; a part with no surface to clamp cannot be held for the second operation.",
      de: "Eine scharfe Innenecke lässt sich nicht fräsen; eine tiefe, schmale Tasche erfordert ein langes Werkzeug, das abgedrängt wird; ein Teil ohne Spannfläche lässt sich für die zweite Operation nicht spannen.",
      ru: "Острый внутренний угол невозможно отфрезеровать; глубокий узкий карман требует длинного инструмента, который отжимается; деталь без поверхности под закрепление невозможно удержать на второй операции.",
    },
    process: {
      tr: "Köşeye takım yarıçapına uygun bir radyüs verilir, cep oranı kullanılabilir takıma göre ayarlanır, işlevi bozmayan bir bağlama payı veya yüzeyi eklenir. Her öneri işlevi koruyup korumadığıyla birlikte yazılır.",
      en: "The corner gets a radius that suits the tool radius, the pocket ratio is set for a usable tool, and a clamping allowance or surface that does not harm the function is added. Each suggestion is written down together with whether it keeps the function.",
      de: "Die Ecke erhält einen auf den Werkzeugradius abgestimmten Radius, das Taschenverhältnis wird auf ein einsetzbares Werkzeug ausgelegt, und eine Spannzugabe oder Spannfläche, die die Funktion nicht beeinträchtigt, wird ergänzt. Jeder Vorschlag wird zusammen mit der Angabe festgehalten, ob er die Funktion erhält.",
      ru: "Углу задаётся радиус под радиус инструмента, соотношение размеров кармана подбирается под применимый инструмент, добавляется припуск или поверхность под закрепление, не нарушающие функцию. Каждое предложение фиксируется с указанием, сохраняет ли оно функцию.",
    },
    control: {
      tr: "Öneriler teklifle birlikte yazılı iletilir; kararı tasarımcı verir. Revize model, kabul edilen önerilerle birlikte geri gönderilir.",
      en: "The suggestions are sent in writing with the quote; the designer decides. The revised model is returned with the accepted suggestions.",
      de: "Die Vorschläge werden schriftlich mit dem Angebot übermittelt; die Entscheidung trifft der Konstrukteur. Das überarbeitete Modell wird mit den angenommenen Vorschlägen zurückgesendet.",
      ru: "Предложения направляются в письменном виде вместе с КП; решение принимает конструктор. Доработанная модель возвращается с принятыми предложениями.",
    },
  },
};
