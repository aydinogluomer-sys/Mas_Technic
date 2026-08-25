import { Header } from "@/components/Header";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { Footer } from "@/components/Footer";
import { LandingFlow } from "@/components/LandingFlow";
import { SectionDotNav } from "@/components/SectionDotNav";
import { LANDING_SECTIONS } from "@/config/landing-motion";

export default function LegacyLanding() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <JsonLdSchema type="organization" />
      <SectionDotNav sections={LANDING_SECTIONS} />
      <main id="main-content" data-testid="landing-version-root" data-landing-version="legacy">
        <LandingFlow />
      </main>
      <Footer />
    </div>
  );
}
