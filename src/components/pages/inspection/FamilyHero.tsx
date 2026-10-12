import type { ReactNode } from "react";
import { ShellBand, ShellMetaRow } from "@/components/shell";

/** Subject-led first band for detail and catalogue families. */
export function FamilyHero({
  no = "01", label, crumb, eyebrow, title, lede, meta, actions, subject, composition,
}: {
  no?: string;
  label: string;
  crumb?: ReactNode;
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  meta?: { label: string; value: string }[];
  actions?: ReactNode;
  subject: ReactNode;
  composition: "operation" | "turning" | "capability" | "sector" | "category" | "record";
}) {
  return (
    <ShellBand no={no} label={label} className={`shell-hero inspection-family-hero inspection-family-hero--${composition}`} labelledBy="shell-page-title">
      <div className="tl-grid shell-hero-body">
        <div className="shell-hero-copy">
          {crumb}
          {eyebrow && <p className="shell-eyebrow">{eyebrow}</p>}
          <h1 id="shell-page-title" className="inspection-title"><span>{title}</span></h1>
          <div className="shell-hero-foot">
            {lede && <p className="shell-lede">{lede}</p>}
            {actions && <div className="shell-hero-actions">{actions}</div>}
          </div>
          {meta && meta.length > 0 && <ShellMetaRow items={meta} className="shell-hero-meta" />}
        </div>
        <div className="inspection-family-subject">{subject}</div>
      </div>
    </ShellBand>
  );
}
