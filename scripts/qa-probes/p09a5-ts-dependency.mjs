/** QA 09a-R5 — registers the `typescript`-hiding resolve hook. See the hooks file. */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register(new URL("./p09a5-ts-dependency-hooks.mjs", import.meta.url), pathToFileURL("./"));
