import { JsonLdSchema } from "@/components/JsonLdSchema";
import { TechnicalLanding } from "@/components/technical-landing/TechnicalLanding";

export const Index = () => {
  return (
    <>
      <JsonLdSchema type="organization" />
      <TechnicalLanding />
    </>
  );
};
