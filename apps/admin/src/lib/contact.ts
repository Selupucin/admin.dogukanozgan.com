// İletişim hızlı-aksiyon yardımcıları — tel/WhatsApp/e-posta linkleri.
// Kaynak: docs/05 "Hızlı aksiyonlar: WhatsApp'tan yaz · Telefonla ara · E-posta gönder".

/** Telefonu yalnızca rakam + baştaki +'a indirger (tel:/wa.me için). */
function digits(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

/**
 * WhatsApp wa.me için uluslararası biçim (yalnızca rakam, baştaki + ve 0 atılır).
 * TR varsayımı: 0 ile başlıyorsa 90 ön ekiyle değiştirilir; + ile başlıyorsa olduğu
 * gibi rakamlaştırılır. (Heuristik — uluslararası numara için kullanıcı kontrol eder.)
 */
export function waNumber(phone: string): string {
  const d = digits(phone).replace(/^\+/, "");
  if (d.startsWith("90")) return d;
  if (d.startsWith("0")) return `90${d.slice(1)}`;
  // 10 haneli yerel (5xx...) ise TR ön eki ekle.
  if (d.length === 10 && d.startsWith("5")) return `90${d}`;
  return d;
}

export function telHref(phone: string): string {
  return `tel:${digits(phone)}`;
}

export function whatsappHref(phone: string, message?: string): string {
  const base = `https://wa.me/${waNumber(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mailtoHref(email: string, subject?: string): string {
  return subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`;
}

/** Tarihi TR yerel biçimde (gün ay yıl, saat). */
export function formatDateTime(date: Date): string {
  return date.toLocaleString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Yalnızca tarih (gün ay yıl). */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("tr-TR", { year: "numeric", month: "2-digit", day: "2-digit" });
}
