"use client";

// CalculatorSection — TANIM sayfasında gösterilen hesaplayıcı (form YOK).
// docs/02/03 ayrımı: tanım sayfasında hesaplayıcı kalır; "bu değerlerle teklif al"
// butonu ziyaretçiyi TEKLİF sayfasına (/planlar/[slug]/teklif) götürür ve hesaplayıcı
// değerlerini query string ile ön-doldurur (opsiyonel kolaylık).

import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/components/auto-form/types-bridge";
import { BesCalculator } from "./bes-calculator";
import { SaglikCalculator } from "./saglik-calculator";
import { HayatCalculator } from "./hayat-calculator";

type CalculatorKind = "bes" | "saglik" | "hayat";

export function CalculatorSection({
  kind,
  locale,
  slug,
}: {
  kind: CalculatorKind;
  locale: Locale;
  /** Teklif sayfası için YEREL slug (locale'e göre). */
  slug: string;
}) {
  const router = useRouter();

  // "Bu değerlerle teklif al": değerleri query'ye koyup teklif sayfasına git.
  // Değerler definitions.ts alan adlarıyla eşleşir; teklif sayfası bunları
  // AutoForm defaultValues'a aktarır.
  function goToQuote(values: Record<string, unknown>) {
    const query: Record<string, string> = {};
    for (const [k, v] of Object.entries(values)) {
      if (v === undefined || v === null) continue;
      query[k] = typeof v === "boolean" ? (v ? "true" : "false") : String(v);
    }
    router.push({
      pathname: "/planlar/[slug]/teklif",
      params: { slug },
      query,
    });
  }

  return (
    <>
      {kind === "bes" && <BesCalculator locale={locale} onUseValues={goToQuote} />}
      {kind === "saglik" && <SaglikCalculator locale={locale} onUseValues={goToQuote} />}
      {kind === "hayat" && <HayatCalculator locale={locale} onUseValues={goToQuote} />}
    </>
  );
}
