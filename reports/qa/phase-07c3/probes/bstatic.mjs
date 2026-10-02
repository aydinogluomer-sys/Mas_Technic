/* QA round 3 — static companion to bsweep.mjs. The differential sweep proves
 * there is no LIVE carrier; this one names the latent sites so a later phase
 * knows where they are. For every `\b` in every `pattern` rule, work out which
 * literal characters can sit immediately inside it, and flag the site when any
 * of them is a Turkish letter outside ASCII `\w`. */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [, , libPath, outPath] = process.argv;
const G = await import(pathToFileURL(resolve(libPath)).href);
const NONASCII = /[çğıîöşüâÇĞİÖŞÜÂÎ²]/;

/** First literal chars reachable going right from position i in a pattern. */
function firstChars(src, i) {
  const set = new Set();
  const visit = (p, depth) => {
    if (depth > 3 || p >= src.length) return;
    const c = src[p];
    if (c === "(") {
      let q = p + 1;
      if (src.startsWith("(?:", p) || src.startsWith("(?=", p)) q = p + 3;
      else if (src.startsWith("(?<=", p)) q = p + 4;
      else if (src.startsWith("(?!", p) || src.startsWith("(?<!", p)) return; // negative: skip
      // walk the alternation branches at this group's top level
      let d = 0, start = q;
      for (let k = q; k < src.length; k++) {
        const ch = src[k];
        if (ch === "\\") { k++; continue; }
        if (ch === "[") { while (k < src.length && src[k] !== "]") { if (src[k] === "\\") k++; k++; } continue; }
        if (ch === "(") d++;
        else if (ch === ")") { if (d === 0) { visit(start, depth + 1); break; } d--; }
        else if (ch === "|" && d === 0) { visit(start, depth + 1); start = k + 1; }
      }
      return;
    }
    if (c === "[") { // char class: collect its literal members
      for (let k = p + 1; k < src.length && src[k] !== "]"; k++) {
        if (src[k] === "\\") { k++; continue; }
        set.add(src[k]);
      }
      return;
    }
    if (c === "\\") { set.add("\\" + src[p + 1]); return; }
    set.add(c);
  };
  visit(i, 0);
  return [...set];
}
/** Last literal char going left — cheap version: the previous non-quantifier. */
function lastChar(src, i) {
  let p = i - 1;
  while (p >= 0 && "*+?}".includes(src[p])) {
    if (src[p] === "}") { while (p >= 0 && src[p] !== "{") p--; }
    p--;
  }
  if (p < 0) return null;
  if (src[p] === ")" || src[p] === "]") return "(group)";
  if (p > 0 && src[p - 1] === "\\") return "\\" + src[p];
  return src[p];
}

const sites = [];
for (const rule of G.RULES) {
  if (!rule.pattern) continue;
  const src = rule.pattern.source;
  let inClass = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === "\\") {
      if (src[i + 1] === "b" && !inClass) {
        const right = firstChars(src, i + 2);
        const left = lastChar(src, i);
        const badRight = right.filter((x) => NONASCII.test(x));
        const badLeft = left && NONASCII.test(left) ? [left] : [];
        sites.push({
          rule: rule.id, offset: i,
          context: src.slice(Math.max(0, i - 24), i + 30).replace(/\n/g, " "),
          leftLiteral: left, rightLiterals: right,
          DEAD: badRight.length > 0 || badLeft.length > 0,
          offenders: [...badLeft, ...badRight],
        });
      }
      i++; continue;
    }
    if (c === "[") inClass = true;
    else if (c === "]") inClass = false;
  }
}
const dead = sites.filter((s) => s.DEAD);
writeFileSync(outPath, JSON.stringify({ totalSites: sites.length, deadSites: dead.length, dead, all: sites }, null, 1), "utf8");
console.log(`\\b sites in pattern rules: ${sites.length}; adjacent to a non-ASCII Turkish letter: ${dead.length}`);
for (const s of dead) console.log(`  ${s.rule}  offenders=[${s.offenders.join(" ")}]  …${s.context}…`);
