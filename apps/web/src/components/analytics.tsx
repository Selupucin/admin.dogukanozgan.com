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

// Google Tag Manager (GTM) konteyner kimliği. GTM çerez kullanabildiğinden ve içine
// herhangi bir 3. taraf etiket (GA, pazarlama pikselleri) yüklenebildiğinden, KVKK §3
// gereği YALNIZCA açık "all" onayında yüklenir — Plausible/GA4 ile birebir aynı kapı.
// gtm.js script'i onay verilince (CONSENT_EVENT) anında, aksi halde HİÇ enjekte edilmez.
// noscript <iframe> KASTEN eklenmedi: JS olmadan kullanıcı onay veremez; onay-öncesi
// (rızasız) izleme yapmamak için JS'siz fallback'i atlıyoruz (KVKK-güvenli, docs/06 §3).
const GTM_ID = "GTM-WSLRQS8S";

// Google Analytics 4 (gtag.js) — sabit ölçüm kimliği. GA4 çerez kullandığından, GTM ile
// BİREBİR AYNI onay kapısının arkasında (analyticsAllowed → "all") yüklenir; onay yoksa
// HİÇ enjekte edilmez. GTM ile aynı dataLayer'ı paylaşır (her iki snippet de
// `dataLayer || []` ile güvenli init eder → birbirini ezmez, aynı dizide birlikte yaşar).
// ÇİFT SAYIM NOTU: GA4 burada gtag ile yükleniyor; GTM container'ı içinde AYRICA bir GA4
// Configuration tag'i KURULMAMALI — aksi halde her olay iki kez sayılır.
const GA4_MEASUREMENT_ID = "G-SJ5GCMTM03";

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

  // Onay yoksa veya "essential" ise: HİÇBİR analitik/GTM yüklenmez (KVKK).
  if (!analyticsAllowed(consent)) return null;

  // --- Google Tag Manager (çerez kullanabilir → yalnızca açık "all" onayla) ---
  // Standart GTM snippet'i ama RIZA SONRASI: dataLayer init + gtm.js enjeksiyonu.
  // next/script "afterInteractive" ile yüklenir. Plausible/GA4'ten bağımsız çalışır;
  // hangi sağlayıcı seçili olursa olsun (veya hiçbiri) GTM ayrıca yüklenir.
  const gtm = GTM_ID ? (
    <Script id="gtm-init" strategy="afterInteractive">
      {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');
      `}
    </Script>
  ) : null;

  // --- Google Analytics 4 (gtag.js) — GTM ile aynı onay kapısında, sabit kimlik ---
  // Standart gtag snippet'i ama RIZA SONRASI. dataLayer'ı GTM ile paylaşır: gtag init
  // `dataLayer || []` ile mevcut diziyi korur (GTM snippet'iyle çakışmaz). GTM ile
  // BİRLİKTE her zaman (hangi PROVIDER seçili olursa olsun) yüklenir.
  const ga4 = GA4_MEASUREMENT_ID ? (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA4_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  ) : null;

  // --- Plausible (çerezsiz, gizlilik-dostu) ---
  if (PROVIDER === "plausible" && PLAUSIBLE_DOMAIN) {
    return (
      <>
        {gtm}
        {ga4}
        <Script
          defer
          data-domain={PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </>
    );
  }

  // --- Google Analytics 4 (env-driven, ESKİ/opsiyonel sağlayıcı yolu) ---
  // Sabit GA4 (GA4_MEASUREMENT_ID) artık her zaman `ga4` ile yüklendiğinden bu env
  // tabanlı blok yalnızca FARKLI bir ek GA4 kimliği için anlamlı. Aynı kimliği iki kez
  // yüklememek için sabit kimlikle çakışırsa env script'ini atlar (yalnız {ga4} kalır).
  if (PROVIDER === "ga4" && GA4_ID && GA4_ID !== GA4_MEASUREMENT_ID) {
    return (
      <>
        {gtm}
        {ga4}
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

  // Varsayılan: GTM + sabit GA4 (gtag) onaylıysa birlikte yüklenir.
  return (
    <>
      {gtm}
      {ga4}
    </>
  );
}
