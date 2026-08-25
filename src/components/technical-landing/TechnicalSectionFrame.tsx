import type { ElementType, ReactNode } from "react";

export type TechnicalContentStatus = "demo" | "sample" | "verified";

const statusLabels: Record<TechnicalContentStatus, string> = {
  demo: "DEMO İÇERİK",
  sample: "ÖRNEK İÇERİK",
  verified: "DOĞRULANMIŞ",
};

type TechnicalSectionFrameProps = {
  as?: ElementType;
  no: string;
  label: string;
  className?: string;
  id?: string;
  labelledBy?: string;
  ariaLabel?: string;
  status?: TechnicalContentStatus;
  children: ReactNode;
};

export function TechnicalSectionFrame({
  as: Component = "section",
  no,
  label,
  className = "",
  id,
  labelledBy,
  ariaLabel,
  status,
  children,
}: TechnicalSectionFrameProps) {
  return (
    <Component
      id={id}
      className={`tl-band ${className}`.trim()}
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      data-content-status={status}
    >
      <div className="tl-band-index" aria-hidden="true">
        <span>{no}</span>
        <small>{label}</small>
      </div>
      {status && <span className="tl-status-badge">{statusLabels[status]}</span>}
      {children}
    </Component>
  );
}
