// @do/db — Admin içi bildirimler (K29 / docs/12). YALNIZCA SUNUCU.
//
// Admin header'ındaki çan: okunmamış sayısı + liste. Bildirimler üç kaynaktan
// üretilir: yeni teklif (TEKLIF), yeni iletişim talebi (ILETISIM), yaklaşan/biten
// poliçe (POLICE_BITIS). Doğukan'a otomatik MAIL gönderilmez (K29) — yalnız panel içi.

import { prisma, type Notification, type NotificationType } from "./index";

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  body?: string | null;
  /** İlgili kaydın id'si (QuoteRequest.id / ContactRequest.id). Tıklayınca gidilir. */
  relatedId?: string | null;
}

/** Yeni bir bildirim oluşturur. */
export async function createNotification(input: CreateNotificationInput): Promise<Notification> {
  return prisma.notification.create({
    data: {
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      relatedId: input.relatedId ?? null,
    },
  });
}

export interface ListNotificationsOptions {
  /** true ise yalnız okunmamışları döner. */
  unreadOnly?: boolean;
  /** En çok kaç kayıt (varsayılan 20). */
  limit?: number;
}

/** Bildirimleri en yeni önce döner (çan açılır listesi için). */
export async function listNotifications(
  opts: ListNotificationsOptions = {},
): Promise<Notification[]> {
  const { unreadOnly = false, limit = 20 } = opts;
  return prisma.notification.findMany({
    where: unreadOnly ? { read: false } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** Okunmamış bildirim sayısı (çan badge'i). */
export async function unreadNotificationCount(): Promise<number> {
  return prisma.notification.count({ where: { read: false } });
}

/** Tek bir bildirimi okundu işaretler. Bulunamazsa null döner. */
export async function markNotificationRead(id: string): Promise<Notification | null> {
  try {
    return await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  } catch {
    // Kayıt yoksa Prisma P2025 fırlatır → null dön.
    return null;
  }
}

/** Tüm okunmamış bildirimleri okundu işaretler. İşlenen sayıyı döner. */
export async function markAllNotificationsRead(): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  });
  return result.count;
}
