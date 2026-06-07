// Poliçe takvimi/takibi veri erişimi (K32 / docs/12 §4).
// Kaynak: @do/db getExpiringPolicies (yaklaşan bitişler) + yeni/yenilenen poliçeler.
//
// ⚠️ Gerçek DB henüz yok → derlenir ama çalışma zamanı testi DB bağlanınca.

import { prisma } from "@do/db";

/**
 * En son başlayan/yenilenen poliçeler (POLICE_YAPILDI + policyStartDate dolu).
 * Takvim sayfasında "yeni/yenilenen poliçeler" bölümünü besler.
 */
export async function listRecentPolicies(limit = 20) {
  return prisma.quoteRequest.findMany({
    where: {
      status: "POLICE_YAPILDI",
      policyStartDate: { not: null },
    },
    orderBy: { policyStartDate: "desc" },
    take: limit,
    select: {
      id: true,
      product: true,
      fullName: true,
      phone: true,
      source: true,
      policyStartDate: true,
      policyEndDate: true,
    },
  });
}

export type RecentPolicy = Awaited<ReturnType<typeof listRecentPolicies>>[number];

/** Bir poliçe bitişine kalan gün sayısı (negatif = geçmiş). */
export function daysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Kalan güne göre aciliyet seviyesi (vurgulu rozet için).
 * docs/12 §🔧: eşikler (30/15/7) placeholder — netleşince güncellenecek.
 * TODO(doc): poliçe hatırlatma eşikleri Doğukan ile netleşecek.
 */
export type Urgency = "gecmis" | "kritik" | "yakin" | "normal";

export function urgencyOf(days: number): Urgency {
  if (days < 0) return "gecmis";
  if (days <= 7) return "kritik";
  if (days <= 15) return "yakin";
  return "normal";
}

export const URGENCY_BADGE_CLASS: Record<Urgency, string> = {
  gecmis: "bg-muted text-muted-foreground border-border",
  kritik: "bg-destructive/15 text-destructive border-destructive/30",
  yakin: "bg-primary/15 text-primary border-primary/30",
  normal: "bg-secondary/15 text-secondary border-secondary/30",
};

export function urgencyLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)} gün geçti`;
  if (days === 0) return "Bugün";
  return `${days} gün kaldı`;
}
