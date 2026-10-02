# 15 — The global public page shell

Phase 04. Read this before adding a public page or touching anything under
`src/components/shell/**`.

## What exists now

One shell for every public route.

```text
PageShell                       src/components/shell/PageShell.tsx
├─ Header                       (Phase 03; mounted, never redesigned here)
└─ .tl-sheet.shell-sheet        min(100%, --tl-sheet-max), hairline side rules
   ├─ <main id="main-content">  the page body
   └─ SiteFooter                the drawing title block, on every route
```

## Props

| prop | default | meaning |
|---|---|---|
| `surface` | `"paper"` | `paper` = warm evidence ground (inner pages). `graphite` = the landing's field. |
| `layout` | `"band"` | `band` gives `<main>` the master grid and drops each direct child into the content field. `bands` leaves `<main>` a plain block for pages that compose their own `ShellBand`s. |
| `navigation` | `true` | Mount the global bar. `false` only for the auth flow. |
| `footer` | `true` | Mount `SiteFooter`. |
| `rail` | `{ no: "02", label: "SAYFA" }` | Rail index and caption for `layout="band"`. |
| `className`, `rootRef`, `testId`, `mainData` | — | Escape hatches used by the landing and the dev-only legacy landing. |

## The rules a page must not break

1. **Never add top padding for the fixed bar.** It is reserved exactly once by
   `.tl-header-spacer` inside `#shared-header-host`. Editorial breathing space
   above the first band is `--shell-page-top`, and it lives in `shell.css`.
   Every inner page used to carry `pt-24` (96px) as well, which is why
   inner-page rhythm sat 64–72px below the landing's.
2. **Never mount `<Header/>` or a footer from a page.** The shell owns both.
3. **Never re-declare the master grid.** `--tl-rail` + `--tl-cols` come from
   `design-tokens.css`; nested bodies use `subgrid` (see `master-grid.css`).
   A subgridded element must carry no horizontal padding, border or margin.
4. **Never add a fourth link taxonomy.** The footer's columns are computed
   from `src/components/navigation/ia.ts` in
   `src/components/shell/footer-groups.ts`.
5. **Corner radius is zero**, gradients/glows/glass are out, and every colour
   comes from a `--tl-*` token.

## Primitives available to page bodies

From `@/components/shell`:

- `ShellBand` — the band: rail index + `--tl-cols` master columns + hairline.
- `ShellPageHero` — the inner-page hero. Related to the landing hero (same
  band, eyebrow, hairline, measure), deliberately without its reserved
  viewport height, image stage, dimension overlay or scroll choreography. The
  landing hero is the site's climax; an inner page gets its quieter relative.
- `ShellSurfaceBand` — paper/graphite band alternation.
- `ShellTitleBlock` — index + serif headline + standfirst.
- `ShellMetaRow` — mono `label`/`value` technical metadata.
- `ShellEvidence` — a framed reading whose `source` prop is REQUIRED, so an
  evidence block cannot be rendered without saying where the figure came from.
- `ShellDivider` — rule + datum tick + optional reading.
- `ShellLoading` / `ShellEmpty` / `ShellRouteError` / `ShellRouteBoundary`.

## Shell states

- **Loading** — `ShellLoading`: mono status line plus a datum sweep along a
  rule. Under `prefers-reduced-motion` the sweep stops; the status line carries
  the message. `.shell-boot` is the variant used before any shell exists
  (the route-module Suspense fallback in `src/App.tsx`).
- **Empty** — `ShellEmpty`: mono label, title, optional detail and action.
- **Route error** — `ShellRouteBoundary` wraps the routed subtree in
  `src/App.tsx` and resets on `location.pathname`. A page that throws loses its
  body, not the document; leaving the route clears the error without a reload.

## The route transition

`src/components/PageTransition.tsx`.

- Five panels close from the top, hold while the destination's name is read
  out, then open from the bottom. Pure CSS keyframes on a fixed,
  `pointer-events: none` layer OUTSIDE the routed subtree.
- **Exactly one route subtree is mounted at any time.** The outgoing page is
  not kept alive for an exit animation. This is not a style choice: the open
  menu is a modal that locks scroll and sets `inert` on `#root`, and it
  releases that from an effect cleanup owned by a component inside the routed
  subtree. With two subtrees alive, the lock could outlive the page that owned
  it (blocker B25, measured 8/8 at 1280×800 before the fix, 0/8 after).
- Under `prefers-reduced-motion` no curtain is rendered at all.
- The curtain is keyed on `location.pathname`, not `location.key`: an in-page
  anchor is not a route change and must not pull a curtain over the page the
  reader is already on.

## Per-route chrome

| layer | where | why |
|---|---|---|
| `GlobalToasts` | every public route | Suppressing it on `/` meant a toast fired from the landing's RFQ band had no surface and was lost. |
| `ChatBot` | every public route except `/` | The landing answers the same need in its own bands (`12 SSS`, `13 RFQ`); a floating launcher would cover its pinned choreography, and the launcher's own visual language belongs to Phases 09/13. |
| `ScrollProgress` | nowhere | Removed. The landing never had it, its bar used an orange that exists in no `--tl-*` token, and it duplicated the scrollbar at the cost of a spring on every scroll frame. |
| `CustomCursor` | `(hover:hover) and (pointer:fine)` | Unchanged. |

## Verification

```bash
npm run typecheck && npm run lint && npm run build
node scripts/grid-axis-probe.mjs
PLAYWRIGHT_PORT=<free> npm run test:e2e:critical
PLAYWRIGHT_PORT=<free> npm run test:e2e:visual
```

Shell contracts live in `e2e/landing/shell-and-transition.spec.ts`,
`e2e/shared-shell-accessibility.spec.ts`, `e2e/footer-reveal.spec.ts` and
`e2e/visual/shell-golden.spec.ts`.
