import type { BlogText } from "./types";

export const blog1: Record<string, BlogText> = {
  "5-eksen-cnc-isleme-avantajlari": {
    title: "The Advantages of 5-Axis CNC Machining",
    excerpt: "The real gain of five axes is not speed but the number of setups: every new clamping is a new source of datum error.",
    readTime: "8 min read",
    category: "Technical",
    imageAlt: "A cutting tool in the spindle machining the inclined face of a bright metal body under coolant",
    imageCaption: "A cutting tool reaching several faces in a single setup",
    sections: [
      {
        heading: "What five axes means",
        paragraphs: [
          "Five-axis machining adds two rotary axes (A and B, or A and C) to the X, Y and Z linear axes. The gain is that the tool can approach the part from any angle, not only from above.",
          "In practice this corresponds to two different ways of working: 3+2 machining, where the rotary axes position and then lock, and continuous five-axis, where all five axes move at once. Complex surfaces need the latter; for most multi-faced prismatic parts the former is enough.",
        ],
      },
      {
        heading: "The real gain: the number of setups",
        paragraphs: [
          "Clamping a part a second time is not just lost time. Every new setup means a new datum surface, a new zeroing and therefore a new source of error; the relationship between a dimension machined in the first setup and one machined in the second is only as good as the alignment of the two setups.",
          "In a five-axis setup the part is clamped once and every accessible face is machined from the same datum system. Being able to hold geometric tolerances — concentricity, perpendicularity, position — within a single setup is the one big measurable difference of five axes.",
        ],
      },
      {
        heading: "Tool angle and surface",
        paragraphs: [
          "When its axis is perpendicular to the surface, a ball-nose tool runs at zero cutting speed at its centre: there the material is not cut but smeared. The rotary axes tilt the tool to move this dead point off the surface, so that cutting takes place at the effective diameter.",
          "The result is a smoother surface at the same feed rate and less need for secondary operations. The achievable surface roughness depends on material, tool, holding and the tolerance required; that is why the target Ra value should be stated on the drawing and confirmed together at the quote stage.",
        ],
      },
      {
        heading: "Tool life and vibration",
        paragraphs: [
          "Being able to control the tool angle also means being able to control the direction of the cutting force. Keeping the force closer to the tool axis reduces deflection; less deflection means less vibration, and less vibration means less impact loading on the cutting edge.",
          "Five axes also make it possible to reach deep areas with a short tool. Tilting the part and machining the same pocket with a short tool instead of a long one directly reduces tool deflection — because deflection grows with the cube of tool overhang.",
        ],
      },
      {
        heading: "When it is not needed",
        paragraphs: [
          "Five axes are not the right answer for every part. On a flat part that can be reached from one direction, five axes bring no extra accuracy; what they bring is longer programming time and a more expensive setup.",
          "The test is this: are the part's critical geometric tolerances defined between different faces? If yes, holding those tolerances in a single setup pays for five axes. If not, three axes are usually more economical and just as accurate.",
        ],
      },
    ],
  },
  "havacilik-parcalarinda-malzeme-secimi": {
    title: "Material Selection for Aerospace Parts",
    excerpt: "The choice between aluminium 7075-T6 and Ti-6Al-4V is not a strength comparison but a decision about operating temperature and cost.",
    readTime: "6 min read",
    category: "Material",
    imageAlt: "Four cylindrical metal samples side by side on a black background; their end faces cut, ground and brushed",
    imageCaption: "Samples of the same geometry machined in two alloys",
    sections: [
      {
        heading: "Two candidates",
        paragraphs: [
          "For aerospace structural parts the decision is often between two materials: aluminium 7075-T6 and titanium Ti-6Al-4V (Grade 5). Both are established, both are readily available and both have a supply chain that can be documented.",
          "The choice does not end with comparing strength-to-weight ratios, because the two materials fail at different limits: one at temperature, the other at cost.",
        ],
      },
      {
        heading: "Aluminium 7075-T6",
        paragraphs: [
          "With a tensile strength of about 572 MPa and a density of 2.81 g/cm³, 7075-T6 is at the top end of aluminium alloys. It behaves well in chip removal: it allows high cutting speeds, carries heat away with the chips and does not strain tool life.",
          "Its limits are temperature and corrosion. The T6 temper loses its properties at high temperature and the alloy is susceptible to stress corrosion cracking; that is why surface treatment (typically anodising) is not an option but part of the design.",
        ],
      },
      {
        heading: "Ti-6Al-4V (Grade 5)",
        paragraphs: [
          "With a tensile strength of about 950 MPa and a density of 4.43 g/cm³, Ti-6Al-4V offers strength close to steel at a markedly lower density. It keeps its properties up to about 350 °C and resists corrosion without an extra coating thanks to its natural oxide layer.",
          "The price is machinability. Titanium conducts heat poorly: most of the heat released in the cutting zone leaves through the cutting edge, not with the chip. Add its chemical reactivity, and cutting speeds have to come down, with tool geometry and coolant strategy chosen accordingly.",
        ],
      },
      {
        heading: "Side by side",
        paragraphs: [
          "The values below are published typical values from the material standards; they do not replace a batch certificate. The values used for a job are read from that batch's material certificate.",
        ],
        table: {
          caption: "7075-T6 and Ti-6Al-4V — published typical values",
          note: "Source: typical value ranges from the material standards. The material certificate governs batch values.",
          headers: ["PROPERTY", "AL 7075-T6", "TI-6AL-4V"],
          rows: [
            ["Tensile strength", "~572 MPa", "~950 MPa"],
            ["Density", "2.81 g/cm³", "4.43 g/cm³"],
            ["Operating temperature", "Limited", "Up to ~350 °C"],
            ["Corrosion resistance", "Depends on surface treatment", "Natural oxide layer"],
            ["Material removal rate", "High", "Low"],
          ],
        },
      },
      {
        heading: "Where the cost difference comes from",
        paragraphs: [
          "Two cost items should be considered separately. On the raw material side titanium is markedly more expensive and its price fluctuates with market conditions; we give the current difference at the quote stage with the supplier's price, because a fixed multiplier would be wrong a year later.",
          "On the machining side the difference is machine time: lower cutting speed, more frequent tool changes and a more conservative depth of cut mean the same geometry takes longer in titanium than in aluminium. That is why simplifying the design pays off more in titanium than in aluminium.",
        ],
      },
      {
        heading: "The deciding test",
        paragraphs: [
          "Until the part's operating temperature, corrosive environment and fatigue load are known, material selection is not a choice but a guess. Once these three are known the decision often makes itself: titanium if temperature or corrosion decides, 7075-T6 if weight and cost decide.",
          "If you are torn between the two, send your drawing; a separate price study can be done for the same geometry in both materials. Our standard tolerance range is ±0.01 mm in both materials.",
        ],
      },
    ],
  },
  "dfm-tasarimdan-uretime-gecis": {
    title: "DFM: From Design to Production",
    excerpt: "A manufacturability review is not about changing the design: it is about asking why each dimension really has the value it has.",
    readTime: "10 min read",
    category: "Engineering",
    imageAlt: "A machined metal body with holes and flanges resting on its own dimensioned technical drawing",
    imageCaption: "Model and technical drawing side by side in the manufacturability review",
    sections: [
      {
        heading: "What DFM is and is not",
        paragraphs: [
          "Design for Manufacturing (DFM) means making the design compatible with the production method. It is not simplifying the design; it is removing costs the function does not require while keeping the part's function.",
          "The review always starts with the same question: why does this dimension have this value? A dimension with an answer stays untouched. A dimension whose answer is 'it came from the CAD template' is often the most expensive one.",
        ],
      },
      {
        heading: "Tolerance",
        paragraphs: [
          "Tolerance is the single item that drives cost up fastest, because a tight tolerance means not only machining more slowly but also measuring more. Our standard tolerance range is ±0.01mm; it is applied where a dimension really needs it.",
          "If, on the other hand, ±0.05 mm is enough on a surface with no function in the assembly, writing ±0.01 mm on that dimension gains nothing. In practice the most productive DFM output is to mark a small part of the drawing's dimensions as critical and leave the rest to the general tolerance class.",
        ],
      },
      {
        heading: "Internal corner radius",
        paragraphs: [
          "In milling an internal corner always has a radius, and that radius cannot be smaller than half the tool diameter. A design that asks for a zero corner needs either a second method such as EDM or a design solution such as a corner relief.",
          "General rule: give the largest internal corner radius possible. A large radius lets you work with a larger-diameter, stiffer tool; a stiff tool deflects less, so the surface is smoother and dimensional consistency improves.",
        ],
      },
      {
        heading: "Wall thickness and clamping",
        paragraphs: [
          "With thin-walled parts the real difficulty is not cutting but clamping: cutting force and heat move the part during machining, and the size comes out right on the machine but not at inspection. As a general starting point, walls under 0.5 mm in aluminium and 1 mm in steel need special clamping and a stepped cutting strategy.",
          "These figures are not a limit but a warning threshold. The wall's height, length and support conditions matter at least as much as its thickness; that is why for a thin-walled part the cutting sequence and clamping plan should be discussed together with the design.",
        ],
      },
      {
        heading: "How the review is run",
        paragraphs: [
          "With us the manufacturability review is part of the quote stage, not a revision that comes later. When the 3D model and the dimensioned technical drawing arrive, the dimension, tolerance and surface requirements are reviewed against the chosen manufacturing method.",
          "The output is not a report but a list of questions: the points that markedly affect cost, and a suggested alternative for each, are sent in writing with the quote. The designer makes the decision; we only say what each decision costs.",
        ],
      },
    ],
  },
};
