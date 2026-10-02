import type { CategoryText } from "./types";

/* Keyed `${prefix}/${slug}`, as in `src/data/categoryPages.ts`. */
export const categories: Record<string, CategoryText> = {
  "hizmetler/talasli-imalat": {
    title: "Machining",
    description: "High-tolerance production by CNC milling, turning and precision micro machining.",
    links: [
      { label: "CNC Milling", description: "Production in the ±0.01 mm standard tolerance range by 3, 4 and 5-axis CNC milling." },
      { label: "CNC Turning", description: "Shafts, nuts and complex rotating parts on multi-axis turning centres." },
      { label: "Precision Micro Machining", description: "Micro milling and turning with small-diameter tools." },
      { label: "Deep Hole & Reaming", description: "Precise hole geometries by deep-hole drilling and reaming." },
    ],
  },
  "hizmetler/on-uretim": {
    title: "Pre-Production",
    description: "Comprehensive support during product development through tooling, casting and prototype processes.",
    links: [
      { label: "Injection Moulding Tools", description: "Plastic injection mould design and manufacture." },
      { label: "Die Casting", description: "Die casting production in aluminium and zinc alloys." },
      { label: "Silicone Moulding", description: "Flexible, durable silicone part production." },
      { label: "Jig & Fixture Design", description: "Production efficiency through custom jig and fixture design." },
    ],
  },
  "hizmetler/yuzey-islemleri": {
    title: "Surface Treatments",
    description: "Superior surface quality for your parts through anodising, painting, coating and chemical processes.",
    links: [
      { label: "Mechanical Surface Treatments", description: "Surface preparation by blasting, vibratory finishing, polishing and brushing." },
      { label: "Anodising", description: "Corrosion resistance and a decorative appearance for aluminium parts." },
      { label: "Chemical Processes", description: "Passivation, phosphating and chemical coating." },
      { label: "Paint & Protective Coatings", description: "Powder coating, primer and special coating solutions." },
    ],
  },
  "hizmetler/isaretleme-tanimlama": {
    title: "Marking & Identification",
    description: "Part traceability and identification through laser engraving, QR codes and marking.",
    links: [
      { label: "Laser Engraving", description: "Part identification by permanent laser marking." },
      { label: "Laser Annealing Marking", description: "Marking by thermal colour change, without removing material." },
      { label: "QR & DataMatrix Codes", description: "2D code applications to industrial standards." },
      { label: "Logo & Branding", description: "Marking of logos, serial numbers and custom designs." },
    ],
  },
  "hizmetler/montaj-birlestirme": {
    title: "Assembly & Joining",
    description: "Complete production through insert installation, mechanical assembly, kitting and welded fabrication.",
    links: [
      { label: "Insert Installation", description: "Ultrasonic and heat-staked insert installation." },
      { label: "Mechanical Assembly", description: "Sub-assembly and complete product assembly." },
      { label: "Kitting & Packaging", description: "Kit preparation and custom packaging solutions." },
      { label: "Welded Fabrication", description: "TIG, MIG/MAG and resistance welding." },
    ],
  },
  "kabiliyetler/uretim-altyapisi": {
    title: "Production Infrastructure",
    description: "State-of-the-art CNC machines, measuring equipment and a broad material library.",
    links: [
      { label: "Machine Park", description: "CNC turning capability with 3, 4 and 5-axis machining centres." },
      { label: "Material Library", description: "Aluminium, steel, stainless, titanium, copper alloys and engineering plastics." },
    ],
  },
  "kabiliyetler/kalite-standartlar": {
    title: "Quality & Standards",
    description: "Defined quality control processes and measurement records within the scope of ISO 9001:2015.",
    links: [
      { label: "Quality Control", description: "CMM, optical and surface measurement systems." },
      { label: "Tolerance & Precision", description: "Production and inspection in the ±0.01 mm standard tolerance range." },
    ],
  },
  "kabiliyetler/muhendislik-destegi": {
    title: "Engineering Support",
    description: "Expert engineering advice on DFM analysis, design optimisation and surface treatments.",
    links: [
      { label: "Design Guide (DFM)", description: "Manufacturability analysis and design optimisation." },
      { label: "Surface Treatments", description: "Surface selection and application from an engineering perspective." },
    ],
  },
  "kabiliyetler/prototipten-seri-uretime": {
    title: "From Prototype to Series Production",
    description: "Flexible production capacity from a single part to thousands of pieces.",
    links: [
      { label: "Low-Volume Production", description: "Prototypes and small batches of 1-100 pieces." },
      { label: "Series Manufacturing", description: "Series manufacturing with a repeatable setup and a control plan." },
    ],
  },
  "kabiliyetler/surec-operasyon": {
    title: "Process & Operations",
    description: "A predictable production process through project management, supply chain and operations planning.",
    links: [
      { label: "Project Management", description: "End-to-end project coordination and reporting." },
      { label: "Supply Chain", description: "Supplier selection, material traceability and lot records." },
      { label: "Operational Efficiency", description: "Lean manufacturing and continuous improvement." },
    ],
  },
  "endustriyel/yuksek-teknoloji": {
    title: "High Technology",
    description: "High-precision production for critical sectors such as aerospace, defence and robotics.",
    links: [
      { label: "Aerospace", description: "Precision part production for aerospace applications." },
      { label: "Defence Industry", description: "Traceable precision production tied to the specification." },
      { label: "Robotics", description: "Robot components and automation parts." },
    ],
  },
  "endustriyel/seri-uretim-endustriyel": {
    title: "Series Production",
    description: "High-volume production for the automotive, medical and marine sectors.",
    links: [
      { label: "Automotive", description: "Repeatable part production for automotive applications." },
      { label: "Medical", description: "Precision machining of medical device and implant parts." },
      { label: "Sailing & Yacht Systems", description: "Corrosion-resistant parts for the marine sector." },
    ],
  },
  "endustriyel/endustriyel-sistemler": {
    title: "Industrial Systems",
    description: "Industrial part production for hydraulics, pneumatics, pipe fittings and climate technologies.",
    links: [
      { label: "Hydraulics & Pneumatics", description: "High-pressure hydraulic and pneumatic components." },
      { label: "Pipes & Fittings", description: "Flanges, nipples and custom fittings." },
      { label: "Climate Technologies", description: "Components for HVAC and refrigeration systems." },
    ],
  },
  "endustriyel/uretim-cozumleri": {
    title: "Production Solutions",
    description: "Flexible production from prototype to series, from small batches to large orders.",
    links: [
      { label: "Prototype Production", description: "Product validation through rapid prototyping." },
      { label: "Small Batch", description: "Small batch production of 10-100 pieces." },
      { label: "Series Production", description: "Repeatable series production tied to a control plan." },
      { label: "Custom Projects", description: "Customer-specific engineering solutions." },
    ],
  },
  "endustriyel/enerji-altyapi": {
    title: "Energy & Infrastructure",
    description: "Industrial production for renewable energy, oil and gas and power distribution systems.",
    links: [
      { label: "Renewable Energy", description: "Wind turbine and solar panel components." },
      { label: "Oil & Gas", description: "Parts resistant to high pressure and temperature." },
      { label: "Power Distribution Systems", description: "Power transmission and distribution equipment." },
      { label: "Mining Equipment", description: "Wear-resistant mining parts." },
    ],
  },
};
