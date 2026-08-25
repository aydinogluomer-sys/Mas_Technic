import type { Config } from "tailwindcss";
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";
import tailwindcssAnimate from "tailwindcss-animate";

function addVariablesForColors({ addBase, theme }: { addBase: (styles: Record<string, Record<string, string>>) => void; theme: (path: string) => Record<string, string> }) {
  const allColors = flattenColorPalette(theme("colors"));
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val as string])
  );
  addBase({ ":root": newVars });
}

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        /* ── shadcn semantic (HSL) ── */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* ── Legacy forge (HSL) ── */
        forge: {
          obsidian: "hsl(var(--forge-obsidian))",
          gunmetal: "hsl(var(--forge-gunmetal))",
          iron: "hsl(var(--forge-iron))",
          molten: "hsl(var(--forge-molten))",
          amber: "hsl(var(--forge-amber))",
          ember: "hsl(var(--forge-ember))",
          teal: "hsl(var(--forge-teal))",
          silver: "hsl(var(--forge-silver))",
          steel: "hsl(var(--forge-steel))",
          concrete: "hsl(var(--forge-concrete))",
          workshop: "hsl(var(--forge-workshop))",
          mist: "hsl(var(--forge-mist))",
          blue: "hsl(var(--forge-blue))",
          indigo: "hsl(var(--forge-indigo))",
          navy: "hsl(var(--forge-navy))",
          violet: "hsl(var(--forge-violet))",
          ash: "hsl(var(--forge-ash))",
          cloud: "hsl(var(--forge-cloud))",
          fog: "hsl(var(--forge-fog))",
        },

        /* ── v2.0 token colors (raw var) ── */
        "heat-molten": "var(--heat-molten)",
        "heat-amber": "var(--heat-amber)",
        "heat-ember": "var(--heat-ember)",
        "heat-char": "var(--heat-char)",

        "precision-blue": "var(--precision-blue)",
        "precision-indigo": "var(--precision-indigo)",
        "precision-navy": "var(--precision-navy)",
        "precision-violet": "var(--precision-violet)",

        "mat-ash": "var(--mat-ash)",
        "mat-cloud": "var(--mat-cloud)",
        "mat-fog": "var(--mat-fog)",
        "mat-silver": "var(--mat-silver)",
        "mat-steel-blue": "var(--mat-steel-blue)",

        "accent-teal": "var(--accent-teal)",

        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundColor: {
        "cinematic-deep": "var(--bg-cinematic-deep)",
        "cinematic-mid": "var(--bg-cinematic-mid)",
        "precision-deep": "var(--bg-precision-deep)",
        "precision-mid": "var(--bg-precision-mid)",
        "dark-gunmetal": "var(--bg-dark-gunmetal)",
        "dark-obsidian": "var(--bg-dark-obsidian)",
        "light-workshop": "var(--bg-light-workshop)",
        "light-concrete": "var(--bg-light-concrete)",
        "light-mist": "var(--bg-light-mist)",
        "light-testimonial": "var(--bg-light-testimonial)",
      },
      textColor: {
        "t-primary": "var(--text-primary)",
        "t-secondary": "var(--text-secondary)",
        "t-muted": "var(--text-muted)",
        "t-hint": "var(--text-hint)",
        "t-technical": "var(--text-technical)",
        "t-vignette": "var(--text-vignette)",
        "t-inverse": "var(--text-inverse)",
        "t-inverse-secondary": "var(--text-inverse-secondary)",
        "t-inverse-muted": "var(--text-inverse-muted)",
        "t-accent-heat": "var(--text-accent-heat)",
        "t-accent-precision": "var(--text-accent-precision)",
      },
      borderColor: {
        "surface-border": "var(--surface-border)",
        "surface-border-hover": "var(--surface-border-hover)",
        "surface-border-light": "var(--surface-border-light)",
        "precision-hover": "var(--precision-hover-border)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        aurora: {
          from: { backgroundPosition: "50% 50%, 50% 50%" },
          to: { backgroundPosition: "350% 50%, 350% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        aurora: "aurora 60s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate, addVariablesForColors],
} satisfies Config;
