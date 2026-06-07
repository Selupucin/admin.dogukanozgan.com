// @do/email — E-posta metinleri (TR + EN).
// 🔧 docs/12 "Sonra netleşecek": gerçek metinler / dönüş süresi / tanıtım Doğukan'da.
// Buradaki Türkçe/İngilizce metinler profesyonel YER TUTUCU'dur; tek yerden
// değiştirilecek şekilde toplanmıştır.

export type Locale = "tr" | "en";

/** Geçerli locale değilse TR'ye düş. */
export function normalizeLocale(locale?: string): Locale {
  return locale === "en" ? "en" : "tr";
}

/** Footer + ortak düzen metinleri. */
export const layoutStrings = {
  tr: {
    // TODO(doc): KVKK kısa notu — nihai metni Doğukan/uyum verecek (docs/06).
    kvkk:
      "Bu e-posta yalnızca talebinizle ilgili bilgilendirme amacıyla gönderilmiştir. " +
      "Kişisel verileriniz KVKK kapsamında korunur.",
    rights: "Tüm hakları saklıdır.",
    contactLabel: "İletişim",
  },
  en: {
    kvkk:
      "This email was sent solely to inform you about your request. " +
      "Your personal data is protected under Turkish data protection law (KVKK).",
    rights: "All rights reserved.",
    contactLabel: "Contact",
  },
} as const;

/** "Teklif Alındı" şablonu metinleri. */
export const quoteReceivedStrings = {
  tr: {
    subject: (productName: string) => `Teklif talebiniz alındı — ${productName}`,
    preview: "Teklif talebiniz bize ulaştı. Durum takip kodunuz hazır.",
    // TODO(doc): Nihai teşekkür/karşılama metni Doğukan'da.
    greeting: "Merhaba,",
    intro: (productName: string) =>
      `${productName} için teklif talebinizi aldık. İlginiz için teşekkür ederiz.`,
    codeLabel: "Durum takip kodunuz",
    // TODO(doc): Gerçek dönüş süresi Doğukan tarafından netleşecek.
    turnaround: "Teklifinizi en kısa sürede hazırlayıp sizinle iletişime geçeceğiz.",
    statusCta: "Durumu Sorgula",
    statusHint:
      "Talebinizin güncel durumunu aşağıdaki kod ile dilediğiniz zaman sorgulayabilirsiniz:",
    // Ölçülü tanıtım — amaçtan sapmadan (docs/12 madde 8).
    // TODO(doc): Nihai tanıtım cümlesi Doğukan'da.
    promo: "Birçok sigorta şirketinin tekliflerini karşılaştırarak size en uygun çözümü sunuyoruz.",
    closing: "Sevgiler,",
    signature: "Doğukan Özgan",
  },
  en: {
    subject: (productName: string) => `We received your quote request — ${productName}`,
    preview: "Your quote request has reached us. Your tracking code is ready.",
    greeting: "Hello,",
    intro: (productName: string) =>
      `We have received your quote request for ${productName}. Thank you for your interest.`,
    codeLabel: "Your status tracking code",
    turnaround: "We will prepare your quote and get back to you as soon as possible.",
    statusCta: "Check Status",
    statusHint: "You can check the current status of your request anytime using the code below:",
    promo: "We compare offers from many insurance companies to bring you the best fit.",
    closing: "Best regards,",
    signature: "Doğukan Özgan",
  },
} as const;

/** "Poliçe Teslim" şablonu metinleri. */
export const policyDeliveryStrings = {
  tr: {
    subject: (productName: string) => `Poliçeniz hazır — ${productName}`,
    preview: "Poliçe belgeniz hazır. Belgeye e-postadan ulaşabilirsiniz.",
    greeting: "Merhaba,",
    intro: (productName: string) =>
      `${productName} poliçeniz hazırlanmıştır. Bizi tercih ettiğiniz için teşekkür ederiz.`,
    summaryLabel: "Poliçe",
    documentHint: "Poliçe belgenize aşağıdaki bağlantıdan ulaşabilirsiniz:",
    documentCta: "Poliçe Belgesini Görüntüle",
    // TODO(doc): Nihai profesyonel kapanış metni Doğukan'da.
    support: "Herhangi bir sorunuz olursa bizimle iletişime geçmekten çekinmeyin.",
    closing: "Sağlıklı günler dileriz,",
    signature: "Doğukan Özgan",
  },
  en: {
    subject: (productName: string) => `Your policy is ready — ${productName}`,
    preview: "Your policy document is ready. You can access it from this email.",
    greeting: "Hello,",
    intro: (productName: string) =>
      `Your ${productName} policy is ready. Thank you for choosing us.`,
    summaryLabel: "Policy",
    documentHint: "You can access your policy document via the link below:",
    documentCta: "View Policy Document",
    support: "If you have any questions, please do not hesitate to contact us.",
    closing: "Wishing you well,",
    signature: "Doğukan Özgan",
  },
} as const;
