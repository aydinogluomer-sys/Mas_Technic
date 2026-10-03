import type { ServiceText } from "../types";

const REF = "General reference values; they do not represent company capacity. The value that applies to your part is stated in the quote.";

export const part3: Record<string, ServiceText> = {
  "lazer-kazima": {
    categoryLabel: "Marking & Identification",
    title: "Laser Engraving",
    metaTitle: "Laser Engraving & Marking | Fibre Laser | QR Code | Mas Technic",
    metaDescription: "Permanent fibre-laser marking on metal, plastic and wood: barcodes, QR codes, serial numbers, logos. Character size and depth are set by the material.",
    description: "High-contrast, wear-resistant fibre-laser marking on metals, plastics and composites: barcodes, QR codes and serial numbers.",
    content: [
      "We mark serial numbers, barcodes, QR codes and logos with a fibre laser. The marking area, minimum character size and engraving depth are set by the material, the surface and the code's readability requirement.",
      "Marking is possible on different materials such as steel, aluminium, plastics and wood; dynamic marking is used on round parts.",
      "We offer marking of serial numbers and batch codes, barcodes and QR codes, logos and brands, technical specifications and standards, and date and production codes.",
    ],
    features: [
      "Engraving Depth Control — Set to suit the material",
      "Multiple Materials — Steel, aluminium, plastics, wood",
      "Dynamic Marking — For round parts",
    ],
    technicalSpecs: [
      { label: "Method", value: "Fibre-laser marking" },
      { label: "Working range", value: "Stated in the quote" },
    ],
    processSteps: ["Design & Programming", "Material Analysis", "Parameter Setting", "Laser Marking", "Read Verification"],
    advantages: ["Multi-material support", "Dynamic (round-part) marking"],
    comparisonTables: [
      {
        title: "Laser Marking Technologies Compared",
        description: "A general comparison of laser types; not a company equipment list or capacity.",
        headers: ["Laser Type", "Wavelength", "Power Range", "Suitable Material", "Speed", "Application"],
        rows: [
          ["Fibre Laser", "1064nm", "20-100W", "Metal, plastic", "10.000 mm/s", "General purpose, series production"],
          ["CO₂ Laser", "10.600nm", "10-60W", "Wood, plastic, leather", "5.000 mm/s", "Organic materials, packaging"],
          ["UV Laser", "355nm", "3-15W", "Plastic, glass, silicone", "3.000 mm/s", "Fine, heat-sensitive"],
          ["Green Laser", "532nm", "5-20W", "Copper, gold, PCB", "5.000 mm/s", "Reflective metals"],
          ["MOPA Fibre", "1064nm", "20-60W", "Metal (colour)", "8.000 mm/s", "Colour marking, stainless"],
        ],
      },
      {
        title: "Laser Marking Parameters by Material",
        description: "A general reference for starting parameters; the parameters are set by trials on the part and surface.",
        headers: ["Material", "Recommended Laser", "Power", "Speed", "Contrast", "Notes"],
        rows: [
          ["Stainless Steel", "Fibre / MOPA", "20-50W", "500-2000 mm/s", "High", "Black oxide or white annealing"],
          ["Aluminium", "Fibre", "30-60W", "800-3000 mm/s", "Medium-high", "Excellent on anodised surfaces"],
          ["Titanium", "Fibre / MOPA", "20-40W", "300-1500 mm/s", "High", "Colour annealing possible"],
          ["ABS Plastic", "Fibre / UV", "5-20W", "1000-5000 mm/s", "Medium", "By colour change"],
          ["Glass", "UV / CO₂", "3-10W", "200-800 mm/s", "Medium", "Micro-crack technique"],
          ["Hardened Steel", "Fibre", "30-80W", "300-1000 mm/s", "Very high", "Deep engraving possible"],
        ],
      },
    ],
  },
  tavlama: {
    categoryLabel: "Marking & Identification",
    title: "Laser Annealing Marking",
    metaTitle: "Laser Annealing Marking | Mas Technic",
    metaDescription: "Readable marking by thermal colour change on stainless steel and titanium parts, without removing material from the surface. The scope is stated in the quote according to the part and material.",
    description: "Laser annealing is a laser marking method that marks by thermal colour change without removing material from the surface; it is used especially on stainless steel and titanium parts.",
    content: [
      "In laser annealing marking the laser does not engrave the surface; it heats it locally, and the thin oxide layer that forms makes the mark visible as a dark or coloured tone. Because no material is removed, the surface integrity is preserved.",
      "The method is preferred especially for marking serial numbers, batch codes, logos and readable codes on stainless steel and titanium parts. The resulting tone varies with the material and the surface condition.",
      "The working range is stated in the quote after the part geometry and the process plan have been reviewed.",
    ],
    features: [
      "Marking without material removal — The surface is not engraved; a thermal colour change forms",
      "Stainless steel and titanium — The method's typical application",
      "Traceability marks — Serial number, batch code, logo and readable code",
    ],
    technicalSpecs: [
      { label: "Method", value: "Thermal colour change by laser" },
      { label: "Surface effect", value: "No material removed" },
      { label: "Typical material", value: "Stainless steel, titanium" },
      { label: "Working range", value: "Stated in the quote" },
    ],
    processSteps: ["Material & Surface Check", "Mark Content & Position Approval", "Parameter Trial", "Laser Annealing Marking", "Readability Check"],
    advantages: ["Surface integrity is preserved", "Readable mark without engraving", "Applicable to stainless steel and titanium"],
  },
  "qr-datamatrix-kodlari": {
    categoryLabel: "Marking & Identification",
    title: "QR & DataMatrix Codes",
    description: "DataMatrix and QR code marking. Permanent part traceability with high data capacity in a small area.",
    content: [
      "We offer permanent code marking for industrial traceability in DataMatrix, QR Code and GS1-128 barcode formats. Code size and data capacity are set by the data content, the module size and the readability requirement.",
      "With UID (Unique Identifier), GS1-128 barcode, HIBC (Health Industry Bar Code) and DoD IUID (Item Unique Identification) coding options we provide solutions for part tracking, quality control and inventory management. The readability of marked codes is checked by read verification before delivery.",
    ],
    features: [
      "DataMatrix — High data density in a small area",
      "QR Code — Fast reading, wide compatibility",
      "GS1-128 Barcode — Standard barcode",
      "IUID Coding — Defence-industry traceability",
    ],
    technicalSpecs: [
      { label: "Symbology", value: "DataMatrix (ISO/IEC 16022)" },
      { label: "Verification", value: "ISO 15415" },
    ],
    processSteps: ["Code Type Selection", "Data Entry & Format", "Laser Marking", "Read Verification", "Read Quality Report"],
    advantages: ["High data capacity in a small area", "Read verification after laser marking", "Defence-industry IUID support"],
    comparisonTables: [
      {
        title: "Industrial Code Types Compared",
        description: "Data capacity is for the largest symbol the standard allows; the actual code size is set by the data content and the module size.",
        headers: ["Code Type", "Data Capacity", "Application"],
        rows: [
          ["DataMatrix (ECC200)", "2.335 alphanumeric", "Small parts, aerospace"],
          ["QR Code", "4.296 alphanumeric", "General, mobile reading"],
          ["GS1-128 Barcode", "48 characters", "Logistics, stock management"],
          ["Micro QR", "35 alphanumeric", "Very small parts"],
          ["PDF417", "1.850 alphanumeric", "Documents, certificates"],
          ["UID / IUID", "Variable", "Defence, military"],
        ],
      },
    ],
  },
  "logo-markalama": {
    categoryLabel: "Marking & Identification",
    title: "Logo & Branding",
    description: "Give your products a brand identity with laser marking, pad printing and screen printing. A permanent, professional finish.",
    content: [
      "We offer 4 branding methods: laser marking (permanent, high contrast, metals and plastics), pad printing (curved surfaces, multi-colour), screen printing (large surfaces, high volume) and labels (temporary, replaceable).",
      "In logo and brand marking, the position and size follow the mark detail on the drawing; the marking area and resolution are set by the material.",
    ],
    features: [
      "Laser — Permanent, high contrast, metal/plastic",
      "Pad Printing — Curved surfaces, multi-colour",
      "Screen Printing — Large surfaces, high volume",
      "Label — Temporary, replaceable",
    ],
    technicalSpecs: [
      { label: "Working range", value: "Stated in the quote" },
      { label: "Control", value: "Series after sample approval" },
    ],
    processSteps: ["Design Review", "Method Selection", "Sample Run", "Series Marking", "Quality Inspection"],
    advantages: [
      "4 branding methods",
      "Resolution and mark detail to suit the material",
      "Pad printing on curved surfaces",
      "Repeatable series marking after sample approval",
    ],
    comparisonTables: [
      {
        title: "Branding Methods Compared",
        description: REF,
        headers: ["Method", "Durability", "Colour", "Surface Type", "Cost/Part"],
        rows: [
          ["Laser Marking", "Permanent", "Single tone", "Flat/curved", "$$"],
          ["Pad Printing", "Good", "Multi-colour", "Ideal for curved", "$"],
          ["Screen Printing", "Good", "Multi-colour", "Flat surface", "$"],
          ["Label (Vinyl)", "Medium", "Full colour", "Flat", "$"],
        ],
      },
    ],
  },
  "insert-uygulama": {
    categoryLabel: "Assembly & Joining",
    title: "Insert Installation",
    description: "Installation of metal inserts into plastic and metal parts by ultrasonic, heat or press methods. Nut, rivet and pin installation.",
    content: [
      "We offer 4 insert installation methods: ultrasonic inserts (for plastics, fast and clean), heat-set inserts (high pull-out resistance), press-in / self-tapping inserts (economical) and moulded-in inserts (highest strength).",
      "We create joints with brass (nickel-plated, general purpose), steel (zinc-plated, high strength) and stainless (uncoated, corrosion resistance) inserts. Thread size, pull-out strength and cycle time are set by the insert type, the part material and the installation method.",
    ],
    features: [
      "Ultrasonic Insert — For plastics, fast and clean",
      "Heat-Set Insert — High pull-out resistance",
      "Press-In Insert (Self-tapping) — Economical",
      "Moulded-In Insert — Highest strength",
    ],
    technicalSpecs: [
      { label: "Method", value: "Ultrasonic / Heat / Press" },
      { label: "Pull-out strength", value: "To insert type" },
    ],
    processSteps: ["Insert Type Selection", "Hole Preparation", "Insert Placement", "Pull-out Test", "Quality Inspection"],
    advantages: [
      "4 insert installation methods",
      "3 insert material options",
      "Insert joints verified by pull-out testing",
      "Cycle time to insert type and method",
    ],
    comparisonTables: [
      {
        title: "Insert Installation Methods Compared",
        description: REF,
        headers: ["Method", "Suitable Material", "Cost", "Advantage"],
        rows: [
          ["Ultrasonic", "Thermoplastics", "$$", "Fast, clean, repeatable"],
          ["Heat Staking", "Thermoplastics", "$$", "High pull-out resistance"],
          ["Press-in (Self-tapping)", "Plastics, light metals", "$", "Economical, fast"],
          ["Moulded-in", "Injection-moulded plastics", "$$$", "Highest strength"],
          ["Adhesive", "All materials", "$", "Flexible, low stress"],
        ],
      },
    ],
  },
  "mekanik-montaj": {
    categoryLabel: "Assembly & Joining",
    title: "Mechanical Assembly",
    description: "Screw, nut, rivet and clip assembly. Torque-controlled tightening and automatic feed systems for high efficiency.",
    content: [
      "We offer screw and nut assembly (torque-controlled), riveting, clip and circlip assembly (automatic feed), bearing assembly (with custom fixtures) and O-ring/seal assembly (oil- and dust-protected).",
      "Torque values are set by the size and grade of the fastener and by the specification, and are applied by torque-controlled tightening. Every assembly passes a function test and is recorded in a serial-number-based tracking system.",
    ],
    features: [
      "Screw & Nut Assembly — Torque-controlled",
      "Riveting — Permanent joints",
      "Clip & Circlip Assembly — Automatic feed",
      "Bearing & O-ring Assembly — With custom fixtures",
    ],
    technicalSpecs: [
      { label: "Torque Control", value: "Per specification" },
      { label: "Test", value: "Function test" },
      { label: "Tracking", value: "By serial number" },
    ],
    processSteps: ["Assembly Plan", "Component Check", "Torque-Controlled Assembly", "Function Test", "Packaging & Labelling"],
    advantages: [
      "Torque-controlled tightening",
      "High efficiency with automatic feed",
      "Verification with a digital torque meter",
      "Serial-number traceability",
    ],
    comparisonTables: [
      {
        title: "Fastener Torque Values (Dry, Grade 8.8)",
        description: "General reference values (dry, grade 8.8); the torque to apply is set by the specification and the joint design.",
        headers: ["Screw Size", "Torque (Nm)", "Preload (kN)", "Spanner Size", "Control Method"],
        rows: [
          ["M3", "1.5-2.0", "2.5", "5.5mm", "Digital torque meter"],
          ["M4", "3.0-4.0", "4.5", "7mm", "Digital torque meter"],
          ["M5", "6.0-8.0", "8.0", "8mm", "Torque wrench"],
          ["M6", "10.0-12.0", "12.0", "10mm", "Torque wrench"],
          ["M8", "25.0-30.0", "22.0", "13mm", "Torque wrench"],
          ["M10", "50.0-60.0", "35.0", "17mm", "Electronic torque tool"],
          ["M12", "85.0-100.0", "50.0", "19mm", "Electronic torque tool"],
        ],
      },
    ],
  },
};
