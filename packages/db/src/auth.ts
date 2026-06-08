// @do/db — admin kimlik doğrulama yardımcıları (şifre hash + kullanıcı doğrulama).
// Kaynak: docs/05 "Kimlik Doğrulama (Auth.js)" — şifreler hash'lenir, tek admin.
//
// Auth.js (NextAuth) Credentials provider bu yardımcıları çağırır. Şifre hash'i
// User.passwordHash alanında (bcrypt) tutulur. JWT oturumu kullanıldığı için
// adapter/Account/Session tabloları GEREKMEZ.
//
// ⚠️ YALNIZCA SUNUCU tarafı (bcrypt + DB). İstemciye import edilmez.

import bcrypt from "bcryptjs";
import { prisma } from "./index";

/** bcrypt cost faktörü (12 = makul güvenlik/performans dengesi). */
const BCRYPT_ROUNDS = 12;

/** Düz şifreyi bcrypt ile hash'ler (seed/şifre değiştirme için). */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/** Düz şifreyi hash ile karşılaştırır. */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Auth.js Credentials provider'ın döndürdüğü güvenli kullanıcı şekli. */
export interface AdminAuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

/**
 * E-posta + şifre ile admin kullanıcıyı doğrular. Başarılıysa güvenli kullanıcı
 * nesnesi (hash HARİÇ) döner; aksi halde null (kullanıcı sızdırmamak için ayrım yok).
 * docs/05 "Hatalı denemede genel hata mesajı (kullanıcı sızdırmaz)".
 */
export async function verifyAdminCredentials(
  email: string,
  password: string,
): Promise<AdminAuthUser | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) return null;

  const user = await prisma.user.findUnique({ where: { email: normalized } });
  // Kullanıcı yoksa da bcrypt'e benzer maliyetli bir karşılaştırma yaparak zamanlama
  // sızıntısını azaltırız (timing-safe-ish): sahte bir hash ile compare.
  if (!user || !user.passwordHash) {
    await bcrypt.compare(password, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
    return null;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
