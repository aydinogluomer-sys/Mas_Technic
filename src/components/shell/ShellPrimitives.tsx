import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ShellBand } from "./ShellBand";

/* ══════════════════════════════════════════════════════════════════════════
   SHARED PUBLIC PRIMITIVES

   These are what Phases 07 and 08 compose inner pages FROM. Phase 04 only
   builds and ships them; it does not rewrite any page body with them.

   WHAT THEY DELIBERATELY ARE NOT
   ------------------------------
   No rounded card, no gradient, no glow, no shadow, no icon tile. The old
   inner-page shell reached for all five (`FooterNewsletter`/`FooterCTA` were
   `rounded-2xl` + `backdrop-filter: blur(10px)` + a diagonal accent wash + a
   32px drop shadow), which is exactly the generic-SaaS residue
   `IMPLEMENTATION.md` §5.5 forbids. Structure here is carried by hairlines,
   master columns, mono metadata and measured space — the same devices the
   landing already uses.
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Inner-page hero ──────────────────────────────────────────────────────
   RELATED TO THE LANDING HERO, NOT A COPY OF IT.

   The landing hero is the site's climax: 4/6/2, a photographed part on a
   granite plate, dimension lines, a part passport, ~460px minimum height and a
   scroll choreography. Repeating that on `/kvkk` would flatten the whole
   hierarchy — `mas-design-language`: "not every band is a climax".

   What an inner hero inherits: the band, the rail index, the mono eyebrow, the
   hairline under the title, the 12-column measure. What it drops: the image
   stage, the dimension overlay, the passport, the reserved viewport height and
   every scroll-driven effect. It is one master row, never taller than its
   text.
   ------------------------------------------------------------------------ */
export function ShellPageHero({
  no = "02",
  label = "SAYFA",
  crumb,
  eyebrow,
  title,
  lede,
  meta,
  actions,
  id,
}: {
  no?: string;
  label?: string;
  /**
   * The trail, ABOVE the title and inside the hero's own flow (Phase 07).
   *
   * Every deep page needs it, and the three that had one each put it
   * somewhere different: `CategoryPage` above the hero in a
   * `container-industrial`, `MalzemeKategori` inside a gradient hero, and
   * `ServiceDetail` inside an `overflow:hidden` image box where it was the
   * first of the four elements clipped off at 375 (blocker I4). It belongs to
   * the hero, in flow, once.
   */
  crumb?: ReactNode;
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Mono `label / value` pairs shown as a measured run under the lede. */
  meta?: { label: string; value: string }[];
  actions?: ReactNode;
  id?: string;
}) {
  return (
    <ShellBand no={no} label={label} className="shell-hero" id={id} labelledBy="shell-page-title">
      <div className="tl-grid shell-hero-body">
        <div className="shell-hero-copy">
          {crumb}
          {eyebrow && <p className="shell-eyebrow">{eyebrow}</p>}
          <h1 id="shell-page-title">{title}</h1>
        </div>
        <div className="shell-hero-datum" aria-hidden="true">
          <span>0.000</span>
          <i />
          <span>DATUM A</span>
        </div>
        <div className="shell-hero-foot">
          {lede && <p className="shell-lede">{lede}</p>}
          {actions && <div className="shell-hero-actions">{actions}</div>}
        </div>
        {meta && meta.length > 0 && <ShellMetaRow items={meta} className="shell-hero-meta" />}
      </div>
    </ShellBand>
  );
}

/* ── Technical metadata row ───────────────────────────────────────────────
   The site's one way of stating measured facts: mono label above, value below,
   separated by hairlines, never inside a card. */
export function ShellMetaRow({
  items,
  className = "",
}: {
  items: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <dl className={`shell-meta-row ${className}`.trim()}>
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ── Editorial title block ────────────────────────────────────────────────
   A band opener: index, serif headline, optional standfirst. The serif is the
   only expressive face in the system and it is used here and nowhere else in
   the shell. */
export function ShellTitleBlock({
  index,
  title,
  standfirst,
  id,
}: {
  index?: string;
  title: ReactNode;
  standfirst?: ReactNode;
  id?: string;
}) {
  return (
    <header className="shell-title-block">
      {index && <span className="shell-title-index" aria-hidden="true">{index}</span>}
      <h2 id={id}>{title}</h2>
      {standfirst && <p>{standfirst}</p>}
    </header>
  );
}

/* ── Evidence block ───────────────────────────────────────────────────────
   Proof, not claims. A source line is REQUIRED: an evidence block with no
   stated source is exactly the "proof theatre" `IMPLEMENTATION.md` §5.4 bans,
   so the type makes it impossible to render one without saying where the
   figure came from. */
export function ShellEvidence({
  kind,
  source,
  children,
}: {
  /** What the reader is looking at, e.g. `ÖLÇÜM`, `BELGE`, `SÜREÇ`. */
  kind: string;
  /** Where it comes from. Required by design. */
  source: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <figure className="shell-evidence">
      <span className="shell-evidence-kind" aria-hidden="true">{t(kind)}</span>
      <div className="shell-evidence-body">{children}</div>
      <figcaption className="shell-evidence-source">{t("KAYNAK")}: {t(source)}</figcaption>
    </figure>
  );
}

/* ── Measured divider ─────────────────────────────────────────────────────
   A rule with a datum tick and an optional reading — the shell's only
   horizontal separator. */
export function ShellDivider({ reading }: { reading?: string }) {
  return (
    <div className="shell-divider" role="separator" aria-orientation="horizontal">
      <span className="shell-divider-tick" aria-hidden="true" />
      {reading && <span className="shell-divider-reading" aria-hidden="true">{reading}</span>}
    </div>
  );
}

/* ── Surface band ─────────────────────────────────────────────────────────
   The paper/graphite alternation. Paper is the evidence ground: documents,
   tables, specifications. Graphite is the field everything else sits on. */
export function ShellSurfaceBand({
  no,
  label,
  /* ROUND 2 — paper by default. Inner pages read as consecutive graphite
     slabs (hero + bands + next step + footer); the body bands are now the
     warm paper ground, the hero and the footer keep the graphite frame, and a
     band that must stay dark says `tone="graphite"` at its call site. */
  tone = "paper",
  className = "",
  id,
  labelledBy,
  ariaLabel,
  children,
}: {
  no: string;
  label: string;
  tone?: "graphite" | "paper";
  className?: string;
  id?: string;
  labelledBy?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <ShellBand
      no={no}
      label={label}
      tone={tone}
      id={id}
      labelledBy={labelledBy}
      ariaLabel={ariaLabel}
      className={`shell-surface-band ${className}`.trim()}
    >
      <div className="tl-grid shell-surface-body">{children}</div>
    </ShellBand>
  );
}
