import type { CategoryText } from "@/content/en/types";

export const categories: Record<string, CategoryText> = {
  "hizmetler/talasli-imalat": {
    title: "机械加工",
    description: "通过 CNC 铣削、CNC 车削和精密微加工实现高公差要求的生产。",
    links: [
      { label: "CNC 铣削", description: "采用 3、4、5 轴 CNC 铣削，在 ±0.01 mm 标准公差范围内生产。" },
      { label: "CNC 车削", description: "在多轴车削中心上加工轴、螺母及复杂回转零件。" },
      { label: "精密微加工", description: "使用小直径刀具进行微铣削和微车削。" },
      { label: "深孔钻削与铰孔", description: "通过深孔钻削和铰孔获得精确的孔几何形状。" },
    ],
  },
  "hizmetler/on-uretim": {
    title: "试产",
    description: "通过模具、铸造和样件制造工艺，在产品开发阶段提供全面支持。",
    links: [
      { label: "注塑模具", description: "塑料注塑模具的设计与制造。" },
      { label: "压铸", description: "铝合金和锌合金压铸件生产。" },
      { label: "硅胶复模", description: "柔性、耐用的硅胶零件生产。" },
      { label: "夹具与工装设计", description: "通过定制夹具与工装设计提高生产效率。" },
    ],
  },
  "hizmetler/yuzey-islemleri": {
    title: "表面处理",
    description: "通过阳极氧化、涂装、涂层和化学处理，为您的零件提供优异的表面质量。",
    links: [
      { label: "机械表面处理", description: "通过喷砂、振动光饰、抛光和拉丝进行表面预处理。" },
      { label: "阳极氧化", description: "为铝零件提供耐腐蚀性和装饰性外观。" },
      { label: "化学处理", description: "钝化、磷化和化学涂层。" },
      { label: "涂装与防护涂层", description: "粉末喷涂、底漆及特种涂层解决方案。" },
    ],
  },
  "hizmetler/isaretleme-tanimlama": {
    title: "标识与识别",
    description: "通过激光雕刻、二维码和标识实现零件的可追溯性与识别。",
    links: [
      { label: "激光雕刻", description: "通过永久性激光标识进行零件识别。" },
      { label: "激光退火标识", description: "利用热致变色进行标识，不去除材料。" },
      { label: "二维码与 DataMatrix 码", description: "符合工业标准的 2D 码应用。" },
      { label: "Logo 与标识", description: "标识 Logo、序列号及定制图案。" },
    ],
  },
  "hizmetler/montaj-birlestirme": {
    title: "装配与连接",
    description: "通过嵌件安装、机械装配、配套和焊接件制造实现完整生产。",
    links: [
      { label: "螺纹嵌件安装", description: "超声波及热压嵌件安装。" },
      { label: "机械装配", description: "部件装配及整机装配。" },
      { label: "配套与包装", description: "配套件准备及定制包装解决方案。" },
      { label: "焊接件制造", description: "TIG、MIG/MAG 及电阻焊。" },
    ],
  },
  "kabiliyetler/uretim-altyapisi": {
    title: "生产设施",
    description: "先进的 CNC 机床、测量设备和丰富的材料库。",
    links: [
      { label: "设备清单", description: "配备 3、4、5 轴加工中心，具备 CNC 车削能力。" },
      { label: "材料库", description: "铝合金、钢、不锈钢、钛合金、铜合金及工程塑料。" },
    ],
  },
  "kabiliyetler/kalite-standartlar": {
    title: "质量与标准",
    description: "在 ISO 9001:2015 范围内规定的质量控制流程和测量记录。",
    links: [
      { label: "质量控制", description: "三坐标测量机（CMM）、光学测量及表面测量系统。" },
      { label: "公差与精度", description: "在 ±0.01 mm 标准公差范围内生产和检验。" },
    ],
  },
  "kabiliyetler/muhendislik-destegi": {
    title: "工程支持",
    description: "在可制造性设计（DFM）分析、设计优化和表面处理方面提供专业工程咨询。",
    links: [
      { label: "可制造性设计指南（DFM）", description: "可制造性分析与设计优化。" },
      { label: "表面处理", description: "从工程角度进行表面处理的选择与实施。" },
    ],
  },
  "kabiliyetler/prototipten-seri-uretime": {
    title: "从样件到批量",
    description: "从单件到数千件的柔性生产能力。",
    links: [
      { label: "小批量生产", description: "1-100 件的样件及小批量生产。" },
      { label: "批量生产", description: "以可重复的调机和检验计划进行批量生产。" },
    ],
  },
  "kabiliyetler/surec-operasyon": {
    title: "流程与运营",
    description: "通过项目管理、供应链和运营计划实现可预期的生产流程。",
    links: [
      { label: "项目管理", description: "端到端的项目协调与报告。" },
      { label: "供应链", description: "供应商选择、材料可追溯性及批次记录。" },
      { label: "运营效率", description: "精益生产与持续改进。" },
    ],
  },
  "endustriyel/yuksek-teknoloji": {
    title: "高科技",
    description: "面向航空航天、国防和机器人等关键行业的高精度生产。",
    links: [
      { label: "航空航天", description: "面向航空航天应用的精密零件生产。" },
      { label: "国防工业", description: "依据技术规范、可追溯的精密生产。" },
      { label: "机器人", description: "机器人部件及自动化零件。" },
    ],
  },
  "endustriyel/seri-uretim-endustriyel": {
    title: "批量生产",
    description: "面向汽车、医疗和船舶行业的大批量生产。",
    links: [
      { label: "汽车", description: "面向汽车应用的可重复零件生产。" },
      { label: "医疗", description: "医疗器械及植入物零件的精密加工。" },
      { label: "帆船与游艇系统", description: "面向船舶行业的耐腐蚀零件。" },
    ],
  },
  "endustriyel/endustriyel-sistemler": {
    title: "工业系统",
    description: "面向液压、气动、管件和气候技术的工业零件生产。",
    links: [
      { label: "液压与气动", description: "耐高压的液压与气动元件。" },
      { label: "管道与管件", description: "法兰、管接头及定制连接件。" },
      { label: "气候技术", description: "HVAC 及制冷系统部件。" },
    ],
  },
  "endustriyel/uretim-cozumleri": {
    title: "生产解决方案",
    description: "从样件到批量、从小批次到大订单的柔性生产。",
    links: [
      { label: "样件制造", description: "通过快速原型制作进行产品验证。" },
      { label: "小批量生产", description: "10-100 件的小批量生产。" },
      { label: "批量生产", description: "依据检验计划、可重复的批量生产。" },
      { label: "特殊项目", description: "针对客户需求的工程解决方案。" },
    ],
  },
  "endustriyel/enerji-altyapi": {
    title: "能源与基础设施",
    description: "面向可再生能源、石油天然气和配电系统的工业生产。",
    links: [
      { label: "可再生能源", description: "风力发电机及太阳能电池板部件。" },
      { label: "石油天然气", description: "耐高压、耐高温的零件。" },
      { label: "配电系统", description: "输电与配电设备。" },
      { label: "采矿设备", description: "耐磨的采矿零件。" },
    ],
  },
};
