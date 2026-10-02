/**
 * THE REDUCED-MOTION REVEAL PRIMITIVE  (defect B28)
 * =================================================
 *
 * WHAT WAS BROKEN
 * ---------------
 * Under `prefers-reduced-motion: reduce`, `/hizmetler/cnc-frezeleme` rendered
 * 519 of its 709 laid-out elements at an effective `opacity: 0` AT REST — 186
 * of them carrying their own text. `/malzemeler/aluminyum` and `/iletisim`
 * were hiding content the same way. The landing was fine, because
 * `useTechnicalLandingMotion` already sets `data-motion="reduced"` and the
 * landing's hidden initial states are scoped under `[data-motion="ready"]`.
 *
 * The cause is Framer Motion's `whileInView`. `whileInView` is gated on an
 * IntersectionObserver, and Framer does NOT skip that gate for reduced-motion
 * users — `MotionConfig reducedMotion="user"` only stops transform and layout
 * animations, it happily keeps animating opacity. So every
 * `initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}` pair became: content
 * is invisible until you scroll to it. For a reduced-motion user that is not a
 * degraded animation, it is missing content, and axe agreed — its scannable
 * node count on that route collapsed from 33 to 5.
 *
 * WHY THIS SHAPE
 * --------------
 * The obvious repair is a guard at each call site. There were 57 of them
 * across 21 files, in eight different shapes (target objects, variant labels,
 * keyframe arrays, clip insets, an animated `width`). Fifty-seven hand-written
 * guards is fifty-seven chances to forget one, and the fifty-eighth call site
 * lands tomorrow.
 *
 * So the guard lives in the `motion` factory itself. Every call site imports
 * `motion` from HERE instead of from `framer-motion`; nothing else about the
 * call site changes — same element, same props, same layout, same copy. When
 * the user has not asked for reduced motion the props are forwarded verbatim
 * and Framer behaves exactly as before, so the full choreography is intact.
 * When the user HAS asked for it, the element is rendered directly in the
 * state the animation would have finished in.
 *
 * A call site cannot bypass this, because bypassing it means importing
 * `motion` from `framer-motion` again, and `node scripts/motion-audit.mjs
 * --mode=guard` fails the build on exactly that import.
 *
 * HOW THE RESTING STATE IS DERIVED
 * --------------------------------
 *   initial      -> `false`. "Do not stage a hidden first frame."
 *   whileInView  -> becomes `animate`, so it no longer waits for intersection.
 *   viewport     -> dropped; there is nothing left to observe.
 *   transition   -> zero. With `initial={false}` Framer paints the target on
 *                   the first frame anyway; zeroing it also stops `repeat`
 *                   loops and `staggerChildren` from reintroducing motion.
 *   keyframes    -> collapsed to a single value (see `settle`).
 *
 * Elements with none of `initial` / `animate` / `whileInView` are passed
 * through untouched: those are variant CHILDREN, and they must keep inheriting
 * from their parent's propagation rather than being pinned here.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO
 * ----------------------------------
 * It does not touch `whileHover` / `whileTap` / `whileFocus`. Those are
 * user-initiated and instantaneous here (transition is zeroed), and silently
 * deleting a hover affordance would remove feedback, not motion.
 */

import { forwardRef, type ComponentType } from "react";
import { motion as framerMotion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { MOTION_REDUCED } from "@/config/motion-system";

type UnknownProps = Record<string, unknown>;

const isVariantLabel = (value: unknown): value is string | string[] =>
  typeof value === "string" || (Array.isArray(value) && typeof value[0] === "string");

/**
 * The resting value of an `opacity` keyframe array — MAXIMUM, not last.
 *
 * THE CONSTRAINT, STATED (inherited item I2)
 * ------------------------------------------
 * A keyframe array reaching here is assumed to be a PULSE: a transient
 * emphasis whose brightest frame is the element's real, visible state.
 * `opacity: [0, 0.6, 0]` is a flash, and its LAST frame is invisible; resting
 * there would reintroduce the exact defect this module exists to remove. Its
 * maximum can never hide anything. QA checked all four current opacity-keyframe
 * call sites and every one of them is such a pulse.
 *
 * The constraint that makes the rule sound is therefore: **no call site may use
 * an opacity keyframe array to express a deliberately-hidden END state.** If
 * one ever does — `opacity: [1, 0]` meaning "and then it is gone" — this would
 * silently pin it visible, which is a content bug in the opposite direction.
 *
 * That is not left to the comment. When the maximum and the last frame
 * disagree, DEV builds say so once per distinct signature, so the fifty-eighth
 * call site announces itself instead of being discovered visually. An element
 * that genuinely has to end hidden must not express that as a keyframe array
 * here; it belongs behind conditional rendering, the way `ProjectShowcase`'s
 * chroma tripwire now is.
 */
const warnedOpacitySignatures = new Set<string>();

function restingOpacity(frames: unknown[]): unknown {
  const numbers = frames.filter((v): v is number => typeof v === "number");
  if (!numbers.length) return frames[frames.length - 1];

  const max = Math.max(...numbers);
  const last = numbers[numbers.length - 1];
  if (import.meta.env.DEV && max !== last) {
    const signature = numbers.join(",");
    if (!warnedOpacitySignatures.has(signature)) {
      warnedOpacitySignatures.add(signature);
      console.warn(
        `[shell/motion] opacity keyframes [${signature}] rest at ${max}, not at their last frame ${last}. ` +
          "That is correct for a pulse. If the element is meant to END HIDDEN, express that with conditional " +
          "rendering instead — a reduced-motion user would otherwise be left looking at it.",
      );
    }
  }
  return max;
}

/**
 * Collapse a keyframe array to the one value the element should rest at.
 *
 * `opacity` goes through `restingOpacity` above — maximum, under the stated
 * constraint. Everything else takes the LAST frame: every other property is
 * positional (`x`, `scale`, `clipPath`, `width`), and for those the last
 * keyframe IS the settled layout; taking a maximum there would leave elements
 * displaced.
 */
function settle(target: UnknownProps): UnknownProps {
  const out: UnknownProps = {};
  let after: UnknownProps | null = null;

  for (const [key, value] of Object.entries(target)) {
    if (key === "transition") continue;
    if (key === "transitionEnd") {
      after = value as UnknownProps;
      continue;
    }
    if (!Array.isArray(value)) {
      out[key] = value;
      continue;
    }
    if (key === "opacity") {
      out[key] = restingOpacity(value);
      continue;
    }
    out[key] = value[value.length - 1];
  }

  // `transitionEnd` is where the animation actually leaves the element.
  return after ? { ...out, ...after } : out;
}

function resolveAtRest(props: UnknownProps): UnknownProps {
  const { whileInView, viewport, initial, animate, transition, ...rest } = props;

  // Variant children: no state of their own, so leave propagation alone.
  if (whileInView === undefined && initial === undefined && animate === undefined) {
    return props;
  }

  let target: unknown;
  if (whileInView === undefined) {
    target = animate;
  } else if (animate === undefined || isVariantLabel(whileInView) || isVariantLabel(animate)) {
    target = whileInView;
  } else {
    // Both are targets: `whileInView` is the reveal's end state, so it wins.
    target = { ...(animate as UnknownProps), ...(whileInView as UnknownProps) };
  }

  const next: UnknownProps = { ...rest, initial: false, transition: MOTION_REDUCED };
  if (target !== undefined) {
    next.animate = isVariantLabel(target) ? target : settle(target as UnknownProps);
  }
  return next;
}

/* ── the factory ─────────────────────────────────────────────────────────── */

const cache = new Map<string, ComponentType<UnknownProps>>();

function restAware(key: string, Base: ComponentType<UnknownProps>) {
  const cached = cache.get(key);
  if (cached) return cached;

  // `forwardRef` + a stable cached identity: the component type must not change
  // between renders or React would remount every motion element on the page.
  const Wrapped = forwardRef<unknown, UnknownProps>((props, ref) => {
    const prefersReduced = usePrefersReducedMotion();
    const resolved = prefersReduced ? resolveAtRest(props) : props;
    return <Base ref={ref} {...resolved} />;
  }) as unknown as ComponentType<UnknownProps>;

  (Wrapped as { displayName?: string }).displayName = `RestAware(motion.${key})`;
  cache.set(key, Wrapped);
  return Wrapped;
}

/**
 * Drop-in replacement for framer-motion's `motion`.
 *
 * Only lowercase intrinsic tags (`div`, `section`, `path`, …) are wrapped.
 * `create` and any other non-element member is forwarded untouched, so
 * `motion.create(Component)` keeps working — such a component renders a motion
 * element of its own, which is itself reached through this proxy.
 */
export const motion = new Proxy(framerMotion, {
  get(base, key, receiver) {
    const value = Reflect.get(base, key, receiver);
    if (typeof key !== "string" || key === "create" || !/^[a-z]/.test(key)) return value;
    return restAware(key, value as ComponentType<UnknownProps>);
  },
}) as typeof framerMotion;
