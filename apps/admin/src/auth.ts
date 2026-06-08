// Auth.js (NextAuth v5) TAM yapılandırması — route handler + server action'lar bunu kullanır.
// Kaynak: docs/05 "Kimlik Doğrulama", docs/01 (ayrı domain, AUTH_SECRET).
//
// - Edge-güvenli temel ayarlar src/auth.config.ts'te (middleware oradan türetir).
// - Burada Credentials provider'ın DB erişimli `authorize`'ı eklenir (Node runtime).
// - Oturum stratejisi JWT (DB session/adapter GEREKMEZ — tek/az admin, docs/04).
// - AUTH_SECRET .env'den gelir (oturum çerezi şifreleme). docs/01.
//
// İKİ ADIMLI GİRİŞ (docs/05): authorize artık e-posta/şifre DEĞİL, sunucuda OTP veya
// güvenilen-cihaz doğrulandıktan SONRA üretilen kısa ömürlü HMAC "login ticket" alır.
// Böylece şifre → OTP → oturum ayrışır; authorize şifreyi tekrar kontrol etmez (ticket
// güveni). Ticket geçerliyse (HMAC + exp + kullanıcı DB'de var) user döner; aksi halde null.
// `remember`/`duration` ticket'tan okunup user'a iliştirilir → jwt callback oturum süresini
// (sessionExpiresAt) buna göre belirler.

import NextAuth, { type NextAuthResult } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@do/db";
import { authConfig } from "./auth.config";
import { verifyLoginTicket, durationToMs, SHORT_SESSION_MS } from "./lib/login-crypto";

// Açık tip: NextAuth v5 beta'da çıkarımlı dönüş tipi @auth/core iç yollarına
// referans verip "portable değil" (TS2742) hatası verir; NextAuthResult ile bağlarız.
const nextAuth: NextAuthResult = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        // Yalnız ticket alınır (şifre/OTP sunucuda önceden doğrulandı). UI bu provider'ı
        // doğrudan kullanmaz; signIn("credentials", { ticket }) server action'dan çağrılır.
        ticket: { label: "Ticket", type: "text" },
      },
      async authorize(credentials) {
        const ticket = typeof credentials?.ticket === "string" ? credentials.ticket : "";
        if (!ticket) return null;

        // 1) Ticket'ı doğrula (HMAC + exp + purpose). Geçersiz → giriş yok.
        const data = verifyLoginTicket(ticket);
        if (!data) return null;

        // 2) Kullanıcı hâlâ DB'de var mı (silinmiş olabilir)? E-posta normalize edilmiştir.
        const user = await prisma.user.findUnique({ where: { email: data.email } });
        if (!user) return null;

        // 3) Oturum süresini ticket'taki "beni hatırla" + süreye göre hesapla.
        //    remember yoksa kısa (12s); varsa seçilen süre. jwt callback bunu claim'e yazar.
        const sessionMaxAgeMs = data.remember ? durationToMs(data.duration) : SHORT_SESSION_MS;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          // jwt callback'in okuyacağı geçici alanlar (token'a kopyalanır, session'a sızmaz).
          sessionMaxAgeMs,
        } as unknown as {
          id: string;
          email: string;
          name?: string;
          role: string;
          sessionMaxAgeMs: number;
        };
      },
    }),
  ],
});

export const handlers: NextAuthResult["handlers"] = nextAuth.handlers;
export const auth: NextAuthResult["auth"] = nextAuth.auth;
export const signIn: NextAuthResult["signIn"] = nextAuth.signIn;
export const signOut: NextAuthResult["signOut"] = nextAuth.signOut;
