/**
 * QA 09a-R2 item 1 (arithmetic half) — recompute every ratio C1 asserts,
 * from the token hex values actually in design-tokens.css, using the WCAG 2.x
 * relative-luminance formula. The browser half is the separate spec; this
 * catches a wrong number before a browser is even opened.
 */
const TOK = {
  "tl-void": "#030506",
  "tl-black": "#070b0d",
  "tl-panel": "#0c1114",
  "tl-paper": "#eee9de",
  "tl-paper-raised": "#f6f2e8",
  "tl-paper-sunken": "#fbf8f1",
  "tl-stamp": "#8a4030",
  "tl-stamp-light": "#e18570",
  "tl-bronze-light": "#c9b699",
};

const srgb = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
};
const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const lum = (hex) => {
  const [r, g, b] = srgb(hex).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

// sRGB -> Lab (D65) for the deltaE claim
const toLab = (hex) => {
  let [r, g, b] = srgb(hex).map(lin);
  let x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  let y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  let z = (r * 0.0193339 + g * 0.119192 + b * 0.9503041) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  [x, y, z] = [f(x), f(y), f(z)];
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
};
const dE76 = (a, b) => {
  const [l1, a1, b1] = toLab(a), [l2, a2, b2] = toLab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
};

const CLAIMS = [
  ["FIXED  stamp-light on tl-black   (C1 says 7.33)", "tl-stamp-light", "tl-black", 7.33],
  ["FIXED  stamp-light on tl-void", "tl-stamp-light", "tl-void", null],
  ["FIXED  stamp-light on tl-panel", "tl-stamp-light", "tl-panel", null],
  ["BEFORE stamp on tl-black        (C1 says 2.69)", "tl-stamp", "tl-black", 2.69],
  ["BEFORE stamp on tl-void         (C1 says 2.78)", "tl-stamp", "tl-void", 2.78],
  ["BEFORE stamp on tl-panel        (C1 says 2.58)", "tl-stamp", "tl-panel", 2.58],
  ["PAPER  stamp on paper-sunken    (C1 says 6.93)", "tl-stamp", "tl-paper-sunken", 6.93],
  ["PAPER  stamp on tl-paper        (C1 says 6.07)", "tl-stamp", "tl-paper", 6.07],
  ["PAPER  stamp on paper-raised", "tl-stamp", "tl-paper-raised", null],
  ["TRAP   stamp-light on tl-paper  (what a ROOT override would have shipped; C1 says 2.23)",
    "tl-stamp-light", "tl-paper", 2.23],
  ["TRAP   stamp-light on paper-sunken", "tl-stamp-light", "tl-paper-sunken", null],
];

let bad = 0;
for (const [label, fg, bg, claimed] of CLAIMS) {
  const r = ratio(TOK[fg], TOK[bg]);
  let verdict = "";
  if (claimed !== null) {
    const ok = Math.abs(r - claimed) <= 0.02;
    if (!ok) bad++;
    verdict = ok ? "  ✓ matches claim" : `  ✗ CLAIM ${claimed} != ${r.toFixed(2)}`;
  }
  console.log(`${r.toFixed(2).padStart(6)}:1  ${label}${verdict}`);
}

console.log("");
const de = dE76(TOK["tl-stamp-light"], TOK["tl-bronze-light"]);
console.log(`deltaE76(stamp-light, bronze-light) = ${de.toFixed(1)}  (C1 says "stays deltaE 34")`);
console.log("");
console.log("4.5:1 small-text floor -> stamp-light/tl-black clears by " +
  (((ratio(TOK["tl-stamp-light"], TOK["tl-black"]) / 4.5) - 1) * 100).toFixed(0) + "%  (C1 says 63%)");
console.log(bad === 0 ? "ALL_NUMERIC_CLAIMS_REPRODUCE" : `MISMATCHES=${bad}`);
