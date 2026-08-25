/**
 * CSS değişkenini runtime'da okur. R3F (Three.js) sahnelerinde
 * statik hex literal yerine token-bazlı renk eşitlemesi için kullanılır.
 *
 * Phase 11A-extended: AMBIGUITY karar 1 — R3F THREE.Color migration helper.
 *
 * @example
 *   const teal = getCSSVar("--heat-molten");          // "#e8610a"
 *   useEffect(() => {
 *     material.color.set(getCSSVar("--heat-molten"));
 *   }, [theme]);
 */
export function getCSSVar(name: string, fallback = "#000000"): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

/**
 * HSL token'ını ("215 10% 24%") Three.js'in anlayacağı hsl() string'ine çevirir.
 * shadcn/Tailwind HSL token formatı için: --primary: 186 87% 29%;
 */
export function getCSSVarHSL(name: string, fallback = "#000000"): string {
  const raw = getCSSVar(name, "");
  if (!raw) return fallback;
  // HSL bileşenleri (örn. "186 87% 29%") → "hsl(186 87% 29%)"
  if (/^\d/.test(raw) && raw.includes("%")) return `hsl(${raw})`;
  return raw;
}
