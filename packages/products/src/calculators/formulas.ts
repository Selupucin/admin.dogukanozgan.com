// @do/products/calculators — SAF HESAPLAMA FONKSİYONLARI (BES, Sağlık, Hayat).
// Kaynak: docs/03 "Hesaplayıcılar", docs/08 Aşama 4.
//
// ⚠️ Bu dosyadaki formüller YER TUTUCU'dur. Tüm sayısal katsayı/oran/limitler
// constants.ts'tedir; gerçek değerler Doğukan'dan gelince YALNIZCA constants.ts
// güncellenir, bu fonksiyonlar değişmeden kalır (docs/08: "tek yerden değişecek").
//
// Fonksiyonlar SAF'tır: yan etki yok, React/DOM bağımlılığı yok → kolay test edilir
// ve hem client bileşeni hem ileride sunucu/SEO tarafında kullanılabilir.
//
// Çıktılar TAHMİNİ'dir; sonuç ekranlarında docs/03 gereği "Tahmini değerdir, kesin
// teklif için form doldurun" uyarısı ZORUNLU gösterilir.

import { BES, SAGLIK, HAYAT } from "./constants";

/** Negatif/NaN'ı 0'a sabitleyen güvenli yardımcı. */
function safe(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Bir değeri [min, max] aralığına sıkıştırır. */
function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

// ─────────────────────────────────────────────────────────────────────────────
// BES — Birikim Hesaplayıcı (devlet katkısı dahil)
// docs/03:
//   toplamKatki   = aylikKatki * 12 * yil
//   devletKatkisi = toplamKatki * 0.30   (yıllık üst sınırlı)
//   tahminiBirikim = bileşikGetiri(aylikKatki * 1.30, aylikOran, ay)
// ─────────────────────────────────────────────────────────────────────────────

export interface BesInput {
  /** Aylık katkı payı (TL). */
  monthlyContribution: number;
  /** Süre (yıl). */
  years: number;
  /** Tahmini yıllık getiri oranı (ondalık, ör. 0.30 = %30). Verilmezse varsayılan. */
  annualReturnRate?: number;
}

export interface BesResult {
  /** Toplam yatırılan ana para (devlet katkısı hariç). */
  totalContributions: number;
  /** Eklenen toplam devlet katkısı (üst sınır uygulanmış). */
  stateContribution: number;
  /** Tahmini toplam birikim (katkı + devlet katkısı + bileşik getiri). */
  estimatedTotal: number;
}

/**
 * BES birikim tahmini. YER TUTUCU formül (katsayılar constants.BES).
 * Bileşik getiri aylık bazda uygulanır; her ay (katkı + devlet katkısı payı) yatırılıp
 * kalan ay sayısı kadar büyütülür (annuity mantığı, basitleştirilmiş).
 */
export function calculateBes(input: BesInput): BesResult {
  const monthly = safe(input.monthlyContribution);
  const years = safe(input.years);
  const annualReturn = clamp(
    input.annualReturnRate ?? BES.defaultAnnualReturnRate,
    BES.minAnnualReturnRate,
    BES.maxAnnualReturnRate,
  );

  const months = Math.round(years * 12);
  const monthlyRate = annualReturn / 12;

  const totalContributions = monthly * 12 * years;

  // Devlet katkısı: toplam katkının %30'u, ancak YILLIK üst sınıra tabi.
  const rawAnnualState = monthly * 12 * BES.stateContributionRate;
  const cappedAnnualState = Math.min(rawAnnualState, BES.annualStateContributionCap);
  const stateContribution = cappedAnnualState * years;

  // Aylık yatırılan toplam = aylık katkı + (aylık devlet katkısı payı).
  const monthlyState = years > 0 ? stateContribution / months : 0;
  const monthlyDeposit = monthly + monthlyState;

  // Bileşik büyüme (aylık annuity gelecek değeri).
  let estimatedTotal: number;
  if (monthlyRate === 0) {
    estimatedTotal = monthlyDeposit * months;
  } else {
    estimatedTotal = monthlyDeposit * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  }

  return {
    totalContributions: Math.round(totalContributions),
    stateContribution: Math.round(stateContribution),
    estimatedTotal: Math.round(estimatedTotal),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SAĞLIK — Prim tahmin aralığı
// docs/03: yaş / cinsiyet / SGK (TSS/Özel) / kapsam (bireysel/aile) → kaba aralık.
// ─────────────────────────────────────────────────────────────────────────────

export interface SaglikInput {
  /** Yaş. */
  age: number;
  /** SGK'lı mı? true → TSS (tamamlayıcı, daha ucuz), false → Özel. */
  hasSgk: boolean;
  /** Kapsam. */
  coverage: "bireysel" | "aile";
  /** Aile ise kişi sayısı (kendisi dahil). bireysel ise yok sayılır. */
  peopleCount?: number;
}

export interface PremiumRange {
  /** Tahmini aylık prim — alt sınır (TL). */
  monthlyMin: number;
  /** Tahmini aylık prim — üst sınır (TL). */
  monthlyMax: number;
  /** Tahmini yıllık prim — alt sınır (TL). */
  annualMin: number;
  /** Tahmini yıllık prim — üst sınır (TL). */
  annualMax: number;
}

/**
 * Sağlık primi kaba aylık ARALIK tahmini. YER TUTUCU (katsayılar constants.SAGLIK).
 */
export function calculateSaglik(input: SaglikInput): PremiumRange {
  const age = clamp(safe(input.age), SAGLIK.minAge, SAGLIK.maxAge);

  let base = SAGLIK.basePremiumMonthly;

  // Yaş yüklemesi (18 üstü her yıl).
  const yearsOver18 = Math.max(0, age - 18);
  base *= 1 + yearsOver18 * SAGLIK.perYearOver18Factor;

  // TSS (SGK'lı) indirimi.
  if (input.hasSgk) base *= SAGLIK.tssDiscountFactor;

  // Aile kapsamı: ek kişiler.
  if (input.coverage === "aile") {
    const people = clamp(safe(input.peopleCount ?? 2), 2, SAGLIK.maxPeople);
    const extras = people - 1; // 1 kişi taban, kalanlar ek
    base *= 1 + extras * SAGLIK.perExtraPersonFactor;
  }

  return buildRange(base, SAGLIK.rangeSpread);
}

// ─────────────────────────────────────────────────────────────────────────────
// HAYAT — Prim tahmini
// docs/03: yaş / teminat tutarı / süre (yıl) / sigara → kaba prim tahmini.
// ─────────────────────────────────────────────────────────────────────────────

export interface HayatInput {
  /** Yaş. */
  age: number;
  /** İstenen teminat tutarı (TL). */
  coverageAmount: number;
  /** Süre (yıl). */
  years: number;
  /** Sigara kullanıyor mu? */
  smoker?: boolean;
}

/**
 * Hayat sigortası primi kaba ARALIK tahmini. YER TUTUCU (katsayılar constants.HAYAT).
 */
export function calculateHayat(input: HayatInput): PremiumRange {
  const age = clamp(safe(input.age), HAYAT.minAge, HAYAT.maxAge);
  const coverage = clamp(safe(input.coverageAmount), HAYAT.minCoverage, HAYAT.maxCoverage);
  const years = clamp(safe(input.years), HAYAT.minYears, HAYAT.maxYears);

  // Yıllık taban prim = teminat × oran.
  let annual = coverage * HAYAT.annualRatePerCoverage;

  // Yaş yüklemesi (referans yaş üstü).
  const yearsOverRef = Math.max(0, age - HAYAT.referenceAge);
  annual *= 1 + yearsOverRef * HAYAT.perYearOverReferenceFactor;

  // Sigara yüklemesi.
  if (input.smoker) annual *= HAYAT.smokerFactor;

  // Süreye bağlı küçük indirim (sınırlı).
  const termDiscount = Math.min(years * HAYAT.perYearTermDiscount, HAYAT.maxTermDiscount);
  annual *= 1 - termDiscount;

  const monthly = annual / 12;
  return buildRange(monthly, HAYAT.rangeSpread);
}

// ─────────────────────────────────────────────────────────────────────────────
// Ortak: tek bir aylık tahminden ± aralık üretir ve yuvarlar.
// ─────────────────────────────────────────────────────────────────────────────
function buildRange(monthlyMid: number, spread: number): PremiumRange {
  const monthlyMin = Math.round(monthlyMid * (1 - spread));
  const monthlyMax = Math.round(monthlyMid * (1 + spread));
  return {
    monthlyMin,
    monthlyMax,
    annualMin: monthlyMin * 12,
    annualMax: monthlyMax * 12,
  };
}

// NOT (Konut/DASK): docs/03 opsiyonel → bu aşamada ATLANDI.
// TODO(doc): İstenirse calculateKonut(input) saf fonksiyonu buraya eklenecek.
