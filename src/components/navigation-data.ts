/**
 * COMPATIBILITY SURFACE — not a second IA.
 *
 * The public information architecture now lives in exactly one place:
 * `src/components/navigation/ia.ts`. This file used to BE that source, and was
 * one of the three parallel link taxonomies Phase 03 consolidated. It survives
 * only because `src/components/LandingFlow.tsx` — the dev-only
 * `/legacy-landing` tree, which is outside this phase's write allowlist and is
 * not built into production (`src/App.tsx` `DEV_ONLY_ROUTES`) — still imports
 * `navigationItems` from here.
 *
 * Nothing in the shipped public bundle reads this module. When
 * `/legacy-landing` is retired, delete the file rather than adding to it.
 */
export type { NavigationColumn, NavigationItem, NavigationLink } from "./navigation/ia";
export { navigationItems } from "./navigation/ia";
