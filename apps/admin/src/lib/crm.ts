// CRM yardımcıları — durum etiketleri, geçiş kuralları, ürün etiketleri.
// Kaynak: docs/05 "CRM Durum Akışı", docs/04 (QuoteStatus enum), @do/products.
//
// Durum akışı (docs/05):
//   YENI ─► ARANDI ─► TEKLIF_VERILDI ─► POLICE_YAPILDI  (kazanım)
//     └────────┴──────────────┴────────► IPTAL          (kayıp)

import type { QuoteStatus } from "@do/db";
import { getProduct } from "@do/products";

/** Tüm durumlar (sıralı — UI listesi/filtre için). */
export const QUOTE_STATUSES: QuoteStatus[] = [
  "YENI",
  "ARANDI",
  "TEKLIF_VERILDI",
  "POLICE_YAPILDI",
  "IPTAL",
];

/** Durum → TR etiket (docs/05 rozet metinleri). */
export const STATUS_LABELS: Record<QuoteStatus, string> = {
  YENI: "Yeni",
  ARANDI: "Arandı",
  TEKLIF_VERILDI: "Teklif Verildi",
  POLICE_YAPILDI: "Poliçe Yapıldı",
  IPTAL: "İptal",
};

/** Durum rozeti için Tailwind sınıfları (tasarım token'larıyla, docs/09). */
export const STATUS_BADGE_CLASS: Record<QuoteStatus, string> = {
  YENI: "bg-primary/15 text-primary border-primary/30",
  ARANDI: "bg-accent text-accent-foreground border-accent-foreground/20",
  TEKLIF_VERILDI: "bg-secondary/15 text-secondary border-secondary/30",
  POLICE_YAPILDI: "bg-secondary text-secondary-foreground border-transparent",
  IPTAL: "bg-muted text-muted-foreground border-border",
};

/**
 * Bir durumdan izin verilen hedef durumlar (docs/05 akışı).
 * - Akış ileri yönlüdür; tek adım ileri ZORUNLU DEĞİL ama POLICE_YAPILDI'ya YALNIZ
 *   TEKLIF_VERILDI'den geçilebilir (önce teklif verilmeden poliçe yapılamaz). Bu kural
 *   hem UI'da (status-control disabled) hem sunucuda (updateStatusAction) uygulanır.
 * - Her aşamadan IPTAL'e geçilebilir; geri/düzeltme amaçlı YENI'ye dönüş serbesttir.
 * - POLICE_YAPILDI ve IPTAL "son" durumdur (geri açmak istenirse YENI'ye dönülebilir
 *   — yanlış işaretlemeyi düzeltmek için makul; docs/05 audit log netleşince kısıtlanır).
 */
export function allowedTransitions(current: QuoteStatus): QuoteStatus[] {
  switch (current) {
    case "YENI":
      // POLICE_YAPILDI YOK: önce TEKLIF_VERILDI yapılmalı.
      return ["ARANDI", "TEKLIF_VERILDI", "IPTAL"];
    case "ARANDI":
      // POLICE_YAPILDI YOK: önce TEKLIF_VERILDI yapılmalı.
      return ["TEKLIF_VERILDI", "IPTAL", "YENI"];
    case "TEKLIF_VERILDI":
      return ["POLICE_YAPILDI", "IPTAL", "ARANDI", "YENI"];
    case "POLICE_YAPILDI":
      return ["IPTAL", "YENI"];
    case "IPTAL":
      return ["YENI", "ARANDI"];
    default:
      return [];
  }
}

/** Verilen geçiş izinli mi? (Server Action'da defansif kontrol için.) */
export function canTransition(from: QuoteStatus, to: QuoteStatus): boolean {
  if (from === to) return false;
  return allowedTransitions(from).includes(to);
}

/**
 * Bir hedef durum, mevcut durumdan SEÇİLEBİLİR mi ama AKIŞ KURALI nedeniyle ENGELLİ mi?
 * status-control bu durumda seçeneği "disabled + ipucu" gösterir (gizlemek yerine).
 * Şu an yalnız POLICE_YAPILDI: TEKLIF_VERILDI veya POLICE_YAPILDI değilse engellidir.
 * @returns ipucu metni (engelliyse) veya null (engel yok).
 */
export function transitionBlockedReason(current: QuoteStatus, target: QuoteStatus): string | null {
  if (target === "POLICE_YAPILDI" && current !== "TEKLIF_VERILDI" && current !== "POLICE_YAPILDI") {
    return "Önce 'Teklif Verildi' yapın";
  }
  return null;
}

/** Teslim modalı açan durumlar (TEKLIF_VERILDI / POLICE_YAPILDI). */
export const DELIVERY_STATUSES: QuoteStatus[] = ["TEKLIF_VERILDI", "POLICE_YAPILDI"];

/** Teslim durumunu @do/email DeliveryKind'ine eşler ("teklif" | "police"). */
export function deliveryKindForStatus(status: QuoteStatus): "teklif" | "police" | null {
  if (status === "TEKLIF_VERILDI") return "teklif";
  if (status === "POLICE_YAPILDI") return "police";
  return null;
}

/** Ürün slug → TR ad (definitions.ts'ten; bilinmeyen slug için slug'ın kendisi). */
export function productLabel(slug: string): string {
  return getProduct(slug)?.name.tr ?? slug;
}

/** Ürün rozeti için renk sınıfı (ürüne göre ayırt edici, docs/05 "renk etiketli"). */
export function productBadgeClass(slug: string): string {
  switch (slug) {
    case "trafik":
      return "bg-secondary/15 text-secondary border-secondary/30";
    case "saglik":
      return "bg-primary/15 text-primary border-primary/30";
    case "bireysel-emeklilik":
      return "bg-accent text-accent-foreground border-accent-foreground/20";
    case "konut":
      return "bg-muted text-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}
