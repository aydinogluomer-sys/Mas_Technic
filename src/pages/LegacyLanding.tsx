import { PageShell } from "@/components/shell/PageShell";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { LandingFlow } from "@/components/LandingFlow";
import { SectionDotNav } from "@/components/SectionDotNav";
import { LANDING_SECTIONS } from "@/config/landing-motion";

/* Dev-only surface (`import.meta.env.DEV` in `src/App.tsx`), migrated onto the
   shell with everything else so it cannot become the last consumer of a shell
   that no longer exists. `layout="bands"` because `LandingFlow` composes its
   own full-bleed sections. */
export default function LegacyLanding() {
  return (
    <PageShell
      surface="graphite"
      layout="bands"
      mainData={{ "data-testid": "landing-version-root", "data-landing-version": "legacy" }}
    >
      {/* `LandingFlow` stays the FIRST child of `<main>`: the opt-in legacy
          specs address `main#main-content > .lf-root`. */}
      <LandingFlow />
      <JsonLdSchema type="organization" />
      <SectionDotNav sections={LANDING_SECTIONS} />
    </PageShell>
  );
}
