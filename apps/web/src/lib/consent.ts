// Çerez onayı — paylaşılan sabitler ve yardımcılar (KVKK, docs/06 §3).
//
// Tek doğru kaynak: hem çerez banner'ı (cookie-consent.tsx) hem analitik yükleyici
// (analytics.tsx) aynı anahtarı ve değerleri buradan okur.
//
// Davranış: Zorunlu OLMAYAN çerezler (analitik) YALNIZCA kullanıcı "all" (tümünü
// kabul) seçtiğinde çalışır. "essential" veya tercih yokken HİÇBİR analitik
// yüklenmez (docs/06 §3 — "onaydan önce çalışmaz").

export const CONSENT_STORAGE_KEY = "do-cookie-consent";

/** Onay seçenekleri: tümü (analitik dahil) | yalnızca zorunlu. */
export type ConsentValue = "all" | "essential";

/** Tercih değiştiğinde aynı sekmedeki dinleyicilere haber veren olay adı. */
export const CONSENT_EVENT = "do-consent-change";

/** localStorage'dan mevcut tercihi okur (yoksa null). SSR güvenli. */
export function readConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return v === "all" || v === "essential" ? v : null;
  } catch {
    return null;
  }
}

/** Tercihi yazar ve aynı sekmeye olay yayar (banner → analitik anında tetiklenir). */
export function writeConsent(value: ConsentValue): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    /* yoksay */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

/** Analitik yüklenebilir mi? Yalnızca açık "all" onayında true. */
export function analyticsAllowed(value: ConsentValue | null): boolean {
  return value === "all";
}
