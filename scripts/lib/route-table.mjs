/**
 * Loads `scripts/quality/route-table.ts` (TypeScript, imports app data
 * through the `@` alias) into Node by bundling it with esbuild — the bundler
 * Vite already ships. Shared by the prerender and the Vercel config generator.
 */
import { build } from "esbuild";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");

export async function loadRouteTable() {
  const outfile = join(tmpdir(), `mas-route-table-${process.pid}-${Date.now()}.mjs`);
  await build({
    entryPoints: [join(root, "scripts/quality/route-table.ts")],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile,
    alias: { "@": join(root, "src") },
    loader: { ".webp": "empty", ".png": "empty", ".jpg": "empty", ".svg": "empty", ".woff2": "empty", ".css": "empty" },
    logLevel: "warning",
  });
  try {
    return (await import(outfile)).buildRouteTable();
  } finally {
    rmSync(outfile, { force: true });
  }
}
