/* ══════════════════════════════════════════════════════════════════════════
   MEASURED-EVIDENCE CONTRACT (PROOF01)

   The shape a REAL measurement has to arrive in before any page may print it.
   Every field is mandatory except the calibration context, and nothing here
   may be filled in to make a record complete: a record with a gap is not
   published, it is rejected (`publishMeasuredEvidence`).

   Today there is no record. `USER_INPUTS.md` §G says
   `CASE_STUDIES: NONE_PROVIDED_YET`, and the owner input that would supply one
   — a real demo coupon with drawing, revision, measurement output, permission
   and a technical reviewer — is O04 / PROOF02, still open. So:

     · `MEASURED_EVIDENCE_ENABLED` is `false`: the measured panel does not
       render at all, not even empty.
     · `MEASURED_EVIDENCE` is empty. Test fixtures live in `e2e/`, never here,
       so a production build cannot carry one.
     · Capability profiles cannot hold measurements by type
       (`caseStudies.ts`, `measuredResults?: never`).

   No verdict is stored. Whether a value is inside its limits is computed from
   the limits and the value themselves, so a typed "UYGUN" cannot disagree
   with the numbers under it.
   ══════════════════════════════════════════════════════════════════════════ */

export type MeasuredEvidence = {
  /** The physical sample measured, e.g. a coupon serial. Never a customer part number. */
  sampleId: string;
  /** Drawing number + revision the nominal and limits come from. */
  drawingRevision: string;
  /** Feature id as on the drawing (balloon number). */
  featureId: string;
  /** Human name of the feature. */
  feature: string;
  nominal: number;
  lowerLimit: number;
  upperLimit: number;
  /** One unit for nominal, limits and value. */
  unit: "mm" | "µm" | "°";
  /** The value read from the source document, unchanged. */
  measuredValue: number;
  /** How it was measured. */
  method: string;
  /** Which instrument: type and asset id / serial. */
  device: string;
  /** Calibration or accreditation context, when the method needs it. */
  calibrationContext?: string;
  /** ISO date (YYYY-MM-DD) of the measurement. */
  measurementDate: string;
  /** The document the value is copied from (report id, redacted). */
  sourceDocument: string;
  /** Where the publication permission is recorded. */
  permissionRef: string;
  /** The person who reviewed the record technically (role or name, with consent). */
  technicalReviewer: string;
  /** Set by the reviewer after matching the record to its source. */
  verified: boolean;
};

/** Off until a verified, permitted record exists (O04 / PROOF02). */
export const MEASURED_EVIDENCE_ENABLED = false;

/** Real, verified records only. Empty today; fixtures belong in `e2e/`. */
export const MEASURED_EVIDENCE: readonly MeasuredEvidence[] = [];

const REQUIRED_TEXT = [
  "sampleId", "drawingRevision", "featureId", "feature", "method", "device",
  "measurementDate", "sourceDocument", "permissionRef", "technicalReviewer",
] as const satisfies readonly (keyof MeasuredEvidence)[];

/** Why a record cannot be published; empty when it can. */
export function evidenceProblems(record: MeasuredEvidence): string[] {
  const problems: string[] = [];
  for (const key of REQUIRED_TEXT) {
    if (typeof record[key] !== "string" || !record[key].trim()) problems.push(`${key} missing`);
  }
  for (const key of ["nominal", "lowerLimit", "upperLimit", "measuredValue"] as const) {
    if (!Number.isFinite(record[key])) problems.push(`${key} not a number`);
  }
  if (record.lowerLimit > record.upperLimit) problems.push("limits reversed");
  if (record.nominal < record.lowerLimit || record.nominal > record.upperLimit) problems.push("nominal outside limits");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.measurementDate ?? "")) problems.push("measurementDate not YYYY-MM-DD");
  if (!record.verified) problems.push("not verified");
  return problems;
}

/**
 * The only door to a page. Returns the records that are complete, verified and
 * permitted — and nothing at all while the feature flag is off. It never fills
 * a gap; an incomplete record is dropped, not repaired.
 */
export function publishMeasuredEvidence(
  records: readonly MeasuredEvidence[],
  enabled: boolean = MEASURED_EVIDENCE_ENABLED,
): MeasuredEvidence[] {
  if (!enabled) return [];
  return records.filter((record) => evidenceProblems(record).length === 0);
}

/** Computed, never stored. */
export const withinLimits = (record: MeasuredEvidence) =>
  record.measuredValue >= record.lowerLimit && record.measuredValue <= record.upperLimit;
