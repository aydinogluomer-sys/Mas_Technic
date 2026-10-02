/* One loader for the STEP tessellator (occt-import-js).
 *
 * Emscripten resolves its .wasm next to the page (`/occt-import-js.wasm`)
 * unless told otherwise. Nothing is served at that path, so the SPA fallback
 * answered with index.html and every STEP preview — quote studio, customer
 * portal, admin RFQ view — failed with "expected magic word 00 61 73 6d".
 * The binary is bundled as a hashed Vite asset and its URL handed over here.
 * The module is loaded once and shared. */
let occtPromise: Promise<Awaited<ReturnType<typeof import("occt-import-js")["default"]>>> | null = null;

export function loadOcct() {
  if (!occtPromise) {
    occtPromise = Promise.all([
      import("occt-import-js"),
      import("occt-import-js/dist/occt-import-js.wasm?url"),
    ]).then(([{ default: occtimportjs }, { default: wasmUrl }]) =>
      occtimportjs({ locateFile: (path: string) => (path.endsWith(".wasm") ? wasmUrl : path) }),
    );
    occtPromise.catch(() => { occtPromise = null; });
  }
  return occtPromise;
}
