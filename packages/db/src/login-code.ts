// @do/db — İki adımlı admin girişi (2FA) e-posta OTP yardımcıları. docs/05.
//
// Şifre doğrulandıktan SONRA admin login akışı bu fonksiyonları çağırır:
//   - issueLoginCode(email)      → 6 haneli kod üret, HASH'le, DB'ye upsert et, DÜZ kodu döndür
//                                  (çağıran düz kodu yalnız e-postayla gönderir; hiç saklamaz).
//   - verifyLoginCode(email,code)→ hash eşleşmesi + süre + deneme<MAX kontrolü; sonuç döner.
//   - clearLoginCode(email)      → satırı sil (başarılı giriş / vazgeç sonrası).
//
// GÜVENLİK:
//   - Kod ASLA düz saklanmaz; sha256(code + AUTH_SECRET) hash'i tutulur. AUTH_SECRET
//     yalnız sunucuda; "peppered" hash → DB sızsa bile kod kırılamaz (kısa kod + pepper).
//   - 10 dk geçerlilik, en çok 5 yanlış deneme; aşılırsa kod iptal (silinir).
//   - Sabit-zamanlı karşılaştırma (timingSafeEqual) ile hash eşleşmesi kontrol edilir.
//
// ⚠️ YALNIZCA SUNUCU tarafı (crypto + DB + AUTH_SECRET). İstemciye import edilmez.

import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { prisma } from "./index";
import { logError } from "./log-error";

/** Kod geçerlilik süresi (dakika) — docs/05 / istek: 10 dk. */
export const LOGIN_CODE_EXPIRY_MINUTES = 10;
/** İzin verilen en çok yanlış deneme — aşılırsa kod iptal. */
export const LOGIN_CODE_MAX_ATTEMPTS = 5;

/** E-postayı normalize eder (trim + lowercase) — DB anahtarı tutarlı olsun. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * 6 haneli kriptografik rastgele OTP üretir (000000–999999, baştaki sıfırlar korunur).
 * Math.random KULLANILMAZ (tahmin edilebilir); node:crypto ile düzgün dağılımlı.
 */
function generateCode(): string {
  // randomInt düzgün dağılım sağlar (modulo-bias yok); kriptografik rastgelelik.
  const n = randomInt(0, 1_000_000);
  return n.toString().padStart(6, "0");
}

/** AUTH_SECRET'i sunucudan okur; yoksa hata (kod hash'i için zorunlu). */
function getPepper(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    // Üretimde auth.config zaten fail-fast yapar; burada da net hata.
    throw new Error("AUTH_SECRET zorunludur (login OTP hash'i için). docs/13 §O2.");
  }
  return secret;
}

/** sha256(code + AUTH_SECRET) — peppered hash. Düz kod hiçbir yerde saklanmaz. */
function hashCode(code: string): string {
  return createHash("sha256").update(`${code}:${getPepper()}`).digest("hex");
}

/** İki hex hash'i sabit-zamanlı karşılaştırır (timing sızıntısını önler). */
function hashEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Yeni bir OTP üretir, hash'ler ve `LoginCode`'a (email başına tek aktif) upsert eder.
 * DÜZ kodu döndürür — çağıran yalnız `sendLoginCode` ile e-postayla iletir, ASLA saklamaz/loglamaz.
 */
export async function issueLoginCode(
  email: string,
): Promise<{ code: string; expiresMinutes: number }> {
  const normalized = normalizeEmail(email);
  const code = generateCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + LOGIN_CODE_EXPIRY_MINUTES * 60 * 1000);

  // email @unique → upsert: önceki (varsa) kodu yenisiyle değiştir, denemeyi sıfırla.
  await prisma.loginCode.upsert({
    where: { email: normalized },
    create: { email: normalized, codeHash, expiresAt, attempts: 0 },
    update: { codeHash, expiresAt, attempts: 0 },
  });

  return { code, expiresMinutes: LOGIN_CODE_EXPIRY_MINUTES };
}

/** verifyLoginCode sonucu — çağıran genel hata mesajı üretir (enumerasyon yok). */
export type VerifyLoginCodeResult =
  | { ok: true }
  /** Kod yok / süresi dolmuş → baştan başlanmalı. */
  | { ok: false; reason: "expired" }
  /** Kod yanlış (deneme sayacı arttı, hâlâ hak var). */
  | { ok: false; reason: "mismatch" }
  /** Çok deneme → kod iptal edildi (silindi); baştan başlanmalı. */
  | { ok: false; reason: "locked" };

/**
 * Girilen kodu doğrular. Başarılıysa { ok:true } (çağıran clearLoginCode çağırmalı).
 * Yanlışsa deneme sayacı artar; MAX aşılırsa kod silinir ("locked").
 * Kayıt yok/süresi dolmuşsa "expired". DB hatasında "expired" (fail-closed — OTP koruması
 * atlanmasın; login DB'siz zaten çalışmaz).
 */
export async function verifyLoginCode(email: string, code: string): Promise<VerifyLoginCodeResult> {
  const normalized = normalizeEmail(email);
  const trimmed = code.trim();

  try {
    const row = await prisma.loginCode.findUnique({ where: { email: normalized } });
    if (!row) return { ok: false, reason: "expired" };

    // Süre dolmuş → temizle, baştan.
    if (row.expiresAt.getTime() <= Date.now()) {
      await prisma.loginCode.deleteMany({ where: { email: normalized } });
      return { ok: false, reason: "expired" };
    }

    // Deneme limiti zaten dolmuşsa (savunma amaçlı) → iptal.
    if (row.attempts >= LOGIN_CODE_MAX_ATTEMPTS) {
      await prisma.loginCode.deleteMany({ where: { email: normalized } });
      return { ok: false, reason: "locked" };
    }

    // Biçimsel ön kontrol + hash eşleşme (sabit-zamanlı).
    const formatOk = /^[0-9]{6}$/.test(trimmed);
    const match = formatOk && hashEquals(row.codeHash, hashCode(trimmed));

    if (match) {
      return { ok: true };
    }

    // Yanlış → deneme sayacını artır; MAX'a ulaşıldıysa kodu iptal et.
    const nextAttempts = row.attempts + 1;
    if (nextAttempts >= LOGIN_CODE_MAX_ATTEMPTS) {
      await prisma.loginCode.deleteMany({ where: { email: normalized } });
      return { ok: false, reason: "locked" };
    }
    await prisma.loginCode.update({
      where: { email: normalized },
      data: { attempts: nextAttempts },
    });
    return { ok: false, reason: "mismatch" };
  } catch (err) {
    // fail-closed: OTP doğrulanamıyorsa girişe izin VERME (güvenlik > erişilebilirlik burada).
    logError("[login-code] verify failed (fail-closed):", err);
    return { ok: false, reason: "expired" };
  }
}

/** Aktif kodu siler (başarılı giriş / vazgeç sonrası). Hata yutulur (yan etki). */
export async function clearLoginCode(email: string): Promise<void> {
  try {
    await prisma.loginCode.deleteMany({ where: { email: normalizeEmail(email) } });
  } catch (err) {
    logError("[login-code] clear failed (ignored):", err);
  }
}
