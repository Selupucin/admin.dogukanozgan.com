// Web App Manifest (docs/07 performans/SEO — kurumsal kimlik tutarlılığı).
// İkon /icon route'undan (DÖ wordmark) gelir. Tema renkleri docs/09 paletinden.

import type { MetadataRoute } from "next";
import { brandName } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brandName} — Sigorta Danışmanlığı`,
    short_name: brandName,
    description:
      "20+ sigorta şirketini karşılaştıran bağımsız acente. Trafik, sağlık, BES, konut, hayat sigortası teklifi.",
    start_url: "/tr",
    display: "standalone",
    background_color: "#f7f2e9",
    theme_color: "#10243a",
    lang: "tr",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
