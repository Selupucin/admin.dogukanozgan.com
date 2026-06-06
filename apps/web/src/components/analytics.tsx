"use client";

// Onaya bağlı analitik yükleyici (KVKK / docs/06 §3).
//
// İLKE: Analitik script YALNIZCA kullanıcı çerez banner'ında "Tümünü kabul et"
// ("all") seçtiğinde yüklenir. "essential" veya tercih yokken HİÇBİR şey yüklenmez
// ve hiçbir 3. taraf isteği gitmez. Tercih anında (banner'da seçim yapılınca
// CONSENT_EVENT ile) ya da sonraki sayfa yüklemelerinde okunur.
//
// ŞU AN GERÇEK ANALİTİK ARACI YOK — bu bir İSKELET:
//   - NEXT_PUBLIC_ANALYTICS_PROVIDER ("plausible" | "ga4" | boş) ile araç seçilir.
//   - İlgili NEXT_PUBLIC_* ID/domain env'i yoksa hiçbir şey yüklenmez (güvenli).
// TODO(doc): docs/06 "Analitik araç kullanılacak mı?" netleşince:
//   1) Aşağıdaki provider bloğunu gerçek script ile doldur (zaten Plausible/GA4
//      iskeleti hazır), 2) Vercel env'lerini gir, 3) gerekirse çerez politikası
//      metnine aracı ekle (hukukçu onayı).

import Script from "next/script";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, analyticsAllowed, readConsent, type ConsentValue } from "@/lib/consent";

// Gizlilik-dostu varsayılan: Plausible (çerezsiz). GA4 da desteklenir.
// TODO(doc): Sağlayıcı ve ID gerçek değerlerle Vercel env'inden gelir.
const PROVIDER = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER ?? "";
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "";
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "";

export function Analytics() {
  const [consent, setConsent] = useState<ConsentValue | null>(null);

  useEffect(() => {
    // İlk değer + tercih değişimini dinle (banner seçimi anında etki etsin).
    setConsent(readConsent());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ConsentValue>).detail;
      setConsent(detail ?? readConsent());
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  // Onay yoksa veya "essential" ise: HİÇBİR analitik yüklenmez (KVKK).
  if (!analyticsAllowed(consent)) return null;

  // --- Plausible (çerezsiz, gizlilik-dostu) ---
  if (PROVIDER === "plausible" && PLAUSIBLE_DOMAIN) {
    return (
      <Script
        defer
        data-domain={PLAUSIBLE_DOMAIN}
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
    );
  }

  // --- Google Analytics 4 (çerez kullanır → yalnızca açık onayla) ---
  if (PROVIDER === "ga4" && GA4_ID) {
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA4_ID}', { anonymize_ip: true });
          `}
        </Script>
      </>
    );
  }

  // Sağlayıcı/ID tanımsız → yükleme yok (iskelet güvenli varsayılan).
  return null;
}
