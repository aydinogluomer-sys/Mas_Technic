import { useEffect } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface ServiceSchemaProps {
  type: "service";
  name: string;
  description: string;
  category?: string;
  faq?: FAQItem[];
}

interface OrganizationSchemaProps {
  type: "organization";
}

interface FAQPageSchemaProps {
  type: "faqPage";
  faq: FAQItem[];
}

interface BlogSchemaProps {
  type: "blog";
  name: string;
  description: string;
}

interface ArticleSchemaProps {
  type: "article";
  name: string;
  description: string;
  datePublished?: string;
  category?: string;
  image?: string;
}

interface ContactSchemaProps {
  type: "contact";
}

interface AboutSchemaProps {
  type: "about";
}

interface ProductCatalogSchemaProps {
  type: "productCatalog";
  name: string;
  description: string;
}

type JsonLdSchemaProps =
  | ServiceSchemaProps
  | OrganizationSchemaProps
  | FAQPageSchemaProps
  | BlogSchemaProps
  | ArticleSchemaProps
  | ContactSchemaProps
  | AboutSchemaProps
  | ProductCatalogSchemaProps;

const ORGANIZATION = {
  "@type": "Organization" as const,
  name: "Mas Technic",
  url: typeof window !== "undefined" ? window.location.origin : "",
};

export const JsonLdSchema = (props: JsonLdSchemaProps) => {
  useEffect(() => {
    const existingScripts = document.querySelectorAll("script[data-jsonld]");
    existingScripts.forEach((s) => s.remove());

    const schemas: object[] = [];
    const origin = window.location.origin;

    if (props.type === "organization") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Mas Technic",
        url: origin,
        description:
          "CNC Freze, Torna ve Talaşlı İmalatta yüksek hassasiyet, proses kontrollü üretim ve zamanında teslimat.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "İzmir",
          addressCountry: "TR",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+90-536-564-51-94",
          contactType: "sales",
          availableLanguage: ["Turkish", "English"],
        },
        sameAs: [],
      });
    }

    if (props.type === "service") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Service",
        name: props.name,
        provider: ORGANIZATION,
        description: props.description,
        areaServed: { "@type": "Country", name: "Turkey" },
        serviceType: props.category || "Manufacturing",
      });
      if (props.faq && props.faq.length > 0) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: props.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        });
      }
    }

    if (props.type === "faqPage") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: props.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      });
    }

    if (props.type === "blog") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Blog",
        name: props.name,
        description: props.description,
        publisher: ORGANIZATION,
        url: `${origin}/blog`,
      });
    }

    if (props.type === "article") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: props.name,
        description: props.description,
        author: ORGANIZATION,
        publisher: ORGANIZATION,
        ...(props.datePublished && { datePublished: props.datePublished }),
        ...(props.category && { articleSection: props.category }),
        ...(props.image && { image: props.image }),
      });
    }

    if (props.type === "contact") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "İletişim — Mas Technic",
        description: "CNC işleme, teklif talebi ve mühendislik desteği için iletişime geçin.",
        url: `${origin}/iletisim`,
        mainEntity: {
          "@type": "Organization",
          name: "Mas Technic",
          telephone: "+90-536-564-51-94",
          address: {
            "@type": "PostalAddress",
            addressLocality: "İzmir",
            addressCountry: "TR",
          },
        },
      });
    }

    if (props.type === "about") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "Hakkımızda — Mas Technic",
        description:
          "Hassas CNC işleme, talaşlı imalat ve mühendislik çözümleri sunan Mas Technic hakkında bilgi.",
        url: `${origin}/hakkimizda`,
        mainEntity: ORGANIZATION,
      });
    }

    if (props.type === "productCatalog") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "OfferCatalog",
        name: props.name,
        description: props.description,
        url: `${origin}/malzemeler`,
        provider: ORGANIZATION,
      });
    }

    schemas.forEach((schema, i) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-jsonld", `schema-${i}`);
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      const scripts = document.querySelectorAll("script[data-jsonld]");
      scripts.forEach((s) => s.remove());
    };
  }, [props]);

  return null;
};
