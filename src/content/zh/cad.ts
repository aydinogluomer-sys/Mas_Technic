import { CAD_UPLOAD_EXTENSIONS } from "@/content/claims";

/* The uploader's extensions in Chinese prose, derived from the published list
   so a change to `CAD_ACCEPTED_EXTENSIONS` reaches the Chinese pages too
   (`CAD_UPLOAD_FORMATS` itself is joined with the Turkish “ve”). */
const formats = CAD_UPLOAD_EXTENSIONS.split(", ").map((ext) => ext.slice(1).toUpperCase());

/** `"STEP、STP、STL、OBJ、IGES、IGS 和 3MF"`. */
export const CAD_UPLOAD_FORMATS_ZH = `${formats.slice(0, -1).join("、")} 和 ${formats[formats.length - 1]}`;
export { CAD_UPLOAD_EXTENSIONS };
