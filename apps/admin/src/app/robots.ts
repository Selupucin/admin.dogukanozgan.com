import type { MetadataRoute } from "next";

// Admin domaini arama motorlarına tamamen kapalı (docs/01, docs/07).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
