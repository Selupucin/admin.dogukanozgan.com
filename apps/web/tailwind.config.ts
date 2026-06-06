import type { Config } from "tailwindcss";
import preset from "@do/ui/tailwind-preset";

const config: Config = {
  presets: [preset],
  content: [
    "./src/**/*.{ts,tsx}",
    // Paylaşılan UI paketindeki sınıflar da taranır.
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};

export default config;
