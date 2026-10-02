import { useSyncExternalStore } from "react";

/**
 * One media query for the whole app.
 *
 * This hook used to build a `MediaQueryList` and a `change` listener per
 * consumer. That was fine while a handful of components asked. It is not fine
 * now: `@/components/shell/motion` calls it from EVERY motion element on the
 * page, which on the landing is dozens of subscriptions to the same query.
 * A module-level store with `useSyncExternalStore` keeps exactly one listener
 * and one source of truth, so a preference change is also guaranteed to be
 * observed by every consumer in the same commit.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

const query = typeof window === "undefined" ? null : window.matchMedia(QUERY);

function subscribe(onChange: () => void) {
  if (!query) return () => {};
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
  return query?.matches ?? false;
}

/** Prerender snapshot: never claim a preference we have not measured. */
function getServerSnapshot() {
  return false;
}

/**
 * Returns true if the user prefers reduced motion.
 * Updates reactively if the media query changes.
 */
export const usePrefersReducedMotion = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

/**
 * Non-reactive read, for imperative code (GSAP setup, event handlers) that
 * needs the current preference outside React's render cycle.
 */
export const prefersReducedMotion = (): boolean => getSnapshot();
