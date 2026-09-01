import { useEffect } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   THE SHELL'S KEYBOARD CONTRACT FOR SCROLLABLE REGIONS

   WHY THIS BELONGS TO THE SHELL AND NOT TO A PAGE
   -----------------------------------------------
   The shell owns the width of the content field. `layout="band"` spends a
   `--tl-rail` column (64px desktop / 56px tablet / 42px mobile) on the
   technical rail, so every body it frames reads a NARROWER field than the
   pre-shell `container-industrial` did. A body that used to fit can now
   overflow, and an overflowing `overflow:auto` box that neither takes focus
   nor contains a focus stop is unreachable by keyboard — WCAG 2.1.1, and axe's
   `scrollable-region-focusable` (serious).

   MEASURED DEFECT THIS FIXES: on `/hizmetler/cnc-frezeleme` at 1280 the shell
   narrowed the field from 1278 to 1214 and the inner column from 787 to 743,
   which pushed a 776px table past its container. `scrollable-region-focusable`
   went 1 node -> 2 nodes. At 1344 (= 1280 + the rail) only 1 node remained,
   which attributes the second one to the rail. The same page body at 787px did
   not overflow, so this is the shell's regression to carry, not the body's.

   WHY NOT WIDEN THE FIELD BACK
   ----------------------------
   The rail IS the master grid (`src/styles/master-grid.css`); removing or
   discounting it would re-open the geometry Phase 04 settled and move every
   axis on every page. And horizontal scroll on a wide technical table is
   legitimate — a specification table with more columns than the field is a
   real thing on this site. The defect is not that the box scrolls; it is that
   a keyboard reader cannot reach it. So the shell guarantees the affordance
   for every body it frames, present and future.

   WHAT IT DOES
   ------------
   For each element inside the shell sheet that actually overflows on an axis
   whose `overflow` is `auto`/`scroll`, has no author `tabindex`, and contains
   no focus stop of its own, it adds:
       tabindex="0"      the missing focus stop (arrow keys then scroll it)
       role="group"      a container role, so the name below is exposed
       aria-label        derived from the region's own heading/caption
   and removes all three again the moment the element stops overflowing (a
   wider viewport, a filtered table), so no dead tab stop is left behind.

   BOUNDARIES
   ----------
   · Only attributes that create the affordance are touched, and only ones the
     author left unset — an element that already declares `tabindex`, `role`
     or `aria-label` keeps every one of them.
   · No layout property is read or written, so no golden image can move.
   · Page content is never rewritten; Phases 07-08 still own these bodies.
   ══════════════════════════════════════════════════════════════════════════ */

/** Marks the nodes this hook, and only this hook, is responsible for. */
const OWNED = "data-shell-scroll-region";

/** Generic names, by what the region actually wraps. Turkish: public UI. */
const GENERIC_TABLE = "Kaydırılabilir tablo";
const GENERIC_REGION = "Kaydırılabilir bölge";

function isScrollable(element: Element): boolean {
  const style = getComputedStyle(element);
  const scrollsX = element.scrollWidth > element.clientWidth + 1
    && (style.overflowX === "auto" || style.overflowX === "scroll");
  const scrollsY = element.scrollHeight > element.clientHeight + 1
    && (style.overflowY === "auto" || style.overflowY === "scroll");
  return scrollsX || scrollsY;
}

/**
 * A region that already contains a focus stop is reachable, and axe passes it.
 * Adding a second stop there would only lengthen the tab sequence.
 */
function containsFocusStop(element: Element): boolean {
  return !!element.querySelector(
    "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]),"
    + " textarea:not([disabled]), summary, [contenteditable=''], [contenteditable='true'],"
    + " [tabindex]:not([tabindex^='-'])",
  );
}

/**
 * The region's own name, in order of how specific it is to that region:
 * a table caption, then the nearest heading above it inside the same block,
 * then what kind of thing it is.
 */
function deriveLabel(element: Element): string {
  const table = element.querySelector("table");
  const caption = table?.querySelector("caption")?.textContent?.trim();
  if (caption) return caption;

  const ariaLabelledTable = table?.getAttribute("aria-label")?.trim();
  if (ariaLabelledTable) return ariaLabelledTable;

  let cursor: Element | null = element;
  while (cursor && cursor.id !== "main-content") {
    let sibling: Element | null = cursor.previousElementSibling;
    while (sibling) {
      const heading = sibling.matches("h1, h2, h3, h4, h5, h6")
        ? sibling
        : sibling.querySelector("h1, h2, h3, h4, h5, h6");
      const text = heading?.textContent?.trim();
      if (text) return `${text} — ${table ? GENERIC_TABLE.toLowerCase() : GENERIC_REGION.toLowerCase()}`;
      sibling = sibling.previousElementSibling;
    }
    cursor = cursor.parentElement;
  }
  return table ? GENERIC_TABLE : GENERIC_REGION;
}

function grant(element: Element) {
  if (element.hasAttribute(OWNED)) return;
  const claimed: string[] = [];
  if (!element.hasAttribute("tabindex")) {
    element.setAttribute("tabindex", "0");
    claimed.push("tabindex");
  }
  if (!element.hasAttribute("role")) {
    element.setAttribute("role", "group");
    claimed.push("role");
  }
  if (!element.hasAttribute("aria-label") && !element.hasAttribute("aria-labelledby")) {
    element.setAttribute("aria-label", deriveLabel(element));
    claimed.push("aria-label");
  }
  element.setAttribute(OWNED, claimed.join(" "));
}

function revoke(element: Element) {
  const claimed = element.getAttribute(OWNED);
  if (claimed === null) return;
  for (const attribute of claimed.split(" ").filter(Boolean)) element.removeAttribute(attribute);
  element.removeAttribute(OWNED);
}

/**
 * Grants the affordance to every scrollable region inside `root`, and takes it
 * back from every element that no longer needs it.
 */
function sweep(root: HTMLElement) {
  for (const element of root.querySelectorAll(`[${OWNED}]`)) {
    if (!isScrollable(element) || containsFocusStop(element)) revoke(element);
  }
  for (const element of root.querySelectorAll("*")) {
    if (element.hasAttribute(OWNED)) continue;
    /* Cheap gate first: `scrollWidth`/`clientWidth` are one layout read for the
       whole subtree, while `getComputedStyle` is per element. Only boxes that
       actually overflow are worth a style read. */
    if (element.scrollWidth <= element.clientWidth + 1
      && element.scrollHeight <= element.clientHeight + 1) continue;
    if (!isScrollable(element) || containsFocusStop(element)) continue;
    grant(element);
  }
}

/**
 * @param ref the shell sheet. Everything the shell frames lives inside it.
 */
export function useScrollableRegionAccess(ref: { current: HTMLElement | null }) {
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof ResizeObserver === "undefined") return;

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sweep(root);
      });
    };

    /* `childList` only: attribute churn from the motion layer must not make
       this run on every frame, and a class change cannot create an overflow
       without also changing layout, which the ResizeObserver below catches. */
    const mutations = new MutationObserver(schedule);
    mutations.observe(root, { childList: true, subtree: true });

    /* Width changes are what create and destroy these regions. Observing the
       sheet catches viewport resize, orientation change and font swap alike. */
    const resize = new ResizeObserver(schedule);
    resize.observe(root);

    /* A late image or web font can widen a table after the tree has settled and
       without resizing the sheet, so the capture phase picks up media `load`
       events from inside the field as well. */
    root.addEventListener("load", schedule, true);
    schedule();

    return () => {
      mutations.disconnect();
      resize.disconnect();
      root.removeEventListener("load", schedule, true);
      if (frame) cancelAnimationFrame(frame);
      for (const element of root.querySelectorAll(`[${OWNED}]`)) revoke(element);
    };
  }, [ref]);
}
