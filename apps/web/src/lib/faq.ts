// SSS (Sıkça Sorulan Sorular) — TEK KAYNAK (TR + EN).
// Anasayfa SSS bölümü, /sss sayfası ve FAQPage JSON-LD (docs/07) buradan beslenir.
// docs/02: "SSS — Var; hem ayrı sayfa hem anasayfada bölüm."
//
// İçerik Doğukan'ın çoklu şirket acentesi konumlandırmasına göre yazılmıştır (docs/00).
// TODO(doc): Doğukan onayı ile soru/cevaplar genişletilebilir (docs/02 "🔧 netleşecek").

import type { Locale } from "@/i18n/routing";

export interface FaqItem {
  q: Record<Locale, string>;
  a: Record<Locale, string>;
}

export const faqs: FaqItem[] = [
  {
    q: {
      tr: "Teklif almak ücretli mi?",
      en: "Is getting a quote free?",
    },
    a: {
      tr: "Hayır. Teklif almak tamamen ücretsizdir ve sizi hiçbir şekilde bağlamaz. Bilgilerinizi bırakın, en uygun teklifi karşılaştırıp size dönelim.",
      en: "No. Getting a quote is completely free and puts you under no obligation. Leave your details and we will compare the best offers and get back to you.",
    },
  },
  {
    q: {
      tr: "Hangi sigorta şirketleriyle çalışıyorsunuz?",
      en: "Which insurance companies do you work with?",
    },
    a: {
      tr: "Tek bir şirkete bağlı değiliz. Türkiye'nin önde gelen birçok sigorta şirketinin acenteliğini yapıyoruz; bu sayede 20'den fazla şirketin fiyatını sizin için karşılaştırarak en avantajlı poliçeyi buluyoruz.",
      en: "We are not tied to a single company. We act as an agency for many of Türkiye's leading insurers, so we compare prices from 20+ companies to find you the most advantageous policy.",
    },
  },
  {
    q: {
      tr: "Teklifim ne kadar sürede hazır olur?",
      en: "How quickly is my quote ready?",
    },
    a: {
      tr: "Çoğu branşta talebinizi aldıktan kısa süre sonra sizi arıyor veya WhatsApp üzerinden dönüş yapıyoruz. Sağlık ve hayat gibi detay gerektiren ürünlerde süreç biraz uzayabilir.",
      en: "For most branches we call you or reach out via WhatsApp shortly after receiving your request. For products requiring more detail, such as health and life, it may take a little longer.",
    },
  },
  {
    q: {
      tr: "Verilerim güvende mi?",
      en: "Is my data safe?",
    },
    a: {
      tr: "Evet. Verileriniz yalnızca teklif hazırlamak amacıyla, 6698 sayılı KVKK'ya uygun şekilde işlenir. Sağlık gibi özel nitelikli veriler için ayrıca açık rızanız alınır ve erişim sınırlı tutulur.",
      en: "Yes. Your data is processed solely to prepare a quote, in compliance with Turkish Law No. 6698 (KVKK). For special-category data such as health, your explicit consent is obtained separately and access is restricted.",
    },
  },
  {
    q: {
      tr: "Mevcut poliçemi sizinle yenileyebilir miyim?",
      en: "Can I renew my existing policy with you?",
    },
    a: {
      tr: "Tabii ki. Mevcut poliçenizin bilgilerini paylaşmanız yeterli; yenileme döneminde alternatif şirketlerin fiyatlarını karşılaştırıp en uygun seçeneği sunarız.",
      en: "Of course. Just share your current policy details; at renewal time we compare alternative companies' prices and present the most suitable option.",
    },
  },
  {
    q: {
      tr: "Hasar anında ne yapmalıyım?",
      en: "What should I do in case of a claim?",
    },
    a: {
      tr: "Hasar durumunda bizi telefon veya WhatsApp üzerinden arayın; süreci baştan sona sizin adınıza takip eder, ilgili sigorta şirketiyle iletişimi yönetiriz.",
      en: "In case of a claim, call us by phone or WhatsApp; we follow the process end to end on your behalf and manage communication with the relevant insurer.",
    },
  },
];

/** FAQPage JSON-LD üretir (docs/07 — anasayfa & SSS). */
export function buildFaqJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q[locale],
      acceptedAnswer: { "@type": "Answer", text: f.a[locale] },
    })),
  };
}
