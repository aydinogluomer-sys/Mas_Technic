import type { CSSProperties, ReactNode } from "react";
import { Link } from "@/i18n/LocaleLink";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ShellBand } from "./ShellBand";
import { ShellMetaRow } from "./ShellPrimitives";

/* ══════════════════════════════════════════════════════════════════════════
   PAGE-COMPOSITION PRIMITIVES  (Phase 07)

   `ShellPrimitives.tsx` gave Phase 04 the atoms — hero, meta row, title block,
   evidence, divider, surface band. They were enough to FRAME an inner page and
   not enough to BUILD one, so every commercial inner page still composed its
   body out of the same generic device: `grid sm:grid-cols-2` of
   `border border-border bg-card p-6 hover:-translate-y-1 hover:shadow-lg`.
   That one device carried the services listing, the sectors listing, the
   related-pages rail, the material grid, the advantages block, the features
   block, the contact cards and the four "Misyon / Yaklaşım / Süreç / Kalite"
   tiles — eight different jobs wearing one costume, and the costume was the
   generic-SaaS card `IMPLEMENTATION.md` §5.5 forbids.

   The molecules below replace it. Each one exists because at least two pages
   needed the same STRUCTURE, which is the rule the phase sets: if two pages
   need the same shape it becomes a primitive, not a page skin.

       ShellBreadcrumb   the trail                  · 4 pages
       ShellAction       every call to action       · 6 pages
       ShellIndexList    an index of routes         · 4 pages
       ShellSpecTable    a technical data table     · 3 pages
       ShellRun          a numbered process run     · 3 pages
       ShellTagRow       a run of short labels      · 3 pages
       ShellPlate        a framed image plate       · 1 page + reserved
       ShellNextStep     the RFQ continuation band  · 6 pages

   WHAT THEY ARE NOT
   -----------------
   No radius, no shadow, no gradient, no glow, no icon tile, no colour-coded
   pill. Structure is hairlines, master columns, mono metadata and measured
   space — the landing's own devices. `docs/lean/17-inner-page-composition.md`
   records the decisions, including why the six rebuilt pages need no radius
   exception at all.
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Breadcrumb ───────────────────────────────────────────────────────────
   A mono trail on one hairline, not a chevron-separated sentence in body
   type. The last entry is the current page and is not a link, which is what
   `aria-current="page"` states for a screen reader too. */
export type ShellCrumb = { label: string; to?: string };

export function ShellBreadcrumb({ trail }: { trail: ShellCrumb[] }) {
  return (
    <nav className="shell-crumb" aria-label="Sayfa yolu">
      <ol>
        {trail.map((crumb, i) => (
          <li key={`${crumb.label}-${i}`}>
            {crumb.to ? (
              <Link to={crumb.to}>{crumb.label}</Link>
            ) : (
              <span aria-current="page">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ── Action ───────────────────────────────────────────────────────────────
   One call-to-action shape for the whole public site. `primary` is a filled
   block on the opposite ground; `ghost` is a hairline box; `quiet` is a bare
   underlined run for tertiary links. All three are square, all three keep a
   44px minimum touch height, and none of them changes size on hover — a CTA
   that grows is a CTA that moves the text under the reader's finger. */
export type ShellActionProps = {
  to?: string;
  href?: string;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "quiet";
  onClick?: () => void;
  disabled?: boolean;
  full?: boolean;
  className?: string;
  children: ReactNode;
};

export function ShellAction({
  to,
  href,
  type = "button",
  variant = "ghost",
  onClick,
  disabled,
  full,
  className = "",
  children,
}: ShellActionProps) {
  const cls = `shell-action shell-action--${variant}${full ? " shell-action--full" : ""} ${className}`.trim();
  const body = (
    <>
      <span>{children}</span>
      <ArrowRight className="shell-action-mark" aria-hidden="true" />
    </>
  );

  if (to) return <Link className={cls} to={to}>{body}</Link>;
  if (href) return <a className={cls} href={href}>{body}</a>;
  return (
    <button className={cls} type={type} onClick={onClick} disabled={disabled}>
      {body}
    </button>
  );
}

/* ── Index list ───────────────────────────────────────────────────────────
   THE REPLACEMENT FOR THE LINK-CARD GRID.

   A category page's job is to tell the reader what DISTINGUISHES its entries,
   which a grid of equal cards is structurally unable to do: every card is the
   same size, so every entry looks equally important and the only information
   carried is "there are four of them". The index row is a register line —
   sheet number, title, one line of scope, and the entry's own measured facts
   pulled from its detail page — so the reader can choose without opening four
   pages first. */
export type ShellIndexItem = {
  /** A route. Rendered as a router `<Link>`. */
  to?: string;
  /**
   * A non-route destination — a served PDF, an external page. Rendered as a
   * plain `<a>`, because a router `<Link>` to `/belgeler/…` would be
   * intercepted by the router and resolve to the 404 catch-all.
   *
   * Exactly one of `to` and `href` is meaningful; `to` wins if both are given.
   * PHASE 08: added so the quality dossier's document register is the SAME
   * register row as every other index on the site, instead of a page-local
   * skin that happens to look like one.
   */
  href?: string;
  /** For `href` rows: mark the link as a download and name the file. */
  download?: boolean;
  /** Sheet number in the rail column. Supplied so a list can continue. */
  index?: string;
  title: string;
  description?: string;
  /** The entry's own measured facts, e.g. `["±0.01mm", "Ra 0.4µm"]`. */
  meta?: string[];
  /** Small mono qualifier above the title, e.g. the family the entry is in. */
  eyebrow?: string;
};

export function ShellIndexList({
  items,
  ariaLabel,
  compact,
}: {
  items: ShellIndexItem[];
  ariaLabel?: string;
  compact?: boolean;
}) {
  return (
    <ol className="shell-index" aria-label={ariaLabel} data-compact={compact || undefined}>
      {items.map((item, i) => {
        const body = (
          <>
            <span className="shell-index-no" aria-hidden="true">
              {item.index ?? String(i + 1).padStart(2, "0")}
            </span>
            <span className="shell-index-body">
              {item.eyebrow && <span className="shell-index-eyebrow">{item.eyebrow}</span>}
              <span className="shell-index-title">{item.title}</span>
              {item.description && <span className="shell-index-desc">{item.description}</span>}
              {item.meta && item.meta.length > 0 && (
                <span className="shell-index-meta">
                  {item.meta.map((value) => (
                    <span key={value}>{value}</span>
                  ))}
                </span>
              )}
            </span>
            <ArrowUpRight className="shell-index-mark" aria-hidden="true" />
          </>
        );

        return (
          <li key={(item.to ?? item.href ?? "") + item.title}>
            {item.to ? (
              <Link className="shell-index-row" to={item.to}>{body}</Link>
            ) : (
              <a className="shell-index-row" href={item.href} download={item.download || undefined}>
                {body}
              </a>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ── Spec table ───────────────────────────────────────────────────────────
   The site's one technical table.

   The caption sits in the `<figcaption>` OUTSIDE the scroll container rather
   than in `<caption>` inside it, so a narrow viewport scrolls the data and
   leaves the table's name in place. `aria-label` on the `<table>` carries the
   same string, which is also the second thing `useScrollableRegionAccess`
   reaches for when it has to name the scrollable region it just made
   focusable — so the accessible name is identical either way.

   `numericFrom` marks the columns that carry measurements; those are set in
   the mono face with tabular figures and aligned right so the digits line up
   down the column, which is the entire reason a specification is a table. */
export type ShellSpecTableProps = {
  caption: string;
  note?: string;
  headers: string[];
  rows: ReactNode[][];
  /** Column index from which values are measurements. Default 1. */
  numericFrom?: number;
  /** Row index to mark as the reference row. */
  highlight?: number;
  /** Per-row key, when rows are re-ordered or filtered. */
  rowKey?: (row: ReactNode[], index: number) => string;
};

export function ShellSpecTable({
  caption,
  note,
  headers,
  rows,
  numericFrom = 1,
  highlight,
  rowKey,
}: ShellSpecTableProps) {
  return (
    <figure className="shell-table">
      <figcaption>
        <span className="shell-table-caption">{caption}</span>
        {note && <span className="shell-table-note">{note}</span>}
      </figcaption>
      <div className="shell-table-scroll">
        <table aria-label={caption}>
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th key={header + i} scope="col" data-numeric={i >= numericFrom || undefined}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowKey ? rowKey(row, rowIndex) : rowIndex}
                data-reference={highlight === rowIndex || undefined}
              >
                {row.map((cell, cellIndex) =>
                  cellIndex === 0 ? (
                    <th key={cellIndex} scope="row">{cell}</th>
                  ) : (
                    <td key={cellIndex} data-numeric={cellIndex >= numericFrom || undefined}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/* ── Numbered run ─────────────────────────────────────────────────────────
   Process steps, read as one continuous measured run rather than as N tiles.
   The rule under the numbers is the datum line; the steps are ticks on it.
   `detail` is optional so the same primitive carries a bare six-step sequence
   and an annotated one. */
export type ShellRunItem = {
  title: string;
  detail?: string;
  /** An action belonging to this step — used by `/iletisim`, where the run is
   *  a choice of three routes rather than a sequence of six stages. */
  action?: ReactNode;
};

export function ShellRun({ items, ariaLabel }: { items: ShellRunItem[]; ariaLabel?: string }) {
  return (
    <ol className="shell-run" aria-label={ariaLabel}>
      {items.map((item, i) => (
        <li key={item.title + i}>
          <span className="shell-run-no" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
          <span className="shell-run-title">{item.title}</span>
          {item.detail && <span className="shell-run-detail">{item.detail}</span>}
          {item.action && <span className="shell-run-action">{item.action}</span>}
        </li>
      ))}
    </ol>
  );
}

/* ── Tag row ──────────────────────────────────────────────────────────────
   Short labels — application areas, material families, accepted formats. Hair-
   line boxes in the mono face. Explicitly NOT `rounded-full` pills: a pill is
   a status chip, and none of these carry a status. */
export function ShellTagRow({ items, ariaLabel }: { items: string[]; ariaLabel?: string }) {
  return (
    <ul className="shell-tags" aria-label={ariaLabel}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/* ── Image plate ──────────────────────────────────────────────────────────
   A photograph presented as a plate on a drawing sheet: hairline frame, four
   corner ticks, a mono plate number in the margin BELOW the frame.

   THE RULE THIS ENCODES (blocker I4). Nothing that carries text may be
   positioned inside the frame. The defect this primitive replaces was a
   `h-[320px] overflow-hidden` box with an `absolute bottom-0` block of
   breadcrumb + eyebrow + `<h1>` + four chips inside it; at 375 that block
   measured 424px, so its top 104px — the eyebrow and the entire page title —
   were cut off by `overflow:hidden`, and being clipped it never intersected,
   so its reveal never fired either. A plate whose only child is the image can
   never do that, at any viewport, to any caption length. */
export function ShellPlate({
  media,
  plate,
  caption,
  style,
  size,
}: {
  /** The image element. Usually a `motion.img` so the page owns its parallax. */
  media: ReactNode;
  /** `reference`: a static still capped by `--shell-reference-plate-h`, no
      parallax overscan. Default is the detail-page hero plate. */
  size?: "reference";
  /** Mono plate designation printed under the frame, e.g. `PLAKA 01`. */
  plate?: string;
  /** One line of description under the frame. Never inside it. */
  caption?: string;
  style?: CSSProperties;
}) {
  return (
    <figure className="shell-plate" data-size={size} style={style}>
      <div className="shell-plate-frame">
        {media}
        <span className="shell-plate-tick" data-corner="tl" aria-hidden="true" />
        <span className="shell-plate-tick" data-corner="tr" aria-hidden="true" />
        <span className="shell-plate-tick" data-corner="bl" aria-hidden="true" />
        <span className="shell-plate-tick" data-corner="br" aria-hidden="true" />
      </div>
      {(plate || caption) && (
        <figcaption>
          {plate && <span className="shell-plate-no">{plate}</span>}
          {caption && <span className="shell-plate-caption">{caption}</span>}
        </figcaption>
      )}
    </figure>
  );
}

/* ── Next step ────────────────────────────────────────────────────────────
   THE RFQ CONTINUATION, ONCE.

   Phase 07's acceptance criteria require every service and sector page to
   offer a meaningful next step, and the pages previously offered six different
   ones: a centred "Projeleriniz için detaylı bilgi almak ister misiniz?" pill,
   a `border-2 border-primary` sidebar card with a `rounded-full` blob behind
   it, two full-bleed `linear-gradient(135deg, primary → forge-navy)` bands and
   an "Acil mi?" tile. All of them pointed at `/iletisim`; none of them pointed
   at the RFQ flow the site actually runs.

   One band now does it everywhere, it states what the reader should have ready
   and what happens next, and its primary action goes to `/teklif-al`. The
   secondary action stays a real alternative rather than a decoration.

   `subject` is the only per-page variable, so the promise cannot drift page to
   page — which is exactly how a delivery claim gets invented on page nine. */
export function ShellNextStep({
  no = "09",
  label = "SONRAKİ ADIM",
  eyebrow = "TEKLİF",
  title,
  body,
  detail,
  /* One primary label site-wide. It is deliberately the same words the footer
     and the global navigation use, so the site has ONE named primary action
     rather than six differently-worded ones pointing at two destinations. */
  primary = { label: "Teklif Al", to: "/teklif-al" },
  secondary,
  id,
}: {
  no?: string;
  label?: string;
  eyebrow?: string;
  title: string;
  body: string;
  /** Mono `label / value` pairs — what the reader should send, and the SLA. */
  detail?: { label: string; value: string }[];
  primary?: { label: string; to: string };
  secondary?: { label: string; to?: string; href?: string };
  id?: string;
}) {
  return (
    <ShellBand no={no} label={label} tone="paper" className="shell-next" id={id} ariaLabel={title}>
      <div className="tl-grid shell-next-body">
        <div className="shell-next-copy">
          <p className="shell-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="shell-next-lede">{body}</p>
          <div className="shell-next-actions">
            <ShellAction to={primary.to} variant="primary">{primary.label}</ShellAction>
            {secondary && (
              <ShellAction to={secondary.to} href={secondary.href} variant="ghost">
                {secondary.label}
              </ShellAction>
            )}
          </div>
        </div>
        {detail && detail.length > 0 && (
          <ShellMetaRow items={detail} className="shell-next-detail" />
        )}
      </div>
    </ShellBand>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PHASE 08 MOLECULES

   Wave B is the documentary half of the site — legal clauses, a technical
   journal, a quality dossier, capability profiles. Those pages need three
   structures Wave A never did, and each one is here rather than inside a page
   because more than one page needs it.

       ShellDocSection   a numbered clause / article section   · 6 pages
       ShellContents     the anchor index beside it            · 5 pages
       ShellNotice       an inline error / caution / note      · shared
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Numbered document section ────────────────────────────────────────────
   A clause of a legal text, a section of an article, a heading in a dossier.
   The number sits in the margin and is `aria-hidden`: "sıfır bir" announced
   before every heading is noise, and the heading already carries the name.

   `id` is REQUIRED, and it is the point of the primitive. A clause a reader
   cannot link to cannot be quoted back at anybody, which is most of what a
   legal section is for; and an article section with no anchor cannot have a
   table of contents that works. */
export function ShellDocSection({
  id,
  no,
  title,
  children,
}: {
  id: string;
  no: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="shell-doc-section" id={id} aria-labelledby={`${id}-title`}>
      <span className="shell-doc-section-no" aria-hidden="true">{no}</span>
      <h2 id={`${id}-title`}>{title}</h2>
      <div className="shell-doc-section-body">{children}</div>
    </section>
  );
}

/* ── Contents ─────────────────────────────────────────────────────────────
   The index of the anchors `ShellDocSection` publishes.

   A PLAIN `<a href="#id">`, NOT A ROUTER `<Link>`. React Router resolves a
   relative `to="#id"` against the current location and rewrites the URL; a
   bare fragment anchor is handled by the browser, so it also works before
   hydration and it keeps the platform's own fragment focus handling.

   `<ol>` because a document's clauses are ordered, and the visible numbers are
   the SECTION numbers rather than list markers — so the same `03` appears in
   the index and in the margin of the section it points at. */
export function ShellContents({
  items,
  label = "İÇİNDEKİLER",
  ariaLabel = "Bu sayfadaki bölümler",
}: {
  items: { id: string; no: string; label: string }[];
  label?: string;
  ariaLabel?: string;
}) {
  return (
    <nav className="shell-contents" aria-label={ariaLabel}>
      <p className="shell-eyebrow">{label}</p>
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>
              <span aria-hidden="true">{item.no}</span>
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ── Notice ───────────────────────────────────────────────────────────────
   THE SITE'S ONE INLINE MESSAGE BLOCK: a submission that failed, a CAD file
   that could not be read, a caution beside a technical table.

   `tone="error"` sets `role="alert"` so the message is announced when it
   appears. The other two tones are static prose and are deliberately NOT
   announced: a note that interrupts a screen-reader user on every render is a
   defect, not a courtesy.

   Nothing here is a coloured card. The tone is carried by a 2px rule on the
   leading edge and by the mono label — the same device `.shell-form-error`
   already uses, so an error inside a form and an error beside one read as the
   same object. */
export function ShellNotice({
  tone = "note",
  label,
  title,
  children,
  action,
}: {
  tone?: "error" | "caution" | "note";
  /** Mono status label, e.g. `HATA`, `DİKKAT`, `NOT`. */
  label: string;
  /** Optional one-line summary above the body. */
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="shell-notice" data-tone={tone} role={tone === "error" ? "alert" : undefined}>
      <p className="shell-notice-label">{label}</p>
      {title && <p className="shell-notice-title">{title}</p>}
      {children && <div className="shell-notice-body">{children}</div>}
      {action && <div className="shell-notice-actions">{action}</div>}
    </div>
  );
}
