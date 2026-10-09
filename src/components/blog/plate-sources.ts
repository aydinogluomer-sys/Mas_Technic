import { responsive, type ResponsiveImage } from "@/components/BlurImage";
import blog5eksen from "@/assets/blog-5eksen.webp";
import blog5eksen640 from "@/assets/blog-5eksen-640.webp";
import blog5eksen960 from "@/assets/blog-5eksen-960.webp";
import blogMalzeme from "@/assets/blog-malzeme.webp";
import blogMalzeme640 from "@/assets/blog-malzeme-640.webp";
import blogMalzeme960 from "@/assets/blog-malzeme-960.webp";
import blogDfm from "@/assets/blog-dfm.webp";
import blogDfm640 from "@/assets/blog-dfm-640.webp";
import blogDfm960 from "@/assets/blog-dfm-960.webp";
import heroCncFrezeleme from "@/assets/hero-cnc-frezeleme.webp";
import heroCncFrezeleme640 from "@/assets/hero-cnc-frezeleme-640.webp";
import heroCncFrezeleme960 from "@/assets/hero-cnc-frezeleme-960.webp";
import qualityControl from "@/assets/quality-control.webp";
import qualityControl640 from "@/assets/quality-control-640.webp";
import qualityControl960 from "@/assets/quality-control-960.webp";
import heroYuzeyIslemleri from "@/assets/hero-yuzey-islemleri.webp";
import heroYuzeyIslemleri640 from "@/assets/hero-yuzey-islemleri-640.webp";
import heroYuzeyIslemleri960 from "@/assets/hero-yuzey-islemleri-960.webp";

/* The corpus (`blogData.ts`) stores a bundled URL per post; this map adds the
   asset's intrinsic size and its 640/960 ladder (`scripts/assets/make-derivatives.mjs`),
   keyed by that same URL — Vite resolves one asset to one URL, so the key is
   the import. A post whose image is not listed here renders without a ladder
   or a reserved box; add it when the corpus changes. */
export const plateSources = new Map<string, ResponsiveImage>([
  [blog5eksen, responsive(1600, 896, blog5eksen, [blog5eksen640, 640], [blog5eksen960, 960])],
  [blogMalzeme, responsive(1600, 896, blogMalzeme, [blogMalzeme640, 640], [blogMalzeme960, 960])],
  [blogDfm, responsive(1600, 896, blogDfm, [blogDfm640, 640], [blogDfm960, 960])],
  /* 10-2b: `service-cnc-freze` (blue-tinted stock, 800px) fails the campaign's
     graphite mood; the torna/freze post opens on the spindle-and-coolant hero
     its own alt text describes. */
  [heroCncFrezeleme, responsive(1600, 896, heroCncFrezeleme, [heroCncFrezeleme640, 640], [heroCncFrezeleme960, 960])],
  [qualityControl, responsive(1600, 682, qualityControl, [qualityControl640, 640], [qualityControl960, 960])],
  /* 10-2b: the surface-treatment guide no longer opens on `cnc-workshop` (a wide
     machine hall — a facility implication `USER_INPUTS.md` §I forbids, and a
     picture its own caption "dört farklı yüzey bitişi" did not describe); it
     opens on the bead-blasted / brushed macro the caption is about. */
  [heroYuzeyIslemleri, responsive(1600, 896, heroYuzeyIslemleri, [heroYuzeyIslemleri640, 640], [heroYuzeyIslemleri960, 960])],
]);

/* `.shell-plate-frame` image box (`src/styles/shell.css`): `clamp(200px, 33vw,
   420px)` + 120px parallax overscan - 2px border. The image is `object-fit:
   cover`, so the browser needs max(width, height x aspect) of source — see
   `coverSizes` and `reports/10/responsive-images.md`. */
export const PLATE_IMAGE_HEIGHT = "clamp(200px, 33vw, 420px) + 118px";
