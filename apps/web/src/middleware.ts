import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Locale yönlendirmesi (örn. "/" -> "/tr"). Kaynak: docs/07.
export default createMiddleware(routing);

export const config = {
  // Tüm yolları eşle; API, statik dosyalar, dahili Next yollarını VE locale-bağımsız
  // metadata route'larını (favicon/OG/apple/manifest/robots/sitemap) hariç tut.
  // Aksi halde next-intl bu kök asset route'larını /tr/... olarak 307 yönlendirir
  // ve favicon/OG görselleri kırılır.
  matcher: [
    "/((?!api|_next|_vercel|icon|apple-icon|opengraph-image|twitter-image|manifest\\.webmanifest|sitemap\\.xml|robots\\.txt|.*\\..*).*)",
  ],
};
