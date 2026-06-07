// @do/db — Teklif durum-takip kodu (K30 / docs/12). YALNIZCA SUNUCU.
//
// Her teklife kısa, tahmin-edilemez bir kod atanır. Müşteri web'deki durum sorgu
// sayfasına bu kodu girip teklifinin durumunu görür. KVKK gereği sorgu yalnız
// ürün/durum/tarih döner; ad/telefon/payload ASLA dönmez (bkz. getQuoteStatusByCode).

import { randomBytes } from "node:crypto";
import { prisma } from "./index";

// Crockford base32-benzeri alfabe: karıştırılması kolay karakterler (I, L, O, U, 0, 1)
// çıkarıldı → telefonda/sözlü paylaşımda hata azalır, tahmin edilebilirlik düşük kalır.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const CODE_LENGTH = 10;
const MAX_ATTEMPTS = 6;

/**
 * Kriptografik rastgele, biçimlendirilmemiş bir kod üretir (benzersizlik kontrol
 * EDİLMEDEN). Çoğu durumda generateUniqueTrackingCode kullanın.
 */
export function generateTrackingCode(length: number = CODE_LENGTH): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    // 0..255 -> alfabe indeksine eşle (mod). Alfabe 30 karakter → hafif bias var ama
    // tahmin-edilemezlik için yeterli (kod gizli değil, sadece zor tahmin edilmeli).
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}

/**
 * DB'de benzersiz olduğu doğrulanmış bir tracking kodu üretir. Çakışma olursa
 * (çok düşük olasılık) yeniden dener. Benzersiz kod bulunamazsa hata fırlatır.
 */
export async function generateUniqueTrackingCode(): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateTrackingCode();
    const existing = await prisma.quoteRequest.findUnique({
      where: { trackingCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error("[tracking] Benzersiz tracking kodu üretilemedi (çok fazla çakışma).");
}

/** getQuoteStatusByCode dönüş tipi — KVKK: yalnız zararsız, sorgulanabilir alanlar. */
export interface QuoteStatusInfo {
  product: string;
  status: string;
  createdAt: Date;
  /** Poliçe yapıldıysa bitiş tarihi (yenileme hatırlatması için). Yoksa null. */
  policyEndDate: Date | null;
}

/**
 * Tracking koduna göre teklif DURUMUNU döner. KVKK (docs/06 / docs/12 §6):
 * ad / telefon / e-posta / payload ASLA dönmez — yalnız ürün, durum, oluşturma
 * tarihi ve (varsa) poliçe bitiş tarihi. Kod bulunamazsa null.
 *
 * Kod normalize edilir (boşluk temizlenir, büyük harfe çevrilir) → kullanıcı küçük
 * harf/boşlukla girse de eşleşir.
 */
export async function getQuoteStatusByCode(code: string): Promise<QuoteStatusInfo | null> {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, "");
  if (!normalized) return null;

  const quote = await prisma.quoteRequest.findUnique({
    where: { trackingCode: normalized },
    // KVKK: yalnız zararsız alanlar SELECT edilir — kişisel veri DB'den hiç çekilmez.
    select: {
      product: true,
      status: true,
      createdAt: true,
      policyEndDate: true,
    },
  });
  if (!quote) return null;

  return {
    product: quote.product,
    status: quote.status,
    createdAt: quote.createdAt,
    policyEndDate: quote.policyEndDate ?? null,
  };
}
