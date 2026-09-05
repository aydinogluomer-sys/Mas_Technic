import { readFileSync } from "node:fs";
import { basename, join } from "node:path";
import type { Page } from "@playwright/test";

/* ══════════════════════════════════════════════════════════════════════════
   THE RADIUS REGISTER IS DERIVED — PHASE 07 CORRECTION #3

   `docs/lean/17-inner-page-composition.md` §4 lists every element that paints
   a non-zero `border-radius` on the six rebuilt routes. Three versions of that
   list have been wrong, each in a way a reader could not have detected:

     v1  "nothing on those routes paints a radius"      — false
     v2  three sources, found by opening two components — two missing
     v3  six sources, but only 375 and 1280 were run, and the cursor rows were
         explained by a threshold (901) that does not exist. The 768 column was
         not absent by decision; it was absent because the register believed
         nothing new could appear there. It can: at 768 the cursor layers mount
         AND the property meters have already switched in.

   So the register stopped being written. `./radius-census.spec.ts` runs the
   census and compares it, cell by cell, against the table in the document. A
   stale number in the prose is now a failing test.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * One route per rebuilt page component — `Hakkimizda`, `Iletisim`,
 * `Malzemeler`, `MalzemeKategori`, `CategoryPage`, `ServiceDetail`. "The six
 * rebuilt routes" was never written down anywhere before, which is why the
 * census could not be reproduced from the document.
 *
 * Measured: substituting `/endustriyel/otomotiv` for `/malzemeler/aluminyum`
 * (the set an earlier run used) produces an identical register, so the table
 * does not depend on which representative of a component is chosen.
 */
export const CENSUS_ROUTES = [
  "/hakkimizda",
  "/iletisim",
  "/malzemeler",
  "/malzemeler/aluminyum",
  "/hizmetler/kategori/talasli-imalat",
  "/hizmetler/cnc-frezeleme",
] as const;

/**
 * The three golden widths that carry distinct page content. 1440 is omitted
 * deliberately: it is the same layout as 1280 and would only inflate the run.
 * The census is taken with a FINE pointer at every width, so it describes the
 * pages rather than the test harness's touch emulation.
 */
export const CENSUS_WIDTHS = [375, 768, 1280] as const;

export type CensusGroup = { signature: string; radius: string; count: number; sizes: string[] };
export type CensusCell = { width: number; route: string; groups: CensusGroup[] };

/**
 * Every element whose computed `border-radius` is non-zero on any corner and
 * which is actually painting: not `display:none`, not `visibility:hidden`, not
 * `opacity:0`, not a zero box. Grouped by tag + full class list, because the
 * two rows every earlier version missed carry their radius as an INLINE style
 * and no `rounded-` class grep can see them.
 */
export async function censusOfPage(page: Page): Promise<CensusGroup[]> {
  return page.evaluate(() => {
    const groups = new Map<string, { signature: string; radius: string; count: number; sizes: Set<string> }>();
    for (const element of Array.from(document.querySelectorAll("*"))) {
      const style = getComputedStyle(element);
      const radii = [
        style.borderTopLeftRadius,
        style.borderTopRightRadius,
        style.borderBottomLeftRadius,
        style.borderBottomRightRadius,
      ];
      if (radii.every((radius) => radius === "0px" || radius === "0%" || radius === "")) continue;
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") continue;
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;

      const className = typeof element.className === "string" ? element.className.trim() : "";
      const signature = element.tagName.toLowerCase()
        + (className ? "." + className.split(/\s+/).join(".") : "");
      const radius = radii.every((value) => value === radii[0]) ? radii[0] : radii.join(",");
      const key = `${signature} | ${radius}`;
      const group = groups.get(key)
        ?? { signature, radius, count: 0, sizes: new Set<string>() };
      group.count += 1;
      group.sizes.add(`${Math.round(rect.width)}x${Math.round(rect.height)}`);
      groups.set(key, group);
    }
    return Array.from(groups.values()).map((group) => ({
      signature: group.signature,
      radius: group.radius,
      count: group.count,
      sizes: Array.from(group.sizes).sort(),
    }));
  });
}

/** Scroll the whole document once, then return to the top. */
export async function scrollWholeDocument(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 120));
  });
}

/**
 * The signature → row identity map.
 *
 * The table cannot key on the raw signature: the launcher's is ninety
 * characters of colour and shadow classes, and a table nobody can read is a
 * table nobody checks. So the label lives here, in code, and the spec asserts
 * the map is EXHAUSTIVE in both directions — an unlabelled radius source is a
 * failure, and a label that matches nothing is a failure. A class edit on one
 * of these elements therefore lands as a red test asking for a re-run, which
 * is the intended cost.
 */
export const RADIUS_SOURCES: {
  label: string;
  matches: (signature: string) => boolean;
  file: string;
  lines: string;
}[] = [
  {
    label: "step meter",
    matches: (signature) => signature === "div.h-1.5.flex-1.rounded-full",
    file: "src/components/MaterialMorphScroll.tsx",
    lines: "228",
  },
  {
    label: "property-meter track",
    matches: (signature) => signature === "div.h-1.rounded-full.overflow-hidden",
    file: "src/components/MaterialMorphScroll.tsx",
    lines: "357",
  },
  {
    label: "property-meter fill",
    matches: (signature) => signature === "div.h-full.rounded-full",
    file: "src/components/MaterialMorphScroll.tsx",
    lines: "359",
  },
  {
    label: "chat launcher",
    /* Loosened on purpose: the rest of this signature is colour, shadow and
       hover state that has nothing to do with the radius. */
    matches: (signature) => signature.startsWith("button.fixed.z-50.")
      && signature.includes(".rounded-full."),
    file: "src/components/ChatBot.tsx",
    lines: "294",
  },
  {
    label: "cursor dot",
    matches: (signature) => signature === "div.fixed.top-0.left-0.pointer-events-none",
    file: "src/components/ui/CustomCursor.tsx",
    lines: "194-207",
  },
  {
    label: "cursor ring",
    matches: (signature) =>
      signature === "div.fixed.top-0.left-0.pointer-events-none.flex.items-center.justify-center",
    file: "src/components/ui/CustomCursor.tsx",
    lines: "209-221",
  },
];

export type RegisterRow = {
  label: string;
  counts: Record<number, number>;
  radius: string;
  boxes: Record<number, string[]>;
  source: string;
};

/** Fold the per-route census into one row per labelled source. */
export function foldRegister(cells: readonly CensusCell[]): RegisterRow[] {
  const rows = new Map<string, RegisterRow>();
  const unlabelled: string[] = [];

  for (const cell of cells) {
    for (const group of cell.groups) {
      const source = RADIUS_SOURCES.find((candidate) => candidate.matches(group.signature));
      if (!source) {
        unlabelled.push(`${group.signature} @${cell.width} ${cell.route}`);
        continue;
      }
      const row = rows.get(source.label) ?? {
        label: source.label,
        counts: {},
        radius: group.radius,
        boxes: {},
        source: `${basename(source.file)}:${source.lines}`,
      };
      if (row.radius !== group.radius) {
        throw new Error(
          `"${source.label}" paints two different radii (${row.radius} and ${group.radius}); `
            + "the register has one radius column per row and must be re-shaped",
        );
      }
      row.counts[cell.width] = (row.counts[cell.width] ?? 0) + group.count;
      const boxes = new Set([...(row.boxes[cell.width] ?? []), ...group.sizes]);
      row.boxes[cell.width] = Array.from(boxes).sort();
      rows.set(source.label, row);
    }
  }

  if (unlabelled.length) {
    throw new Error(
      "the census found a radius source with no row in RADIUS_SOURCES:\n  "
        + unlabelled.join("\n  ")
        + "\nAdd it there and to docs/lean/17 §4 — the register is the list of what the "
        + "browser paints, not the list of what somebody remembered.",
    );
  }

  return RADIUS_SOURCES
    .filter((source) => rows.has(source.label))
    .map((source) => rows.get(source.label)!);
}

/** Render a row the way the document writes it, so the two can be compared. */
export function renderRow(row: RegisterRow, widths: readonly number[]): string {
  const counts = widths.map((width) => (row.counts[width] ? String(row.counts[width]) : "–"));
  const boxes = widths
    .filter((width) => row.boxes[width]?.length)
    .map((width) => `${width}: ${row.boxes[width].map((box) => box.replace("x", "×")).join(", ")}`)
    .join(" · ");
  return [`\`${row.label}\``, ...counts, `\`${row.radius}\``, boxes, `\`${row.source}\``]
    .join(" | ");
}

/**
 * Pull §4's table back out of the document in the same shape `renderRow`
 * produces. Deliberately strict: it reads the rows between the header line that
 * starts with `| element |` and the first blank line.
 */
export function parseRegisterTable(markdown: string): string[] {
  const lines = markdown.split(/\r?\n/);
  const header = lines.findIndex((line) => line.startsWith("| element |"));
  if (header === -1) throw new Error("docs/lean/17 §4: no `| element |` register table found");
  const rows: string[] = [];
  for (let i = header + 2; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.startsWith("|")) break;
    rows.push(line.replace(/^\|\s*/, "").replace(/\s*\|$/, "").split("|").map((cell) => cell.trim()).join(" | "));
  }
  if (!rows.length) throw new Error("docs/lean/17 §4: the register table has no rows");
  return rows;
}

/** `File.tsx:228` / `File.tsx:194-207` must really declare a radius. */
export function citationDeclaresRadius(repoRoot: string, file: string, lines: string): boolean {
  const text = readFileSync(join(repoRoot, file), "utf8").split(/\r?\n/);
  const [from, to] = lines.split("-").map(Number);
  return text
    .slice(from - 1, (to ?? from))
    .some((line) => /rounded-full|borderRadius|border-radius/.test(line));
}
