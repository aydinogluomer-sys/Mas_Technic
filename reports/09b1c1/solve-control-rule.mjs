/* Choosing the two control-boundary values, in the open.
   ------------------------------------------------------------------------
   The same sRGB maths the page probe uses, run over every ground a control
   from this system can actually sit on, so the alpha is CHOSEN from the
   measurement rather than nudged until a screenshot looked right.

   Grounds, all four of them:
     graphite  field fill `--tl-panel`      #0c1114   (input, select, textarea, dropzone)
     graphite  transparent → `--tl-black`   #070b0d   (ghost action, segment, row toggle, social)
     paper ROOT  field fill `--tl-paper-raised` #f6f2e8 / ground `--tl-paper-sunken` #fbf8f1
     paper BAND  field fill `--tl-paper-raised` #f6f2e8 / ground `--tl-paper`        #eee9de
   The paper BAND inside a graphite ROOT is the case that falsified two 09a
   proposals, so it is in the table rather than assumed to behave like the
   paper root. */
const srgb = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const lum = ([r, g, b]) => 0.2126 * srgb(r / 255) + 0.7152 * srgb(g / 255) + 0.0722 * srgb(b / 255);
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
};
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const over = (rgb, a, ground) => rgb.map((v, i) => Math.round(a * v + (1 - a) * ground[i]));

const BLACK = hex("#070b0d");
const PANEL = hex("#0c1114");
const PAPER_RAISED = hex("#f6f2e8");
const PAPER_SUNKEN = hex("#fbf8f1");
const PAPER = hex("#eee9de");

const GRAPHITE_INK = [227, 231, 225]; // --tl-rule's own colour
const PAPER_INK = [18, 23, 25];       // --tl-paper-rule's own colour

const cases = (name, ink, pairs) => {
  console.log(`\n── ${name} ──`);
  for (let a = 0.24; a <= 0.72; a += 0.02) {
    const cells = pairs.map(([label, fill, ground]) => {
      const border = over(ink, a, fill);
      return `${label} fill ${ratio(border, fill).toFixed(2)} ground ${ratio(border, ground).toFixed(2)}`;
    });
    const worst = Math.min(...pairs.map(([, fill, ground]) => {
      const border = over(ink, a, fill);
      return Math.max(ratio(border, fill), ratio(border, ground));
    }));
    console.log(`α ${a.toFixed(2)}  worst ${worst.toFixed(2)}  |  ${cells.join("  |  ")}`);
  }
};

cases("GRAPHITE  rgba(227,231,225,α)", GRAPHITE_INK, [
  ["field   ", PANEL, BLACK],
  ["transp. ", BLACK, BLACK],
]);

cases("PAPER  rgba(18,23,25,α)", PAPER_INK, [
  ["root-fld", PAPER_RAISED, PAPER_SUNKEN],
  ["band-fld", PAPER_RAISED, PAPER],
  ["root-trn", PAPER_SUNKEN, PAPER_SUNKEN],
  ["band-trn", PAPER, PAPER],
]);
