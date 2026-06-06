"use client";

// Hayat Sigortası Prim Tahmini — etkileşimli (girdi → anlık aralık).
// Mantık: @do/products/calculators (saf fonksiyon + constants.ts katsayıları).
// docs/03: yaş / teminat / süre / sigara → kaba prim; "Tahmini" uyarısı ZORUNLU.

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { calculateHayat, HAYAT } from "@do/products/calculators";
import type { Locale } from "@/components/auto-form/types-bridge";
import {
  CalculatorShell,
  InputRow,
  ResultStat,
  EstimateNotice,
  numberInputClass,
  formatRangeTRY,
} from "./ui";

export function HayatCalculator({
  locale,
  onUseValues,
}: {
  locale: Locale;
  /** Forma aktarılacak değerler (definitions.ts alan adlarıyla eşleşir). */
  onUseValues?: (values: Record<string, unknown>) => void;
}) {
  const t = useTranslations("calculator");
  const [age, setAge] = useState<number>(HAYAT.defaultAge);
  const [coverage, setCoverage] = useState<number>(HAYAT.defaultCoverage);
  const [years, setYears] = useState<number>(HAYAT.defaultYears);
  const [smoker, setSmoker] = useState(false);

  const result = useMemo(
    () => calculateHayat({ age, coverageAmount: coverage, years, smoker }),
    [age, coverage, years, smoker],
  );

  return (
    <CalculatorShell titleKey="hayat.title" introKey="hayat.intro">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InputRow id="hayat-age" label={t("hayat.age")}>
          <input
            id="hayat-age"
            type="number"
            inputMode="numeric"
            min={HAYAT.minAge}
            max={HAYAT.maxAge}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className={numberInputClass}
          />
        </InputRow>
        <InputRow id="hayat-coverage" label={t("hayat.coverage")}>
          <input
            id="hayat-coverage"
            type="number"
            inputMode="numeric"
            min={HAYAT.minCoverage}
            max={HAYAT.maxCoverage}
            step={50000}
            value={coverage}
            onChange={(e) => setCoverage(Number(e.target.value))}
            className={numberInputClass}
          />
        </InputRow>
        <InputRow id="hayat-years" label={t("hayat.years")}>
          <input
            id="hayat-years"
            type="number"
            inputMode="numeric"
            min={HAYAT.minYears}
            max={HAYAT.maxYears}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className={numberInputClass}
          />
        </InputRow>
      </div>

      <label className="mt-4 flex items-center gap-3 py-1">
        <input
          type="checkbox"
          checked={smoker}
          onChange={(e) => setSmoker(e.target.checked)}
          className="h-5 w-5 shrink-0 rounded-md border-input text-primary focus:ring-2 focus:ring-ring"
        />
        <span className="text-sm text-foreground">{t("hayat.smoker")}</span>
      </label>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ResultStat
          label={t("hayat.resultMonthly")}
          value={formatRangeTRY(result.monthlyMin, result.monthlyMax, locale)}
          accent="orange"
        />
        <ResultStat
          label={t("hayat.resultAnnual")}
          value={formatRangeTRY(result.annualMin, result.annualMax, locale)}
          accent="teal"
        />
      </div>

      <EstimateNotice />

      {onUseValues && (
        <button
          type="button"
          onClick={() => onUseValues({ teminatTutari: coverage, sure: years, sigara: smoker })}
          className="mt-4 rounded-pill bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:bg-destructive"
        >
          {t("useInForm")}
        </button>
      )}
    </CalculatorShell>
  );
}
