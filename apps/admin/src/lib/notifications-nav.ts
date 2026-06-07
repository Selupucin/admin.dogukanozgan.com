// Bildirim → admin içi hedef rota çözümü (K29 / docs/12 §4).
// Saf (sync) yardımcı — "use server" dosyasına konulamaz; ayrı modülde tutulur.
//
// TEKLIF → teklif detayı, ILETISIM → iletişim talebi detayı,
// POLICE_BITIS → ilgili teklif/poliçe detayı. relatedId yoksa null (link'siz).

import type { NotificationType } from "@do/db";

export function notificationHref(type: NotificationType, relatedId?: string | null): string | null {
  if (!relatedId) return null;
  switch (type) {
    case "TEKLIF":
      return `/teklifler/${relatedId}`;
    case "ILETISIM":
      return `/iletisim-talepleri/${relatedId}`;
    case "POLICE_BITIS":
      return `/teklifler/${relatedId}`;
    default:
      return null;
  }
}
