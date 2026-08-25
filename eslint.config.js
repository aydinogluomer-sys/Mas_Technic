import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      ".references/**",
      ".agents/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "tmp/**",
      "supabase/**",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      "no-restricted-syntax": [
        "warn",
        {
          // getCSSVar("--token", "#fallback") zaten doğru pattern — token okunamazsa
          // devreye giren fallback'i hardcoded renk sayma.
          selector:
            "Literal[value=/(#[0-9a-fA-F]{3,8}\\b|rgba?\\(\\s*\\d+|hsla?\\(\\s*\\d+)/]:not(CallExpression[callee.name=/^getCSSVar(HSL)?$/] > Literal)",
          message:
            "Hardcoded color tespit edildi. CSS token kullan: var(--heat-molten) veya alpha('heatMolten', 0.25).",
        },
        {
          selector:
            "TemplateElement[value.raw=/(#[0-9a-fA-F]{3,8}\\b|rgba?\\(\\s*\\d+|hsla?\\(\\s*\\d+)/]",
          message:
            "Template literal içinde hardcoded color. CSS token kullan.",
        },
        {
          selector: "Property[key.name='zIndex'] > Literal[value=/^[0-9]+$/]",
          message:
            "Numeric zIndex literal yasak. SECTION_Z[<key>] kullan.",
        },
      ],
    },
  },
  {
    files: [
      "src/lib/tokens.ts",
      // Token çözücünün kendisi: imzasındaki default fallback ve JSDoc örnekleri
      // tanım gereği ham renk içerir.
      "src/utils/cssVar.ts",
      "**/*.stories.*",
      "**/*.test.*",
      "e2e/**",
      "tailwind.config.ts",
      "vite.config.ts",
    ],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    // shadcn/ui vendored bileşenleri. cva variant export'ları (buttonVariants,
    // badgeVariants…) ve chart renk yardımcıları üretilen koddan geliyor;
    // dosyaları bölmek upstream ile farkı büyütür, HMR dışında etkisi yok.
    files: ["src/components/ui/**/*.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  {
    files: ["src/components/ui/chart.tsx"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    // Legacy back-office integrations predate the typed public-site surface.
    // Keep their existing API boundary explicit without weakening new public code.
    //
    // Renk kuralı da burada kapalı: back-office ekranları recharts tabanlı veri
    // görselleştirme kullanıyor ve kategorik seri paleti (cyan/emerald/red…) ile
    // tema-duyarlı grafik renkleri literal değer olmak zorunda. Public site'ın
    // forge/endüstriyel token dili bu bağlamda anlamsal olarak uygun değil.
    files: [
      "src/components/admin/**/*.{ts,tsx}",
      "src/components/musteri/**/*.{ts,tsx}",
      "src/pages/AdminDashboard.tsx",
      "src/pages/CADDashboard.tsx",
      "src/pages/MusteriPaneli.tsx",
      "src/utils/excelExport.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-restricted-syntax": "off",
      "react-refresh/only-export-components": "off",
    },
  },
);
