"use server";

// Teklif detayı Server Action'ları — durum değiştir, not ekle, sil, anonimleştir.
// Kaynak: docs/05 (CRM durum/not, KVKK sil/anonimleştir), docs/06 (erişim güvenliği).
//
// GÜVENLİK: Her action başında oturum kontrolü (docs/05 "Tüm admin server
// action'larında oturum kontrolü"). Oturum yoksa işlem reddedilir.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  prisma,
  deleteQuoteRequest,
  anonymizeQuoteRequest,
  setPolicyDates,
  attachPolicyDocument,
  uploadToStorage,
  isStorageConfigured,
  validateUpload,
  isValidObjectId,
  logError,
  type QuoteStatus,
} from "@do/db";
import { isEmailConfigured, sendCustomerDelivery } from "@do/email";
import { auth } from "@/auth";
import { canTransition, QUOTE_STATUSES, productLabel, deliveryKindForStatus } from "@/lib/crm";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Yetkisiz: oturum gerekli.");
  }
  return session;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Geçerli bir tarih (YYYY-MM-DD) parse eder; boş/hatalıysa null. */
function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * CRM durumunu değiştirir (docs/05 akışına göre geçiş doğrulanır).
 * POLICE_YAPILDI'ya geçişte poliçe başlangıç + bitiş tarihi ZORUNLUDUR (K32 / docs/12):
 * tarihsiz POLICE_YAPILDI'ya izin verilmez.
 */
export async function updateStatusAction(
  quoteId: string,
  next: string,
  policy?: { start?: string | null; end?: string | null },
): Promise<ActionResult> {
  await requireAuth();

  // ObjectId guard (docs/13 §O1) — geçersizse Prisma "Malformed ObjectID" fırlatmasın.
  if (!isValidObjectId(quoteId)) return { ok: false, error: "Geçersiz teklif." };

  if (!QUOTE_STATUSES.includes(next as QuoteStatus)) {
    return { ok: false, error: "Geçersiz durum." };
  }
  const target = next as QuoteStatus;

  const quote = await prisma.quoteRequest.findUnique({
    where: { id: quoteId },
    select: { status: true },
  });
  if (!quote) return { ok: false, error: "Teklif bulunamadı." };

  if (!canTransition(quote.status, target)) {
    return { ok: false, error: "Bu duruma geçiş yapılamaz." };
  }

  // POLICE_YAPILDI → başlangıç + bitiş tarihi zorunlu (K32).
  let start: Date | null = null;
  let end: Date | null = null;
  if (target === "POLICE_YAPILDI") {
    start = parseDate(policy?.start);
    end = parseDate(policy?.end);
    if (!start || !end) {
      return { ok: false, error: "Poliçe başlangıç ve bitiş tarihi zorunludur." };
    }
    if (end <= start) {
      return { ok: false, error: "Bitiş tarihi başlangıçtan sonra olmalıdır." };
    }
  }

  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: { status: target }, // updatedAt @updatedAt ile otomatik (docs/05).
  });

  // Tarihler durum güncellemesinden sonra ayarlanır (POLICE_YAPILDI akışı, docs/12).
  if (target === "POLICE_YAPILDI") {
    await setPolicyDates(quoteId, { start, end });
  }

  revalidatePath(`/teklifler/${quoteId}`);
  revalidatePath("/teklifler");
  revalidatePath("/policeler");
  return { ok: true };
}

/**
 * Mevcut POLICE_YAPILDI teklifine sonradan poliçe tarihi girer/günceller (K32 / docs/12).
 * Tarihsiz kaydı düzeltmek için. Durum kontrolü: yalnız POLICE_YAPILDI'da anlamlı.
 */
export async function setPolicyDatesAction(
  quoteId: string,
  startStr: string,
  endStr: string,
): Promise<ActionResult> {
  await requireAuth();

  if (!isValidObjectId(quoteId)) return { ok: false, error: "Geçersiz teklif." };

  const start = parseDate(startStr);
  const end = parseDate(endStr);
  if (!start || !end) return { ok: false, error: "Geçerli başlangıç ve bitiş tarihi girin." };
  if (end <= start) return { ok: false, error: "Bitiş tarihi başlangıçtan sonra olmalıdır." };

  const updated = await setPolicyDates(quoteId, { start, end });
  if (!updated) return { ok: false, error: "Teklif bulunamadı." };

  revalidatePath(`/teklifler/${quoteId}`);
  revalidatePath("/policeler");
  return { ok: true };
}

/** Zaman damgalı not ekler (Note modeli). */
export async function addNoteAction(quoteId: string, body: string): Promise<ActionResult> {
  await requireAuth();

  if (!isValidObjectId(quoteId)) return { ok: false, error: "Geçersiz teklif." };

  const text = body.trim();
  if (!text) return { ok: false, error: "Not boş olamaz." };
  if (text.length > 5000) return { ok: false, error: "Not çok uzun." };

  const quote = await prisma.quoteRequest.findUnique({
    where: { id: quoteId },
    select: { id: true },
  });
  if (!quote) return { ok: false, error: "Teklif bulunamadı." };

  await prisma.note.create({ data: { quoteId, body: text } });

  revalidatePath(`/teklifler/${quoteId}`);
  return { ok: true };
}

/** KVKK: teklifi ve ilişkili veriyi KALICI siler (kvkk.ts util). */
export async function deleteQuoteAction(quoteId: string): Promise<void> {
  await requireAuth();
  // ObjectId guard (docs/13 §O1) — geçersiz id'de Prisma'ya gitme, sadece listeye dön.
  if (isValidObjectId(quoteId)) {
    await deleteQuoteRequest(quoteId);
    revalidatePath("/teklifler");
  }
  redirect("/teklifler");
}

/** KVKK: teklifi anonimleştirir (kişisel veri maskelenir, istatistik kalır). */
export async function anonymizeQuoteAction(quoteId: string): Promise<ActionResult> {
  await requireAuth();
  if (!isValidObjectId(quoteId)) return { ok: false, error: "Geçersiz teklif." };
  const result = await anonymizeQuoteRequest(quoteId);
  if (!result) return { ok: false, error: "Teklif bulunamadı." };
  revalidatePath(`/teklifler/${quoteId}`);
  revalidatePath("/teklifler");
  return { ok: true };
}

// Teslim belgesi azami boyut (MB). Boyut sunucuda validateUpload'da kesin uygulanır.
const MAX_DELIVERY_MB = 15;

/** Blob içindeki teslim belgesi yolu. kind: "police" | "teklif". */
function buildDeliveryPath(
  kind: "police" | "teklif",
  quoteId: string,
  originalName: string,
): string {
  const safe = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-60);
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${kind}/${quoteId}/${unique}-${safe}`;
}

/** Müşterinin durum-takip sayfası tam URL'i (docs/12 §3). Takip kodu yoksa undefined. */
function buildStatusUrl(trackingCode: string | null, locale: string): string | undefined {
  if (!trackingCode) return undefined;
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://dogukanozgan.com").replace(/\/+$/, "");
  const seg = locale === "en" ? "quote-status" : "teklif-durumu";
  const loc = locale === "en" ? "en" : "tr";
  return `${base}/${loc}/${seg}?code=${encodeURIComponent(trackingCode)}`;
}

/**
 * MÜŞTERİYE TESLİM (docs/05, docs/12 §2/§5) — `uploadAndSendPolicyAction`'ın yerini alan
 * genelleştirilmiş action. Durum TEKLIF_VERILDI veya POLICE_YAPILDI işaretlenince modaldan
 * çağrılır. Akış:
 *   1) requireAuth + ObjectId guard.
 *   2) Durum geçiş kuralını doğrula (canTransition; POLICE_YAPILDI yalnız TEKLIF_VERILDI'den).
 *   3) POLICE_YAPILDI ise poliçe başlangıç + bitiş tarihi ZORUNLU (K32).
 *   4) Dosya verildiyse: validateUpload (SUNUCUDA, magic-byte) → uploadToStorage (Blob) →
 *      Asset kaydı (police → attachPolicyDocument/policyAssetId; teklif → kind="teklif").
 *   5) Durumu güncelle + (varsa) poliçe tarihlerini ayarla.
 *   6) statusOnly değilse e-posta: sendCustomerDelivery (ek = admin'in yüklediği belgenin
 *      HAM BAYTLARI; mesaj React Email kaçışlı → XSS yok). E-posta yapılandırılmamış / e-posta
 *      yoksa AKIŞ KIRILMAZ; durum yine güncellenir, uygun Not düşülür.
 *   7) Zaman damgalı Not ekle (gönderildi/dosya var-yok/mesaj var-yok).
 */
export async function deliverToCustomerAction(
  quoteId: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuth();

  // ObjectId guard (docs/13 §O1).
  if (!isValidObjectId(quoteId)) return { ok: false, error: "Geçersiz teklif." };

  // 1) Hedef durum + teslim türü.
  const statusRaw = String(formData.get("status") ?? "");
  if (!QUOTE_STATUSES.includes(statusRaw as QuoteStatus)) {
    return { ok: false, error: "Geçersiz durum." };
  }
  const target = statusRaw as QuoteStatus;
  const kind = deliveryKindForStatus(target);
  if (!kind) return { ok: false, error: "Bu durum teslim akışına uygun değil." };

  const statusOnly = formData.get("statusOnly") === "1";
  const message = String(formData.get("message") ?? "").trim();
  if (message.length > 3000) return { ok: false, error: "Mesaj çok uzun." };

  // 2) Mevcut durum + geçiş kuralı (istemciye GÜVENME — docs/05 sunucu doğrulaması).
  const quote = await prisma.quoteRequest.findUnique({
    where: { id: quoteId },
    select: {
      id: true,
      status: true,
      email: true,
      product: true,
      locale: true,
      trackingCode: true,
    },
  });
  if (!quote) return { ok: false, error: "Teklif bulunamadı." };

  // Aynı duruma yeniden teslim (örn. POLICE_YAPILDI iken tekrar belge gönder) serbest.
  if (quote.status !== target && !canTransition(quote.status, target)) {
    if (target === "POLICE_YAPILDI") {
      return { ok: false, error: "Önce 'Teklif Verildi' yapın." };
    }
    return { ok: false, error: "Bu duruma geçiş yapılamaz." };
  }

  // 3) POLICE_YAPILDI → poliçe tarihleri ZORUNLU (K32).
  let pStart: Date | null = null;
  let pEnd: Date | null = null;
  if (target === "POLICE_YAPILDI") {
    pStart = parseDate(String(formData.get("policyStart") ?? ""));
    pEnd = parseDate(String(formData.get("policyEnd") ?? ""));
    if (!pStart || !pEnd) {
      return { ok: false, error: "Poliçe başlangıç ve bitiş tarihi zorunludur." };
    }
    if (pEnd <= pStart) {
      return { ok: false, error: "Bitiş tarihi başlangıçtan sonra olmalıdır." };
    }
  }

  // 4) Dosya (opsiyonel). Verildiyse SUNUCUDA doğrula → Blob → Asset.
  const rawFile = formData.get("file");
  const hasFile = rawFile instanceof File && rawFile.size > 0;
  let attachmentBytes: Uint8Array | null = null;
  let attachmentName: string | null = null;
  let attachmentMime: string | null = null;

  if (hasFile) {
    const file = rawFile as File;
    // Boyut + içerik imzası (magic-byte) — istemci file.type'ına güvenilmez (docs/13 §K2).
    const validation = await validateUpload(file, {
      allowed: ["pdf", "jpeg", "png", "webp"],
      maxSizeMb: MAX_DELIVERY_MB,
    });
    if (!validation.ok) {
      if (validation.reason === "too-large") {
        return { ok: false, error: `Belge çok büyük (en fazla ${MAX_DELIVERY_MB} MB).` };
      }
      return { ok: false, error: "Geçersiz dosya türü; yalnız PDF/JPG/PNG/WEBP yüklenebilir." };
    }
    if (!isStorageConfigured()) {
      return { ok: false, error: "Depolama yapılandırılmadı (BLOB_READ_WRITE_TOKEN eksik)." };
    }

    // Ham baytlar: hem Blob'a yüklenir hem maile EK olarak doğrudan eklenir (istek md.3).
    const buf = await file.arrayBuffer();
    attachmentBytes = new Uint8Array(buf);
    attachmentName = file.name;
    attachmentMime = validation.mime;

    let uploaded: { url: string; path: string };
    try {
      uploaded = await uploadToStorage({
        path: buildDeliveryPath(kind, quoteId, file.name),
        body: attachmentBytes,
        contentType: validation.mime, // İmza-doğrulanmış MIME (docs/13 §K2).
      });
    } catch (err) {
      logError("[teklif-detay] teslim belgesi yükleme hatası:", err);
      return { ok: false, error: "Belge yüklenemedi." };
    }

    if (kind === "police") {
      // Poliçe belgesi: Asset(kind="police") + QuoteRequest.policyAssetId (docs/12 §1).
      const attached = await attachPolicyDocument(quoteId, {
        url: uploaded.url,
        path: uploaded.path,
        mimeType: validation.mime,
        sizeBytes: file.size,
      });
      if (!attached) return { ok: false, error: "Belge teklife bağlanamadı." };
    } else {
      // Teklif belgesi: genel Asset(kind="teklif").
      await prisma.asset.create({
        data: {
          quoteId,
          kind: "teklif",
          url: uploaded.url,
          path: uploaded.path,
          mimeType: validation.mime,
          sizeBytes: file.size,
        },
      });
    }
  }

  // 5) Durumu güncelle + (POLICE_YAPILDI) poliçe tarihleri.
  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: { status: target }, // updatedAt @updatedAt ile otomatik.
  });
  if (target === "POLICE_YAPILDI" && pStart && pEnd) {
    await setPolicyDates(quoteId, { start: pStart, end: pEnd });
  }

  // 6) E-posta (statusOnly değilse). Yapılandırma/e-posta yoksa akış KIRILMAZ.
  let mailNote: string;
  if (statusOnly) {
    mailNote = "mail gönderilmedi (yalnız durum güncellendi)";
  } else if (!quote.email) {
    mailNote = "mail gönderilemedi (müşteri e-postası yok)";
  } else if (!isEmailConfigured()) {
    mailNote = "mail gönderilemedi (e-posta yapılandırması yok)";
  } else {
    const sent = await sendCustomerDelivery({
      to: quote.email,
      kind,
      productName: productLabel(quote.product),
      message: message || undefined,
      // EK = admin'in yüklediği belgenin HAM BAYTLARI (istek md.3).
      attachment:
        attachmentBytes && attachmentName && attachmentMime
          ? {
              filename: attachmentName,
              content: attachmentBytes,
              contentType: attachmentMime,
            }
          : undefined,
      statusUrl: buildStatusUrl(quote.trackingCode, quote.locale),
      locale: quote.locale,
    });
    mailNote = sent.ok ? "mail gönderildi" : "mail gönderilemedi (gönderim hatası)";
  }

  // 7) Zaman damgalı Not (Note modeli) — kanıt/izleme.
  const label = kind === "teklif" ? "Teklif" : "Poliçe";
  await prisma.note.create({
    data: {
      quoteId,
      body:
        `${label} müşteriye gönderildi — dosya: ${hasFile ? "var" : "yok"}, ` +
        `mesaj: ${message ? "var" : "yok"}; ${mailNote}.`,
    },
  });

  revalidatePath(`/teklifler/${quoteId}`);
  revalidatePath("/teklifler");
  revalidatePath("/policeler");
  return { ok: true };
}
