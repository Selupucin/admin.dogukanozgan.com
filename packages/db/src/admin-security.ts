// @do/db — Admin boşta-kilit PIN yardımcıları. docs/05 "Boşta Kilit / PIN".
//
// Panel oturumu açıkken bir süre boşta kalınca tam ekran kilit overlay 4 haneli PIN
// ister (şifre tekrar sorulmaz). Bu modül PIN'i bcrypt ile hash'leyip User.pinHash'te
// tutar (mevcut auth.ts'teki hashPassword/verifyPassword bcrypt'i kullanılır), kilit
// süresini (lockTimeoutMinutes) okur/yazar.
//
// GÜVENLİK:
//   - Düz PIN ASLA saklanmaz/loglanmaz; yalnız bcrypt hash tutulur.
//   - PIN doğrulaması sabit-zamanlı bcrypt compare ile (pinHash yoksa false).
//   - 4 haneli biçim (/^\d{4}$/) sunucuda zorunlu doğrulanır.
//   - lockTimeoutMinutes yalnız izinli değerler (0/5/15/30/60); 0 = kilit kapalı.
//
// ⚠️ YALNIZCA SUNUCU tarafı (bcrypt + DB). İstemciye import edilmez.

import { prisma } from "./index";
import { hashPassword, verifyPassword } from "./auth";

/** İzin verilen kilit süreleri (dakika). 0 = kilit KAPALI. docs/05. */
export const ALLOWED_LOCK_TIMEOUTS = [0, 5, 15, 30, 60] as const;
export type LockTimeoutMinutes = (typeof ALLOWED_LOCK_TIMEOUTS)[number];

/** 4 haneli PIN biçim kontrolü (yalnız rakam). */
const PIN_PATTERN = /^\d{4}$/;

/** PIN biçimsel olarak geçerli mi (4 hane, yalnız rakam)? */
export function isValidPinFormat(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}

/** Bir değer izin verilen kilit süresi mi (UI'dan gelen değeri güvenle daraltır)? */
export function isAllowedLockTimeout(value: unknown): value is LockTimeoutMinutes {
  return typeof value === "number" && (ALLOWED_LOCK_TIMEOUTS as readonly number[]).includes(value);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * 4 haneli PIN'i bcrypt ile hash'leyip User.pinHash + pinUpdatedAt'e yazar.
 * Biçim geçersizse `{ ok: false }`. Düz PIN saklanmaz.
 */
export async function setUserPin(
  email: string,
  pin: string,
): Promise<{ ok: true } | { ok: false }> {
  const trimmed = pin.trim();
  if (!isValidPinFormat(trimmed)) return { ok: false };

  const pinHash = await hashPassword(trimmed);
  await prisma.user.update({
    where: { email: normalizeEmail(email) },
    data: { pinHash, pinUpdatedAt: new Date() },
  });
  return { ok: true };
}

/**
 * Girilen PIN'i kullanıcının pinHash'i ile sabit-zamanlı bcrypt compare ile doğrular.
 * pinHash yoksa (PIN kurulmamış) veya biçim hatalıysa false. fail-closed: hata → false.
 */
export async function verifyUserPin(email: string, pin: string): Promise<boolean> {
  const trimmed = pin.trim();
  if (!isValidPinFormat(trimmed)) {
    // Zamanlama sızıntısını azaltmak için yine de bir bcrypt karşılaştırması yap.
    await verifyPassword(trimmed, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
    return false;
  }

  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  if (!user?.pinHash) {
    await verifyPassword(trimmed, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
    return false;
  }
  return verifyPassword(trimmed, user.pinHash);
}

/** Kullanıcının güvenlik durumu — UI ilk-giriş modalı + ayarlar için. */
export interface AdminSecurity {
  /** PIN ayarlandı mı (pinHash var mı)? false → ilk-giriş modalı gösterilir. */
  hasPin: boolean;
  /** Boşta kilit süresi (dakika). 0 = kilit kapalı. */
  lockTimeoutMinutes: number;
}

/**
 * Kullanıcının PIN durumunu + kilit süresini döner. Kullanıcı yoksa güvenli varsayılan
 * (PIN yok, 15 dk) döner — çağıran ilk-giriş modalını gösterir.
 */
export async function getAdminSecurity(email: string): Promise<AdminSecurity> {
  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
    select: { pinHash: true, lockTimeoutMinutes: true },
  });
  return {
    hasPin: Boolean(user?.pinHash),
    lockTimeoutMinutes: user?.lockTimeoutMinutes ?? 15,
  };
}

/**
 * Boşta kilit süresini günceller (yalnız izinli değerler 0/5/15/30/60). 0 = kapalı.
 * İzinsiz değerde `{ ok: false }`.
 */
export async function updateLockTimeout(
  email: string,
  minutes: number,
): Promise<{ ok: true } | { ok: false }> {
  if (!isAllowedLockTimeout(minutes)) return { ok: false };
  await prisma.user.update({
    where: { email: normalizeEmail(email) },
    data: { lockTimeoutMinutes: minutes },
  });
  return { ok: true };
}

/**
 * PIN değiştirir: önce eski PIN'i doğrula → sonra yeni PIN'i ayarla. Eski PIN yanlışsa
 * veya yeni PIN biçimi geçersizse `{ ok: false }`. Düz PIN saklanmaz/loglanmaz.
 */
export async function changeUserPin(
  email: string,
  oldPin: string,
  newPin: string,
): Promise<{ ok: true } | { ok: false }> {
  const oldOk = await verifyUserPin(email, oldPin);
  if (!oldOk) return { ok: false };
  return setUserPin(email, newPin);
}
