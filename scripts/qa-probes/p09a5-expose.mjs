/**
 * QA 09a-R5 — registers `p09a5-expose-hooks.mjs`. See that file for why.
 * Usage: node --import=./scripts/qa-probes/p09a5-expose.mjs <probe>
 */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register(new URL("./p09a5-expose-hooks.mjs", import.meta.url), pathToFileURL("./"));
