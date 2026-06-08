// Admin 2 adımlı giriş — HMAC imzalı yük (token) yardımcıları. docs/05.
//
// Üç ayrı imzalı yük vardır (hepsi AUTH_SECRET ile HMAC-SHA256, ayrı "purpose" etiketiyle):
//   1) Bekleyen-giriş (pending) çerezi: şifre doğrulandı ama OTP bekleniyor (~10dk).
//   2) Güvenilen-cihaz (trusted-device) çerezi: OTP atlamak için (kullanıcı + seçilen süre).
//   3) Login ticket: OTP/güvenilen-cihaz sunucuda doğrulandıktan SONRA signIn'e verilir.
//
// TASARIM:
//   - Format: base64url(JSON payload) + "." + base64url(HMAC). JWT'ye gerek yok; minimal.
//   - "purpose" alanı her yükte FARKLI → bir tür token başka yerde KULLANILAMAZ
//     (örn. pending çerezi ticket olarak geçemez). Cross-protocol kötüye kullanımı önler.
//   - `exp` (ms epoch) her yükte var; doğrulama sırasında süre kontrol edilir.
//   - HMAC sabit-zamanlı karşılaştırılır (timingSafeEqual).
//   - AUTH_SECRET yalnız sunucuda; bu modül "use server" action'lardan import edilir.
//
// ⚠️ YALNIZCA SUNUCU tarafı. İstemciye import edilmez.

import { createHmac, timingSafeEqual } from "node:crypto";

/** Seçilebilir oturum süreleri (docs istek: 1 ay / 6 ay / 1 yıl / her zaman). */
export type SessionDuration = "1m" | "6m" | "1y" | "forever";

/** "Beni hatırla" işaretli değilken kısa oturum (12 saat) — istek 4. */
export const SHORT_SESSION_MS = 12 * 60 * 60 * 1000;

/** Süre kodunu ms'ye çevirir. "forever" ~10 yıl (pratikte sınırsız). */
export function durationToMs(duration: SessionDuration): number {
  const DAY = 24 * 60 * 60 * 1000;
  switch (duration) {
    case "1m":
      return 30 * DAY;
    case "6m":
      return 182 * DAY;
    case "1y":
      return 365 * DAY;
    case "forever":
      return 3650 * DAY; // ~10 yıl
  }
}

/** Geçerli süre kodu mu (UI'dan gelen string'i güvenle daraltır). */
export function isSessionDuration(v: unknown): v is SessionDuration {
  return v === "1m" || v === "6m" || v === "1y" || v === "forever";
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET zorunludur (login token imzası için). docs/13 §O2.");
  }
  return secret;
}

function b64urlEncode(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function hmac(data: string): Buffer {
  return createHmac("sha256", getSecret()).update(data).digest();
}

/** İmzalı yük üretir: base64url(payload) + "." + base64url(hmac). */
function sign(payload: Record<string, unknown>): string {
  const body = b64urlEncode(JSON.stringify(payload));
  const sig = b64urlEncode(hmac(body));
  return `${body}.${sig}`;
}

/** İmzalı yükü doğrular + `exp` süresini kontrol eder. Geçersizse null döner. */
function verify(token: string | undefined | null): Record<string, unknown> | null {
  if (!token || typeof token !== "string") return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  // İmza eşleşmesi (sabit-zamanlı).
  let providedSig: Buffer;
  try {
    providedSig = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }
  const expectedSig = hmac(body);
  if (providedSig.length !== expectedSig.length) return null;
  if (!timingSafeEqual(providedSig, expectedSig)) return null;

  // Yük çöz + exp kontrolü.
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  const exp = typeof payload.exp === "number" ? payload.exp : 0;
  if (!exp || Date.now() > exp) return null;
  return payload;
}

// ───────────────────────────── 1) Bekleyen-giriş (pending) ─────────────────────────────

const PENDING_PURPOSE = "pending-login";

export interface PendingLoginData {
  email: string;
  remember: boolean;
  duration: SessionDuration;
}

/** Bekleyen-giriş çerezi içeriğini imzalar (~10dk). Şifre DOĞRULANMIŞTIR (yeniden sorulmaz). */
export function signPendingLogin(data: PendingLoginData, ttlMs: number): string {
  return sign({
    p: PENDING_PURPOSE,
    email: data.email,
    remember: data.remember,
    duration: data.duration,
    exp: Date.now() + ttlMs,
  });
}

/** Bekleyen-giriş çerezini doğrular. Geçersiz/expired → null. */
export function verifyPendingLogin(token: string | undefined | null): PendingLoginData | null {
  const payload = verify(token);
  if (!payload || payload.p !== PENDING_PURPOSE) return null;
  const email = typeof payload.email === "string" ? payload.email : "";
  const remember = payload.remember === true;
  const duration = isSessionDuration(payload.duration) ? payload.duration : "1m";
  if (!email) return null;
  return { email, remember, duration };
}

// ───────────────────────────── 2) Güvenilen cihaz ─────────────────────────────

const TRUSTED_PURPOSE = "trusted-device";

/**
 * Güvenilen-cihaz çerezini imzalar. `ttlMs` = seçilen oturum süresi (çerez expiry'siyle aynı).
 * Bu kullanıcıya bağlıdır (email) → başka kullanıcı için OTP atlanamaz.
 */
export function signTrustedDevice(email: string, ttlMs: number): string {
  return sign({ p: TRUSTED_PURPOSE, email, exp: Date.now() + ttlMs });
}

/** Güvenilen-cihaz çerezi bu e-posta için geçerli mi (imza + süre + kullanıcı eşleşmesi). */
export function verifyTrustedDevice(token: string | undefined | null, email: string): boolean {
  const payload = verify(token);
  if (!payload || payload.p !== TRUSTED_PURPOSE) return false;
  return typeof payload.email === "string" && payload.email === email.trim().toLowerCase();
}

// ───────────────────────────── 3) Login ticket ─────────────────────────────

const TICKET_PURPOSE = "login-ticket";

export interface LoginTicketData {
  email: string;
  remember: boolean;
  duration: SessionDuration;
}

/**
 * Kısa ömürlü login ticket'ı imzalar (~2dk). OTP/güvenilen-cihaz DOĞRULANDIKTAN SONRA üretilir;
 * `signIn("credentials", { ticket })` ile geçilir. authorize SADECE geçerli ticket'ta user döner.
 */
export function signLoginTicket(data: LoginTicketData, ttlMs = 2 * 60 * 1000): string {
  return sign({
    p: TICKET_PURPOSE,
    email: data.email,
    remember: data.remember,
    duration: data.duration,
    exp: Date.now() + ttlMs,
  });
}

/** Login ticket'ı doğrular (HMAC + exp + purpose). Geçersiz → null. */
export function verifyLoginTicket(token: string | undefined | null): LoginTicketData | null {
  const payload = verify(token);
  if (!payload || payload.p !== TICKET_PURPOSE) return null;
  const email = typeof payload.email === "string" ? payload.email : "";
  if (!email) return null;
  const remember = payload.remember === true;
  const duration = isSessionDuration(payload.duration) ? payload.duration : "1m";
  return { email, remember, duration };
}

// ───────────────────────────── Çerez adları ─────────────────────────────

/** Bekleyen-giriş (Adım 1→2) çerezi adı. */
export const PENDING_COOKIE = "admin_pending_login";
/** Güvenilen-cihaz çerezi adı. */
export const TRUSTED_DEVICE_COOKIE = "admin_trusted_device";
