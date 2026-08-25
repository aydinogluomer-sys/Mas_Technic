import { useEffect } from "react";

interface PageMetaOptions {
  title: string;
  description?: string;
}

/**
 * Sets document title and meta description for the current page.
 * Appends " | Mas Technic" to the title automatically.
 */
const usePageMeta = ({ title, description }: PageMetaOptions) => {
  useEffect(() => {
    const fullTitle = `${title} | Mas Technic`;
    document.title = fullTitle;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", description);
      } else {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        meta.setAttribute("content", description);
        document.head.appendChild(meta);
      }
    }

    // Update OG title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", fullTitle);

    return () => {
      document.title = "Mas Technic | Yüksek Hassasiyetli CNC Üretim & Talaşlı İmalat";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", "");
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", "Mas Technic");
    };
  }, [title, description]);
};

export { usePageMeta };
