/** QA 09a-R5 — registers `p09a5-sabotage-hooks.mjs`. P09A5_MUTATION selects the sabotage. */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register(new URL("./p09a5-sabotage-hooks.mjs", import.meta.url), pathToFileURL("./"), {
  data: { mutation: process.env.P09A5_MUTATION ?? "none" },
});
