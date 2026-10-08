import { CAD_UPLOAD_EXTENSIONS } from "@/content/claims";

/* The uploader's extensions in German prose, derived from the published list
   so a change to `CAD_ACCEPTED_EXTENSIONS` reaches the German pages too
   (`CAD_UPLOAD_FORMATS` itself is joined with the Turkish “ve”). */
const formats = CAD_UPLOAD_EXTENSIONS.split(", ").map((ext) => ext.slice(1).toUpperCase());

/** `"STEP, STP, STL, OBJ, IGES, IGS und 3MF"`. */
export const CAD_UPLOAD_FORMATS_DE = `${formats.slice(0, -1).join(", ")} und ${formats[formats.length - 1]}`;
export { CAD_UPLOAD_EXTENSIONS };
