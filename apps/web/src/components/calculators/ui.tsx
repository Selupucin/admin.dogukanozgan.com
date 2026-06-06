"use client";

// Hesaplayıcı ORTAK UI parçaları (kart kabuğu, sonuç kutusu, "Tahmini" uyarısı,
// girdi sarmalayıcıları). docs/09 stili: yuvarlak kart, teal/turuncu aksanlar,
// yumuşak gölge, teal focus ring, dokunma hedefi ≥44px.
//
// "Tahmini değerdir" uyarısı (EstimateNotice) docs/03 gereği ZORUNLU'dur ve her
// hesaplayıcı sonucunun yanında gösterilir.

import { useTranslations } from "next-intl";
import { Calculator, Info } from "lucide-react";
import { cn } from "@do/ui";
import type { Locale } from "@/components/auto-form/types-bridge";

/** Hesaplayıcı kart kabuğu — başlık + ikon + giriş metni + içerik. */
export function CalculatorShell({
  titleKey,
  introKey,
  children,
}: {
  titleKey: string;
  introKey: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("calculator");
  return (
    <section
      aria-labelledby="calculator-heading"
      className="rounded-[var(--radius)] border border-secondary/30 bg-accent/60 p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Calculator className="h-5 w-5" aria-hidden />
        </span>
        <h2 id="calculator-heading" className="font-heading text-2xl text-foreground">
          {t(titleKey)}
        </h2>
      </div>
      <p className="mt-3 text-sm text-accent-foreground/80">{t(introKey)}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Etiketli sayısal/aralıklı girdi sarmalayıcısı. */
export function InputRow({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export const numberInputClass = cn(
  "w-full rounded-xl border border-input bg-card px-4 py-2.5 text-foreground",
  "placeholder:text-muted-foreground/70",
  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background",
  "transition-shadow",
);

/** Tek bir vurgulu sonuç satırı (büyük rakam). */
export function ResultStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "teal" | "orange";
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 font-heading text-xl font-semibold tabular-nums sm:text-2xl",
          accent === "orange" && "text-primary",
          accent === "teal" && "text-secondary",
          !accent && "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

/**
 * docs/03 ZORUNLU "Tahmini değerdir" uyarısı.
 * Sonucun hemen yanında, görsel olarak BELİRGİN (çerçeveli) gösterilir.
 */
export function EstimateNotice() {
  const t = useTranslations("calculator");
  return (
    <p
      role="note"
      className="mt-5 flex items-start gap-2 rounded-xl border border-secondary/40 bg-secondary/10 p-3 text-xs text-accent-foreground/90"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
      <span>
        <strong className="font-semibold text-foreground">{t("estimateNoticeStrong")}</strong>{" "}
        {t("estimateNotice")}
      </span>
    </p>
  );
}

/** TL para biçimi (yer tutucu sonuçlar için). */
export function formatTRY(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

/** "min – max TL" aralık biçimi. */
export function formatRangeTRY(min: number, max: number, locale: Locale): string {
  return `${formatTRY(min, locale)} – ${formatTRY(max, locale)}`;
}
