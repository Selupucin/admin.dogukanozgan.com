"use server";

// Admin boşta-kilit PIN — Server Action'ları. docs/05 "Boşta Kilit / PIN".
//
// AKIŞ:
//   setupPinAction        — ilk giriş: 4 haneli PIN + doğrulama eşleşirse setUserPin.
//   unlockAction          — kilit ekranı: PIN doğrula (verifyUserPin). 5 yanlış → signOut.
//   updateLockTimeoutAction— ayarlar: kilit süresi (0/5/15/30/60).
//   changePinAction       — ayarlar: eski PIN → yeni PIN → doğrulama.
//   requestPinResetAction — "PIN'i unuttum": e-postaya geçici kod (mevcut OTP altyapısı).
//   confirmPinResetAction — maildeki kod doğru → yeni PIN ayarla + kodu temizle.
//
// GÜVENLİK:
//   - TÜM action'lar requireAuth (oturumdaki kullanıcının email'i kullanılır; istemciye
//     güvenilmez). Düz PIN saklanmaz/loglanmaz.
//   - unlock yanlış denemeleri rate-limit + sayaç ile sınırlanır (5 yanlış → tam çıkış).
//   - PIN sıfırlama e-posta kodu mevcut hash'li LoginCode altyapısını kullanır
//     (issueLoginCode/verifyLoginCode/clearLoginCode + sendLoginCode). Yeni e-posta YAZILMADI.
//   - Kilit overlay yalnız UI gate; oturum JWT geçerli kalır ama PIN doğrulaması SUNUCUDA.

import { headers } from "next/headers";
import {
  setUserPin,
  verifyUserPin,
  changeUserPin,
  updateLockTimeout,
  isAllowedLockTimeout,
  isValidPinFormat,
  checkRateLimit,
  resetRateLimit,
  getClientIp,
  issueLoginCode,
  verifyLoginCode,
  clearLoginCode,
} from "@do/db";
import { sendLoginCode } from "@do/email";
import { auth, signOut } from "@/auth";

/** Action'ların ortak dönüş şekli (UI net başarı/hata mesajı gösterir). */
export type SecurityActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string }
  // unlock: çok yanlış deneme → istemci tam çıkış yapsın (signOut ulaşılamadıysa).
  | { ok: false; error: string; signOut: true };

const GENERIC_ERROR = "İşlem tamamlanamadı, lütfen tekrar deneyin.";
const RATE_LIMITED_ERROR = "Çok fazla deneme yapıldı. Lütfen bir süre sonra tekrar deneyin.";
const PIN_FORMAT_ERROR = "PIN 4 rakamdan oluşmalıdır.";
const PIN_MISMATCH_ERROR = "Girilen PIN'ler eşleşmiyor.";

/** Yanlış unlock denemesi: bu kadar yanlıştan sonra tam çıkış (signOut). */
const UNLOCK_MAX_ATTEMPTS = 5;
/** unlock rate-limit penceresi (kaba kuvvet kilidi). */
const UNLOCK_RATE_LIMIT = { limit: UNLOCK_MAX_ATTEMPTS, windowMs: 15 * 60 * 1000 };
/** PIN sıfırlama e-posta kodu istek limiti (e-posta spam'ini sınırla). */
const RESET_REQUEST_RATE_LIMIT = { limit: 3, windowMs: 15 * 60 * 1000 };

/** Oturumu zorunlu kılar; oturumdaki (güvenilir) e-postayı döndürür. */
async function requireEmail(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error("Yetkisiz: oturum gerekli.");
  return email.trim().toLowerCase();
}

// ───────────────────────────── İlk PIN kurulumu ─────────────────────────────

export async function setupPinAction(formData: FormData): Promise<SecurityActionResult> {
  const email = await requireEmail();
  const pin = String(formData.get("pin") ?? "").trim();
  const confirm = String(formData.get("confirm") ?? "").trim();

  if (!isValidPinFormat(pin)) return { ok: false, error: PIN_FORMAT_ERROR };
  if (pin !== confirm) return { ok: false, error: PIN_MISMATCH_ERROR };

  const res = await setUserPin(email, pin);
  if (!res.ok) return { ok: false, error: PIN_FORMAT_ERROR };
  return { ok: true, message: "PIN oluşturuldu." };
}

// ───────────────────────────── Kilit açma (unlock) ─────────────────────────────

export async function unlockAction(formData: FormData): Promise<SecurityActionResult> {
  const email = await requireEmail();
  const pin = String(formData.get("pin") ?? "").trim();

  const hdrs = await headers();
  const ip = getClientIp(hdrs);
  const rlKey = `admin-unlock:${ip}:${email}`;

  // Kaba kuvvet kilidi (PIN doğrulamasından ÖNCE). fail-safe: DB hatasında izin verir.
  const rl = await checkRateLimit({ key: rlKey, ...UNLOCK_RATE_LIMIT });
  if (!rl.allowed) {
    // Limit doldu → güvenlik gereği tam çıkış yap.
    await signOut({ redirectTo: "/login" });
    return { ok: false, error: RATE_LIMITED_ERROR, signOut: true };
  }

  const ok = await verifyUserPin(email, pin);
  if (!ok) {
    // Bu deneme sonrası limit doldu mu? Dolduysa tam çıkış (5. yanlış).
    if (rl.remaining <= 0) {
      await signOut({ redirectTo: "/login" });
      return {
        ok: false,
        error: "Çok fazla yanlış deneme. Güvenlik için çıkış yapıldı.",
        signOut: true,
      };
    }
    return { ok: false, error: "PIN hatalı. Tekrar deneyin." };
  }

  // Başarılı → bu kullanıcının unlock sayacını sıfırla (meşru kullanıcı kilitlenmesin).
  await resetRateLimit(rlKey);
  return { ok: true };
}

// ───────────────────────────── Kilit süresi ─────────────────────────────

export async function updateLockTimeoutAction(minutes: number): Promise<SecurityActionResult> {
  const email = await requireEmail();
  if (!isAllowedLockTimeout(minutes)) return { ok: false, error: GENERIC_ERROR };
  const res = await updateLockTimeout(email, minutes);
  if (!res.ok) return { ok: false, error: GENERIC_ERROR };
  return {
    ok: true,
    message:
      minutes === 0
        ? "Otomatik kilit kapatıldı."
        : `Kilit süresi ${minutes} dakika olarak ayarlandı.`,
  };
}

// ───────────────────────────── PIN değiştir ─────────────────────────────

export async function changePinAction(formData: FormData): Promise<SecurityActionResult> {
  const email = await requireEmail();
  const oldPin = String(formData.get("oldPin") ?? "").trim();
  const newPin = String(formData.get("newPin") ?? "").trim();
  const confirm = String(formData.get("confirm") ?? "").trim();

  if (!isValidPinFormat(newPin)) return { ok: false, error: PIN_FORMAT_ERROR };
  if (newPin !== confirm) return { ok: false, error: PIN_MISMATCH_ERROR };

  const res = await changeUserPin(email, oldPin, newPin);
  if (!res.ok) {
    // Eski PIN yanlış ya da yeni PIN biçimi geçersiz — genel hata (enumerasyon yok).
    return { ok: false, error: "Mevcut PIN hatalı veya yeni PIN geçersiz." };
  }
  return { ok: true, message: "PIN güncellendi." };
}

// ───────────────────────────── PIN sıfırlama (e-posta kodu) ─────────────────────────────

export async function requestPinResetAction(): Promise<SecurityActionResult> {
  const email = await requireEmail();

  const hdrs = await headers();
  const ip = getClientIp(hdrs);
  const rl = await checkRateLimit({
    key: `admin-pin-reset:${ip}:${email}`,
    ...RESET_REQUEST_RATE_LIMIT,
  });
  if (!rl.allowed) return { ok: false, error: RATE_LIMITED_ERROR };

  // Mevcut hash'li LoginCode altyapısı: 6 haneli kod üret + e-postayla gönder.
  try {
    const { code, expiresMinutes } = await issueLoginCode(email);
    const sent = await sendLoginCode({ to: email, code, expiresMinutes, locale: "tr" });
    if (!sent.ok)
      return { ok: false, error: "Kod gönderilemedi, lütfen daha sonra tekrar deneyin." };
  } catch {
    return { ok: false, error: "Kod gönderilemedi, lütfen daha sonra tekrar deneyin." };
  }

  return { ok: true, message: "Geçici kod e-posta adresinize gönderildi." };
}

export async function confirmPinResetAction(formData: FormData): Promise<SecurityActionResult> {
  const email = await requireEmail();
  const emailCode = String(formData.get("emailCode") ?? "").trim();
  const newPin = String(formData.get("newPin") ?? "").trim();
  const confirm = String(formData.get("confirm") ?? "").trim();

  if (!isValidPinFormat(newPin)) return { ok: false, error: PIN_FORMAT_ERROR };
  if (newPin !== confirm) return { ok: false, error: PIN_MISMATCH_ERROR };

  const result = await verifyLoginCode(email, emailCode);
  if (!result.ok) {
    // expired/locked/mismatch → genel hata (enumerasyon yok).
    return { ok: false, error: "Kod hatalı veya süresi dolmuş. Lütfen yeni kod isteyin." };
  }

  const res = await setUserPin(email, newPin);
  if (!res.ok) return { ok: false, error: PIN_FORMAT_ERROR };

  // Kullanılan kodu temizle.
  await clearLoginCode(email);
  return { ok: true, message: "Yeni PIN oluşturuldu." };
}
