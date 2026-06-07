"use server";

// İletişim talebi gönderimi — Server Action (K31 / docs/12 §3). İSKELET.
// Kaynak: docs/12 (ContactRequest → DB + ILETISIM bildirimi), docs/06 (KVKK rıza +
// kanıt + rate limit). UI'yi (form bileşeni) web-builder bağlayacak.
//
// AKIŞ (submit-quote desenine benzer):
//  1) Rate limit (IP başına) — spam koruması (docs/06 §6).
//  2) Honeypot — gizli alan doluysa bot kabul et, reddet.
//  3) Zod ile SUNUCU TARAFINDA doğrula (istemciye güvenme).
//  4) KVKK rıza kontrolü: kvkkConsent zorunlu; yoksa REDDET.
//  5) createContactRequest → kayıt + ILETISIM bildirimi (rıza kanıtı: zaman/IP/UA).

import { headers } from "next/headers";
import { z } from "zod";
import { createContactRequest } from "@do/db";
import { rateLimit } from "./rate-limit";

export interface SubmitContactResult {
  ok: boolean;
  error?: "rateLimited" | "validation" | "consentRequired" | "server";
  fieldErrors?: Record<string, string>;
  contactId?: string;
}

// Rate limit: 15 dakikalık pencerede IP başına 5 gönderim (teklif formundan biraz katı).
// TODO(doc): Üretim eşiği netleşince ayarlanır (docs/06 §6).
const RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

const HONEYPOT_FIELD = "website";

// Sunucu-tarafı doğrulama şeması. Mesajlar nötr anahtar; UI i18n ile gösterir.
const contactSchema = z.object({
  fullName: z.string().trim().min(2, "fullName").max(120),
  phone: z.string().trim().min(7, "phone").max(30),
  email: z
    .string()
    .trim()
    .email("email")
    .max(160)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  subject: z.string().trim().max(160).optional(),
  message: z.string().trim().min(5, "message").max(5000),
  kvkkConsent: z.literal(true, { message: "kvkkConsent" }),
});

export async function submitContactRequest(formData: FormData): Promise<SubmitContactResult> {
  try {
    const hdrs = await headers();
    const ip = clientIp(hdrs);
    const userAgent = hdrs.get("user-agent") ?? null;

    // 1) Rate limit.
    const rl = rateLimit(`contact:${ip}`, RATE_LIMIT);
    if (!rl.ok) {
      return { ok: false, error: "rateLimited" };
    }

    // 2) Honeypot.
    if (typeof formData.get(HONEYPOT_FIELD) === "string" && formData.get(HONEYPOT_FIELD)) {
      return { ok: false, error: "server" };
    }

    // 3) Değerleri topla + doğrula.
    const values = {
      fullName: strOrUndef(formData.get("fullName")),
      phone: strOrUndef(formData.get("phone")),
      email: strOrUndef(formData.get("email")),
      subject: strOrUndef(formData.get("subject")),
      message: strOrUndef(formData.get("message")),
      kvkkConsent: toBool(formData.get("kvkkConsent")),
    };

    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "_");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      // 4) Rıza eksikliği özel hata olarak ayrıştırılır.
      if (fieldErrors.kvkkConsent) {
        return { ok: false, error: "consentRequired", fieldErrors };
      }
      return { ok: false, error: "validation", fieldErrors };
    }

    const data = parsed.data;

    // 4b) Defansif rıza teyidi (şema zaten zorunlu kılar).
    if (data.kvkkConsent !== true) {
      return { ok: false, error: "consentRequired" };
    }

    // 5) Kayıt + ILETISIM bildirimi (rıza kanıtı: zaman/IP/UA — @do/db içinde).
    const contact = await createContactRequest({
      fullName: data.fullName,
      phone: data.phone,
      email: data.email ?? null,
      subject: data.subject ?? null,
      message: data.message,
      consentKvkk: true,
      consentIp: ip,
      consentUserAgent: userAgent,
    });

    return { ok: true, contactId: contact.id };
  } catch (err) {
    console.error("[submit-contact] unexpected error:", err);
    return { ok: false, error: "server" };
  }
}

// ── Yardımcılar ───────────────────────────────────────────────────────────────

function strOrUndef(v: FormDataEntryValue | null): string | undefined {
  if (v == null) return undefined;
  const s = String(v);
  return s;
}

function toBool(v: FormDataEntryValue | null): boolean {
  if (v == null) return false;
  const s = String(v).toLowerCase();
  return s === "true" || s === "on" || s === "1" || s === "yes";
}

function clientIp(hdrs: Headers): string {
  const fwd = hdrs.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return hdrs.get("x-real-ip") ?? "unknown";
}
