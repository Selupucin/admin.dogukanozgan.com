"use server";

// Teklif detayı Server Action'ları — durum değiştir, not ekle, sil, anonimleştir.
// Kaynak: docs/05 (CRM durum/not, KVKK sil/anonimleştir), docs/06 (erişim güvenliği).
//
// GÜVENLİK: Her action başında oturum kontrolü (docs/05 "Tüm admin server
// action'larında oturum kontrolü"). Oturum yoksa işlem reddedilir.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma, deleteQuoteRequest, anonymizeQuoteRequest, type QuoteStatus } from "@do/db";
import { auth } from "@/auth";
import { canTransition, QUOTE_STATUSES } from "@/lib/crm";

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

/** CRM durumunu değiştirir (docs/05 akışına göre geçiş doğrulanır). */
export async function updateStatusAction(quoteId: string, next: string): Promise<ActionResult> {
  await requireAuth();

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

  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: { status: target }, // updatedAt @updatedAt ile otomatik (docs/05).
  });

  revalidatePath(`/teklifler/${quoteId}`);
  revalidatePath("/teklifler");
  return { ok: true };
}

/** Zaman damgalı not ekler (Note modeli). */
export async function addNoteAction(quoteId: string, body: string): Promise<ActionResult> {
  await requireAuth();

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
  await deleteQuoteRequest(quoteId);
  revalidatePath("/teklifler");
  redirect("/teklifler");
}

/** KVKK: teklifi anonimleştirir (kişisel veri maskelenir, istatistik kalır). */
export async function anonymizeQuoteAction(quoteId: string): Promise<ActionResult> {
  await requireAuth();
  const result = await anonymizeQuoteRequest(quoteId);
  if (!result) return { ok: false, error: "Teklif bulunamadı." };
  revalidatePath(`/teklifler/${quoteId}`);
  revalidatePath("/teklifler");
  return { ok: true };
}
