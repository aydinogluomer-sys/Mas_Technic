/* ══════════════════════════════════════════════════════════════════════════
   QUALITY DOCUMENTS (UX03)

   The four permitted PDFs (`USER_INPUTS.md` §H, all PUBLIC_OK; titles, paths
   and printed sizes in `claims.ts` QUALITY_RESOURCES). What this file adds is
   what is actually printed ON each document, read from the PDF itself:
   document number, the date and revision line as the document states it, and
   its language. Nothing here is inferred — where a document states no
   revision, the field says so instead of inventing one.

   Each thumbnail in `src/assets/belgeler/` is the document's real first page,
   rendered from the same file. Before rendering, every page was checked for
   private data (e-mail, phone, URL, signature or approval block, embedded
   image): none. `e2e/p5-proof-nexus-quality.spec.ts` keeps the manifest, the
   files on disk and the ledger in step (PDF magic, measured size, one
   thumbnail per document).
   ══════════════════════════════════════════════════════════════════════════ */
import kalitePolitikasi from "@/assets/belgeler/kalite-politikasi.webp";
import olcumEkipmanlari from "@/assets/belgeler/olcum-ekipmanlari.webp";
import paketlemeKilavuzu from "@/assets/belgeler/paketleme-kilavuzu.webp";
import tedarikciKurallari from "@/assets/belgeler/tedarikci-davranis-kurallari.webp";
import { QUALITY_RESOURCES } from "./claims";

export type QualityDocument = {
  /** Same title as the ledger entry it describes. */
  title: string;
  href: string;
  /** Printed size from the ledger (re-measured by the claims gate). */
  size: string;
  thumb: string;
  thumbWidth: number;
  thumbHeight: number;
  /** Language of the document itself — not of the page showing it. */
  language: "TR";
  /** As printed on the document. */
  docNo: string;
  /** Date line as printed on the document. */
  date: string;
  /** Revision / status line as printed; `null` when the document states none. */
  revision: string | null;
};

type Printed = Omit<QualityDocument, "title" | "href" | "size">;

/* Keyed by the ledger href so a renamed file fails loudly. */
const PRINTED: Record<string, Printed> = {
  "/belgeler/kalite-politikasi.pdf": {
    thumb: kalitePolitikasi, thumbWidth: 560, thumbHeight: 792, language: "TR",
    docNo: "MT-QAP-2026/01", date: "30.08.2026", revision: "Rev 02",
  },
  "/belgeler/olcum-ekipmanlari.pdf": {
    thumb: olcumEkipmanlari, thumbWidth: 560, thumbHeight: 725, language: "TR",
    docNo: "MT-EQP-2026/01", date: "Ağustos 2026", revision: "01",
  },
  "/belgeler/paketleme-kilavuzu.pdf": {
    thumb: paketlemeKilavuzu, thumbWidth: 560, thumbHeight: 725, language: "TR",
    docNo: "MT-PKG-2026/01", date: "Ağustos 2026", revision: null,
  },
  "/belgeler/tedarikci-davranis-kurallari.pdf": {
    thumb: tedarikciKurallari, thumbWidth: 560, thumbHeight: 725, language: "TR",
    docNo: "MT-SCC-2026/01", date: "Ağustos 2026", revision: null,
  },
};

export const QUALITY_DOCUMENTS: readonly QualityDocument[] = QUALITY_RESOURCES.map((resource) => {
  const printed = PRINTED[resource.href];
  if (!printed) throw new Error(`quality-documents: no printed metadata for ${resource.href}`);
  return { title: resource.title, href: resource.href, size: resource.size, ...printed };
});
