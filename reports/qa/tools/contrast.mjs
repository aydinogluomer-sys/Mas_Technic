// QA tool — WCAG 2.x contrast ratio for the S7 bronze-step claims.
const hex = (h) => {
  const s = h.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
};
const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const L = (h) => {
  const [r, g, b] = hex(h).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [L(a), L(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const T = {
  bronze: "#8a7359",
  bronzeLight: "#c9b699",
  bronzeInk: "#6f5b45",
  void: "#030506",
  black: "#070b0d",
  paperSunken: "#fbf8f1",
  paper: "#eee9de",
  white: "#f3f0e8",
  ink: "#121719",
};

const pairs = [
  ["--tl-bronze on --tl-black (graphite, Coder claims 4.32)", T.bronze, T.black],
  ["--tl-bronze on --tl-void (actual graphite shell ground)", T.bronze, T.void],
  ["--tl-bronze on --tl-paper-sunken (paper, Coder claims 4.31)", T.bronze, T.paperSunken],
  ["--tl-bronze-light on --tl-black (Coder claims 9.9)", T.bronzeLight, T.black],
  ["--tl-bronze-light on --tl-void (actual graphite shell ground)", T.bronzeLight, T.void],
  ["--tl-bronze-ink on --tl-paper-sunken (Coder claims 6.2)", T.bronzeInk, T.paperSunken],
  ["--tl-bronze-ink on --tl-paper", T.bronzeInk, T.paper],
];

for (const [name, fg, bg] of pairs) {
  console.log(`${ratio(fg, bg).toFixed(3).padStart(7)} : 1   ${name}`);
}
