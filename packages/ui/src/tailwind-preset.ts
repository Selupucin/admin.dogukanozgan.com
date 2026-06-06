// @do/ui — paylaşılan Tailwind preset.
// Kaynak: docs/09 (renk paleti, tipografi, köşe yarıçapı).
// Her app'in tailwind.config bu preset'i `presets: [...]` ile dahil eder.
// Renkler globals.css içindeki CSS custom property'lerden okunur.

import type { Config } from "tailwindcss";

const preset: Omit<Config, "content"> = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        pill: "9999px",
      },
      fontFamily: {
        // next/font CSS değişkenlerine bağlanır (her app'te tanımlanır).
        heading: ["var(--font-heading)", "Fraunces", "Georgia", "serif"],
        body: ["var(--font-body)", "Hanken Grotesk", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default preset;
