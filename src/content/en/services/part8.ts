import type { ServiceText } from "../types";

export const part8: Record<string, ServiceText> = {
  "seri-uretim": {
    categoryLabel: "Production Solutions",
    title: "Series Production",
    metaTitle: "Series Production | Repeatable Setup and Batch Control | Mas Technic",
    metaDescription: "Standard setup, in-process checks tied to the control plan and batch traceability in series production. The delivery schedule is set through capacity planning.",
    description: "In series production the real issue is not speed but repeatability: standard setup, in-process checks tied to the control plan and batch-level traceability.",
    content: [
      "In series production it is the repeatability of the setup, not the speed of the machine, that decides the outcome. Fixed datum surfaces, a standard setup procedure and automatic tool changing make the same part come out the same between batches.",
      "In every batch the characteristics defined in the control plan are measured and the results recorded. Dimensions sensitive to tool wear are monitored with a separate in-process check; when a drift trend appears the process is corrected, not the part.",
      "Batch size and delivery schedule are agreed together with capacity planning; periodic delivery and blanket order options are assessed at the quote stage.",
    ],
    features: [
      "Standard Setup — fixed datum and repeatable clamping",
      "Automatic Tool Changing — uninterrupted machining on long batches",
      "First-Part Approval — series does not start without approval",
      "Batch Record — heat and batch traceability",
      "In-Process Check — dimensions prone to drift are monitored",
      "Scheduled Delivery — batch size and frequency set with capacity",
    ],
    technicalSpecs: [
      { label: "Setup", value: "Standard procedure" },
      { label: "Approval", value: "First-part approval" },
      { label: "Inspection", value: "Per control plan" },
      { label: "In-Process Check", value: "Dimensions prone to drift" },
      { label: "Delivery", value: "Per schedule" },
      { label: "Traceability", value: "Batch and heat record" },
    ],
    advantages: [
      "Repeatable clamping with fixed datum surfaces",
      "Consistency between batches through a standard setup procedure",
      "Measurement results are recorded batch by batch",
      "Dimensions prone to drift are monitored by in-process checks",
      "The delivery schedule is tied to the capacity plan",
      "Batch status is kept on record throughout production",
    ],
    faq: [
      {
        question: "Is there a minimum quantity for series production?",
        answer: "We do not apply a fixed minimum quantity. Batch size, delivery schedule and pricing are settled with the quote once capacity planning has been done.",
      },
      {
        question: "How is the delivery schedule set?",
        answer: "After capacity planning, batch size and delivery frequency are agreed together; weekly or periodic delivery schedules can be arranged.",
      },
    ],
  },
  "ozel-projeler": {
    categoryLabel: "Production Solutions",
    title: "Custom Engineering Projects",
    metaTitle: "Custom Engineering Projects | Turnkey | R&D | Reverse Engineering | Mas Technic",
    metaDescription: "Non-standard custom engineering projects. Turnkey solutions, reverse engineering, R&D prototyping and full process management from concept to production.",
    description: "Turnkey solutions for custom engineering projects where standard solutions fall short. Reverse engineering, R&D and the full process from concept to production.",
    content: [
      "In custom engineering projects where standard solutions fall short we carry out reverse engineering (3D scanning → CAD → production), R&D prototyping (concept validation → functional testing) and the design and manufacture of custom jigs and fixtures. In projects that include electronics or software, the mechanical scope is defined separately.",
      "Project management — every process from concept to production under one roof: feasibility analysis, solid model design, prototype production, testing and validation, pilot production and the move to series production. Each project is managed by a dedicated project engineer.",
      "Product development advice is part of the process. How technical data will be shared and how intellectual property will be handled is agreed in writing at the start of the project.",
    ],
    features: [
      "Turnkey — Full solution from concept to production",
      "Reverse Engineering — 3D scanning, CAD modelling, production",
      "R&D Prototyping — Concept validation and functional testing",
      "Custom Machine Design — Fixture and jig manufacture",
      "Mechanical Scope — Design and manufacture",
      "Intellectual Property — conditions are set in writing at the start of the project",
    ],
    technicalSpecs: [
      { label: "Process", value: "From concept to production" },
      { label: "3D Scanning", value: "By part size" },
      { label: "Design", value: "Solid model and drawing" },
      { label: "Conditions", value: "In writing at project start" },
      { label: "Project Management", value: "Dedicated project engineer" },
    ],
    advantages: [
      "Turnkey solution from concept to series production",
      "Spare part production through reverse engineering",
      "R&D prototyping and functional testing support",
      "Technical data and intellectual property conditions are settled at the start",
      "A single contact through a dedicated project engineer",
    ],
    faq: [
      {
        question: "Can you do reverse engineering?",
        answer: "Yes, we digitise your existing part by 3D scanning, convert it into a CAD model and produce it; scanning accuracy is set by the part size and surface.",
      },
      {
        question: "How is my technical data handled?",
        answer: "How technical data will be shared and how intellectual property will be handled is agreed in writing at the start of the project. State your needs at the quote stage.",
      },
    ],
  },
  "yenilenebilir-enerji": {
    categoryLabel: "Energy & Infrastructure",
    title: "Renewable Energy",
    metaTitle: "Renewable Energy Part Manufacturing | Wind & Solar | Mas Technic",
    metaDescription: "Wind turbine and solar energy system components. Hot-dip galvanised corrosion protection, heavy-duty parts. Production of hubs, pitch systems and mounting brackets.",
    description: "Components for wind turbines, solar energy and energy storage systems, produced with materials and coatings selected for outdoor conditions.",
    content: [
      "We produce wind turbine components (hub, nacelle, pitch system, yaw system, tower flange), solar panel mounting systems (tracker, fixed mount, rail, clamp) and energy storage parts (battery housing, cooling components).",
      "Materials and coatings are selected for outdoor conditions. Corrosion protection is provided by hot-dip galvanising (ISO 1461), Dacromet coating and SS 316L material; coating thickness and expected life are set by the environment class and specification. We produce heavy-duty components in GGG-40 and GGG-50 ductile iron and high-strength steels.",
    ],
    features: [
      "Wind Turbine — Hub, pitch, yaw, tower flange",
      "Solar Panel Mounting — Tracker, rail, clamp",
      "Heavy-Duty Components — GGG-40/50 and high-strength steel",
      "Hot-Dip Galvanising — ISO 1461",
      "Outdoor Durability — Material and coating by environment class",
      "Energy Storage — Battery housing, cooling",
    ],
    technicalSpecs: [
      { label: "Material", value: "SS 316L, GGG-40, S355" },
      { label: "Corrosion Protection", value: "Hot-dip galvanising (ISO 1461)" },
      { label: "Durability", value: "Per specification" },
      { label: "Scope", value: "Wind, solar, storage" },
      { label: "NDT", value: "Per specification" },
    ],
    advantages: [
      "Material and coating selection for outdoor conditions",
      "Corrosion protection by hot-dip galvanising",
      "GGG-40/50 cast iron machining expertise",
      "NDT scope in the control plan per specification",
    ],
    faq: [
      {
        question: "Can you produce wind turbine components?",
        answer: "Yes; we produce hubs, pitch systems, yaw mechanisms, tower flanges and nacelle internal components. The specification and acceptance criteria to apply are set with the customer for each job.",
      },
      {
        question: "How is outdoor durability determined?",
        answer: "Corrosion protection is provided by hot-dip galvanising (ISO 1461) and material selection suited to the environment; the expected outdoor life is defined in the specification according to the environment class and coating system.",
      },
    ],
  },
  "petrol-gaz": {
    categoryLabel: "Energy & Infrastructure",
    title: "Oil & Gas",
    metaTitle: "Oil & Gas Part Manufacturing | Mas Technic",
    metaDescription: "Oil and gas sector components; machining of Inconel, duplex and super duplex steel. Pressure and temperature class per customer specification.",
    description: "Critical parts for the oil and gas sector; pressure and temperature class per the project specification.",
    content: [
      "We produce high-strength parts suited to the harsh operating conditions of the oil and gas sector. We manufacture wellhead and Christmas tree components, choke and control valves, pipe fittings (API 6A flanges, hubs), manifolds and BOP (Blowout Preventer) components.",
      "In wellhead, pipeline valve and casing applications the working pressure and temperature range are project requirements defined in the customer specification; the part is produced to this requirement. In sour service applications, material, heat treatment and hardness limits are set by the customer specification and recorded.",
      "We work with corrosion- and high-temperature-resistant materials such as Inconel 625/718, Duplex 2205, Super Duplex 2507, F22 (2.25Cr-1Mo) and SS 316L. The scope of non-destructive testing (RT, UT, MPI, PMI) is defined in the control plan to the specification.",
    ],
    features: [
      "Wellhead & Pipeline — Flange, hub, valve body",
      "Pressure Class — Project requirement, per specification",
      "Sour Service — Material and heat treatment per specification",
      "Inconel & Duplex — Corrosion-resistant special alloys",
      "Non-Destructive Testing — RT, UT, MPI, PMI; scope written into the plan",
    ],
    technicalSpecs: [
      { label: "Scope", value: "Wellhead, pipeline, casing" },
      { label: "Pressure class", value: "Project requirement (spec.)" },
      { label: "Sour Service", value: "Per specification" },
      { label: "Material", value: "Inconel, Duplex, F22" },
      { label: "NDT", value: "RT, UT, MPI, PMI" },
    ],
    advantages: [
      "Capability to produce wellhead and pipeline components",
      "Material selection for sour service per specification",
      "Inconel and super duplex machining expertise",
      "The scope of non-destructive testing is defined in the control plan",
    ],
    faq: [
      {
        question: "Which quality records are provided for oil and gas components?",
        answer: "Material certificates, heat treatment records and non-destructive testing reports are added to the delivery file to the scope defined in the control plan.",
      },
      {
        question: "Can you produce sour service compatible parts?",
        answer: "Yes. In sour service applications, material, heat treatment and hardness limits are set by the customer specification and recorded.",
      },
    ],
  },
  "guc-dagitim-sistemleri": {
    categoryLabel: "Energy & Infrastructure",
    title: "Power Distribution Systems",
    metaTitle: "Power Distribution Part Manufacturing | Mas Technic",
    metaDescription: "Electrical distribution and power system components: copper and aluminium busbars, contact parts, insulator mounting elements. Conductivity is confirmed by the material certificate.",
    description: "Electrical distribution panels, transformer components and power distribution system parts.",
    content: [
      "We produce electrical distribution system components: copper and aluminium busbars, contact parts (silver plated, low contact resistance), insulator mounting elements and panel internals. The voltage class is a project requirement defined in the customer specification.",
      "We produce parts in high-conductivity materials such as OFE copper (C10100), ETP copper (C11000) and electrical-grade aluminium (1050/1070); the conductivity value is confirmed by the material certificate. Silver plating lowers contact resistance, and a nickel underlayer forms a diffusion barrier.",
      "Thermal load, short-circuit withstand and arc requirements are defined in the project specification; the part is produced to these requirements and the design approved by the customer.",
    ],
    features: [
      "Panel Internals — Insulator mounting and connection elements",
      "Voltage Class — Project requirement, per specification",
      "High Conductivity — OFE and ETP copper, confirmed by certificate",
      "Silver Plating — Low contact resistance",
      "Busbar Production — Copper and aluminium conductors",
      "Production to Specification — Thermal and electrical requirements",
    ],
    technicalSpecs: [
      { label: "Material", value: "Cu (OFE, ETP), Al 1050" },
      { label: "Conductivity", value: "By material certificate" },
      { label: "Voltage class", value: "Project requirement (spec.)" },
      { label: "Scope", value: "Busbar, contact, insulator mount" },
      { label: "Plating", value: "Ag (silver), Ni underlayer" },
      { label: "Test", value: "Per specification" },
    ],
    advantages: [
      "High-conductivity copper machining",
      "Low contact resistance through silver plating",
      "Production to the thermal and electrical requirements in the specification",
    ],
    faq: [
      {
        question: "Can you machine OFE copper?",
        answer: "Yes, OFE copper (C10100) and ETP copper (C11000) are machined; the conductivity value is confirmed by the material certificate.",
      },
      {
        question: "Do you do silver plating?",
        answer: "Yes, silver plating (over a nickel underlayer) is applied to contact parts. Plating thickness and adhesion checks are defined in the control plan per specification.",
      },
    ],
  },
  "madencilik-ekipmanlari": {
    categoryLabel: "Energy & Infrastructure",
    title: "Mining Equipment",
    metaTitle: "Mining Equipment Parts | Wear-Resistant Steel | Mas Technic",
    metaDescription: "Part production for mining machinery in wear-resistant materials such as Hardox and manganese steel. Hardness and heat treatment requirements per specification; working range stated in the quote.",
    description: "Wear-resistant components in Hardox and manganese steel, suited to the heavy operating conditions of the mining sector.",
    content: [
      "We produce wear- and impact-resistant parts suited to the heavy operating conditions of the mining sector. We manufacture crusher components (jaws, hammers, liner plates), conveyor parts (rollers, drums, plain bearings), drilling equipment components (bits, bodies, adaptors) and screening and classifying components.",
      "We produce in Hardox 400/500/600 (wear steel), manganese steel (Mn13 — work-hardening under impact), white cast iron (chromium carbide — extreme wear) and 42CrMo4 (QT — general heavy duty). Surface hardness and, where needed, heat treatment requirements are defined by the customer specification.",
      "For large, heavy mining parts, CNC and conventional machining are planned together. The working range is stated in the quote after the part geometry and process plan have been reviewed.",
    ],
    features: [
      "Crusher Component — Jaw, hammer, liner plate",
      "Conveyor Part — Roller, drum, plain bearing",
      "Hardox 400/500/600 — Wear steel expertise",
      "Hardness — Per specification",
      "Manganese Steel — Work-hardening Mn13",
    ],
    technicalSpecs: [
      { label: "Hardness", value: "Per specification" },
      { label: "Material", value: "Hardox, Mn13, 42CrMo4" },
      { label: "Working range", value: "Stated in the quote" },
      { label: "NDT", value: "Per specification" },
    ],
    advantages: [
      "Hardox 400/500/600 wear steel expertise",
      "Wear-resistant material selection",
      "Impact resistance with manganese steel",
      "Heat treatment (induction, case hardening) per specification",
      "NDT scope defined per specification",
    ],
    faq: [
      {
        question: "Can you machine Hardox?",
        answer: "Yes, we can CNC machine Hardox 400, 500 and 600 series wear steels. We achieve optimal results with special tooling and feed parameters.",
      },
      {
        question: "Can you machine large, heavy parts?",
        answer: "The working range is stated in the quote after the part geometry and process plan have been reviewed. Crane loading and special clamping arrangements are used for heavy parts.",
      },
    ],
  },
};
