/* QA P04-C / R3 (precise) — the exact D0 shape, property by property.
 *
 * D0 was NOT "two chunks disagree on a value". It was:
 *     a BASE declaration of (selector, property) shipped in chunk A and chunk B,
 *     while its RESPONSIVE OVERRIDE of the same (selector, property) shipped in
 *     only one of them.
 * Chunk order then decides the result, and the chunk missing the override
 * re-asserts the base.
 *
 * So the search is:
 *   carriers(S,P) = chunks declaring (S,P) at base context (no at-rule)
 *   for every override context C where SOME carrier declares (C,S,P):
 *       if not ALL carriers declare (C,S,P)  ->  D0-SHAPED SPLIT
 *
 * Selector splitting is paren-aware, so `:is(a, b)` is one selector.
 */
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";

const distAssets = process.argv[2] ?? "dist/assets";
const files = fs.readdirSync(distAssets).filter((f) => f.endsWith(".css")).sort();

/** Split a selector list on top-level commas only. */
function splitSelectors(selector) {
  const out = [];
  let depth = 0;
  let buf = "";
  for (const ch of selector) {
    if (ch === "(" || ch === "[") depth += 1;
    else if (ch === ")" || ch === "]") depth -= 1;
    if (ch === "," && depth === 0) { out.push(buf); buf = ""; continue; }
    buf += ch;
  }
  out.push(buf);
  return out.map((s) => s.trim().replace(/\s+/g, " ")).filter(Boolean);
}

/** file -> Map<selector, Map<property, Map<context, value>>> */
const model = new Map();

for (const file of files) {
  const root = postcss.parse(fs.readFileSync(path.join(distAssets, file), "utf8"));
  const bySelector = new Map();

  root.walkRules((rule) => {
    const chain = [];
    let inKeyframes = false;
    for (let p = rule.parent; p && p.type !== "root"; p = p.parent) {
      if (p.type !== "atrule") continue;
      if (/keyframes$/.test(p.name)) inKeyframes = true;
      chain.unshift(`@${p.name} ${p.params}`.replace(/\s+/g, " ").trim());
    }
    if (inKeyframes) return;
    const ctx = chain.join(" >> ");

    for (const sel of splitSelectors(rule.selector)) {
      if (!bySelector.has(sel)) bySelector.set(sel, new Map());
      const props = bySelector.get(sel);
      rule.walkDecls((d) => {
        if (d.parent !== rule) return;
        const prop = d.prop.trim() + (d.important ? " !important" : "");
        if (!props.has(prop)) props.set(prop, new Map());
        props.get(prop).set(ctx, d.value.trim().replace(/\s+/g, " "));
      });
    }
  });

  model.set(file, bySelector);
  console.log(`${file}: ${bySelector.size} selectors`);
}

/* Collect every (selector, property) pair seen anywhere. */
const pairs = new Map(); // "sel||prop" -> Set(files declaring it in ANY context)
for (const [file, bySelector] of model) {
  for (const [sel, props] of bySelector) {
    for (const prop of props.keys()) {
      const key = `${sel}||${prop}`;
      if (!pairs.has(key)) pairs.set(key, new Set());
      pairs.get(key).add(file);
    }
  }
}

console.log("\n=== D0-SHAPED SPLITS (base duplicated, override not) ===");
let d0 = 0;
const duplicatedBase = [];

for (const [key, seenIn] of [...pairs].sort()) {
  const [sel, prop] = key.split("||");
  // carriers = chunks that declare this pair at BASE context
  const carriers = [...seenIn].filter((f) => model.get(f).get(sel)?.get(prop)?.has(""));
  if (carriers.length < 2) continue;             // base not duplicated -> not the D0 shape
  duplicatedBase.push({ key, carriers });

  // every override context declared by any carrier
  const contexts = new Set();
  for (const f of carriers) {
    for (const ctx of model.get(f).get(sel).get(prop).keys()) if (ctx !== "") contexts.add(ctx);
  }
  for (const ctx of [...contexts].sort()) {
    const have = carriers.filter((f) => model.get(f).get(sel).get(prop).has(ctx));
    const missing = carriers.filter((f) => !model.get(f).get(sel).get(prop).has(ctx));
    if (missing.length === 0) continue;
    d0 += 1;
    console.log(`  D0-SPLIT  ${sel} { ${prop} }  under  ${ctx}`);
    console.log(`      base declared in : ${carriers.join(" , ")}`);
    console.log(`      override in      : ${have.join(" , ")}`);
    console.log(`      override MISSING : ${missing.join(" , ")}`);
  }
}

console.log(`\n(selector,property) pairs with a DUPLICATED base across chunks: ${duplicatedBase.length}`);
for (const { key, carriers } of duplicatedBase) {
  console.log(`  ${key.replace("||", " { ")} }  in  ${carriers.join(" , ")}`);
}
console.log(`\nD0-SHAPED SPLITS: ${d0}`);
