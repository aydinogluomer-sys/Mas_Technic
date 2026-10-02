/* QA-owned independent IA reachability audit. Does NOT reuse the Coder's spec logic. */
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const app = readFileSync("src/App.tsx", "utf8");
// Independent: take EVERY <Route path="..."> in the file, then subtract the panel tree explicitly.
const allRoutes = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map(m => m[1]);
const panelBlock = app.slice(app.indexOf("const panelRoutes ="), app.indexOf("const publicRoutes ="));
const panelRoutes = [...panelBlock.matchAll(/<Route\s+path="([^"]+)"/g)].map(m => m[1]);
const publicBlock = app.slice(app.indexOf("const publicRoutes ="), app.indexOf("return isPanel"));
const publicRoutes = [...publicBlock.matchAll(/<Route\s+path="([^"]+)"/g)].map(m => m[1]);
console.log("ALL_ROUTE_DECLS", allRoutes.length);
console.log("PANEL", JSON.stringify(panelRoutes));
console.log("PUBLIC", publicRoutes.length, JSON.stringify(publicRoutes));

// Data-driven concrete slugs, read straight from source with regex (independent of TS import).
function slugs(file, filter) {
  const src = readFileSync(file, "utf8");
  return src;
}
