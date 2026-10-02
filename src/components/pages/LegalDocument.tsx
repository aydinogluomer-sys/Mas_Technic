import type { ReactNode } from "react";
import { Link } from "@/i18n/LocaleLink";
import {
  PageShell,
  ShellAction,
  ShellBreadcrumb,
  ShellContents,
  ShellDocSection,
  ShellPageHero,
  ShellSurfaceBand,
} from "@/components/shell";
import { usePageMeta } from "@/hooks/use-page-meta";
import { legalLinks } from "@/components/navigation/ia";
import { SALES_EMAIL, SALES_EMAIL_HREF } from "@/content/claims";

/* ══════════════════════════════════════════════════════════════════════════
   THE LEGAL SHEET — one composition for `/kvkk`, `/gizlilik-politikasi` and
   `/cerez-politikasi`.

   WHAT THE THREE PAGES WERE
   -------------------------
   Twenty-four lines each: a teal `tracking-[0.4em]` eyebrow, an `<h1>`, a
   "Son güncelleme" line and four or five `<section>`s of
   `text-muted-foreground text-sm` inside `max-w-3xl mx-auto`. Phase 04 put
   them in `PageShell` and left the bodies alone; the bodies still resolved
   every colour from the shadcn light theme, so all three still visibly
   belonged to the old design language.

   WHY THEY ARE ONE COMPONENT AND NOT THREE PAGE SKINS
   ---------------------------------------------------
   `docs/lean/17-inner-page-composition.md` §2: if two pages need the same
   structure it becomes a shared thing. Three legal documents ARE the same
   structure — numbered clauses, an anchor index, a revision line, a route to
   the other two. Only the clauses differ, so only the clauses live in the
   pages.

   RESTRAINT IS THE BRIEF, AND HERE IS WHAT IT MEANS
   -------------------------------------------------
   No hero image, no plate, no evidence block, no RFQ band. A legal text
   interrupted by a call to action is a legal text nobody trusts. What it does
   get is the shell's own grammar — the sheet, the rail, the band index,
   hairlines, the mono register — and the document ground (`tone="paper"`),
   because paper is where this site puts documents.

   EVERY CLAUSE IS CITABLE
   -----------------------
   Each section carries an `id`, and the aside publishes the index of those
   ids. That is not decoration: a legal clause that cannot be linked to cannot
   be quoted in an e-mail, and "madde 4" is how these documents are actually
   referred to. The aside is sticky above 1180px so the index stays with the
   reader through a long document, and static below it, where it has no room
   to travel (`.shell-doc-aside[data-sticky]`).
   ══════════════════════════════════════════════════════════════════════════ */

export type LegalClause = {
  /** The citation anchor. Stable — changing one breaks somebody's link. */
  id: string;
  title: string;
  body: ReactNode;
};

/**
 * The revision date these three documents carry.
 *
 * It replaces `Son güncelleme: 1 Ocak 2024`, a date that had not been true
 * since the texts were last edited and could not be checked from anything.
 * This constant is the date the clause texts below were actually revised, and
 * it lives in ONE place so the three documents cannot disagree about when they
 * were written.
 */
export const LEGAL_REVISION = "4 Eylül 2026";

export function LegalDocument({
  rail,
  eyebrow,
  title,
  lede,
  clauses,
  metaDescription,
  selfPath,
}: {
  rail: { no: string; label: string };
  eyebrow: string;
  title: string;
  lede: string;
  clauses: LegalClause[];
  metaDescription: string;
  /** This document's own route, so the sibling list can exclude it. */
  selfPath: string;
}) {
  usePageMeta({ title, description: metaDescription });

  const numbered = clauses.map((clause, index) => ({
    ...clause,
    no: String(index + 1).padStart(2, "0"),
  }));

  return (
    <PageShell surface="graphite" rail={rail}>
      <ShellPageHero
        no="01"
        label={rail.label}
        crumb={<ShellBreadcrumb trail={[{ label: "Ana sayfa", to: "/" }, { label: "Yasal" }, { label: title }]} />}
        eyebrow={eyebrow}
        title={title}
        lede={lede}
        meta={[
          { label: "Belge", value: title },
          { label: "Revizyon", value: LEGAL_REVISION },
          { label: "Madde sayısı", value: String(numbered.length) },
        ]}
      />

      <ShellSurfaceBand no="02" label="METİN" tone="paper" ariaLabel={`${title} — madde metni`}>
        <div className="shell-doc">
          <div className="shell-doc-main">
            {numbered.map((clause) => (
              <ShellDocSection key={clause.id} id={clause.id} no={clause.no} title={clause.title}>
                {clause.body}
              </ShellDocSection>
            ))}
          </div>

          <aside className="shell-doc-aside" data-sticky>
            <ShellContents
              label="MADDELER"
              ariaLabel={`${title} maddeleri`}
              items={numbered.map((clause) => ({ id: clause.id, no: clause.no, label: clause.title }))}
            />

            {/* The other two documents, derived from the IA rather than from a
                hand-written list, so a renamed legal route cannot survive in
                one of the three and vanish from the other two.

                `<Link>` here and `<a>` inside `ShellContents`, and the
                difference is not an oversight: these are ROUTE changes, which
                must stay client-side, while a contents entry is a fragment on
                the page already open. */}
            <nav className="shell-contents" aria-label="Diğer yasal metinler">
              <p className="shell-eyebrow">DİĞER METİNLER</p>
              <ol>
                {legalLinks
                  .filter((link) => link.path !== selfPath)
                  .map((link, index) => (
                    <li key={link.path}>
                      <Link to={link.path}>
                        <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
              </ol>
            </nav>

            <p className="shell-note">
              Bu metinle ilgili sorularınızı ve KVKK başvurularınızı {SALES_EMAIL} adresine
              iletebilirsiniz.
            </p>
            <ShellAction href={SALES_EMAIL_HREF} variant="quiet">{SALES_EMAIL}</ShellAction>
          </aside>
        </div>
      </ShellSurfaceBand>
    </PageShell>
  );
}
