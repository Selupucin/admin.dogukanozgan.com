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

/**
 * "Müşteri Teslim" şablonu metinleri (genel) — K28 / docs/12 §2.
 * `kind` varyantı: "teklif" → "Teklifiniz hazırlandı", "police" → "Poliçeniz hazır".
 * Ek (attachment) + serbest mesaj + durum linki opsiyoneldir; içerik yoksa standart
 * "hazırlandı, en kısa sürede iletişime geçeceğiz" metni gösterilir.
 */
export type DeliveryKind = "teklif" | "police";

export const customerDeliveryStrings = {
  tr: {
    // Konu satırı — kind'e göre.
    subject: (kind: DeliveryKind, productName: string) =>
      kind === "teklif"
        ? `Teklifiniz hazırlandı — ${productName}`
        : `Poliçeniz hazır — ${productName}`,
    preview: (kind: DeliveryKind) =>
      kind === "teklif"
        ? "Teklifiniz hazırlandı. Detaylar e-postanızda."
        : "Poliçeniz hazır. Detaylar e-postanızda.",
    greeting: "Merhaba,",
    // Ana başlık — kind'e göre.
    intro: (kind: DeliveryKind, productName: string) =>
      kind === "teklif"
        ? `${productName} için teklifiniz hazırlanmıştır. İlginiz için teşekkür ederiz.`
        : `${productName} poliçeniz hazırlanmıştır. Bizi tercih ettiğiniz için teşekkür ederiz.`,
    summaryLabel: (kind: DeliveryKind) => (kind === "teklif" ? "Teklif" : "Poliçe"),
    // İçerik (ek/mesaj) yoksa gösterilen standart metin — kind'e göre.
    // TODO(doc): Nihai metin/dönüş süresi Doğukan'da (docs/12 §5).
    standardBody: (kind: DeliveryKind) =>
      kind === "teklif"
        ? "Teklifinizle ilgili detayları paylaşmak için en kısa sürede sizinle iletişime geçeceğiz. Dilerseniz aşağıdaki iletişim bilgilerinden bize ulaşabilirsiniz."
        : "Poliçenizle ilgili detayları paylaşmak için en kısa sürede sizinle iletişime geçeceğiz. Dilerseniz aşağıdaki iletişim bilgilerinden bize ulaşabilirsiniz.",
    // Ek dosya iliştirildiğinde gövdede gösterilen bilgi — kind'e göre.
    attachmentNotice: (kind: DeliveryKind) =>
      kind === "teklif"
        ? "Teklif belgeniz bu e-postanın ekinde gönderilmiştir."
        : "Poliçe belgeniz bu e-postanın ekinde gönderilmiştir.",
    // Admin'in girdiği serbest mesaj bloğu başlığı.
    messageLabel: "Acentenizden not",
    statusCta: "Durumu Görüntüle",
    statusHint:
      "Talebinizin güncel durumunu aşağıdaki bağlantıdan dilediğiniz zaman görüntüleyebilirsiniz:",
    support: "Herhangi bir sorunuz olursa bizimle iletişime geçmekten çekinmeyin.",
    closing: "Sağlıklı günler dileriz,",
    signature: "Doğukan Özgan",
  },
  en: {
    subject: (kind: DeliveryKind, productName: string) =>
      kind === "teklif"
        ? `Your quote is ready — ${productName}`
        : `Your policy is ready — ${productName}`,
    preview: (kind: DeliveryKind) =>
      kind === "teklif"
        ? "Your quote is ready. Details are in your email."
        : "Your policy is ready. Details are in your email.",
    greeting: "Hello,",
    intro: (kind: DeliveryKind, productName: string) =>
      kind === "teklif"
        ? `Your quote for ${productName} is ready. Thank you for your interest.`
        : `Your ${productName} policy is ready. Thank you for choosing us.`,
    summaryLabel: (kind: DeliveryKind) => (kind === "teklif" ? "Quote" : "Policy"),
    standardBody: (kind: DeliveryKind) =>
      kind === "teklif"
        ? "We will get in touch with you shortly to share the details of your quote. Feel free to reach us using the contact information below."
        : "We will get in touch with you shortly to share the details of your policy. Feel free to reach us using the contact information below.",
    attachmentNotice: (kind: DeliveryKind) =>
      kind === "teklif"
        ? "Your quote document is attached to this email."
        : "Your policy document is attached to this email.",
    messageLabel: "A note from your agent",
    statusCta: "View Status",
    statusHint: "You can view the current status of your request anytime via the link below:",
    support: "If you have any questions, please do not hesitate to contact us.",
    closing: "Wishing you well,",
    signature: "Doğukan Özgan",
  },
} as const;

/**
 * "Admin Giriş Doğrulama Kodu" (OTP) şablonu metinleri — K28 / docs/12 §2.
 * Transactional (2FA). Kod ÇAĞRI sırasında verilir (admin tarafı üretir/saklar);
 * bu paket yalnız gönderir. Kod loglanmaz (docs/12).
 */
export const loginCodeStrings = {
  tr: {
    subject: "Admin giriş doğrulama kodunuz",
    preview: "Admin paneli giriş doğrulama kodunuz.",
    greeting: "Merhaba,",
    intro: "Admin paneline giriş için doğrulama kodunuz aşağıdadır.",
    codeLabel: "Doğrulama kodunuz",
    // X dakika değeri çağrı sırasında (expiresMinutes) verilir.
    expiry: (minutes: number) =>
      `Bu kodu yalnız siz girmelisiniz; kod ${minutes} dakika geçerlidir.`,
    securityNotice:
      "Bu girişi siz yapmadıysanız bu e-postayı dikkate almayın ve hesabınızın güvenliği için şifrenizi değiştirin.",
    closing: "Sevgiler,",
    signature: "Doğukan Özgan",
  },
  en: {
    subject: "Your admin login verification code",
    preview: "Your verification code for the admin panel.",
    greeting: "Hello,",
    intro: "Below is your verification code to sign in to the admin panel.",
    codeLabel: "Your verification code",
    expiry: (minutes: number) =>
      `Only you should enter this code; it is valid for ${minutes} minutes.`,
    securityNotice:
      "If you did not attempt this sign-in, please ignore this email and change your password to keep your account secure.",
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
