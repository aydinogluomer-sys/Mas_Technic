# MAS TECHNIC — Simplified Chinese translation rules and glossary (L5)

Audience: purchasing and engineering staff at industrial customers in mainland China
(Simplified Chinese, zh-CN). Register: formal, precise, technical B2B (书面语). Address the
reader with 您. No marketing superlatives the Turkish/English source does not contain. Never
add claims, numbers, certifications or promises.

## Hard rules (a checker enforces these)
1. Keep every `{{placeholder}}` exactly as in the source (same names, same count).
2. Never change a number. Decimals keep the point (`±0.01 mm`, `Ra 0.8`). Keep numbers as
   written in the source (do not convert 1.000.000 into 万/百万; `1.000.000` → `1,000,000`
   or keep as written). Do not add or drop numbers. Do not write numbers as Chinese words.
3. No Turkish letters may remain, except proper names: İzmir, Çiğli, Ataşehir, MAS TECHNIC,
   Mas Technic, the company's legal name.
4. Use full-width Chinese punctuation in Chinese sentences: ，。：；？！、（）「」 or “”.
   Keep half-width characters inside numbers, units, codes and Latin names (±0.01 mm, ISO 9001:2015).
   Leave one half-width space between Chinese and Latin/numbers only where the source layout
   needs it for codes; normal style: "公差 ±0.01 mm" (space before Latin units is fine).
5. ALL-CAPS Latin labels in the source become normal Chinese (Chinese has no case); keep them
   short. Short UI labels: 2–6 characters where possible.
6. Keep brand/product/standard names in Latin: MAS TECHNIC, NEXUS, ISO 9001:2015, ISO 14001,
   EN, DIN, ASTM, AISI, ASME, GD&T, STEP, IGES, STL, DXF, PDF, KVKK, Google, Gemini, CNC,
   alloy designations (6061-T6, 316L, Ti6Al4V, 42CrMo4, PEEK), brand names (Inconel, Delrin…).
7. Keep it concise; Chinese is shorter than English — do not pad.
8. Output Simplified Chinese only — no Traditional characters, no comments, no alternatives.

## Glossary (TR → ZH; use these every time)
- teklif → 报价 · teklif iste / teklif talebi → 申请报价 / 报价请求 (short UI label «申请报价»)
- teknik resim → 工程图纸（图纸） · 3B model → 3D 模型 · 2B → 2D
- tolerans → 公差 · ölçü zinciri → 尺寸链 · datum / referans yüzey → 基准 / 基准面
- GD&T → 几何公差（GD&T）
- eş eksenlilik → 同轴度 · eş merkezlilik → 同心度 · diklik → 垂直度 · paralellik → 平行度
- düzlemsellik → 平面度 · silindiriklik → 圆柱度 · salgı → 跳动 · yüzey pürüzlülüğü → 表面粗糙度（Ra）
- ölçüm / ölçüm raporu / ölçüm kaydı → 测量 / 测量报告 / 测量记录
- CMM → 三坐标测量机（CMM）; short label: 三坐标 · 3. taraf (akredite) → 经认可的第三方
- kontrol planı → 检验计划 · ilk parça → 首件（首件检验） · FAI → 首件检验（FAI）
- kalite kontrol → 质量控制 · kalite dosyası → 质量文件 · izlenebilirlik → 可追溯性
- malzeme sertifikası → 材质证书（3.1） · seri üretim → 批量生产 · küçük seri → 小批量生产
- prototip → 原型 / 样件 · prototipten seriye → 从样件到批量
- talaşlı imalat → 机械加工 · CNC frezeleme → CNC 铣削 · CNC tornalama → CNC 车削 · 5 eksen → 五轴加工
- bağlama (clamping / part set-up) → 装夹 · kurulum (machine set-up) → 调机 / 换型
- fikstür / aparat → 夹具 / 工装 · kalıp → 模具 · enjeksiyon kalıbı → 注塑模具 · basınçlı döküm → 压铸
- silikon kalıplama → 硅胶复模 · kaynaklı imalat → 焊接件制造 · mekanik montaj → 机械装配
- tavlama / ısıl işlem → 退火 / 热处理 · anodizasyon → 阳极氧化 · kaplama → 涂层 / 镀层
- lazer kazıma → 激光雕刻 · markalama / tanımlama → 标识 / 识别
- tedarik zinciri → 供应链 · proje yönetimi → 项目管理 · DFM → 可制造性设计（DFM）
- malzeme → 材料 · alüminyum → 铝合金 / 铝 · paslanmaz çelik → 不锈钢 · çelik → 钢 · karbon çelik → 碳钢
  · titanyum → 钛 / 钛合金 · pirinç / bronz → 黄铜 / 青铜 · bakır → 铜 · nikel → 镍 · magnezyum → 镁
  · termoplastikler → 热塑性塑料 · kompozitler → 复合材料 · yüksek performans plastikler → 高性能塑料
- sektörler: havacılık ve uzay → 航空航天 · medikal → 医疗 · savunma sanayi → 国防工业 · otomotiv → 汽车
  · petrol ve gaz → 石油天然气 · robotik → 机器人 · hidrolik & pnömatik → 液压与气动 · yenilenebilir enerji → 可再生能源
- kabiliyet → 能力 · kabiliyet profilleri → 能力档案 · hizmetler → 服务 · endüstriyel → 行业（menu family） · kategori → 类别
- müşteri portalı → 客户门户 · giriş → 登录 · kayıt → 注册
- pafta (sheet counter "PAFTA 02/14") → 图幅
- SSS → 常见问题 · hakkımızda → 关于我们 · iletişim → 联系我们
- KVKK Aydınlatma Metni → 个人数据保护告知书（KVKK） · gizlilik politikası → 隐私政策 · çerez politikası → Cookie 政策
- "Belirtilmedi" → 未注明 · "Seçilmedi" → 未选择 · "Veri doğrulanmadı" → 数据未经验证
- temsili (illustrative, not real data) → 示意（keep the "not real" meaning explicit）

## Additions from the dictionary (L5a)
- Digits stay digits: 5 轴 (not 五轴) where the source has a digit; written-out counts stay words (三次装夹); months are digits (2026 年 8 月)
- 第三方 (no digit) for "3. taraf"; 报价请求 for teklif talebi, 申请报价 as the short button
- kayıt: 记录 (record) · 目录 (browsable register: 材料目录, 问题目录, 合金目录) · 注册 (sign-up)
- kurulum / bağlama counting part set-ups → 装夹 (3 次装夹); machine set-up → 调机
- kote → 尺寸 · kontrol → 检验 (检验计划, 过程检验, 最终检验) · teslim dosyası → 交付文件 · termin → 交期
- aile → 系列 · Bölüm → 章节 · Başlık (FAQ filter) → 主题 · Ön Üretim → 试产 · Makine Parkuru → 设备清单
- Material names: grade first (6061-T6 铝合金, 1018 钢, C954 铝青铜); brands in Latin (Inconel, Hastelloy, Delrin, Garolite, Kevlar, Teflon)
- Title block: ÇİZEN → 制图 · ÇİZİM NO → 图号 · ADET → 数量 · PAFTA → 图幅
- Formal "your company" → 贵司; sample person name → 张伟
- Plurals: Chinese has one form; `_one` and `_other` carry the same text ({{count}} 个问题)
