/**
 * Design System v2.0 — Type-safe token accessor
 *
 * Kullanım:
 *   style={{ color: T.heatMolten }}              → typo'da TS error
 *   style={{ background: alpha("heatMolten", 0.25) }}
 *
 * Solid renkler `var(--token)`, alpha kompozisyon `rgb(var(--token-rgb) / a)`
 * pattern'i ile çalışır. `rgba(var(--token), a)` GEÇERSİZ CSS'tir — kullanma.
 */

export const T = {
  heatMolten: "var(--heat-molten)",
  heatEmber: "var(--heat-ember)",
  precisionSteel: "var(--precision-steel)",
  precisionIce: "var(--precision-ice)",
  materialChrome: "var(--material-chrome)",
  surfaceBase: "var(--surface-base)",
  surfaceRaised: "var(--surface-raised)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  overlayDarkLow: "var(--overlay-dark-low)",
  overlayDarkMid: "var(--overlay-dark-mid)",
} as const;

export type TokenKey = keyof typeof T;

const ALPHA_TOKEN_MAP = {
  heatMolten: "--heat-molten-rgb",
  heatEmber: "--heat-ember-rgb",
  precisionSteel: "--precision-steel-rgb",
  precisionIce: "--precision-ice-rgb",
  materialChrome: "--material-chrome-rgb",
  surfaceBase: "--surface-base-rgb",
  textPrimary: "--text-primary-rgb",
} as const;

export type AlphaTokenKey = keyof typeof ALPHA_TOKEN_MAP;

/**
 * Alpha compositing helper.
 * @example alpha("heatMolten", 0.25) → "rgb(var(--heat-molten-rgb) / 0.25)"
 */
export const alpha = (token: AlphaTokenKey, opacity: number): string =>
  `rgb(var(${ALPHA_TOKEN_MAP[token]}) / ${opacity})`;
