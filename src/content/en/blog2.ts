import type { BlogText } from "./types";

export const blog2: Record<string, BlogText> = {
  "cnc-torna-frezeleme-farki": {
    title: "CNC Turning vs Milling: Which to Choose?",
    excerpt: "The part's geometry answers the question: does the part rotate, or does the tool? That is the decision point, not the machine list.",
    readTime: "7 min read",
    category: "Technical",
    imageAlt: "A CNC milling spindle and cutting tool machining a prismatic metal block under coolant",
    imageCaption: "Prismatic geometry: the tool rotates, the part stays still",
    sections: [
      {
        heading: "A single distinction",
        paragraphs: [
          "The difference between the two basic methods of machining fits in one sentence: in turning the workpiece rotates and the tool stays still; in milling the tool rotates and the workpiece stays still or moves in a controlled way.",
          "This distinction is not a technical detail; it directly decides which geometry comes naturally to which method.",
        ],
      },
      {
        heading: "What turning does well",
        paragraphs: [
          "Everything rotationally symmetric: shafts, bushings, nuts, sleeves, flanges. Because the part rotates about its own axis, a cylindrical surface is formed by a single continuous cutting motion; this is both fast and leaves a smooth surface.",
          "The real strength of turning shows not in diameter tolerance but in CONCENTRICITY. Two diameters machined in the same clamping are referenced to each other; building the same relationship on a mill means two separate setups and an alignment error.",
        ],
      },
      {
        heading: "What milling does well",
        paragraphs: [
          "Flat faces, pockets, slots, hole patterns and free-form three-dimensional surfaces. Bodies, plates, brackets and tooling components belong to this class.",
          "The strength of milling is flexibility: different features can be machined with different tools in the same setup, and when rotary axes are added several faces of the part can be handled from a single datum system.",
        ],
      },
      {
        heading: "The selection test",
        paragraphs: [
          "The general rule is simple: if the part's main geometry is rotational, turning; if it is prismatic, milling. The decision is made by looking at which feature of the part has the tightest tolerance — whichever method produces that feature in one setup is the main method.",
          "Most real parts need both: a milled flat and hole pattern on a turned body. In that case the sequence matters; the surface the second operation will reference must have been machined in the first.",
        ],
      },
      {
        heading: "Combined machining",
        paragraphs: [
          "Mill-turn kinematics — driven tools, C and Y axes — combine the two operations in a single clamping. The gain is again the number of setups: rotational and prismatic features stay in the same datum system.",
          "We decide together from the technical drawing which method suits your part; the details are on the CNC Turning and CNC Milling service pages.",
        ],
      },
    ],
  },
  "kalite-kontrol-cmm-olcum": {
    title: "Quality Control: CMM Measurement Processes",
    excerpt: "A measurement is just a number unless it says which datum it was taken from. That is the job a CMM does.",
    readTime: "9 min read",
    category: "Quality",
    imageAlt: "A bridge-type CMM probing a cylindrical part on a granite table in a dark measuring room",
    imageCaption: "Verifying the characteristics defined in the control plan",
    sections: [
      {
        heading: "What a CMM measures",
        paragraphs: [
          "A coordinate measuring machine (CMM) collects points from a part's surface and rebuilds that surface's geometry in a coordinate system. It gives what a calliper or micrometer cannot: not only size, but FORM and POSITION.",
          "Geometric characteristics such as flatness, cylindricity, perpendicularity, position and runout cannot be expressed by a single measurement; they describe how a surface behaves relative to a datum and can only be verified by coordinate measurement.",
        ],
      },
      {
        heading: "Datum: where measurement starts",
        paragraphs: [
          "Measurement starts by setting up the part's coordinate system. The datum surfaces on the drawing are scanned with the probe and the part's own reference frame is built; every result after that is relative to this frame.",
          "That is why the same part can give two different results with two different datum set-ups — both of them correct. A measurement report stating which datum it was taken from matters as much as the report itself.",
        ],
      },
      {
        heading: "First-part inspection",
        paragraphs: [
          "In the first production of a new part all critical dimensions are verified. The aim is not only to approve that part but to show that the machining program and setup are correct; moving to series production before this is verified means multiplying the error.",
          "The format in which this inspection is documented is set by the customer specification. If your sector requires a particular form, it is enough to say so at the quote stage.",
        ],
      },
      {
        heading: "Monitoring in series production",
        paragraphs: [
          "In series production measuring every part in full is neither necessary nor economical. Instead, the control plan sets which dimension is measured how often, and the distribution of measurement results is monitored.",
          "What is monitored is not the conformity of a single part but where the distribution sits within the tolerance band. If the distribution drifts, action is taken even if no nonconforming part has come out yet — that is the difference between quality control and sorting.",
        ],
      },
      {
        heading: "How it works with us",
        paragraphs: [
          "A control plan is prepared for every job: which dimension is verified at which stage, by which method, and which record it leaves behind. This plan is written before manufacturing starts.",
          "Measurement records are added to the delivery file. Accredited 3rd-party CMM measurement is provided on request; if your sector requires a particular measurement scope, we define it together at the quote stage.",
        ],
      },
    ],
  },
  "endustriyel-yuzey-islemleri-rehberi": {
    title: "A Guide to Industrial Surface Treatments",
    excerpt: "Anodising, passivation, powder coating, electropolishing: what each does on which material, and what the specification needs to say.",
    readTime: "12 min read",
    category: "Guide",
    imageAlt: "Macro shot: the edges of blasted, brushed and polished metal surfaces side by side",
    imageCaption: "Four different surface finishes on the same alloy",
    sections: [
      {
        heading: "Surface treatment is not optional",
        paragraphs: [
          "Surface treatment is often thought to be about appearance. In practice three things decide it: corrosion, wear and electrical/thermal behaviour. None of these can be solved by machining.",
          "That is why surface treatment is a design decision and should be written on the drawing — which standard, which type, which class and which thickness. 'To be anodised' is not a specification.",
        ],
      },
      {
        heading: "Anodising — aluminium",
        paragraphs: [
          "Anodising grows an electrochemically controlled oxide layer on the aluminium surface. The layer is not a coating; it forms from the material itself, so it does not flake or peel.",
          "Under MIL-A-8625, Type II (sulphuric acid, typically 10-25 µm) is used for general protection and colouring, and Type III (hard anodising, typically 25-100 µm) for surfaces that need high wear resistance. Because the layer grows outward it changes dimensions: on tight-tolerance surfaces this allowance must be accounted for in the design.",
        ],
      },
      {
        heading: "Passivation — stainless steel",
        paragraphs: [
          "Passivation chemically removes free iron from the stainless steel surface and lets the surface's own chromium oxide layer re-form. The part's size does not change measurably after the process.",
          "The method and acceptance criteria are defined in ASTM A967; nitric acid and citric acid baths are different classes, and the specification should state which is required. After machining, passivation is a necessary step for most stainless parts because of iron residue picked up during machining.",
        ],
      },
      {
        heading: "Powder coating",
        paragraphs: [
          "Powder coating is applied electrostatically and cured in an oven. Its main strengths are that it contains no solvent and can give a thick film in a single coat; colours are chosen from the RAL catalogue.",
          "Durability is decided more by the pretreatment underneath than by the paint itself: on a surface without degreasing, phosphating or a conversion coating even the best paint will come away. If you expect a salt spray resistance time, state the target time and the relevant standard in the specification; this value depends on the paint–pretreatment–substrate combination and is not a property of the paint alone.",
        ],
      },
      {
        heading: "Electropolishing",
        paragraphs: [
          "Electropolishing dissolves a thin layer from the stainless steel surface in a controlled way. Because the peaks of the surface dissolve faster than the valleys, the result is a surface that is both smoother and chemically cleaner.",
          "The reason it is preferred in medical and food applications is not shine but cleanability: fewer micro-cracks and less machining residue make the surface easier to sterilise. The achievable Ra value depends on the starting surface — electropolishing does not rescue a poor machined surface, it improves a good one.",
        ],
      },
      {
        heading: "What to write in the specification",
        paragraphs: [
          "Four pieces of information are enough: standard, type/class, thickness range and surfaces not to be coated. The last item is the one most often missed; threads, fit surfaces and electrical contact points usually need masking.",
          "We offer or coordinate surface treatments. We can decide together at the quote stage, from the technical drawing, which treatment suits your part and its operating environment.",
        ],
      },
    ],
  },
};
