// @do/products/calculators — HESAPLAYICI SABİTLERİ (TEK DEĞİŞİM NOKTASI).
// Kaynak: docs/03 "Hesaplayıcılar", docs/08 Aşama 4.
//
// ⚠️⚠️ YER TUTUCU FORMÜL KATSAYILARI ⚠️⚠️
// Aşağıdaki tüm sayısal değerler YAKLAŞIK / TAHMİNİ'dir ve gerçek mevzuat / tarife
// DEĞİLDİR. Gerçek katsayı, oran ve limitler Doğukan'dan gelince YALNIZCA BU DOSYA
// güncellenecek; hesaplama fonksiyonları (formulas.ts) değişmeden kalacak şekilde
// tasarlandı. Her değer // TODO(doc): ile işaretlidir.
//
// Sonuç ekranlarında docs/03 gereği "Tahmini değerdir" uyarısı ZORUNLU gösterilir.

// ─────────────────────────────────────────────────────────────────────────────
// BES — Bireysel Emeklilik Birikim Hesaplayıcı sabitleri
// docs/03: "%30 devlet katkısı" + bileşik getiri.
// ─────────────────────────────────────────────────────────────────────────────
export const BES = {
  /** Devlet katkısı oranı. docs/03: %30. */
  // TODO(doc): Güncel mevzuata göre teyit edilecek (oran değişebilir).
  stateContributionRate: 0.3,

  /**
   * Devlet katkısı yıllık üst sınırı (TL). Gerçek limit yıllık brüt asgari ücrete
   * endekslidir ve her yıl güncellenir → yer tutucu sabit.
   */
  // TODO(doc): Güncel yıllık devlet katkısı üst sınırı (asgari ücrete endeksli) girilecek.
  annualStateContributionCap: 45000,

  /** Hesaplayıcıda varsayılan tahmini yıllık getiri oranı (%). Kullanıcı değiştirebilir. */
  // TODO(doc): Gerçekçi varsayılan getiri beklentisi netleşecek.
  defaultAnnualReturnRate: 0.3,

  /** Getiri oranı slider/girdi sınırları (%). */
  minAnnualReturnRate: 0,
  maxAnnualReturnRate: 1.0,

  /** Süre (yıl) girdi sınırları. */
  minYears: 1,
  maxYears: 40,
  defaultYears: 10,

  /** Aylık katkı girdi sınırları (TL). */
  minMonthly: 100,
  maxMonthly: 1_000_000,
  defaultMonthly: 1500,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SAĞLIK — Prim tahmin hesaplayıcısı sabitleri
// docs/03: yaş / cinsiyet / SGK (TSS/Özel) / kapsam (bireysel/aile) → kaba aylık aralık.
// ─────────────────────────────────────────────────────────────────────────────
export const SAGLIK = {
  /** Kaba aylık taban prim (TL) — tahmini. */
  // TODO(doc): Gerçek taban prim ve tüm katsayılar Doğukan'dan / tarifeden gelecek.
  basePremiumMonthly: 600,

  /** Yaşa göre çarpan. Yaş arttıkça prim artar (basit lineer yer tutucu). */
  // TODO(doc): Gerçek yaş-prim eğrisi (yaş bandı tablosu) ile değiştirilecek.
  perYearOver18Factor: 0.03, // 18 yaş üstü her yıl için +%3

  /** TSS (SGK'lı, tamamlayıcı) primi Özel'e göre daha düşük → indirim çarpanı. */
  // TODO(doc): TSS / Özel ayrımının gerçek etkisi netleşecek.
  tssDiscountFactor: 0.6, // TSS ~ Özel'in %60'ı (kaba)

  /** Aile kapsamında ek kişi başına çarpan. */
  // TODO(doc): Aile/kişi sayısı gerçek fiyatlama mantığı netleşecek.
  perExtraPersonFactor: 0.7, // her ek kişi taban primin %70'i kadar ekler

  /** Tahmini aralık genişliği (±). Sonuç tek sayı değil bir ARALIK olarak verilir. */
  rangeSpread: 0.2, // ±%20

  /** Girdi sınırları. */
  minAge: 0,
  maxAge: 99,
  defaultAge: 30,
  maxPeople: 12,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// HAYAT — Prim tahmin hesaplayıcısı sabitleri
// docs/03: yaş / teminat tutarı / süre (yıl) / sigara → kaba prim tahmini.
// ─────────────────────────────────────────────────────────────────────────────
export const HAYAT = {
  /**
   * Teminat başına yıllık taban oran. Yıllık prim ~ teminat × bu oran × yaş/süre çarpanları.
   * Örn. 0.004 → 1.000.000 TL teminat için tabanda 4.000 TL/yıl.
   */
  // TODO(doc): Gerçek aktüeryal oran (mortalite tablosu) ile değiştirilecek.
  annualRatePerCoverage: 0.004,

  /** Yaşa göre artış: 30 yaş referans, her yıl için risk artışı. */
  // TODO(doc): Gerçek yaş-mortalite eğrisi girilecek.
  referenceAge: 30,
  perYearOverReferenceFactor: 0.04, // referans yaş üstü her yıl +%4

  /** Sigara kullananlar için risk çarpanı. */
  // TODO(doc): Gerçek sigara risk yüklemesi netleşecek.
  smokerFactor: 1.5,

  /** Uzun süreli poliçelerde küçük indirim (yıl başına). */
  // TODO(doc): Süreye bağlı fiyatlama gerçek mantıkla değişecek.
  perYearTermDiscount: 0.005, // her yıl için %0.5 indirim (azami sınırlı)
  maxTermDiscount: 0.15,

  /** Tahmini aralık genişliği (±). */
  rangeSpread: 0.2,

  /** Girdi sınırları. */
  minAge: 18,
  maxAge: 75,
  defaultAge: 30,
  minCoverage: 50_000,
  maxCoverage: 10_000_000,
  defaultCoverage: 500_000,
  minYears: 1,
  maxYears: 30,
  defaultYears: 10,
} as const;

// NOT (Konut/DASK): docs/03 "🔧 opsiyonel — istenirse". Bu aşamada ATLANDI.
// TODO(doc): Konut/DASK hesaplayıcısı istenirse buraya KONUT sabitleri eklenip
// formulas.ts'e saf fonksiyon yazılacak (m² × birim_fiyat × bölge_katsayısı).
