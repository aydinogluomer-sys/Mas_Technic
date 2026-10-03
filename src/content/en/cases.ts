import type { CaseText } from "./types";

/* Capability profiles, keyed by slug (`src/content/caseStudies.ts`). */
export const cases: Record<string, CaseText> = {
  "ince-cidarli-govde": {
    title: "THIN-WALLED BODY",
    challenge: "With thin-walled bodies the real difficulty is not cutting but clamping: force and heat move the part during machining, and the size comes out right on the machine but not at inspection.",
    material: "Aluminium 6061-T6 / 7075-T6",
    process: ["DFM and clamping analysis", "5-axis milling", "In-process check", "Final inspection"],
    tolerance: "±0.01 mm",
    inspection: "Accredited 3rd-party CMM measurement, on request",
    leadTime: "Lead time is given with the quote, after material supply, the number of operations and the capacity plan have been reviewed.",
    outcome: "Cutting sequence and clamping are planned for the wall thickness; critical dimensions are checked again after release from the fixture.",
    controlPlan: [
      { feature: "Critical diameter", method: "Measurement per control plan", record: "Measurement record" },
      { feature: "Wall thickness", method: "In-process check", record: "Operation record" },
      { feature: "Flatness / form", method: "Accredited 3rd-party CMM (on request)", record: "Measurement report" },
    ],
    gallery: [{ alt: "A metal body with a machined bearing seat and mounting holes, on a measuring table" }],
    relatedCapability: { label: "5-AXIS CNC MILLING" },
    rfq: { label: "GET A QUOTE FOR THIS PART" },
  },
  "titanyum-baglanti-parcasi": {
    title: "TITANIUM FITTING",
    challenge: "Titanium carries heat into the cutter and shortens tool life. The problem is not machining one part but making the hundredth part the same as the first.",
    material: "Ti-6Al-4V (Grade 5)",
    process: ["Tool and cutting parameter selection", "5-axis milling", "Tool life monitoring", "Final inspection"],
    tolerance: "±0.01 mm",
    inspection: "Accredited 3rd-party CMM measurement, on request",
    leadTime: "Lead time is given with the quote, after material supply, the number of operations and the capacity plan have been reviewed.",
    outcome: "Cutting parameters and the tool change interval are put on record; variation within the batch is monitored by in-process checks.",
    controlPlan: [
      { feature: "Mounting holes", method: "Measurement per control plan", record: "Measurement record" },
      { feature: "Tool life", method: "In-process monitoring", record: "Process record" },
      { feature: "Material identity", method: "Batch / heat tracking", record: "Traceability record" },
    ],
    gallery: [{ alt: "An upright metal fitting with a polished surface, a machined inclined channel and holes" }],
    relatedCapability: { label: "TOLERANCE AND PRECISION" },
    rfq: { label: "GET A QUOTE FOR THIS PART" },
  },
  "hassas-mil": {
    title: "PRECISION SHAFT",
    challenge: "On long shafts diameter tolerance alone is not enough; concentricity and runout decide whether the part will work in the assembly.",
    material: "42CrMo4 / 1.7225",
    process: ["Turning", "Dimensional check after heat treatment", "Grinding allowance planning", "Final inspection"],
    tolerance: "±0.01 mm",
    inspection: "Accredited 3rd-party CMM measurement, on request",
    leadTime: "Lead time is given with the quote, after material supply, the number of operations and the capacity plan have been reviewed.",
    outcome: "Centre and holding references are kept throughout the operations; geometric characteristics are checked from the same datum.",
    controlPlan: [
      { feature: "Bearing diameters", method: "Measurement per control plan", record: "Measurement record" },
      { feature: "Runout / concentricity", method: "Checked from the datum", record: "Measurement record" },
      { feature: "Size after hardening", method: "In-process check", record: "Operation record" },
    ],
    gallery: [{ alt: "A metal shaft held in a lathe chuck being turned with a turret tool under coolant" }],
    relatedCapability: { label: "CNC TURNING" },
    rfq: { label: "GET A QUOTE FOR THIS PART" },
  },
};
