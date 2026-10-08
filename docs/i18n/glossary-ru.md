# MAS TECHNIC — Russian translation rules and glossary (L4)

Audience: purchasing and engineering staff at industrial customers in Russian-speaking
markets. Register: formal, precise, technical B2B. Address the reader with «Вы» (capital В
in direct address is not required; use «вы» in running text, «Вы» only in forms/letters).
No marketing superlatives the Turkish/English source does not contain. Never add claims,
numbers, certifications or promises.

## Hard rules (a checker enforces these)
1. Keep every `{{placeholder}}` exactly as in the source (same names, same count).
2. Never change a number. Decimals use the comma in running text and labels:
   `±0.01 mm` → `±0,01 мм`, `Ra 0.8` → `Ra 0,8`. Integers stay as written; thousands may be
   grouped with a space only where the source groups them (`1.000.000` → `1 000 000`).
   Do not add or drop numbers. Material numbers like 1.4301 keep their dot (not decimals).
3. No Turkish letters may remain, except proper names: İzmir, Çiğli, Ataşehir, MAS TECHNIC,
   Mas Technic, the company's legal name.
4. Keep case style: ALL-CAPS source stays ALL CAPS in Russian. Headings: sentence case
   (only the first word and proper names capitalised).
5. Keep symbols and separators: `·`, `—`, `→`, `×`, `±`, `Ø`. Units in Russian: мм, мкм, °C,
   МПа, г/см³, Вт/м·К, ч (hours), дн. Use «…» quotation marks.
6. Keep brand/product/standard names unchanged: MAS TECHNIC, NEXUS, ISO 9001:2015, ISO 14001,
   EN, DIN, ASTM, AISI, ASME, GD&T, CAD/CAM file formats (STEP, IGES, STL, DXF, PDF, X_T…),
   KVKK, Google, Gemini. Alloy designations (6061-T6, 316L, Ti6Al4V, 42CrMo4, PEEK) unchanged.
7. Keep it as short as the source; UI labels must fit the same space (Russian runs ~15–25%
   longer than English: prefer compact forms, nouns over verb phrases, standard abbreviations).
8. Output Russian only — no comments, no alternatives, no English left over (except the fixed
   names above and standard technical abbreviations).

## Glossary (TR → RU; use these every time)
- teklif → коммерческое предложение (КП) · teklif iste / teklif talebi → запросить КП / запрос КП
  (short UI label: «Запросить КП»)
- teknik resim → чертёж · 3B model → 3D-модель · 2B → 2D
- tolerans → допуск · ölçü zinciri → размерная цепь · datum / referans yüzey → база / базовая поверхность
- GD&T → допуски формы и расположения (GD&T)
- eş eksenlilik → соосность · eş merkezlilik → концентричность · diklik → перпендикулярность
- paralellik → параллельность · düzlemsellik → плоскостность · silindiriklik → цилиндричность
- salgı → биение · yüzey pürüzlülüğü → шероховатость поверхности (Ra) · yüzey bitişi → качество поверхности
- ölçüm / ölçüm raporu / ölçüm kaydı → измерение / протокол измерений
- CMM → КИМ (координатно-измерительная машина); short label: КИМ · 3. taraf (akredite) → аккредитованной третьей стороной
- kontrol planı → план контроля · ilk parça → первая деталь (контроль первой детали)
  · ilk numune / FAI → контроль первого образца (FAI)
- kalite kontrol → контроль качества · kalite dosyası → документация по качеству
- malzeme sertifikası → сертификат на материал (3.1) · izlenebilirlik → прослеживаемость
- seri üretim → серийное производство · küçük seri / düşük hacimli üretim → мелкосерийное производство
- prototip → прототип · prototipten seriye → от прототипа к серии
- talaşlı imalat → механообработка · CNC frezeleme → фрезерная обработка с ЧПУ · CNC tornalama → токарная обработка с ЧПУ
- 5 eksen → 5-осевая обработка · tezgah / makine parkuru → станок / станочный парк
- bağlama (clamping, set-up) → установ (закрепление детали) · kurulum (machine set-up) → наладка
- fikstür / aparat → приспособление / оснастка · kalıp → пресс-форма / штамп (by context) · enjeksiyon kalıbı → литьевая пресс-форма
- basınçlı döküm → литьё под давлением · silikon kalıplama → литьё в силиконовые формы
- kaynaklı imalat → сварные конструкции · mekanik montaj → механическая сборка
- tavlama / ısıl işlem → отжиг / термообработка · anodizasyon → анодирование · kaplama → покрытие
- lazer kazıma → лазерная гравировка · markalama / tanımlama → маркировка / идентификация
- tedarik zinciri → цепочка поставок · proje yönetimi → управление проектами · DFM → DFM (технологичность конструкции)
- malzeme → материал · alüminyum → алюминий · paslanmaz çelik → нержавеющая сталь · çelik → сталь
  · karbon çelik → углеродистая сталь · titanyum → титан · pirinç / bronz → латунь / бронза
  · bakır → медь · nikel → никель · magnezyum → магний · termoplastikler → термопласты
  · kompozitler → композиты · yüksek performans plastikler → высокоэффективные пластики
- sektörler: havacılık ve uzay → авиационно-космическая отрасль · medikal → медицина
  · savunma sanayi → оборонная промышленность · otomotiv → автомобилестроение · petrol ve gaz → нефть и газ
  · robotik → робототехника · hidrolik & pnömatik → гидравлика и пневматика · yenilenebilir enerji → ВИЭ (возобновляемая энергетика)
- kabiliyet / kabiliyetler → возможности / компетенции · kabiliyet profilleri → профили компетенций
- hizmetler → услуги · endüstriyel → отрасли (menu family) · kategori → категория
- müşteri portalı → клиентский портал · giriş → вход · kayıt → регистрация
- pafta (engineering sheet, header "PAFTA 02/14") → ЛИСТ
- SSS → Частые вопросы · hakkımızda → О компании · iletişim → Контакты
- KVKK Aydınlatma Metni → Уведомление о защите персональных данных (KVKK) · gizlilik politikası → Политика конфиденциальности
  · çerez politikası → Политика использования файлов cookie
- "Belirtilmedi" → «Не указано» · "Seçilmedi" → «Не выбрано» · "Veri doğrulanmadı" → «Данные не подтверждены»
- temsili (illustrative, not real data) → условный / схематичный (keep the "not real" meaning explicit)

## Additions from the dictionary (L4a)
- bağlama / kurulum counting part set-ups ("3 kurulum", "tek kurulum") → установ («за один установ»); machine set-up → наладка
- kayıt: протокол (measurement / inspection record) · реестр (browsable lists: material register, question register) · запись (one entry)
- teslim dosyası → комплект документации на поставку · kote → размер · özellik (inspected feature) → параметр
- ara kontrol → промежуточный контроль · üretilebilirlik incelemesi → анализ технологичности · işleme programı → управляющая программа
- serbest bırakma → раскрепление · punta → центр · prob → щуп · kelepçe → прихват · problama noktaları → точки ощупывания · datum kurgusu → схема баз
- Çekme mukavemeti → предел прочности · +QT → закалка с отпуском · +N → нормализация · tavlanmış → отжиг · yaşlandırma → старение
- Title block: ÇİZEN → РАЗРАБ. · ÇİZİM NO → № ЧЕРТЕЖА · ADET → КОЛ-ВО · PLAKA → ЛИСТ
- Brand names stay in Latin script: Inconel, Hastelloy, Delrin, Torlon, Ultem, Vespel, Noryl, Garolite; plastics abbreviations in Latin (PEEK, PBT, PTFE…) except ПВХ
- City names in Cyrillic in ALL-CAPS headers (ИЗМИР); AI → ИИ; hesap → аккаунт
- Plurals: Russian needs _one / _few / _many / _other (1 раздел · 2 раздела · 5 разделов); where a key has no plural pair, write the count so it reads with any number («до N моделей», «N шт.»)
