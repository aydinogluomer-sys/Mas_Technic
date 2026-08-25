# Menu polish reference lock

These shallow, blob-filtered working trees are research-only. The clones are excluded from source control, dependency resolution, production imports, and the application bundle. The application may independently use published npm packages such as Framer Motion, GSAP, and Lenis. No source, asset, or font was copied from these clones.

| Repository | Locked commit | License | Use |
| --- | --- | --- | --- |
| codrops/EaseReverseClipMenu | `7fcd5f349380a4702d53d876e25db4e197839c4f` | MIT (`LICENSE`) | Reverse easing and clip choreography study |
| motiondivision/motion | `5e6eaa12243f44560b41069016aa8a3ba1ada2ac` | MIT (`LICENSE.md`) | Official Framer Motion behavior reference |
| greensock/GSAP | `13e2b790546426a1a2e0e9b409f3f8dc6d6611f2` | [GSAP Standard no-charge license](https://gsap.com/standard-license/) (package metadata, checked 2026-07-26) | Timeline/cancellation study only; no code copied |
| darkroomengineering/lenis | `2a6573775ac7883bd0606963bad04f47ee7eeeba` | MIT (`LICENSE`) | Scroll-lock interaction study |
| w3c/aria-practices | `7e4034b262bc0d25332e330d8a582aaf34113829` | W3C Software and Document License (`LICENSE.md`) | Dialog and keyboard normative reference |

Clone command contract:

```text
git clone --depth 1 --filter=blob:none <repository> .references/menu-polish/<name>
```
