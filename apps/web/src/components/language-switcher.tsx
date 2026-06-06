"use client";

// Dil değiştirici (TR/EN) — docs/07. Mevcut sayfanın diğer dildeki karşılığına geçer.
//
// KÖK NEDEN (FIX 3): next-intl `pathnames` ile `usePathname()` İÇ (kanonik) ŞABLONU
// döndürür — örn. /en/plans/traffic için "/planlar/[slug]" (dikkat: [slug] segmenti
// gerçek değerle DOLDURULMAZ; literal "[slug]" gelir). Bu yüzden yolu regex ile
// parçalayıp slug'ı çıkarmak GÜVENİLMEZ; üstelik dinamik şablonu (`/planlar/[slug]`)
// `router.replace`'e params VERMEDEN string olarak vermek next-intl'de
// "Insufficient params provided for localized pathname" hatası fırlatır.
//
// DOĞRU YAKLAŞIM: kanonik şablonu `usePathname()`'den, dinamik segment DEĞERİNİ ise
// Next `useParams()`'tan al. Dinamik ürün rotalarında ([slug] = tanım,
// [slug]/teklif = teklif) hedef locale slug'ını definitions.ts üzerinden çöz ve
// HER ZAMAN { pathname, params } objesi ver. Statik yollarda kanonik şablonu doğrudan
// (StaticPathname tipiyle) ver. Dinamik şablon ASLA params'sız geçilmez.

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale, type AppPathname, type StaticPathname } from "@/i18n/routing";
import { getProductByLocalizedSlug } from "@do/products";
import { Globe } from "lucide-react";
import { cn } from "@do/ui";

// Dinamik (param alan) kanonik ürün rotaları — params olmadan ASLA geçilemez.
const DYNAMIC_PRODUCT_PATHS = [
  "/planlar/[slug]",
  "/planlar/[slug]/teklif",
] as const satisfies readonly AppPathname[];

type DynamicProductPath = (typeof DYNAMIC_PRODUCT_PATHS)[number];

function isDynamicProductPath(p: string): p is DynamicProductPath {
  return (DYNAMIC_PRODUCT_PATHS as readonly string[]).includes(p);
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  // usePathname() → KANONİK şablon (örn. "/planlar/[slug]"); locale prefix'siz.
  const pathname = usePathname();
  // useParams() → dinamik segmentin GERÇEK değeri (aktif locale'in yerel slug'ı).
  const params = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      // Ürün rotaları: slug DEĞERİ de çevrilmeli (örn. trafik ↔ traffic).
      // Slug değeri useParams()'tan (kanonik şablonda [slug] literal kalır).
      if (isDynamicProductPath(pathname)) {
        const rawSlug = params.slug;
        const currentSlug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
        const product = currentSlug ? getProductByLocalizedSlug(locale, currentSlug) : undefined;
        if (product) {
          // Dinamik şablon HER ZAMAN params ile verilir → hata fırlamaz.
          router.replace({ pathname, params: { slug: product.slugs[next] } }, { locale: next });
          return;
        }
        // Ürün çözülemezse (beklenmez) ürün listesine düş — params'sız dinamik
        // yola ASLA gitme.
        router.replace("/planlar", { locale: next });
        return;
      }

      // Statik sayfalar: kanonik şablon güvenli (param almaz). pathname zaten
      // kanonik; dinamik olmadığını yukarıda elediğimiz için StaticPathname.
      router.replace(pathname as StaticPathname, { locale: next });
    });
  }

  return (
    <div
      className="inline-flex items-center rounded-full border border-border p-0.5"
      role="group"
      aria-label="Language"
    >
      <Globe className="ml-2 mr-1 h-4 w-4 text-muted-foreground" aria-hidden />
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={l === locale}
          disabled={isPending}
          onClick={() => switchTo(l)}
          className={cn(
            "rounded-full px-2.5 py-1 text-sm font-semibold uppercase transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            l === locale
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
