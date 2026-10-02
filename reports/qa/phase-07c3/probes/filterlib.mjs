/* QA round 3 — lift WITHHELD_SPEC_CLASSES / PUBLISHABLE_SPEC_CLASSES and
   isPublishableSpec out of any revision of src/content/claims.ts.
   The two arrays are plain regex-literal lists and the predicate is four
   lines, so the lift is exact rather than a re-implementation: the array
   bodies are taken verbatim and evaluated.
   usage: buildFilter(sourceText) -> { isPublishable, withheld[], publishable[] } */
function arrayBody(src, name) {
  const start = src.indexOf(`const ${name}`);
  if (start < 0) throw new Error("missing " + name);
  // NOT indexOf("[") — the type annotation `: readonly RegExp[] =` carries an
  // empty bracket pair that would close at depth 0 and yield an empty array.
  // That is exactly the failure this probe returned on its first run.
  const eq = src.indexOf("=", src.indexOf("readonly", start) >= 0 ? src.indexOf("readonly", start) : start);
  const open = src.indexOf("[", eq);
  let depth = 0, i = open, inLine = false, inBlock = false, inStr = null;
  for (; i < src.length; i++) {
    const c = src[i], d = src[i + 1];
    if (inLine) { if (c === "\n") inLine = false; continue; }
    if (inBlock) { if (c === "*" && d === "/") { inBlock = false; i++; } continue; }
    if (inStr) { if (c === "\\") { i++; continue; } if (c === inStr) inStr = null; continue; }
    if (c === "/" && d === "/") { inLine = true; i++; continue; }
    if (c === "/" && d === "*") { inBlock = true; i++; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "/") { // regex literal: skip to its unescaped closing slash
      let k = i + 1, cls = false;
      for (; k < src.length; k++) {
        if (src[k] === "\\") { k++; continue; }
        if (src[k] === "[") cls = true;
        else if (src[k] === "]") cls = false;
        else if (src[k] === "/" && !cls) break;
      }
      i = k; continue;
    }
    if (c === "[") depth++;
    else if (c === "]") { depth--; if (depth === 0) break; }
  }
  return src.slice(open, i + 1);
}
export function buildFilter(src) {
  const w = arrayBody(src, "WITHHELD_SPEC_CLASSES");
  const p = arrayBody(src, "PUBLISHABLE_SPEC_CLASSES");
  const withheld = eval(w);
  const publishable = eval(p);
  const isPublishable = (spec) => {
    const subject = `${spec.label} ${spec.value}`;
    if (withheld.some((r) => r.test(subject))) return false;
    return publishable.some((r) => r.test(spec.value));
  };
  return { isPublishable, withheld, publishable };
}
