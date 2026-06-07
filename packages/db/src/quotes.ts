// @do/db — Teklif/poliçe yaşam döngüsü yardımcıları (K30/K32 / docs/12). SUNUCU.
//
// - createManualQuote: admin elle teklif/müşteri ekler (web dışı). source=MANUAL.
// - setPolicyDates / attachPolicyDocument: poliçe yapılınca tarih + belge bağlama.
// - getExpiringPolicies: yaklaşan/biten poliçeleri listele (takvim + bildirim).
//
// Web teklifi (source=WEB) apps/web/src/lib/submit-quote.ts içinde oluşturulur;
// burada YALNIZCA admin tarafı (manuel + poliçe) ve sorgular yer alır.

import { prisma, Prisma, type QuoteRequest } from "./index";
import { generateUniqueTrackingCode } from "./tracking";
import { createNotification } from "./notifications";

export interface CreateManualQuoteInput {
  product: string;
  locale?: string;
  fullName: string;
  phone: string;
  email?: string | null;
  /** Ürüne özel alanlar (docs/04 payload). Verilmezse {}. */
  payload?: Record<string, unknown>;
  /** Manuel kayıtta doğrudan poliçe tarihleri girilebilir (opsiyonel). */
  policyStartDate?: Date | null;
  policyEndDate?: Date | null;
  /** Manuel kayıt için başlangıç durumu (varsayılan YENI). */
  status?: QuoteRequest["status"];
}

/**
 * Admin'in elle eklediği teklif/müşteri kaydı (source=MANUAL). trackingCode otomatik
 * üretilir (web teklifleriyle aynı durum-sorgu deneyimi). KVKK rıza alanları boş
 * bırakılır (web formu rızası yok; manuel kayıt admin sorumluluğunda — docs/06).
 */
export async function createManualQuote(input: CreateManualQuoteInput): Promise<QuoteRequest> {
  const trackingCode = await generateUniqueTrackingCode();

  const quote = await prisma.quoteRequest.create({
    data: {
      product: input.product,
      locale: input.locale ?? "tr",
      trackingCode,
      source: "MANUAL",
      fullName: input.fullName,
      phone: input.phone,
      email: input.email ?? null,
      payload: (input.payload ?? {}) as Prisma.InputJsonValue,
      status: input.status ?? "YENI",
      policyStartDate: input.policyStartDate ?? null,
      policyEndDate: input.policyEndDate ?? null,
    },
  });

  return quote;
}

/**
 * Poliçe başlangıç/bitiş tarihlerini ayarlar (status=POLICE_YAPILDI akışı). docs/12.
 * Bulunamazsa null döner.
 */
export async function setPolicyDates(
  quoteId: string,
  dates: { start?: Date | null; end?: Date | null },
): Promise<QuoteRequest | null> {
  try {
    return await prisma.quoteRequest.update({
      where: { id: quoteId },
      data: {
        policyStartDate: dates.start ?? null,
        policyEndDate: dates.end ?? null,
      },
    });
  } catch {
    return null;
  }
}

/**
 * Yüklenen poliçe belgesini teklife bağlar: belge bir Asset (kind="police") olarak
 * oluşturulur ve QuoteRequest.policyAssetId güncellenir. Belge zaten Blob'a yüklenmiş
 * varsayılır (url/path çağıran tarafça verilir; @do/email poliçe maili ayrı çağrılır).
 * Bulunamazsa null döner.
 */
export async function attachPolicyDocument(
  quoteId: string,
  doc: {
    url: string;
    path: string;
    mimeType?: string | null;
    sizeBytes?: number | null;
  },
): Promise<{ quote: QuoteRequest; assetId: string } | null> {
  const existing = await prisma.quoteRequest.findUnique({
    where: { id: quoteId },
    select: { id: true },
  });
  if (!existing) return null;

  const asset = await prisma.asset.create({
    data: {
      quoteId,
      kind: "police",
      url: doc.url,
      path: doc.path,
      mimeType: doc.mimeType ?? null,
      sizeBytes: doc.sizeBytes ?? null,
    },
  });

  const quote = await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: { policyAssetId: asset.id },
  });

  return { quote, assetId: asset.id };
}

/**
 * Önümüzdeki `days` gün içinde poliçe bitişi olan (ve POLICE_YAPILDI durumundaki)
 * teklifleri döner. Admin takvimi + POLICE_BITIS bildirimleri için (K32).
 * Bitiş tarihi GEÇMİŞ poliçeler de dahil edilir (yenileme takibi) — `days` üst sınırı.
 */
export async function getExpiringPolicies(days: number = 30): Promise<QuoteRequest[]> {
  const upper = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return prisma.quoteRequest.findMany({
    where: {
      status: "POLICE_YAPILDI",
      policyEndDate: { not: null, lte: upper },
    },
    orderBy: { policyEndDate: "asc" },
  });
}

/**
 * getExpiringPolicies + her biri için POLICE_BITIS bildirimi üretir (günlük tarama
 * job'ı / manuel tetik). Aynı poliçe için tekrarlı bildirim oluşmasın diye, aynı
 * relatedId'li okunmamış POLICE_BITIS bildirimi varsa atlanır. İşlenen sayıyı döner.
 * TODO(doc): Eşikler (30/15/7) ve tarama mekanizması (cron) docs/12 §🔧 netleşecek.
 */
export async function notifyExpiringPolicies(days: number = 30): Promise<number> {
  const expiring = await getExpiringPolicies(days);
  let created = 0;
  for (const q of expiring) {
    const dup = await prisma.notification.findFirst({
      where: { type: "POLICE_BITIS", relatedId: q.id, read: false },
      select: { id: true },
    });
    if (dup) continue;
    await createNotification({
      type: "POLICE_BITIS",
      title: `Poliçe bitişi yaklaşıyor: ${q.fullName}`,
      body: q.policyEndDate
        ? `${q.product} — bitiş ${q.policyEndDate.toISOString().slice(0, 10)}`
        : q.product,
      relatedId: q.id,
    });
    created++;
  }
  return created;
}
