/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISABLE_LENIS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
