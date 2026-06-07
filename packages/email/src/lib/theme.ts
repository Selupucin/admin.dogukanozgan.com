// @do/email — Marka renk paleti + sabitler (docs/09 tasarım).
// E-posta istemcileri modern CSS'i sınırlı destekler; bu yüzden tüm stiller
// INLINE ve e-posta-güvenli (hex renk, px, web-safe font fallback) tutulur.

/** docs/09 renk paleti (e-posta için hex). */
export const palette = {
  navy: "#10243a", // Ana mürekkep — başlık şeridi, koyu zeminler
  inkSoft: "#3a5168", // Yumuşak gövde metni
  cream: "#f7f2e9", // Sayfa zemini (sıcak)
  creamDeep: "#efe6d6", // Bölüm ayrımı / kenarlık
  paper: "#fffdf8", // Kart/gövde zemini
  orange: "#f25a32", // Aksan / CTA (turuncu)
  orangeDark: "#d9421b", // CTA hover
  teal: "#1c6e6a", // Güven aksanı
  tealSoft: "#e3efed", // Rozet/ikon zemini
  white: "#ffffff",
} as const;

/**
 * Web-safe font yığını. Fraunces/Hanken Grotesk e-postada güvenilir biçimde
 * yüklenmez; bu yüzden başlıklarda serif, gövdede sans-serif sistem fontlarına
 * düşülür (e-posta-güvenli yaklaşım).
 */
export const fonts = {
  heading: "Georgia, 'Times New Roman', serif",
  body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
} as const;

/** İletişim bilgileri (footer). 🔧 docs/12: nihai metinleri Doğukan verecek. */
export const contact = {
  brand: "Doğukan Özgan",
  // TODO(doc): Telefon numarası kullanıcı tarafından verildi (2026-06-04).
  phone: "0546 527 28 82",
  phoneHref: "tel:+905465272882",
  // TODO(doc): Footer e-postası (gönderen EMAIL_FROM'dan ayrı kurumsal adres).
  email: "dogukanozgan@akplansigorta.com.tr",
  address: "Mecidiyeköy, Şişli / İstanbul",
} as const;
