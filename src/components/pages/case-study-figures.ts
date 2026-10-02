import projectDefense from "@/assets/industry-defense.webp";
import projectMedical from "@/assets/industry-medical.webp";
import projectTurning from "@/assets/hero-cnc-tornalama.webp";
import type { CaseStudy, CaseStudyImageKey } from "@/content/caseStudies";

/* ══════════════════════════════════════════════════════════════════════════
   CAPABILITY-PROFILE FIGURES — the shared reading of `caseStudies.ts`

   `caseStudies.ts` stores an image KEY rather than an import, so the content
   module stays free of asset bindings and the same entry can be rendered by
   the landing band and by the two routes without any of them agreeing on a
   bundler path. The landing (`ProcessNexusProjects.tsx`) holds its own copy of
   this map; that file is the landing's and is not touched here, so this is the
   second reader of the same keys rather than a duplicate of a single one.

   IF A KEY IS EVER ADDED TO `CaseStudyImageKey` and not to this record, the
   `Record<CaseStudyImageKey, string>` annotation fails `npm run typecheck` —
   which is the reason it is annotated rather than inferred.
   ══════════════════════════════════════════════════════════════════════════ */

export const caseStudyImages: Record<CaseStudyImageKey, string> = {
  defense: projectDefense,
  medical: projectMedical,
  turning: projectTurning,
};

/**
 * The metadata run for a profile, in one place so the index row and the
 * detail hero cannot disagree about what a profile's headline facts are.
 *
 * `tolerance` and `inspection` come from `@/content/claims` through the
 * content module, never from a literal here.
 */
export function profileMeta(study: CaseStudy) {
  return [
    { label: "Malzeme", value: study.material },
    { label: "Tolerans", value: study.tolerance },
    { label: "Kontrol", value: study.inspection },
  ];
}

/**
 * The short facts a register row carries.
 *
 * `surfaceFinish` is `null` for every entry today — no surface-finish figure
 * is verified — and a null is simply absent rather than printed as "—",
 * because an em dash in a measurement slot reads as "measured, and the answer
 * was nothing".
 */
export function profileRowMeta(study: CaseStudy): string[] {
  return [study.material, study.tolerance, ...(study.surfaceFinish ? [study.surfaceFinish] : [])];
}
