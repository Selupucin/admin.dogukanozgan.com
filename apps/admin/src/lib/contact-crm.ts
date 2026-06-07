// İletişim talepleri CRM yardımcıları — durum etiketleri, geçiş kuralları, rozet stilleri.
// Kaynak: docs/12 §4 (İletişim Talepleri sayfası, K31), docs/04 (ContactStatus enum).
//
// Durum akışı (docs/12 K31): YENI → OKUNDU → YANITLANDI → KAPANDI.
// İleri yönlüdür; her aşamadan KAPANDI'ya geçilebilir, gerekirse YENI'ye geri alınabilir.

import type { ContactStatus } from "@do/db";

/** Tüm iletişim durumları (sıralı — filtre/listede gösterim sırası). */
export const CONTACT_STATUSES: ContactStatus[] = ["YENI", "OKUNDU", "YANITLANDI", "KAPANDI"];

/** Durum → TR etiket. */
export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  YENI: "Yeni",
  OKUNDU: "Okundu",
  YANITLANDI: "Yanıtlandı",
  KAPANDI: "Kapandı",
};

/** Durum rozeti için Tailwind sınıfları (tasarım token'larıyla, docs/09). */
export const CONTACT_STATUS_BADGE_CLASS: Record<ContactStatus, string> = {
  YENI: "bg-primary/15 text-primary border-primary/30",
  OKUNDU: "bg-accent text-accent-foreground border-accent-foreground/20",
  YANITLANDI: "bg-secondary/15 text-secondary border-secondary/30",
  KAPANDI: "bg-muted text-muted-foreground border-border",
};

/**
 * Bir durumdan izin verilen hedef durumlar (docs/12 K31 akışı).
 * - İleri yönlü; her aşamadan KAPANDI'ya geçilebilir.
 * - Yanlış işaretlemeyi düzeltmek için YENI'ye geri dönüş makul (audit log yok).
 */
export function allowedContactTransitions(current: ContactStatus): ContactStatus[] {
  switch (current) {
    case "YENI":
      return ["OKUNDU", "YANITLANDI", "KAPANDI"];
    case "OKUNDU":
      return ["YANITLANDI", "KAPANDI", "YENI"];
    case "YANITLANDI":
      return ["KAPANDI", "OKUNDU", "YENI"];
    case "KAPANDI":
      return ["YENI", "OKUNDU"];
    default:
      return [];
  }
}

/** Verilen geçiş izinli mi? (Server Action'da defansif kontrol için.) */
export function canContactTransition(from: ContactStatus, to: ContactStatus): boolean {
  if (from === to) return false;
  return allowedContactTransitions(from).includes(to);
}
