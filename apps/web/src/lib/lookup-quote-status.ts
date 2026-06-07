"use server";

// Teklif durum sorgulama — Server Action (K30 / docs/12 §3 + §6 KVKK).
//
// Müşteri durum sorgu sayfasında tracking kodunu girer; bu action @do/db'deki
// getQuoteStatusByCode'u çağırır. KVKK gereği YALNIZ ürün + durum + tarih (+varsa
// poliçe bitiş) döner; ad/telefon/e-posta/payload ASLA dönmez (lookup zaten yalnız
// zararsız alanları SELECT eder). Brute-force'a karşı IP başına rate limit.

import { headers } from "next/headers";
import { getQuoteStatusByCode, type QuoteStatusInfo } from "@do/db";
import { rateLimit } from "./rate-limit";

export interface LookupStatusResult {
  ok: boolean;
  /** Kullanıcıya gösterilecek hata anahtarı (i18n). */
  error?: "rateLimited" | "notFound" | "invalid" | "server";
  status?: QuoteStatusInfo;
}

// Kod sorgusu spam/brute-force koruması: 15 dk penceresinde IP başına 20 deneme.
// TODO(doc): Üretim eşiği netleşince ayarlanır (docs/06 §6).
const RATE_LIMIT = { limit: 20, windowMs: 15 * 60 * 1000 };

export async function lookupQuoteStatus(code: string): Promise<LookupStatusResult> {
  try {
    const normalized = (code ?? "").trim();
    if (normalized.length < 4 || normalized.length > 40) {
      return { ok: false, error: "invalid" };
    }

    const hdrs = await headers();
    const ip = clientIp(hdrs);

    const rl = rateLimit(`status:${ip}`, RATE_LIMIT);
    if (!rl.ok) {
      return { ok: false, error: "rateLimited" };
    }

    const status = await getQuoteStatusByCode(normalized);
    if (!status) {
      return { ok: false, error: "notFound" };
    }
    return { ok: true, status };
  } catch (err) {
    console.error("[lookup-quote-status] unexpected error:", err);
    return { ok: false, error: "server" };
  }
}

function clientIp(hdrs: Headers): string {
  const fwd = hdrs.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return hdrs.get("x-real-ip") ?? "unknown";
}
