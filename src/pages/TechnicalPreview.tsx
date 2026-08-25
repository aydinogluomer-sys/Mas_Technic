import { JsonLdSchema } from "@/components/JsonLdSchema";
import { TechnicalLanding } from "@/components/technical-landing/TechnicalLanding";

export default function TechnicalPreview() {
  return <><JsonLdSchema type="organization" /><TechnicalLanding /></>;
}

