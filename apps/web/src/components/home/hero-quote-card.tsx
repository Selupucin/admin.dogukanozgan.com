"use client";

// Hero hızlı teklif / YÖNLENDİRME kartı (docs/09 madde 3, docs/02).
// NOT: Gerçek teklif gönderimi ürüne özel tam form üzerinden yapılır (Server Action
// ürünün TÜM zorunlu alanlarını + KVKK rızasını doğrular). Bu kart bir LEAD/ROUTING
// kartıdır: ziyaretçi sigorta türünü seçer, ilgili ürün sayfasına yönlendirilir —
// böylece backend mantığı uydurulmadan dönüşüm akışı korunur.
// TODO(doc): İstenirse "hafif lead" için ayrı bir Server Action (backend-engineer)
// eklenebilir; şimdilik docs/02 "hızlı teklif/yönlendirme kartı" yaklaşımı.

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@do/ui";
import { useRouter } from "@/i18n/navigation";
import { getAllProducts, getLocalizedSlug } from "@do/products";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

export function HeroQuoteCard({ locale }: { locale: Locale }) {
  const t = useTranslations("heroCard");
  const router = useRouter();
  const products = getAllProducts();
  // select value = ürünün YEREL slug'ı (locale'e göre); router doğrudan kullanır.
  const [slug, setSlug] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const target = slug || getLocalizedSlug(products[0]!, locale);
    router.push({ pathname: "/planlar/[slug]", params: { slug: target } });
  }

  return (
    <div className="relative rounded-3xl border border-border bg-card p-7 shadow-[0_18px_50px_-22px_hsl(210_56%_15%/0.45)] sm:p-8">
      {/* Üst gradyan şerit (accent → teal) — docs/09 referans detayı */}
      <span
        aria-hidden
        className="absolute inset-x-6 -top-px h-1 rounded-b bg-gradient-to-r from-primary to-secondary"
      />
      <h2 className="font-heading text-2xl text-foreground">{t("title")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

      <form onSubmit={go} className="mt-6 flex flex-col gap-4">
        <div>
          <label
            htmlFor="hero-branch"
            className="mb-1.5 block text-xs font-bold text-muted-foreground"
          >
            {t("branchLabel")}
          </label>
          {/* Tema-uyumlu, erişilebilir @do/ui Select (K33) — açılır listesi de
              özelleştirilmiş, light + dark uyumlu. value = ürünün YEREL slug'ı. */}
          <Select value={slug || undefined} onValueChange={setSlug}>
            <SelectTrigger id="hero-branch">
              <SelectValue placeholder={t("branchPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.slug} value={getLocalizedSlug(p, locale)}>
                  {p.name[locale]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          type="submit"
          className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          {t("cta")}
          <ArrowRight className="h-5 w-5" aria-hidden />
        </button>
        <p className="text-center text-[0.7rem] leading-relaxed text-muted-foreground">
          {t("note")}
        </p>
      </form>
    </div>
  );
}
