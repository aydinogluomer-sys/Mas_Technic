/* QA P04-C / R3 — independent verification of the "no other chunk split" claim.
 *
 * Parses EVERY emitted CSS chunk with postcss (not regex), flattens each rule
 * into (at-rule context, selector, property) -> value triples, then reports:
 *   A. selectors declared in more than one chunk        (duplication surface)
 *   B. triples where two chunks disagree on the VALUE   (value conflict)
 *   C. (context, selector, property) present in one chunk but MISSING from
 *      another chunk that declares the same selector    (THE D0 SHAPE)
 *
 * C is the one that matters: D0 was not a value disagreement, it was an
 * override that shipped in only one of the two chunks carrying its base.
 */
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";

const distAssets = process.argv[2] ?? "dist/assets";
const files = fs.readdirSync(distAssets).filter((f) => f.endsWith(".css")).sort();

/** chunk -> Map<"ctx||selector||prop", value> ; plus chunk -> Set<selector> */
const decls = new Map();
const selectorsOf = new Map();

for (const file of files) {
  const css = fs.readFileSync(path.join(distAssets, file), "utf8");
  const root = postcss.parse(css);
  const map = new Map();
  const sels = new Set();

  const contextOf = (node) => {
    const chain = [];
    for (let p = node.parent; p && p.type !== "root"; p = p.parent) {
      if (p.type === "atrule") chain.unshift(`@${p.name} ${p.params}`.replace(/\s+/g, " ").trim());
    }
    return chain.join(" >> ");
  };

  root.walkRules((rule) => {
    let inKeyframes = false;
    for (let p = rule.parent; p && p.type !== "root"; p = p.parent) {
      if (p.type === "atrule" && /keyframes$/.test(p.name)) inKeyframes = true;
    }
    if (inKeyframes) return;
    const ctx = contextOf(rule);
    for (const raw of rule.selector.split(",")) {
      const sel = raw.trim().replace(/\s+/g, " ");
      if (!sel) continue;
      sels.add(sel);
      rule.walkDecls((d) => {
        if (d.parent !== rule) return;
        const key = `${ctx}||${sel}||${d.prop.trim()}${d.important ? " !important" : ""}`;
        map.set(key, d.value.trim().replace(/\s+/g, " "));
      });
    }
  });

  decls.set(file, map);
  selectorsOf.set(file, sels);
  console.log(`${file}: ${sels.size} selectors, ${map.size} (context,selector,property) triples`);
}

console.log("\n=== A. SELECTORS DECLARED IN MORE THAN ONE CHUNK ===");
const selectorChunks = new Map();
for (const [file, sels] of selectorsOf) {
  for (const s of sels) {
    if (!selectorChunks.has(s)) selectorChunks.set(s, []);
    selectorChunks.get(s).push(file);
  }
}
const shared = [...selectorChunks].filter(([, list]) => list.length > 1).sort();
console.log(`shared selector count: ${shared.length}`);
for (const [s, list] of shared) console.log(`  ${s}   ->  ${list.join(" , ")}`);

console.log("\n=== B. VALUE DISAGREEMENTS ON A SHARED TRIPLE ===");
let conflicts = 0;
const allKeys = new Set();
for (const map of decls.values()) for (const k of map.keys()) allKeys.add(k);
for (const key of [...allKeys].sort()) {
  const present = files.filter((f) => decls.get(f).has(key));
  if (present.length < 2) continue;
  const values = new Set(present.map((f) => decls.get(f).get(key)));
  if (values.size > 1) {
    conflicts += 1;
    console.log(`  CONFLICT ${key}`);
    for (const f of present) console.log(`      ${f}: ${decls.get(f).get(key)}`);
  }
}
console.log(`value conflicts: ${conflicts}`);

console.log("\n=== C. D0 SHAPE — TRIPLE MISSING FROM A CHUNK THAT SHARES ITS SELECTOR ===");
let splits = 0;
for (const key of [...allKeys].sort()) {
  const [, sel] = key.split("||");
  const carriers = files.filter((f) => selectorsOf.get(f).has(sel));
  if (carriers.length < 2) continue;
  const have = carriers.filter((f) => decls.get(f).has(key));
  const missing = carriers.filter((f) => !decls.get(f).has(key));
  if (missing.length === 0) continue;
  splits += 1;
  console.log(`  SPLIT ${key}`);
  console.log(`      declared in: ${have.join(" , ")}`);
  console.log(`      MISSING from: ${missing.join(" , ")}`);
}
console.log(`split triples: ${splits}`);

console.log(`\nSUMMARY chunks=${files.length} sharedSelectors=${shared.length} valueConflicts=${conflicts} splitTriples=${splits}`);
